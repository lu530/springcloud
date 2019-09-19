package com.suntek.efacecloud.service;

import java.io.File;
import java.io.IOException;
import java.io.OutputStream;
import java.net.URLEncoder;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletResponse;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.json.simple.JSONValue;

import com.suntek.eap.EAP;
import com.suntek.eap.common.CommandContext;
import com.suntek.eap.dict.DictType;
import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.pico.annotation.BeanService;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.util.DateUtil;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.eaplet.registry.Registry;
import com.suntek.efacecloud.model.ExcelColumn;
import com.suntek.efacecloud.util.Constants;
import com.suntek.efacecloud.util.ExcelUtil;
import com.suntek.efacecloud.util.FileUploadUtil;
import com.suntek.efacecloud.util.ModuleUtil;
import com.suntek.efacecloud.util.PersonImportUtil;
import com.suntek.sp.common.common.BaseCommandEnum;

/**
 * 人员专题库人脸服务
 * efacecloud/rest/v6/face/specialPic
 * @author lx
 * @since 1.0.0
 * @version 2017-06-29
 * @Copyright (C)2017 , Suntektech
 */
@LocalComponent(id = "face/specialPic")
public class FaceSpecialPicService 
{
	
	private static Map<String,String> importErrorMsgCache = new HashMap<String,String>();
	
	@BeanService(id="add",description="专题库新增人脸")
	public void addPerson(RequestContext context) throws Exception{
		CommandContext ctx = new CommandContext(context.getHttpRequest());
		Map<String, Object> params = context.getParameters();
		String dbId = StringUtil.toString(params.get("SOURCE_DB")); //专题库主键

		params.put("ALGO_TYPE", ModuleUtil.getAlgoTypeList());
		params.put("DB_ID", dbId);
		params.put("CREATE_TIME", DateUtil.getDateTime());
		params.put("CREATOR", context.getUserCode());
		
		ServiceLog.debug("专题库新增人脸");
		ServiceLog.debug("参数为["+params+"]");
		ctx.setBody(params);
		ctx.setOrgCode(context.getUser().getDepartment().getCivilCode());
		ctx.setUserCode(context.getUserCode());
		
		Registry.getInstance().selectCommands(BaseCommandEnum.staticLibFaceAdd.getUri()).exec(ctx);
		
		long code = ctx.getResponse().getCode();
		
		context.getResponse().putData("CODE", code);
		
		if(0L == code) {
			ServiceLog.debug("专题库新增人脸成功");
			context.getResponse().putData("MESSAGE", "新增成功");
		}else {
			context.getResponse().putData("MESSAGE", "新增失败");
			ServiceLog.error("新增失败，原因；" + ctx.getResponse().getMessage());
		}
		
	}
	
	@BeanService(id="edit",description="专题库修改人脸")
	public void editPerson(RequestContext context) throws Exception{
		Map<String, Object> params = context.getParameters();
		String dbId = StringUtil.toString(params.get("SOURCE_DB")); //专题库主键

		params.put("ALGO_TYPE", ModuleUtil.getAlgoTypeStr().split(","));
		params.put("DB_ID", dbId);
		params.put("PERSON_ID", params.get("INFO_ID"));
		CommandContext ctx = new CommandContext(context.getHttpRequest());
		
		ServiceLog.debug("专题库修改人脸");
		ServiceLog.debug("参数为["+params+"]");
		ctx.setBody(params);
		ctx.setOrgCode(context.getUser().getDepartment().getCivilCode());
		ctx.setUserCode(context.getUserCode());
		
		ServiceLog.debug("invoke command staticLibFaceUpdate start");
		Registry.getInstance().selectCommands(BaseCommandEnum.staticLibFaceUpdate.getUri()).exec(ctx);
		ServiceLog.debug("invoke command staticLibFaceUpdate end");
		
        long code = ctx.getResponse().getCode();
		
		context.getResponse().putData("CODE", code);
		
		if(0L == code) {
			context.getResponse().putData("MESSAGE", "修改成功");
		}else {
			context.getResponse().putData("MESSAGE", "修改失败");
			ServiceLog.error("修改失败，原因；" + ctx.getResponse().getMessage());
		}
		
	}
	
	@BeanService(id="delete",description="删除专题库人脸")
	public void deletePerson(RequestContext context) throws Exception{
		CommandContext ctx = new CommandContext(context.getHttpRequest());
		ctx.setOrgCode(context.getUser().getDepartment().getCivilCode());
		Map<String, Object> params = context.getParameters();
		
		String sourceDb = StringUtil.toString(params.get("SOURCE_DB"));	//专题库id
		String infoIds = StringUtil.toString(params.get("INFO_ID"));	//专题库人脸标识
		params.put("ALGO_TYPE", ModuleUtil.getAlgoTypeList());
		params.put("PERSON_ID", Arrays.asList(infoIds.split(",")));
		params.put("DB_ID", sourceDb);
		params.remove("INFO_ID");
		
		ServiceLog.debug("专题库删除人脸");
		ServiceLog.debug("参数为["+params+"]");
		ctx.setBody(params);
		Registry.getInstance().selectCommands(BaseCommandEnum.staticLibFaceDel.getUri()).exec(ctx);


        long code = ctx.getResponse().getCode();
		
		context.getResponse().putData("CODE", code);
		
		if(0L == code) {
			context.getResponse().putData("MESSAGE", "删除成功");
		}else {
			context.getResponse().putData("MESSAGE", "删除失败");
			ServiceLog.error("删除失败，原因；" + ctx.getResponse().getMessage());
		}
	}
	
