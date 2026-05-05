import { Body, Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('payments')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post()
  processPayment(@Body('bookingId') bookingId: string, @Body('amount') amount: number) {
    return this.appService.processPayment(bookingId, amount);
  }
}
