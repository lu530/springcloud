package cn.fclub.article.config;


import feign.Logger;
import feign.Response;
import feign.Util;
import feign.codec.ErrorDecoder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;

import java.io.IOException;

@Configuration
public class FeignConfiguration {
    /**
     * 日志级别
     *
     * @return
     */
    @Bean
    Logger.Level feignLoggerLevel() {
        return Logger.Level.FULL;
    }

    @Bean
    public ErrorDecoder errorDecoder() {
        return new MiddleServiceErrorDecoder();
    }

    public class MiddleServiceErrorDecoder implements ErrorDecoder {

        @Override
        public Exception decode(String methodKey, Response response) {
            System.out.println("---------------------MiddleServiceErrorDecoder");
            System.out.println("-" + response.status());
            Exception exception = new Exception("调用中间层服务接口异常");

            return exception;
        }
    }


}
