package com.suntek.efacecloud.util;

import java.util.Arrays;
import java.util.List;
import java.util.Set;

import org.apache.log4j.Logger;

import com.suntek.eap.log.LogFactory;
import com.suntek.elastic.rdd.util.StringUtil;
import com.suntek.surveilsdk.SurveilLibManager;
import com.suntek.surveilsdk.SurveilTaskManager;
import com.suntek.surveilsdk.model.SurveilLib;
import com.suntek.surveilsdk.model.SurveilLibObject;
import com.suntek.surveilsdk.model.SurveilTask;

/**
 * 布控管理操作工具
 * @author lx
 * @since 1.0.0
 * @version 2017年7月3日
 * @Copyright (C)2017 , Suntektech
 */
public class SurveilTaskUtil 
{
	private static SurveilLibManager surveilLibManager = new SurveilLibManager();
	private static SurveilTaskManager surveilTaskManager = new SurveilTaskManager();
	private static Logger surveilTaskLog= LogFactory.getServiceLog(Constants.APP_NAME + "_SurveilTaskLog");

	/**
     * 新增布控库
     *  @param libId 布控库ID
     *  @param libName 布控库名称
     *  @param libType 布控库类型
     *  @param taskType 布控任务类型
     */
	public static String addSurveilLib(String libId, String libName, int taskType, int libType, int threshold) throws Exception
	{
		return addSurveilLib(libId, libName, taskType, libType, 10000, threshold);
	}
	
	/**
     * 新增布控库
     *  @param libId 布控库ID
     *  @param libName 布控库名称
     *  @param libType 布控库类型
     *  @param libSize 布控库容量
     *  @param threshold告警阈值
     */
	public static String addSurveilLib(String libId, String libName, int taskType, int libType, int libSize, int threshold) throws Exception
	{
		if  (!StringUtil.isEmpty(libId) && surveilLibManager.queryLib(libId).size()>0) {
			return libId;
		}
		
		SurveilLib surveilLib = new SurveilLib();
		surveilLib.setDbId(libId);
		surveilLib.setName(libName);
		surveilLib.setType(libType);
		surveilLib.setCapacity(libSize);
		surveilLib.setThreshold(threshold);
		
		libId = surveilLibManager.addLib(surveilLib, taskType);
		
		surveilTaskLog.debug("新增布控库完成--libId:" + libId + "--libName:" + libName);
		
	    return libId;
	}
	
	 /**
     * 新增布控任务
     *  @param libId 布控库ID
     *  @param taskName 任务名称
     *  @param taskType 任务类型
     */
	public static void addSurveilTask(String taskName, int taskType, String libId, List<String> deviceList) throws Exception
	{
		addSurveilTask(taskName, taskType, libId, 0, deviceList) ;
	}
	
	/**
     * 新增布控任务
     *  @param libId 布控库ID,以逗号分隔
     *  @param deviceList 设备ID列表
     *  @param taskName 任务名称
     *  @param taskType 任务类型
     *  @param threshold 阈值
     */
	public static String  addSurveilTask(String taskName, int taskType, String libId, int threshold, List<String> deviceList) throws Exception
	{
		SurveilTask surveilTask = new SurveilTask();
		surveilTask.setTaskName(taskName);
		surveilTask.setTaskType(taskType);
		surveilTask.setSceneId(null);
		
		if (threshold > 100 || threshold < 0) {
			threshold = 0;
		}
		
		surveilTask.setThreshold(threshold);
		
		String taskId = "";
		List<String> libList=Arrays.asList(libId.split(","));
		if (deviceList.size() > 0) {
			taskId = surveilTaskManager.addTask(surveilTask, libList, deviceList);
		} else {
			taskId = surveilTaskManager.addTask(surveilTask, libList);
		}
		
		surveilTaskLog.debug("新增布控任务完成--taskId:" + taskId + "--taskName:" + taskName);
	    
	    return taskId;
	}
	
	
    /**
     * 更新布控任务
     *  @param taskId 任务ID
     *  @param libId 布控库ID,以逗号分隔
     *  @param deviceList 设备ID列表
     *  @param taskName 任务名称
     *  @param taskType 布控任务类型
     *  @param threshold 阈值
     */
	public static String  updateSurveilTask(String taskId, String taskName, int taskType, String libId, int threshold, List<String> deviceList) throws Exception
	{
		surveilTaskLog.debug("编辑布控任务开始--taskId:" + taskId + "--taskName:" + taskName);
		surveilTaskManager.delTask(taskId);//先删除之前的任务
		return addSurveilTask(taskName,taskType,libId,threshold, deviceList);	//重新添加新的任务	
	}
	
