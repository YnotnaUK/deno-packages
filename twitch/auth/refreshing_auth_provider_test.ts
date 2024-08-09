import type { AuthProvider } from "./auth_provider.ts"
import { RefreshingAuthProvider } from "./refreshing_auth_provider.ts"
import { RefreshingAuthProviderFilesystemStore } from "./refreshing_auth_provider_filesystem_store.ts"

// TODO: to write a test for the exchange code we need to mock the endpoint

Deno.test("Create valid provider with valid store and attempt to get a valid token", () => {
  const storePath: string = "./twitch/test/auth_store"
  const userId: string = "valid"
  const refreshingAuthProviderStore = new RefreshingAuthProviderFilesystemStore({
    storePath,
  })
  const authProvider = new RefreshingAuthProvider({
    clientId: "xxxxxxxxxx",
    clientSecret: "xxxxxxxxxx",
    store: refreshingAuthProviderStore,
  })
  authProvider.getTokensByUserId(userId)
})
