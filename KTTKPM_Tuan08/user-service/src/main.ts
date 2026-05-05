import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as dotenv from "dotenv";

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const port = process.env.USER_SERVICE_PORT || 8081;
  const host = "192.168.137.244";
  await app.listen(port, host);
  console.log(`[User Service] Running on port ${port}`);
}
bootstrap();
