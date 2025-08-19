import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateCartDto } from './dto/update-cart.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Cart, CartDocument } from './schemas/cart.schema';
import { Model, Types } from 'mongoose';
import { AddCartItemDto } from './dto/addItem.dto';
import { Product, ProductDocument } from '../product/schemas/product.schema';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private readonly model: Model<CartDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}
  async create(userId: string, addItemDto: AddCartItemDto) {
    const userObjectId = new Types.ObjectId(userId);
    let cart = await this.model.findOne({ userId: userObjectId });
    const productObjectId = new Types.ObjectId(addItemDto.productId);
    const product = await this.productModel.findById(productObjectId);
    if (!cart) {
      cart = new this.model({
        userId: userObjectId,
        items: [],
        totalPriceInCart: 0,
      });
    }

    if (!product) {
      throw new BadRequestException('Product not found!');
    }
    const variantInfo = product.varian.find(
      (item) => item.color === addItemDto.variant.color,
    );
    if (!variantInfo) {
      throw new BadRequestException('Variant not found!');
    }
    const price = variantInfo.price || 0;
    const quantity = addItemDto.variant.quantity || 0;
    const totalPrice = price * quantity;

    const itemIndex = cart.items.findIndex(
      (item) =>
        item.product.equals(addItemDto.productId) &&
        item.variant.color === addItemDto.variant.color,
    );
    if (itemIndex > -1) {
      const currentQuantity = cart.items[itemIndex].variant.quantity;
      if (currentQuantity + quantity > variantInfo.quantity) {
        throw new BadRequestException(
          `So luong vuot qua hang ton! Chi con ${variantInfo.quantity}`,
        );
      }
      cart.items[itemIndex].variant.quantity = currentQuantity + quantity;
      cart.items[itemIndex].totalPrice =
        variantInfo.price * cart.items[itemIndex].variant.quantity;
    } else {
      if (quantity > variantInfo.quantity) {
        throw new BadRequestException(
          `So luong vuot qua hang ton! Chi con ${variantInfo.quantity}`,
        );
      }
      cart.items.push({
        product: productObjectId,
        variant: {
          _id: variantInfo._id,
          color: variantInfo.color,
          price: price,
          quantity: quantity,
          images: variantInfo.images,
        },
        totalPrice: totalPrice,
        name: product.name,
        storage: product.storage,
      });
    }
    cart.totalPriceInCart = cart.items.reduce(
      (sum, item) => sum + item.totalPrice,
      0,
    );
    return cart.save();
  }

  async getCart(userId: string) {
    const userObjectId = new Types.ObjectId(userId);
    let cartExisted = await this.model.findOne({ userId: userObjectId });
    if (!cartExisted) {
      cartExisted = await this.model.create({
        userId: userObjectId,
        items: [],
        totalPriceInCart: 0,
      });
    }
    for (let i = cartExisted.items.length - 1; i >= 0; i--) {
      const item = cartExisted.items[i];
      if (!item?.product) {
        cartExisted.items.splice(i, 1);
        continue;
      }
      const product = await this.productModel.findById(item.product);
      if (!product) {
        cartExisted.items.splice(i, 1);
        continue;
      }
      const variant = product.varian.find(
        (v) => v.color === item.variant.color,
      );
      if (!variant || product.stock <= 0) {
        cartExisted.items.splice(i, 1);
        continue;
      }
      if (variant.quantity < item.variant.quantity) {
        cartExisted.items.splice(i, 1);
        continue;
      }
      item.totalPrice = variant.price * item.variant.quantity;
      item.name = product.name;
      item.storage = product.storage;
      cartExisted.totalPriceInCart = cartExisted.items.reduce(
        (sum, item) => sum + item.totalPrice,
        0,
      );
    }
    await cartExisted.save();
    return cartExisted;
  }

  findOne(id: number) {
    return `This action returns a #${id} cart`;
  }

  update(id: number, updateCartDto: UpdateCartDto) {
    return `This action updates a #${id} cart`;
  }

  async removeFromCart(userId: string, itemId: string) {
    const userObjectId = new Types.ObjectId(userId);
    const cart = await this.model.findOne({ userId: userObjectId });
    if (!cart) throw new BadRequestException('Cart not found');

    const result = await this.model.updateOne(
      { userId: userObjectId },
      { $pull: { items: { _id: new Types.ObjectId(itemId) } } },
    );
    cart.totalPriceInCart = cart.items.reduce(
      (sum, item) => sum + item.totalPrice,
      0,
    );
    return cart.save();
  }

  async createCart(userId: string, addItem: AddCartItemDto) {
    const userObjectId = new Types.ObjectId(userId);
    let cart = await this.model.findOne({ userId: userObjectId });
    if (!cart) {
      cart = new this.model({
        userId: userObjectId,
        items: [],
        totalPriceInCart: 0,
      });
    }
    const productObjectId = new Types.ObjectId(addItem.productId);
    const product = await this.productModel.findById(productObjectId);
    if (!product) {
      throw new BadRequestException('Product not found.');
    }
    const variantInfo = product.varian.find(
      (item) => item.color === addItem.variant.color,
    );
    if (!variantInfo) {
      throw new BadRequestException('Variant not found');
    }
    const price = variantInfo.price || 0;
    const quantity = addItem.variant.quantity || 0;
    const totalPrice = price * quantity;

    const itemIndex = cart.items.findIndex(
      (item) =>
        item.product.equals(addItem.productId) &&
        item.variant.color === addItem.variant.color,
    );
    if (itemIndex > -1) {
      const currentQuantity = cart.items[itemIndex].variant.quantity;
      if (currentQuantity + quantity > variantInfo.quantity) {
        throw new BadRequestException(
          `Số lượng vượt quá hàng tồn! Chỉ còn ${variantInfo.quantity} sản phẩm`,
        );
      }
      cart.items[itemIndex].variant.quantity = currentQuantity + quantity;
      cart.items[itemIndex].totalPrice =
        price * cart.items[itemIndex].variant.quantity;
    } else {
      if (quantity > variantInfo.quantity) {
        throw new BadRequestException(
          `Số lượng vượt quá hàng tồn! Chỉ còn ${variantInfo.quantity} sản phẩm`,
        );
      }
      cart.items.push({
        product: productObjectId,
        variant: {
          _id: variantInfo._id,
          color: variantInfo.color,
          quantity: quantity,
          images: variantInfo.images,
          price: price,
        },
        totalPrice: totalPrice,
        name: product.name,
        storage: product.storage,
      });
    }
    cart.totalPriceInCart = cart.items.reduce(
      (sum, item) => sum + item.totalPrice,
      0,
    );
    return cart.save();
  }

  async updateItemQuantity(
    userId: string,
    productId: string,
    variantId: string,
    action: 'increment' | 'decrement',
  ) {
    const userObject = new Types.ObjectId(userId);
    const productObId = new Types.ObjectId(productId);
    const variantOb = new Types.ObjectId(variantId);
    const cartUser = await this.model.findOne({ userId: userObject });
    if (!cartUser) throw new BadRequestException('Cart not found!');
    const itemByProduct = cartUser.items.find((i) =>
      i.product.equals(productObId),
    );
    const itemByColor = cartUser.items.find(
      (i) => i.product.equals(productObId) && i.variant.color === variantId,
    );
    const itemByVariantId = cartUser.items.find(
      (i) => i.product.equals(productObId) && i.variant._id.equals(variantOb),
    );
    const item = itemByVariantId || itemByColor || itemByProduct;

    if (!item) {
      throw new BadRequestException('Item not found!');
    }
    const product = await this.productModel.findById(productObId);
    if (!product) throw new BadRequestException('Product not found!');
    const variantInfo = product.varian.find((v) =>
      v._id.equals(item.variant._id),
    );
    if (!variantInfo) throw new BadRequestException('variantInfo not found!');

    if (action === 'increment') {
      if (item.variant.quantity + 1 > variantInfo.quantity) {
        throw new BadRequestException(
          `Số lượng vượt quá hàng tồn! Chỉ còn ${variantInfo.quantity} sản phẩm`,
        );
      }
      item.variant.quantity += 1;
    } else if (action === 'decrement') {
      item.variant.quantity = Math.max(item.variant.quantity - 1, 1);
    }
    item.totalPrice = item.variant.price * item.variant.quantity;
    cartUser.totalPriceInCart = cartUser.items.reduce(
      (sum, i) => sum + i.totalPrice,
      0,
    );

    await cartUser.save();
    return cartUser;
  }

}
