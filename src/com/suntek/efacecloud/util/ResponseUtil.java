package com.suntek.efacecloud.util;

import com.suntek.eap.common.log.ServiceLog;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;

/**
 * http返回信息工具类
 */
public class ResponseUtil {

    /**
     * 添加成功的额外信息
     * @param context 请求上下文
     * @param result 要返回的结果
     * @param message 提示信息，可为空，为空时提示信息为“成功”
     */
    public static void addSuccessInfo(RequestContext context, Object result, String message) {
        context.getResponse().putData("DATA", result);
        context.getResponse().putData("CODE", 0);
        context.getResponse().putData("MESSAGE", message == null ? "成功" : message);
    }

    /**
     * 添加失败的额外信息
     * @param context 请求上下文
     * @param message 提示信息，为空时提示信息为“成功”
     * @param t 异常信息
     */
    public static void addFailInfo(RequestContext context, String message,Throwable t ){
        context.getResponse().putData("CODE", 1);
        if (StringUtil.isNull(message)) {
            context.getResponse().putData("MESSAGE", "失败");
            ServiceLog.error(t);
        } else {
            context.getResponse().putData("MESSAGE", message);
            ServiceLog.error(message, t);
        }
    }


}
