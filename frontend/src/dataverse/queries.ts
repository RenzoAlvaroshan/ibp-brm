/**
 * React Query factories for Dataverse data. Use with useQuery, mirroring the
 * pattern in hooks/useApi.ts:
 *
 *   const { data } = useQuery(dataverseRequestsQuery({ top: 5 }))
 */
import { dataverseGet, type ODataQuery } from './client'
import type { DataverseList, ProbisRequest } from './types'

/** Default columns/expansions for probis_requests, matching the Postman doc. */
const REQUEST_DEFAULTS: ODataQuery = {
  select: 'probis_id,probis_name,probis_description,probis_requestcategory',
  expand:
    'probis_Urgency($select=probis_name),probis_Priority($select=probis_name),probis_CFUFURequetser($select=probis_cfufuname)',
}

export function dataverseRequestsQuery(query?: ODataQuery) {
  const merged = { ...REQUEST_DEFAULTS, ...query }
  return {
    queryKey: ['dataverse', 'probis_requests', merged] as const,
    queryFn: () => dataverseGet<DataverseList<ProbisRequest>>('probis_requests', merged),
  }
}
