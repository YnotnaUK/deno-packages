import "jsr:@std/dotenv/load"
import { RefreshingAuthProviderFilesystemStore } from "./mod.ts"
import type { UserTokensResponse } from "./auth/user_tokens_response.ts"
import type { UserTokenValidationResponse } from "./auth/user_token_validation_response.ts"

// Get Env Variables
const port = parseInt(Deno.env.get("GETTOKENS_HTTP_SERVER_PORT") ?? "8080")
const twitchClientId = Deno.env.get("TWITCH_CLIENT_ID")
const twitchClientSecret = Deno.env.get("TWITCH_CLIENT_SECRET")

// Set constants
const twitchGrantType = "authorization_code"
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
        const exchangeUrl =
          `https://id.twitch.tv/oauth2/token?client_id=${twitchClientId}&client_secret=${twitchClientSecret}&code=${twitchCode}&grant_type=${twitchGrantType}&redirect_uri=${twitchRedirectURI}`
        const codeExchangeResponse = await fetch(exchangeUrl, { method: "post" })
        const userTokensResponse = await codeExchangeResponse.json() as UserTokensResponse
        // Validate to get user id
        const validateResponse = await fetch(`https://id.twitch.tv/oauth2/validate`, {
          headers: {
            Authorization: `OAuth ${userTokensResponse.access_token}`,
          },
          method: "get",
        })
        const userTokenValidation = await validateResponse.json() as UserTokenValidationResponse
        // build user tokens
        const userTokens = {
          accessToken: userTokensResponse.access_token,
          expiresIn: userTokensResponse.expires_in,
          refreshToken: userTokensResponse.refresh_token,
          scope: userTokensResponse.scope,
          tokenType: userTokensResponse.token_type,
          userId: userTokenValidation.user_id,
          createdAt: Date.now(),
        }

        store.saveTokensByUserId(userTokenValidation.user_id, userTokens)
        body = JSON.stringify({ userTokensResponse, userTokenValidation }, undefined, 2)
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
