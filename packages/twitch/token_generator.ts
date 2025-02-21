import { TwitchAPIClient } from "./api_client.ts"
import { validScopes } from "./valid_scopes.ts"

export type TwitchTokenGeneratorConfig = {
  httpServerHostname: string
  httpServerPort: number
  twitchClientId: string
  twitchClientSecret: string
}

export class TwitchTokenGenerator {
  private readonly apiClient: TwitchAPIClient
  private readonly httpServerHostname: string
  private readonly httpServerPort: number
  private readonly twitchClientId: string
  private readonly twitchClientSecret: string

  constructor(config: TwitchTokenGeneratorConfig) {
    this.apiClient = new TwitchAPIClient({
      twitchClientId: config.twitchClientId,
    })
    this.httpServerHostname = config.httpServerHostname
    this.httpServerPort = config.httpServerPort
    this.twitchClientId = config.twitchClientId
    this.twitchClientSecret = config.twitchClientSecret
  }

  handler = (request: Request): Response => {
    const url = new URL(request.url)
    if (url.pathname === "/") {
      const loginUrl: string = this.apiClient.generateLoginUrl({
        redirectUri: `https://${url.hostname}/account/login/twitch/callback`,
        scopes: validScopes,
      })
      return new Response(`<h3>Twitch Token Generator</h3><p><a href="${loginUrl}">Login with Twitch</a></p>`, {
        status: 200,
        headers: {
          "content-type": "text/html; charset=utf-8",
        },
      })
    } else if (url.pathname === "/account/login/twitch/callback") {
      return new Response(`<h3>Code Exchange?</h3><p>${url.searchParams.get("code")}</p>`, {
        status: 200,
        headers: {
          "content-type": "text/html; charset=utf-8",
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
