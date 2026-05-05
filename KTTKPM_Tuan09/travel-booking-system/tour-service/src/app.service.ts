import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tour, TourDocument } from './tour.schema';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(@InjectModel(Tour.name) private tourModel: Model<TourDocument>) {}

  async onModuleInit() {
    const count = await this.tourModel.countDocuments();
    if (count === 0) {
      await this.tourModel.insertMany([
        { name: 'Ha Long Bay', price: 1500, description: '2 Days 1 Night in Ha Long Bay' },
        { name: 'Sapa Trekking', price: 1200, description: '3 Days 2 Nights Trekking in Sapa' },
        { name: 'Phu Quoc Island', price: 3000, description: '4 Days 3 Nights Relaxing' },
      ]);
      console.log('Seeded initial tours');
    }
  }

  async getTours(): Promise<any> {
    const tours = await this.tourModel.find();
    const formatted = tours.map(t => ({
      id: t._id.toString(),
      name: t.name,
      price: t.price,
      description: t.description
    }));
    return { success: true, data: formatted };
  }

  async getTourById(id: string): Promise<any> {
    try {
      const tour = await this.tourModel.findById(id);
      if (!tour) return { success: false, message: 'Tour not found' };
      return { 
        success: true, 
        data: {
          id: tour._id.toString(),
          name: tour.name,
          price: tour.price,
          description: tour.description
        } 
      };
    } catch(err) {
      return { success: false, message: 'Invalid ID format' };
    }
  }
}
