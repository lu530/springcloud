package com.suntek.efacecloud.service;

import com.suntek.eap.EAP;
import com.suntek.eap.core.app.AppHandle;
import com.suntek.eap.jdbc.PageQueryResult;
import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.pico.annotation.BeanService;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.util.DateUtil;
import com.suntek.eap.util.IDGenerator;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.efacecloud.dao.SysUserDao;
import com.suntek.efacecloud.util.Constants;
import com.suntek.efacecloud.util.ModuleUtil;
import org.apache.commons.lang.StringUtils;

import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 人脸抓拍库服务(频繁出现)
 * efacecloud/rest/v6/face/capture
 * @author wsh
 * @since 1.0.0
 * @version 2017-06-29
 */
@LocalComponent(id = "face/capture")
public class FaceCaptureService extends FrequentAccessTacticsService{
	
	SysUserDao sysUserDao = new SysUserDao();
	
    @SuppressWarnings("unchecked")
    @BeanService(id = "freqAnalysis", description = "人脸抓拍数据频繁出现", since = "2.0")
    public void freqAnalysis(RequestContext context) throws Exception {
        super.query(context);
    }

	@BeanService(id = "getFaceUploadPicConfig", description="路人检索-以图搜图权限", since="2.0")
	public void getFaceUploadPic(RequestContext context) {
		String userCode = context.getUserCode();
		String faceSearch = AppHandle.getHandle(Constants.APP_NAME).getProperty("FACE_LIST_SEARCH", "0");
		if(StringUtils.isNotBlank(faceSearch) && StringUtils.equals(faceSearch, "1")){
			List<Map<String, Object>> userList = sysUserDao.getUserListByUserCode(userCode);
			if(userList.size() > 0){
				context.getResponse().putData("CODE", Constants.RETURN_CODE_SUCCESS);
				context.getResponse().putData("FACE_SEARCH", false);
				return;
			}
		}
		context.getResponse().putData("CODE", Constants.RETURN_CODE_ERROR);
		context.getResponse().putData("FACE_SEARCH", true);
	}
	
    // 处理同一个的人员列表,一个数据
    private Map<String, Object> handlePersonId(List<Object> ids) {

        Map<String, Object> personData = new HashMap<String, Object>();

        String[] idsArr = ModuleUtil.listArrToStrArr(ids);
        String[] indexName = new IDGenerator().getIndexNameFromIds(Constants.FACE_INDEX + "_", idsArr);

        try {
            PageQueryResult pageResult = EAP.bigdata.queryByIds(indexName, Constants.FACE_TABLE, idsArr);
            List<Map<String, Object>> resultSet = pageResult.getResultSet();

            ServiceLog.debug("人脸抓拍es查询条件主键id->" + ids + " ,查询结果-> " + resultSet);

            String infoId = "";
            String objPic = "";
            String jgsk = "";
            String faceScore = "";

            if (resultSet.size() > 0) {

                Collections.sort(resultSet, new Comparator<Map<String, Object>>() {

                    @Override
                    public int compare(Map<String, Object> o1, Map<String, Object> o2) {
                        String sk1 = StringUtil.toString(o1.get("JGSK"));
                        String sk2 = StringUtil.toString(o2.get("JGSK"));
                        return sk2.compareTo(sk1);
                    }
                });

                objPic = ModuleUtil.renderImage(StringUtil.toString(resultSet.get(0).get("OBJ_PIC")));
                jgsk = StringUtil.toString(resultSet.get(0).get("JGSK"));
                infoId = StringUtil.toString(resultSet.get(0).get("INFO_ID"));
                faceScore = StringUtil.toString(resultSet.get(0).get("FACE_SCORE"));
            }
            personData.put("INFO_ID", infoId);
            personData.put("REPEATS", ids.size());
            personData.put("PIC", objPic);
            personData.put("FACE_SCORE", faceScore);
            personData.put("IDS", StringUtils.join(ids, ","));
            personData.put("JGSK", DateUtil.convertByStyle(jgsk, DateUtil.yyMMddHHmmss_style, DateUtil.standard_style));

        } catch (Exception e) {
            ServiceLog.error("es查询有误:handlePersonId()", e);
        }
        return personData;
    }
}
