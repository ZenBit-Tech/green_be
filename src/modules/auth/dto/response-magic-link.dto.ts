import { ApiProperty } from '@nestjs/swagger';

export class ResponseMagicLinkDto {
  @ApiProperty({
    example: true,
    description: 'Whether the magic link email was sent successfully',
  })
  public success: boolean;
}
