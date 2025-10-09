import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../../../types/jwt-payload.interface';
import { User } from '../user.entity'; // ✅ User

/**
 * JWT Access Token Strategy
 * Validates access tokens and attaches user info to request
 * Used by ALL authenticated routes
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  /**
   * Validate JWT payload and return user object
   * This user object will be attached to request as req.user
   *
   * @param payload - Decoded JWT payload
   * @returns User object for request context
   */
  validate(payload: JwtPayload): User {
    if (!payload.sub || !payload.email) {
      throw new UnauthorizedException('Invalid token payload');
    }

    return {
      id: payload.sub,
      email: payload.email,
    } as User;
  }
}
