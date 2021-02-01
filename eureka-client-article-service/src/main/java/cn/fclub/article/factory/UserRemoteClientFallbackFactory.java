package cn.fclub.article.factory;


import cn.fclub.article.client.UserRemoteClient;
import feign.hystrix.FallbackFactory;
import org.springframework.stereotype.Component;

@Component
public class UserRemoteClientFallbackFactory implements FallbackFactory<UserRemoteClient> {

    @Override
    public UserRemoteClient create(final Throwable cause) {
        System.out.println("cause = " + cause);
        return new UserRemoteClient() {
            @Override
            public String hello() {
                return "fail";
            }

            @Override
            public String hello2() {
                return "fail";
            }
        };
    }

}
