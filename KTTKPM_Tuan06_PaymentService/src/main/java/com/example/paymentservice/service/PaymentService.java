package com.example.paymentservice.service;

import com.example.paymentservice.client.OrderClient;
import com.example.paymentservice.model.Payment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class PaymentService {

    // 1. Thêm chữ "final" và xóa @Autowired đi
    private final OrderClient orderClient;

    // 2. Tạo Constructor để Spring tự động Inject vào
    public PaymentService(OrderClient orderClient) {
        this.orderClient = orderClient;
    }

    public Payment processPayment(Payment payment) {

        payment.setId(UUID.randomUUID().toString());
        payment.setStatus("SUCCESS");


        orderClient.updateOrderStatus(payment.getOrderId(), "PAID");


        sendNotification(payment.getUserName(), payment.getOrderId());

        return payment;
    }

    private void sendNotification(String userName, String orderId) {
        System.out.println("----------------------------------------------");
        System.out.println("NOTIFICATION: User " + userName + " đã đặt đơn #" + orderId + " thành công");
        System.out.println("----------------------------------------------");
    }
}
