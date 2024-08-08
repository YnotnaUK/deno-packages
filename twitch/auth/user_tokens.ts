export interface UserTokens {
  accessToken: string
  expiresIn: number
  refreshToken: string
  scope: string[]
  tokenType: string
  userId: string
  createdAt: number
}
