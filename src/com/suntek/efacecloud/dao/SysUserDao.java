package com.suntek.efacecloud.dao;

import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;

import com.suntek.eap.EAP;
import com.suntek.efacecloud.util.Constants;

public class SysUserDao {
	
	private final JdbcTemplate jdbc = EAP.jdbc.getTemplate(Constants.APP_NAME);
	
	public List<Map<String, Object>> getUserListByUserCode(String userCode) {
		String sql = "select USER_CODE from SYS_USER "
				+"where length(DEPT_CODE)>6 and USER_CODE = ?";
		return jdbc.queryForList(sql,userCode);
	}
}
