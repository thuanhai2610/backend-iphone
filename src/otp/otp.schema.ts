import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from 'mongoose';
export type OtpDocument = Otp & Document;
@Schema()
export class Otp {
    @Prop({required: true})
    email: string;

    @Prop({required: true})
    code: string;

    @Prop({required: true, index : {expires: 0}} )
    expiresAt: Date;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);