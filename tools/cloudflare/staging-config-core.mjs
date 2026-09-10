export const STAGING_ENTRY_FILENAME = "staging-worker-entry.mjs";
export const STAGING_SECURITY_RESPONSE_FILENAME = "staging-security-response.mjs";

export function applyStagingAssetBoundary(config) {
  if (!config.assets || typeof config.assets !== "object" || config.assets.binding !== "ASSETS") {
    throw new Error("Generated Worker must expose the ASSETS binding before hardening.");
  }

  return {
    ...config,
    main: STAGING_ENTRY_FILENAME,
    assets: {
      ...config.assets,
      run_worker_first: true,
    },
  };
}
