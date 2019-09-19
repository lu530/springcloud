package com.suntek.efacecloud.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.alibaba.fastjson.JSONObject;
import com.suntek.eap.EAP;
import com.suntek.eap.common.CommandContext;
import com.suntek.eap.common.util.DateUtil;
import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.pico.annotation.BeanService;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.eaplet.registry.Registry;
import com.suntek.efacecloud.dao.FaceArchivesDao;
import com.suntek.efacecloud.util.Constants;
import com.suntek.efacecloud.util.ModuleUtil;
import com.suntek.sp.common.common.BaseCommandEnum;

/**
 * 人员档案库服务 efacecloud/rest/v6/face/archives
 * @author gaosng
 * @since 1.0.0
 * @version 2017-06-29
 * @Copyright (C)2017 , Suntektech
 */
@LocalComponent(id = "face/archives")
public class FaceArchivesService {
	private FaceArchivesDao faceArchivesDao = new FaceArchivesDao();
	private CommandContext ctx;
	
	@BeanService(id = "addPerson", description = "档案库人员新增/编辑")
	public void addPerson(RequestContext context) throws Exception {
		Map<String, Object> parameters = context.getParameters();
		this.ctx = new CommandContext(context.getHttpRequest());
		String personId = StringUtil.toString(parameters.get("PERSON_ID")); //档案id
		String identityId = StringUtil.toString(parameters.get("IDENTITY_ID")); //身份证
		String personTag = StringUtil.toString(parameters.get("PERSON_TAG")); //标签，如[02, 03, 04, 10]
		String[] personTags = StringUtil.isNull(personTag) ? new String[] {}: personTag.split(",");
		
		
		if (!StringUtil.isEmpty(personId)){
			updateArchivePerson(context);
		} else {//档案库人员增加
			parameters.put("ALGO_TYPE", ModuleUtil.getAlgoTypeList());
			Map<String, Object> personMap = faceArchivesDao.queryPersonByIdentytyId(identityId);
			
			if (personMap != null) { //人员档案已经存在				
				ServiceLog.debug("身份证：" + identityId + " 在人员档案库中已存在,更新档案信息");
			    personId = StringUtil.toString(personMap.get("PERSON_ID"));

				parameters.put("CREATOR", context.getUserCode());
				parameters.put("CREATE_TIME", DateUtil.getDateTime()); // 人员档案信息
				JSONObject jo = new JSONObject();
				jo.put("ARCHIVE_PRIMARY_KEY", personId);//数据库档案主键
				parameters.put("EXTRA_INFO", jo);
				
				Map<String, Object> exsistTags = faceArchivesDao.queryTagCodeByPersonId(personId).stream()
						.collect(Collectors.toMap(o -> StringUtil.toString(o.get("TAG_CODE")), o -> o.get("TAG_CODE")));
				
				List<Map<String, Object>> tags = new ArrayList<Map<String, Object>>();
				for (int i = 0; i < personTags.length; i++) {
					if (!exsistTags.containsKey(personTags[i])) {
						Map<String, Object> tag = new HashMap<String, Object>();
						tag.put("ID", EAP.keyTool.getUUID());
						tag.put("TAG_CODE", personTags[i]);
						tag.put("REL_TYPE", Constants.REL_TYPE_PERSON);
						tag.put("REL_ID", personId); // 关联标签库信息
						tags.add(tag);
					}
				}
				
				parameters.put("PERSON_ID", personId); //更新数据库使用
				faceArchivesDao.update(parameters, tags);
				
				parameters.put("DB_ID", EAP.metadata.getDictValue(Constants.DICT_KIND_STATIC_LIB, Constants.DICT_CODE_STATIC_LIB_ARCHIVE));
				ctx.setBody(parameters);
				Registry.getInstance().selectCommands(BaseCommandEnum.staticLibFaceAdd.getUri()).exec(ctx);    //档案库人脸注册				
				if (ctx.getResponse().getCode() == 0) {
					Object personIdObj = ctx.getResponse().getData("PERSON_ID"); //引擎返回人员id
					faceArchivesDao.addRel(personId, personIdObj);
					
					String[] personTagDbArr = StringUtil.toString(parameters.get("PERSON_TAG_DB")).split(","); //标签关联的专题库id
					faceToSpecialAftArchive(ctx.getBody(), personTagDbArr, personIdObj +"");
					long code = ctx.getResponse().getCode();
					context.getResponse().putData("CODE", code);
					if(0L == code) {
						context.getResponse().putData("MESSAGE", "添加成功");
					}else {
						context.getResponse().putData("MESSAGE", "添加失败");
						ServiceLog.error("新增失败，原因：" + ctx.getResponse().getMessage());
						return;
					}					
				}
	
			}else { //人员档案之前不存在				
				parameters.put("DB_ID", EAP.metadata.getDictValue(Constants.DICT_KIND_STATIC_LIB, Constants.DICT_CODE_STATIC_LIB_ARCHIVE));
				long archivePrimaryKey = EAP.keyTool.getIDGenerator();
				
				JSONObject jo = new JSONObject();
				jo.put("ARCHIVE_PRIMARY_KEY", archivePrimaryKey);//数据库档案主键
				parameters.put("EXTRA_INFO", jo);
				
				ctx.setBody(parameters);
				Registry.getInstance().selectCommands(BaseCommandEnum.staticLibFaceAdd.getUri()).exec(ctx);    //人脸注册			
				
				if(ctx.getResponse().getCode() == 0) {
					parameters.put("PERSON_ID", archivePrimaryKey);
					parameters.put("CREATOR", context.getUserCode());
					parameters.put("CREATE_TIME", DateUtil.getDateTime());
					
					List<Map<String, Object>> tags = new ArrayList<Map<String, Object>>();
					for (int i = 0; i < personTags.length; i++) {
						Map<String, Object> tag = new HashMap<String, Object>();
						tag.put("ID", EAP.keyTool.getUUID());
						tag.put("TAG_CODE", personTags[i]);
						tag.put("REL_TYPE", Constants.REL_TYPE_PERSON);
						tag.put("REL_ID", archivePrimaryKey); // 关联标签库信息
						tags.add(tag);
					}
					faceArchivesDao.add(parameters,tags);   //数据库新增档案	
					Object personIdObj = ctx.getResponse().getData("PERSON_ID"); //引擎返回人员id
					faceArchivesDao.addRel(archivePrimaryKey, personIdObj);
					//标签关联的专题库id,如[AT_LARGE_DB, INVOLVED_TERRORISM_DB, INVOLVED_STEADY_DB, FRAUD_DB]
					String[] personTagDbArr = StringUtil.toString(parameters.get("PERSON_TAG_DB")).split(","); 
					String archivePicInfoId = StringUtil.toString(ctx.getResponse().getData("PERSON_ID"));
					faceToSpecialAftArchive(ctx.getBody(), personTagDbArr, archivePicInfoId);
					long code = ctx.getResponse().getCode();
					context.getResponse().putData("CODE", code);
					if(0L == code) {
						context.getResponse().putData("MESSAGE", "添加成功");
					}else {
						context.getResponse().putData("MESSAGE", "添加失败");
						ServiceLog.error("新增失败，原因：" + ctx.getResponse().getMessage());
						return;
					}
					
				}else {
					context.getResponse().putData("CODE", ctx.getResponse().getCode());
					context.getResponse().putData("MESSAGE", "添加失败");
					ServiceLog.error("新增失败，原因：" + ctx.getResponse().getMessage());
				}
			}
		}
	}
	
