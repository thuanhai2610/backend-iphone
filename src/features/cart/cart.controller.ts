import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  Put,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { AddCartItemDto } from './dto/addItem.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}
  @UseGuards(AuthGuard)
  @Post()
  create(@Req() req: any, @Body() addCartItemDto: AddCartItemDto) {
    return this.cartService.createCart(req.user['userId'], addCartItemDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  getCart(@Req() req: any) {
    return this.cartService.getCart(req.user['userId']);
  }

  @UseGuards(AuthGuard)
  @Put('update-quantity/:productId/:variantId')
  async updateQuantity(
    @Req() req: any,
    @Param('productId') productId: string,
    @Param('variantId') variantId: string,
    @Body('action') action: 'increment' | 'decrement',
  ) {
    return this.cartService.updateItemQuantity(
      req.user['userId'],
      productId,
      variantId,
      action,
    );
  }
  @UseGuards(AuthGuard)
  @Delete('item/:id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.cartService.removeFromCart(req.user['userId'], id);
  }
}
