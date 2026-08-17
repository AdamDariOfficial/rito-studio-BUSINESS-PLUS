[CmdletBinding(DefaultParameterSetName = "Reprovision")]
param(
  [Parameter(ParameterSetName = "Reprovision")]
  [Parameter(ParameterSetName = "LocalValidation")]
  [string]$ResumeMaterialDirectory,

  [Parameter(Mandatory = $true, ParameterSetName = "LocalValidation")]
  [switch]$LocalValidation,

  [Parameter(ParameterSetName = "LocalValidation")]
  [ValidatePattern("^[0-9a-f]{16}$")]
  [string]$ExpectedResumePepperFingerprint
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$ExpectedScheme = "scrypt-n16384-r8-p5-hmac-sha256-pepper-v2"
$ExpectedWorkFactor = 655360
$LegacyScheme = "pbkdf2-sha256-hmac-pepper-v1"
$LegacyWorkFactor = 600000
$ExpectedWorkerName = "rito-studio-business-plus-staging"
$ExpectedDatabaseName = "rito-studio-business-plus-staging"
$ExpectedDatabaseId = "31659140-3e05-41bb-be23-1d85ab669cb2"
$ExpectedPublicHost = "rito-studio-business-plus-staging.tretnix.com"
$ExpectedAdminHost = "admin.rito-studio-business-plus-staging.tretnix.com"
$ExpectedPrivacyVersion = "2026-08-11-test"
$ExpectedSubmitRateNamespace = "1001"
$ExpectedLoginRateNamespace = "1002"
$ExpectedOrigin = "https://github.com/AdamDariOfficial/rito-studio-BUSINESS-PLUS.git"
$ExpectedBranch = "feat/rito-business-plus-complete"
$ExpectedHead = "eba1a2a91fd3a531b4a4667d038b631758d0a664"
$AdminEmail = "admin@gmail.com"
$ConfirmationPhrase = "REPROVISION RITO STAGING"
$MaterialVersion = 1
$WranglerVersion = "4.114.0"
$Utf8NoBom = [System.Text.UTF8Encoding]::new($false)
$RepoRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot "..\.."))
$GeneratorRelativePath = "tools/admin/generate-admin-user-sql.ts"
$GeneratorPath = Join-Path $RepoRoot "tools\admin\generate-admin-user-sql.ts"
$ResolvedConfigPath = [System.IO.Path]::GetFullPath(
  (Join-Path $RepoRoot ".\.output\server\wrangler.staging.json")
)
$WranglerConfigArgument = ".\.output\server\wrangler.staging.json"
$TempRoot = [System.IO.Path]::GetFullPath([System.IO.Path]::GetTempPath())
$NodeCommand = (Get-Command node -ErrorAction Stop).Source
$NpxCommand = (Get-Command npx.cmd -ErrorAction Stop).Source
$GitCommand = (Get-Command git -ErrorAction Stop).Source

function ConvertFrom-SecureStringExact([Security.SecureString]$Value) {
  $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($Value)
  try {
    return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
  }
  finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
  }
}

function Test-ContainsOrdinal([string]$Value, [string]$Candidate) {
  if ($null -eq $Value -or $null -eq $Candidate) {
    return $false
  }
  return $Value.IndexOf($Candidate, [StringComparison]::Ordinal) -ge 0
}

function ConvertTo-LowerHex([byte[]]$Bytes) {
  return ([BitConverter]::ToString($Bytes).Replace("-", "")).ToLowerInvariant()
}

function Get-Sha256HexFromBytes([byte[]]$Bytes) {
  $sha256 = [Security.Cryptography.SHA256]::Create()
  try {
    $digest = $sha256.ComputeHash($Bytes)
    try {
      return ConvertTo-LowerHex $digest
    }
    finally {
      [Array]::Clear($digest, 0, $digest.Length)
    }
  }
  finally {
    $sha256.Dispose()
  }
}

function Get-FileSha256([string]$Path) {
  $stream = [IO.File]::OpenRead($Path)
  $sha256 = [Security.Cryptography.SHA256]::Create()
  try {
    $digest = $sha256.ComputeHash($stream)
    try {
      return ConvertTo-LowerHex $digest
    }
    finally {
      [Array]::Clear($digest, 0, $digest.Length)
    }
  }
  finally {
    $sha256.Dispose()
    $stream.Dispose()
  }
}

function New-CryptoRandomBytes([int]$Length) {
  if ($Length -lt 1) {
    throw "Random byte length must be positive."
  }

  $bytes = [System.Array]::CreateInstance([byte], $Length)
  $random = [Security.Cryptography.RandomNumberGenerator]::Create()
  try {
    $random.GetBytes($bytes)
    return $bytes
  }
  finally {
    $random.Dispose()
  }
}

function New-Base64UrlRandom([int]$Length) {
  $bytes = New-CryptoRandomBytes $Length
  try {
    return [Convert]::ToBase64String($bytes).TrimEnd("=").Replace("+", "-").Replace("/", "_")
  }
  finally {
    [Array]::Clear($bytes, 0, $bytes.Length)
  }
}

function Get-PepperFingerprint([string]$Pepper) {
  $bytes = [Text.Encoding]::UTF8.GetBytes($Pepper)
  try {
    return (Get-Sha256HexFromBytes $bytes).Substring(0, 16)
  }
  finally {
    [Array]::Clear($bytes, 0, $bytes.Length)
  }
}

function Test-Utf8Bom([string]$Path) {
  $bytes = [IO.File]::ReadAllBytes($Path)
  return (
    $bytes.Length -ge 3 -and
    $bytes[0] -eq 0xEF -and
    $bytes[1] -eq 0xBB -and
    $bytes[2] -eq 0xBF
  )
}

