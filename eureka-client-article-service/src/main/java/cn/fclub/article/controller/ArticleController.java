package cn.fclub.article.controller;


import brave.Tracer;
import cn.fclub.article.client.UserRemoteClient;
import com.netflix.hystrix.contrib.javanica.annotation.HystrixCommand;
import com.netflix.hystrix.contrib.javanica.annotation.HystrixProperty;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@RestController
public class ArticleController {
    private Logger logger = LoggerFactory.getLogger(ArticleController.class);


    @Autowired
    Tracer tracer;


    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private UserRemoteClient userRemoteClient;

    @GetMapping("/article/callHello")
    public String callHello() {
        return restTemplate.getForObject("http://localhost:8081/user/hello", String.class);
    }

    @GetMapping("/article/callHello2")
    public String callHello2() {
        logger.info("我是/article/callHello");
        tracer.currentSpan().tag("用户", "zhangsan");
      //  tracer.currentSpan().tag("用户", "zhangsan");
        return restTemplate.getForObject("http://eureka-client-user-service/user/hello", String.class);
    }

    @GetMapping("/article/callHello3")
    public String callHello3() {
        return userRemoteClient.hello();
    }

    @GetMapping("/article/callHello5")
    public String callHello5() {
        return userRemoteClient.hello2();
    }

    @GetMapping("/callHello")
    @HystrixCommand(fallbackMethod = "defaultCallHello" ,commandProperties = {
            @HystrixProperty(name="execution.isolation.strategy", value = "THREAD")
    })
    public String callHello4() {
        String result = restTemplate.getForObject("http://localhost:8088/house/hello", String.class);
        return result;
    }

    public String defaultCallHello(){
        return "fail";
    }


}
