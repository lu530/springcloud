package com.suntek.efacecloud.util;

import java.util.HashMap;
import java.util.Map;

import org.apache.commons.lang.math.RandomUtils;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.suntek.eap.core.app.AppHandle;
import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.util.DESCrypt;
import com.suntek.eap.util.DateUtil;
import com.suntek.eap.util.StringUtil;

/**
 * @author zhangliping
 * @version 2018年05月23日
 * @since 1.0
 * @Copyright (C)2018 , Suntektech
 */
public class FeatureExtract  {

	protected HttpHeaders headers = new HttpHeaders();
	
	private Class<?> returnType = String.class;
	
	public void setHttpHeaders()
	{
		headers.set("Accept", MediaType.APPLICATION_JSON);
		headers.set("Accpet-Encoding", "gzip");
		headers.set("Content-Encoding", "UTF-8");
		headers.set("Content-Type", MediaType.APPLICATION_JSON_UTF_8);
	}
	
	public Map<String, Object> getFeatureExtract(Map<String, Object> map) {
		
		Map<String, Object> retMap =  new HashMap<>();
		
		String fileUrl = StringUtil.toString(map.get("fileUrl"));
		int algoType = Integer.valueOf(StringUtil.toString(map.get("algoType")));
		String accesskeyid = AppHandle.getHandle(Constants.CONSOLE).getProperty("VRS_ACCESSKEYID","videoCloud");
		String requestid = "123456";
		String timestamp = DateUtil.convertByStyle(DateUtil.getDateTime(), DateUtil.standard_style,"yyyyMMddHHmmss");
		String secret = AppHandle.getHandle(Constants.CONSOLE).getProperty("VRS_SECRET","suntek");
		String signature =  DESCrypt.md5(DESCrypt.md5(accesskeyid + requestid + timestamp) + secret);

		JSONObject params = new JSONObject();
		params.put("requestid", requestid);
		params.put("timestamp", timestamp);
		params.put("accesskeyid", accesskeyid);
		params.put("signature", signature);
		
		JSONObject body0 = new JSONObject();
		body0.put("task_id",  + RandomUtils.nextLong()+"_0301_" + accesskeyid);
		body0.put("file_url", fileUrl);
		body0.put("user_data", "");
		body0.put("algo_type", algoType);
		body0.put("source_type", 4);
		
		JSONArray body = new JSONArray();
		body.add(body0);
		
		params.put("body", body);
		String data = params.toJSONString();
		 ServiceLog.debug("FeatureExtractCommand param:" + data);
		String url = "http://" + AppHandle.getHandle(Constants.CONSOLE).getProperty("VRS_IP", "172.25.20.44") + ":"
				+ AppHandle.getHandle(Constants.CONSOLE).getProperty("VRS_PORT", "9080") + "/videorest/v1/recognize/addPic";
		
		/** 设置头文件 **/
		setHttpHeaders();
		
		ResponseEntity<?> ret = HttpRestTemplateClient.post(url, data, headers, returnType);
      
		String result = StringUtil.toString(ret.getBody());
		
		JSONObject response = JSONObject.parseObject(result);


    	String code = StringUtil.toString(response.get("code"));
		String message = StringUtil.toString(response.get("message"));
		
		retMap.put("code", Long.valueOf(code));
		retMap.put("message", message);
		
		if (code.equals("0")) {
			Object info0 = ((JSONArray)response.get("struct_info")).get(0);
			retMap.put("struct_info", JSONObject.parseObject(StringUtil.toString(info0)).get("data"));
		}
		
		return retMap;
	}

}
