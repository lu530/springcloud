package com.suntek.efacecloud.util;

import com.suntek.eap.metadata.Dao;
import com.suntek.eap.metadata.DaoProxy;
import com.suntek.eap.web.RequestContext;
import com.suntek.efacecloud.dao.FaceRedListDao;

import java.util.List;
import java.util.Map;

/**
 * 红名单接口，兼容不同厂商的静态小库
 *
 * @author liaoweixiong
 */
public abstract class FaceRedListUtil {

    protected FaceRedListDao dao = new FaceRedListDao();

    protected void deleteRedPerson(String infoId) throws Exception {
        Dao dao = new DaoProxy(Constants.APP_NAME);
        dao.addSQL("delete from EFACE_RED_LIST where INFO_ID = ?", infoId);
        dao.addSQL("update EFACE_SEARCH_TASK set IS_APPROVE = 1 where TASK_ID in ("
                + "select TASK_ID from EFACE_SEARCH_TASK_RED_LIST where INFO_ID = ? )", infoId);
        dao.addSQL("delete from EFACE_SEARCH_TASK_RED_LIST where INFO_ID = ?", infoId);
        dao.commit();
    }

    protected void insertRedPerson(Map<String, Object> params) throws Exception {
        Dao dao = new DaoProxy(Constants.APP_NAME);
        String sql = "insert into EFACE_RED_LIST(INFO_ID, NAME, SEX, PIC, IDENTITY_TYPE, IDENTITY_ID, BIRTHDAY, "
                + "PERMANENT_ADDRESS, PRESENT_ADDRESS, PIC_QUALITY, CREATOR, CREATE_TIME, RLTZ ) values (:INFO_ID, :NAME, :SEX, "
                + ":PIC, :IDENTITY_TYPE, :IDENTITY_ID, :BIRTHDAY, :PERMANENT_ADDRESS, :PRESENT_ADDRESS, :PIC_QUALITY, "
                + ":CREATOR, :CREATE_TIME, :RLTZ)";

        dao.addNamedSQL(sql, params);

        dao.commit();
    }

    public abstract void addOrEdit(RequestContext context) throws Exception;

    public abstract int importRedList(RequestContext context,
                                      List<Map<String, Object>> successList,
                                      List<String> failList,
                                      Map<String, String> importErrorMsgCache) throws Exception;
}
