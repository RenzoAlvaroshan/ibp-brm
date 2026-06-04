/**
 * Browser-side Dataverse client: OAuth2 client-credentials token (cached) +
 * authenticated OData GET helper.
 *
 * Requests always go through same-origin proxy paths (/dv-token, /dv-api) so
 * the browser never makes a cross-origin call. Those paths are proxied to
 * Microsoft by the Vite dev server (vite.config.ts) in development and by
 * nginx (nginx.conf) in the Docker/production build. This avoids CORS, which
 * Dataverse does not grant to arbitrary browser origins.
 */
import { dataverseConfig as cfg, isDataverseConfigured } from './config'

const tokenUrl = () => `/dv-token/${cfg.tenantId}/oauth2/v2.0/token`

const apiBase = () => `/dv-api/api/data/${cfg.apiVersion}`

let cachedToken = ''
let tokenExpiry = 0

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken

  const body = new URLSearchParams({
    client_id: cfg.clientId,
    client_secret: cfg.clientSecret,
    scope: `${cfg.resourceUrl}/.default`,
    grant_type: 'client_credentials',
  })

  const res = await fetch(tokenUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!res.ok) {
    throw new Error(`Dataverse token request failed (${res.status}): ${await res.text()}`)
  }
  const json = (await res.json()) as { access_token: string; expires_in: number }
  cachedToken = json.access_token
  // Refresh 60s early to avoid using a token that expires mid-request.
  tokenExpiry = Date.now() + (json.expires_in - 60) * 1000
  return cachedToken
}

/** OData system query options. */
export interface ODataQuery {
  select?: string
  expand?: string
  filter?: string
  orderby?: string
  top?: number
  skip?: number
  count?: boolean
}

function buildQuery(q?: ODataQuery): string {
  if (!q) return ''
  const p = new URLSearchParams()
  if (q.select) p.set('$select', q.select)
  if (q.expand) p.set('$expand', q.expand)
  if (q.filter) p.set('$filter', q.filter)
  if (q.orderby) p.set('$orderby', q.orderby)
  if (q.top != null) p.set('$top', String(q.top))
  if (q.skip != null) p.set('$skip', String(q.skip))
  if (q.count) p.set('$count', 'true')
  const s = p.toString()
  return s ? `?${s}` : ''
}

/** Authenticated GET against an OData entity set (e.g. "probis_requests"). */
export async function dataverseGet<T = unknown>(entity: string, query?: ODataQuery): Promise<T> {
  if (!isDataverseConfigured()) {
    throw new Error('Dataverse is not configured — set VITE_DATAVERSE_* env vars')
  }
  const token = await getToken()
  const res = await fetch(`${apiBase()}/${entity}${buildQuery(query)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'OData-MaxVersion': '4.0',
      'OData-Version': '4.0',
      Prefer: 'odata.include-annotations="*"',
    },
  })
  if (!res.ok) {
    throw new Error(`Dataverse GET ${entity} failed (${res.status}): ${await res.text()}`)
  }
  return res.json() as Promise<T>
}
