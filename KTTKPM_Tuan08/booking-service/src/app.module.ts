import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { BookingController } from "./booking.controller";
import { GatewayController } from "./gateway.controller";
import { BookingService } from "./booking.service";
import { Booking, BookingSchema } from "./schemas/booking.schema";

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: () => ({ uri: process.env.MONGODB_URI }),
    }),
    MongooseModule.forFeature([{ name: Booking.name, schema: BookingSchema }]),
    ClientsModule.register([
      {
        name: "RABBITMQ_SERVICE",
        transport: Transport.RMQ,
        options: {
          urls: [
            `amqp://${process.env.RABBITMQ_USER || "admin"}:${process.env.RABBITMQ_PASS || "admin123"}@${process.env.RABBITMQ_HOST || "localhost"}:${process.env.RABBITMQ_PORT || "5672"}`,
          ],
          queue: "payment_queue",
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  controllers: [BookingController, GatewayController],
  providers: [BookingService],
})
export class AppModule {}
