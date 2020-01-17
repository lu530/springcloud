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
}
