export function parseProductionRetentionConfig(config) {
  if (config?.vars?.LIVE_BACKEND_ENV !== "production") {
    throw new Error("Retention execution requires LIVE_BACKEND_ENV=production.");
  }

  const daysRaw = String(config?.vars?.CONSULTATION_RETENTION_DAYS ?? "");
  if (!/^\d+$/.test(daysRaw)) {
    throw new Error("Production config has no valid CONSULTATION_RETENTION_DAYS.");
  }
  const retentionDays = Number(daysRaw);
  if (!Number.isSafeInteger(retentionDays) || retentionDays < 1 || retentionDays > 3650) {
    throw new Error("CONSULTATION_RETENTION_DAYS must be between 1 and 3650.");
  }

  const databases = Array.isArray(config?.d1_databases) ? config.d1_databases : [];
  const binding = databases.find((item) => item?.binding === "CONSULTATION_DB");
  if (!binding?.database_name || !binding?.database_id) {
    throw new Error("Production config is missing CONSULTATION_DB.");
  }
  if (binding.database_name !== "rito-studio-business-plus-production") {
    throw new Error("Retention execution refuses an unexpected D1 database.");
  }

  return {
    databaseName: binding.database_name,
    databaseId: binding.database_id,
    retentionDays,
  };
}

export function cutoffIso(now, retentionDays) {
  return new Date(now.getTime() - retentionDays * 24 * 60 * 60 * 1000).toISOString();
}

function sqlString(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

export function retentionCountSql(cutoff) {
  return `SELECT COUNT(*) AS total FROM consultation_requests WHERE created_at < ${sqlString(cutoff)};`;
}

export function retentionDeleteSql(cutoff) {
  return `DELETE FROM consultation_requests WHERE created_at < ${sqlString(cutoff)};`;
}
