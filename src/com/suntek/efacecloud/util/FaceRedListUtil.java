package com.suntek.efacecloud.util;

import com.suntek.eap.web.RequestContext;

import java.util.List;
import java.util.Map;

/**
 * 红名单接口，兼容不同厂商的静态小库
 * @author liaoweixiong
 * 
 */
public interface FaceRedListUtil {
    public void addOrEdit(RequestContext context) throws  Exception;
    public int importRedList(RequestContext context, List<Map<String,Object>> successList,List<String> failList, Map<String,String> importErrorMsgCache) throws  Exception;
}
