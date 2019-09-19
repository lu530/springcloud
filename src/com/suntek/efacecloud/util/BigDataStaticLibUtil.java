package com.suntek.efacecloud.util;

import java.util.HashMap;
import java.util.Map;

import org.elasticsearch.client.transport.TransportClient;

import com.suntek.eap.EAP;
import com.suntek.eap.core.app.AppHandle;
import com.suntek.eap.index.SearchEngineException;
import com.suntek.eap.log.ServiceLog;
import com.suntek.tactics.api.TacticsEnum;
import com.suntek.tactics.common.CollisionResult;
import com.suntek.tactics.manager.FaceOperationManager;

/**
 * 大数据静态小库接口调用工具类
 * @author wsh
 * @version 2016-12-20
 * @since 2.0
 * @Copyright (C)2016 , Suntektech
 */
public class BigDataStaticLibUtil 
{
	/**
	 * 创建静态小库
	 * @param libraryId
	 * @return
	 * @throws SearchEngineException
	 */
	public static CollisionResult createBigDataLib(String libraryId) throws SearchEngineException
	{
		Map<String, Object> map = new HashMap<String, Object>();
		
		TransportClient client = (TransportClient) EAP.bigdata.getClient();
		map.put("libraryId", libraryId);
		
		ServiceLog.debug("创建静态小库参数：" + map);
		ServiceLog.debug("创建静态小库连接大数据环境：" +
				AppHandle.getHandle("console").getProperty("FACE_FEATURE_ES_SSD_IP", "localhost") + ":" +
				AppHandle.getHandle("console").getProperty("FACE_FEATURE_ES_SSD_PORT", "9300") + ":" +
				AppHandle.getHandle("console").getProperty("FACE_FEATURE_ES_SSD_CLUSTER", "bigdata"));
		
		CollisionResult result = FaceOperationManager.runOperation(map, client, TacticsEnum.FACEDB_CREATE);
		if (result != null) {
			ServiceLog.debug("创建静态小库返回结果："+ result.toJson());
		} else {
			ServiceLog.debug("创建静态小库返回结果：null");
		}
		
		return result;
	}

	/**
	 * 判断静态小库是否存在
	 * @param libraryId
	 * @return
	 * @throws SearchEngineException
	 */
	public static CollisionResult isExistBigDataLib(String libraryId) throws SearchEngineException
	{
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("libraryId", libraryId);
	
		TransportClient client = (TransportClient) EAP.bigdata.getClient();
		ServiceLog.debug("判断人脸静态小库是否存在参数："+map);
		
		CollisionResult result = FaceOperationManager.runOperation(map, client, TacticsEnum.FACEDB_ISEXIST);
		if (result != null) {
			ServiceLog.debug("判断人脸静态小库是否存在返回结果：" + result.toJson());
		} else {
			ServiceLog.debug("判断人脸静态小库是否存在返回结果：null");
		}
		
		return result;
	}
	
	/**
	 * 删除静态小库
	 * @param libraryId
	 * @return
	 * @throws SearchEngineException
	 */
	public static CollisionResult deleteBigDataLib(String libraryId) throws SearchEngineException
	{
		Map<String, Object> map = new HashMap<String, Object>();
		
		TransportClient client = (TransportClient) EAP.bigdata.getClient();
		map.put("libraryId", libraryId);
		
		ServiceLog.debug("删除静态小库检索参数："+map);
		
		CollisionResult result = FaceOperationManager.runOperation(map, client, TacticsEnum.FACEDB_DELETE);
		if (result != null) {
			ServiceLog.debug("删除静态小库返回结果：" + result.toJson());
		} else {
			ServiceLog.debug("删除静态小库返回结果：null");
		}
		
		return result;
	}
	
	/**
	 * 传参方式注册人脸到静态小库
	 * @param libraryId
	 * @param features
	 * @return
	 * @throws SearchEngineException
	 */
	public static CollisionResult saveFaceToBigData(String libraryId, Map<Long, String> features) throws SearchEngineException
	{	
		CollisionResult result = BigDataStaticLibUtil.isExistBigDataLib(libraryId);
		if (result != null && result.getCode() ==0) {
			boolean isExist = (boolean)result.getList().get(0);
			if (!isExist) {
				CollisionResult addLibResult = BigDataStaticLibUtil.createBigDataLib(libraryId);
				if (addLibResult == null || addLibResult.getCode() != 0) {
					ServiceLog.debug("创库失败, 库ID : "+ libraryId);
					return addLibResult;
				}
			}
		}

		TransportClient client = (TransportClient) EAP.bigdata.getClient();
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("libraryId", libraryId);
		map.put("features", features);
		
		result = FaceOperationManager.runOperation(map, client, TacticsEnum.FACEDB_REGISTER);
		if (result != null) {
			ServiceLog.debug("传参方式注册人脸到静态小库返回结果：" + result.toJson());
		} else {
			ServiceLog.debug("传参方式注册人脸到静态小库返回结果：null");
		}
		
		return result;
	}
	
	/**
	 * 传参方式注册人脸到静态小库
	 * @param libraryId
	 * @param features
	 * @return
	 * @throws SearchEngineException
	 */
	public static CollisionResult saveFaceToBigData(String libraryId, long id, String feature ) throws SearchEngineException
	{
		Map<Long, String> features = new HashMap<Long, String>();
		features.put(id, feature);
		return saveFaceToBigData(libraryId, features);
	}
	
	
	
	/**
	 * 从静态小库注销人脸
	 * @param libraryId
	 * @param ids
	 * @return
	 * @throws SearchEngineException
	 */
	public static CollisionResult deleteBigDataFace(String libraryId, String ids) throws SearchEngineException
	{
		Map<String, Object> map = new HashMap<String, Object>();
		
		TransportClient client = (TransportClient) EAP.bigdata.getClient();
		map.put("libraryId", libraryId);
		map.put("ids", ids);
		
		ServiceLog.debug("从静态小库注销人脸参数：" + map);
		
		CollisionResult result = FaceOperationManager.runOperation(map, client, TacticsEnum.FACEDB_LOGOUT);
		if (result != null) {
			ServiceLog.debug("从静态小库注销人脸结果：" + result.toJson());
		} else {
			ServiceLog.debug("从静态小库注销人脸结果：null");
		}
		
		return result;
	}
	
	/**
	 * 静态小库检索1：N
	 * @param map
	 * @return
	 * @throws SearchEngineException
	 */
	public static CollisionResult faceOne2NSearch(Map<String, Object> map) throws SearchEngineException
	{
		TransportClient client = (TransportClient) EAP.bigdata.getClient();
		
		ServiceLog.debug("静态小库检索1：N参数：" + map);
		
		CollisionResult result = FaceOperationManager.runOperation(map, client, TacticsEnum.FACEDB_ONE2N_SEARCH);
		if (result != null) {
			ServiceLog.debug("静态小库检索1：N结果：" + result.toJson());
		} else {
			ServiceLog.debug("静态小库检索1：N结果：null");
		}
		
		return result;
	}
	
}
