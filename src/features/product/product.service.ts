import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { Model, PipelineStage, Types } from 'mongoose';
import Redis from 'ioredis';
import { UpdateItemVariantDto } from './dto/update-varian.dto';

@Injectable()
export class ProductService {
  constructor(@InjectModel(Product.name) private readonly model:Model<ProductDocument>,
// @Inject('REDIS_CLIENT') private readonly redisClient: Redis
){}
async create(createProductDto: CreateProductDto, files: Express.Multer.File[]) {
  let varian;
  try {
    const varianData = createProductDto.varian as any;
    
    if (typeof varianData === 'string') {
      let cleanedJson = varianData
        .trim().replace(/,(\s*[}\]])/g, '$1').replace(/,\s*$/, '');
      varian = JSON.parse(cleanedJson);
    } else {
      varian = varianData;
    }
  } catch (error) {
    console.error('JSON parse error for varian:', error.message);
    console.error('Error stack:', error.stack);

    try {
      console.log('Attempting manual cleanup...');
      const varianString = createProductDto.varian as any;
      let manualClean = varianString
        .replace(/\s+/g, ' ') 
        .replace(/,\s*]/g, ']') 
        .replace(/,\s*}/g, '}') 
        .trim();
    
      varian = JSON.parse(manualClean);
    } catch (manualError) {
      console.error('Manual parse also failed:', manualError.message);
      throw new BadRequestException(`Invalid varian format. JSON error: ${error.message}`);
    }
  }
  let fileIndex = 0;
  const mappedVarian = varian.map(v => {
    let imageUrl = '';
    if (files[fileIndex]) {
      imageUrl = files[fileIndex].path;
    }
    for (let i = 0; i < (v.imagesCount || 1); i++) {
      fileIndex++;
    }
    
    return {
      ...v, 
      images: imageUrl // Single string to match schema
    };
  });

  // Use the parsed 'varian' instead of 'createProductDto.varian'
  const totalProduct = varian.reduce((sum, v) => sum + v.quantity, 0);
  
  if (totalProduct > createProductDto.stock) {
    throw new BadRequestException('Sản phẩm bạn thêm lớn hơn tổng sản phẩm.');
  }
  
  // Safe JSON parsing for specs
  let specs;
  try {
    if (typeof createProductDto.specs === 'string') {
      specs = JSON.parse(createProductDto.specs);
    } else {
      specs = createProductDto.specs;
    }
  } catch (error) {
    console.error('JSON parse error for specs:', error.message);
    throw new BadRequestException('Invalid specs format. Please check your JSON data.');
  }

  const productData = {
    ...createProductDto,
    varian: mappedVarian,
    stock: totalProduct,
    specs: specs,
  };
  
  return this.model.create(productData);
}

async  findAll(page: number, limit : number, filters: any) {
  const skip = (page -1) * limit;
  const query : any = {};
  if (filters.name) {
    query.name =  {$regex: filters.name, $options: 'i'}
  }
   if (filters.color) {
    query['varian.color'] = {$regex: filters.color, $options: 'i'}
  }
   if (filters.storage) {
    query.storage = {$regex: filters.storage, $options: 'i'}
  }
     const pipeline : PipelineStage[]= [
       {$match: query},
       {$addFields: {minPrice: {$min: "$varian.price"}, maxPrice: {$max: "$varian.price"}}},
       {$sort : filters.sort ==='asc' ? {minPrice: 1} : {maxPrice : -1}},
        {$skip:skip},
        {$limit: limit}
      ];
      const data = await this.model.aggregate(pipeline);
      const total = await this.model.countDocuments(query);
     return {
       data,
       total,
       currentPage: page,
       totalPages: Math.ceil(total/limit)
     }
  }

 async category(q: string){
   const search = await this.model.findOne( {
    $text: {$search: q}
  }).lean().exec();
  return search;


 }

async  update(productId: string, color: string, quantity: number) {
     const productExisted = await this.model.findById(productId);
     if (!productExisted) throw new BadRequestException('Product not found!');
     const variant = productExisted.varian.find(v => v.color === color);
     if(!variant) throw new BadRequestException('Variant not found')
      variant.quantity += quantity;
    productExisted.stock = productExisted.varian.reduce((sum, v) => sum + v.quantity, 0)
   await productExisted.save();
    return productExisted;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }

  findDrescription(id: string){
    return this.model.findOne({_id: new Types.ObjectId(id)})
  }
}
