import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import {  FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import storage from 'src/stores/cloudinary-store';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}
@UseGuards(AuthGuard)
    @UseInterceptors(FilesInterceptor('files' , 4, {storage}))
  @Post()
  create(@Body() createProductDto: CreateProductDto,@UploadedFiles() files: Express.Multer.File[],) {
    return this.productService.create(createProductDto, files);
  }

  @Get('all')
  findAll(
    @Query('page') page: string , 
    @Query('limit') limit: string ,
    @Query('name') name?: string,
    @Query('color') color?: string,
    @Query('storage') storage?: string,
    @Query('sort') sort?: string,
  ) {
    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 10;
    return this.productService.findAll(pageNumber, limitNumber ,{ name, color, storage, sort});
  }
@UseGuards(AuthGuard)
  @Get('des/:id')
  findDescription(@Param('id') id: string){
    return this.productService.findDrescription(id)
  }
  
  @Get('category')
  findOne(@Query('q') q: string) {
    return this.productService.category(q);
  }

  @Patch(':id/variant')
  update(@Param('id') id: string, @Body() body : { color: string, quantity: number}) {
    const {color, quantity } = body;
    return this.productService.update(id, color, quantity);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.remove(+id);
  }
}
