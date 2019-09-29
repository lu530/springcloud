package com.suntek.efacecloud.dao;

import com.suntek.eap.EAP;
import com.suntek.efacecloud.util.Constants;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.List;
import java.util.Map;

/**
 * @author: LiLing
 * @create: 2019-09-26 18:05:51
 */
public class LostPersonDao {
    private JdbcTemplate jdbc = EAP.jdbc.getTemplate(Constants.APP_NAME);

    public void confirm(Map<String, Object> map){
        String sql = "insert into eface_lost_person_confirm(`identity`, `name`, pic, last_addr, " +
                "last_time, creator, confirm_time, state) values(?,?,?,?,?,?,?,?)";

        Object[] args = new Object[]{map.get("IDENTITY"), map.get("NAME"),map.get("PIC"),map.get("LAST_ADDR"),
                map.get("LAST_TIME"),map.get("CREATOR"),map.get("CONFIRM_TIME"),map.get("STATE")};
        jdbc.update(sql, args);
    }

    public int getLostPerson(String dbId){
        String sql = "select count(1) from VIID_DISPATCHED_PERSON person left join " +
                " EFACE_DISPATCHED_PERSON dp on person.PERSON_ID = dp.PERSON_ID where 1=1 and " +
                " dp.APPROVE_STATUS IN ( 4, 5, 6, 7, 8 ) AND dp.DB_ID = ?";
        Object[] args = new Object[]{dbId};
        return jdbc.queryForObject(sql, args, Integer.class).intValue();
    }

    public List<Map<String, Object>> getConfirmPerson(){
        String sql = "SELECT COUNT(1) COUNT, STATE FROM eface_lost_person_confirm group by STATE ";
        return jdbc.queryForList(sql);
    }
}
