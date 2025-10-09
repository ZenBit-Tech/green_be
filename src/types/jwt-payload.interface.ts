/**
 * JWT payload structure
 * Used by all JWT strategies (access token, refresh token)
 */
export interface JwtPayload {
  sub: string; // User ID
  email: string; // ✅ Добавили email вместо username
  iat?: number; // Issued at (automatically added by JWT)
  exp?: number; // Expiration time (automatically added by JWT)
}