	/**
	 * 更新档案库人员信息, 档案库人员修改,数据库修改发生在Service，es修改发生在Proxy
	 * @throws Exception 
	 */
	private void updateArchivePerson(RequestContext context) throws Exception {		
		Map<String, Object> params = context.getParameters();
		String personId = StringUtil.toString(params.get("PERSON_ID")); //档案标识
		
		JSONObject jo = new JSONObject();
		jo.put("ARCHIVE_PRIMARY_KEY", personId);
		params.put("EXTRA_INFO", jo);
		params.put("DB_ID", EAP.metadata.getDictValue(Constants.DICT_KIND_STATIC_LIB, Constants.DICT_CODE_STATIC_LIB_ARCHIVE));
		
		CommandContext ctx = new CommandContext(context.getHttpRequest());
		ctx.setOrgCode(context.getUser().getDepartment().getCivilCode());
		ctx.setUserCode(context.getUserCode());
		
		List<Map<String, Object>> personIds = faceArchivesDao.getPersonIdsByArchivePrimaryKey(personId);//相关的人员标识
		for (Map<String, Object> map : personIds) {
			params.put("PERSON_ID", map.get("PERSON_ID")); //人员标识
			ctx.setBody(params);
			Registry.getInstance().selectCommands(BaseCommandEnum.staticLibFaceUpdate.getUri()).exec(ctx);
			
			if(0L != ctx.getResponse().getCode()) {
				context.getResponse().putData("MESSAGE", "更新失败");
				context.getResponse().putData("CODE", ctx.getResponse().getCode());
				ServiceLog.error("更新失败，原因：" + ctx.getResponse().getMessage());
				return;
			}else {
				Object personIdObj = ctx.getResponse().getData("PERSON_ID");
				faceArchivesDao.delRelByPersonId(map.get("PERSON_ID"));
				faceArchivesDao.addRel(personId, personIdObj);
			}
		}
		
		long code = ctx.getResponse().getCode();
		context.getResponse().putData("CODE", code);
		
		if(0L == code) {
			params.put("PERSON_ID", personId);
			faceArchivesDao.update(params);
			context.getResponse().putData("MESSAGE", "更新成功");
		}else {
			context.getResponse().putData("MESSAGE", "更新失败");
			ServiceLog.error("更新失败，原因：" + ctx.getResponse().getMessage());
		}
		
	}
	
