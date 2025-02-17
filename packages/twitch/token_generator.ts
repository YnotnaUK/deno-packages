import "jsr:@std/dotenv/load"

const twitchClientId: string | undefined = Deno.env.get("TWITCH_CLIENT_ID")
const twitchClientSecret: string | undefined = Deno.env.get("TWITCH_CLIENT_SECRET")

const validateEnvVariables = (): boolean => {
  if (!twitchClientId) {
    throw new Error(`TWITCH_CLIENT_ID is not set`)
  }
  if (!twitchClientSecret) {
    throw new Error("TWITCH_CLIENT_SECRET is not set")
  }
  return true
}

validateEnvVariables()

console.log(twitchClientId)
