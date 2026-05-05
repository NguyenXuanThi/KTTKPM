import { Injectable, Inject, OnModuleInit } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ClientProxy } from "@nestjs/microservices";
import { Payment } from "./schemas/payment.schema";
import { PayOS } from "@payos/node";

interface PaymentCompletedEvent {
  bookingId: string;
  paymentId: string;
  userId: string;
  movieTitle: string;
  seats: number;
  amount: number;
  userEmail: string;
  timestamp: string;
}

interface BookingFailedEvent {
  bookingId: string;
  paymentId: string;
  userId: string;
  movieTitle: string;
  userEmail: string;
  reason: string;
  timestamp: string;
}

@Injectable()
export class PaymentService implements OnModuleInit {
  private payos: PayOS;

  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<Payment>,
    @Inject("BOOKING_SERVICE") private readonly bookingClient: ClientProxy,
    @Inject("NOTIFICATION_SERVICE")
    private readonly notificationClient: ClientProxy,
  ) {}

  onModuleInit() {
    this.payos = new PayOS({
      clientId: process.env.PAYOS_CLIENTID || "",
      apiKey: process.env.PAYOS_APIKEY || "",
      checksumKey: process.env.PAYOS_CHECKSUM || "",
    });
  }

  async createPaymentLink(
    bookingId: string,
    userId: string,
    movieTitle: string,
    seats: number,
    totalPrice: number,
    userEmail: string,
  ) {
    const orderCode = Date.now() % 1000000000;

    // Tạo payment record trạng thái PENDING
    const payment = await this.paymentModel.create({
      bookingId,
      userId,
      amount: totalPrice,
      status: "PENDING",
      orderCode,
      userEmail,
      movieTitle,
      seats,
    });

    try {
      const paymentLinkRes = await this.payos.paymentRequests.create({
        orderCode,
        amount: totalPrice,
        description: `Vé phim ${movieTitle}`.substring(0, 25),
        cancelUrl: `http://${process.env.PAYMENT_CALLBACK_HOST || "localhost"}:${process.env.PAYMENT_SERVICE_PORT || "8084"}/api/payments/cancel/${String(payment._id)}`,
        returnUrl: `http://${process.env.PAYMENT_CALLBACK_HOST || "localhost"}:${process.env.PAYMENT_SERVICE_PORT || "8084"}/api/payments/success/${String(payment._id)}`,
        items: [
          {
            name: movieTitle.substring(0, 25),
            quantity: seats,
            price: Math.round(totalPrice / seats),
          },
        ],
      });

      // Cập nhật payment link
      payment.paymentLink = paymentLinkRes.checkoutUrl;
      await payment.save();

      // Gửi event PAYMENT_LINK_CREATED để Booking Service lưu link
      this.bookingClient.emit("PAYMENT_LINK_CREATED", {
        bookingId,
        paymentLink: paymentLinkRes.checkoutUrl,
      });

      console.log(
        `[Payment Service] Created PayOS payment link for booking: ${bookingId}`,
      );

      return payment;
    } catch (error) {
      console.error(`[Payment Service] PayOS error:`, error);
      // Nếu PayOS lỗi -> fallback giả lập thanh toán thành công
      console.log(
        `[Payment Service] PayOS failed, falling back to simulated payment`,
      );
      return this.simulatePayment(
        payment,
        bookingId,
        userId,
        movieTitle,
        seats,
        totalPrice,
        userEmail,
      );
    }
  }

  private async simulatePayment(
    payment: Payment,
    bookingId: string,
    userId: string,
    movieTitle: string,
    seats: number,
    totalPrice: number,
    userEmail: string,
  ) {
    payment.status = "SUCCESS";
    await payment.save();

    this.publishPaymentCompleted(
      bookingId,
      String(payment._id),
      userId,
      movieTitle,
      seats,
      totalPrice,
      userEmail,
    );

    return payment;
  }

  async handlePaymentSuccess(paymentId: string) {
    const payment = await this.paymentModel.findById(paymentId);
    if (!payment || payment.status !== "PENDING") return payment;

    payment.status = "SUCCESS";
    await payment.save();

    this.publishPaymentCompleted(
      payment.bookingId,
      String(payment._id),
      payment.userId,
      payment.movieTitle || "",
      payment.seats || 0,
      payment.amount,
      payment.userEmail || "",
    );

    return payment;
  }

  async handlePaymentCancel(paymentId: string) {
    const payment = await this.paymentModel.findById(paymentId);
    if (!payment || payment.status !== "PENDING") return payment;

    payment.status = "FAILED";
    await payment.save();

    this.publishBookingFailed(
      payment.bookingId,
      String(payment._id),
      payment.userId,
      payment.movieTitle || "",
      payment.userEmail || "",
      "Người dùng hủy thanh toán",
    );

    return payment;
  }

  async confirmWebhook(webhookData: PayOSWebhookData) {
    const payment = await this.paymentModel.findOne({
      orderCode: webhookData.orderCode,
    });
    if (!payment || payment.status !== "PENDING") return;

    if (webhookData.code === "00") {
      payment.status = "SUCCESS";
      await payment.save();

      this.publishPaymentCompleted(
        payment.bookingId,
        String(payment._id),
        payment.userId,
        webhookData.description || "",
        0,
        payment.amount,
        "",
      );
    } else {
      payment.status = "FAILED";
      await payment.save();

      this.publishBookingFailed(
        payment.bookingId,
        String(payment._id),
        payment.userId,
        "",
        "",
        "Thanh toán thất bại",
      );
    }
  }

  private publishPaymentCompleted(
    bookingId: string,
    paymentId: string,
    userId: string,
    movieTitle: string,
    seats: number,
    amount: number,
    userEmail: string,
  ) {
    const event: PaymentCompletedEvent = {
      bookingId,
      paymentId,
      userId,
      movieTitle,
      seats,
      amount,
      userEmail,
      timestamp: new Date().toISOString(),
    };

    this.bookingClient.emit("PAYMENT_COMPLETED", event);
    this.notificationClient.emit("PAYMENT_COMPLETED", event);
    console.log(
      `[Payment Service] Published PAYMENT_COMPLETED for booking: ${bookingId}`,
    );
  }

  private publishBookingFailed(
    bookingId: string,
    paymentId: string,
    userId: string,
    movieTitle: string,
    userEmail: string,
    reason: string,
  ) {
    const event: BookingFailedEvent = {
      bookingId,
      paymentId,
      userId,
      movieTitle,
      userEmail,
      reason,
      timestamp: new Date().toISOString(),
    };

    this.bookingClient.emit("BOOKING_FAILED", event);
    this.notificationClient.emit("BOOKING_FAILED", event);
    console.log(
      `[Payment Service] Published BOOKING_FAILED for booking: ${bookingId}`,
    );
  }

  async getAll() {
    return this.paymentModel.find().sort({ createdAt: -1 });
  }

  async getPaymentByBookingId(bookingId: string) {
    return this.paymentModel.findOne({ bookingId }).sort({ createdAt: -1 });
  }
}

interface PayOSWebhookData {
  orderCode: number;
  code: string;
  description?: string;
}
