package com.suntek.efacecloud.dao;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;

import com.suntek.eap.EAP;
import com.suntek.eap.jdbc.dialect.Dialect;
import com.suntek.eap.jdbc.dialect.DialectFactory;
import com.suntek.eap.metadata.Dao;
import com.suntek.eap.util.SqlUtil;
import com.suntek.eap.util.StringUtil;
import com.suntek.efacecloud.util.Constants;
/**
 * 布控任务关联
 * @author suntek
 *
 */
public class FaceDispatchedTaskDao {
	
	private JdbcTemplate jdbc = EAP.jdbc.getTemplate();
	
	private Dialect dialect = DialectFactory.getDialect(Constants.APP_NAME, "");
	/**
	 * 新增布控任务
	 * @param taskId
	 * @param taskName
	 * @param libIds
	 * @param deviceIds
	 * @param creator
	 * @param createTime
	 * @return
	 * @throws SQLException
	 */
	public boolean addDispatchedTask(String taskId, String taskName,
			String libIds, String deviceIds, String creator, String createTime) throws SQLException {
		
		List<String> sqlList=new ArrayList<String>();
		List<Map<String,Object>> paramList=new ArrayList<Map<String,Object>>();
		
		String sql="insert into EFACE_DISPATCHED_TASK (ID, TASK_ID, TASK_NAME, DB_ID, DEVICE_ID, CREATOR, CREATE_TIME) "
				+ " values(:ID, :TASK_ID, :TASK_NAME, :DB_ID, :DEVICE_ID, :CREATOR, :CREATE_TIME)";
		//jdbc.update(sql, id,taskId,taskName,libId,deviceId,creator,createTime);
		
		String[] libIdArr = libIds.split(",");
		String[] deviceIdArr = deviceIds.split(",");
		for (int i = 0; i < libIdArr.length; i++) {
			for (int j = 0; j < deviceIdArr.length; j++) {
				Map<String,Object>  params = new HashMap<String, Object>();
				String id=EAP.keyTool.getUUID();
				params.put("ID", id);
				params.put("TASK_ID", taskId);
				params.put("TASK_NAME", taskName);
				params.put("DB_ID", StringUtil.toString(libIdArr[i]));
				params.put("DEVICE_ID", StringUtil.toString(deviceIdArr[j]));
				params.put("CREATOR", creator);
				params.put("CREATE_TIME", createTime);
				sqlList.add(sql);
				paramList.add(params);
			}
		}
		int[] result = EAP.jdbc.getNameParameterTransactionTemplate(Constants.APP_NAME).batchUpdate(sqlList.toArray(new String[]{}), paramList);
		return result.length>0 && result[0]>0;
	}
	
	/**
	 * 根据设备ID查询
	 * @param deviceIdArr
	 * @return
	 */
	public List<Map<String, Object>> selByDeviceIds(String deviceIds){
		
		String sql = " select ID,TASK_ID,DEVICE_ID,DB_ID from EFACE_DISPATCHED_TASK where DEVICE_ID in " + SqlUtil.getSqlInParams(deviceIds);
		List<Map<String,Object>> list = jdbc.queryForList(sql,Arrays.asList(deviceIds.split(",")).toArray());
		return list;
	}
	
	public List<Map<String, Object>> checkedByDeviceIds(String deviceId) {
		String sql = "select a.DB_ID,a.DB_NAME,a.ALARM_THRESHOLD,a.ALARM_LEVEL, case when a.DB_ID = b.DB_ID then 'true' else 'flase' end as CHECKED "
				+ " from EFACE_DISPATCHED_DB a left join "
				+ " (select DB_ID  from EFACE_DISPATCHED_TASK b where DEVICE_ID= ? ) b "
				+ "on a.DB_ID = b.DB_ID ";
		List<Map<String,Object>> list = jdbc.queryForList(sql,deviceId);
		return list;
	}
	
	/**
	 * 根据库ID查询
	 * @param dbId
	 * @return
	 */
	public List<Map<String, Object>> selByDbId(String dbId){
		String sql = " select ID,TASK_ID,DEVICE_ID,DB_ID from EFACE_DISPATCHED_TASK where DB_ID = ? ";
		List<Map<String,Object>> list = jdbc.queryForList(sql,dbId);
		return list;
	}
	
