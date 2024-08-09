import type { UserTokens } from "./user_tokens.ts"
import type { RefreshingAuthProviderStore } from "./refreshing_auth_provider_store.ts"
import type { RefreshingAuthProviderConfig } from "./refreshing_auth_provider_config.ts"
import type { UserTokensResponseData } from "./user_tokens_response_data.ts"
import type { UserAccessTokenValidationResponseData } from "./user_access_token_validation_response_data.ts"

export class RefreshingAuthProvider {
  private readonly clientId: string
  private readonly clientSecret: string
  private readonly redirectURI: string
  private readonly store: RefreshingAuthProviderStore
  constructor(config: RefreshingAuthProviderConfig) {
    this.clientId = config.clientId
    this.clientSecret = config.clientSecret
    this.store = config.store
    this.redirectURI = config.redirectURI ?? "http://localhost:8080"
  }

  private buildQueryString(queryParameters: Record<string, string>): string {
    let queryString: string = ``
    let parameterCount: number = 1
    for (const [key, value] of Object.entries(queryParameters)) {
      queryString = `${queryString}${parameterCount === 1 ? `?` : `&`}${key}=${value}`
      parameterCount++
    }
    return queryString
  }

  public async exchangeCodeForUserTokens(code: string): Promise<UserTokens> {
    const queryParams = this.buildQueryString({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: this.redirectURI,
    })
    const codeExchangeUrl = `https://id.twitch.tv/oauth2/token${queryParams}`
    const codeExchangeResponse = await fetch(codeExchangeUrl, { method: "post" })
    if (!codeExchangeResponse.ok) {
      throw new Error(`code exchange failed`)
    }
    const userTokensResponseData = await codeExchangeResponse.json() as UserTokensResponseData
    const userAccessTokenValidationResponseData = await this.validateUserAccessToken(
      userTokensResponseData.access_token,
    )
    // build user tokens
    const userTokens = {
      accessToken: userTokensResponseData.access_token,
      expiresIn: userTokensResponseData.expires_in,
      refreshToken: userTokensResponseData.refresh_token,
      scope: userTokensResponseData.scope,
      tokenType: userTokensResponseData.token_type,
      userId: userAccessTokenValidationResponseData.user_id,
      createdAt: Date.now(),
    }
    // save tokens in store
    await this.store.saveTokensByUserId(userAccessTokenValidationResponseData.user_id, userTokens)
    // Also return them
    return userTokens
  }

  public async getTokensByUserId(userId: string): Promise<UserTokens | undefined> {
    const userTokens = await this.store.getTokensByUserId(userId)
    return userTokens
  }

  private async validateUserAccessToken(userAccessToken: string): Promise<UserAccessTokenValidationResponseData> {
    const userAccessTokenValidationURL: string = "https://id.twitch.tv/oauth2/validate"
    const userAccessTokenValidationResponse = await fetch(userAccessTokenValidationURL, {
      headers: {
        Authorization: `OAuth ${userAccessToken}`,
      },
      method: "get",
    })
    if (!userAccessTokenValidationResponse.ok) {
      throw new Error(`user access token is no longer valid`)
    }
    const userAccessTokenValidationResponseData = await userAccessTokenValidationResponse
      .json() as UserAccessTokenValidationResponseData
    return userAccessTokenValidationResponseData
  }
}
