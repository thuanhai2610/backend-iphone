import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFiles,
  Put,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { UpdateProductDto } from './dto/update-product.dto';


@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}
  

  @Get('all')
  findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('name') name?: string,
    @Query('category') category?: string,
    @Query('color') color?: string,
    @Query('storage') storage?: string,
    @Query('sort') sort?: string,
  ) {
    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 10;
    return this.productService.findAll(pageNumber, limitNumber, {
      name,
      category,
      color,
      storage,
      sort,
    });
  }
  @UseGuards(AuthGuard)
  @Get('des/:id')
  findDescription(@Param('id') id: string) {
    return this.productService.findDrescription(id);
  }

  @Get('category')
  findOne(@Query('q') q: string) {
    return this.productService.category(q);
  }


 
}
