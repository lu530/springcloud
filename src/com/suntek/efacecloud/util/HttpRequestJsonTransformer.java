package com.suntek.efacecloud.util;

import java.io.InputStream;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.io.IOUtils;

import com.suntek.eap.log.ServiceLog;

import net.sf.json.JSONObject;

/**
 * HTTP请求查询数据转换器
 * 查询字符串格式 json
 * @author lx
 * @since 
 * @version 2017-07-25
 * @Copyright (C)2017 , Suntektech
 */
public class HttpRequestJsonTransformer
{
	/**
	 * 将请求的查询数据转换成JSON对象
	 * @param context
	 * @return
	 */
	public static JSONObject streamToJsonObj(HttpServletRequest request) 
	{
		StringBuffer srcSb = new StringBuffer();
		InputStream in = null;
		JSONObject json = null;
		
		try {
			in = request.getInputStream();
			int n = -1;
			byte[] b = new byte[1024];
			
			while ((n = in.read(b)) != -1) {
				srcSb.append(new String(b, 0, n, "UTF-8"));
			}
			
			if(srcSb.length()>0){
				json = JSONObject.fromObject(srcSb.toString());
			}else{
				json = new JSONObject();
			}

		} catch (Exception e) {
			ServiceLog.error("转换api请求失败！", e);
		} finally {
			IOUtils.closeQuietly(in);
		}

		return json;
	}
}
