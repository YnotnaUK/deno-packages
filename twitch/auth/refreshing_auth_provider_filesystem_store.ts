import { existsSync } from "jsr:@std/fs"

import type { RefreshingAuthProviderStore } from "./refreshing_auth_provider_store.ts"
import type { UserTokens } from "./user_tokens.ts"
import type { RefreshingAuthProviderFilesystemStoreConfig } from "./refreshing_auth_provider_filesystem_store_config.ts"

export class RefreshingAuthProviderFilesystemStore implements RefreshingAuthProviderStore {
  private readonly storesPath: string
  constructor(config: RefreshingAuthProviderFilesystemStoreConfig) {
    this.storesPath = config.storePath
    // Ensure the stores path exists
    if (!existsSync(this.storesPath, { isReadable: true, isDirectory: true })) {
      throw new Error(`storesPath does not exist: ${this.storesPath}`)
    }
  }
  private buildStorePath(userId: string): string {
    return `${this.storesPath}/tokens.${userId}.json`
  }
  public async getTokensByTwitchUserId(userId: string): Promise<UserTokens | undefined> {
    const userStorePath: string = this.buildStorePath(userId)
    const fileContents = await Deno.readTextFile(userStorePath)
    const userTokens = JSON.parse(fileContents) as UserTokens
    return userTokens
  }
  public async saveTokensByTwitchUserId(userId: string, userTokens: UserTokens): Promise<UserTokens> {
    const userStorePath: string = this.buildStorePath(userId)
    const fileContents = JSON.stringify(userTokens, undefined, 2)
    await Deno.writeTextFile(userStorePath, fileContents)
    return userTokens
  }
}
