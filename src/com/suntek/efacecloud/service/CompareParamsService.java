package com.suntek.efacecloud.service;

import com.alibaba.fastjson.JSONObject;
import com.suntek.eap.common.CommandContext;
import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.eaplet.registry.Registry;

import java.util.HashMap;
import java.util.Map;

/**
 * 参数差异比较
 * 
 * @author wjy
 * @since 1.0.0
 * @version 2019-12-11
 * @Copyright (C)2019 , Suntektech
 */
public class CompareParamsService {

	public Map<String, Object> getDifferentData(RequestContext context) {
		CommandContext ctx = new CommandContext(context.getHttpRequest());
		String infoId = StringUtil.toString(context.getParameter("INFO_ID"));

        ctx.setBody(new HashMap<String, Object>(){{
            put("INFO_ID", infoId);
        }});
        
        ctx.setOrgCode(context.getUser().getDepartment().getCivilCode());
        ctx.setServiceUri("face/redlist/detail");
        try {
            Registry.getInstance().selectCommands("face/redlist/detail").exec(ctx);
        } catch (Exception e) {
            ServiceLog.error("调用开放平台失败，原因：" + e.getMessage(), e);
        }
        
        try {
            Map<String, Object> compareData = new HashMap<>();

            String data = StringUtil.toString(ctx.getResponse().getData("DATA"));
            if (StringUtil.isNull(data)) {
                return compareData;
            }
            Map<String, Object> originMap = JSONObject.parseObject(StringUtil.toString(ctx.getResponse().getData("DATA")), Map.class);
            Map<String, Object> editMap = context.getParameters();
            compareData.put("editParam", new HashMap<String, Object>(){{
                putAll(editMap);
            }});
            compareData.put("originParam", originMap);

            return compareData;
        } catch (Exception e) {
            ServiceLog.error("结果比对失败，原因：" + e.getMessage(), e);
            return new HashMap<>();
        }
        
	}
	
	public Map<String, Object> compareData(Map<String, Object> editMap, Map<String, Object> originMap) {
	    Map<String, Object> compareMap = new HashMap<>();
	    String editPic = StringUtil.toString(editMap.get("PIC"));
	    String originPic = StringUtil.toString(originMap.get("PIC"));
	    if (!originPic.equals(editPic)) {
	        compareMap.put("PIC", editPic);
        }
	    
	    String editIdentityType = StringUtil.toString(editMap.get("IDENTITY_TYPE"));
        String originIdentityType = StringUtil.toString(originMap.get("IDENTITY_TYPE"));
        if (!originIdentityType.equals(editIdentityType)) {
            compareMap.put("IDENTITY_TYPE", editIdentityType);
        }
        
        String editIdentityId = StringUtil.toString(editMap.get("IDENTITY_ID"));
        String originIdentityId = StringUtil.toString(originMap.get("IDENTITY_ID"));
        if (!originIdentityId.equals(editIdentityId)) {
            compareMap.put("IDENTITY_ID", editIdentityId);
        }
        
        String editPermanentAddr = StringUtil.toString(editMap.get("PERMANENT_ADDRESS"));
        String originPermanentAddr = StringUtil.toString(originMap.get("PERMANENT_ADDRESS"));
        if (!originPermanentAddr.equals(editPermanentAddr)) {
            compareMap.put("PERMANENT_ADDRESS", editPermanentAddr);
        }
        
        String editPresentAddr = StringUtil.toString(editMap.get("PRESENT_ADDRESS"));
        String originPresentAddr = StringUtil.toString(originMap.get("PRESENT_ADDRESS"));
        if (!originPresentAddr.equals(editPresentAddr)) {
            compareMap.put("PRESENT_ADDRESS", editPresentAddr);
        }
        
        
	    return compareMap;
	}
	
}