	/**
	 * 档案库注册成功后根据选中标签再次注册专题库
	 * @param body 发送到开放平台的参数
	 * @param personTagDbArr 选中的标签集(对应专题库id)
	 * @param archivePicInfoId 档案图片标识
	 * @return
	 * @throws Exception 
	 */
	private void faceToSpecialAftArchive(Map<String,Object> body, String[] personTagDbArr, String archivePicInfoId) throws Exception {
		for (String personTagDb : personTagDbArr) {
			if (!StringUtil.isEmpty(personTagDb)) {
				body.put("DB_ID", personTagDb);
				
				Map<String,Object> jo = (Map<String, Object>) body.get("EXTRA_INFO");			
				jo.put("ARCHIVE_PIC_INFO_ID", archivePicInfoId);				
				body.put("EXTRA_INFO", jo);
				
				Registry.getInstance().selectCommands(BaseCommandEnum.staticLibFaceAdd.getUri()).exec(ctx);    //专题库人脸注册
				
				if (ctx.getResponse().getCode() != 0) return;
				
			}						
		}
	}

	@BeanService(id = "updateArchivesCover", description = "设置档案人员封面")
	public void updateArchivesCover(RequestContext context) throws Exception {
		
		String pic = StringUtil.toString(context.getParameter("PIC"));
		String personId = StringUtil.toString(context.getParameter("PERSON_ID"));
		
		CommandContext ctx = new CommandContext(context.getHttpRequest());
		
		if (faceArchivesDao.updateCover(personId, pic)) {

			context.getResponse().putData("CODE",0);
			context.getResponse().putData("MESSAGE","设置档案人员封面成功");
			ServiceLog.debug("设置档案人员封面成功");
		} else {
			Registry.getInstance().selectCommand(BaseCommandEnum.staticLibFaceDel.getUri()).exec(ctx);
			context.getResponse().putData("CODE",1);
			context.getResponse().putData("MESSAGE","设置档案人员封面失败");
			ServiceLog.error("设置档案人员封面失败");
		}
	}

	@BeanService(id = "deletePerson", description = "档案库人员删除")
	public void deletePerson(RequestContext context) throws Exception {
		Map<String, Object> params = context.getParameters();
		String[] personIds = StringUtil.toString(params.get("PERSON_ID")).split(","); //人员档案库DB主键
		
		CommandContext ctx = new CommandContext(context.getHttpRequest());
		ctx.setOrgCode(context.getUser().getDepartment().getCivilCode());
		
		for(int i = 0; i < personIds.length; i++) {
			
			List<Map<String, Object>> persons = faceArchivesDao.getPersonIdsByArchivePrimaryKey(personIds[i]); 
				
			JSONObject jo = new JSONObject();
			jo.put("ARCHIVE_PRIMARY_KEY", personIds[i]);
			params.put("EXTRA_INFO",jo);
			
			params.put("ALGO_TYPE", ModuleUtil.getAlgoTypeList());
			params.put("DB_ID",EAP.metadata.getDictValue(Constants.DICT_KIND_STATIC_LIB, Constants.DICT_CODE_STATIC_LIB_ARCHIVE));
			params.put("PERSON_ID", persons.stream().map(o->StringUtil.toString(o.get("PERSON_ID"))).collect(Collectors.toList()));
		
			ctx.setBody(params);
			Registry.getInstance().selectCommands(BaseCommandEnum.staticLibFaceDel.getUri()).exec(ctx);
			
			if(0L != ctx.getResponse().getCode()) {
				context.getResponse().putData("CODE", ctx.getResponse().getCode());
				context.getResponse().putData("MESSAGE", "删除失败");
				ServiceLog.error("删除失败，原因：" + ctx.getResponse().getMessage());
				return;
			}
		}
		
		if (ctx.getResponse().getCode() == 0L) {
			faceArchivesDao.deleteById(personIds);
	    	context.getResponse().putData("CODE", ctx.getResponse().getCode());
			context.getResponse().putData("MESSAGE", "删除成功");
		}
	}

