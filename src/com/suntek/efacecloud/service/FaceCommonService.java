package com.suntek.efacecloud.service;

import java.util.*;
import java.util.Map.Entry;
import java.util.stream.Collectors;

import com.suntek.eap.common.CommandContext;
import com.suntek.eap.common.log.ServiceLog;
import com.suntek.eap.core.app.AppHandle;
import com.suntek.eap.metadata.EAPMetadata;
import com.suntek.eap.org.UserModel;
import com.suntek.eap.pico.annotation.BeanService;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.pico.annotation.QueryService;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.eaplet.registry.Registry;
import com.suntek.efacecloud.dao.FaceAlgorithmNameDao;
import com.suntek.efacecloud.dao.FaceAlgorithmTypeDao;
import com.suntek.efacecloud.dao.FaceCommonDao;
import com.suntek.efacecloud.util.Constants;
import com.suntek.sp.common.common.BaseCommandEnum;

/**
 * 人脸公共服务
 * efacecloud/rest/v6/face/common
 * @author lx
 * @since 1.0.0
 * @version 2017-06-29
 *  (C)2017 , Suntektech
 */
@LocalComponent(id = "face/common", isLog = "true")
public class FaceCommonService {
	private FaceCommonDao commonDao = new FaceCommonDao();
	
	FaceAlgorithmNameDao algonameDao = new FaceAlgorithmNameDao();
	
	@QueryService(id="getFaceDetect", description="获取人脸抓拍树信息详情", since="1.0")
	public void queryFaceDetect(RequestContext context) {
		String elementId = (String) context.getParameter("elementId");
		String userCode = context.getUserCode();
		UserModel user = context.getUser();
		List<Map<String, Object>> detectTreeList = commonDao.getDetectTree(true, userCode, user, Constants.DEVICE_TYPE_FACE);
		context.getResponse().putData(elementId, detectTreeList);
	}
	
	@QueryService(id="getFaceAlgoList", description="获取人脸算法类型列表", since="1.0", type= "remote")
	public void getFaceAlgoList(RequestContext context) {
		String elementId = (String) context.getParameter("elementId");
		List<Map<String, Object>> result = new ArrayList<>();
		//先从缓存拿算法，拿不到则从数据库拿
		Map<Object, Object> dictMap = EAPMetadata.dict.getDictMap(Constants.DICT_KIND_ALGORITHM_TYPE);
		if(dictMap != null) {
			FaceAlgorithmTypeDao algoDao = new FaceAlgorithmTypeDao();
			result = algoDao.getAlgorithTypeList();
		}else {
			for(Entry<Object, Object> entry : dictMap.entrySet()) {
				result.add((Map<String, Object>)entry.getValue());
			}
			
		}
		context.getResponse().putData(elementId, result);
	}
	
	@QueryService(id="getFaceAlgoType", description="获取公共服务人脸算法名字", type="remote")
	public void getCommonFaceAlgoListName(RequestContext context) {
		
		String elementId = (String) context.getParameter("elementId");
		
		String menuId = (String) context.getParameter("MENUID");
		List<Map<String,Object>> result = new ArrayList<Map<String,Object>>();
		result = algonameDao.getAlgorithNameList(menuId);
		
		context.getResponse().putData(elementId, result);
	}

	@BeanService(id = "feishiAlgoList", description = "新飞识算法列表",type = "remote")
	public void feishiAlgoList(RequestContext context) throws Exception {
		String faceType = AppHandle.getHandle(Constants.OPENGW).getProperty("FEISHI_TYPE", "0");
		if("2".equals(faceType)) {
			CommandContext commandContext = new CommandContext(context.getHttpRequest());
			commandContext.setServiceUri(BaseCommandEnum.feishiAlgoList.getUri());
			commandContext.setBody(context.getParameters());
			Registry.getInstance().selectCommand(commandContext.getServiceUri()).exec(commandContext);
			List<Map<String, Object>> responseData = (List<Map<String, Object>>) commandContext.getResponse().getData("ALGO_LIST");
			context.getResponse().putData("CODE", commandContext.getResponse().getCode());
			context.getResponse().putData("MESSAGE", commandContext.getResponse().getMessage());
			context.getResponse().putData("DATA", responseData);
		}else {//待拓展：根据faceType查询返回算法列表
//			context.getResponse().putData("CODE", 0);
//			context.getResponse().putData("MESSAGE", "成功");
//			context.getResponse().putData("DATA", CommonUtil.getFeishiAlgoList());//旧飞识
			context.getResponse().putData("CODE", 0);
			context.getResponse().putData("MESSAGE", "成功");
			context.getResponse().putData("DATA", null);
		}
	}

	@BeanService(id = "feishiAlgoLib", description = "新飞识人员库列表",type = "remote")
	public void feishiAlgoLib(RequestContext context) throws Exception {
		String faceType = AppHandle.getHandle(Constants.OPENGW).getProperty("FEISHI_TYPE", "0");
		if("2".equals(faceType)) {//飞识算法
			CommandContext commandContext = new CommandContext(context.getHttpRequest());
			commandContext.setServiceUri(BaseCommandEnum.feishiFaceDbList.getUri());
			commandContext.setBody(context.getParameters());
			Registry.getInstance().selectCommand(commandContext.getServiceUri()).exec(commandContext);
			List<Map<String, Object>> responseData = (List<Map<String, Object>>) commandContext.getResponse().getData("REPOSITORY_LIST");
			context.getResponse().putData("CODE", commandContext.getResponse().getCode());
			context.getResponse().putData("MESSAGE", commandContext.getResponse().getMessage());
			context.getResponse().putData("DATA", responseData);
		}else {//待拓展：根据faceType查询返回库列表
//			context.getResponse().putData("CODE", 0);
//			context.getResponse().putData("MESSAGE", "成功");
//			context.getResponse().putData("DATA", CommonUtil.getAllRepositorieId());//旧飞识
			context.getResponse().putData("CODE", 0);
			context.getResponse().putData("MESSAGE", "成功");
			context.getResponse().putData("DATA", null);
		}
	}

