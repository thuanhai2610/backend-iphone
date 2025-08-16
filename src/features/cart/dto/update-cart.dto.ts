import { PartialType } from '@nestjs/mapped-types';
import { AddCartItemDto } from './addItem.dto';

export class UpdateCartDto extends PartialType(AddCartItemDto) {}
