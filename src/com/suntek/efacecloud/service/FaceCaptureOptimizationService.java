package com.suntek.efacecloud.service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

import com.suntek.eap.EAP;
import com.suntek.eap.common.CommandContext;
import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.pico.annotation.BeanService;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.web.RequestContext;
import com.suntek.eaplet.registry.Registry;
import com.suntek.efacecloud.dao.NNInfoDao;
import com.suntek.efacecloud.dao.NNInfoDetailDao;
import com.suntek.efacecloud.dao.NNTaskDao;
import com.suntek.efacecloud.util.ConfigUtil;
import com.suntek.sp.common.common.BaseCommandEnum;

/**
 * 人脸抓拍库服务(频繁出现)
 * efacecloud/rest/v6/face/capture/optimization
 * @author wujunying
 * @since 1.0.0
 * @version 2018-07-10
 * @Copyright (C)2018 , Suntektech
 */
@LocalComponent(id = "face/capture/optimization")
public class FaceCaptureOptimizationService 
{
	
	NNInfoDao infoDao = new NNInfoDao();
	NNInfoDetailDao infoDetailDao = new NNInfoDetailDao();
	NNTaskDao taskDao = new NNTaskDao();
	
	//封面信息保存数组长度
	public static final int INFO_ARR_SIZE = 5;
	//个人详情信息保存数组长度
	public static final int INFO_DETAIL_ARR_SIZE = 3;
	
	@SuppressWarnings("unchecked")
	@BeanService(id = "freqAnalysis", description="人脸抓拍数据频繁出现", since="2.0")
	public void freqAnalysis(RequestContext context) throws Exception 
	{

		Map<String,Object> params = context.getParameters();
		
		String taskID = EAP.keyTool.getUUID();
		
		params.put("TASK_ID", taskID);
		params.put("CREATOR", context.getUserCode());
		
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
        
        List<List<Object>> infoIds = (List<List<Object>>) commandContext.getResponse().getData("DATA");
        
        try {
        	taskDao.addTask(params);//添加频次任务
        	
        	List<Object[]> list = new ArrayList<>();
        	
        	List<String> personIdList = new ArrayList<>();//存放生成的personId
        	
        	for (int i = 0; i < infoIds.size(); i++) {
        		personIdList.add(EAP.keyTool.getUUID());
        	}
        	
        	addNNInfo(infoIds, personIdList, taskID);//添加频次封面数据
        	
        	for (int i = 0; i < infoIds.size(); i++) {
        		List<Object> ids = infoIds.get(i); // 一个人员出现列表的主键id集合
        		
        		String personId = personIdList.get(i);
        		
        		for (Object infoId : ids) {
        			Date createTime = new Date();
        			Object[] arr = new Object[]{personId, infoId, createTime};//新建一个数组存放参数
        			
        			list.add(arr);
        		}
        	}
        	
        	infoDetailDao.addInfoDetail(list);//添加频次个人数据
        	
		} catch (Exception e) {
			ServiceLog.error("人脸抓拍数据频繁出现添加任务失败：" + e.getMessage(), e);
			context.getResponse().setMessage("添加任务失败");
		}

        context.getResponse().putData("TASK_ID", taskID);
        
	}
	
	/**
	 *  处理频次数据封面数据入库
	 * @param ids
	 * @param personIds
	 * @param taskId
	 */
	private void addNNInfo(List<List<Object>> ids, List<String> personIds, String taskId) {
//		Map<String, Object> personData = new HashMap<String, Object>();
		
		List<Object[]> list = new ArrayList<>();
		
		for (int i = 0; i < ids.size(); i++) {
			List<Object> infoIds = ids.get(i);
			
			long newInfoId = 0L;
			
			//取得最新的infoId
			for (Object infoid : infoIds) {
				if(newInfoId < (long) infoid){
					newInfoId = (long) infoid;
				}
			}
			
			int num = infoIds.size();
			Date createTime = new Date();
			
			String personId = personIds.get(i);
			
			Object[] arr = new Object[] {taskId, personId, newInfoId, num, createTime};//新建一个数组存放参数
			
			list.add(arr);
		}

		infoDao.addInfo(list);

//		try {
//			Collections.sort(infoIds);
//			Collections.reverse(infoIds);
//			
//			Query query = new Query(1, 1);
//			query.addEqualCriteria("INFO_ID", newInfoId);
//			PageQueryResult pageResult = EAP.bigdata.query(indexName, Constants.FACE_TABLE, query);
//			List<Map<String, Object>> resultSet = pageResult.getResultSet();
//
//			ServiceLog.debug("人脸抓拍es查询条件主键id->" + ids + " ,查询结果-> " + resultSet);
//
//			personData.put("TASK_ID", taskId);
//			personData.put("PERSON_ID", personId);
//			personData.put("INFO_ID", newInfoId);
//			personData.put("NUMS", ids.size());
//			personData.put("CREATE_TIME", new Date());
//			
//			infoDao.addInfo(personData);
//
//		} catch (Exception e) {
//			ServiceLog.error("es查询有误:handlePersonId()", e);
//		}
	}
	
}
