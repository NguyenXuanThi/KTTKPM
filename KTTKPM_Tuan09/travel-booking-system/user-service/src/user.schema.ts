import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  name: string;

  @Prop()
  email: string;

  @Prop({ default: 1000 })
  balance: number;

  @Prop({ type: [{ id: String, message: String, date: Date, read: Boolean }], default: [] })
  notifications: Array<{ id: string, message: string, date: Date, read: boolean }>;
}

export const UserSchema = SchemaFactory.createForClass(User);
