import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('users')
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Post('login')
  login(@Body() body: any) {
    return this.appService.login(body.username, body.password);
  }

  @Post('register')
  register(@Body() body: any) {
    return this.appService.register(body);
  }

  @Get(':id')
  getUser(@Param('id') id: string) {
    return this.appService.getUser(id);
  }

  @Post(':id/deduct')
  deductBalance(@Param('id') id: string, @Body('amount') amount: number) {
    return this.appService.deductBalance(id, amount);
  }

  @Post(':id/notifications')
  addNotification(@Param('id') id: string, @Body('message') message: string) {
    return this.appService.addNotification(id, message);
  }

  @Put(':id/notifications/:notifId/read')
  markNotificationRead(@Param('id') id: string, @Param('notifId') notifId: string) {
    return this.appService.markNotificationRead(id, notifId);
  }
}
