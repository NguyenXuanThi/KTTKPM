import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import { BookingService } from "./booking.service";

interface CreateBookingDto {
  userId: string;
  movieId: string;
  movieTitle: string;
  seats: number;
  price: number;
  userEmail: string;
}

interface PaymentCompletedEvent {
  bookingId: string;
  paymentId: string;
  userId: string;
  amount: number;
  timestamp: string;
}

interface BookingFailedEvent {
  bookingId: string;
  paymentId: string;
  userId: string;
  reason: string;
  timestamp: string;
}

interface PaymentLinkCreatedEvent {
  bookingId: string;
  paymentLink: string;
}

@Controller("api/bookings")
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  async create(@Body() body: CreateBookingDto) {
    try {
      const booking = await this.bookingService.createBooking(
        body.userId,
        body.movieId,
        body.movieTitle,
        body.seats,
        body.price,
        body.userEmail,
      );
      return {
        success: true,
        data: booking,
        message: "Booking đã tạo, đang chờ thanh toán",
      };
    } catch (error) {
      throw new HttpException((error as Error).message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  async getAll() {
    return { success: true, data: await this.bookingService.getAll() };
  }

  @Get("user/:userId")
  async getByUser(@Param("userId") userId: string) {
    return {
      success: true,
      data: await this.bookingService.getByUserId(userId),
    };
  }

  @Get(":id")
  async getById(@Param("id") id: string) {
    const booking = await this.bookingService.getById(id);
    if (!booking) {
      throw new HttpException("Booking không tồn tại", HttpStatus.NOT_FOUND);
    }
    return { success: true, data: booking };
  }

  // Consume event PAYMENT_LINK_CREATED từ Payment Service
  @EventPattern("PAYMENT_LINK_CREATED")
  async handlePaymentLinkCreated(@Payload() data: PaymentLinkCreatedEvent) {
    console.log(`[Booking Service] Received PAYMENT_LINK_CREATED:`, data);
    await this.bookingService.updateBookingPaymentLink(
      data.bookingId,
      data.paymentLink,
    );
  }

  // Consume event PAYMENT_COMPLETED từ Payment Service
  @EventPattern("PAYMENT_COMPLETED")
  async handlePaymentCompleted(@Payload() data: PaymentCompletedEvent) {
    console.log(`[Booking Service] Received PAYMENT_COMPLETED:`, data);
    await this.bookingService.updateStatus(data.bookingId, "CONFIRMED");
  }

  // Consume event BOOKING_FAILED từ Payment Service
  @EventPattern("BOOKING_FAILED")
  async handleBookingFailed(@Payload() data: BookingFailedEvent) {
    console.log(`[Booking Service] Received BOOKING_FAILED:`, data);
    await this.bookingService.updateStatus(data.bookingId, "FAILED");
  }
}
