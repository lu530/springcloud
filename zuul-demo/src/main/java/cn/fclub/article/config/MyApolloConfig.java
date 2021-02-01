package cn.fclub.article.config;

import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
public class MyApolloConfig {
    @Value("${APOLO_FIRST_CONFIG:zhangsan}")
    private String username;

}
