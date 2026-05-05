import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { User, UserSchema } from "./schemas/user.schema";

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: () => ({ uri: process.env.MONGODB_URI }),
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ClientsModule.register([
      {
        name: "RABBITMQ_SERVICE",
        transport: Transport.RMQ,
        options: {
          urls: [
            `amqp://${process.env.RABBITMQ_USER || "admin"}:${process.env.RABBITMQ_PASS || "admin123"}@${process.env.RABBITMQ_HOST || "localhost"}:${process.env.RABBITMQ_PORT || "5672"}`,
          ],
          queue: "user_queue",
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class AppModule {}
