import { Controller, Get, Post, Param, Body, Res } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import { PaymentService } from "./payment.service";
import { Response } from "express";

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

interface PayOSWebhookBody {
  code: string;
  desc: string;
  data: {
    orderCode: number;
    amount: number;
    description: string;
    code: string;
  };
  signature: string;
}

@Controller("api/payments")
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  // Consume event BOOKING_CREATED từ Booking Service -> Tạo payment link PayOS
  @EventPattern("BOOKING_CREATED")
  async handleBookingCreated(@Payload() data: BookingCreatedEvent) {
    console.log(`[Payment Service] Received BOOKING_CREATED:`, data);
    console.log(
      `[Payment Service] Creating PayOS payment link for booking: ${data.bookingId}...`,
    );

    const payment = await this.paymentService.createPaymentLink(
      data.bookingId,
      data.userId,
      data.movieTitle,
      data.seats,
      data.totalPrice,
      data.userEmail,
    );
    console.log(
      `[Payment Service] Payment status: ${payment.status} for booking: ${data.bookingId}`,
    );
  }

  // PayOS callback khi thanh toán thành công
  @Get("success/:paymentId")
  async handleSuccess(
    @Param("paymentId") paymentId: string,
    @Res() res: Response,
  ) {
    console.log(`[Payment Service] Payment success callback: ${paymentId}`);
    await this.paymentService.handlePaymentSuccess(paymentId);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(
      `${frontendUrl}/payment-result?status=success&paymentId=${paymentId}`,
    );
  }

  // PayOS callback khi hủy thanh toán
  @Get("cancel/:paymentId")
  async handleCancel(
    @Param("paymentId") paymentId: string,
    @Res() res: Response,
  ) {
    console.log(`[Payment Service] Payment cancel callback: ${paymentId}`);
    await this.paymentService.handlePaymentCancel(paymentId);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(
      `${frontendUrl}/payment-result?status=cancel&paymentId=${paymentId}`,
    );
  }

  // PayOS Webhook
  @Post("webhook")
  async handleWebhook(@Body() body: PayOSWebhookBody) {
    console.log(`[Payment Service] PayOS Webhook received:`, body);
    if (body.data) {
      await this.paymentService.confirmWebhook({
        orderCode: body.data.orderCode,
        code: body.data.code || body.code,
        description: body.data.description,
      });
    }
    return { success: true };
  }

  @Get()
  async getAll() {
    const data = await this.paymentService.getAll();
    return { success: true, data };
  }

  @Get("booking/:bookingId")
  async getByBookingId(@Param("bookingId") bookingId: string) {
    const payment = await this.paymentService.getPaymentByBookingId(bookingId);
    if (!payment) {
      return { success: false, data: null };
    }
    return { success: true, data: payment };
  }
}
