/**
 * Dataverse integration — a self-contained module, separate from the main app
 * data layer (api/, hooks/useApi.ts), powering the Reporting dashboard with
 * external Microsoft Dataverse data.
 */
export { dataverseConfig, isDataverseConfigured } from './config'
export { dataverseGet, type ODataQuery } from './client'
export { dataverseRequestsQuery } from './queries'
export type {
  DataverseList,
  ProbisRequest,
  ProbisParameterRef,
  ProbisCfuFuRef,
} from './types'
