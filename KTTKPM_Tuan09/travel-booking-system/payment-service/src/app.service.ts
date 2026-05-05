import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment, PaymentDocument } from './payment.schema';

@Injectable()
export class AppService {
  constructor(@InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>) {}

  async processPayment(bookingId: string, amount: number): Promise<any> {
    const isSuccess = Math.random() < 0.8;
    const transactionId = 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    
    const payment = new this.paymentModel({
      bookingId,
      amount,
      status: isSuccess ? 'SUCCESS' : 'FAILED',
      transactionId
    });
    
    await payment.save();

    if (isSuccess) {
      return { success: true, message: 'Payment successful', transactionId };
    } else {
      return { success: false, message: 'Insufficient funds or gateway error', transactionId };
    }
  }
}
