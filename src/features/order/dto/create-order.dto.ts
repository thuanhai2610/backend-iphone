import { IsEnum, IsNotEmpty, IsOptional } from "@nestjs/class-validator";
import { Product } from "src/features/product/schemas/product.schema";
import { User } from "src/users/schemas/user.schema";
import { PaymentMethod } from "../enums/payment.enum";
import { StatusOrder } from "../enums/status-order.enum";

export class CreateOrderDto {
       @IsOptional()
       userOrderId: User;
   
       @IsOptional()
       items: [ 
        {
            product: Product,
            quantity: number,
            price: number
        }
       ]
   
       @IsOptional()
       totalPrice: number;

  
       @IsOptional()
       @IsEnum(StatusOrder)
       status: StatusOrder; 

        @IsNotEmpty()
       @IsEnum(PaymentMethod)
       paymentMethod: PaymentMethod;

   
       @IsOptional()
       shippingAddress: string;
}
