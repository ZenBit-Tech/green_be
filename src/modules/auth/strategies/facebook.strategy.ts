import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-facebook';
import { OAuthProfile } from '../../../types/oauth-profile.interface';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('FACEBOOK_APP_ID'),
      clientSecret: configService.get<string>('FACEBOOK_APP_SECRET'),
      callbackURL: configService.get<string>('FACEBOOK_CALLBACK_URL'),
      scope: ['public_profile'],
      profileFields: ['id', 'emails', 'name', 'picture'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (error: Error | null, user?: OAuthProfile) => void,
  ): Promise<OAuthProfile> {
    const { id, emails, name, photos } = profile;

    const user: OAuthProfile = {
      id,
      email: emails && emails[0] ? emails[0].value : `${id}@facebook.com`,
      firstName: name?.givenName || undefined,
      lastName: name?.familyName || undefined,
      provider: 'facebook',
      providerId: id,
      picture: photos && photos[0] ? photos[0].value : undefined,
    };

    done(null, user);
    return Promise.resolve(user);
  }
}
