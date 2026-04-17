package com.example.paymentservice.dto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
public class BookingEvent {
    private String bookingId;
    private String userId;
    private String movieId;
    private Double amount;
}