/**
 * Dataverse connection settings, read from Vite env vars (VITE_DATAVERSE_*).
 *
 * ⚠️ SECURITY NOTE: anything prefixed with VITE_ is bundled into the public
 * JavaScript and is readable by anyone who opens the app. Putting a real
 * client_secret here exposes it. This module exists because the Reporting
 * dashboard reads external Dataverse data directly from the browser, as
 * requested — for production you would normally proxy this through a server
 * so the secret never leaves the backend.
 */
export const dataverseConfig = {
  tenantId: (import.meta.env.VITE_DATAVERSE_TENANT_ID ?? '') as string,
  clientId: (import.meta.env.VITE_DATAVERSE_CLIENT_ID ?? '') as string,
  clientSecret: (import.meta.env.VITE_DATAVERSE_CLIENT_SECRET ?? '') as string,
  // e.g. https://org9e2b1aa4.api.crm5.dynamics.com (no trailing slash)
  resourceUrl: ((import.meta.env.VITE_DATAVERSE_RESOURCE_URL ?? '') as string).replace(/\/$/, ''),
  apiVersion: (import.meta.env.VITE_DATAVERSE_API_VERSION ?? 'v9.2') as string,
}

/** True when all mandatory credentials are present. */
export function isDataverseConfigured(): boolean {
  const c = dataverseConfig
  return Boolean(c.tenantId && c.clientId && c.clientSecret && c.resourceUrl)
}
