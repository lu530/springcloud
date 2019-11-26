package com.suntek.efacecloud.provider;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.suntek.eap.core.app.AppHandle;
import com.suntek.efacecloud.util.*;
import net.sf.json.JSONArray;

import org.apache.commons.collections.MapUtils;

import com.suntek.eap.EAP;
import com.suntek.eap.dict.DictType;
import com.suntek.eap.jdbc.PageQueryResult;
import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.pico.annotation.BeanService;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.pico.annotation.QueryService;
import com.suntek.eap.tag.grid.ExportGridDataProvider;
import com.suntek.eap.util.DateUtil;
import com.suntek.eap.util.SqlUtil;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.efacecloud.util.FaceFeatureUtil.FeatureResp;
import com.suntek.face.compare.sdk.model.CollisionResult;

/**
 * 红名单人脸库查询
 * efacecloud/rest/v6/face/redlist
 * @author lx
 * @since 1.0.0
 * @version 2018-03-05
 * @Copyright (C)2018 , Suntektech
 */
@LocalComponent(id = "face/redlist")
public class FaceRedListProvider extends ExportGridDataProvider
{
	private Map<String, Integer> scoreMap = new HashMap<String, Integer>();
	
	private String pic = "";
	
	@Override
	protected String buildCountSQL() 
	{
		String sql = "select count(1) from EFACE_RED_LIST where 1=1 " + this.getOptionalStatement();
		return sql;
	}

	@Override
	protected String buildQuerySQL() 
	{
		String sql = "select INFO_ID, RLTZ, NAME, SEX, PIC, IDENTITY_TYPE, IDENTITY_ID, BIRTHDAY, PERMANENT_ADDRESS, PRESENT_ADDRESS, PIC_QUALITY, CREATOR, CREATE_TIME from EFACE_RED_LIST where 1=1 " + this.getOptionalStatement();
		return sql;
	}

	@Override
	protected void prepare(RequestContext context) 
	{
		context.putParameter("sort", "CREATE_TIME desc");
		
		String keywords = (String) context.getParameter("KEYWORDS"); //搜索关键字
		String sex = (String) context.getParameter("SEX"); //性别
		String beginTime = (String) context.getParameter("BEGIN_TIME"); //出生日期
		String endTime = (String) context.getParameter("END_TIME"); //出生日期
		String age = (String) context.getParameter("AGE"); //年龄段
		String permanentAaddress = (String) context.getParameter("PERMANENT_ADDRESS"); //户籍地址
		String presentAddress = (String) context.getParameter("PRESENT_ADDRESS"); //现住地址
		
		if(!StringUtil.isNull(age)){
			int ageGroup = Integer.parseInt(age); //年龄段
			String[] timeArr = ModuleUtil.getAgeGroupTime(ageGroup);
			addOptionalStatement(" and BIRTHDAY between ? and ?");
			addParameter(timeArr[0]);
			addParameter(timeArr[1]);
		}else if(!StringUtil.isNull(beginTime) && !StringUtil.isNull(endTime)){
			addOptionalStatement(" and BIRTHDAY between ? and ?");
			addParameter(beginTime);
			addParameter(endTime);
		}
		
		if (!StringUtil.isNull(sex)) {
			addOptionalStatement(" and SEX = ?");
			addParameter(sex);
		}
		
		if (!StringUtil.isNull(keywords)) {
			addOptionalStatement(" and (NAME like ? or IDENTITY_ID like ?)");
			addParameter("%" + keywords + "%");
			addParameter("%" + keywords + "%");
		}
		
		if (!StringUtil.isNull(permanentAaddress)) {
			addOptionalStatement(" and PERMANENT_ADDRESS like ?");
			addParameter(permanentAaddress + "%");
		}
		
		if (!StringUtil.isNull(presentAddress)) {
			addOptionalStatement(" and PRESENT_ADDRESS like ?");
			addParameter(presentAddress + "%");
		}
	}
	
