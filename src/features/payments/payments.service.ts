import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Payment, PaymentDocument } from './schema/payment.schema';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from '../order/schema/order.schema';
import { Cart, CartDocument } from '../cart/schemas/cart.schema';
import { Product, ProductDocument } from '../product/schemas/product.schema';
import { PaymentStatus } from './enums/payment-status.enum';
import { StatusOrder } from '../order/enums/status-order.enum';
import { PaymentMethod } from '../order/enums/payment.enum';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import * as querystring from 'querystring';
import * as crypto from 'crypto';
import { PaymentRepository } from './payment.repository';
import storage from 'src/stores/cloudinary-store';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Cart.name) private readonly cartModel: Model<CartDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly paymentRepository: PaymentRepository,
  ) {}
 
  findAll() {
    return `This action returns all payments`;
  }

  findOne(id: number) {
    return `This action returns a #${id} payment`;
  }

  update(id: number, updatePaymentDto: UpdatePaymentDto) {
    return `This action updates a #${id} payment`;
  }

  remove(id: number) {
    return `This action removes a #${id} payment`;
  }
  private formatDate(date: Date): string {
    return date
      .toISOString()
      .replace(/[^0-9]/g, '')
      .slice(0, 14);
  }
  private sortObject(obj: any): any {
    const sorted: any = {};
    Object.keys(obj)
      .sort()
      .forEach((key) => {
        sorted[key] = obj[key];
      });
    return sorted;
  }
  async handleVnpayReturn(query: any): Promise<any> {
    const hashSecret = process.env.VNPAY_HASH_SECRET;
    const vnpParams = { ...query };
    const secureHash = vnpParams['vnp_SecureHash'];

    delete vnpParams['vnp_SecureHash'];
    delete vnpParams['vnp_SecureHashType'];

    const sortedParams = this.sortObject(vnpParams);
    const signData = querystring.stringify(sortedParams);
    const hmac = crypto.createHmac('sha512', hashSecret!);
    const calculatedHash = hmac.update(signData).digest('hex');

    if (secureHash !== calculatedHash) {
      throw new Error('Invalid VNPay signature');
    }

    const paymentId = vnpParams['vnp_TxnRef'];
    const payment = await this.paymentModel.findById(paymentId);

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${paymentId} not found`);
    }
 const order = await this.orderModel.findById(payment.orderId);
  if (!order) throw new NotFoundException(`Order ${payment.orderId} not found`);

  const cart = await this.cartModel.findOne({ userId: order.userOrderId });
  if (!cart) throw new NotFoundException('Cart not found!');
    if (vnpParams['vnp_ResponseCode'] === '00') {
      const totalAmount = payment.amount;
      await this.paymentModel.findByIdAndUpdate(
        paymentId,
        {status: PaymentStatus.Completed},
        
      );
     await this.reduceStock(cart);
     await this.cartModel.updateOne(
      { userId: order.userOrderId },
      { $set: { items: [], totalPriceInCart: 0 } },
    );
     await this.orderModel.findByIdAndUpdate(
        payment.orderId,
        {status: StatusOrder.Shipped},
        
      );
       return { status: 'Completed', paymentId, amount: totalAmount };

    } else {
      await this.paymentModel.findByIdAndUpdate(
        paymentId,
      { status: PaymentStatus.Failed}
      );
        await this.orderModel.findByIdAndUpdate(
        payment.orderId,
        {status: StatusOrder.Cancelled},
        
      );
      return { status: 'Failed', message: vnpParams['vnp_ResponseCode'] };
    }
  }

  async validateCart(userObject: Types.ObjectId, cart: CartDocument){
    const cartEx = await this.cartModel.findOne({userId: userObject})
    if (!cartEx) throw new BadRequestException('Cart not found in validate Cart')
    if(!cart || cart.items.length ===0) 
      throw new BadRequestException('Cart not found!...');
    for(const item of cart.items){
      const product = await this.productModel.findById(item.product);
      if(!product) throw new BadRequestException('Product not found!');
      const variant = product.varian.find(
        (v) => v.color === item.variant.color,
      );
      if (!variant) throw new BadRequestException('Variant not found!');
      if (variant.quantity < item.variant.quantity) throw new BadRequestException(`Product ${item.product} not enough in stock!`)
    }
  }
  async reduceStock(cart: CartDocument){
    for(const item of cart.items){
      const product = await this.productModel.findById(item.product);
      if(!product) throw new BadRequestException('Product not found!');
      const variant = product.varian.find(v => v.color === item.variant.color);
      if(!variant) throw new BadRequestException('Variant not found!');
      variant.quantity -= item.variant.quantity;
      product.stock = product.varian.reduce((sum, v) => sum + v.quantity, 0);
          await this.cartModel.findOneAndUpdate(
      { userId: cart.userId },
      { $set: { items: [], totalPriceInCart: 0 } },
    );
      await product.save();
    }
  }

  async createOrderPayment(userId: Types.ObjectId,
  cart: CartDocument,
  createPaymentDto: CreatePaymentDto,
  paymentStatus: PaymentStatus,
  orderStatus: StatusOrder){
      const user = await this.userModel.findOne({_id: userId });
    const order = await this.orderModel.create({
      userOrderId : userId,
      items: cart.items.map((i) => ({
        product: i.product,
        variant: i.variant,
        name: i.name,
        storage: i.storage,
        totalPrice: i.totalPrice,
      })),
      totalPriceInOrder: cart.totalPriceInCart,
      status: orderStatus,
      paymentMethod: createPaymentDto.method,
      fullName: user?.fullName,
      city: user?.city,
      district: user?.district,
      ward: user?.ward,
      shippingAddress: user?.address,
    });
     const payment = await this.paymentModel.create({
    orderId: order._id,
    order: order,
    method: createPaymentDto.method,
    amount: createPaymentDto.amount,
    status: paymentStatus,
    transactionId: new Date().toISOString().replace(/[T:\.Z]/g, ''),
    paidAt: paymentStatus === PaymentStatus.Completed ? new Date() : null,
  });

  return { order, payment };
  };
  
  generateVnPayUrl(payment: PaymentDocument) {
  const vnpayUrl = process.env.VNPAY_URL;
  const tmnCode = process.env.VNPAY_TMN_CODE;
  const hashSecret = process.env.VNPAY_HASH_SECRET;
  const returnUrl = process.env.RETURN_URL;
    const paymentId = (payment._id as Types.ObjectId).toString();

  const vnpParams: any = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: tmnCode,
    vnp_Amount: payment.amount * 100,
    vnp_CurrCode: 'VND',
    vnp_TxnRef: paymentId,
    vnp_OrderInfo: `Thanhtoan${payment._id}`,
    vnp_OrderType: '250000',
    vnp_Locale: 'vn',
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: '127.0.0.1',
    vnp_CreateDate: this.formatDate(new Date()),
  };

  const sortedParams = this.sortObject(vnpParams);
  const signData = querystring.stringify(sortedParams);
  const hmac = crypto.createHmac('sha512', hashSecret!);
  const secureHash = hmac.update(signData).digest('hex');
  vnpParams['vnp_SecureHash'] = secureHash;

  return `${vnpayUrl}?${querystring.stringify(vnpParams)}`;
}
  async createRfa(userId: string, createPaymentDto: CreatePaymentDto){
  const userObjectId = new Types.ObjectId(userId);
  const cart = await this.cartModel.findOne({ userId: userObjectId });
  console.log(userObjectId, cart);
  
  if (!cart) {
  throw new BadRequestException('Cart not found!');
}
    const user = await this.userModel.findOne({ _id: userObjectId });
  if(!user) throw new BadRequestException('User not found!')
   await this.validateCart(userObjectId, cart);
   let paymentStatus: PaymentStatus;
  let orderStatus: StatusOrder;
  if (createPaymentDto.method === PaymentMethod.COD) {
    paymentStatus = PaymentStatus.Completed;
    orderStatus = StatusOrder.Shipped;
    await this.reduceStock(cart);
  } else if (createPaymentDto.method === PaymentMethod.VN_PAY) {
    paymentStatus = PaymentStatus.Pending;
    orderStatus = StatusOrder.Pending;
  } else {
    throw new BadRequestException('Payment Method invalid');
  }

  if (createPaymentDto.amount !== cart.totalPriceInCart) {
    throw new BadRequestException('Amount dont match price!');
  }

  const { order, payment } = await this.createOrderPayment(
    userObjectId,
    cart,
    createPaymentDto,
    paymentStatus,
    orderStatus,
  );

  if (createPaymentDto.method === PaymentMethod.VN_PAY) {
    const paymentUrl = await this.generateVnPayUrl(payment);
    payment.paymentUrl = paymentUrl;
    orderStatus = StatusOrder.Shipped;

    await payment.save();
  }

  return { order, payment };
  }
}
