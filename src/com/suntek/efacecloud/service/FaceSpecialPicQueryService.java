package com.suntek.efacecloud.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.collections.MapUtils;

import com.suntek.eap.EAP;
import com.suntek.eap.index.Query;
import com.suntek.eap.index.SearchEngineException;
import com.suntek.eap.jdbc.PageQueryResult;
import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.pico.annotation.BeanService;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.efacecloud.util.Constants;
import com.suntek.efacecloud.util.FaceFeatureUtil;
import com.suntek.efacecloud.util.FaceFeatureUtil.FeatureResp;
import com.suntek.efacecloud.util.ModuleUtil;
import com.suntek.efacecloud.util.SdkStaticLibUtil;
import com.suntek.face.compare.sdk.model.CollisionResult;

/**
 * 人员专题库人脸图片检索服务
 * efacecloud/rest/v6/face/specialPic
 * @author lx
 * @since 1.0.0
 * @version 2017-07-17
 * @Copyright (C)2017 , Suntektech
 */
@LocalComponent(id = "face/specialPic")
public class FaceSpecialPicQueryService 
{
	@SuppressWarnings("unchecked")
	@BeanService(id="queryTopN",description="专题库人脸图片topN检索",type="remote")
	public Object queryTopN(RequestContext context) 	
	{
		PageQueryResult  result = new PageQueryResult(0,  new ArrayList<>());
		
		Map<String, Integer> scoreMap = new HashMap<String, Integer>();
		
		String dbId = StringUtil.toString(context.getParameter("DB_ID"));
		String pic = StringUtil.toString(context.getParameter("PIC"));
		int threshold = Integer.valueOf(StringUtil.toString(context.getParameter("THRESHOLD")));
		int topN = Integer.valueOf(StringUtil.toString(context.getParameter("TOPN")));
		
		FeatureResp featureResp = FaceFeatureUtil.faceQualityCheck(ModuleUtil.renderImage(pic));
		if(!featureResp.isValid()){
			context.getResponse().setError("人脸质量检测不通过，原因：" + featureResp.getErrorMsg());
			ServiceLog.error("人脸质量检测不通过，原因：" + featureResp.getErrorMsg());
			return result;
		}
		
		Map<String,Object> one2Nparams = new HashMap<String,Object>();
		one2Nparams.put("libraryId", dbId);
		one2Nparams.put("similarity", threshold);
		one2Nparams.put("feature", featureResp.getRltz());
		one2Nparams.put("topN", topN);
		
		try {
			CollisionResult collisionResult = SdkStaticLibUtil.faceOne2NSearch(one2Nparams);
			List<Long> idList = new ArrayList<Long>();
			if (collisionResult != null && collisionResult.getCode() ==0) {
				List<Map<String, Object>> collisionList = collisionResult.getList();
				for (Map<String, Object> map : collisionList) {
					String id = MapUtils.getString(map, "ID");
					int score = MapUtils.getIntValue(map, "SIMILARITY");
					scoreMap.put(id, score);
					idList.add(Long.valueOf(id));
				}
			} else {
				context.getResponse().putData("CODE", Constants.RETURN_CODE_ERROR);
				context.getResponse().putData("MESSAGE", "查询失败，调用大数据服务异常！");
				return result;
			}
			
			Query query = new Query(1, topN); 
			query.addEqualCriteria("INFO_ID", idList.toArray());
			
			result = EAP.bigdata.query(Constants.PERSON_SPECIAL_LIB_PIC_INDICE, Constants.PERSON_SPECIAL_LIB_PIC_INFO, query);
			List<Map<String, Object>> resultList = result.getResultSet();
			for (Map<String, Object> map : resultList) {
				String infoId = MapUtils.getString(map, "INFO_ID");
				map.put("SCORE", scoreMap.get(infoId));
				map.put("PRESENT_ADDRESS", ModuleUtil.renderPersonAddress(StringUtil.toString(map.get("PRESENT_ADDRESS"))));
				map.put("INFO_ID", StringUtil.toString(map.get("INFO_ID")));
			}
			
		} catch (SearchEngineException e) {
			ServiceLog.error(e);
		}
		
		return result;
	}
}
