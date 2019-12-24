package com.suntek.efacecloud.log;

import org.apache.log4j.Logger;

import com.suntek.eap.log.LogFactory;
import com.suntek.efacecloud.util.Constants;

/**
 * 日志类
 * @author lx
 * @since 
 * @version 2017年7月25日
 * 
 */
public class Log{
	public static Logger joblog = LogFactory.getServiceLog(Constants.APP_NAME + "_job");
	public static Logger synclog = LogFactory.getServiceLog(Constants.APP_NAME + "_sync");
	public static Logger tasklog = LogFactory.getServiceLog(Constants.APP_NAME + "_task");
	public static Logger dispatchedimportSuccessLog = LogFactory.getServiceLog("dispatchedimport_success");
	public static Logger dispatchedimportFailLog = LogFactory.getServiceLog("dispatchedimport_fail");
	public static Logger archiveimportLog = LogFactory.getServiceLog(Constants.APP_NAME + "_archiveimport");
	
	public static Logger fanchaLog = LogFactory.getServiceLog(Constants.APP_NAME + "_fancha");
	public static Logger smsLog = LogFactory.getServiceLog(Constants.APP_NAME + "_sms");
	
	public static Logger faceSearchLog = LogFactory.getServiceLog(
			Constants.APP_NAME + "_faceSearch_0605");  // liangzhen 20190605
	public static Logger faceOneToOneLog = LogFactory.getServiceLog(Constants.APP_NAME + "_faceOneToOne");
	public static Logger importDataLog = LogFactory.getServiceLog(Constants.APP_NAME + "_importData");  //导入数据记录日志 importDataLog

	public static Logger requestPingGaoLog = LogFactory.getServiceLog(Constants.APP_NAME + "_requestPingGao");  //导入数据记录日志 importDataLog
	public static Logger deviceLog = LogFactory.getServiceLog(Constants.APP_NAME + "_device");

	public static Logger technicalLog = LogFactory.getServiceLog(Constants.APP_NAME + "_technical");
}

