/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_DATAVERSE_TENANT_ID?: string
  readonly VITE_DATAVERSE_CLIENT_ID?: string
  readonly VITE_DATAVERSE_CLIENT_SECRET?: string
  readonly VITE_DATAVERSE_RESOURCE_URL?: string
  readonly VITE_DATAVERSE_API_VERSION?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
