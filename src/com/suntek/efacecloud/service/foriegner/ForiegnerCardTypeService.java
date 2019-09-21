package com.suntek.efacecloud.service.foriegner;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.suntek.eap.EAP;
import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.pico.annotation.QueryService;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.efacecloud.util.Constants;

/**
 * 获取证件类型服务
 * @author linsj
 *
 */
@LocalComponent(id="foriegn/common")
public class ForiegnerCardTypeService {

    @QueryService(id="getCardType", description="获取证件类型服务", type="remote")
    public void getCardType(RequestContext context) {
        String elementId = StringUtil.toString(context.getParameter("id"), "data");
        String code = StringUtil.toString(context.getParameter("code"), "");
        
        if (StringUtil.isObjectNull(code)) {
            List<Map<Object, Object>> list = EAP.metadata.getDictList(Constants.FORIEGN_CARD);
            List<Map<String, Object>> result = transformToTextValueMapList(list);
            
            ServiceLog.debug("获取证件类型列表，返回结果数：" + result.size());
            context.getResponse().putData(elementId, result);
            return;
        }
        
        Map<Object, Object> map = EAP.metadata.getDictMap(Constants.FORIEGN_CARD, code);
        context.getResponse().putData(elementId, map);
        ServiceLog.debug("根据"+code+"获取证件类型，返回结果:" + map);
        return;
    }
    
    @QueryService(id="getVisaType", description="获取签证种类", type="remote")
    public void getVisaType(RequestContext context) {
        String elementId = StringUtil.toString(context.getParameter("id"), "data");
        String code = StringUtil.toString(context.getParameter("code"), "");
        
        if (StringUtil.isObjectNull(code)) {
            List<Map<Object, Object>> list = EAP.metadata.getDictList(Constants.FOREIGNER_VISA_TYPE);
            List<Map<String, Object>> result = transformToTextValueMapList(list);
            
            ServiceLog.debug("获取签证种类列表，返回结果数：" + result.size());
            context.getResponse().putData(elementId, result);
            return;
        }
        
        Map<Object, Object> map = EAP.metadata.getDictMap(Constants.FOREIGNER_VISA_TYPE, code);
        context.getResponse().putData(elementId, map);
        ServiceLog.debug("根据" + code + "获取签证种类，返回结果:" + map);
        return;
    }
    
    private List<Map<String, Object>> transformToTextValueMapList(List<Map<Object, Object>> list) {
        List<Map<String, Object>> result = new ArrayList<Map<String,Object>>();
        list.forEach(m -> {
            m.forEach((k, v) -> {
                Map<String, Object> t = new HashMap<>();
                t.put("VALUE", k);
                t.put("TEXT", v);
                result.add(t);
            });
        });
        return result;
    }
}
