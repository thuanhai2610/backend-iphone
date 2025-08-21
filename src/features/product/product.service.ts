import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { Model, PipelineStage, Types } from 'mongoose';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(@InjectModel(Product.name) private readonly model:Model<ProductDocument>,
){}


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



  findDrescription(id: string){
    return this.model.findByIdAndUpdate({_id: new Types.ObjectId(id)} )
  }
}
