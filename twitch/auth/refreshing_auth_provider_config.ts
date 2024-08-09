import type { RefreshingAuthProviderStore } from "./refreshing_auth_provider_store.ts"

export interface RefreshingAuthProviderConfig {
  clientId: string
  clientSecret: string
  store: RefreshingAuthProviderStore
  redirectURI?: string
}
