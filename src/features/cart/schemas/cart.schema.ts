// cart.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Variant, VariantSchema } from 'src/features/product/schemas/variant.schema';

@Schema({_id: true, timestamps: true, versionKey: false})
export class CartItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  product: Types.ObjectId;

  @Prop({ required: true, type: VariantSchema })
  variant: Variant
   
  @Prop({required: true})
  name: String; 
  @Prop({required: true})
  storage: string; 
  @Prop({ required: true, min: 0 })
  totalPrice: number; 
}

export const CartItemSchema = SchemaFactory.createForClass(CartItem);

@Schema({ timestamps: true , versionKey: false})
export class Cart extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: [CartItemSchema], default: [] })
  items: CartItem[];

  @Prop({required: true})
  totalPriceInCart: number;
}

export const CartSchema = SchemaFactory.createForClass(Cart);
export type CartDocument = Document & Cart