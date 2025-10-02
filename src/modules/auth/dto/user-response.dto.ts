import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: 'uuid-v4' })
  public id: string;

  @ApiProperty({ example: 'alice@example.com' })
  public email: string;

  @ApiProperty({ example: 'Alice', required: false })
  public displayName?: string;
}
