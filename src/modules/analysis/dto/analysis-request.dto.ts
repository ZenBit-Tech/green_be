import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class MarkerDto {
  @IsString() name: string;
  @IsString() value: string;
  @IsOptional() @IsString() unit?: string;
  @IsOptional() @IsString() normalRange?: string;
  @IsOptional() isNormal?: boolean;
  @IsOptional() recommendations?: string;
}

export class RequestAnalysisDto {
  @IsNumber() age: number;

  @IsEnum(['male', 'female'])
  gender: 'male' | 'female';

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MarkerDto)
  markers: MarkerDto[];

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsArray()
  selectedOptions?: string[];
}
