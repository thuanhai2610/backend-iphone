import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Payment, PaymentDocument } from './schema/payment.schema';
import { OrderDocument } from '../order/schema/order.schema';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class PaymentRepository {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    private readonly mailerService: MailerService,
  ) {}

  async sendOrderToEmail(order: OrderDocument) {
    if (!order.email)
      throw new BadRequestException('Not found email in orders');
    this.sendMail(order.email, order);
  }

  // Helper method to deeply clean objects and remove prototype chains
  private cleanObject(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.cleanObject(item));
    }
    
    if (typeof obj === 'object') {
      const cleaned: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          cleaned[key] = this.cleanObject(obj[key]);
        }
      }
      return cleaned;
    }
    
    return obj;
  }

  async sendMail(to: string | undefined, orderInfo: any) {
    if (!to || !orderInfo)
      throw new InternalServerErrorException(
        'Failed to send mail. Please check again',
      );

    try {
      // Deep clean the order info to remove all prototype chains
      const cleanedOrderInfo = this.cleanObject(orderInfo.toObject ? orderInfo.toObject() : orderInfo);
      
      // Extract and structure items properly
      const items = cleanedOrderInfo.items?.map((item: any) => {
        const cleanedItem = this.cleanObject(item);
        return {
          name: cleanedItem.name || 'Unknown Product',
          color: cleanedItem.variant?.color || cleanedItem.color || 'Not specified',
          storage: cleanedItem.storage || 'Not specified',
          quantity: cleanedItem.variant?.quantity || 1,
          price: cleanedItem.totalPrice || 0,
          images: cleanedItem.variant?.images || '',
        };
      }) || [];

      const emailData = {
        fullName: cleanedOrderInfo.fullName || 'Valued Customer',
        city: cleanedOrderInfo.city || 'Viet Nam',
        district: cleanedOrderInfo.district || 'N/A',
        ward: cleanedOrderInfo.ward || 'N/A',
        shippingAddress: cleanedOrderInfo.shippingAddress || 'N/A',
        paymentMethod: cleanedOrderInfo.paymentMethod || 'N/A',
        totalPrice: cleanedOrderInfo.totalPriceInOrder || 'N/A',
        items: items,
      };
      await this.mailerService.sendMail({
        to,
        subject: 'Information about your Order',
        template: './send-order',
        context: emailData,
      });
      
      console.log(`Email sent successfully to ${to}`);
    } catch (err) {
      console.error('Failed to send mail: ', err);
      throw new InternalServerErrorException('Could not send order confirmation email');
    }
  }
}