package com.suntek.efacecloud.service;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import com.alibaba.fastjson.JSONObject;
import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.pico.annotation.BeanService;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.efacecloud.dao.FaceFunAlgoDao;

import scala.collection.mutable.HashSet;

/**
 * 人脸算法与菜单关联表
 * @author liuxiang
 * @since 
 * @version 2018年7月18日
 * @Copyright (C)2018 , Suntektech
 */
@LocalComponent(id ="face/faceFunAlgo")
public class FaceFunAlgoService
{
	private FaceFunAlgoDao dao = new FaceFunAlgoDao();
	
	@BeanService(id ="add", description ="添加菜单关联算法")
	public void add(RequestContext context) throws SQLException {
		
		/*Map<String, Object>  map = new HashMap<String, Object>();
			String MENUID = StringUtil.toString(context.getParameter("MENUID"));
			//map.put("MENUID", MENUID);
			
			String[] algoListStr = StringUtil.toString(context.getParameter("ALGO_LIST")).split(",");
			
			String de_score = StringUtil.toString(context.getParameter("DEFAULT_SCORE"));
			
			FaceFunAlgoDao dao = new FaceFunAlgoDao();
			/*for(String algo : algoListStr){
				map.put("ALGORITHM_ID", algo);
				dao.add(map);
			}
			boolean flag = dao.add(MENUID, algoListStr,de_score);
			if(flag){
				context.getResponse().setMessage("批量添加成功");
				context.getResponse().putData("CODE", 0);
			}else {
				context.getResponse().setError("批量添加失败");
			}*/
		String MENUID = StringUtil.toString(context.getParameter("MENUID"));

		String ALGO_LIST = StringUtil.toString(context.getParameter("ALGO_LIST"));

		boolean flag = dao.add(MENUID, ALGO_LIST);
		if (flag) {
			context.getResponse().setMessage("添加成功");
			context.getResponse().putData("CODE", 0);
		} else {
			context.getResponse().setError("添加失败");
		}
			
		
	}
	
	@BeanService(id = "update", description = "修改菜单关联算法" )
	public void update(RequestContext context) throws SQLException{
		
		String MENUID = StringUtil.toString(context.getParameter("MENUID"));
		String ALGO_LIST = StringUtil.toString(context.getParameter("ALGO_LIST"));
		
		boolean flag_update = dao.update(MENUID, ALGO_LIST);
		
		if (flag_update) {
			
			context.getResponse().setMessage("修改指定记录成功");
			context.getResponse().putData("CODE", 0);
		
		} else {
			context.getResponse().setError("修改指定记录失败");
		}
	}
	
	@BeanService(id ="delete", description ="删除菜单关联算法")
	public void delete(RequestContext context) throws SQLException {
		
			String MENUID = StringUtil.toString(context.getParameter("MENUID"));
			
			FaceFunAlgoDao dao = new FaceFunAlgoDao();
			boolean flag = dao.delete(MENUID);
			if(flag){
				context.getResponse().setMessage("批量删除成功");
				context.getResponse().putData("CODE", 0);
			}else {
				context.getResponse().setError("批量删除失败");
			}
	}
	
