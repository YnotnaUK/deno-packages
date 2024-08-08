import type { UserTokens } from "./user_tokens.ts"

export interface AuthProvider {
  getTokensByUserId: (userId: string) => Promise<UserTokens | undefined>
}
