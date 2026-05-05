import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Notification } from "./schemas/notification.schema";
import { BrevoClient } from "@getbrevo/brevo";

@Injectable()
export class NotificationService implements OnModuleInit {
  private brevoClient: BrevoClient;
  private senderEmail: string;
  private senderName: string;

  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
  ) {}

  onModuleInit() {
    this.brevoClient = new BrevoClient({
      apiKey: process.env.BREVO_API_KEY || "",
    });
    this.senderEmail = process.env.BREVO_SENDER_EMAIL || "noreply@example.com";
    this.senderName = process.env.BREVO_SENDER_NAME || "Movie Ticket";
  }

  async addNotification(
    type: string,
    bookingId: string,
    userId: string,
    message: string,
    userEmail?: string,
  ) {
    const notification = await this.notificationModel.create({
      type,
      bookingId,
      userId,
      message,
    });
    console.log(`[Notification Service] ${message}`);

    // Gửi email nếu có userEmail
    if (userEmail) {
      await this.sendEmail(
        userEmail,
        type === "PAYMENT_COMPLETED"
          ? "Đặt vé xem phim thành công!"
          : "Đặt vé xem phim thất bại",
        message,
      );
    }

    return notification;
  }

  private async sendEmail(to: string, subject: string, content: string) {
    try {
      await this.brevoClient.transactionalEmails.sendTransacEmail({
        sender: {
          email: this.senderEmail,
          name: this.senderName,
        },
        to: [{ email: to }],
        subject,
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333;">${subject}</h2>
            <p style="font-size: 16px; color: #555;">${content}</p>
            <hr style="border: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #999;">Email được gửi tự động từ hệ thống đặt vé xem phim.</p>
          </div>
        `,
      });
      console.log(`[Notification Service] Email sent to ${to}`);
    } catch (error) {
      console.error(
        `[Notification Service] Failed to send email to ${to}:`,
        (error as Error).message,
      );
    }
  }

  async getAll() {
    return this.notificationModel.find().sort({ createdAt: -1 });
  }

  async getByUserId(userId: string) {
    return this.notificationModel.find({ userId }).sort({ createdAt: -1 });
  }
}
