package com.suntek.efacecloud.rest;

import java.util.LinkedHashMap;

import net.sf.json.JSONObject;

/**
 * API业务处理接口-json数据处理
 * @author lx
 * @since 
 * @version 2017-07-25
 * @Copyright (C)2017 , Suntektech
 */
public abstract class AbstractJsonHandler implements BaseHandler
{
	/** 默认日期格式 */
	public static final String DEFAULT_DATE_FMT = "yyyy-MM-dd HH:mm:ss";

	/**
	 * 业务接口具体实现
	 * @param args 参数 json
	 * @param target 返回值 map 使用LinkedHashMap是为了在转换json字符串时保持map顺序不变
	 * @throws Exception 
	 */
	protected abstract void doHandle(JSONObject args, LinkedHashMap<String, Object> target) throws Exception;
	
	@Override
	public Object handle(JSONObject json) throws Exception
	{
		LinkedHashMap<String, Object> ret = new LinkedHashMap<String, Object>();
		String statusCode = StatusCode.SERVER_ERROR;
		
		if(validateInputParams(json))  {
			doHandle(json, ret);
		} else {
			statusCode = StatusCode.PARAM_ERROR;
			ret.put("StatusCode", statusCode);
		}
		
		return ret;
	}
	
	/**
	 * 判断对象是否为空（为空包括null | "" | null | NULL | 'null' | "NULL"
	 * @param obj
	 * @return
	 */
	public boolean isObjectNull(Object obj) 
	{
		if(obj == null) {
			return true;
		} else {
			String str = obj.toString().trim();
			
			if("".equals(str) 
					|| "null".equalsIgnoreCase(str)
					|| "\'null\'".equalsIgnoreCase(str)
					|| "\"null\"".equalsIgnoreCase(str)){
				return true;
			}
		}
		
		return false;
	}
}
