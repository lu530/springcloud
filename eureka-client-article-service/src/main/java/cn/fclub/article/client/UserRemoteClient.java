package cn.fclub.article.client;

import cn.fclub.article.config.FeignConfiguration;
import cn.fclub.article.exception.UserFeignFallback;
import cn.fclub.article.factory.UserRemoteClientFallbackFactory;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

@FeignClient(value = "eureka-client-user-service", configuration = FeignConfiguration. class,/*fallback = UserFeignFallback.class*/
        fallbackFactory = UserRemoteClientFallbackFactory.class)
public interface UserRemoteClient {


    @GetMapping("/user/hello")
    String hello();

    @GetMapping("/user/hello2")
    String hello2();


}
