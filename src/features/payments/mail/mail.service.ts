// src/mail/mail.service.ts
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    constructor(private readonly mailerService: MailerService) {}
    async sendTicketEmail(to: string | undefined, ticketInfo: any): Promise<void> {
        if (!to || !ticketInfo) {
          throw new InternalServerErrorException('Thông tin email hoặc vé không hợp lệ');
        }
    
        try {
          await this.mailerService.sendMail({
            to,
            subject: 'Thông tin vé của bạn',
            template: './ticket-info', // Đảm bảo file ticket-info.hbs tồn tại
            context: {
              name: ticketInfo.customerName || 'Khách hàng',
              trip: ticketInfo.trip || ticketInfo.tripDetails || 'N/A',
              seat: ticketInfo.seat || 'N/A',
              departureTime: ticketInfo.departureTime || 'N/A',
              ticketCode: ticketInfo.ticketCode || 'N/A',
              price: ticketInfo.price || 0,
            },
          });
          console.log(`Email đã được gửi tới ${to}`);
        } catch (error) {
          console.error('Lỗi khi gửi email:', error);
          throw new InternalServerErrorException('Không thể gửi email xác nhận vé');
        }
      }
}