function Write-Utf8NoBom([string]$Path, [string]$Value) {
  [IO.File]::WriteAllText($Path, $Value, $Utf8NoBom)
  if (Test-Utf8Bom $Path) {
    throw "UTF-8 BOM is forbidden in staging material."
  }
}

function Assert-NoReparsePoint([string]$Path) {
  $item = Get-Item -LiteralPath $Path -Force
  if (($item.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) {
    throw "Reparse points are forbidden in staging material paths."
  }
}

function Assert-SafeMaterialDirectory([string]$Directory, [switch]$MustExist) {
  if ([string]::IsNullOrWhiteSpace($Directory)) {
    throw "Temporary material directory is missing."
  }

  $resolved = [System.IO.Path]::GetFullPath($Directory)
  $prefix = $TempRoot.TrimEnd("\") + "\"
  if (
    -not $resolved.StartsWith($prefix, [StringComparison]::OrdinalIgnoreCase) -or
    -not ([System.IO.Path]::GetFileName($resolved)).StartsWith(
      "rito-staging-admin-",
      [StringComparison]::Ordinal
    )
  ) {
    throw "Temporary material must remain inside the system temp directory with the expected prefix."
  }

  if ($MustExist) {
    if (-not (Test-Path -LiteralPath $resolved -PathType Container)) {
      throw "Temporary material directory does not exist."
    }
    Assert-NoReparsePoint $resolved
  }

  return $resolved
}

function Assert-SafeMaterialFile([string]$Path, [string]$MaterialDirectory) {
  $resolvedDirectory = Assert-SafeMaterialDirectory $MaterialDirectory -MustExist
  $resolvedPath = [IO.Path]::GetFullPath($Path)
  $prefix = $resolvedDirectory.TrimEnd("\") + "\"
  if (-not $resolvedPath.StartsWith($prefix, [StringComparison]::OrdinalIgnoreCase)) {
    throw "Staging material file escaped its controlled directory."
  }
  if (-not (Test-Path -LiteralPath $resolvedPath -PathType Leaf)) {
    throw "Required staging material file is missing."
  }
  Assert-NoReparsePoint $resolvedPath
  return $resolvedPath
}

function Invoke-RepositoryGit([string[]]$CommandArguments) {
  $outputLines = @(& $GitCommand "-C" $RepoRoot @CommandArguments 2>&1)
  $exitCode = $LASTEXITCODE
  if ($exitCode -ne 0) {
    throw "Git preflight failed with exit code $exitCode."
  }
  return (($outputLines | ForEach-Object { $_.ToString() }) -join "`n").Trim()
}

function Assert-GitIntake {
  $topLevel = [IO.Path]::GetFullPath((Invoke-RepositoryGit @("rev-parse", "--show-toplevel")))
  if (-not $topLevel.Equals($RepoRoot, [StringComparison]::OrdinalIgnoreCase)) {
    throw "The script is not running from the canonical repository root."
  }
  if ((Invoke-RepositoryGit @("remote", "get-url", "origin")) -cne $ExpectedOrigin) {
    throw "Repository origin does not match the approved RITO repository."
  }
  if ((Invoke-RepositoryGit @("branch", "--show-current")) -cne $ExpectedBranch) {
    throw "Repository branch does not match the approved staging branch."
  }
  if ((Invoke-RepositoryGit @("rev-parse", "HEAD")) -cne $ExpectedHead) {
    throw "Committed HEAD does not match the approved staging candidate base."
  }
  if (-not [string]::IsNullOrWhiteSpace((Invoke-RepositoryGit @("diff", "--cached", "--name-only")))) {
    throw "Staged paths must remain zero before staging reprovision."
  }
}

function Get-ExactBinding([object[]]$Bindings, [string]$Name) {
  $matches = @($Bindings | Where-Object {
      $candidateName = $null
      if ($null -ne $_.PSObject.Properties["name"]) {
        $candidateName = $_.name
      }
      elseif ($null -ne $_.PSObject.Properties["binding"]) {
        $candidateName = $_.binding
      }
      $candidateName -ceq $Name
    })
  if ($matches.Count -ne 1) {
    throw "Generated staging config is missing an exact required binding."
  }
  return $matches[0]
}

function Assert-StagingConfig {
  if (-not (Test-Path -LiteralPath $ResolvedConfigPath -PathType Leaf)) {
    throw "Missing generated staging config: $ResolvedConfigPath"
  }
  if (-not (Test-Path -LiteralPath $GeneratorPath -PathType Leaf)) {
    throw "Missing admin SQL generator: $GeneratorPath"
  }

  $configText = [IO.File]::ReadAllText($ResolvedConfigPath, [Text.Encoding]::UTF8)
  $stagingConfig = $configText | ConvertFrom-Json
  $stagingDatabase = Get-ExactBinding @($stagingConfig.d1_databases) "CONSULTATION_DB"
  $submitRate = Get-ExactBinding @($stagingConfig.ratelimits) "CONSULTATION_SUBMIT_RATE_LIMITER"
  $loginRate = Get-ExactBinding @($stagingConfig.ratelimits) "ADMIN_LOGIN_RATE_LIMITER"
  $realtimeBinding = Get-ExactBinding @($stagingConfig.durable_objects.bindings) "CONSULTATION_REALTIME"
  $routes = @($stagingConfig.routes)
  $compatibilityFlags = @($stagingConfig.compatibility_flags)

  if (
    $stagingConfig.name -cne $ExpectedWorkerName -or
    $stagingConfig.vars.LIVE_BACKEND_ENV -cne "staging" -or
    $stagingConfig.vars.CONSULTATION_PRIVACY_VERSION -cne $ExpectedPrivacyVersion -or
    $stagingConfig.workers_dev -ne $false -or
    $stagingConfig.preview_urls -ne $false -or
    $stagingDatabase.database_name -cne $ExpectedDatabaseName -or
    $stagingDatabase.database_id -cne $ExpectedDatabaseId -or
    $stagingDatabase.migrations_dir -cne "../../migrations" -or
    $submitRate.namespace_id.ToString() -cne $ExpectedSubmitRateNamespace -or
    [int]$submitRate.simple.limit -ne 5 -or
    [int]$submitRate.simple.period -ne 60 -or
    $loginRate.namespace_id.ToString() -cne $ExpectedLoginRateNamespace -or
    [int]$loginRate.simple.limit -ne 5 -or
    [int]$loginRate.simple.period -ne 60 -or
    $realtimeBinding.class_name -cne "ConsultationRealtimeHub" -or
    $stagingConfig.exports.ConsultationRealtimeHub.type -cne "durable-object" -or
    $stagingConfig.exports.ConsultationRealtimeHub.storage -cne "sqlite" -or
    $compatibilityFlags -cnotcontains "nodejs_compat" -or
    [string]::IsNullOrWhiteSpace($stagingConfig.main) -or
    $null -eq $stagingConfig.assets -or
    $routes.Count -ne 2
  ) {
    throw "Generated config is not the exact isolated RITO staging target."
  }

  $publicRoute = @($routes | Where-Object {
      $_.pattern -ceq $ExpectedPublicHost -and $_.custom_domain -eq $true
    })
  $adminRoute = @($routes | Where-Object {
      $_.pattern -ceq $ExpectedAdminHost -and $_.custom_domain -eq $true
    })
  if ($publicRoute.Count -ne 1 -or $adminRoute.Count -ne 1) {
    throw "Generated config does not contain only the exact staging custom hostnames."
  }
  if (
    (Test-ContainsOrdinal $configText '"LIVE_BACKEND_ENV": "production"') -or
    (Test-ContainsOrdinal $configText '"name": "rito-studio-business-plus-production"')
  ) {
    throw "Production markers are forbidden in the staging config."
  }
}

function Invoke-AdminSqlGenerator([string]$Password, [string]$Pepper) {
  $startInfo = [Diagnostics.ProcessStartInfo]::new()
  $process = $null
  try {
    $startInfo.FileName = $NodeCommand
    $startInfo.Arguments = "--experimental-strip-types $GeneratorRelativePath"
    $startInfo.WorkingDirectory = $RepoRoot
    $startInfo.UseShellExecute = $false
    $startInfo.CreateNoWindow = $true
    $startInfo.RedirectStandardOutput = $true
    $startInfo.RedirectStandardError = $true
    $startInfo.EnvironmentVariables["RITO_ADMIN_EMAIL"] = $AdminEmail
    $startInfo.EnvironmentVariables["RITO_ADMIN_PASSWORD"] = $Password
    $startInfo.EnvironmentVariables["RITO_ADMIN_AUTH_PEPPER"] = $Pepper

    $process = [Diagnostics.Process]::new()
    $process.StartInfo = $startInfo
    if (-not $process.Start()) {
      throw "Admin SQL generator did not start."
    }
    $sql = $process.StandardOutput.ReadToEnd()
    $generatorError = $process.StandardError.ReadToEnd()
    $process.WaitForExit()
    if ($process.ExitCode -ne 0) {
      throw "Admin SQL generation failed without exposing credential material."
    }

    $fingerprintMatch = [regex]::Match(
      $generatorError.Trim(),
      "^RITO admin pepper fingerprint \(SHA-256/16 hex\): ([0-9a-f]{16})$"
    )
    if (-not $fingerprintMatch.Success) {
      throw "Generator fingerprint evidence is missing or malformed."
    }

    return [pscustomobject]@{
      Sql = $sql
      Fingerprint = $fingerprintMatch.Groups[1].Value
    }
  }
  finally {
    $startInfo.EnvironmentVariables.Remove("RITO_ADMIN_PASSWORD")
    $startInfo.EnvironmentVariables.Remove("RITO_ADMIN_AUTH_PEPPER")
    if ($null -ne $process) {
      $process.Dispose()
    }
  }
}

function Assert-AdminSqlContract(
  [string]$SqlText,
  [string]$Pepper,
  [AllowNull()][string]$Password
) {
  if (Test-ContainsOrdinal $SqlText $Pepper) {
    throw "Generated SQL contains the staging pepper."
  }
  if ($null -ne $Password -and $Password.Length -gt 0 -and (Test-ContainsOrdinal $SqlText $Password)) {
    throw "Generated SQL contains the staging password."
  }

  $normalized = $SqlText.Replace("`r`n", "`n")
  if (Test-ContainsOrdinal $normalized "`r") {
    throw "Generated SQL contains unsupported line endings."
  }

  $idPattern = "[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}"
  $timestampPattern = "[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}Z"
  $firstValuePattern = "^  '(?<id>$idPattern)', 'admin@gmail\.com', 'admin@gmail\.com', '$([regex]::Escape($ExpectedScheme))', 655360,$"
  $secondValuePattern = "^  '(?<salt>[A-Za-z0-9_-]{22})', '(?<hash>[A-Za-z0-9_-]{43})', 'active', '(?<created>$timestampPattern)', '\k<created>', NULL$"
  $firstValue = [regex]::Match($normalized, $firstValuePattern, [Text.RegularExpressions.RegexOptions]::Multiline)
  $secondValue = [regex]::Match($normalized, $secondValuePattern, [Text.RegularExpressions.RegexOptions]::Multiline)
  if (-not $firstValue.Success -or -not $secondValue.Success) {
    throw "Generated SQL credential record is malformed."
  }

  $expectedLines = @(
    "-- Generated RITO native admin record. Contains no plaintext password or pepper.",
    "INSERT INTO admin_users (",
    "  id, email, email_normalized, password_scheme, password_iterations,",
    "  password_salt, password_hash, status, created_at, updated_at, last_login_at",
    ") VALUES (",
    ("  '{0}', '{1}', '{1}', '{2}', {3}," -f $firstValue.Groups["id"].Value, $AdminEmail, $ExpectedScheme, $ExpectedWorkFactor),
    ("  '{0}', '{1}', 'active', '{2}', '{2}', NULL" -f $secondValue.Groups["salt"].Value, $secondValue.Groups["hash"].Value, $secondValue.Groups["created"].Value),
    ")",
    "ON CONFLICT(email_normalized) DO UPDATE SET",
    "  email = excluded.email,",
    "  password_scheme = excluded.password_scheme,",
    "  password_iterations = excluded.password_iterations,",
    "  password_salt = excluded.password_salt,",
    "  password_hash = excluded.password_hash,",
    "  status = 'active',",
    "  updated_at = excluded.updated_at;",
    "DELETE FROM admin_sessions WHERE user_id = (SELECT id FROM admin_users WHERE email_normalized = 'admin@gmail.com');"
  )
  $expectedSql = [string]::Join("`n", $expectedLines) + "`n"
  if ($normalized -cne $expectedSql) {
    throw "Generated SQL is outside the exact allowlisted two-statement contract."
  }

  return [pscustomobject]@{
    Salt = $secondValue.Groups["salt"].Value
    PasswordHash = $secondValue.Groups["hash"].Value
  }
}

function Get-MaterialPaths([string]$MaterialDirectory) {
  return [pscustomobject]@{
    AdminSql = Join-Path $MaterialDirectory "admin-user.sql"
    Secrets = Join-Path $MaterialDirectory "admin-pepper.json"
    VerificationSql = Join-Path $MaterialDirectory "verify-admin.sql"
    Manifest = Join-Path $MaterialDirectory "resume-state.json"
  }
}

function New-MaterialManifest([object]$Paths, [string]$Pepper, [string]$Phase) {
  $now = [DateTime]::UtcNow.ToString("o")
  return [pscustomobject][ordered]@{
    materialVersion = $MaterialVersion
    phase = $Phase
    worker = $ExpectedWorkerName
    database = $ExpectedDatabaseName
    databaseId = $ExpectedDatabaseId
    adminHost = $ExpectedAdminHost
    adminEmail = $AdminEmail
    scheme = $ExpectedScheme
    workFactor = $ExpectedWorkFactor
    repositoryHead = $ExpectedHead
    adminSqlSha256 = Get-FileSha256 $Paths.AdminSql
    secretsFileSha256 = Get-FileSha256 $Paths.Secrets
    verificationSqlSha256 = Get-FileSha256 $Paths.VerificationSql
    pepperFingerprint = Get-PepperFingerprint $Pepper
    createdAt = $now
    updatedAt = $now
  }
}

function Write-MaterialManifest([object]$Paths, [object]$Manifest) {
  $Manifest.updatedAt = [DateTime]::UtcNow.ToString("o")
  Write-Utf8NoBom $Paths.Manifest ($Manifest | ConvertTo-Json -Depth 3 -Compress)
}

function Set-MaterialPhase([object]$Paths, [object]$Manifest, [string]$Phase) {
  if (@("prepared", "d1_updated", "d1_verified", "deployed") -cnotcontains $Phase) {
    throw "Attempted to write an unrecognized resume phase."
  }
  $Manifest.phase = $Phase
  Write-MaterialManifest $Paths $Manifest
}

function New-ReprovisionMaterial([string]$SqlText, [string]$Pepper) {
  $materialDirectory = Assert-SafeMaterialDirectory (
    Join-Path $TempRoot ("rito-staging-admin-" + [Guid]::NewGuid().ToString("N"))
  )
  try {
    [IO.Directory]::CreateDirectory($materialDirectory) | Out-Null
    Assert-NoReparsePoint $materialDirectory
    $paths = Get-MaterialPaths $materialDirectory

    $secretJson = @{ ADMIN_AUTH_PEPPER = $Pepper } | ConvertTo-Json -Compress
    $verificationSql = @(
      "SELECT password_scheme, password_iterations, password_salt, password_hash, status",
      "FROM admin_users",
      "WHERE email_normalized = 'admin@gmail.com';"
    ) -join "`n"
    $verificationSql += "`n"

    Write-Utf8NoBom $paths.AdminSql $SqlText
    Write-Utf8NoBom $paths.Secrets $secretJson
    Write-Utf8NoBom $paths.VerificationSql $verificationSql
    $manifest = New-MaterialManifest $paths $Pepper "prepared"
    Write-MaterialManifest $paths $manifest

    return [pscustomobject]@{
      Directory = $materialDirectory
      Paths = $paths
      Manifest = $manifest
    }
  }
  catch {
    if (Test-Path -LiteralPath $materialDirectory -PathType Container) {
      $safeDirectory = Assert-SafeMaterialDirectory $materialDirectory -MustExist
      Remove-Item -LiteralPath $safeDirectory -Recurse -Force
    }
    throw
  }
}

function Read-ReprovisionMaterial([string]$Directory) {
  $materialDirectory = Assert-SafeMaterialDirectory $Directory -MustExist
  $paths = Get-MaterialPaths $materialDirectory
  foreach ($path in @($paths.AdminSql, $paths.Secrets, $paths.VerificationSql, $paths.Manifest)) {
    [void](Assert-SafeMaterialFile $path $materialDirectory)
    if (Test-Utf8Bom $path) {
      throw "Resume material contains a forbidden UTF-8 BOM."
    }
  }

  $manifest = [IO.File]::ReadAllText($paths.Manifest, [Text.Encoding]::UTF8) | ConvertFrom-Json
  $expectedProperties = @(@(
    "adminEmail", "adminHost", "adminSqlSha256", "createdAt", "database", "databaseId",
    "materialVersion", "pepperFingerprint", "phase", "repositoryHead", "scheme",
    "secretsFileSha256", "updatedAt", "verificationSqlSha256", "workFactor", "worker"
  ) | Sort-Object)
  $actualProperties = @($manifest.PSObject.Properties.Name | Sort-Object)
  if ([string]::Join("|", $actualProperties) -cne [string]::Join("|", $expectedProperties)) {
    throw "Resume manifest shape is not recognized."
  }
  if (
    [int]$manifest.materialVersion -ne $MaterialVersion -or
    $manifest.worker -cne $ExpectedWorkerName -or
    $manifest.database -cne $ExpectedDatabaseName -or
    $manifest.databaseId -cne $ExpectedDatabaseId -or
    $manifest.adminHost -cne $ExpectedAdminHost -or
    $manifest.adminEmail -cne $AdminEmail -or
    $manifest.scheme -cne $ExpectedScheme -or
    [int64]$manifest.workFactor -ne $ExpectedWorkFactor -or
    $manifest.repositoryHead -cne $ExpectedHead -or
    @("prepared", "d1_updated", "d1_verified", "deployed") -cnotcontains $manifest.phase -or
    $manifest.adminSqlSha256 -cne (Get-FileSha256 $paths.AdminSql) -or
    $manifest.secretsFileSha256 -cne (Get-FileSha256 $paths.Secrets) -or
    $manifest.verificationSqlSha256 -cne (Get-FileSha256 $paths.VerificationSql)
  ) {
    throw "Resume manifest or material integrity check failed."
  }

  $secretRecord = [IO.File]::ReadAllText($paths.Secrets, [Text.Encoding]::UTF8) | ConvertFrom-Json
  $secretProperties = @($secretRecord.PSObject.Properties.Name)
  if (
    $secretProperties.Count -ne 1 -or
    $secretProperties[0] -cne "ADMIN_AUTH_PEPPER" -or
    $secretRecord.ADMIN_AUTH_PEPPER -isnot [string] -or
    $secretRecord.ADMIN_AUTH_PEPPER -cnotmatch "^[A-Za-z0-9_-]{43}$"
  ) {
    throw "Resume pepper material is invalid."
  }
  $pepper = $secretRecord.ADMIN_AUTH_PEPPER
  if ($manifest.pepperFingerprint -cne (Get-PepperFingerprint $pepper)) {
    throw "Resume pepper fingerprint does not match the manifest."
  }

  $sqlText = [IO.File]::ReadAllText($paths.AdminSql, [Text.Encoding]::UTF8)
  $record = Assert-AdminSqlContract $sqlText $pepper $null
  $expectedVerificationSql = "SELECT password_scheme, password_iterations, password_salt, password_hash, status`nFROM admin_users`nWHERE email_normalized = 'admin@gmail.com';`n"
  $actualVerificationSql = [IO.File]::ReadAllText($paths.VerificationSql, [Text.Encoding]::UTF8).Replace("`r`n", "`n")
  if ($actualVerificationSql -cne $expectedVerificationSql) {
    throw "Resume verification SQL is outside the exact read-only contract."
  }

  return [pscustomobject]@{
    Directory = $materialDirectory
    Paths = $paths
    Manifest = $manifest
    Pepper = $pepper
    SqlText = $sqlText
    Record = $record
  }
}

function Test-ArgumentListEqual([string[]]$Actual, [string[]]$Expected) {
  if ($Actual.Count -ne $Expected.Count) {
    return $false
  }
  for ($index = 0; $index -lt $Actual.Count; $index++) {
    if ($Actual[$index] -cne $Expected[$index]) {
      return $false
    }
  }
  return $true
}

function Invoke-NativeCommand(
  [string]$Executable,
  [string[]]$CommandArguments,
  [string]$WorkingDirectory
) {
  if (-not (Test-Path -LiteralPath $Executable -PathType Leaf)) {
    throw "Native executable is missing."
  }
  if (-not (Test-Path -LiteralPath $WorkingDirectory -PathType Container)) {
    throw "Native command working directory is missing."
  }

  $records = @()
  $exitCode = $null
  $previousErrorActionPreference = $ErrorActionPreference
  Push-Location -LiteralPath $WorkingDirectory
  try {
    # Windows PowerShell 5.1 represents redirected native stderr as ErrorRecord objects.
    # Continue is scoped only to the child call so both streams and the real exit code survive.
    $ErrorActionPreference = "Continue"
    $records = @(& $Executable @CommandArguments 2>&1)
    $exitCode = $LASTEXITCODE
  }
  finally {
    $ErrorActionPreference = $previousErrorActionPreference
    Pop-Location
  }

  $standardOutput = @()
  $standardError = @()
  foreach ($record in $records) {
    if ($record -is [Management.Automation.ErrorRecord]) {
      $standardError += $record.Exception.Message
    }
    else {
      $standardOutput += $record.ToString()
    }
  }

  return [pscustomobject]@{
    ExitCode = [int]$exitCode
    StandardOutput = $standardOutput
    StandardError = $standardError
  }
}

function Assert-NativeCommandSucceeded([object]$Result, [string]$DisplayName) {
  if ($Result.ExitCode -ne 0) {
    throw (
      $DisplayName + " failed with exit code " + $Result.ExitCode +
      ". Standard error was captured and suppressed to protect credential material."
    )
  }
}

function Get-VerificationSqlCommand([object]$Paths) {
  $sql = [IO.File]::ReadAllText($Paths.VerificationSql, [Text.Encoding]::UTF8).Replace("`r`n", "`n")
  $expected = "SELECT password_scheme, password_iterations, password_salt, password_hash, status`nFROM admin_users`nWHERE email_normalized = 'admin@gmail.com';`n"
  if ($sql -cne $expected) {
    throw "Verification SQL is outside the exact read-only contract."
  }
  return $sql.TrimEnd("`n").Replace("`n", " ")
}

function Get-WranglerArguments([string]$Operation, [object]$Paths) {
  if ($Operation -ceq "ReadD1") {
    return @(
      "d1", "execute", $ExpectedDatabaseName,
      "--remote",
      "--config", $WranglerConfigArgument,
      "--command", (Get-VerificationSqlCommand $Paths),
      "--json"
    )
  }
  if ($Operation -ceq "WriteD1") {
    return @(
      "d1", "execute", $ExpectedDatabaseName,
      "--remote",
      "--config", $WranglerConfigArgument,
      "--file", $Paths.AdminSql,
      "--yes"
    )
  }
  if ($Operation -ceq "Deploy") {
    return @(
      "deploy",
      "--config", $WranglerConfigArgument,
      "--secrets-file", $Paths.Secrets
    )
  }
  throw "Wrangler operation is not allowlisted."
}

function Assert-WranglerArguments([string]$Operation, [string[]]$CommandArguments, [object]$Paths) {
  $expected = @(Get-WranglerArguments $Operation $Paths)
  if (-not (Test-ArgumentListEqual $CommandArguments $expected)) {
    throw "Wrangler arguments are outside the exact staging allowlist."
  }
}

function Invoke-Wrangler(
  [string]$Operation,
  [string[]]$CommandArguments,
  [object]$Paths,
  [switch]$CaptureOutput
) {
  Assert-WranglerArguments $Operation $CommandArguments $Paths
  $nativeArguments = @("--yes", "wrangler@$WranglerVersion") + @($CommandArguments)
  $result = Invoke-NativeCommand $NpxCommand $nativeArguments $RepoRoot
  Assert-NativeCommandSucceeded $result ("Wrangler " + $Operation)
  if ($CaptureOutput) {
    return ($result.StandardOutput -join "`n")
  }
}

function Get-D1AdminState([object]$Paths) {
  $arguments = @(Get-WranglerArguments "ReadD1" $Paths)
  $json = Invoke-Wrangler "ReadD1" $arguments $Paths -CaptureOutput
  $envelope = $json | ConvertFrom-Json
  $firstResult = @($envelope)[0]
  if ($null -eq $firstResult -or $firstResult.success -ne $true) {
    throw "Read-only staging verification did not report success."
  }
  $rows = @($firstResult.results)
  if ($rows.Count -ne 1) {
    throw "Read-only staging verification did not return exactly one admin record."
  }
  return $rows[0]
}

function Test-LegacyD1State([object]$State) {
  return (
    $State.password_scheme -ceq $LegacyScheme -and
    [int64]$State.password_iterations -eq $LegacyWorkFactor -and
    $State.status -ceq "active"
  )
}

function Test-MaterialD1State([object]$State, [object]$Record) {
  return (
    $State.password_scheme -ceq $ExpectedScheme -and
    [int64]$State.password_iterations -eq $ExpectedWorkFactor -and
    $State.password_salt -ceq $Record.Salt -and
    $State.password_hash -ceq $Record.PasswordHash -and
    $State.status -ceq "active"
  )
}

function Test-NativeCommandBoundary {
  $testDirectory = Assert-SafeMaterialDirectory (
    Join-Path $TempRoot ("rito-staging-admin-native-test-" + [Guid]::NewGuid().ToString("N") + " path with spaces")
  )
  try {
    [IO.Directory]::CreateDirectory($testDirectory) | Out-Null
    Assert-NoReparsePoint $testDirectory
    $childScriptPath = Join-Path $testDirectory "fake native child.ps1"
    $commandPath = Join-Path $testDirectory "fake npx command.cmd"
    $receivedArgumentsPath = Join-Path $testDirectory "received arguments.txt"
    $nonZeroArgumentsPath = Join-Path $testDirectory "nonzero arguments.txt"

    $childScript = @'
param(
  [string]$OutputPath,
  [int]$RequestedExitCode,
  [Parameter(ValueFromRemainingArguments = $true)]
  [string[]]$ReceivedArguments
)
$encoding = [System.Text.UTF8Encoding]::new($false)
[IO.File]::WriteAllLines($OutputPath, $ReceivedArguments, $encoding)
[Console]::Out.WriteLine("FAKE_STDOUT")
[Console]::Error.WriteLine("FAKE_STDERR")
exit $RequestedExitCode
'@
    $commandScript = @'
@echo off
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0fake native child.ps1" %*
exit /b %ERRORLEVEL%
'@
    Write-Utf8NoBom $childScriptPath $childScript
    Write-Utf8NoBom $commandPath $commandScript

    $expectedArguments = @(
      "argument with spaces",
      "SELECT status FROM admin_users WHERE email_normalized = 'admin@gmail.com';",
      (Join-Path $testDirectory "config path with spaces & ampersand.json")
    )
    $successArguments = @($receivedArgumentsPath, "0") + $expectedArguments
    $successResult = Invoke-NativeCommand $commandPath $successArguments $RepoRoot
    Assert-NativeCommandSucceeded $successResult "Fake native success command"
    $receivedArguments = @([IO.File]::ReadAllLines($receivedArgumentsPath, [Text.Encoding]::UTF8))
    if (-not (Test-ArgumentListEqual $receivedArguments $expectedArguments)) {
      throw "Native .cmd argument boundaries were altered."
    }
    if (
      $successResult.StandardOutput -cnotcontains "FAKE_STDOUT" -or
      $successResult.StandardError -cnotcontains "FAKE_STDERR"
    ) {
      throw "Native stdout/stderr capture failed."
    }

    $syntheticSensitiveValue = "synthetic-sensitive-" + [Guid]::NewGuid().ToString("N")
    $failureArguments = @($nonZeroArgumentsPath, "23", $syntheticSensitiveValue)
    $failureResult = Invoke-NativeCommand $commandPath $failureArguments $RepoRoot
    if ($failureResult.ExitCode -ne 23) {
      throw "Native non-zero exit code was altered."
    }
    $safeFailureObserved = $false
    try {
      Assert-NativeCommandSucceeded $failureResult "Fake native failure command"
    }
    catch {
      $safeFailureObserved = (
        $_.Exception.Message -match "exit code 23" -and
        -not (Test-ContainsOrdinal $_.Exception.Message $syntheticSensitiveValue)
      )
    }
    if (-not $safeFailureObserved) {
      throw "Native failure diagnostics were missing or exposed sensitive arguments."
    }

    $versionResult = Invoke-NativeCommand $NpxCommand @("--version") $RepoRoot
    Assert-NativeCommandSucceeded $versionResult "Local npx.cmd version probe"
    if (($versionResult.StandardOutput -join "`n") -notmatch "(^|\s)[0-9]+\.[0-9]+\.[0-9]+(\s|$)") {
      throw "Local npx.cmd version probe returned an unexpected version."
    }

    Write-Host "Windows PS5.1 native/.cmd argument, stream and exit-code boundary: PASS"
    Write-Host "Local npx.cmd version probe through the production native wrapper: PASS"
  }
  finally {
    if (Test-Path -LiteralPath $testDirectory -PathType Container) {
      $safeDirectory = Assert-SafeMaterialDirectory $testDirectory -MustExist
      Remove-Item -LiteralPath $safeDirectory -Recurse -Force
    }
  }
}

function Invoke-LocalValidation {
  $material = $null
  $pepper = $null
  $password = $null
  $firstRandom = $null
  $secondRandom = $null
  try {
    $firstRandom = New-CryptoRandomBytes 32
    $secondRandom = New-CryptoRandomBytes 32
    if ($firstRandom.Length -ne 32 -or $secondRandom.Length -ne 32) {
      throw "CSPRNG length validation failed."
    }
    if ((ConvertTo-LowerHex $firstRandom) -ceq (ConvertTo-LowerHex $secondRandom)) {
      throw "Two successive CSPRNG outputs unexpectedly matched."
    }

    $password = "  local-" + (New-Base64UrlRandom 18) + "-validation  "
    $pepper = New-Base64UrlRandom 32
    $generated = Invoke-AdminSqlGenerator $password $pepper
    if ($generated.Fingerprint -cne (Get-PepperFingerprint $pepper)) {
      throw "Local generator and PowerShell fingerprint implementations disagree."
    }
    [void](Assert-AdminSqlContract $generated.Sql $pepper $password)

    $material = New-ReprovisionMaterial $generated.Sql $pepper
    $loaded = Read-ReprovisionMaterial $material.Directory
    foreach ($path in @($loaded.Paths.AdminSql, $loaded.Paths.Secrets, $loaded.Paths.VerificationSql, $loaded.Paths.Manifest)) {
      if (Test-Utf8Bom $path) {
        throw "Local UTF-8 no-BOM validation failed."
      }
    }

    foreach ($operation in @("ReadD1", "WriteD1", "Deploy")) {
      $allowedArguments = @(Get-WranglerArguments $operation $loaded.Paths)
      Assert-WranglerArguments $operation $allowedArguments $loaded.Paths
    }
    $productionArguments = @(Get-WranglerArguments "WriteD1" $loaded.Paths)
    $productionArguments[2] = "rito-studio-business-plus-production"
    $productionRejected = $false
    try {
      Assert-WranglerArguments "WriteD1" $productionArguments $loaded.Paths
    }
    catch {
      $productionRejected = $true
    }
    if (-not $productionRejected) {
      throw "Production target rejection validation failed."
    }

    Test-NativeCommandBoundary

    if (-not [string]::IsNullOrWhiteSpace($ResumeMaterialDirectory)) {
      if ([string]::IsNullOrWhiteSpace($ExpectedResumePepperFingerprint)) {
        throw "Expected resume pepper fingerprint is required for safe local resume validation."
      }
      $resumeMaterial = Read-ReprovisionMaterial $ResumeMaterialDirectory
      try {
        if (
          $resumeMaterial.Manifest.phase -cne "prepared" -or
          $resumeMaterial.Manifest.pepperFingerprint -cne $ExpectedResumePepperFingerprint
        ) {
          throw "Existing resume material is not the expected prepared state."
        }
        Write-Host "Existing prepared resume material structure/integrity/fingerprint: PASS"
      }
      finally {
        $resumeMaterial.Pepper = $null
        $resumeMaterial = $null
      }
    }

    Write-Host "RITO staging reprovision local validation: PASS"
    Write-Host "PS5.1-compatible CSPRNG, generator, anti-leak, UTF-8 no-BOM, manifest and target allowlist: PASS"
    Write-Host "Remote D1, secret rotation and deploy operations: NOT EXECUTED"
  }
  finally {
    if ($null -ne $firstRandom) { [Array]::Clear($firstRandom, 0, $firstRandom.Length) }
    if ($null -ne $secondRandom) { [Array]::Clear($secondRandom, 0, $secondRandom.Length) }
    $password = $null
    $pepper = $null
    if ($null -ne $material -and (Test-Path -LiteralPath $material.Directory -PathType Container)) {
      $safeDirectory = Assert-SafeMaterialDirectory $material.Directory -MustExist
      Remove-Item -LiteralPath $safeDirectory -Recurse -Force
    }
  }
}

Assert-GitIntake
Assert-StagingConfig

if ($LocalValidation) {
  Invoke-LocalValidation
  exit 0
}

$confirmation = Read-Host "Type '$ConfirmationPhrase' to prepare the single staging reprovision"
if ($confirmation -cne $ConfirmationPhrase) {
  throw "Explicit staging confirmation was not supplied."
}

$material = $null
$pepper = $null
$plainPassword = $null
$passwordInput = $null
$passwordConfirmation = $null
$knownState = "preflight_only"

try {
  if (-not [string]::IsNullOrWhiteSpace($ResumeMaterialDirectory)) {
    $material = Read-ReprovisionMaterial $ResumeMaterialDirectory
    $pepper = $material.Pepper
    $knownState = $material.Manifest.phase
  }
  else {
    $passwordInput = Read-Host "New staging admin password" -AsSecureString
    $passwordConfirmation = Read-Host "Confirm the exact staging admin password" -AsSecureString
    $plainPassword = ConvertFrom-SecureStringExact $passwordInput
    $confirmedPassword = ConvertFrom-SecureStringExact $passwordConfirmation
    try {
      if ($plainPassword -cne $confirmedPassword) {
        throw "The exact password confirmation does not match."
      }
    }
    finally {
      $confirmedPassword = $null
    }
    if ($plainPassword.Length -lt 12 -or $plainPassword.Length -gt 128) {
      throw "The password must contain 12 to 128 exact characters."
    }

    $pepper = New-Base64UrlRandom 32
    $generated = Invoke-AdminSqlGenerator $plainPassword $pepper
    if ($generated.Fingerprint -cne (Get-PepperFingerprint $pepper)) {
      throw "Generator and procedure pepper fingerprints do not match."
    }
    [void](Assert-AdminSqlContract $generated.Sql $pepper $plainPassword)
    $material = New-ReprovisionMaterial $generated.Sql $pepper
    $plainPassword = $null
    $knownState = "prepared"
    $material = Read-ReprovisionMaterial $material.Directory
  }

  Write-Host ("Pepper fingerprint (SHA-256/16 hex): " + (Get-PepperFingerprint $pepper))
  Write-Host ("Recognized resume state: " + $material.Manifest.phase)
  Write-Host "Read-only inspection of the exact staging admin record; production is not allowed."
  $d1State = Get-D1AdminState $material.Paths

  if ($material.Manifest.phase -ceq "prepared") {
    if (Test-MaterialD1State $d1State $material.Record) {
      Set-MaterialPhase $material.Paths $material.Manifest "d1_updated"
      $knownState = "d1_updated"
    }
    elseif (Test-LegacyD1State $d1State) {
      Write-Host "Applying the single allowlisted staging admin upsert and session revocation."
      $writeArguments = @(Get-WranglerArguments "WriteD1" $material.Paths)
      Invoke-Wrangler "WriteD1" $writeArguments $material.Paths
      $knownState = "d1_write_returned_manifest_pending"
      Set-MaterialPhase $material.Paths $material.Manifest "d1_updated"
      $knownState = "d1_updated"
    }
    else {
      throw "D1 is neither the expected legacy record nor the exact resumable scrypt v2 record."
    }
  }
  elseif (-not (Test-MaterialD1State $d1State $material.Record)) {
    throw "D1 does not match the exact record required by the recognized resume state."
  }

  if ($material.Manifest.phase -ceq "d1_updated") {
    $verifiedState = Get-D1AdminState $material.Paths
    if (-not (Test-MaterialD1State $verifiedState $material.Record)) {
      throw "Read-only D1 verification did not return the exact active scrypt v2 record."
    }
    Set-MaterialPhase $material.Paths $material.Manifest "d1_verified"
    $knownState = "d1_verified"
    Write-Host "Read-only D1 verification: scheme/work factor/status and material identity PASS."
  }

  if ($material.Manifest.phase -ceq "d1_verified") {
    Write-Host "Deploying the validated staging candidate with the same ADMIN_AUTH_PEPPER."
    $deployArguments = @(Get-WranglerArguments "Deploy" $material.Paths)
    Invoke-Wrangler "Deploy" $deployArguments $material.Paths
    $knownState = "deploy_returned_manifest_pending"
    Set-MaterialPhase $material.Paths $material.Manifest "deployed"
    $knownState = "deployed"
  }

  if ($material.Manifest.phase -cne "deployed") {
    throw "The reprovision procedure ended in an unrecognized state."
  }

  $pepper = $null
  $safeDirectory = Assert-SafeMaterialDirectory $material.Directory -MustExist
  Remove-Item -LiteralPath $safeDirectory -Recurse -Force
  $material = $null
  Write-Host "STAGING REPROVISION/DEPLOY PASS - temporary material removed."
  Write-Host "Gate open for exactly one real login while tailing rito.admin_auth.verification."
  Write-Host "Production remains unauthorized."
}
catch {
  if ($null -ne $material) {
    Write-Warning ("Fail-closed at recognized state '" + $knownState + "'.")
    Write-Warning ("Temporary resume material was retained at " + $material.Directory)
    Write-Warning "Resume only with -ResumeMaterialDirectory; do not generate another pepper."
  }
  else {
    Write-Warning ("Fail-closed before staging material creation; known state: " + $knownState)
  }
  throw
}
finally {
  $plainPassword = $null
  $pepper = $null
  if ($null -ne $passwordInput) { $passwordInput.Dispose() }
  if ($null -ne $passwordConfirmation) { $passwordConfirmation.Dispose() }
}
