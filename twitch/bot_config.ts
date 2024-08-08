import type { AuthProvider } from "./auth/auth_provider.ts"

export interface BotConfig {
  authProvider: AuthProvider
}
