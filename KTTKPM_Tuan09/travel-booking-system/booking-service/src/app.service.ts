import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Booking, BookingDocument } from './booking.schema';

@Injectable()
export class AppService {
  constructor(@InjectModel(Booking.name) private bookingModel: Model<BookingDocument>) {}

  async createBooking(userId: string, tourId: string): Promise<any> {
    const booking = new this.bookingModel({
      userId,
      tourId,
      status: 'CREATED'
    });
    
    await booking.save();
    const b = booking.toObject() as any;
    return { success: true, data: { id: b._id.toString(), userId, tourId, status: b.status, createdAt: b.createdAt } };
  }
}
