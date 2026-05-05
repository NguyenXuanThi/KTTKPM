import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import * as dotenv from "dotenv";

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  // Connect to RabbitMQ as consumer (listen for PAYMENT_COMPLETED / BOOKING_FAILED)
  const rmqUrl = `amqp://${process.env.RABBITMQ_USER || "admin"}:${process.env.RABBITMQ_PASS || "admin123"}@${process.env.RABBITMQ_HOST || "localhost"}:${process.env.RABBITMQ_PORT || "5672"}`;

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rmqUrl],
      queue: "booking_queue",
      queueOptions: { durable: true },
    },
  });

  await app.startAllMicroservices();
  const port = process.env.BOOKING_SERVICE_PORT || 8083;
  const host = "192.168.137.244";
  await app.listen(port, host);
  console.log(`[Booking Service] Running on port ${port}`);
}
bootstrap();