	@BeanService(id ="query", description ="查询")
	public void query(RequestContext context) throws SQLException {
		
		    String elementId = (String) context.getParameter("elementId");
			FaceFunAlgoDao dao = new FaceFunAlgoDao();
			List<Map<String,Object>> dbList = new ArrayList<Map<String,Object>>();
			dbList = dao.query();
			
			
			
			Map<String, List<Map<String, Object>>> returnList = dbList.stream().collect(Collectors.groupingBy(o->StringUtil.toString(o.get("MENUID"))));
			List<Object> list =  new ArrayList<>();
			for(String key : returnList.keySet()){
				Map<String, Object> algo_scoreMap = new HashMap<String, Object>();
				algo_scoreMap.put("MENUID", key);
				algo_scoreMap.put("FUNNAME", returnList.get(key).get(0).get("FUNNAME"));
				algo_scoreMap.put("ALGO_LIST", returnList.get(key).stream().filter(o->{
					o.remove("ID");
					o.remove("MENUID");
					o.remove("FUNNAME");
					return true;
				}).collect(Collectors.toList()));
				
				list.add(algo_scoreMap);
			}
//			for(Map<String, Object> paramMap : dbList){
//				
//				String MENUID = StringUtil.toString(paramMap.get("MENUID"));
//				String ALGORITHM_ID = StringUtil.toString(paramMap.get("ALGORITHM_ID"));
//				String DEFAULT_SCORE = StringUtil.toString(paramMap.get("DEFAULT_SCORE"));
//				
//				
//				for (int i = 0; i < returnList.size(); i++) {
//					
//					Map<String, List<Map<String, Object>>> reMap = returnList.get(i);
//					//返回值里面的menuid
//					String RE_MENUID = StringUtil.toString(reMap.get("MENUID"));
//					
//					if(MENUID.equals(RE_MENUID)){
//						//ALGO SCORE;
//						Map<String, Object> algo_scoreMap = new HashMap<String, Object>();
//						algo_scoreMap.put("ALGORITHM_ID", ALGORITHM_ID);
//						algo_scoreMap.put("DEFAULT_SCORE", DEFAULT_SCORE);
//						reMap.get(RE_MENUID).add(algo_scoreMap);
//						break;
//					}else {
//						//MENUID,ALGO SCORE;
//						Map<String, List<Map<String, Object>>> map = new HashMap<>();
//						
//						Map<String, Object> algo_scoreMap = new HashMap<String, Object>();
//						algo_scoreMap.put("ALGORITHM_ID", ALGORITHM_ID);
//						algo_scoreMap.put("DEFAULT_SCORE", DEFAULT_SCORE);
//						
//						map.get("MENUID").add(algo_scoreMap);
//						
//					}
//				}
//			}
//			String result = JSONObject.toJSONString(returnList);
			context.getResponse().putData(elementId, list);
			
			/*[{ID=3, ALGORITHM_ID=0404000200, MENUID=EFACE_faceDispatchedCustom}, 
			 * {ID=4, ALGORITHM_ID=0504000100, MENUID=EFACE_faceDispatchedCustom}, 
			 * {ID=5, ALGORITHM_ID=0804000100, MENUID=EFACE_faceDispatchedCustom}, 
			 * {ID=6, ALGORITHM_ID=0404000200, MENUID=EFACE_faceDispatchedSpecial}, 
			 * {ID=7, ALGORITHM_ID=0504000100, MENUID=EFACE_faceDispatchedSpecial}, 
			 * {ID=8, ALGORITHM_ID=0804000100, MENUID=EFACE_faceDispatchedSpecial}, 
			 * {ID=9, ALGORITHM_ID=0404000200, MENUID=EFACE_faceDispatchedCheck}, 
			 * {ID=10, ALGORITHM_ID=0504000100, MENUID=EFACE_faceDispatchedCheck}, 
			 * {ID=11, ALGORITHM_ID=0804000100, MENUID=EFACE_faceDispatchedCheck}]*/
			/*Map<String,List<String>> resultMap = new HashMap<String,List<String>>();
			
			Set<String> menuIdSet = new java.util.HashSet<>();
			for(Map<String,Object> map : resultList){
				String MENUID = StringUtil.toString(map.get("MENUID"));
				menuIdSet.add(MENUID);
			}
			for(String menuId : menuIdSet){
				returnMap.put("MENUID", menuId);
				
				List<String> algoList = new ArrayList<String>();
				for(Map<String,Object> map : resultList){
					if(menuId.equals(StringUtil.toString(map.get("MENUID")))){
						algoMap.put("", value)
						StringUtil.toString(map.get("ALGORITHM_ID"));
					}
				}
				resultMap.put("ALGO_LIST", algoList);
			}
			String result = JSONObject.toJSONString(resultMap);
			
			context.getResponse().putData(elementId, result);*/
		
	}
}
	
