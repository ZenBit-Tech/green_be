import { IsString, IsNotEmpty } from 'class-validator';

export class ParsedDataDto {
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
