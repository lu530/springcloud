package com.suntek.efacecloud.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.alibaba.fastjson.JSON;
import com.suntek.eap.common.CommandContext;
import com.suntek.eap.pico.annotation.BeanService;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.web.RequestContext;
import com.suntek.eaplet.registry.Registry;
import com.suntek.efacecloud.dao.ForeignerCertificateSearchDao;
import com.suntek.efacecloud.log.Log;
import com.suntek.elastic.rdd.util.StringUtil;

/**
 *  外国人证件检索服务
 * @author admin
 *
 */
@LocalComponent(id = "foreigner/certification")
public class ForeignerCertificateSearchService {
	private static ForeignerCertificateSearchDao certificateDao = new ForeignerCertificateSearchDao();
	
	@SuppressWarnings("unchecked")
	@BeanService(id = "search", description="外籍人系统证件检索功能", since="1.0")
	public void certificateSearch(RequestContext context) throws Exception {
		List<Map<String, Object>> resList = new ArrayList<>();
		Map<String, Object> body = new HashMap<>();
		try{
			String zjhm = com.suntek.eap.util.StringUtil.toString(context.getParameter("zjhm"));
			if(!StringUtil.isEmpty(zjhm)){
				try{
					resList = certificateDao.foreignerCertificateSearch(zjhm);
				}catch(Exception e){
					Log.faceSearchLog.debug("查询表EFACE_FOREIGNER_CRJQZ_INFO异常 >>>>> " + e.getMessage());
				}
				// 本地库不存在, 查找广东省出入境普通签证接口
				if(resList.size() == 0){
					String uri = "extendInfo/gd_ga_crj_wgrcrjjl_ptqz";
					body.put("zjhm", zjhm);
					body.put("orderFields", "xxrsksj");
					body.put("orderSorts", "desc");
					CommandContext commandContext = new CommandContext(context.getHttpRequest());
					commandContext.setBody(body);
					Registry registry = Registry.getInstance();
			        registry.selectCommands(uri).exec(commandContext);
			        Log.faceSearchLog.debug("DATA: " + JSON.toJSONString(commandContext.getResponse().getData("DATA")));
			        Map<String,Object> responseMap = (Map<String,Object>)commandContext.getResponse().getData("DATA");
			        if(null != responseMap){
			        	resList = (List<Map<String, Object>>)responseMap.get("data");
			        	Log.faceSearchLog.debug("DATA: " + resList.toString());
			        	context.getResponse().putData("CODE", 0);
						context.getResponse().putData("MESSAGE", "查询成功");
						context.getResponse().putData("DATA", resList);
			        	// 暂时不落地到本地库
			        	if(resList.size() > 0){
			        		// certificateDao.addForeignerCRJQZInfo(resList);
			        	}
			        }else{
			        	context.getResponse().putData("CODE", commandContext.getResponse().getCode());
			        	context.getResponse().putData("MESSAGE", commandContext.getResponse().getMessage());
			        }
				}else{
					context.getResponse().putData("CODE", 0);
					context.getResponse().putData("MESSAGE", "查询成功");
					context.getResponse().putData("DATA", resList);
				}	
			}
		}catch(Exception e){
			context.getResponse().putData("CODE", 1);
			context.getResponse().putData("MESSAGE", "查询失败");
		}
	}
}
