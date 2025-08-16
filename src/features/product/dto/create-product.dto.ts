import { IsEnum, IsNotEmpty, IsOptional } from "@nestjs/class-validator";
import { ColorIphone } from "../enums/color.enum";
import { StorageIphone } from "../enums/storage.enum";
import { VariantDto } from "./variant.dto";

export class CreateProductDto {
    @IsNotEmpty()
    name: String;

    @IsNotEmpty()
    description: string;

    @IsNotEmpty()
    category: string;

    @IsNotEmpty()
    specs: {
        screen: string;
        chip: string;
        ram: string;
        battery: string;
        camera: string;
    };

    @IsNotEmpty()
    varian: VariantDto[];

     @IsNotEmpty()
    @IsEnum(StorageIphone)
    storage: StorageIphone;
    
    @IsOptional()
    stock: number;
}
