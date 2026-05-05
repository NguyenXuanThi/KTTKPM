import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class Notification extends Document {
  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  bookingId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  message: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
