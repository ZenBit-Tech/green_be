export interface OAuthProfile {
  id: string;
  email: string;
  firstName?: string | undefined;
  lastName?: string | undefined;
  provider: 'google' | 'facebook';
  providerId: string;
  picture?: string | undefined;
}
