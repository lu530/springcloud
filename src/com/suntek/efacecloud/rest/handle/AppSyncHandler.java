package com.suntek.efacecloud.rest.handle;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang3.StringUtils;

import com.suntek.eap.util.StringUtil;
import com.suntek.efacecloud.dao.FaceTerminalDao;
import com.suntek.efacecloud.log.Log;
import com.suntek.efacecloud.rest.AbstractJsonHandler;
import com.suntek.efacecloud.util.ModuleUtil;

import net.sf.json.JSONObject;

/**
 * APP同步数据处理
 * @author lx
 * @since 
 * @version 2017-07-25
 * @Copyright (C)2017 , Suntektech
 */
public class AppSyncHandler extends AbstractJsonHandler 
{
	private FaceTerminalDao dao = new FaceTerminalDao();
	
	@Override
	public boolean validateInputParams(JSONObject obj) 
	{
		return true;
	}

	@Override
	protected void doHandle(JSONObject obj, LinkedHashMap<String, Object> target) throws Exception 
	{
		List<Map<String, Object>> syncDataList = dao.getAllSyncDataList();
		if (syncDataList.size() == 0) {
			Log.synclog.debug("获取待同步的终端库数据为空！");
			target.put("StatusCode", 1);
			target.put("addData", Collections.emptyList());
			target.put("deleteData", "");
			target.put("message", "获取待同步的终端库数据为空！");
			return;
		}
		
		String infoIds = obj.getString("ids");
		List<String> infoIdList = new ArrayList<String>();
		if (!StringUtil.isEmpty(infoIds)) {
			String[] infoIdArr = infoIds.split(",");
			for (int i = 0; i < infoIdArr.length; i++) {
				infoIdList.add(infoIdArr[i]);
			}
		}
		
		int syncNum = obj.getInt("syncNum");
		Log.synclog.debug("手机端数据大小：" + infoIdList.size() + "；需同步数量：" + syncNum);
		
		List<String> addList = new ArrayList<String>();
		List<String> deleteList = new ArrayList<String>();
		Map<String, Map<String, Object>> needDealMap = new HashMap<String, Map<String, Object>>();
		for (int i = 0; i < syncDataList.size(); i++) {
			Map<String, Object> syncDataMap = syncDataList.get(i);
			String id = StringUtil.toString(syncDataMap.get("INFO_ID"));
			addList.add(id);
			deleteList.add(id);
			needDealMap.put(id, syncDataMap);
		}
		
		addList.removeAll(infoIdList);
		addList.removeAll(Collections.singleton(null));
		Log.synclog.debug("待新增数据大小：" + addList.size());
		
		List<Map<String, Object>> addData = new ArrayList<Map<String,Object>>(syncNum);
		int count = 0;
		for (int i = 0; i < addList.size(); i++) {
			
			if (count ++ >= syncNum) {
				break;
			}
			
			String tempId = addList.get(i);
			Map<String, Object> dataMap = needDealMap.get(tempId);
			String pic = ModuleUtil.renderImage(StringUtil.toString(dataMap.get("PIC")));
			String base64Img = ModuleUtil.getImageStrFromUrl(pic);
			if (StringUtil.isEmpty(base64Img)) {
				Log.synclog.debug("图片：" + pic + "获取base64失败，INFO_ID : " + tempId);
				continue;
			}
			
			dataMap.put("PIC", base64Img);
			dataMap.put("BIRTHDAY", ModuleUtil.renderBirthday(StringUtil.toString(dataMap.get("BIRTHDAY"))));
			dataMap.put("PRESENT_ADDRESS", ModuleUtil.renderPersonAddress(StringUtil.toString(dataMap.get("PRESENT_ADDRESS"))));
			dataMap.put("PERMANENT_ADDRESS", ModuleUtil.renderPersonAddress(StringUtil.toString(dataMap.get("PERMANENT_ADDRESS"))));
			addData.add(dataMap);
		}

		target.put("addData", addData);
		infoIdList.removeAll(deleteList);
		infoIdList.removeAll(Collections.singleton(null));
		target.put("deleteData", StringUtils.join(infoIdList.toArray(), ","));
		
		target.put("StatusCode", 1);
		target.put("message", "同步成功！");
	}
}
