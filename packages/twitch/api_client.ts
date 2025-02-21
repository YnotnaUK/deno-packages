import type { AccessTokenExternal } from "./types/external_access_token.ts"
import { validScopes } from "./valid_scopes.ts"

type GenerateLoginURLProperties = {
  forceVerify?: "true" | "false" | boolean
  redirectUri: string
  scopes?: string[]
  state?: string
}

type ExchangeAuthorisationCodeProperties = {
  code: string
  redirectUri: string
}

export type TwitchAPIClientConfig = {
  twitchClientId: string
  twitchClientSecret?: string | undefined
}

export class TwitchAPIClient {
  private readonly endpointOauth2Authorise: string = "https://id.twitch.tv/oauth2/authorize"
  private readonly endpointOauth2Token: string = "https://id.twitch.tv/oauth2/token"
  private readonly twitchClientId: string
  private readonly twitchClientSecret: string | undefined
  private readonly httpUserAgentName: string = "YnotnaNetwork/v1.0"

  constructor(config: TwitchAPIClientConfig) {
    this.twitchClientId = config.twitchClientId
    this.twitchClientSecret = config.twitchClientSecret
  }

  exchangeAuthorisationCode = async (props: ExchangeAuthorisationCodeProperties): Promise<AccessTokenExternal> => {
    if (!this.twitchClientSecret) {
      throw new Error(`exchangeAuthorisationCode: cannot use method twitchClientSecret is not set`)
    }
    const urlSearchParams = new URLSearchParams()
    urlSearchParams.append("client_id", this.twitchClientId)
    urlSearchParams.append("client_secret", this.twitchClientSecret)
    urlSearchParams.append("code", props.code)
    urlSearchParams.append("grant_type", "authorization_code")
    urlSearchParams.append("redirect_uri", props.redirectUri)
    console.log()
    const httpClientBody: string = urlSearchParams.toString()
    const httpClientHeaders = {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": this.httpUserAgentName,
    }
    const httpResponse = await fetch(this.endpointOauth2Token, {
      body: httpClientBody,
      headers: httpClientHeaders,
      method: "POST",
    })
    switch (httpResponse.status) {
      case 200:
        return await httpResponse.json() as AccessTokenExternal
      default:
        throw new Error(`exchangeAuthorisationCode: invalid reponse from api`)
    }
  }

  generateLoginUrl = (props: GenerateLoginURLProperties) => {
    // Validate
    if (typeof props.forceVerify === "undefined") {
      props.forceVerify = "false"
    }
    if (typeof props.forceVerify === "boolean") {
      props.forceVerify = props.forceVerify === true ? "true" : "false"
    }
    if (props.forceVerify !== "true" && props.forceVerify !== "false") {
      throw TypeError(`generateLoginUrl: forceVerify is invalid: ${props.forceVerify}`)
    }
    if (!props.scopes) {
      props.scopes = []
    }
    // Check scopes and create a string of them
    let scopesString: string = ""
    for (let scopeIndex = 0; scopeIndex < props.scopes.length; scopeIndex++) {
      const scope = props.scopes[scopeIndex]
      // Ensure scope is of type string
      if (typeof scope !== "string") {
        throw new TypeError(`generateLoginUrl: scopes[${scopeIndex}] is invalid: ${scope}`)
      }
      // Ensure scope is valid
      this.isValidScope(scope)
      // Build up scope string based on current index
      if (scopeIndex === 0) {
        scopesString = `${scope}`
      } else {
        scopesString = `${scopesString}+${scope}`
      }
    }
    // Build url search parameters
    const urlSearchParams = new URLSearchParams()
    urlSearchParams.append("client_id", this.twitchClientId)
    urlSearchParams.append("force_verify", props.forceVerify)
    urlSearchParams.append("redirect_uri", props.redirectUri)
    urlSearchParams.append("response_type", "code")
    urlSearchParams.append("scope", scopesString)
    // if state exists and is greater than 1 character add it
    if (props.state && props.state.length > 0) {
      urlSearchParams.append("state", props.state)
    }
    // Twitch does not like + being encoded so we convert it back here
    return `${this.endpointOauth2Authorise}?${urlSearchParams.toString().replaceAll("%2B", "+")}`
  }

  isValidScope = (scope: string): boolean => {
    return validScopes.includes(scope)
  }
}
