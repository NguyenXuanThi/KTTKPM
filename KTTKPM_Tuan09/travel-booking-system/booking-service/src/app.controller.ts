import { Body, Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('bookings')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post()
  createBooking(@Body('userId') userId: string, @Body('tourId') tourId: string) {
    return this.appService.createBooking(userId, tourId);
  }
}
