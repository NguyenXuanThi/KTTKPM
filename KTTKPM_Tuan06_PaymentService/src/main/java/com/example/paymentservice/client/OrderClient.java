package com.example.paymentservice.client;

import org.springframework.stereotype.Component;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

@Component
public class OrderClient {
    private final RestTemplate restTemplate = new RestTemplate();
    private final String ORDER_SERVICE_URL = "http://172.16.33.164:8083/orders";

    public void updateOrderStatus(String orderId, String status) {
        // 1. Xử lý trường hợp mã đơn hàng bị null hoặc rỗng
        if (orderId == null || orderId.trim().isEmpty()) {
            System.err.println("❌ LỖI: Mã đơn hàng đang bị trống (null). Không thể gửi yêu cầu sang Order Service!");
            return; // Lệnh return này sẽ bắt nó dừng ngay tại đây, không chạy xuống dưới nữa
        }

        try {
            String url = ORDER_SERVICE_URL + "/" + orderId + "/status?status=" + status;
            restTemplate.put(url, null);
            System.out.println(">>> Đã cập nhật thành công trạng thái đơn #" + orderId + " thành " + status);

        } catch (ResourceAccessException e) {
            // 2. Xử lý trường hợp chưa bật máy Order Service (hoặc sai IP, rớt mạng)
            System.err.println("🔌 MẤT KẾT NỐI: Chưa bật máy Order Service hoặc bị tường lửa chặn ở địa chỉ 172.16.33.164:8083!");

        } catch (Exception e) {
            // Đề phòng văng ba cái lỗi lặt vặt khác để app không bị sập
            System.err.println("⚠️ LỖI: " + e.getMessage());
        }
    }
}