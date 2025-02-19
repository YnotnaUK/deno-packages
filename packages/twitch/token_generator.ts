import { load as loadEnvVariables } from "jsr:@std/dotenv"

type envVariables = {
  httpServerPort: number
  twitchClientId: string
  twitchClientSecret: string
}

const processEnvVariables = async (): Promise<envVariables> => {
  // Load env variables
  await loadEnvVariables({
    envPath: `${import.meta.dirname}/.env`,
    export: true,
  })
  // Get variables from enviroment
  const httpServerPort: number = parseInt(Deno.env.get("HTTP_SERVER_PORT") ?? "")
  const twitchClientId: string | undefined = Deno.env.get("TWITCH_CLIENT_ID")
  const twitchClientSecret: string | undefined = Deno.env.get("TWITCH_CLIENT_SECRET")
  // Validation
  if (!httpServerPort) {
    throw new Error(`HTTP_SERVER_PORT is not set`)
  }
  const minHttpServerPort: number = 1000
  const maxHttpServerPort: number = 9000
  if (httpServerPort < minHttpServerPort || httpServerPort > maxHttpServerPort) {
    throw new Error(
      `HTTP_SERVER_PORT is not within a valid range (${minHttpServerPort} to ${maxHttpServerPort}): ${httpServerPort}`,
    )
  }
  if (!twitchClientId) {
    throw new Error(`TWITCH_CLIENT_ID is not set`)
  }
  if (!twitchClientSecret) {
    throw new Error("TWITCH_CLIENT_SECRET is not set")
  }
  // All ok, return them
  return {
    httpServerPort,
    twitchClientId,
    twitchClientSecret,
  }
}

const config: envVariables = await processEnvVariables()

const _httpServer = Deno.serve({
  port: config.httpServerPort,
  hostname: "0.0.0.0",
  handler: (request: Request) => {
    console.log(request)
    return new Response("Hello, world")
  },
  onListen({ port, hostname }) {
    console.log(`Server started at http://${hostname}:${port}`)
  },
})
