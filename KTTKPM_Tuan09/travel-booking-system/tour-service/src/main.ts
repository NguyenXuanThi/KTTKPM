import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 8082;
  const host = configService.get<string>('HOST') || '0.0.0.0';
  await app.listen(port, host);
  console.log('tour-service is running on: ' + host + ':' + port);
}
bootstrap();
