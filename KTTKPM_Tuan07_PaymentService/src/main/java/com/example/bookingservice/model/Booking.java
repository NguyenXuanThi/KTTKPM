package com.example.bookingservice.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true) // Cực kỳ quan trọng: Bỏ qua các trường dư thừa (như seatNumber, status)
public class Booking {

    @JsonProperty("id") // Đọc chữ "id" từ JSON nhưng gán vào biến "bookingId"
    private Long bookingId; // Đổi sang Long cho khớp với Người 4

    private Long userId;  // Đổi sang Long
    private Long movieId; // Đổi sang Long

    @JsonProperty("totalPrice") // Đọc chữ "totalPrice" từ JSON nhưng gán vào biến "amount"
    private Double amount;
}