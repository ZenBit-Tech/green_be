import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class RequestMagicLinkDto {
  @ApiProperty({
    example: 'alice@example.com',
    description: 'Email address to receive magic link',
  })
  @IsEmail()
  public email: string;
}
