import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BookingDocument = Booking & Document;

@Schema({ timestamps: true })
export class Booking {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  tourId: string;

  @Prop({ default: 'CREATED' })
  status: string;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