	/**
	 * 调用人脸检索接口
	 * @param context
	 * @return true 需要继续查询流程； false :直接退出查询流程
	 */
	public boolean prepareForSearch(RequestContext context){
		String vendor = AppHandle.getHandle(Constants.OPENGW).getProperty("EAPLET_VENDOR", "Suntek");
		String threshold = StringUtil.toString(context.getParameter("THRESHOLD")); //阈值
		String elementId = StringUtil.toString(context.getParameter("elementId"));
		List<Long> idList = new ArrayList<Long>();
		CollisionResult collisionResult = null;
		if(vendor.equals(Constants.HIK_VENDOR)){
			Map<String, Object> params = new HashMap<>();
			params.put("TOP_N", 30);
			params.put("PIC", pic);
			params.put("THRESHOLD", "0."+threshold);
			collisionResult = HikSdkRedLibUtil.faceOne2NSearch(Constants.STATIC_LIB_ID_RED_LIST, params);
		}else{
			FeatureResp featureResp = FaceFeatureUtil.faceQualityCheck(ModuleUtil.renderImage(pic));
			if(!featureResp.isValid()){
				ServiceLog.error("人脸质量检测不通过，原因：" + featureResp.getErrorMsg());
				context.getResponse().setError("人脸质量检测不通过，原因：" + featureResp.getErrorMsg());
				return false;
			}
			Map<String, Object> picSearchParam = new HashMap<String, Object>();
			picSearchParam.put("libraryId", Constants.STATIC_LIB_ID_RED_LIST);
			picSearchParam.put("similarity", Integer.parseInt(threshold));
			picSearchParam.put("feature", featureResp.getRltz());
			picSearchParam.put("topN", 10000000);
			picSearchParam.put("algoType", Constants.DEFAULT_ALGO_TYPE);
			
			collisionResult = SdkStaticLibUtil.faceOne2NSearch(picSearchParam);
			
		}
		if (collisionResult != null && collisionResult.getCode() == 0) {
			List<Map<String, Object>> collisionList = collisionResult.getList();
			for (Map<String, Object> map : collisionList) {
				String id = MapUtils.getString(map, "ID");
				int score = MapUtils.getIntValue(map, "SIMILARITY");
				scoreMap.put(id, score);
				idList.add(Long.valueOf(id));
			}
		}else{
			context.getResponse().setError("检索失败，原因：" + collisionResult.getMessage());
			return false;
		}
		if (idList.size() > 0) {
			addOptionalStatement(" and INFO_ID in " + SqlUtil.getSqlInParams(idList.toArray()));
			for (int i = 0; i < idList.size(); i++) {
				addParameter(idList.get(i));
			}
		}else{
			context.getResponse().putData(elementId, new PageQueryResult(0, new ArrayList<>()));
			return false;
		}
		return true;
	}
	
	@QueryService(id = "query", isLog = "true", description = "红名单人脸库查询")
	public PageQueryResult query(RequestContext context) 
	{
		PageQueryResult result = new PageQueryResult(0, new ArrayList<Map<String,Object>>());
		pic = (String) context.getParameter("PIC"); //图片
		if(!StringUtil.isEmpty(pic)){
			 if(!this.prepareForSearch(context)){
				 return result;
			 }
		}
		try {
			result = getData(context);
			List<Map<String, Object>> resultList = result.getResultSet();
			for (Map<String, Object> map : resultList) {
				String infoId = MapUtils.getString(map, "INFO_ID");
				if (scoreMap.containsKey(infoId)) {
					map.put("SCORE", scoreMap.get(infoId));
				}
				map.put("INFO_ID", StringUtil.toString(map.get("INFO_ID")));
				map.put("PIC", ModuleUtil.renderImage(StringUtil.toString(map.get("PIC"))));
				map.put("PERMANENT_ADDRESS", StringUtil.toString(map.get("PERMANENT_ADDRESS")));
				map.put("PRESENT_ADDRESS_CODE", StringUtil.toString(map.get("PRESENT_ADDRESS")));
				map.put("PRESENT_ADDRESS", ModuleUtil.renderPersonAddress(MapUtils.getString(map, "PRESENT_ADDRESS")));
			}
			
			if (!scoreMap.isEmpty()) {//scoreMap非空说明是图片检索结果，则根据分数倒序排序
				Collections.sort(resultList, new Comparator<Map<String, Object>>() {
		            @Override
					public int compare(Map<String, Object> o1, Map<String, Object> o2) {
		                Integer score1 = Integer.valueOf(StringUtil.toString(o1.get("SCORE"), "0"));
		                Integer score2 = Integer.valueOf(StringUtil.toString(o2.get("SCORE"), "0"));
		                return score2.compareTo(score1);
		            }
		        });
			}
			
			String img= StringUtil.toString(context.getParameter("PIC"));
			if (!StringUtil.isNull(img)) {// 人脸检索
				int pageSize = Integer.parseInt(StringUtil.toString(context.getParameter("pageSize"), "20"));
				if (resultList.size() >= pageSize) {
					List<Map<String, Object>> subList = resultList.subList(0, pageSize);
					result = new PageQueryResult(subList.size(), subList);
				}
			}
		} catch (Exception e) {
			ServiceLog.error(e);
			context.getResponse().putData("CODE", Constants.RETURN_CODE_ERROR);
			context.getResponse().putData("MESSAGE", "查询失败！");
		}
		
		return result;
	}
	