	/**
	 * 根据dbId和deviceID删除布控任务
	 * @param portraitID
	 * @param b
	 */
	public void delete(String dbIds,String deviceIds)
	{
		List<Object> paramList = new ArrayList<Object>();
		String sql = " delete from EFACE_DISPATCHED_TASK where 1 =1 ";
		String[] idsArr=dbIds.split(",");
		sql = sql + " and DB_ID in ( ";
		for (int i = 0; i < idsArr.length; i++) {
			if(i == 0){
				sql = sql + " ? ";
			}else{
				sql = sql + ",?";
			}
			paramList.add(idsArr[i]);
		}
		sql = sql + ")";
		
		String[] deviceIdArr=deviceIds.split(",");
		sql = sql + " and DEVICE_ID in ( ";
		for (int i = 0; i < deviceIdArr.length; i++) {
			if(i == 0){
				sql = sql + " ? ";
			}else{
				sql = sql + ",?";
			}
			paramList.add(deviceIdArr[i]);
		}
		sql = sql + ")";
		jdbc.update(sql,paramList.toArray(new Object[]{}));
	}
	
	
	/**
	 * 根据任务ID查询
	 * @param taskId
	 * @return
	 */
	public List<Map<String, Object>> queryDeviceGroupListByTaskId(String taskId){
		String sql = "select g.GROUP_ID, g.ACCESS_NETWORK, "
				+ dialect.isnull("g.BAYONET_SN", "''") + " BAYONET_SN, "
				+ dialect.isnull("r.DEVICE_ID", "''") + " DEVICE_ID "
				+ " from EFACE_DISPATCHED_DEVICE_GROUP g "
				+ " left join EFACE_DISPATCHED_DEVICE_GROUP_REL r on g.GROUP_ID = r.GROUP_ID "
				+ " left join EFACE_DISPATCHED_TASK t on g.TASK_ID=t.TASK_ID "
				+ " where g.TASK_ID = ? and "
				+ "((t.P_STATUS= ? and g.ACCESS_NETWORK = ?) or (t.V_STATUS = ? and g.ACCESS_NETWORK = ?))";
		List<Map<String, Object>> list= jdbc.queryForList(sql, taskId, 
				Constants.TASK_STATUS_SUCCESS, Constants.DEVICE_ACCESS_NETWORK_P,
				Constants.TASK_STATUS_SUCCESS, Constants.DEVICE_ACCESS_NETWORK_V);
		return list;
	}
	
	public List<Map<String,Object>> queryDispatchedTask(String taskId){
		String sql = "select t.TASK_ID,t.TASK_TIME_LIMIT,t.BEGIN_TIME,t.END_TIME,r.ALGO_TYPE CHECK_ALGO_TYPE,t.TASK_LEVEL,d.IS_FEISHI,d.IS_ARCHIVE,d.IS_TEMP"
				   + " from VIID_DISPATCHED_TASK t "
				   + " left join VIID_DISPATCHED_TASK_DB td on t.TASK_ID = td.TASK_ID"
				   + " left join VIID_DISPATCHED_DB d on d.DB_ID = td.DB_ID"
				   + " left join VIID_DISPATCHED_CHECK_ALGO_REL r on r.DB_ID= td.DB_ID"
				   + " where t.TASK_ID = ?";
		return jdbc.queryForList(sql, taskId);
	}
	
	public List<Map<String,Object>> queryDispatchedTaskDevice(String taskId){
		String sql = "select DEVICE_ID,THRESHOLD from VIID_DISPATCHED_TASK_DEVICE where TASK_ID = ?";
		return jdbc.queryForList(sql, taskId);
	}
	
	public List<Map<String,Object>> queryDispatchedDbRemind(String dbId){
		String sql = "select u.USER_NAME,u.USER_CODE,ar.DB_ID,u.DEPT_CODE,ar.IS_MSG from EFACE_DISPATCHED_DB_ALARM_REMIND_REL ar left join SYS_USER u on u.USER_CODE = ar.USER_CODE where ar.DB_ID = ?";
		return jdbc.queryForList(sql, dbId);
	}
	
	public List<Map<String,Object>> queryDispatchedDbPermission(String dbId){
		String sql = "select u.USER_NAME,u.USER_CODE,pr.DB_ID,u.DEPT_CODE from EFACE_DISPATCHED_PERSON_PERMISSION_REL pr left join SYS_USER u on u.USER_CODE = pr.USER_CODE where pr.DB_ID = ?";
		return jdbc.queryForList(sql, dbId);
	}
	
	public void insertStrategy(String alarmRemindList, String permissionList, String dbId, String isMsg) throws Exception{
		
		Dao dao = EAP.schema.getDao(Constants.APP_NAME);
		
		String delRemind = "delete from EFACE_DISPATCHED_DB_ALARM_REMIND_REL where DB_ID = ?";
		dao.addSQL(delRemind, dbId);
		
		if(!StringUtil.isEmpty(alarmRemindList)) {
			String[] remindArr = alarmRemindList.split(",");
			for(int i = 0; i < remindArr.length; i++) {
				String sql = "insert into EFACE_DISPATCHED_DB_ALARM_REMIND_REL(DB_ID,USER_CODE,IS_MSG)values(?, ?, ?)";
				dao.addSQL(sql, dbId, remindArr[i], isMsg);
			}
		}
		
		String delPermission = "delete from EFACE_DISPATCHED_PERSON_PERMISSION_REL where DB_ID = ?";
		dao.addSQL(delPermission, dbId);
		if(!StringUtil.isEmpty(permissionList)) {
			String[] permissionArr = permissionList.split(",");
			for(int i = 0; i < permissionArr.length; i++) {
				String sql = "insert into EFACE_DISPATCHED_PERSON_PERMISSION_REL(DB_ID,USER_CODE)values(?, ?)";
				dao.addSQL(sql, dbId, permissionArr[i]);
			}
		}
		dao.commit();
	}
	
}
