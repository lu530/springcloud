package cn.fclub.user.listener;


import org.springframework.boot.actuate.health.AbstractHealthIndicator;
import org.springframework.boot.actuate.health.Health;
import org.springframework.stereotype.Component;


@Component
public class CustomHealthIndicator extends AbstractHealthIndicator {

    /**
     * 上传客户端的健康状态给Eureka
     * @param builder
     * @throws Exception
     */
    @Override
    protected void doHealthCheck(Health.Builder builder) throws Exception {
        //不健康
       // builder.down().withDetail("status", false);
        // builder.down().withDetail("status", true);
        builder.up();
    }
}