	@BeanService(id = "queryById", description = "获取专题库人脸详情",type ="remote")
	public void queryById(RequestContext context) throws Exception 
	{
		CommandContext ctx = new CommandContext(context.getHttpRequest());
		Map<String, Object> params = context.getParameters();
		String infoId = StringUtil.toString(params.get("INFO_ID"));
		params.put("PERSON_ID", infoId);
		params.put("ALGO_TYPE", ModuleUtil.getAlgoTypeList());
		ctx.setBody(params);
		ctx.setOrgCode(context.getUser().getDepartment().getCivilCode());
		ctx.setUserCode(context.getUserCode());
		
		Registry.getInstance().selectCommands(BaseCommandEnum.staticLibFaceDetail.getUri()).exec(ctx);
    	context.getResponse().putData("CODE", ctx.getResponse().getCode());
		context.getResponse().putData("MESSAGE", ctx.getResponse().getMessage());
		context.getResponse().putData("info", ctx.getResponse().getBody());
	}
	
	@BeanService(id = "export", description = "导出专题库人脸")
	public void export(RequestContext context) throws Exception 
	{
		
		String excelData = StringUtil.toString(context.getParameter("EXPORT_DATA"));
		List<Map<String,Object>> faceList = (List<Map<String,Object>>)JSONValue.parse(excelData);
		renderEsResult(faceList);
		
		ExcelColumn picColumn = new ExcelColumn("PIC", "图片", true);
		ExcelColumn identityColumn = new ExcelColumn("IDENTITY_ID", "证件号码", false);
		ExcelColumn identityTypeColumn = new ExcelColumn("IDENTITY_TYPE_NAME", "证件类型", false);
		ExcelColumn nameColumn = new ExcelColumn("NAME", "姓名", false);
		ExcelColumn sexColumn = new ExcelColumn("SEX_NAME", "性别", false);
		ExcelColumn birthdayColumn = new ExcelColumn("BIRTHDAY", "出生日期", false);
		ExcelColumn permanentAddrColumn = new ExcelColumn("PERMANENT_ADDRESS_NAME", "户籍地址", false);
		ExcelColumn PresentAddrColumn = new ExcelColumn("PRESENT_ADDRESS_NAME", "现住地址", false);
		ExcelColumn scoreColumn = new ExcelColumn("SCORE","相似度",false);
		
		List<ExcelColumn> columns = Arrays.asList(picColumn,identityColumn,identityTypeColumn,nameColumn,sexColumn,birthdayColumn,permanentAddrColumn, PresentAddrColumn, scoreColumn);
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
	
	@BeanService(id = "import", description = "导入专题库人脸")
	public void importPersons(RequestContext context) throws Exception 
	{
		String webAppPath = context.getHttpRequest().getServletContext().getRealPath("/");
		String unZipPath = webAppPath + "unZip";
		String saveFileName = EAP.keyTool.getUUID() + ".zip";

		Map<String,String> fileMap = FileUploadUtil.saveFile(context, webAppPath, saveFileName);
		List<Map<String,Object>> successList = new ArrayList<Map<String,Object>>();
		List<String> failList = new ArrayList<String>();
		try {
		    ServiceLog.debug("专题库人脸导入开始");
			PersonImportUtil.getPersonImportList(webAppPath + File.separator + saveFileName, unZipPath, successList, failList);
		    ServiceLog.debug("解压完成，此次导入数量为：" + successList.size());
	        int successCount = 0;
			FaceSpecialPicService service = new FaceSpecialPicService();
			for(Map<String,Object> map : successList){
				String sourceDb = fileMap.get("SOURCE_DB");
				map.put("SOURCE_DB", sourceDb);
				context.getParameters().putAll(map);
				service.addPerson(context);
				Map<String, Object> result = (Map<String, Object>)context.getResponse().getResult();
				if(StringUtil.toString(result.get("CODE")).equals("0")) {
					successCount++;
				}else {
					failList.add(map.get("NAME") + "注册到库失败," + result.get("MESSAGE"));
				}	
			}
		    ServiceLog.debug("专题库人脸导入完成，成功导入数量为：" + successCount);
			context.getResponse().putData("SUCCESS_COUNT", successCount);
			context.getResponse().putData("FAIL_COUNT", failList.size());
			context.getResponse().putData(Constants.RespCode, Constants.RETURN_CODE_SUCCESS);
			context.getResponse().putData(Constants.RespMessage, "导入成功");
			
			if(failList.size() > 0){
				String timeStamp = StringUtil.toString(Calendar.getInstance().getTimeInMillis());
				importErrorMsgCache.put(timeStamp, StringUtils.join(failList.toArray(new String[failList.size()]),"\n"));
				context.getResponse().putData("ERROR_FILE_ID", timeStamp);
			}		
		} catch (Exception e) {
		    ServiceLog.error("专题库人脸导入异常:" + e);
		    context.getResponse().putData(Constants.RespCode, Constants.RETURN_CODE_ERROR);
		    context.getResponse().putData(Constants.RespMessage, "导入失败");
		}
	}
	
	@BeanService(id="exportErrorMsg",description="导出导入时的错误信息")
	public void exportImportErrorMsg(RequestContext context) throws Exception{
		
		String errorFileId = StringUtil.toString(context.getParameter("ERROR_FILE_ID"));
		OutputStream os = null;
		
		try {
			HttpServletResponse response = context.getHttpResponse();
        	
			response.setHeader(
					"Content-disposition",
					"attachment;success=true;filename ="
							+ URLEncoder.encode("errorMsg.txt", "utf-8"));
			
        	os = response.getOutputStream();
        	os.write(importErrorMsgCache.get(errorFileId).getBytes());
        	importErrorMsgCache.clear();
		} catch (IOException e) {
			ServiceLog.error("导出错误信息异常->" + e.getMessage());
		}finally{
			if(null != os){
				os.close();
			}
		}
	}
}
