package com.suntek.efacecloud.util;

import com.suntek.eap.log.EapServerLog;
import com.suntek.tactics.manager.FaceN2NOperationManager;
import com.suntek.tactics.manager.FaceOperationManager;
import com.suntek.tactics.manager.VWOperationManager;
import com.suntek.tactics.util.AlluxioClient;

/**
 * 大数据引擎初始化
 * @version 2017-06-27
 * @since 1.0
 * @author lx
 * @Copyright (C)2017 , Suntektech
 */
public class AlluxioClientUtil 
{
	public static void init() 
	{
		try {
			String alluxio = ConfigUtil.getAlluxioConf();
		    if (AlluxioClient.init(alluxio)) {
		    	FaceOperationManager.init(5, 5);
		    	FaceN2NOperationManager.init(1, 1);
		    	VWOperationManager.init(4, 4);
		    }
		    
		} catch (Exception e) {
			EapServerLog.log.error("初始化alluxio失败"+e.getMessage(), e);
		}
	}
}
