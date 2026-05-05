import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TourDocument = Tour & Document;

@Schema({ timestamps: true })
export class Tour {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  price: number;

  @Prop()
  description: string;
}

export const TourSchema = SchemaFactory.createForClass(Tour);
