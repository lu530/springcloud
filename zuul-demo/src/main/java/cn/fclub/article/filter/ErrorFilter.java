package cn.fclub.article.filter;

import com.netflix.zuul.ZuulFilter;
import com.netflix.zuul.context.RequestContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


public class ErrorFilter extends ZuulFilter {
    private Logger log = LoggerFactory.getLogger(ErrorFilter.class);

    //过滤器类型，可选值有 pre、route、post、error。
    @Override
    public String filterType() {
        return "error";
    }
    @Override
    public int filterOrder() {
        return 100;
    }
    @Override
    public boolean shouldFilter() {
        return true;
    }
    @Override
    public Object run() {
        RequestContext ctx = RequestContext.getCurrentContext();
        Throwable throwable = ctx.getThrowable();
        log.error("Filter Erroe : {}", throwable.getCause().getMessage());
        return null;
    }

}
