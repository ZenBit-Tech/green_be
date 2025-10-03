import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from './user-response.dto';

export class AuthResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJI...' })
  public accessToken: string;

  @ApiProperty({ example: 3600 })
  public expiresIn: number;

  @ApiProperty({ type: UserResponseDto })
  public user: UserResponseDto;
}
