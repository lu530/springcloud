package com.suntek.efacecloud.dao;

import com.suntek.eap.EAP;
import com.suntek.efacecloud.util.Constants;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.List;
import java.util.Map;

public class SurveilTaskDao {
    private JdbcTemplate jdbc = EAP.jdbc.getTemplate(Constants.APP_NAME);
    /**
     * 通过车牌号查找布控原因
     * */
    public List<Map<String, Object>> getSurveilInfoByVehiclePlates(String plateNumber) {

        String sql = "select REASON,TASK_INFO from VPLUS_SURVEIL_TASK where TASK_INFO = ? ";
        List<Map<String, Object>> list = jdbc.queryForList(sql,plateNumber);
        return list;
    }
}
