import { Injectable, Logger } from '@nestjs/common';

export type MagicLinkEmailPayload = {
  to: string;
  from: string;
  link: string;
  expiresInSeconds: number;
};

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  public sendMagicLink(payload: MagicLinkEmailPayload): Promise<void> {
    try {
      this.logger.log(
        `Scheduled magic link email to ${payload.to} (expires in ${payload.expiresInSeconds}s)`,
      );
      return Promise.resolve();
    } catch (err) {
      this.logger.error('sendMagicLink failed', (err as Error).message);
      return Promise.reject(err as Error);
    }
  }
}
