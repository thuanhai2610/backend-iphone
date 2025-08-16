// variant.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ColorIphone } from '../enums/color.enum';
import { Types } from 'mongoose';

@Schema()
export class Variant {
  @Prop({ required: true, enum: ColorIphone })
  color: ColorIphone;

  @Prop({ required: true, default: 0 })
  quantity: number;

    @Prop({ required: true, default: 0 , min: 0 })
    price: number;
  
    @Prop({ required: true })
    images: String;

    _id: Types.ObjectId
}

export const VariantSchema = SchemaFactory.createForClass(Variant);
