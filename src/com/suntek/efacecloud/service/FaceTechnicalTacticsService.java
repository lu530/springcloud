package com.suntek.efacecloud.service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.URL;
import java.net.URLConnection;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.stream.Collectors;

import com.suntek.efacecloud.dao.FaceAlgorithmTypeDao;
import org.apache.commons.lang.StringUtils;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.suntek.eap.EAP;
import com.suntek.eap.common.CommandContext;
import com.suntek.eap.common.StatusCode;
import com.suntek.eap.common.util.ObjectUtil;
import com.suntek.eap.core.app.AppHandle;
import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.pico.ILocalComponent;
import com.suntek.eap.pico.annotation.BeanService;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.util.Base64;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.eaplet.registry.Registry;
import com.suntek.efacecloud.callable.FaceCompareCallable;
import com.suntek.efacecloud.dao.ViidCalltimeDao;
import com.suntek.efacecloud.log.Log;
import com.suntek.efacecloud.util.ConfigUtil;
import com.suntek.efacecloud.util.Constants;
import com.suntek.efacecloud.util.ModuleUtil;
import com.suntek.sp.common.common.BaseCommandEnum;

/**
 * 人脸技战法服务
 * efacecloud/rest/v6/face/technicalTactics
 * @author lx
 * @since 1.0.0
 * @version 2017-06-29
 */
@LocalComponent(id = "face/technicalTactics")
public class FaceTechnicalTacticsService {
	private ViidCalltimeDao viidCalltimeDao = new ViidCalltimeDao();

	private FaceAlgorithmTypeDao faceAlgorithmTypeDao = new FaceAlgorithmTypeDao();

