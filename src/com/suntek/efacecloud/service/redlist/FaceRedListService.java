package com.suntek.efacecloud.service.redlist;

import com.suntek.eap.log.LogFactory;
import com.suntek.eap.metadata.Dao;
import com.suntek.eap.metadata.DaoProxy;
import com.suntek.eap.web.RequestContext;
import com.suntek.efacecloud.dao.FaceRedListDao;
import com.suntek.efacecloud.util.Constants;
import com.suntek.face.compare.sdk.model.CollisionResult;
import org.apache.log4j.Logger;

import java.util.List;
import java.util.Map;

public abstract class FaceRedListService {

    protected static Logger log = LogFactory.getServiceLog(Constants.APP_NAME);

    protected FaceRedListDao dao = new FaceRedListDao();

    /**
     * 1:N红名单检索
     * @param context
     * @param pic
     * @return
     */
    public abstract CollisionResult faceOne2NSearch(RequestContext context, String pic);

    /**
     * 初始化红名单库
     */
    public abstract void initRedListLib();

    public abstract CollisionResult deleteFace(RequestContext context);

    /**
     * 添加或者修改
     * @param context
     * @throws Exception
     */
    public abstract void addOrEdit(RequestContext context) throws Exception;

    /**
     * 导入人员到红名单库
     * @param context
     * @param successList
     * @param failList
     * @param importErrorMsgCache
     * @return
     * @throws Exception
     */
    public abstract int importRedList(RequestContext context,
                                      List<Map<String, Object>> successList,
                                      List<String> failList,
                                      Map<String, String> importErrorMsgCache) throws Exception;


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


}
