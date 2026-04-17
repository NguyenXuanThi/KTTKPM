package com.example.paymentservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaymentEvent {
    private String bookingId;
    private String status; // Sẽ là "PAYMENT_COMPLETED" hoặc "BOOKING_FAILED"
    private String message;
}
