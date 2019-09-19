package com.suntek.efacecloud.dao;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;

import com.suntek.eap.EAP;
import com.suntek.eap.jdbc.DaoFactory;
import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.metadata.Dao;
import com.suntek.eap.util.DateUtil;
import com.suntek.eap.util.SqlUtil;
import com.suntek.eap.util.StringUtil;
import com.suntek.efacecloud.util.Constants;

/**
 * 接口调用统计dao操作类
 * @author swq
 * @since 1.0.0
 * @version 2019-05-16
 * @Copyright (C)2019 , Suntektech
 *
 */
public class ViidCalltimeDao {
	
	private JdbcTemplate jdbc = EAP.jdbc.getTemplate(Constants.APP_NAME);
	
	
	private DaoFactory factory = new DaoFactory();
	/**
	 * 新增人员和标签关联信息
	 * @param params
	 * @throws Exception
	 */
	public int getTodayTimesByServiceName(String serviceName,String serviceUri) throws Exception{
		
		
		Dao dao = EAP.schema.getDao(Constants.APP_NAME);
		
		String	selectSql = "SELECT NUM from VIID_CALLTIME_STATICTIS WHERE CALL_DATE=? and SERVICE_NAME=?";
		
		String toDay = DateUtil.getDate(); 
		
		List<Map<String,Object>>  retList = jdbc.queryForList(selectSql, toDay, serviceName); 
		
		int times = 1;
		
		Map<String,Object> params =new HashMap<String,Object>();
		if(retList.size()==0) {
			
			String insertSql = "INSERT INTO VIID_CALLTIME_STATICTIS(CALL_DATE, SERVICE_NAME, NUM, SERVICE_URI) VALUES(:CALL_DATE, :SERVICE_NAME, :NUM , :SERVICE_URI)";
			
			params.put("CALL_DATE", toDay);
			
			params.put("SERVICE_NAME", serviceName);
			
			params.put("NUM", times);
			
			params.put("SERVICE_URI", serviceUri);
			
			dao.addNamedSQL(insertSql, params);
			
			dao.commit();
			
		}else { 
			Map<String,Object> retMap = retList.get(0);
			
			times = Integer.parseInt(retMap.get("NUM").toString())+1; 
			
			String updateSql = "UPDATE VIID_CALLTIME_STATICTIS SET NUM=:NUM WHERE CALL_DATE=:CALL_DATE and SERVICE_NAME=:SERVICE_NAME";
			
			params.put("NUM", times);
			
			params.put("CALL_DATE", toDay);
			
			params.put("SERVICE_NAME", serviceName);
			
			dao.addNamedSQL(updateSql, params);
			
			dao.commit();
		}
		
		return times;
 
	}
	
	 
}
