/**
 * Types for the Microsoft Dataverse Web API (OData v4) responses used by the
 * Reporting dashboard. These mirror the shapes in the Postman collection.
 */

/** Standard OData collection envelope. */
export interface DataverseList<T> {
  '@odata.context': string
  '@odata.count'?: number
  '@Microsoft.Dynamics.CRM.totalrecordcount'?: number
  value: T[]
}

/** Expanded lookup to a probis_parameter (Urgency / Priority). */
export interface ProbisParameterRef {
  probis_parameterid: string
  probis_name: string
}

/** Expanded lookup to the CFU/FU requester. */
export interface ProbisCfuFuRef {
  probis_cfufurequesterid: string
  probis_cfufuname: string
}

/** A row from the probis_requests entity set. */
export interface ProbisRequest {
  '@odata.etag'?: string
  probis_requestid: string
  probis_id: string
  probis_name: string
  probis_description: string
  probis_requestcategory: string
  'probis_requestcategory@OData.Community.Display.V1.FormattedValue'?: string
  probis_Urgency?: ProbisParameterRef
  probis_Priority?: ProbisParameterRef
  probis_CFUFURequetser?: ProbisCfuFuRef
}
