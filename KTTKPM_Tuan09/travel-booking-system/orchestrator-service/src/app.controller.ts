import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('login')
  login(@Body() body: any) {
    return this.appService.login(body);
  }

  @Post('register')
  register(@Body() body: any) {
    return this.appService.register(body);
  }

  @Get('tours')
  getTours() {
    return this.appService.getTours();
  }

  @Get('tours/:id')
  getTourById(@Param('id') id: string) {
    return this.appService.getTourById(id);
  }

  @Post('book-tour')
  bookTour(@Body('userId') userId: string, @Body('tourId') tourId: string) {
    return this.appService.bookTour(userId, tourId);
  }

  @Post('checkout-cart')
  checkoutCart(@Body() body: { userId: string, tourIds: string[] }) {
    return this.appService.checkoutCart(body.userId, body.tourIds);
  }

  @Get('users/:id/notifications')
  getNotifications(@Param('id') id: string) {
    return this.appService.getNotifications(id);
  }

  @Put('users/:id/notifications/:notifId/read')
  markNotificationRead(@Param('id') id: string, @Param('notifId') notifId: string) {
    return this.appService.markNotificationRead(id, notifId);
  }
}
