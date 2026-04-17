package com.example.paymentservice.controller;

import com.example.paymentservice.dto.BookingEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
public class TestController {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @PostMapping("/booking")
    public String triggerBookingEvent(@RequestBody BookingEvent event) {
        kafkaTemplate.send("BOOKING_CREATED", event);
        return "Đã bắn event BOOKING_CREATED lên Kafka thành công! Booking ID: " + event.getBookingId();
    }
}
