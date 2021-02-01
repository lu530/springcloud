package cn.fclub.hystrix;

import cn.fclub.hystrix.command.MyHystrixCommand;
import com.netflix.hystrix.strategy.concurrency.HystrixRequestContext;

import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;

public class App {


    /**
     * hystrix 通过 1、先判断熔断器 是否开启
     *              2、再判断信号量，队列是否被占满
     *                信号量策略配置
     *                线程隔离策略配置
     *                教程中会通过对接redis来做demo练习
     * @param args
     * @throws ExecutionException
     * @throws InterruptedException
     */
    public static void main(String[] args) throws ExecutionException, InterruptedException {
        HystrixRequestContext context = HystrixRequestContext.initializeContext();
        String result = new MyHystrixCommand("zhangsan").execute();
        System.out.println(result);
        Future<String> future = new MyHystrixCommand("zhangsan").queue();
        Long start = System.currentTimeMillis();
        System.out.println(future.get());
        System.out.println(System.currentTimeMillis() - start);
        context.shutdown();
    }
}
