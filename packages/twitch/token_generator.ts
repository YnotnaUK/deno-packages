export type TwitchTokenGeneratorConfig = {
  httpServerHostname: string
  httpServerPort: number
  twitchClientId: string
  twitchClientSecret: string
}

export class TwitchTokenGenerator {
  private readonly httpServerHostname: string
  private readonly httpServerPort: number
  private readonly twitchClientId: string
  private readonly twitchClientSecret: string

  constructor(config: TwitchTokenGeneratorConfig) {
    this.httpServerHostname = config.httpServerHostname
    this.httpServerPort = config.httpServerPort
    this.twitchClientId = config.twitchClientId
    this.twitchClientSecret = config.twitchClientSecret
  }

  handler = (_request: Request) => {
    return new Response("Hello, world")
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
