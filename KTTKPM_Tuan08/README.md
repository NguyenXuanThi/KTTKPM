# Movie Ticket System - Event-Driven Architecture

## Kiến trúc

Hệ thống đặt vé xem phim sử dụng Event-Driven Architecture với RabbitMQ.

## Cài đặt

### 1. Khởi động RabbitMQ

```bash
docker-compose up -d
```

RabbitMQ Management UI: http://localhost:15672 (admin/admin123)

### 2. Cài đặt dependencies cho từng service

```bash
cd user-service && npm install
cd ../movie-service && npm install
cd ../booking-service && npm install
cd ../payment-service && npm install
cd ../notification-service && npm install
cd ../frontend && npm install
```

### 3. Chạy các service

Mỗi service chạy trong terminal riêng:

```bash
cd user-service && npm run start:dev
cd movie-service && npm run start:dev
cd booking-service && npm run start:dev
cd payment-service && npm run start:dev
cd notification-service && npm run start:dev
cd frontend && npm run dev
```

## Ports

| Service      | Port  |
| ------------ | ----- |
| User         | 8081  |
| Movie        | 8082  |
| Booking      | 8083  |
| Payment      | 8084  |
| Notification | 8085  |
| RabbitMQ     | 5672  |
| RabbitMQ UI  | 15672 |
| Frontend     | 5173  |

## Events

| Event             | Mô tả               |
| ----------------- | ------------------- |
| USER_REGISTERED   | Người dùng đăng ký  |
| BOOKING_CREATED   | Tạo booking         |
| PAYMENT_COMPLETED | Thanh toán xong     |
| BOOKING_FAILED    | Thanh toán thất bại |

## Flow

User → Booking Service → (Publish BOOKING_CREATED) → Payment Service (Consume) → (Publish PAYMENT_COMPLETED/BOOKING_FAILED) → Notification Service (Consume)
