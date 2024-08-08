import type { AuthProvider } from "./auth/auth_provider.ts"
import type { BotConfig } from "./bot_config.ts"

export class Bot {
  private readonly authProvider: AuthProvider
  constructor(config: BotConfig) {
    this.authProvider = config.authProvider
  }

  public async start(): Promise<void> {}
}
