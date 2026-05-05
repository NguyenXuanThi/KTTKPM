import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import * as dotenv from "dotenv";

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  const rmqUrl = `amqp://${process.env.RABBITMQ_USER || "admin"}:${process.env.RABBITMQ_PASS || "admin123"}@${process.env.RABBITMQ_HOST || "localhost"}:${process.env.RABBITMQ_PORT || "5672"}`;

  // Consume from notification_queue
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rmqUrl],
      queue: "notification_queue",
      queueOptions: { durable: true },
    },
  });

  await app.startAllMicroservices();
  const port = process.env.NOTIFICATION_SERVICE_PORT || 8085;
  await app.listen(port);
  console.log(`[Notification Service] Running on port ${port}`);
}
bootstrap();
