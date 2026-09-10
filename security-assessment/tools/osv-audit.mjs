import { readFileSync } from "node:fs";

const lockPath = new URL("../../bun.lock", import.meta.url);
const lockText = readFileSync(lockPath, "utf8");
const packages = new Map();

for (const line of lockText.split(/\r?\n/)) {
  const match = line.match(/^\s+"[^"]+":\s*\["([^"]+@[^"]+)"/);
  if (!match) continue;
  const locator = match[1];
  const separator = locator.lastIndexOf("@");
  const name = locator.slice(0, separator);
  const version = locator.slice(separator + 1);
  if (!name || !/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(version)) continue;
  packages.set(`${name}@${version}`, { name, version });
}

const inventory = [...packages.values()].sort((a, b) =>
  `${a.name}@${a.version}`.localeCompare(`${b.name}@${b.version}`),
);
const findings = [];

for (let offset = 0; offset < inventory.length; offset += 500) {
  const batch = inventory.slice(offset, offset + 500);
  const response = await fetch("https://api.osv.dev/v1/querybatch", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      queries: batch.map(({ name, version }) => ({
        package: { ecosystem: "npm", name },
        version,
      })),
    }),
  });
  if (!response.ok) throw new Error(`OSV query failed: HTTP ${response.status}`);
  const payload = await response.json();
  payload.results.forEach((result, index) => {
    for (const vulnerability of result.vulns ?? []) {
      findings.push({
        package: batch[index].name,
        version: batch[index].version,
        id: vulnerability.id,
        modified: vulnerability.modified,
      });
    }
  });
}

const detailsById = new Map();
for (const id of [...new Set(findings.map((finding) => finding.id))]) {
  const response = await fetch(`https://api.osv.dev/v1/vulns/${encodeURIComponent(id)}`);
  if (!response.ok) throw new Error(`OSV detail query failed for ${id}: HTTP ${response.status}`);
  const vulnerability = await response.json();
  detailsById.set(id, {
    aliases: vulnerability.aliases ?? [],
    summary: vulnerability.summary ?? "",
    severity: vulnerability.severity ?? [],
    databaseSpecific: vulnerability.database_specific ?? {},
    references: (vulnerability.references ?? []).map((reference) => reference.url),
  });
}

for (const finding of findings) {
  finding.details = detailsById.get(finding.id);
}

console.log(
  JSON.stringify(
    {
      source: "https://api.osv.dev/v1/querybatch",
      scannedPackages: inventory.length,
      vulnerabilityMatches: findings.length,
      findings,
    },
    null,
    2,
  ),
);
