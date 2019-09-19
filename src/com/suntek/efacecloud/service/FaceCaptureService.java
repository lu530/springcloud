package com.suntek.efacecloud.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang.StringUtils;

import com.suntek.eap.EAP;
import com.suntek.eap.common.CommandContext;
import com.suntek.eap.jdbc.PageQueryResult;
import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.pico.annotation.BeanService;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.util.DateUtil;
import com.suntek.eap.util.IDGenerator;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.eaplet.registry.Registry;
import com.suntek.efacecloud.util.ConfigUtil;
import com.suntek.efacecloud.util.Constants;
import com.suntek.efacecloud.util.ModuleUtil;
import com.suntek.sp.common.common.BaseCommandEnum;

/**
 * 人脸抓拍库服务(频繁出现)
 * efacecloud/rest/v6/face/capture
 * @author wsh
 * @since 1.0.0
 * @version 2017-06-29
 * @Copyright (C)2017 , Suntektech
 */
@LocalComponent(id = "face/capture")
public class FaceCaptureService 
{
	
	@SuppressWarnings("unchecked")
	@BeanService(id = "freqAnalysis", description="人脸抓拍数据频繁出现", since="2.0")
	public void freqAnalysis(RequestContext context) throws Exception 
	{

		Map<String,Object> params = context.getParameters();
		
		CommandContext commandContext = new CommandContext(context.getHttpRequest());
		
		commandContext.setServiceUri(BaseCommandEnum.faceCaptureFreqAnalysis.getUri());
		commandContext.setOrgCode(context.getUser().getDepartment().getCivilCode());
		
		params.put("ALGO_TYPE", ConfigUtil.getAlgoType());
		commandContext.setBody(params);
		
		ServiceLog.debug(" 频繁出现  调用sdk参数:" + params);
		
		Registry registry = Registry.getInstance();
		
        registry.selectCommands(commandContext.getServiceUri()).exec(commandContext);
        
        ServiceLog.debug(" 频繁出现 调用sdk返回结果code:" + commandContext.getResponse().getCode()
	  		       + " message:" + commandContext.getResponse().getMessage()
	  		       + " result:" + commandContext.getResponse().getResult());
        
        long code = commandContext.getResponse().getCode();
        
        if(0L != code) {
        	context.getResponse().setWarn(commandContext.getResponse().getMessage());
        	return;
        }
        
        List<List<Object>> personIds = (List<List<Object>>) commandContext.getResponse().getData("DATA");
        
        List<Map<String, Object>> resultList = new ArrayList<Map<String, Object>>();// 返回到前端的结果集

		for (int i = 0; i < personIds.size(); i++) {
			List<Object> ids = personIds.get(i); // 一个人员出现列表的主键id集合
			resultList.add(handlePersonId(ids));
		}

		// 按出现次数排序
		Collections.sort(resultList,
				(a, b) -> StringUtil.toString(b.get("INFO_ID")).length() - StringUtil.toString(a.get("SCORE")).length());
		
        context.getResponse().putData("DATA", resultList);
        
	}
	
	// 处理同一个的人员列表,一个数据
	private Map<String, Object> handlePersonId(List<Object> ids) {
		
		Map<String, Object> personData = new HashMap<String, Object>();

		String[] idsArr = ModuleUtil.listArrToStrArr(ids);
		String[] indexName = new IDGenerator().getIndexNameFromIds(Constants.FACE_INDEX + "_", idsArr);

		try {
			PageQueryResult pageResult = EAP.bigdata.queryByIds(indexName,Constants.FACE_TABLE, idsArr);
			List<Map<String, Object>> resultSet = pageResult.getResultSet();

			ServiceLog.debug("人脸抓拍es查询条件主键id->" + ids + " ,查询结果-> " + resultSet);

			String infoId = "";
			String objPic = "";
			String jgsk = "";
			String faceScore = "";

			if (resultSet.size() > 0) {
				
				Collections.sort(resultSet, new Comparator<Map<String, Object>>() {

					@Override
					public int compare(Map<String, Object> o1, Map<String, Object> o2) {
						String sk1 = StringUtil.toString(o1.get("JGSK"));
						String sk2 = StringUtil.toString(o2.get("JGSK"));
						return sk2.compareTo(sk1);
					}
				});
				
				objPic = ModuleUtil.renderImage(StringUtil.toString(resultSet.get(0).get("OBJ_PIC")));
				jgsk = StringUtil.toString(resultSet.get(0).get("JGSK"));
				infoId = StringUtil.toString(resultSet.get(0).get("INFO_ID"));
				faceScore = StringUtil.toString(resultSet.get(0).get("FACE_SCORE"));
			}
			personData.put("INFO_ID", infoId);
			personData.put("REPEATS", ids.size());
			personData.put("PIC", objPic);
			personData.put("FACE_SCORE", faceScore);
			personData.put("IDS", StringUtils.join(ids,","));
			personData.put("JGSK", DateUtil.convertByStyle(jgsk, DateUtil.yyMMddHHmmss_style, DateUtil.standard_style));

		} catch (Exception e) {
			ServiceLog.error("es查询有误:handlePersonId()", e);
		}
		return personData;
	}
}