	@BeanService(id = "personDetail", description = "档案库人员详情")
	public void personDetail(RequestContext context) throws Exception {

		CommandContext ctx = new CommandContext(context.getHttpRequest());
		ctx.setOrgCode(context.getUser().getDepartment().getCivilCode());
		ctx.setUserCode(context.getUserCode());
		
		Map<String, Object> params = context.getParameters();
		params.put("DB_ID", EAP.metadata.getDictValue(Constants.DICT_KIND_STATIC_LIB, Constants.DICT_CODE_STATIC_LIB_ARCHIVE));
		String archivePrimaryKey = StringUtil.toString(params.get("PERSON_ID"));
		Map<String, Object> person = faceArchivesDao.queryPersonByPersonId(archivePrimaryKey);
		
		List<Map<String, Object>> personIdList = faceArchivesDao.getPersonIdsByArchivePrimaryKey(archivePrimaryKey); //人员标识
		
		ctx.setOrgCode(context.getUser().getDepartment().getCivilCode());
		ctx.setUserCode(context.getUserCode());
		
		List<Map<String,Object>> picList = new ArrayList<>();
		for (Map<String, Object> personMap : personIdList) {
			String personId = StringUtil.toString(personMap.get("PERSON_ID"));		
			params.put("PERSON_ID", personId);
			ctx.setBody(params);	
			Registry.getInstance().selectCommands(BaseCommandEnum.staticLibFaceDetail.getUri()).exec(ctx);
			
			if (ctx.getResponse().getCode() == 0) {
				picList.add(ctx.getResponse().getBody());
			}
		}
		
		List<Map<String, Object>> personTagList = faceArchivesDao.queryTagCodeByPersonId(archivePrimaryKey);
				
		if (ctx.getResponse().getCode() == 0) {
			person.put("PIC_LIST", picList);
			person.put("PERSON_TAG_LIST", personTagList);
			person.put("PERMANENT_ADDRESS_NAME", ModuleUtil
					.renderPersonAddress(StringUtil.toString(person
							.get("PERMANENT_ADDRESS"))));
			person.put("PRESENT_ADDRESS_NAME", ModuleUtil
					.renderPersonAddress(StringUtil.toString(person
							.get("PRESENT_ADDRESS"))));
			context.getResponse().putData("CODE", Constants.RETURN_CODE_SUCCESS);
			context.getResponse().putData("MESSAGE", "获取人员信息成功");
			context.getResponse().putData("DATA", person);
			ServiceLog.debug("获取人员信息成功");
			
		}else {
			context.getResponse().putData("CODE", Constants.RETURN_CODE_ERROR);
			context.getResponse().putData("MESSAGE", "获取人员信息为空");
			ServiceLog.debug("获取失败，原因：获取人员信息为空");
		}
	}
	
//	private List<Map<String, Object>> getPicList(String personId, List<Map<String, Object>> records){
//		
//		List<Map<String, Object>> picList = new ArrayList<Map<String,Object>>();
//		for(Map<String,Object> record : records) {
//			String recordPersonId = StringUtil.toString(record.get("PERSON_ID"));
//			if(recordPersonId.equals(personId)) {
//				picList.add(record);
//			}
//		}
//		return picList;
//	}

	@BeanService(id = "picDelete", description = "档案库人脸删除")
	public void picDelete(RequestContext context) throws Exception {
		Map<String, Object> params = context.getParameters();
		String infoId = StringUtil.toString(params.get("INFO_ID")); //档案库人脸在es中的主键
		
		
		params.put("ALGO_TYPE", ModuleUtil.getAlgoTypeList());
		params.put("DB_ID", EAP.metadata.getDictValue(Constants.DICT_KIND_STATIC_LIB, Constants.DICT_CODE_STATIC_LIB_ARCHIVE));
		params.put("PERSON_ID",infoId);
		
		CommandContext ctx = new CommandContext(context.getHttpRequest());
		ctx.setBody(params);
		Registry.getInstance().selectCommands(BaseCommandEnum.staticLibFaceDel.getUri()).exec(ctx);
		
		if (ctx.getResponse().getCode() == 0) {
			faceArchivesDao.delRelByPersonId(infoId);
		}
		
    	context.getResponse().putData("CODE", ctx.getResponse().getCode());
		context.getResponse().putData("MESSAGE", ctx.getResponse().getMessage());
		
	}

}
