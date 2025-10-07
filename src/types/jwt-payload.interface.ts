/**
 * JWT payload interface
 * Defines the structure of JWT token payload
 */
export interface JwtPayload {
  /**
   * Subject - user ID
   */
  sub: string;

  /**
   * Username
   */
  username: string;

  /**
   * Issued at timestamp (optional, added by JWT library)
   */
  iat?: number;

  /**
   * Expiration timestamp (optional, added by JWT library)
   */
  exp?: number;
}
