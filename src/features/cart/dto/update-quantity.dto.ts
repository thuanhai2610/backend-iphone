import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class UpdateQuantityDto {
  @IsNotEmpty()
  itemId: string;

  @IsNumber()
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity: number;
}