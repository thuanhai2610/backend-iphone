import { IsNotEmpty } from "@nestjs/class-validator";

export class UpdateItemVariantDto{
    @IsNotEmpty()
    color?: string;

    @IsNotEmpty()
    quantity: number;
}