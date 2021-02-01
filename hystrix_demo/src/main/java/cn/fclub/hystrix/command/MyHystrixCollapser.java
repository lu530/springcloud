package cn.fclub.hystrix.command;

import com.netflix.hystrix.HystrixCollapser;
import com.netflix.hystrix.HystrixCommand;
import com.netflix.hystrix.HystrixCommandGroupKey;
import com.netflix.hystrix.HystrixCommandKey;
import com.netflix.hystrix.strategy.concurrency.HystrixRequestContext;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;


/**
 * Hystrix 支持将多个请求自动合并为一个请求（代码如下所示），利用这个功能可以节省网络开销，
 * 比如每个请求都要通过网络访问远程资源。如果把多个请求合并为一个一起执行，
 * 将多次网络交互变成一次，则会极大地节省开销
 *
 * 比如 通过id的一次次请求，可以合并为 通过List<id> 去请求一个接口，这里还有可以设置间隔多长时间会合并为一下啊请求
 * 现实确实是这样，像村头的载客汽车一样，到达一定的时间和数据量内才会发车 ，或者是公司有自己开车回去，也有搭公交回家的，
 * 如果是目的地相同（就是请求url相同），就找对应目的地的公司班车
 * 不过这个功能应该写成成注释，写在feign的接口上，写明批量的话，是那个feign接口，默认就是list<Object>
 *    下面的demo只是写了一个了Hystrix 合并请求的原生代码，feign-hystrix 应该就可以实现我上面的想法
 *
 *

 * @return
 * @HystrixCollapser(batchMethod = "findAll")     说明需要被合并的方法是这个    合并方法是findall
 * <p>
 * <p>
 * collapserProperties = {
 * @HystrixProperty(name = "timeDelayInMilliseconds",value = "300")
 * }
 * <p>
 * 这个 是指明多少时间内的请求都合并为一个请求     value = 300 表示300毫秒以内的请求都合并
 * @HystrixCollapser(batchMethod = "findAll", collapserProperties = {
 *         @HystrixProperty(name = "timerDelayInMilliseconds", value = "300")
 * })
 *  public Future<String> findOne(Integer id) {
 *
 * @HystrixCommand   //设置能被找到
 *     public List<String> findAll(List<Integer> id) {
 */


public class MyHystrixCollapser extends HystrixCollapser<List<String>, String, String> {
    private final String name;
    public MyHystrixCollapser(String name) {
        this.name = name;
    }

    @Override
    public String getRequestArgument() {
        return name;
    }

    @Override
    protected HystrixCommand<List<String>> createCommand(final Collection<CollapsedRequest<String, String>> requests) {
        return new BatchCommand(requests);
    }

    @Override
    protected void mapResponseToRequests(List<String> batchResponse,
                                         Collection<CollapsedRequest<String, String>> requests) {
        int count = 0;
        for (CollapsedRequest<String, String> request : requests) {
            request.setResponse(batchResponse.get(count++));
        }
    }

    private static final class BatchCommand extends HystrixCommand<List<String>> {
        private final Collection<CollapsedRequest<String, String>> requests;
        private BatchCommand(Collection<CollapsedRequest<String, String>> requests) {
            super(Setter.withGroupKey(HystrixCommandGroupKey.Factory.asKey("ExampleGroup"))
                    .andCommandKey(HystrixCommandKey.Factory.asKey("GetValueForKey")));
            this.requests = requests;
        }
        @Override
        protected List<String> run() {
            System.out.println(" 真正执行请求......");
            ArrayList<String> response = new ArrayList<String>();
            for (CollapsedRequest<String, String> request : requests) {
                response.add(" 返回结果 : " + request.getArgument());
            }
            return response;
        }
    }

    public static void main(String[] args) throws InterruptedException, ExecutionException {
        HystrixRequestContext context = HystrixRequestContext.initializeContext();
        Future<String> f1 = new MyHystrixCollapser("zhangsan").queue();
        Future<String> f2 = new MyHystrixCollapser("zhangsan333").queue();
        System.out.println(f1.get() + "=" + f2.get());
        context.shutdown();
    }

}
