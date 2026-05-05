import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class Movie extends Document {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop()
  genre: string;

  @Prop()
  duration: number;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  totalSeats: number;

  @Prop({ required: true })
  availableSeats: number;

  @Prop()
  showtime: string;
}

export const MovieSchema = SchemaFactory.createForClass(Movie);