	@BeanService(id = "feishiAlgoListByDb", description = "新飞识算法阈值列表",type = "remote")
	public void feishiAlgoListByDb(RequestContext context) throws Exception {
		String faceType = AppHandle.getHandle(Constants.OPENGW).getProperty("FEISHI_TYPE", "0");
		if("2".equals(faceType)) {//飞识算法
			String dbId = (String) context.getParameter("DB_ID");
			this.feishiAlgoList(context);
			Map<String, Object> result = (Map<String, Object>)context.getResponse().getResult();
			if(StringUtil.toString(result.get("CODE")).equals("0")) {
				try {
					List<Map<String,Object>> algos = (List<Map<String, Object>>)result.get("DATA");
					if(algos.isEmpty()){
						context.getResponse().putData("CODE", "-1");
						context.getResponse().putData("MESSAGE", "获取飞识算法异常");
						return;
					}
					
					List<Map<String,Object>> relustList = new ArrayList<>();
					List<Map<String,Object>> scores = algonameDao.getFeiShiAlgorithmScoreRate(dbId);
					Map<String,Object> scoreMap = new HashMap<>();
					for(Map<String,Object> map : scores){
						scoreMap.put(StringUtil.toString(map.get("ALGO_TYPE")), StringUtil.toString(map.get("THRESHOLD")));
					}
					for(Map<String,Object> map : algos){
						Map<String,Object> newMap = new HashMap<>();
						String id = StringUtil.toString(map.get("id"));
						newMap.put("ID",id);
						newMap.put("NAME",StringUtil.toString(map.get("name")));
						newMap.put("THRESHOLD", scoreMap.get(id) == null? "":scoreMap.get(id));
						if(!scores.isEmpty()){
							newMap.put("CHECK", "1");
						}
						relustList.add(newMap);
					}
					
					context.getResponse().putData("DATA",relustList);
				}catch (Exception e){
					ServiceLog.error("获取飞识算法阈值异常: " + e.toString(), e);
					context.getResponse().putData("CODE", "-1");
					context.getResponse().putData("MESSAGE", "获取飞识算法阈值异常"+e.getMessage());
				}
			}
		} else {
			context.getResponse().putData("CODE", 0);
			context.getResponse().putData("MESSAGE", "成功");
			context.getResponse().putData("DATA", null);
		}
	}
	
	@QueryService(id="fileUpload", description="文件上传", since="1.0", type= "remote", paasService = "true")
	public void fileUpload(RequestContext context) throws Exception {
		CommandContext ctx = new CommandContext(context.getHttpRequest());
		ctx.setBody(context.getParameters());
		ctx.setOrgCode(context.getUser().getDepartment().getCivilCode());
		Registry.getInstance().selectCommands(BaseCommandEnum.fileUpload.getUri()).exec(ctx);
		context.getResponse().putData("CODE", ctx.getResponse().getCode());
		context.getResponse().putData("MESSAGE", ctx.getResponse().getMessage());
		context.getResponse().putData("FILE_ID", ctx.getResponse().getData("CASEFILE_ID"));
		
	}
	
	@QueryService(id="getAlgorithmByRace", description="根据人种获取算法列表", since="1.0", type= "remote")
	public void getAlgorithmByRace(RequestContext context) throws Exception {
		String elementId = (String) context.getParameter("elementId");
		String race = StringUtil.toString(context.getParameter("RACE"));
		String menuId = StringUtil.toString(context.getParameter("MENUID"), "EFACE_faceCapture");
		List<Map<String, Object>> result = algonameDao.getAlgorithNameList(menuId);
		List<Map<String, Object>> algorithmByRaceList = new ArrayList<>();
		try {
			algorithmByRaceList = commonDao.getAlgorithmByRace(race);
		} catch (Exception e) {
			ServiceLog.error("根据人种获取算法列表报错：", e);
		}
		if(!algorithmByRaceList.isEmpty()) {//不为空说明是配置了算法路由
			Set<String> raceAlgoSet = algorithmByRaceList.stream().map(f -> 
				StringUtil.toString(f.get("ALGORITHM_ID"))).collect(Collectors.toSet());
			result = result.stream().filter(f-> 
			raceAlgoSet.contains(StringUtil.toString(f.get("ALGORITHM_ID")))).collect(Collectors.toList());
		}
		context.getResponse().putData(elementId, result);
		
	}
	
	@QueryService(id="getDeviceRace", description="根据摄像机获取摄像机绑定算法", since="1.0", type= "remote")
    public void getDeviceRace(RequestContext context) throws Exception {
        String elementId = (String) context.getParameter("elementId");
        String deviceIds = StringUtil.toString(context.getParameter("DEVICE_IDS"));
        String race = StringUtil.toString(context.getParameter("RACE"));
        List<Map<String, Object>> result = commonDao.getDeviceRace(deviceIds, race);
        Map<String, List<Map<String, Object>>> map  = result.stream().collect(Collectors.groupingBy(o -> StringUtil.toString(o.get("DEVICE_ID"))));
        context.getResponse().putData(elementId, map);
    }

    private String getFeishiAlgoName(List<Map<String,Object>> algos,String algoType){
		for(Map<String,Object> map : algos) {
			String id = StringUtil.toString(map.get("id"));
			if(algoType.equalsIgnoreCase(id)){
				return  StringUtil.toString(map.get("name"));
			}
		}
		return "";
	}
    
}
