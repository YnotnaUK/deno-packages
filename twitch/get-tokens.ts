import "jsr:@std/dotenv/load"
import { RefreshingAuthProviderFilesystemStore } from "./auth/refreshing_auth_provider_filesystem_store.ts"
import type { UserTokensResponseData } from "./auth/user_tokens_response_data.ts"
import type { UserAccessTokenValidationResponseData } from "./auth/user_access_token_validation_response_data.ts"
import { RefreshingAuthProvider } from "./auth/refreshing_auth_provider.ts"

// Get Env Variables
const port = parseInt(Deno.env.get("GETTOKENS_HTTP_SERVER_PORT") ?? "8080")
const twitchClientId = Deno.env.get("TWITCH_CLIENT_ID") ?? ""
const twitchClientSecret = Deno.env.get("TWITCH_CLIENT_SECRET") ?? ""

// Set constants
const twitchRedirectURI = `http://localhost:${port}`
const twitchResponseType = "code"
const twitchScopes = [
  "channel:bot",
  "channel:moderate",
  "channel:read:redemptions",
  "chat:edit",
  "chat:read",
  "whispers:edit",
  "whispers:read",
]

const store = new RefreshingAuthProviderFilesystemStore({
  storePath: "./twitch/examples/default/data",
})

const authProvider = new RefreshingAuthProvider({
  clientId: twitchClientId,
  clientSecret: twitchClientSecret,
  store,
  redirectURI: twitchRedirectURI,
})

async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const requestPath = url.pathname
  const twitchCode = url.searchParams.get("code")
  let body: string
  switch (requestPath) {
    case "/":
      if (!twitchCode) {
        body =
          `<a href="https://id.twitch.tv/oauth2/authorize?response_type=${twitchResponseType}&client_id=${twitchClientId}&redirect_uri=${twitchRedirectURI}&scope=${
            twitchScopes.join("+")
          }">Click to get bot tokens</a>`
      } else {
        const userTokens = await authProvider.exchangeCodeForUserTokens(twitchCode)
        body = JSON.stringify({ userTokens }, undefined, 2)
        setTimeout(() => {
          Deno.exit()
        }, 10000)
      }
      break
    default:
      body = `Invalid url: ${requestPath}`
  }
  return new Response(body, {
    headers: {
      "content-type": "text/html",
    },
    status: 200,
  })
}

async function startServer() {
  await new Promise<void>((resolve) => {
    Deno.serve({
      onListen({ port, hostname }) {
        console.log(`Server started at http://${hostname}:${port}`)
        resolve()
      },
      port,
    }, handler)
  })
}

await startServer()
