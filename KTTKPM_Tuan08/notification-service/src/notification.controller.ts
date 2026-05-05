import { Controller, Get, Param } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import { NotificationService } from "./notification.service";

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

@Controller("api/notifications")
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // Consume PAYMENT_COMPLETED -> Gửi thông báo + email đặt vé thành công
  @EventPattern("PAYMENT_COMPLETED")
  async handlePaymentCompleted(@Payload() data: PaymentCompletedEvent) {
    console.log(`[Notification Service] Received PAYMENT_COMPLETED:`, data);
    await this.notificationService.addNotification(
      "PAYMENT_COMPLETED",
      data.bookingId,
      data.userId,
      `Đặt vé thành công! Phim: ${data.movieTitle}, Số ghế: ${data.seats}, Tổng tiền: ${data.amount.toLocaleString("vi-VN")}đ`,
      data.userEmail,
    );
  }

  // Consume BOOKING_FAILED -> Gửi thông báo + email thất bại
  @EventPattern("BOOKING_FAILED")
  async handleBookingFailed(@Payload() data: BookingFailedEvent) {
    console.log(`[Notification Service] Received BOOKING_FAILED:`, data);
    await this.notificationService.addNotification(
      "BOOKING_FAILED",
      data.bookingId,
      data.userId,
      `Đặt vé thất bại! Phim: ${data.movieTitle}. Lý do: ${data.reason}`,
      data.userEmail,
    );
  }

  @Get()
  async getAll() {
    const data = await this.notificationService.getAll();
    return { success: true, data };
  }

  @Get("user/:userId")
  async getByUser(@Param("userId") userId: string) {
    const data = await this.notificationService.getByUserId(userId);
    return { success: true, data };
  }
}
