import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { OAuthProfile } from '../../../types/oauth-profile.interface';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<OAuthProfile> {
    const { id, emails, name, photos } = profile;

    const user: OAuthProfile = {
      id,
      email: emails && emails[0] ? emails[0].value : '',
      firstName: name?.givenName || undefined,
      lastName: name?.familyName || undefined,
      provider: 'google',
      providerId: id,
      picture: photos && photos[0] ? photos[0].value : undefined,
    };

    done(null, user);
    return Promise.resolve(user);
  }
}
