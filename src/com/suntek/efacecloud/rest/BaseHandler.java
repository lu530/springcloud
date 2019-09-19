package com.suntek.efacecloud.rest;

import net.sf.json.JSONObject;

/**
 * API业务处理接口
 * @author lx
 * @since 
 * @version 2017-07-25
 * @Copyright (C)2017 , Suntektech
 */
public interface BaseHandler
{
	/**
	 * 处理业务
	 * @param json json格式参数
	 * @return
	 * @throws RuntimeException
	 */
	Object handle(JSONObject json) throws Exception;

	/**
	 * 验证参数是否正确
	 * @param args
	 * @return
	 */
	boolean validateInputParams(JSONObject args);
}
