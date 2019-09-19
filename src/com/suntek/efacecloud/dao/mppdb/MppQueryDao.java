package com.suntek.efacecloud.dao.mppdb;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;

import com.suntek.eap.EAP;
import com.suntek.eap.util.SqlUtil;
import com.suntek.efacecloud.util.Constants;

/**
 * mppdb 数据库操作类
 * @author wdp
 * @since 
 * @version 2018年5月17日
 * @Copyright (C)2018 , Suntektech
 */
public class MppQueryDao {

	private JdbcTemplate jdbc = EAP.jdbc.getTemplate(Constants.APP_NAME, Constants.MPPDB_NAME);
	
	/**
	 * 人脸抓拍es查询条件主键id
	 * @param idsArr
	 * @return
	 */
	public List<Map<String, Object>> queryByIds(String[] idsArr) {
		
		if(null == idsArr || idsArr.length == 0){
			return Collections.emptyList();
		}
		
		String sql = "select * from FACE_CAPTURE where INFO_ID in " + SqlUtil.getSqlInParams(idsArr);
		
		return jdbc.queryForList(sql, idsArr);
	}
	
	
	/** 
	 * @Description: 获取驾驶人抓拍信息
	 * @param 
	 * @param 
	 * @throws 
	 */
	public List<Map<String, Object>> queryDriverInfoByIds(List<String> idList) {
		String sql = "select xxzjbh, sbbh, yssbbh, jgrq, jgsj, jgrqsj, hphm, hpys, cllx, csys, clpp,"
				+ " clzpp, zjwz, xbdm, nlddm, qjtpurl, cltpurl, rltpurl, sjly, cjsj, rksj "
				+ " from driver_capture where xxzjbh in " + SqlUtil.getSqlInParams(idList.toArray());
		return jdbc.queryForList(sql, idList.toArray());
	}	
	
	/**
	 * @Description: 获取网吧上机人员信息
	 */
	public List<Map<String, Object>> queryWBSJfoByIds(List<String> idList) {
		String sql = "select infoid , srcid , sfzh, pubcode, " 
				+ " zp , rltpurl , begindate, gzdb_addtime" 
				+ " from internet_cafe_person where infoid in "
				+ SqlUtil.getSqlInParams(idList.toArray());
		return jdbc.queryForList(sql, idList.toArray());
	}

	/**
	 * @Description: 获取旅客信息
	 */
	public List<Map<String, Object>> queryTravelerInfoByIds(List<String> idList) {
		String sql = "select CCODE, SOURCE, GCODE, SURNAME, "
				+ " FIRSTNAME, CNAME, SEX, NATION, IDTYPE, IDCODE, "
				+ " URL, NOHOTEL, HNAME, LTIME, ETIME "
				+ " from passenger_public_information "
				+ " where CCODE in " + SqlUtil.getSqlInParams(idList.toArray());
		return jdbc.queryForList(sql, idList.toArray());
	}
}
