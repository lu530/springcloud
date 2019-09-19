package com.suntek.efacecloud.util;

import java.text.ParseException;
import com.suntek.eap.log.ServiceLog;

/**
 * ES使用时间处理工具类
 * @author guoyl
 * @since 
 * @version 2017年06月09日
 * @Copyright (C)2017 , Suntektech
 */
public class EsDateUtil
{

	public static String getTime(String date,String time) throws ParseException {
		date = "20" + date;
		while(time.length()<6){
			time = "0" + time;
		}
		try{
			date = date.substring(0,4)+"-"+date.substring(4,6) +"-"+date.substring(6,8);
			time = time.substring(0, 2)+":"+time.substring(2, 4)+":"+time.substring(4,6);
		}catch(Exception e){
			ServiceLog.error(date+"-"+time+"==>getTime ERROR:"+e);
			return "-";
		}
		return date+" "+time;
	}

	public static String getDate(String date) throws ParseException {
		
		date = "20" + date;
		
		try{
			date = date.substring(0,4) + "-" + date.substring(4,6) + "-" + date.substring(6,8);
		}catch(Exception e){
			ServiceLog.error(date + "==>getTime ERROR:" + e);
			return "-";
		}
		return date;
	}
}
