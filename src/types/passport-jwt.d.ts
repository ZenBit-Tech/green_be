declare module 'passport-jwt' {
  import { Strategy as PassportStrategy } from 'passport';
  import { Request } from 'express';

  export interface StrategyOptions {
    jwtFromRequest: JwtFromRequestFunction;
    secretOrKey: string;
    issuer?: string;
    audience?: string;
    algorithms?: string[];
    ignoreExpiration?: boolean;
    passReqToCallback?: boolean;
    jsonWebTokenOptions?: Record<string, unknown>;
  }

  export type JwtFromRequestFunction = (req: Request) => string | null;

  export class Strategy extends PassportStrategy {
    constructor(options: StrategyOptions, verify: VerifyCallback);
    authenticate(req: Request, options?: unknown): void;
  }

  export type VerifyCallback = (
    payload: unknown,
    done: (error: Error | null, user?: unknown, info?: unknown) => void,
  ) => void;

  export namespace ExtractJwt {
    function fromHeader(header_name: string): JwtFromRequestFunction;
    function fromBodyField(field_name: string): JwtFromRequestFunction;
    function fromUrlQueryParameter(param_name: string): JwtFromRequestFunction;
    function fromAuthHeaderWithScheme(
      auth_scheme: string,
    ): JwtFromRequestFunction;
    function fromAuthHeaderAsBearerToken(): JwtFromRequestFunction;
    function fromExtractors(
      extractors: JwtFromRequestFunction[],
    ): JwtFromRequestFunction;
  }
}
