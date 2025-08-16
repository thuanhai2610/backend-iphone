import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Specs {
  @Prop({ required: true })
  screen: string;

  @Prop({ required: true })
  chip: string;

  @Prop({ required: true })
  ram: string;

  @Prop({ required: true })
  battery: string;

  @Prop({ required: true })
  camera: string;
}

export const SpecsSchema = SchemaFactory.createForClass(Specs);
