package com.suntek.efacecloud.provider;
import com.suntek.eap.EAP;
import com.suntek.eap.common.CommandContext;
import com.suntek.eap.dict.DictType;
import com.suntek.eap.jdbc.PageQueryResult;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.pico.annotation.QueryService;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.eaplet.registry.Registry;
import com.suntek.efacecloud.model.ExcelColumn;
import com.suntek.efacecloud.util.ConfigUtil;
import com.suntek.efacecloud.util.Constants;
import com.suntek.efacecloud.util.ExcelUtil;
import com.suntek.efacecloud.util.ModuleUtil;
import com.suntek.sp.common.common.BaseCommandEnum;
import org.apache.commons.collections.MapUtils;
import org.json.simple.JSONValue;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * 人员专题库人脸查询
 * efacecloud/rest/v6/face/specialPic
 * @author lx
 * @since 1.0.0
 * @version 2017-06-29
 * @Copyright (C)2017 , Suntektech
 */
@LocalComponent(id = "face/specialPic")
public class FaceSpecialPicEsProvider 
{
	@QueryService(id = "query",type= "remote")
	public Map<String, Object> query(RequestContext context) throws Exception 
	{		
		//前端字段 PIC, DB_ID, AGE, BEGIN_TIME, END_TIME, KEYWORDS, PERMANENT_ADDRESS, PRESENT_ADDRESS, ALGO_LIST
		Map<String, Object> params = context.getParameters();
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
		
        CommandContext  ctx = new CommandContext(context.getHttpRequest());
        ctx.setOrgCode(context.getUser().getDepartment().getCivilCode());
        ctx.setUserCode(context.getUserCode());
        ctx.setBody(params);
        
        Registry registry = Registry.getInstance();
//        registry.selectCommand(BaseCommandEnum.staticLibFaceQuery.getUri()).exec(ctx); 
        String vendor = ConfigUtil.getVendor();
        registry.selectCommand(BaseCommandEnum.staticLibFaceQuery.getUri(), "4401", vendor).exec(ctx);
        
		long code = ctx.getResponse().getCode();
		if (code == 0) {			
			int count = Integer.valueOf(StringUtil.toString(ctx.getResponse().getData("COUNT")));
			List<Map<String,Object>> records = (List<Map<String, Object>>) ctx.getResponse().getData("RECORDS");
			PageQueryResult result = new PageQueryResult(count, records);
			Map<String, Object> map = result.toMap();
			map.put("FILE_ID", ctx.getResponse().getData("CASEFILE_ID"));
			return map;
		}else {
			context.getResponse().setError(ctx.getResponse().getMessage());
			PageQueryResult result = new PageQueryResult(0, Collections.emptyList());
			return result.toMap();
		}
	}
	
	@QueryService(id = "exportProvider", description = "人员专题库导出")
	public void exportProvider(RequestContext context) throws Exception 
	{   
		String excelData = StringUtil.toString(context.getParameter("EXPORT_DATA"));
		List<Map<String,Object>> faceList = new ArrayList<Map<String,Object>>();
		
		if (StringUtil.isNull(excelData)) {
			context.putParameter("pageNo", "1");
			context.putParameter("pageSize", Constants.EXPORT_MAX_COUNT);
			faceList = (List<Map<String, Object>>)query(context).get("records");
			renderEsResult(faceList);
		} else {
			faceList = (List<Map<String,Object>>)JSONValue.parse(excelData);
			renderEsResult(faceList);
		}
		
		ExcelColumn picColumn = new ExcelColumn("PIC", "图片", true);
		ExcelColumn identityColumn = new ExcelColumn("IDENTITY_ID", "证件号码", false);
		ExcelColumn identityTypeColumn = new ExcelColumn("IDENTITY_TYPE_NAME", "证件类型", false);
		ExcelColumn nameColumn = new ExcelColumn("NAME", "姓名", false);
		ExcelColumn sexColumn = new ExcelColumn("SEX_NAME", "性别", false);
		ExcelColumn birthdayColumn = new ExcelColumn("BIRTHDAY", "出生日期", false);
		ExcelColumn PermanentAddrColumn = new ExcelColumn("PERMANENT_ADDRESS_NAME", "户籍地址", false);
		ExcelColumn PresentAddrColumn = new ExcelColumn("PRESENT_ADDRESS_NAME", "现住地址", false);
		
		List<ExcelColumn> columns = Arrays.asList(picColumn,identityColumn,identityTypeColumn,nameColumn,sexColumn,birthdayColumn,PermanentAddrColumn,PresentAddrColumn);
		String sheetName = "专题库人脸导出" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
		
		ExcelUtil.export(sheetName, columns, faceList, context.getHttpResponse());
	}
	
	private void renderEsResult(List<Map<String,Object>> list) {
		for(Map<String,Object> map : list) {
			String infoId = MapUtils.getString(map, "INFO_ID");
			map.put("PIC", ModuleUtil.renderImage(StringUtil.toString(map.get("PIC"))));
			map.put("PERSON_ID", StringUtil.toString(map.get("PERSON_ID")));
			map.put("INFO_ID", infoId);
			map.put("PERMANENT_ADDRESS_NAME", ModuleUtil.renderPersonAddress(StringUtil.toString(map.get("PERMANENT_ADDRESS"))));
			map.put("PERMANENT_ADDRESS", StringUtil.toString(map.get("PERMANENT_ADDRESS")));
			map.put("PRESENT_ADDRESS_NAME",  ModuleUtil.renderPersonAddress(StringUtil.toString(map.get("PRESENT_ADDRESS"))));
			map.put("PRESENT_ADDRESS", StringUtil.toString(map.get("PRESENT_ADDRESS")));
			map.put("ARCHIVE_PIC_INFO_ID", StringUtil.toString(map.get("ARCHIVE_PIC_INFO_ID")));
			map.put("BIRTHDAY", ModuleUtil.renderBirthday(StringUtil.toString(map.get("BIRTHDAY"))));
			map.put("SEX_NAME", EAP.metadata.getDictValue(DictType.P_RECOGNIZE_SEX, StringUtil.toString(map.get("SEX"))));
			map.put("IDENTITY_TYPE_NAME", ModuleUtil.renderIdentityType(StringUtil.toString(map.get("IDENTITY_TYPE"))));
		}
	}
}
