package com.suntek.efacecloud.dao;

import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;

import com.suntek.eap.EAP;
import com.suntek.efacecloud.log.Log;
import com.suntek.efacecloud.util.Constants;

/**
 * 导入电梯数据的Dao
 * @author admin
 *
 */
public class ImportDataDao {

	private JdbcTemplate jdbc = EAP.jdbc.getTemplate(Constants.APP_NAME);
	
	/**
	 * 导入电梯数据
	 * @return
	 * @throws Exception
	 */
	public long importElevatorData() throws Exception{
		
		String querySql = " SELECT COUNT(DISTINCT(`行键`) ) from `电梯数据`";
		List<Map<String, Object>> list = jdbc.queryForList(querySql);	
		long totalNum = 0;
		if (null != list.get(0)) {			//需要插入的总数据条数
			Map<String, Object> map = list.get(0);
			String numStr = String.valueOf(map.get("num"));
			totalNum = Long.valueOf(numStr);
		}
		
		String startFloorSql = " SELECT `行键` as unit, `电梯/终端编号` as elevatorId ,`十进制值` as result from `电梯数据` "
				+ "WHERE `字段含义`='开始楼层' ORDER BY `行键`";
		String stopFloorSql = " SELECT `行键` as unit, `十进制值` as result from `电梯数据` "
				+ "WHERE `字段含义`='结束楼层' ORDER BY `行键` ";
		String startTimeSql = " SELECT `行键` as unit, `十进制值` as result from `电梯数据` "
				+ "WHERE `字段含义`='开始时间' ORDER BY `行键`";
		String stopTimeSql = " SELECT `行键` as unit, `十进制值` as result from `电梯数据` "
				+ "WHERE `字段含义`='结束时间' ORDER BY `行键` ";
		String downSql = " SELECT `行键` as unit, `十进制值` as result from `电梯数据` "
				+ "WHERE `字段名称`='ElevatorCarryDown' ORDER BY `行键` ";
		String upSql = " SELECT `行键` as unit, `十进制值` as result from `电梯数据` "
				+ "WHERE `字段名称`='ElevatorCarryUp'  ORDER BY `行键` ";
		
		List<Map<String, Object>> list2 = jdbc.queryForList(startFloorSql);		//开始楼层数据
		List<Map<String, Object>> list3 = jdbc.queryForList(stopFloorSql);		//结束楼层数据
		List<Map<String, Object>> list4 = jdbc.queryForList(startTimeSql);		//开始时间数据
		List<Map<String, Object>> list5 = jdbc.queryForList(stopTimeSql);		//结束时间数据
		List<Map<String, Object>> list6 = jdbc.queryForList(downSql);			//下行标志
		List<Map<String, Object>> list7 = jdbc.queryForList(upSql);				//上行标志
				
		String elevatorId = "";
		String startFloorStr = "";
		int startFloor_int = 0;
		String stopFloorStr = "";
		int stopFloor_int = 0;
		String startTime = "";
		String stopTime = "";
		String insertSql = "";
		int down = 0;
		int up = 0;
		int update = 0;
		insertSql = " INSERT INTO elevator_info ( ELEVATOR_ID, STARTFLOOR, STARTTIME, STOPFLOOR, STOPTIME, "
				+ "CARRYUP, CARRYDOWN ) " 
				+" VALUES (" 
                +" ?, " 
                +" ?, " 
                +" DATE_FORMAT(?,'%Y-%m-%d %H:%i:%s'), " 
                +" ?, " 
                +" DATE_FORMAT(?,'%Y-%m-%d %H:%i:%s'), "
                +" ?, "
                +" ? )";
		long updateNum = 0;
		for (int i = 0; i < list2.size(); i++) { //注意有楼层是小数的 .0
			elevatorId = (String) list2.get(i).get("elevatorId"); //每条数据的电梯编号
			startFloorStr = (String) list2.get(i).get("result");	//每条数据的开始楼层	
			startFloor_int = Integer.valueOf(startFloorStr);
			stopFloorStr = (String) list3.get(i).get("result");	//每条数据的结束楼层
			stopFloor_int = Integer.valueOf(stopFloorStr);
			startTime = (String) list4.get(i).get("result");	//每条数据的开始时间
			stopTime = (String) list5.get(i).get("result");		//每条数据的结束时间
			down = Integer.parseInt((String)list6.get(i).get("result"));  	//下行标志
			up = Integer.parseInt((String)list7.get(i).get("result"));		//上行标志
			try {
				update = jdbc.update(insertSql, 
						elevatorId, startFloor_int, startTime, stopFloor_int, stopTime, up, down); //插入 elevator_info 表
				if (update > 0) {
					updateNum++;   //记录成功更新条数
				}	
			} catch (Exception e) {
				Log.importDataLog.error("插入异常 : "+ e.getMessage());
			}
					
			
		}
		return updateNum;
	}
	

}
