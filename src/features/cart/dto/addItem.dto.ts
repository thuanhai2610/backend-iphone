// add-cart-item.dto.ts
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { ColorIphone } from 'src/features/product/enums/color.enum';

export class AddCartItemDto {
  @IsNotEmpty()
  productId: string;

  @IsNotEmpty()
  variant: {
    color: ColorIphone;
    storage?: string;
    quantity: number;
  };


}
