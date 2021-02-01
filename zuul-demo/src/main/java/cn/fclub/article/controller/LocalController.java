package cn.fclub.article.controller;

import cn.fclub.article.config.MyApolloConfig;
import com.ctrip.framework.apollo.Config;
import com.ctrip.framework.apollo.spring.annotation.ApolloConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class LocalController {

    @Autowired
    private MyApolloConfig apolloConfig;

    @GetMapping("/local/{id}")
    public String local(@PathVariable String id) {
        return id;
    }

    @GetMapping("/local/apollo")
    public String apollo() {
        String name = apolloConfig.getUsername();
        System.out.println("name:" + name);
        return name;
    }

    @ApolloConfig
    private Config config;
    @GetMapping("/local/getUserName3")
    public String getUserName3() {
        return config.getProperty("APOLO_FIRST_CONFIG", "zhangsan");
    }


}
