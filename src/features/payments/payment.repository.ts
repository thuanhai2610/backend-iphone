// payments/repositories/payment.repository.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Payment, PaymentDocument } from './schema/payment.schema';


@Injectable()
export class PaymentRepository {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
  ) {}

 

  async findPaymentById(paymentId: string): Promise<PaymentDocument | null> {
    const paymentObId = new Types.ObjectId(paymentId)
    return this.paymentModel.findById(paymentObId).lean().exec();
  }

  async findPaymentsByTicketId(ticketId: string): Promise<PaymentDocument[]> {
    return this.paymentModel.find({ ticketId }).exec();
  }

  async updatePaymentStatus(
    paymentId: string,
    paymentStatus,
  ): Promise<PaymentDocument | null > {
    const paymentObjectId = new Types.ObjectId(paymentId)
    return this.paymentModel
      .findOneAndUpdate(
        { paymentObjectId },
        { paymentStatus, updatedAt: new Date() },
        { new: true },
      )
      .exec();
  }
}