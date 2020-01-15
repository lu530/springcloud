package com.suntek.efacecloud.provider;

import com.suntek.eap.EAP;
import com.suntek.eap.common.CommandContext;
import com.suntek.eap.dict.DictType;
import com.suntek.eap.jdbc.PageQueryResult;
import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.pico.annotation.BeanService;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.pico.annotation.QueryService;
import com.suntek.eap.util.DateUtil;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.eaplet.registry.Registry;
import com.suntek.efacecloud.util.ConfigUtil;
import com.suntek.efacecloud.util.Constants;
import com.suntek.efacecloud.util.ExcelFileUtil;
import com.suntek.efacecloud.util.FileDowloader;
import com.suntek.efacecloud.util.ModuleUtil;
import com.suntek.sp.common.common.BaseCommandEnum;
import net.sf.json.JSONArray;
import org.apache.commons.collections.MapUtils;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 移动端人脸库查询
 * efacecloud/rest/v6/face/mobileTerminal
 * @author lx
 * @since 1.0.0
 * @version 2017-07-06
 * @Copyright (C)2017 , Suntektech
 */
@LocalComponent(id = "face/terminal")
public class FaceMobileTerminalProvider
{
	@QueryService(id = "query", type="remote", description="移动终端库人脸列表查询")
	public Map<String, Object> query(RequestContext context) throws Exception 
	{
		//前端字段有KEYWORDS, SEX, BEGIN_TIME, END_TIME, AGE, PERMANENT_ADDRESS, PRESENT_ADDRESS, PERSON_TAG, PIC, ALGO_LIST
		CommandContext ctx = new CommandContext(context.getHttpRequest());
		ctx.setUserCode(context.getUserCode());
		
		Map<String, Object> params = context.getParameters();
		params.put("DB_ID", EAP.metadata.getDictValue(Constants.DICT_KIND_STATIC_LIB,Constants.DICT_CODE_STATIC_LIB_TERMINAL));
		String age = StringUtil.toString(params.get("AGE"));
		
		if (!StringUtil.isNull(age)) {
			int ageGroup = Integer.parseInt(age); //年龄段
			String[] timeArr = ModuleUtil.getAgeGroupTime(ageGroup);
			params.put("BORN_START_TIME", timeArr[0]);
			params.put("BORN_END_TIME", timeArr[1]);
			
		}else {
			String beginTime = StringUtil.toString(params.get("BEGIN_TIME"));
			String endTime = StringUtil.toString(params.get("END_TIME"));
			if (!beginTime.isEmpty() && !endTime.isEmpty()) {
				params.put("BORN_START_TIME", beginTime);
				params.put("BORN_END_TIME", endTime);
			}			
		}
		
		ctx.setBody(params); 
//		Registry.getInstance().selectCommands(BaseCommandEnum.staticLibFaceQuery.getUri()).exec(ctx);
		
		String vendor = ConfigUtil.getVendor();
    	Registry.getInstance().selectCommand(BaseCommandEnum.staticLibFaceQuery.getUri(), "4401", vendor).exec(ctx);
    	
		
		long code = ctx.getResponse().getCode();
		if (code == 0) {			
			int count = Integer.valueOf(StringUtil.toString(ctx.getResponse().getData("COUNT")));
			List<Map<String,Object>> records = (List<Map<String, Object>>) ctx.getResponse().getData("RECORDS");
			
			PageQueryResult result = new PageQueryResult(count, records);
			
			List<Map<String, Object>> resultList = result.getResultSet();
			for (Map<String, Object> map : resultList) {
				map.put("PRESENT_ADDRESS_CN",  ModuleUtil.renderPersonAddress(MapUtils.getString(map, "PRESENT_ADDRESS")));//现住地址
			}
			Map<String, Object> map = result.toMap();
			map.put("FILE_ID", ctx.getResponse().getData("CASEFILE_ID"));
			return map;
			
		}else {
			context.getResponse().putData("CODE", code);
			context.getResponse().putData("MESSAGE", ctx.getResponse().getMessage());
			PageQueryResult result = new PageQueryResult(0, Collections.emptyList());
			return result.toMap();
		}
		
		
	}
	
	@SuppressWarnings({ "unchecked", "serial" })
	@BeanService(id="exportFaceSearch",description="移动终端人脸结果导出")
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
			//PageQueryResult result  = query(context);
			excelDataList = (List<Map<String, Object>>)query(context).get("records");;
		}
		
		String[] searchImgHeader = {"检索图片", "匹配图片", "相似度", "姓名", "性别","证件号码","证件类型","人员标签","出生日期","户籍地址","现住地址"};
		String[] searchImgDataKey = {"searchImgUrl", "imageUrl", "SCORE", "NAME", "SEX","IDENTITY_ID","IDENTITY_TYPE","PERSON_TAG","BIRTHDAY","PERMANENT_ADDRESS","PRESENT_ADDRESS"};
		String[] headers = {"图片","姓名","性别","证件号码","证件类型","人员标签","出生日期","户籍地址","现住地址"};
		String[] dataKey =  {"imageUrl","NAME","SEX","IDENTITY_ID","IDENTITY_TYPE","PERSON_TAG","BIRTHDAY","PERMANENT_ADDRESS","PRESENT_ADDRESS"};
		List<Map<String,byte[]>> imgList = new ArrayList<>();
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
		            data.put("PRESENT_ADDRESS", ModuleUtil.renderPersonAddress(StringUtil.toString(data.get("PRESENT_ADDRESS"))));
		            data.put("SEX", EAP.metadata.getDictValue(DictType.P_RECOGNIZE_SEX, StringUtil.toString(data.get("SEX"))));
		            data.put("PERSON_TAG", ModuleUtil.renderPersonTag(StringUtil.toString(data.get("PERSON_TAG"))));
		            data.put("IDENTITY_TYPE", ModuleUtil.renderIdentityType(StringUtil.toString(data.get("IDENTITY_TYPE"))));
				}
	        }  catch (Exception exception) {
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
		            person.put("PRESENT_ADDRESS", ModuleUtil.renderPersonAddress(StringUtil.toString(person.get("PRESENT_ADDRESS"))));
		            person.put("SEX", EAP.metadata.getDictValue(DictType.P_RECOGNIZE_SEX, StringUtil.toString(person.get("SEX"))));
		            person.put("PERSON_TAG", ModuleUtil.renderPersonTag(StringUtil.toString(person.get("PERSON_TAG"))));
		            person.put("IDENTITY_TYPE", ModuleUtil.renderIdentityType(StringUtil.toString(person.get("IDENTITY_TYPE"))));
		    	}
		    }  catch (Exception exception) {
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
