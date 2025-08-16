import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ColorIphone } from '../enums/color.enum';
import { StorageIphone } from '../enums/storage.enum';
import { Document } from 'mongoose';
import { Specs } from './specs.schema';
import { VariantDto } from '../dto/variant.dto';
import { VariantSchema } from './variant.schema';
import { Post } from '@nestjs/common';


@Schema({ timestamps: true, versionKey: false })
export class Product {
  @Prop({ required: true })
  name: String;

  @Prop({ required: true })
  description: string;

  @Prop({type: [VariantSchema], required: true, default : [] })
  varian: VariantDto[];

  @Prop({ required: true, enum: StorageIphone })
  storage: StorageIphone;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  specs: Specs

  @Prop({  default: 0 , min: 0})
  stock: number;
}
export type ProductDocument = Product & Document;
export const ProductSchema = SchemaFactory.createForClass(Product)
ProductSchema.index({category : 'text'})

