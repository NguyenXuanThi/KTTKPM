import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class Booking extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  movieId: string;

  @Prop({ required: true })
  movieTitle: string;

  @Prop({ required: true })
  seats: number;

  @Prop({ required: true })
  totalPrice: number;

  @Prop({ default: "PENDING", enum: ["PENDING", "CONFIRMED", "FAILED"] })
  status: string;

  @Prop()
  userEmail: string;

  @Prop()
  paymentLink: string;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
