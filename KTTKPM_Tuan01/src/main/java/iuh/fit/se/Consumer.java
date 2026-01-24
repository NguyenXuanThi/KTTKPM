package iuh.fit.se;
import com.rabbitmq.client.*;

public class Consumer {

    static final String MAIN_QUEUE = "main_queue";

    public static void main(String[] args) throws Exception {

        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost("localhost");

        Connection conn = factory.newConnection();
        Channel channel = conn.createChannel();

        // ❗ Tắt auto-ack
        channel.basicQos(1);

        System.out.println("📥 Waiting for messages...");

        DeliverCallback callback = (tag, delivery) -> {
            String message = new String(delivery.getBody());
            long deliveryTag = delivery.getEnvelope().getDeliveryTag();

            try {
                System.out.println("➡ Processing: " + message);

                if ("error".equals(message)) {
                    throw new RuntimeException("Business error!");
                }

                System.out.println("✅ Done: " + message);
                channel.basicAck(deliveryTag, false);

            } catch (Exception e) {
                System.out.println("❌ Error, send to DLQ: " + message);

                // reject & DO NOT requeue
                channel.basicReject(deliveryTag, false);
            }
        };

        channel.basicConsume(MAIN_QUEUE, false, callback, tag -> {});
    }
}
