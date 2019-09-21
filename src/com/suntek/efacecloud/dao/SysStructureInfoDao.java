package com.suntek.efacecloud.dao;

import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;

import com.suntek.eap.EAP;
import com.suntek.eap.smp.Permission;
import com.suntek.efacecloud.util.Constants;

/**
 * 行政区域dao
 *
 * @author wangsh
 * @version 2017-08-01
 * @since 3.0.0
 */
public class SysStructureInfoDao {

    private final JdbcTemplate jdbc = EAP.jdbc.getTemplate(Constants.APP_NAME);

    public List<Map<String, Object>> getSubSysStructureList(String userCode, int orgCodeInt) {
        String sql = "select a.NODE_NAME ORG_NAME, a.ORG_CODE, 0 NUM, b.SHAPE.ToString() SHAPE from GB_SYS_STRUCTURE_INFO a "
                + " left join GZ_REGION b "
                + "on (a.ORG_CODE=b.GBCODE or (a.ORG_CODE='440184' and b.GBCODE='440117') or (a.ORG_CODE='440183' and b.GBCODE='440118'))"
                + " where a.ORG_CODE like ? and " + Permission.getCurNodeResourcePrivSql(userCode, String.valueOf(orgCodeInt), "a.ORG_CODE");
        //String sql = "select NAME ORG_NAME, GBCODE ORG_CODE, 0 NUM, SHAPE.ToString() SHAPE "
        //		+ " from GZ_REGION where GBCODE like  ? ";
        return jdbc.queryForList(sql, orgCodeInt + "__");
    }

    public List<Map<String, Object>> getSubSysStructureSimpleList(String userCode, int orgCodeInt) {
        String sql = "select a.NODE_NAME ORG_NAME, a.ORG_CODE, 0 NUM from GB_SYS_STRUCTURE_INFO a "
                + " left join GZ_REGION b "
                + "on (a.ORG_CODE=b.GBCODE or (a.ORG_CODE='440184' and b.GBCODE='440117') or (a.ORG_CODE='440183' and b.GBCODE='440118'))"
                + " where a.ORG_CODE like ? and " + Permission.getCurNodeResourcePrivSql(userCode, String.valueOf(orgCodeInt), "a.ORG_CODE");
        //String sql = "select NAME ORG_NAME, GBCODE ORG_CODE, 0 NUM, SHAPE.ToString() SHAPE "
        //		+ " from GZ_REGION where GBCODE like  ? ";
        return jdbc.queryForList(sql, orgCodeInt + "__");
    }
}
