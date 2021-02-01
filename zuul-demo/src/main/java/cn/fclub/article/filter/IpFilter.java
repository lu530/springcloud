package cn.fclub.article.filter;

import cn.fclub.article.util.IpUtil;
import com.netflix.zuul.ZuulFilter;
import com.netflix.zuul.context.RequestContext;
import com.netflix.zuul.exception.ZuulException;
import org.apache.commons.lang.StringUtils;
import org.bouncycastle.asn1.ocsp.ResponseData;

import java.util.Arrays;
import java.util.List;

public class IpFilter extends ZuulFilter {

    // IP黑名单列表
    private List<String> blackIpList = Arrays.asList("172.28.51.81");


    public IpFilter() {
        super();
    }

    //是否执行该过滤器，true 为执行，false 为不执行，这个也可以利用配置中心来实现，达到动态的开启和关闭过滤器。
    @Override
    public boolean shouldFilter() {
        return true;
    }

    //过滤器类型，可选值有 pre、route、post、error。
    @Override
    public String filterType() {
        return "pre";
    }

    //过滤器的执行顺序，数值越小，优先级越高。
    @Override
    public int filterOrder() {
        return 1;
    }

    @Override
    public Object run() {
       // int i = 1/0;
        RequestContext ctx = RequestContext.getCurrentContext();
        String ip = IpUtil.getIpAddr(ctx.getRequest());
        // 在黑名单中禁用
        if (StringUtils.isNotBlank(ip) && blackIpList.contains(ip)) {
            ctx.setSendZuulResponse(false);
            ctx.set("isSuccess", false);
            ctx.setResponseBody("非法请求");
            ctx.getResponse().setContentType("application/json; charset=utf-8");
            return null;
        }
        return null;
    }
}


