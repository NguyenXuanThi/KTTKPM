import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as dotenv from "dotenv";

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const port = process.env.MOVIE_SERVICE_PORT || 8082;
  await app.listen(port);
  console.log(`[Movie Service] Running on port ${port}`);
}
bootstrap();