	/**
	 * 删除布控任务
	 * @param taskIds 布控任务ID
	 */
	public static void deleteSurveilTask(String taskIds)
	{
		List<String> taskList = Arrays.asList(taskIds.split(","));
		for (String taskId : taskList) {
			surveilTaskManager.delTask(taskId);
		}
	}
	
	/**
     * 增加布控库对象
     *  @param libId 布控库
     *  @param objFeature 对象特征
     *  @param objPic 对象图片
     *  @param objExtendInfo 自定义信息
     *  @param taskType 布控任务类型 
     *  @return  对象ID
	 * @throws Exception 
     */
	public static long addLibObject(String libId, String objFeature, String objPic, String objExtendInfo, int taskType) throws Exception
	{
		long objectId=0;
		if (!StringUtil.isEmpty(objPic)) {
			 objFeature = FaceFeatureUtil.faceQualityCheck(objPic).getRltz();
		}

		SurveilLibObject surveilLibObject=new SurveilLibObject();
		surveilLibObject.setDbId(libId);
		surveilLibObject.setObjFeature(objFeature);
		surveilLibObject.setObjPic(objPic);
		surveilLibObject.setObjExtendInfo(objExtendInfo);
		
		objectId= surveilLibManager.addLibObject(surveilLibObject, taskType);
		
		surveilTaskLog.debug("新增布控对象完成--objectId:" + objectId);
	    
	    return objectId;
	}
	
	/**
     * 删除布控库对象
     *  @param objId 布控对象ID
     *  @param libType 布控任务类型
     */
	public static void deleteLibObject(long objId, int taskType) throws Exception
	{
		surveilLibManager.delLibObject(objId, taskType);
		surveilTaskLog.debug("删除布控对象完成--objectId:" + objId);
	}
	
	/**
     * 更新布控库对象
     * 	@param objId 布控对象ID
     *  @param libId 布控库
     *  @param objFeature 对象特征
     *  @param objPic 对象图片
     *  @param taskType 布控任务类型
     *  @return  对象ID
     */
	public static long updateLibObject(long objId, String libId, String objFeature, String objPic, String objExtendInfo, int taskType) throws Exception
	{
		surveilLibManager.delLibObject(objId, taskType);
		
		SurveilLibObject surveilLibObject = new SurveilLibObject();
		surveilLibObject.setDbId(libId);
		surveilLibObject.setObjFeature(objFeature);
		surveilLibObject.setObjPic(objPic);
		surveilLibObject.setObjExtendInfo(objExtendInfo);

		return surveilLibManager.addLibObject(surveilLibObject, taskType);
	}
	
	/**
     * 删除布控库
     *  @param objId 布控对象ID
     *  @param taskType 布控任务类型
     */
	public static void deleteLib(String libId, int taskType) throws Exception
	{
		surveilLibManager.delLib(libId, taskType);
		surveilTaskLog.debug("删除布控库完成--libId:"+libId);
	}

	/**
	 * 更新布控库中知道库ID的名称
	 * @param dbId
	 * @param dbName
	 */
	public static void editSurveilTask(String dbId, String dbName, String threshold) 
	{
		if (!StringUtil.isEmpty(threshold)) {
			surveilLibManager.updateLibNameAndThreshold(dbId, dbName, Integer.parseInt(threshold));
		} else {
			surveilLibManager.updateLibName(dbId, dbName);
		}
		
		surveilTaskLog.debug("更新布控库名称完成---libId:"+dbId+"--dbName:"+dbName +"--threshold:"+threshold);
	}
	
	/**
	 *  根据deviceId和taskId撤控
	 * @param taskIdSet
	 * @param delList
	 */
	public static void deleteSurveilTaskDeviceId(Set<String> taskIdSet,
			List<String> deviceList) {
		for (String taskId : taskIdSet) {
			surveilTaskManager.delTaskDevice(taskId, deviceList);
		}
		surveilTaskLog.debug("布控库撤控完成");
	}

	/**
	 * 根据libID和taskId撤控
	 * @param taskIdSet
	 * @param delList
	 */
	public static void deleteSurveilTaskDbId(Set<String> taskIdSet,
			List<String> libList) {
		for (String taskId : taskIdSet) {
			surveilTaskManager.delTaskLib(taskId, libList);
		}
		surveilTaskLog.debug("布控库撤控完成:");
	}

}
