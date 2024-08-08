import type { UserTokens } from "./user_tokens.ts"

export interface RefreshingAuthProviderStore {
  getTokensByTwitchUserId: (twitchUserId: string) => Promise<UserTokens | undefined>
  saveTokensByTwitchUserId: (twitchUserId: string, twitchUserTokens: UserTokens) => Promise<UserTokens>
}
