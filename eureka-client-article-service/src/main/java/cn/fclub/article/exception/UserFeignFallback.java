package cn.fclub.article.exception;

import cn.fclub.article.client.UserRemoteClient;
import org.springframework.stereotype.Component;

@Component
public class UserFeignFallback implements UserRemoteClient {
    @Override
    public String hello() {
        return "hello1";
    }

    @Override
    public String hello2() {
        System.out.println("UserFeignFallback");
        return "UserFeignFallback";
    }
}
