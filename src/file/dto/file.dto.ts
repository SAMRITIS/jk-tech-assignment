import { IsNotEmpty, IsString, IsNumber, IsUUID } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateFileDto {
  @IsNotEmpty()
  @IsString()
  key: string;

  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @IsNotEmpty()
  @IsString()
  originalName: string;

  @IsNotEmpty()
  @IsString()
  mimeType: string;

  @IsNotEmpty()
  @IsNumber()
  size: number;
}

export class UpdateFileDto extends PartialType(CreateFileDto) {}
