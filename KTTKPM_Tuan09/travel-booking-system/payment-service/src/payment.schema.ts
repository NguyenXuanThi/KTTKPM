import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PaymentDocument = Payment & Document;

@Schema({ timestamps: true })
export class Payment {
  @Prop({ required: true })
  bookingId: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  status: string;

  @Prop({ required: true })
  transactionId: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
