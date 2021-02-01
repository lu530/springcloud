package cn.fclub.hystrix.command;

import com.netflix.hystrix.HystrixCommand;
import com.netflix.hystrix.HystrixCommandGroupKey;

public class MyHystrixCommand extends HystrixCommand<String> {
    private final String name;

    public MyHystrixCommand(String name) {
        super(HystrixCommandGroupKey.Factory.asKey("MyGroup"));
        this.name = name;
    }

    /**
     * 休息10秒代表超时，Hystrix 会触发报错
     * @return
     */
    @Override
    protected String run() {
        System.err.println("get data");
        return this.name + ":" + Thread.currentThread().getName();
    }

    @Override
    protected String getFallback() {
        return "失败了 ";
    }

    /**
     * 这里的逻辑需要我们程序员自己写，到底是怎样才是给缓存, 返回null的话就会走run方法
     * @return
     */
    @Override
    protected String getCacheKey() {
        return String.valueOf(this.name);
       // return null;
    }

}
