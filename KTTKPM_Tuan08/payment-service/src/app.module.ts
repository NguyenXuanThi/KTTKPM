import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { PaymentController } from "./payment.controller";
import { PaymentService } from "./payment.service";
import { Payment, PaymentSchema } from "./schemas/payment.schema";

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: () => ({ uri: process.env.MONGODB_URI }),
    }),
    MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }]),
    ClientsModule.register([
      {
        name: "BOOKING_SERVICE",
        transport: Transport.RMQ,
        options: {
          urls: [
            `amqp://${process.env.RABBITMQ_USER || "admin"}:${process.env.RABBITMQ_PASS || "admin123"}@${process.env.RABBITMQ_HOST || "localhost"}:${process.env.RABBITMQ_PORT || "5672"}`,
          ],
          queue: "booking_queue",
          queueOptions: { durable: true },
        },
      },
      {
        name: "NOTIFICATION_SERVICE",
        transport: Transport.RMQ,
        options: {
          urls: [
            `amqp://${process.env.RABBITMQ_USER || "admin"}:${process.env.RABBITMQ_PASS || "admin123"}@${process.env.RABBITMQ_HOST || "localhost"}:${process.env.RABBITMQ_PORT || "5672"}`,
          ],
          queue: "notification_queue",
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class AppModule {}
