package com.suntek.efacecloud.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.suntek.eap.common.CommandContext;
import com.suntek.eap.common.util.DateUtil;
import com.suntek.eap.core.app.AppHandle;
import com.suntek.eap.pico.annotation.BeanService;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.eaplet.registry.Registry;
import com.suntek.efacecloud.dao.FaceSpecialDao;
import com.suntek.efacecloud.util.Constants;
import com.suntek.efacecloud.util.ModuleUtil;
import com.suntek.sp.common.common.BaseCommandEnum;

/**
 * 人员专题库服务
 * efacecloud/rest/v6/face/special
 * @author lx
 * @since 1.0.0
 * @version 2017-06-29
 * @Copyright (C)2017 , Suntektech
 */
@LocalComponent(id = "face/special")
public class FaceSpecialService 
{	
	private FaceSpecialDao dao = new FaceSpecialDao();
	
	
	@BeanService(id="add",description="创建专题库或修改专题库",type="remote")
	public void addLib(RequestContext context) throws Exception{
		Map<String, Object> params = context.getParameters();
		String dbId = StringUtil.toString(params.get("DB_ID"));
		int dbKind         =  Constants.SPECIAL_LIB_INDIVIDUAL;
		String dbName      =  StringUtil.toString(params.get("DB_NAME"));
		String creator     =  context.getUserCode();
		String createTime  =  DateUtil.getDateTime();
		//修改专题库
		if (!dbId.isEmpty()) {
			dao.updateSpecialLib(dbId, dbName);
			context.getResponse().putData("CODE", 0);
			context.getResponse().putData("MESSAGE", "修改成功");
			return;
		}
		
		//增加专题库		
		CommandContext ctx = new CommandContext(context.getHttpRequest());
		List<Integer> algos = ModuleUtil.getAlgoTypeList();
		params.put("ALGO_TYPE", algos);
		params.put("DB_TYPE", Constants.DICT_CODE_STATIC_LIB_SPECIAL);

		ctx.setBody(params);
		ctx.setOrgCode(context.getUser().getDepartment().getCivilCode());
		ctx.setUserCode(context.getUserCode());

		Registry.getInstance().selectCommands(BaseCommandEnum.staticLibAdd.getUri()).exec(ctx);
	    dbId = StringUtil.toString(ctx.getResponse().getData("DB_ID"));
	    if(ctx.getResponse().getCode() == Constants.RETURN_CODE_SUCCESS && 
	    		!StringUtil.isEmpty(dbId)) {
		    dao.addSpecialLib(dbId, dbKind,  dbName, creator, createTime, algos);
			context.getResponse().putData("MESSAGE", "添加成功");
	    }else {
			context.getResponse().putData("MESSAGE", "保存失败");
	    }
    	context.getResponse().putData("CODE", ctx.getResponse().getCode());
			
	}
	
	@BeanService(id="delete",description="删除专题库")
	public void deleteLib(RequestContext context) throws Exception{
		//前端参数DB_ID
		CommandContext ctx = new CommandContext(context.getHttpRequest());
		Map<String, Object> params = context.getParameters();
		String dbId = StringUtil.toString(params.get("DB_ID"));
		params.put("ALGO_TYPE",ModuleUtil.getAlgoTypeList());
		
		ctx.setBody(params);
		ctx.setOrgCode(context.getUser().getDepartment().getCivilCode());
		ctx.setUserCode(context.getUserCode());
		
		Registry.getInstance().selectCommands(BaseCommandEnum.staticLibDel.getUri()).exec(ctx);
		if (ctx.getResponse().getCode() == 0) {
			dao.deleteSpecialLib(dbId);
			context.getResponse().putData("MESSAGE", "删除成功");	
		}else {
			context.getResponse().putData("MESSAGE", "删除失败");	
		}
    	context.getResponse().putData("CODE", ctx.getResponse().getCode());
	}
	
	@BeanService(id = "getAllInit", description = "获取所有的初始库",type ="remote")
	public void getAllInit(RequestContext context) 
	{
		String elementId = StringUtil.toString(context.getParameter("elementId"));
		context.getResponse().putData(elementId, dao.getAllInitDbList());
	}
	
	
	@BeanService(id = "refresh", description = "刷新对应库的统计信息",type ="remote")
	public void refresh(RequestContext context) throws Exception 
	{
		/*String dbId = StringUtil.toString(context.getParameter("DB_ID"));
		
		Query queryFace = new Query(1, 1);
		queryFace.addEqualCriteria("SOURCE_DB", dbId);
		queryFace.setAggregation("SOURCE_DB");
		Map<Object, Long> statisticsFaceResult = EAP.bigdata.queryStatistics(Constants.PERSON_SPECIAL_LIB_PIC_INDICE, queryFace, Constants.PERSON_SPECIAL_LIB_PIC_INFO);

		
		Query queryPerson = new Query(1, 1);
		queryPerson.addEqualCriteria("SOURCE_DB", dbId);
		queryPerson.setAggregation("SOURCE_DB");
		queryPerson.addBetweenCriteria("PERSON_ID", 0, Long.MAX_VALUE);
		Map<Object, Long> statisticsPersonResult = EAP.bigdata.queryStatistics(Constants.PERSON_SPECIAL_LIB_PIC_INDICE, queryPerson, Constants.PERSON_SPECIAL_LIB_PIC_INFO);*/
		Map<String, Object> params = context.getParameters();
		params.put("pageNo", 1);
		params.put("pageSize", 1);
        CommandContext  ctx = new CommandContext(context.getHttpRequest());
        ctx.setOrgCode(context.getUser().getDepartment().getCivilCode());
        ctx.setUserCode(context.getUserCode());
        ctx.setBody(params);
//        Registry.getInstance().selectCommand(BaseCommandEnum.staticLibFaceQuery.getUri()).exec(ctx); 
        
    	String vendor = AppHandle.getHandle(Constants.OPENGW).getProperty("EAPLET_VENDOR", "Suntek");
    	Registry.getInstance().selectCommand(BaseCommandEnum.staticLibFaceQuery.getUri(), "4401", vendor).exec(ctx);
        
		Map<String, Object> resultMap = new HashMap<>();
		String personNum = "0";
		if (ctx.getResponse().getCode() == 0) {	
			personNum = StringUtil.toString(ctx.getResponse().getData("COUNT"));
		}
		resultMap .put("CAPACITY", 500000);
		resultMap.put("PERSON_NUM", personNum);
		context.getResponse().putData("result",resultMap);
	}

	
	
}
