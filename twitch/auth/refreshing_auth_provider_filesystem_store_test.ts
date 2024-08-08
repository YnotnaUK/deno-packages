import { RefreshingAuthProviderFilesystemStore } from "../mod.ts"

Deno.test("Create provider with invalid path", () => {
  const storePath: string = "./twitch/test/fake_store"
  const expectedError = `storesPath does not exist: ${storePath}`
  try {
    new RefreshingAuthProviderFilesystemStore({
      storePath,
    })
  } catch (error) {
    if (error.message !== expectedError) {
      throw error
    }
  }
})

Deno.test("Create a valid provider get and save tokens", async () => {
  const storePath: string = "./twitch/test/auth_store"
  const userId = "valid"
  const store = new RefreshingAuthProviderFilesystemStore({
    storePath,
  })
  const userTokens = await store.getTokensByTwitchUserId(userId)
  if (!userTokens) {
    throw new Error(`No tokens returned`)
  }
  await store.saveTokensByTwitchUserId(userId, userTokens)
})
