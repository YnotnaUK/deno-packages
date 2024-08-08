import type { UserTokens } from "./user_tokens.ts"

export interface RefreshingAuthProviderStore {
  getTokensByUserId: (userId: string) => Promise<UserTokens | undefined>
  saveTokensByUserId: (userId: string, userTokens: UserTokens) => Promise<UserTokens>
}
