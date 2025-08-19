import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Product } from 'src/features/product/schemas/product.schema';
import { User } from 'src/users/schemas/user.schema';
import { StatusOrder } from '../enums/status-order.enum';
import { PaymentMethod } from '../enums/payment.enum';
import { Document, Types } from 'mongoose';
import { ColorIphone } from 'src/features/product/enums/color.enum';
import storage from 'src/stores/cloudinary-store';
@Schema({timestamps: true, versionKey: false})
export class Order {

  @Prop({ required: true , ref: 'Payment'})
  userOrderId: Types.ObjectId;

  @Prop({ type: [
    {
      product: {type: Types.ObjectId, ref: 'Product', required: true},
    
      variant: {
        color: { type: String, enum: Object.values(ColorIphone), required: true },
        quantity: Number,
        price: Number,
        images: String,
      
      },
        name: String,
        storage: String,
      totalPrice: Number,
    }
  ], required: true })
  items: any[];


  @Prop({ required: true })
  totalPriceInOrder: number;

  @Prop({ required: true, enum: StatusOrder })
  status: StatusOrder;

  @Prop({ required: true, enum: Object.values(PaymentMethod) })
  paymentMethod: PaymentMethod;

  @Prop({ required: true })
  shippingAddress: string;

   @Prop({ required: true })fullName: string;
       @Prop({ required: true })city: string;
       @Prop({ required: true })district: string;
     @Prop({ required: true })ward: string;
}
export type OrderDocument = Order & Document;
export const OrderSchema = SchemaFactory.createForClass(Order)
