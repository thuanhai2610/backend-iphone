import { IsEmail } from "@nestjs/class-validator";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document, Mongoose, Types } from "mongoose";
export type UserDocument = User & Document
@Schema({timestamps: true})
export class User {
    @Prop({require: true}) email: string;
    @Prop({required : true}) password: string;
    @Prop() username: string;
    @Prop({default: 'user'}) role: string;
    @Prop({default: false}) isVerified: boolean;
    @Prop() phone: string;
    @Prop() address: string;
    @Prop({ default: 'https://cloudinary/defaulta-avatar.png'}) avatarUrl: string;
    @Prop({type: [{type: Types.ObjectId, ref: 'Order'}]}) orders: Types.ObjectId[];

}
export const UserSchema = SchemaFactory.createForClass(User)