	// liangzhen 20190605
	@BeanService(id = "IntegrationFaceSearch", description = "整合版新飞识与外籍人1:n比对", type="remote")
	public void integrationFaceSearch(RequestContext context) throws Exception{
		String thresHold = StringUtil.toString(context.getParameter("THRESHOLD"));
		String topNumber = StringUtil.toString(context.getParameter("TOP_NUMBER"));
		//String pic = StringUtil.toString(context.getParameter("PIC"));
		String picList = StringUtil.toString(context.getParameter("IMG_URL_LIST"));

		Log.faceSearchLog.debug("IntegrationFaceSearch");

		String feishiType = AppHandle.getHandle(Constants.OPENGW).getProperty("FEISHI_TYPE","2");

		//如果该url不为"",那么就会按照设置的url请求返回模拟的依图json,否则调用实际接口返回json(供公司模拟环境使用)
		String yituJson_url =  AppHandle.getHandle(Constants.APP_NAME).getProperty("MOCKYITU_JSON_URL","");
		if (!("".equals(yituJson_url))) {
			String jsonStr = sendPost(yituJson_url, "");
			JSONObject json = JSON.parseObject(jsonStr);
			Log.importDataLog.debug(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
			Log.importDataLog.debug("模拟依图json,yituJson_url : "+yituJson_url);
			Log.importDataLog.debug("json : "+JSON.toJSONString(json));
			int dateTimes = 10000;
			int searchtimes
				= viidCalltimeDao.getTodayTimesByServiceName("外籍人脸1:N比对",BaseCommandEnum.wj_One2nCompare.getUri());
			long CODE = StatusCode.SUCC.getCode();
			String message = "查询成功";

			List<Map<String, Object>> responseData = (List<Map<String, Object>>) json.get("DATA");
			Map<String,List<Map<String,Object>>> resultData = new HashMap<String,List<Map<String,Object>>>();
			resultData.put("111", responseData);
			List<Map<String,Object>> recommendResult = getRecommendResult(resultData);

			Map<String, Object> dataMap = new HashMap<>();
			List<Object> dataList = new ArrayList<>();
			if(null != recommendResult) {
				dataMap.put("RECOMMEND_RESULT", recommendResult);
			}
			dataMap.put("LIST", resultData);
			dataList.add(dataMap);

			context.getResponse().putData("SEARCHTIMES", dateTimes-searchtimes);
			context.getResponse().putData("CODE", CODE);
			context.getResponse().putData("MESSAGE", message);
			context.getResponse().putData("DATA", dataList);
			Log.importDataLog.debug("99 dataList : "+JSON.toJSONString(dataList));
			return;
		}

		if(feishiType.equals("2")) {
			String ALGORITHM_ID = StringUtil.toString(context.getParameter("ALGORITHM_ID"));
			if(StringUtil.isEmpty(ALGORITHM_ID)) {
				//算法列表
				((ILocalComponent) EAP.bean.get("face/common/feishiAlgoList")).invoke(new Object[] { context });
				Map<String, Object> algoListResult = (Map<String, Object>)context.getResponse().getResult();
				List<Object> list = (List<Object>)algoListResult.get("DATA");
				List<String> algoList = new ArrayList<String>();
				for(Object obj : list){
					//JSONObject json = (JSONObject)obj;
					Map<String,Object> algoResult =(Map<String,Object>)obj;
					algoList.add(StringUtil.toString(algoResult.get("id")));
				}
				context.putParameter("ALGORITHM_ID",StringUtils.join(algoList.toArray(),","));
			}

			String REPOSITORY_ID = StringUtil.toString(context.getParameter("REPOSITORY_ID"));
			if(StringUtil.isEmpty(REPOSITORY_ID)) {
				//人脸库列表
				((ILocalComponent) EAP.bean.get("face/common/feishiAlgoLib")).invoke(new Object[] { context });
				Map<String, Object> algoLibResult = (Map<String, Object>)context.getResponse().getResult();
				List<Object> liblist = (List<Object>)algoLibResult.get("DATA");
				List<String> algolibList = new ArrayList<String>();
				for(Object obj : liblist){
					//JSONObject json = (JSONObject)obj;
					Map<String,Object> algoLib =(Map<String,Object>)obj;
					algolibList.add(StringUtil.toString(algoLib.get("id")));
				}
				context.putParameter("REPOSITORY_ID",StringUtils.join(algolibList.toArray(),","));
			}
			//1:N
			//List<String> urlList = new ArrayList<String>();
			//urlList.add(pic);
			context.putParameter("IMG_URL_LIST",picList);
			context.putParameter("THRESHOLD", thresHold);
			context.putParameter("TOP_NUMBER", topNumber);
			context.putParameter("PRIORITY", "1");

			((ILocalComponent) EAP.bean.get("face/technicalTactics/batchFaceSearch")).invoke(new Object[] { context });
			Map<String, Object> result = (Map<String, Object>)context.getResponse().getResult();

			// 给新飞识数据添加IDENTITY_TYPE和GJ属性
			List<Map<String,Object>> dataList = (List<Map<String, Object>>) result.get("DATA");
			for(Object obj:dataList) {

				Map<String,Object> picResult = (Map<String,Object>)obj;
				// 修改LIST部分
				Map<String,List<Map<String,Object>>> responseData
					= (Map<String, List<Map<String, Object>>>) picResult.get("LIST");
				for(int i = 110;i <= 118;i++){
					if(responseData.get(StringUtil.toString(i)) != null){
						addIdentityTypeAndGJ(responseData.get(StringUtil.toString(i)));
					}
				}

				// 修改RECOMMEND_RESULT部分
				if(picResult.get("RECOMMEND_RESULT") != null){
					List<Map<String,Object>> resultData = (List<Map<String, Object>>) picResult.get("RECOMMEND_RESULT");
					addIdentityTypeAndGJ(resultData);
				}
			}
			context.getResponse().putData("CODE",result.get("CODE"));
			context.getResponse().putData("MESSAGE",result.get("MESSAGE"));
			context.getResponse().putData("DATA",dataList);

		} else if(feishiType.equals("3")) {

			long CODE = StatusCode.SUCC.getCode();
			String message = "查询成功";

			//context.putParameter("IMG_URL",pic);
			context.putParameter("IMG_URL_LIST",picList);
			context.putParameter("THRESHOLD", thresHold);
			context.putParameter("TOP_NUMBER", topNumber);

			Log.faceSearchLog.debug("IntegrationFaceSearch2");

			/*((ILocalComponent) EAP.bean.get("face/technicalTactics/wjFaceSearch")).invoke(new Object[] { context });
			Map<String, Object> result = (Map<String, Object>)context.getResponse().getResult();*/

			String IMG_URL_LIST = StringUtil.toString(context.getParameter("IMG_URL_LIST"));

			if(StringUtil.isNull(IMG_URL_LIST)) {
				context.getResponse().putData("CODE", CODE);
				message = "参数[IMG_URL_LIST]为空";
				context.getResponse().putData("MESSAGE", message);
				return;
			}
			Log.faceSearchLog.debug("IMG_URL_LIST:" + IMG_URL_LIST);
			JSONArray urlList = JSONObject.parseArray(IMG_URL_LIST);

			List<Object> dataList = new ArrayList<>(urlList.size());
			String url = null;
			int dateTimes = 10000;
			int searchTimes = 0;
			for (int i = 0; i < urlList.size(); i++) {
				Log.faceSearchLog.debug("urlList.size()" + urlList.size());
				url = StringUtil.toString(urlList.get(i));
				context.getParameters().put("start", "0");
				context.getParameters().put("limit", StringUtil.toString(context.getParameter("TOP_NUMBER"), "20"));
				context.getParameters().put("threshold", StringUtil.toString(context.getParameter("THRESHOLD"), "60"));
				context.getParameters().put("picture_image_content_base64",
						Base64.GetUrlImageToBase64(url).replace("\n", "").replace("\r", ""));
				CommandContext commandContext = new CommandContext(context.getHttpRequest());
				commandContext.setServiceUri(BaseCommandEnum.wj_One2nCompare.getUri());
				commandContext.setBody(context.getParameters());

				Registry.getInstance().selectCommand(commandContext.getServiceUri()).exec(commandContext);
				List<Map<String,Object>> responseData = (List<Map<String,Object>>)commandContext.getResponse().getData("DATA");
				// 依图接口调用次数
				searchTimes = viidCalltimeDao.getTodayTimesByServiceName("外籍人脸1:N对比", BaseCommandEnum.wj_One2nCompare.getUri());
				if(commandContext.getResponse().getCode() != StatusCode.SUCC.getCode()) {
					CODE = commandContext.getResponse().getCode();
					message = commandContext.getResponse().getMessage();
					break;
				}

				/*for(int j = 0; j < responseData.size(); j++){
					Iterator<String> iterator = responseData.get(j).keySet().iterator();
					while(iterator.hasNext()){
						String keyData = StringUtil.toString(iterator.next());
						if("IDENTITY_TYPE".equals(keyData)||"GJ".equals(keyData)){
							iterator.remove();
							responseData.get(j).remove(keyData);
						}
					}
				}*/

				Map<String,List<Map<String,Object>>> resultData = new HashMap<String,List<Map<String,Object>>>();
				resultData.put("111", responseData);
				List<Map<String,Object>> recommendResult = getRecommendResult(resultData);

				Map<String, Object> dataMap = new HashMap<>();
				if(null != recommendResult) {
					dataMap.put("RECOMMEND_RESULT", recommendResult);
				}
				dataMap.put("LIST", resultData);
				dataList.add(dataMap);
			}
			Log.faceSearchLog.debug("IntegrationFaceSearch5");
			context.getResponse().putData("SEARCHTIMES", dateTimes-searchTimes);
			context.getResponse().putData("CODE", CODE);
			context.getResponse().putData("MESSAGE", message);
			context.getResponse().putData("DATA", dataList);

		} else{
			context.getResponse().putData("CODE","1");
			context.getResponse().putData("MESSAGE","参数异常,feishiType : "+feishiType);
		}
	}

	// 新增对中国人属性的处理函数，添加IDENTITY_TYPE和GJ属性   //  liangzhen 20190609
	private void addIdentityTypeAndGJ(List<Map<String, Object>> list) {

		for(Object obj:list){
			Map<String,Object> map = (Map<String, Object>) obj;
			map.put("IDENTITY_TYPE","");
			map.put("GJ","中国");
		}
	}


	@BeanService(id = "one2one", description = "1:1比对", type="remote")
	public void search(RequestContext context) throws Exception{
		String mainPic = ModuleUtil.renderImage(StringUtil.toString(context.getParameter("URL_FROM")));
		String comparePic = ModuleUtil.renderImage(StringUtil.toString(context.getParameter("URL_TO")));
		String algoType = ConfigUtil.getAlgoType();

		context.getParameters().put("URL_FROM", mainPic);
		context.getParameters().put("URL_TO", comparePic);
		context.getParameters().put("ALGO_TYPE", algoType);

		CommandContext commandContext = new CommandContext(context.getHttpRequest());

		commandContext.setBody(context.getParameters());
		commandContext.setServiceUri(BaseCommandEnum.faceOne2One.getUri());

		commandContext.setOrgCode(context.getUser().getDepartment().getCivilCode());

		ServiceLog.debug("调用sdk参数:" + context.getParameters());

		Registry registry = Registry.getInstance();

//		registry.selectCommands(commandContext.getServiceUri()).exec(commandContext);

		String vendor = ConfigUtil.getVendor();
		registry.selectCommand(BaseCommandEnum.faceOne2One.getUri(), "4401", vendor).exec(commandContext);


		ServiceLog.debug("调用sdk返回结果code:" + commandContext.getResponse().getCode()
	  		       + " message:" + commandContext.getResponse().getMessage()
	  		       + " result:" + commandContext.getResponse().getResult());

		context.getResponse().putData("CODE", commandContext.getResponse().getCode());
		context.getResponse().putData("MESSAGE", commandContext.getResponse().getMessage());
		context.getResponse().putData("DATA", commandContext.getResponse().getData("DATA"));
	}

	@BeanService(id = "batchFaceSearch", description = "飞识批量1:N多算法比对",type = "remote")
	public void batchFaceSearch(RequestContext context) throws Exception{
		long CODE = StatusCode.SUCC.getCode();
		String message = "查询成功";

		String ALGORITHM_ID = StringUtil.toString(context.getParameter("ALGORITHM_ID"));
		if(StringUtil.isEmpty(ALGORITHM_ID)) {
			context.putParameter("ALGORITHM_ID", StringUtils.join(ModuleUtil.getAllAlgorithmId().toArray(),","));
		}

		String REPOSITORY_ID = StringUtil.toString(context.getParameter("REPOSITORY_ID"));
		if(StringUtil.isEmpty(REPOSITORY_ID)) {
			context.putParameter("REPOSITORY_ID", StringUtils.join(ModuleUtil.getAllRepositorieId().toArray(),","));
		}

		String orgCode = context.getUser().getDepartment().getCivilCode();

		String IMG_URL_LIST = StringUtil.toString(context.getParameter("IMG_URL_LIST"));
		if(StringUtil.isNull(IMG_URL_LIST)) {
			context.getResponse().putData("CODE", CODE);
			message = "参数[IMG_URL_LIST]为空";
			context.getResponse().putData("MESSAGE", message);
			return;
		}

		JSONArray urlList = JSONObject.parseArray(IMG_URL_LIST);

		ExecutorService pool = Executors.newFixedThreadPool(urlList.size());
		List<Future<CommandContext>> futureList = new ArrayList<>();
		for (int i = 0; i < urlList.size(); i++) {
			Map<String, Object> params = (Map<String, Object>)ObjectUtil.deepCopyObject(context.getParameters());
			params.put("IMG_URL", urlList.get(i));
			CommandContext commandContext = new CommandContext(context.getHttpRequest());
			commandContext.setBody(params);
			commandContext.setServiceUri(BaseCommandEnum.faceCompare.getUri());
			commandContext.setOrgCode(orgCode);
			//执行任务并获取Future对象
	        Future<CommandContext> future
	        		= pool.submit(new FaceCompareCallable(commandContext));
	        futureList.add(future);
		}

		List<Object> dataList = new ArrayList<>(urlList.size());
		for (int i = 0; i < futureList.size(); i++) {
			Map<String, Object> dataMap = new HashMap<>();
			CommandContext commandContext = futureList.get(i).get();
			Map<String,List<Map<String,Object>>> responseData
				= (Map<String,List<Map<String,Object>>>)commandContext.getResponse().getData("DATA");
			List<Map<String,Object>> recommendResult = getRecommendResult(responseData);

			ServiceLog.debug("调用sdk返回结果code:" + commandContext.getResponse().getCode()
		  		       + " message:" + commandContext.getResponse().getMessage()
		  		       + " result:" + commandContext.getResponse().getResult());
			if(commandContext.getResponse().getCode() != StatusCode.SUCC.getCode()) {
				CODE = commandContext.getResponse().getCode();
				message = commandContext.getResponse().getMessage();
				break;
			}
			dataMap.put("LIST", responseData);
			if(null != recommendResult) {
				ServiceLog.debug("推荐结果:");
				ServiceLog.debug(recommendResult);
				dataMap.put("RECOMMEND_RESULT", recommendResult);
			}
			dataList.add(dataMap);
		}
		if(!pool.isShutdown()) {
			pool.shutdown();
		}
		context.getResponse().putData("CODE", CODE);
		context.getResponse().putData("MESSAGE", message);
		context.getResponse().putData("DATA", dataList);

	}

	@BeanService(id = "faceSearch", description = "飞识1:N多算法比对",type = "remote")
	public void faceSearch(RequestContext context) throws Exception{
		String ALGORITHM_ID = StringUtil.toString(context.getParameter("ALGORITHM_ID"));

		if(StringUtil.isEmpty(ALGORITHM_ID)) {
			context.putParameter("ALGORITHM_ID", StringUtils.join(ModuleUtil.getAllAlgorithmId().toArray(),","));
		}

		String REPOSITORY_ID = StringUtil.toString(context.getParameter("REPOSITORY_ID"));

		if(StringUtil.isEmpty(REPOSITORY_ID)) {
			context.putParameter("REPOSITORY_ID", StringUtils.join(ModuleUtil.getAllRepositorieId().toArray(),","));
		}

		CommandContext commandContext = new CommandContext(context.getHttpRequest());

		commandContext.setBody(context.getParameters());
		commandContext.setServiceUri(BaseCommandEnum.faceCompare.getUri());
		commandContext.setOrgCode(context.getUser().getDepartment().getCivilCode());

		ServiceLog.debug("调用sdk参数:" + context.getParameters());

		Registry registry = Registry.getInstance();

		registry.selectCommands(commandContext.getServiceUri()).exec(commandContext);

		Map<String,List<Map<String,Object>>> responseData
				= (Map<String,List<Map<String,Object>>>)commandContext.getResponse().getData("DATA");

		List<Map<String,Object>> recommendResult = getRecommendResult(responseData);

		ServiceLog.debug("调用sdk返回结果code:" + commandContext.getResponse().getCode()
	  		       + " message:" + commandContext.getResponse().getMessage()
	  		       + " result:" + commandContext.getResponse().getResult());

		context.getResponse().putData("CODE", commandContext.getResponse().getCode());
		context.getResponse().putData("MESSAGE", commandContext.getResponse().getMessage());
		context.getResponse().putData("DATA", responseData);
		if(null != recommendResult) {
			context.getResponse().putData("RECOMMEND_RESULT", recommendResult);
			ServiceLog.debug("推荐结果:");
			ServiceLog.debug(recommendResult);
		}

	}

	@BeanService(id = "wjFaceSearch", description = "外籍人脸1:N比对",type = "remote")
	public void wjFaceSearch(RequestContext context) throws Exception {
		int dayTimes = 10000;
		String url = StringUtil.toString(context.getParameter("IMG_URL"));
		context.getParameters().put("start", "0");
		context.getParameters().put("limit", StringUtil.toString(context.getParameter("TOP_NUMBER"), "20"));
		context.getParameters().put("threshold", StringUtil.toString(context.getParameter("THRESHOLD"), "60"));
		String imgBase = Base64.GetUrlImageToBase64(url);
		Log.faceOneToOneLog.debug("imgBase >>>>>>>" + imgBase);
		context.getParameters().put("picture_image_content_base64",
				Base64.GetUrlImageToBase64(url).replace("\n", "").replace("\r", ""));
		
		CommandContext commandContext = new CommandContext(context.getHttpRequest());
		commandContext.setServiceUri(BaseCommandEnum.wj_One2nCompare.getUri());
		commandContext.setBody(context.getParameters());
		
		Registry.getInstance().selectCommand(commandContext.getServiceUri()).exec(commandContext);
		
		int searchtimes = viidCalltimeDao.getTodayTimesByServiceName("外籍人脸1:N比对",BaseCommandEnum.wj_One2nCompare.getUri());
		com.suntek.efacecloud.log.Log.synclog.debug("外籍人脸1:N比对接口调用次数:"+searchtimes);
		List<Map<String,Object>> responseData = (List<Map<String,Object>>)commandContext.getResponse().getData("DATA");
		context.getResponse().putData("SEARCHTIMES", dayTimes-searchtimes);
		context.getResponse().putData("CODE", commandContext.getResponse().getCode());
		context.getResponse().putData("MESSAGE", commandContext.getResponse().getMessage());
		context.getResponse().putData("DATA", responseData);
		
//		List<Map<String, Object>> resultList = new ArrayList<Map<String, Object>>();
//		Map<String, Object> result = new HashMap<String, Object>();
//		result.put("IMG_URL", "http://172.25.20.28:8088/g28/M00/00000015/00000009/rBkUHFvudW6ATayEAAE6pMU77SU687.jpg");
//		result.put("NAME", "测试人名");
//		result.put("PERSON_ID", "person_id");
//		result.put("SIMILARITY", 99.9999);
//		result.put("REPOSITORY_ID", "测试库");
//		resultList.add(result);
//		
//		context.getResponse().putData("CODE", 0);
//		context.getResponse().putData("MESSAGE", "分析完成");
//		context.getResponse().putData("DATA", resultList);
	}

	@BeanService(id = "faceSearchOnetoOne", description = "新飞识1比1",type = "remote")
	public void faceSearchOnetoOne(RequestContext context) throws Exception {
		String URL_FROM = StringUtil.toString(context.getParameter("URL_FROM"));
		String URL_TO = StringUtil.toString(context.getParameter("URL_TO"));
		String ALGORITHM_ID = StringUtil.toString(context.getParameter("ALGORITHM_ID"));
		String ALGO_TYPES = StringUtil.toString(context.getParameter("ALGO_TYPES"));
		Map<String, Object> objectList = null;
		if(!StringUtils.isBlank(ALGO_TYPES)){
			Map<String, Object> map = new HashMap<>();
			map.put("URL_FROM",URL_FROM);
			map.put("URL_TO",URL_TO);
			map.put("ALGO_TYPES",ALGO_TYPES);
			objectList = faceSearchLocalOnetoOne(map);
		}
		
		if(!StringUtils.isBlank(ALGORITHM_ID)){
			context.getParameters().put("FIRST_URL", URL_FROM);
			context.getParameters().put("SECOND_URL", URL_TO);
			context.getParameters().put("ALGORITHM_ID", ALGORITHM_ID);

			CommandContext commandContext = new CommandContext(context.getHttpRequest());
			commandContext.setServiceUri(BaseCommandEnum.faceOneToOneCompare.getUri());
			commandContext.setBody(context.getParameters());

			Registry.getInstance().selectCommand(commandContext.getServiceUri()).exec(commandContext);

			String  feishiResult= (String)commandContext.getResponse().getData("FEISHI_RESULT");
			Log.faceOneToOneLog.debug("调用飞识算法1:1结果>>>>>>>>>>>> " + feishiResult);

			context.getResponse().putData("CODE", commandContext.getResponse().getCode());
			context.getResponse().putData("MESSAGE", commandContext.getResponse().getMessage());
			JSONArray jsonArray = null;
			if(!StringUtils.isBlank(feishiResult)){
				jsonArray = JSONArray.parseArray(feishiResult);
				Log.faceOneToOneLog.debug("解析feishiResult成jsonArray成功>>>>>>>>>>");
				if(objectList != null){
					ArrayList<JSONObject> list = (ArrayList<JSONObject>)objectList.get("DATA");
					for (JSONObject jsonObject : list) {
						jsonArray.add(jsonObject);
					}
				}
			}

			if(commandContext.getResponse().getCode() == 0) {
				context.getResponse().putData("DATA", JSONArray.toJSON(jsonArray));
			}
		}else{
			context.getResponse().putAllData(objectList);
		}
	}

	private Map<String, Object> faceSearchLocalOnetoOne(Map<String, Object> map) {
		String algoType = StringUtil.toString(map.get("ALGO_TYPES")) ;
		String urlFrom = StringUtil.toString(map.get("URL_FROM")) ;
		String urlTo = StringUtil.toString(map.get("URL_TO")) ;

        List<Map<String, Object>> algoTypeList = faceAlgorithmTypeDao.getAlgorithTypeList();
        Map<String, String> algoIDNameMap = algoTypeList.stream().collect(Collectors.toMap(
                o -> StringUtil.toString(o.get("ALGORITHM_ID")), o -> StringUtil.toString(o.get("ALGORITHM_NAME"))));

		List<JSONObject> resList = new ArrayList<>();
		Map<String,Object> resMap = new HashMap<>();
		try {
			for (String algo : algoType.split(",")) {
				Log.faceOneToOneLog.debug("开始调用本地算法>>>>>>");
				//Map<String, Object> resMap = new HashMap<>();
				JSONObject jsonObject = new JSONObject();
				/*if("10003".equals(algo)){
					jsonObject.put("algorithmName","云从3.5人脸算法");
				}else if("80003".equals(algo)){
					jsonObject.put("algorithmName","华云算法");
				} else if ("90003".equals(algo)) {
					jsonObject.put("algorithmName", "海康人脸算法");
				}*/
				//通过 VPLUS_FACE_ALGORITHM_TYPE 找到对应算法名称
				if (algoIDNameMap.containsKey(algo)) {
                    jsonObject.put("algorithmName", algoIDNameMap.get(algo));
                }
				Map<String, Object> param = new HashMap<>();

				param.put("URL_FROM",urlFrom);
				param.put("URL_TO",urlTo);
				param.put("ALGO_TYPE",algo);
				CommandContext commandContext = new CommandContext("admin", "localhost");
				commandContext.setBody(param);
				commandContext.setServiceUri(BaseCommandEnum.faceOne2One.getUri());

				// commandContext.setOrgCode(context.getUser().getDepartment().getCivilCode());
				Registry registry = Registry.getInstance();
				// registry.selectCommands(commandContext.getServiceUri()).exec(commandContext);

				String vendor = ConfigUtil.getVendor();
				registry.selectCommand(BaseCommandEnum.faceOne2One.getUri(), "4401", vendor).exec(commandContext);
				Map<String,Object> data = (Map<String, Object>) commandContext.getResponse().getData("DATA");
				if(data != null){
					String similarity = StringUtil.toString(data.get("SIMILARITY"));
					Log.faceOneToOneLog.debug("调用本地算法成功>>>>>> similarity: " + similarity + "algoId: " + algo);
					jsonObject.put("similarity",similarity);
					jsonObject.put("errorCode",0);
				} 
				resMap.put("CODE", commandContext.getResponse().getCode());
				resMap.put("MESSAGE", commandContext.getResponse().getMessage());
				resList.add(jsonObject);
			}
			resMap.put("DATA", resList);
		} catch (Exception e){
			Log.faceOneToOneLog.debug("调用本地算法异常: "  + e.getMessage());
		}
		return resMap;
	}

	private List<Map<String,Object>> getRecommendResult(Map<String,List<Map<String,Object>>> responseData){
		
		if(null == responseData) {
			return null;
		}
		
		Set<String> keys = responseData.keySet();
		
		Map<String,Integer> idTime = new HashMap<String,Integer>();   //出现次数<personid+姓名,time>
		Map<String,Map<String,Object>> person = new HashMap<String,Map<String,Object>>();  //人员信息<personid+姓名,data>
		Map<String,Integer> rankScore = new HashMap<String,Integer>();    //排名分数<personid,score>
		
		for(String key : keys) {
			List<Map<String,Object>> data = responseData.get(key);   //算法数据
			for(int i = 0; i < data.size(); i++) {
				String personId = StringUtil.toString(data.get(i).get("PERSON_ID"));
				String name = StringUtil.toString(data.get(i).get("NAME"));
				String pn = (personId + name).replaceAll(" ", "");
				idTime.put(pn, null == idTime.get(pn) ? 1 : Integer.valueOf(StringUtil.toString(idTime.get(pn))) + 1);
				rankScore.put(pn, null == rankScore.get(pn) 
						? getRankScore(i + 1) : Integer.valueOf(StringUtil.toString(rankScore.get(pn))) + getRankScore(i + 1));
				if(null == person.get(pn)) {
					person.put(pn, data.get(i));
				}
			}
		}
		
		//分数排序
		List<Map.Entry<String, Integer>> rankScoreList = new ArrayList<Map.Entry<String,Integer>>(rankScore.entrySet());
		
		Collections.sort(rankScoreList, new Comparator<Map.Entry<String,Integer>>(){

			@Override
			public int compare(Entry<String, Integer> o1, Entry<String, Integer> o2) {
				
				return o2.getValue() - o1.getValue();
			}
			
			
		});
		
		ServiceLog.debug("检索结果出现次数:");
		ServiceLog.debug(idTime);
		ServiceLog.debug("检索结果排名分数:");
		ServiceLog.debug(rankScore);
		
		List<Map<String,Object>> recommend = new ArrayList<Map<String,Object>>();
		
		for(int i = 0; i < rankScoreList.size() && i < 3; i++) {
			recommend.add(person.get(rankScoreList.get(i).getKey()));
		}
		
		return recommend;
		
	}
	
	private int getRankScore(int rank) {

		switch (rank) {
			case 1:
				return 30;
			case 2:
				return 20;
			case 3:
				return 10;
			case 4:
				return 5;
			default:
		}
		return 1;
	}
	
	/**
	 * 向指定 URL 发送POST方法的请求
	 * 
	 * @param url 发送请求的 URL
	 * @param string 请求参数，请求参数应该是 name1=value1&name2=value2 的形式。
	 * @return 所代表远程资源的响应结果
	 */
	public String sendPost(String url, String string) {
        PrintWriter out = null;
        BufferedReader in = null;
        String result = "";
        try {
            URL realUrl = new URL(url);
            // 打开和URL之间的连接
            URLConnection conn = realUrl.openConnection();
            // 设置通用的请求属性
            conn.setRequestProperty("accept", "*/*");
            conn.setRequestProperty("connection", "Keep-Alive");
            conn.setRequestProperty("user-agent",
                    "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1;SV1)");
            // 发送POST请求必须设置如下两行
            conn.setDoOutput(true);
            conn.setDoInput(true);
            // 获取URLConnection对象对应的输出流
            out = new PrintWriter(conn.getOutputStream());
            // 发送请求参数
            out.print(string);
            // flush输出流的缓冲
            out.flush();
            // 定义BufferedReader输入流来读取URL的响应
            in = new BufferedReader(
                    new InputStreamReader(conn.getInputStream()));
            String line;
            while ((line = in.readLine()) != null) {
                result += line;
            }
        } catch (Exception e) {
            System.out.println("发送 POST 请求出现异常！"+e);
            e.printStackTrace();
        }
        //使用finally块来关闭输出流、输入流
        finally{
            try{
                if(out!=null){
                    out.close();
                }
                if(in!=null){
                    in.close();
                }
            }
            catch(IOException ex){
                ex.printStackTrace();
            }
        }
        return result;
    }

}

