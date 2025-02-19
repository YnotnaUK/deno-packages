import { load as loadEnvVariables } from "jsr:@std/dotenv"
import { TwitchTokenGenerator } from "../../token_generator.ts"

const prepareEnvVariables = async () => {
  // Load from file
  await loadEnvVariables({
    envPath: `${import.meta.dirname}/.env`,
    export: true,
  })
  // Get
  const httpServerHostname = Deno.env.get("HTTP_SERVER_HOSTNAME")
  const httpServerPort = parseInt(Deno.env.get("HTTP_SERVER_PORT") ?? "")
  const twitchClientId = Deno.env.get("TWITCH_CLIENT_ID")
  const twitchClientSecret = Deno.env.get("TWITCH_CLIENT_SECRET")
  // Validate
  if (!httpServerHostname) {
    throw new Error(`HTTP_SERVER_HOSTNAME not set`)
  }
  if (!httpServerPort) {
    throw new Error(`HTTP_SERVER_PORT not set`)
  }
  if (!twitchClientId) {
    throw new Error(`TWITCH_CLIENT_ID not set`)
  }
  if (!twitchClientSecret) {
    throw new Error(`TWITCH_CLIENT_SECRET not set`)
  }
  // Return results
  return {
    httpServerHostname,
    httpServerPort,
    twitchClientId,
    twitchClientSecret,
  }
}

// Get config
const config = await prepareEnvVariables()

// Create generator
const tokenGenerator = new TwitchTokenGenerator({
  httpServerHostname: config.httpServerHostname,
  httpServerPort: config.httpServerPort,
  twitchClientId: config.twitchClientId,
  twitchClientSecret: config.twitchClientSecret,
})

// Start generator
tokenGenerator.start()