	@SuppressWarnings({ "unchecked", "serial" })
	@BeanService(id="exportFaceSearch",description="红名单库人脸结果导出")
	public void faceExport(RequestContext context) throws Exception
	{
		String searchImg= StringUtil.toString(context.getParameter("SEARCH_IMG_URL"));
		String excelData = StringUtil.toString(context.getParameter("EXPORT_DATA"));
		List<Map<String,Object>> excelDataList = new ArrayList<Map<String,Object>>();
		if (!StringUtil.isNull(excelData)) {
			excelDataList = JSONArray.fromObject(excelData);
		} else {
			context.putParameter("pageNo", "1");
			context.putParameter("pageSize", Constants.EXPORT_MAX_COUNT);
			PageQueryResult result  = query(context);
			excelDataList = result.getResultSet();
			String img= StringUtil.toString(context.getParameter("PIC"));
			if(!StringUtil.isEmpty(img)){   //人脸检索
				int pageSize = Integer.parseInt(StringUtil.toString(context.getParameter("pageSize"), "20"));
				if(excelDataList.size() >= pageSize){
					excelDataList = excelDataList.subList(0, pageSize);
				}
			}
		}
		
		String[] searchImgHeader = {"检索图片", "匹配图片", "相似度", "姓名", "性别","证件号码","证件类型","出生日期","户籍地址","现住地址"};
		String[] searchImgDataKey = {"searchImgUrl", "imageUrl", "SCORE", "NAME", "SEX","IDENTITY_ID","IDENTITY_TYPE","BIRTHDAY","PERMANENT_ADDRESS","PRESENT_ADDRESS"};
		String[] headers = {"图片","姓名","性别","证件号码","证件类型","出生日期","户籍地址","现住地址"};
		String[] dataKey =  {"imageUrl","NAME","SEX","IDENTITY_ID","IDENTITY_TYPE","BIRTHDAY","PERMANENT_ADDRESS","PRESENT_ADDRESS"};
		List<Map<String,byte[]>> imgList = new ArrayList<Map<String,byte[]>>();
		if (!StringUtil.isEmpty(searchImg)) {
			headers = searchImgHeader;
			dataKey = searchImgDataKey;
	        try {
	        	byte[] searchImgUrl = FileDowloader.getImageFromUrl(searchImg);
				for (Object obj : excelDataList) {
					Map<String, Object> data = (Map<String, Object>) obj;
					byte[] imageUrl = FileDowloader.getImageFromUrl(StringUtil.toString(data.get("PIC")));
					imgList.add(new HashMap<String, byte[]>() {{
							put("searchImgUrl", searchImgUrl);
							put("imageUrl", imageUrl);
						}
					});
					data.put("PERMANENT_ADDRESS", ModuleUtil.renderPersonAddress(StringUtil.toString(data.get("PERMANENT_ADDRESS"))));
		            data.put("PRESENT_ADDRESS", ModuleUtil.renderPersonAddress(StringUtil.toString(data.get("PRESENT_ADDRESS_CODE"))));
		            data.put("SEX", EAP.metadata.getDictValue(DictType.P_RECOGNIZE_SEX, StringUtil.toString(data.get("SEX"))));
		            data.put("IDENTITY_TYPE", ModuleUtil.renderIdentityType(StringUtil.toString(data.get("IDENTITY_TYPE"))));
				}
	        }  catch (Exception exception) {
	        	context.getResponse().setError("导出失败！");
	            ServiceLog.error("faceExport异常",exception);
	            throw exception;
	        }
		} else {
		    try {
		    	for (Map<String,Object> person : excelDataList){
		            byte[] imageUrl = FileDowloader.getImageFromUrl(StringUtil.toString(person.get("PIC")));
		            imgList.add(new HashMap<String,byte[]>(){{
		                put("imageUrl", imageUrl);
		            }});
		            person.put("PERMANENT_ADDRESS", ModuleUtil.renderPersonAddress(StringUtil.toString(person.get("PERMANENT_ADDRESS"))));
		            person.put("PRESENT_ADDRESS", ModuleUtil.renderPersonAddress(StringUtil.toString(person.get("PRESENT_ADDRESS_CODE"))));
		            person.put("SEX", EAP.metadata.getDictValue(DictType.P_RECOGNIZE_SEX, StringUtil.toString(person.get("SEX"))));
		            person.put("IDENTITY_TYPE", ModuleUtil.renderIdentityType(StringUtil.toString(person.get("IDENTITY_TYPE"))));
		    	}
		    }  catch (Exception exception) {
		    	context.getResponse().setError("导出失败！");
		        ServiceLog.error("personExport异常",exception);
		        throw exception;
		    }
		}
		
	  boolean returnCodeEnum = ExcelFileUtil.exportExcelFile2Req(
	            "导出结果" + com.suntek.eap.util.calendar.DateUtil.formatDate(DateUtil.getDateTime(), "yyyyMMddHHmmss"),
	            headers, dataKey,  excelDataList, imgList,  context);

	    if (!returnCodeEnum){
	        context.getResponse().setError("导出失败！");
	    }
	}
}
