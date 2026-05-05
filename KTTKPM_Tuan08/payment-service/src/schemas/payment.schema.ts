import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class Payment extends Document {
  @Prop({ required: true })
  bookingId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true, enum: ["PENDING", "SUCCESS", "FAILED"] })
  status: string;

  @Prop()
  paymentLink: string;

  @Prop()
  orderCode: number;

  @Prop()
  userEmail: string;

  @Prop()
  movieTitle: string;

  @Prop({ default: 0 })
  seats: number;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
