package com.example.paymentservice.model;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class Payment {
    private String id;
    private String orderId;
    private String method; // COD | BANKING
    private String status; // SUCCESS
    private String userName; // Dùng để in ra log cho đúng đề bài
}
