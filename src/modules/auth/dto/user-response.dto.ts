import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from '../user.entity';

export class UserResponseDto {
  @ApiProperty({ example: 'c6f8c5d6-1234-4a8e-9f2b-0a1b2c3d4e5f' })
  id: string;

  @ApiProperty({ example: 'john.doe' })
  username: string;

  static fromEntity(entity: UserEntity): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = entity.id;
    dto.username = entity.username;
    return dto;
  }
}
