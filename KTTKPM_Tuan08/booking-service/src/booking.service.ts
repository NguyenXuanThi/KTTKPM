import { Injectable, Inject } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ClientProxy } from "@nestjs/microservices";
import { Booking } from "./schemas/booking.schema";

interface BookingCreatedEvent {
  bookingId: string;
  userId: string;
  movieId: string;
  movieTitle: string;
  seats: number;
  totalPrice: number;
  userEmail: string;
  timestamp: string;
}

@Injectable()
export class BookingService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<Booking>,
    @Inject("RABBITMQ_SERVICE") private readonly client: ClientProxy,
  ) {}

  async createBooking(
    userId: string,
    movieId: string,
    movieTitle: string,
    seats: number,
    price: number,
    userEmail: string,
  ) {
    const booking = await this.bookingModel.create({
      userId,
      movieId,
      movieTitle,
      seats,
      totalPrice: price * seats,
      status: "PENDING",
      userEmail,
    });

    const event: BookingCreatedEvent = {
      bookingId: String(booking._id),
      userId: booking.userId,
      movieId: booking.movieId,
      movieTitle: booking.movieTitle,
      seats: booking.seats,
      totalPrice: booking.totalPrice,
      userEmail,
      timestamp: new Date().toISOString(),
    };

    // Publish event BOOKING_CREATED -> Payment Service sẽ consume
    this.client.emit("BOOKING_CREATED", event);
    console.log(`[Booking Service] Published BOOKING_CREATED: ${booking._id}`);

    return booking;
  }

  async updateBookingPaymentLink(bookingId: string, paymentLink: string) {
    return this.bookingModel.findByIdAndUpdate(
      bookingId,
      { paymentLink },
      { new: true },
    );
  }

  async updateStatus(bookingId: string, status: "CONFIRMED" | "FAILED") {
    const booking = await this.bookingModel.findByIdAndUpdate(
      bookingId,
      { status },
      { new: true },
    );
    if (booking) {
      console.log(
        `[Booking Service] Booking ${bookingId} updated to ${status}`,
      );
    }
    return booking;
  }

  async getAll() {
    return this.bookingModel.find().sort({ createdAt: -1 });
  }

  async getByUserId(userId: string) {
    return this.bookingModel.find({ userId }).sort({ createdAt: -1 });
  }

  async getById(id: string) {
    return this.bookingModel.findById(id);
  }
}
