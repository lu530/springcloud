package com.suntek.efacecloud.dao;

import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;

import com.suntek.eap.EAP;
import com.suntek.efacecloud.util.Constants;

public class SysUserDao {
	
	private final JdbcTemplate jdbc = EAP.jdbc.getTemplate(Constants.APP_NAME);
	
	public List<Map<String, Object>> getUserListByUserCode(String userCode) {
		String sql = "select user.USER_CODE from SYS_USER user "
				+"inner join SYS_DEPT dept on user.DEPT_CODE = dept.DEPT_CODE "
				+"where length(dept.CIVIL_CODE)>18 and user.USER_CODE = ?";
		return jdbc.queryForList(sql,userCode);
	}
}
