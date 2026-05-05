import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('tours')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getTours() {
    return this.appService.getTours();
  }

  @Get(':id')
  getTourById(@Param('id') id: string) {
    return this.appService.getTourById(id);
  }
}
