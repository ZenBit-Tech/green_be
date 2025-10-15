import { IsString, IsNotEmpty } from 'class-validator';

export class ParsedFromFileDataDto {
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @IsString()
  @IsNotEmpty()
  fileType: string;

  @IsString()
  @IsNotEmpty()
  extractedText: string;
}
