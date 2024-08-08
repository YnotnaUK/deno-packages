import type { UserTokens } from "./user_tokens.ts"
import type { AuthProvider } from "./auth_provider.ts"
import type { RefreshingAuthProviderStore } from "./refreshing_auth_provider_store.ts"
import type { RefreshingAuthProviderConfig } from "./refreshing_auth_provider_config.ts"

export class RefreshingAuthProvider implements AuthProvider {
  private readonly store: RefreshingAuthProviderStore
  constructor(config: RefreshingAuthProviderConfig) {
    this.store = config.store
  }
  public async getTokensByUserId(userId: string): Promise<UserTokens | undefined> {
    const userTokens = await this.store.getTokensByUserId(userId)
    return userTokens
  }
}
