package com.suntek.efacecloud.util;

import java.util.HashMap;
import java.util.Map;

import com.suntek.eap.index.SearchEngineException;
import com.suntek.eap.log.ServiceLog;
import com.suntek.face.compare.sdk.common.constant.operation.FaceOperationEnum;
import com.suntek.face.compare.sdk.model.CollisionResult;
import com.suntek.face.compare.sdk.service.manage.FaceOperationManager;

/**
 * 静态小库操作工具类
 * @author gaosong
 * @version 2017年11月16日
 * @since 1.0
 * @Copyright (C)2017 , Suntektech
 */
public class SdkStaticLibUtil 
{
	/**
	 * 创建静态小库
	 * @param libraryId
	 * @return
	 * @throws SearchEngineException
	 */
	public static CollisionResult createLib(String libraryId, int algoType)
	{
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("libraryId", libraryId);
		map.put("algoType", algoType);
		
		ServiceLog.debug("创建静态小库参数：" + map);
		
		
		CollisionResult result = FaceOperationManager.runOperation(map, FaceOperationEnum.FACEDB_CREATE);
		
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
	public static CollisionResult isLibExist(String libraryId, int algoType)
	{
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("libraryId", libraryId);
		map.put("algoType", algoType);
		
		ServiceLog.debug("判断静态小库是否存在参数：" + map);
		
		
		CollisionResult result = FaceOperationManager.runOperation(map, FaceOperationEnum.FACEDB_ISEXIST);
		
		if (result != null) {
			ServiceLog.debug("判断静态小库是否存在返回结果："+ result.toJson());
		} else {
			ServiceLog.debug("判断静态小库是否存在返回结果：null");
		}
		
		return result;
	}

	
	/**
	 * 删除静态小库
	 * @param libraryId
	 * @return
	 * @throws SearchEngineException
	 */
	public static CollisionResult deleteLib(String libraryId, int algoType)
	{
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("libraryId", libraryId);
		map.put("algoType", algoType);
		ServiceLog.debug("删除静态小库检索参数："+map);
		
		CollisionResult result = FaceOperationManager.runOperation(map, FaceOperationEnum.FACEDB_DELETE);
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
	public static CollisionResult saveFaceToLib(String libraryId, Map<Long, String> features, int algoType)
	{	

		Map<String, Object> map = new HashMap<String, Object>();
		map.put("libraryId", libraryId);
		map.put("features", features);
		map.put("algoType", algoType);
		
		CollisionResult result = FaceOperationManager.runOperation(map, FaceOperationEnum.FACEDB_REGISTER);
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
	public static CollisionResult saveFaceToLib(String libraryId, long id, String feature, int algoType)
	{
		Map<Long, String> features = new HashMap<Long, String>();
		features.put(id, feature);
		return saveFaceToLib(libraryId, features, algoType);
	}
	
	/**
	 * 从静态小库注销人脸
	 * @param libraryId
	 * @param ids
	 * @return
	 * @throws SearchEngineException
	 */
	public static CollisionResult deleteFace(String libraryId, String ids, int algoType)
	{
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("libraryId", libraryId);
		map.put("ids", ids);
		map.put("algoType", algoType);
		
		ServiceLog.debug("从静态小库注销人脸参数：" + map);
		CollisionResult result = FaceOperationManager.runOperation(map, FaceOperationEnum.FACEDB_LOGOUT);
		if (result != null) {
			ServiceLog.info("从静态小库注销人脸结果：" + result.toJson());
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
	public static CollisionResult faceOne2NSearch(Map<String, Object> map)
	{
		ServiceLog.debug("静态小库检索1：N参数：" + map);
		CollisionResult result = FaceOperationManager.runOperation(map, FaceOperationEnum.FACEDB_STATIC_ONE2N);
		if (result != null) {
			ServiceLog.debug("静态小库检索1：N结果：" + result.toJson());
		} else {
			ServiceLog.debug("静态小库检索1：N结果：null");
		}
		
		return result;
	}
	
	/**
	 * 静态小库检索1：N
	 * @param map
	 * @return
	 * @throws SearchEngineException
	 */
	public static CollisionResult faceOne2NSearch(String libraryId, int similarity, String feature, int topN, int algoType)
	{
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("libraryId", libraryId);
		map.put("similarity", similarity);
		map.put("feature", feature);
		map.put("topN", topN);
		map.put("algoType", algoType);
		
		return faceOne2NSearch(map);
	}
	
	/**
	 * 静态小库检索M：N
	 * @param map
	 * @return
	 * @throws SearchEngineException
	 */
	public static CollisionResult faceMNSearch(Map<String, Object> map)
	{
		ServiceLog.debug("静态小库检索M：N参数：" + map);
		CollisionResult result = FaceOperationManager.runOperation(map, FaceOperationEnum.FACEDB_STATIC_M2N);
		if (result != null) {
			ServiceLog.debug("静态小库检索M：N结果：" + result.toJson());
		} else {
			ServiceLog.debug("静态小库检索M：N结果：null");
		}
		
		return result;
	}
	
	/**
	 * 静态小库检索M：N
	 * @param map
	 * @return
	 * @throws SearchEngineException
	 */
	public static CollisionResult faceMNSearch(String libraryIds, int similarity, int topN, int eachTopN, int algoType)
	{
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("libraryIds", libraryIds);
		map.put("similarity", similarity);
		map.put("topN", topN);
		map.put("eachTopN", eachTopN);
		map.put("algoType", algoType);
		
		return faceMNSearch(map);
	}
	
	/**
	 * 人脸特征值1：1比对
	 * @param map
	 * @return
	 */
	public static CollisionResult faceFeatureOne2OneSearch(String rltz1, String rltz2, int algoType)
	{
		ServiceLog.debug("人脸特征值1：1比对，rltz1：" + rltz1 + "，rltz2：" + rltz2);
		
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("featureFrom", rltz1);
		map.put("featureTo", rltz2);
		map.put("algoType", algoType);
		
		CollisionResult result = FaceOperationManager.runOperation(map, FaceOperationEnum.FACE_FEA_ONE2ONE);
		if (result != null) {
			ServiceLog.debug("人脸特征值1：1比对结果：" + result.toJson());
		} else {
			ServiceLog.debug("人脸特征值1：1比对结果：null");
		}
		
		return result;
	}
	
	/**
	 * 人脸图片1：1比对
	 * @param map
	 * @return
	 */
	public static CollisionResult facePicOne2OneSearch(String pic1, String pic2, int algoType)
	{
		ServiceLog.debug("人脸图片1：1比对，pic1：" + pic1 + "，pic2：" + pic2);
		
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("urlFrom", pic1);
		map.put("urlTo", pic2);
		map.put("algoType", algoType);
		
		CollisionResult result = FaceOperationManager.runOperation(map, FaceOperationEnum.FACE_URL_ONE2ONE);
		if (result != null) {
			ServiceLog.debug("人脸图片1：1比对结果：" + result.toJson());
		} else {
			ServiceLog.debug("人脸图片1：1比对结果：null");
		}
		
		return result;
	}
} 
