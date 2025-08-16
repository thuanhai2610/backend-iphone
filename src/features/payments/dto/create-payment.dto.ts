import { IsEnum, IsNotEmpty, IsOptional } from "class-validator";
import { Types } from "mongoose";
import { PaymentMethod } from "src/features/order/enums/payment.enum";
import { PaymentStatus } from "../enums/payment-status.enum";

export class CreatePaymentDto {
    @IsOptional()
    orderId: Types.ObjectId

    @IsNotEmpty()
    @IsEnum(PaymentMethod)
    method: PaymentMethod;

    @IsOptional()
    @IsEnum(PaymentStatus)
    status: PaymentStatus;
    
    @IsOptional()
    transactionId: string;

    @IsNotEmpty()
    amount: number;

    paidAt: Date;
}
