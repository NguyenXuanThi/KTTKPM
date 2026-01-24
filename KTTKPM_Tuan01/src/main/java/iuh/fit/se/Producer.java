package iuh.fit.se;
import com.rabbitmq.client.*;
import java.util.HashMap;
import java.util.Map;

public class Producer {

    static final String MAIN_EXCHANGE = "main_exchange";
    static final String MAIN_QUEUE = "main_queue";
    static final String ROUTING_KEY = "main_key";

    static final String DLX_EXCHANGE = "dlx_exchange";
    static final String DLQ = "dlq_queue";

    public static void main(String[] args) throws Exception {

        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost("localhost");

        try (Connection conn = factory.newConnection();
             Channel channel = conn.createChannel()) {

            // DLQ
            channel.exchangeDeclare(DLX_EXCHANGE, BuiltinExchangeType.DIRECT);
            channel.queueDeclare(DLQ, true, false, false, null);
            channel.queueBind(DLQ, DLX_EXCHANGE, "dlq_key");

            // Main queue args
            Map<String, Object> argsQueue = new HashMap<>();
            argsQueue.put("x-dead-letter-exchange", DLX_EXCHANGE);
            argsQueue.put("x-dead-letter-routing-key", "dlq_key");

            // Main
            channel.exchangeDeclare(MAIN_EXCHANGE, BuiltinExchangeType.DIRECT);
            channel.queueDeclare(MAIN_QUEUE, true, false, false, argsQueue);
            channel.queueBind(MAIN_QUEUE, MAIN_EXCHANGE, ROUTING_KEY);

            // Send message
            String[] messages = {
                    "hello",
                    "ok",
                    "error",   // message lỗi
                    "success"
            };

            for (String msg : messages) {
                channel.basicPublish(
                        MAIN_EXCHANGE,
                        ROUTING_KEY,
                        MessageProperties.PERSISTENT_TEXT_PLAIN,
                        msg.getBytes()
                );
                System.out.println("📤 Sent: " + msg);
            }
        }
    }
}
