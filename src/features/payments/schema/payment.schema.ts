import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { PaymentMethod } from "src/features/order/enums/payment.enum";

@Schema({timestamps: true, versionKey: false})
export class Payment {
    @Prop({}) 
    orderId: Types.ObjectId;

    @Prop({required: true, enum: Object.values(PaymentMethod)})
    method: PaymentMethod;

    @Prop({default: 'failed'})   
    status: string;

    @Prop({required: true, default: 0})
    amount: number;
    
    @Prop({ required: false })
    paymentUrl?: string;

    @Prop({})
    paidAt: Date; 
}
export const PaymentSchema = SchemaFactory.createForClass(Payment);
export type PaymentDocument = Payment & Document;
