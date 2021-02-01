package cn.fclub.user.controller;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletResponse;

@RestController
public class UserController {

    private Logger logger = LoggerFactory.getLogger(UserController.class);


    @GetMapping("/user/hello")
    public String hello() {
        logger.info("我是/user/hello");
 /*       try {
            Thread.sleep(4000);
        } catch (InterruptedException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }*/
        return "hello";
    }

    @GetMapping("/user/hello2")
    public String hello2(HttpServletResponse response) throws InterruptedException {
       // throw new RuntimeException("服务端测试异常！");
      //  Thread.sleep(1100);
      //  response.setStatus(HttpServletResponse.SC_MOVED_PERMANENTLY);
        return "hello";
    }
}