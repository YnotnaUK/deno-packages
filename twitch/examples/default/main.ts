import { Bot, RefreshingAuthProvider, RefreshingAuthProviderFilesystemStore } from "../../mod.ts"

const store = new RefreshingAuthProviderFilesystemStore({ storePath: "./twitch/examples/default/data" })

const authProvider = new RefreshingAuthProvider({
  store,
})

const bot = new Bot({
  authProvider,
})

await bot.start()
