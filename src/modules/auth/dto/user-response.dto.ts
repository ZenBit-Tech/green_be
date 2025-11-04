import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: 'uuid-v4' })
  public id: string;

  @ApiProperty({ example: 'alice@example.com' })
  public email: string;

  @ApiProperty({
    example: 'google',
    enum: ['magic_link', 'google', 'linkedin'],
  })
  public provider: 'magic_link' | 'google' | 'linkedin';
}
