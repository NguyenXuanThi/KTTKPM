package com.example.paymentservice.service;

import com.example.paymentservice.dto.BookingEvent;
import com.example.paymentservice.dto.PaymentEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final Random random = new Random();

    // 1. Listen event BOOKING_CREATED từ người số 4
    @KafkaListener(topics = "BOOKING_CREATED", groupId = "payment-group")
    public void processPayment(BookingEvent bookingEvent) {
        log.info("Received BOOKING_CREATED event for Booking ID: {}", bookingEvent.getBookingId());

        // 2. Xử lý thanh toán: Random success/fail theo yêu cầu đề bài
        boolean isPaymentSuccessful = random.nextBoolean(); // Trả về true hoặc false ngẫu nhiên

        PaymentEvent paymentEvent = new PaymentEvent();
        paymentEvent.setBookingId(bookingEvent.getBookingId());

        try {
            // Giả lập thời gian delay khi gọi cổng thanh toán (tùy chọn)
            Thread.sleep(2000);

            if (isPaymentSuccessful) {
                paymentEvent.setStatus("PAYMENT_COMPLETED");
                paymentEvent.setMessage("Thanh toán thành công cho mã vé: " + bookingEvent.getBookingId());
                log.info("Payment SUCCESS for Booking ID: {}", bookingEvent.getBookingId());
            } else {
                paymentEvent.setStatus("BOOKING_FAILED");
                paymentEvent.setMessage("Số dư không đủ hoặc lỗi thẻ.");
                log.error("Payment FAILED for Booking ID: {}", bookingEvent.getBookingId());
            }

            // 3. Publish event kết quả ra broker
            // Notification service (và có thể cả Booking service để update trạng thái) sẽ nghe các topic này
            kafkaTemplate.send(paymentEvent.getStatus(), paymentEvent);
            log.info("Published event {} for Booking ID: {}", paymentEvent.getStatus(), paymentEvent.getBookingId());

        } catch (InterruptedException e) {
            log.error("Payment processing interrupted", e);
            Thread.currentThread().interrupt();
        }
    }

    // ==========================================
    // PHẦN 2: NOTIFICATION SERVICE
    // ==========================================

    // Lắng nghe event khi thanh toán THÀNH CÔNG
    @KafkaListener(topics = "PAYMENT_COMPLETED", groupId = "notification-group")
    public void sendSuccessNotification(PaymentEvent event) {
        System.out.println("\n==================================================");
        System.out.println("🔔 THÔNG BÁO: User A đã đặt đơn #" + event.getBookingId() + " thành công!");
        System.out.println("==================================================\n");
    }

    // Lắng nghe event khi thanh toán THẤT BẠI
    @KafkaListener(topics = "BOOKING_FAILED", groupId = "notification-group")
    public void sendFailureNotification(PaymentEvent event) {
        System.out.println("\n==================================================");
        System.out.println("🔕 THÔNG BÁO LỖI: Rất tiếc, Booking #" + event.getBookingId() + " thất bại do thanh toán không thành công.");
        System.out.println("==================================================\n");
    }
}