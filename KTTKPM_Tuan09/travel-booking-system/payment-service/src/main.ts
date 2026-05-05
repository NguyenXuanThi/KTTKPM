import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 8084;
  const host = configService.get<string>('HOST') || '0.0.0.0';
  await app.listen(port, host);
  console.log('payment-service is running on: ' + host + ':' + port);
}
bootstrap();
