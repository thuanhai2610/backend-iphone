// variant.dto.ts
import { IsEnum } from '@nestjs/class-validator';
import { IsString, IsNotEmpty, IsInt, Min } from 'class-validator';
import { ColorIphone } from '../enums/color.enum';
import { Types } from 'mongoose';

export class VariantDto {
  _id: Types.ObjectId;
  @IsString()
  @IsNotEmpty()
  @IsEnum(ColorIphone)
  
  color: ColorIphone;

  @IsInt()
  @Min(0)
  quantity: number;
  @IsInt()
  @Min(0)
  price: number

  images: String;
}
