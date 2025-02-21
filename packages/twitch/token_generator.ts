import { TwitchAPIClient } from "./api_client.ts"
import { validScopes } from "./valid_scopes.ts"

export type TwitchTokenGeneratorConfig = {
  httpServerHostname: string
  httpServerPort: number
  twitchClientId: string
  twitchClientSecret: string
  twitchRedirectUri: string
}

export class TwitchTokenGenerator {
  private readonly apiClient: TwitchAPIClient
  private readonly httpServerHostname: string
  private readonly httpServerPort: number
  private readonly twitchRedirectUri: string

  constructor(config: TwitchTokenGeneratorConfig) {
    this.apiClient = new TwitchAPIClient({
      twitchClientId: config.twitchClientId,
      twitchClientSecret: config.twitchClientSecret,
    })
    this.httpServerHostname = config.httpServerHostname
    this.httpServerPort = config.httpServerPort
    this.twitchRedirectUri = config.twitchRedirectUri
  }

  handler = async (request: Request): Promise<Response> => {
    const url = new URL(request.url)
    if (url.pathname === "/") {
      const loginUrl: string = this.apiClient.generateLoginUrl({
        redirectUri: `https://${url.hostname}${this.twitchRedirectUri}`,
        scopes: validScopes,
      })
      return new Response(`<h3>Twitch Token Generator</h3><p><a href="${loginUrl}">Login with Twitch</a></p>`, {
        status: 200,
        headers: {
          "content-type": "text/html; charset=utf-8",
        },
      })
    } else if (url.pathname === this.twitchRedirectUri) {
      const code = url.searchParams.get("code")
      if (!code) {
        return new Response(`<h3>Code Exchange Failed</h3><p>code was not returned</p>`, {
          status: 400,
          headers: {
            "content-type": "text/html; charset=utf-8",
          },
        })
      }
      const externalAccessToken = await this.apiClient.exchangeAuthorisationCode({
        code: code,
        redirectUri: `https://${url.hostname}${this.twitchRedirectUri}`,
      })
      return new Response(JSON.stringify(externalAccessToken), {
        status: 200,
        headers: {
          "content-type": "application/json; charset=utf-8",
        },
      })
    } else {
      return new Response(`<h3>Page Not Found!</h3><p>${url.pathname}</p>`, {
        status: 404,
        headers: {
          "content-type": "text/html; charset=utf-8",
        },
      })
    }
  }

  onListen = ({ port, hostname }: { port: number; hostname: string }) => {
    console.log(`Server started at http://${hostname}:${port}`)
  }

  start = () => {
    console.log("Starting twitch token generator...")
    this.startHttpServer()
  }

  startHttpServer = () => {
    Deno.serve({
      port: this.httpServerPort,
      hostname: this.httpServerHostname,
      handler: this.handler,
      onListen: this.onListen,
    })
  }
}
