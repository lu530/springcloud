package com.suntek.efacecloud.rest;


/**
 * 处理消息状态结果
 * @author lx
 * @since 
 * @version 2017-07-25
 * @Copyright (C)2017 , Suntektech
 */
public class StatusCode
{
	/**
	 * 成功
	 */
	public static final String SUCCESS = "0";
	
	/**
	 * 失败
	 */
	public static final String FAIL = "-1";
	
	/**
	 * 没有数据
	 */
	public static final String NO_DATA = "1";
	
	/**
	 * 参数错误
	 */
	public static final String PARAM_ERROR = "10001";
	
	/**
	 * 其他服务异常
	 */
	public static final String SERVER_ERROR = "10002";
	
	/**
	 * 服务未注册
	 */
	public static final String SERVICE_UNREGIST = "10003";
}
