package com.suntek.efacecloud.provider;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.alibaba.fastjson.JSONObject;
import com.suntek.eap.EAP;
import com.suntek.eap.common.CommandContext;
import com.suntek.eap.common.util.DateUtil;
import com.suntek.eap.core.app.AppHandle;
import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.metadata.DictType;
import com.suntek.eap.pico.annotation.BeanService;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.pico.annotation.QueryService;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.eaplet.registry.Registry;
import com.suntek.efacecloud.dao.mppdb.MppQueryDao;
import com.suntek.efacecloud.model.DeviceEntity;
import com.suntek.efacecloud.provider.es.FaceCaptureEsProvider;
import com.suntek.efacecloud.provider.es.InternetCafesFaceEsProvider;
import com.suntek.efacecloud.provider.mppdb.InternetCafesFaceMpProvider;
import com.suntek.efacecloud.util.Constants;
import com.suntek.efacecloud.util.ExcelFileUtil;
import com.suntek.efacecloud.util.FileDowloader;
import com.suntek.efacecloud.util.ModuleUtil;
import com.suntek.sp.common.common.BaseCommandEnum;

import net.sf.json.JSONArray;

/**
 * 网吧上机人员信息查询
 * 
 * @author guoyl
 * @since 1.0.0
 * @version 2018-03-08
 */
@LocalComponent(id = "internetCafes/face/capture")
public class InternetCafesFaceProvider {

	private MppQueryDao dao = new MppQueryDao();
	
	@QueryService(id = "query", description = "网吧上机人员信息查询", since = "2.0" ,type = "remote", paasService = "true")
	public Map<String, Object> query(RequestContext context) throws Exception {
		// 大数据检索方式
		String BIGDATA_SEARCH_FUN = AppHandle.getHandle(Constants.CONSOLE).getProperty("BIGDATA_SEARCH_FUN", "0");
		boolean isSearchFace = !StringUtil.isNull(StringUtil.toString(context.getParameter("PIC")));
		String deviceIds = StringUtil.toString(context.getParameter("DEVICE_IDS"));
		if (StringUtil.isEmpty(deviceIds)) {
			context.putParameter("DEVICE_IDS", AppHandle.getHandle(Constants.APP_NAME).getProperty("INTERNET_CAFES_FACE_DEVICE_ID", ""));
		}
		
		if (isSearchFace) {
			return searchByPic(context);
		} else {
			switch (BIGDATA_SEARCH_FUN) {
				case Constants.BIGDATA_SEARCH_MPPDB:
					return new InternetCafesFaceMpProvider().query(context);
				case Constants.BIGDATA_SEARCH_ES:
					return new InternetCafesFaceEsProvider().query(context);
				default:
					return new InternetCafesFaceEsProvider().query(context);
			}
		}
	}
	
	@SuppressWarnings("unchecked")
	private Map<String, Object> searchByPic(RequestContext context) throws Exception {
		
		ServiceLog.info("网吧人脸检索，1:N开始");
		Map<String, Object> params = context.getParameters();
		String beginTime = StringUtil.toString(context.getParameter("BEGIN_TIME"));
		String endTime = StringUtil.toString(context.getParameter("END_TIME"));
		String deviceIds = StringUtil.toString(context.getParameter("DEVICE_IDS"));

		if (!StringUtil.isNull(deviceIds)) {
			params.put("DEVICE_ID_LIST", Arrays.asList(deviceIds.split(",")));
		} 
		Map<String, Object> image = new HashMap<>();
		image.put("URL", context.getParameter("PIC"));
		params.put("IMAGE", image);
		params.put("SCORE", context.getParameter("THRESHOLD"));
		params.put("TOPN", context.getParameter("pageSize"));
		params.put("BEGIN_TIME", beginTime);
		params.put("END_TIME", endTime);
		params.put("ALGO_LIST", JSONObject.parseArray((String) context.getParameter("ALGO_LIST")));


		CommandContext commandContext = new CommandContext(context.getHttpRequest());

		Registry registry = Registry.getInstance();

		commandContext.setBody(context.getParameters());
		String vendor = AppHandle.getHandle(Constants.OPENGW).getProperty("EAPLET_VENDOR", "Suntek");
		registry.selectCommand(BaseCommandEnum.faceCapture.getUri(), "4401", vendor).exec(commandContext);

		ServiceLog.debug("调用faceCapture 返回参数" + commandContext.getResponse().getResult());
		Map<String, Object> map = new HashMap<>();
		map.put("CODE", commandContext.getResponse().getCode());
		if (commandContext.getResponse().getCode() != 0L) {
			ServiceLog.error("调用开放平台服务出错" + commandContext.getResponse().getMessage());
			context.getResponse().setError(commandContext.getResponse().getMessage());
			map.put("LIST", Collections.emptyList());
		} else {
			List<Map<String, Object>> tempResultList = (List<Map<String, Object>>) commandContext.getResponse().getData("ALGO_LIST");
			List<Map<String, Object>> resultList = new ArrayList<>();
			for (Map<String, Object> algoDataMap : tempResultList) {
				Map<String, Object> tempMap = new HashMap<String, Object>();

				ArrayList<Map<String, Object>> algoList = (ArrayList<Map<String, Object>>) algoDataMap.get("LIST");
				String algorithmCode = StringUtil.toString(algoDataMap.get("ALGO_CODE"));

				Map<Object, Object> algoMap = ModuleUtil.getAlgorithmById(algorithmCode);
				String algorithmName = StringUtil.toString(algoMap.get("ALGORITHM_NAME"));
				String algorithmSort = StringUtil.toString(algoMap.get("ALGORITHM_SORT"));
				List<Map<String, Object>> infoList = algoList;
				if (infoList.size() == 0) {
					ServiceLog.debug("算法代码为" + algorithmCode + "的算法" + algorithmName + "数据为空,过滤掉该算法返回");
					continue;
				}
				tempMap.put("ALGORITHM_CODE", algorithmCode);
				tempMap.put("ALGORITHM_ANME", algorithmName);
				tempMap.put("ALGORITHM_SORT", algorithmSort);
				tempMap.put("ALGORITHM_LIST", infoList);
				resultList.add(tempMap);
			}
			Collections.sort(resultList, new Comparator<Map<String, Object>>() {
				@Override
				public int compare(Map<String, Object> o1, Map<String, Object> o2) {
					String time1 = StringUtil.toString(o1.get("ALGORITHM_SORT"));
					String time2 = StringUtil.toString(o2.get("ALGORITHM_SORT"));
					return time1.compareTo(time2);
				}
			});
			map.put("LIST", resultList);
		}
		return map;
	}
	
	
	private List<Map<String, Object>> render(ArrayList<Map<String, Object>> algoList, String algorithmCode) throws Exception {
		List<Map<String, Object>> resultList = new ArrayList<Map<String, Object>>();

		List<String> idList = algoList.stream().map(o -> StringUtil.toString(o.get("FACE_ID"))).collect(Collectors.toList());

		List<Map<String, Object>> tempList = new ArrayList<Map<String, Object>>();
		// 针对存在的数据库主键出现重复的问题，故不使用stream流的方，使用传统的方法转换
		Map<Object, Map<String, Object>> idDataMap = new HashMap<>();
		if (idList.size() > 0) {
			tempList = dao.queryWBSJfoByIds(idList);
		}
		for (Map<String, Object> temp : tempList) {
			idDataMap.put(temp.get("infoid"), temp);
		}

		for (Map<String, Object> map : algoList) {
			Map<String, Object> tempMap = new HashMap<String, Object>();
			Map<String, Object> tempInfo = idDataMap.get(Long.parseLong(StringUtil.toString(map.get("FACE_ID"))));
			if (tempInfo == null) {
				tempInfo = new HashMap<String, Object>();
				ServiceLog.debug("infoid:" + map.get("FACE_ID") + "反查数据为空");
				continue;
			}

			Date begindate = (Date) tempInfo.get("begindate");
			tempMap.put("JGSK", begindate == null ? "" : DateUtil.dateToString(begindate, DateUtil.yyyy_MM_dd_style));
			Date gzdb_addtime = (Date) tempInfo.get("gzdb_addtime");
			tempMap.put("ADD_TIME", gzdb_addtime == null ? "" : DateUtil.dateToString(gzdb_addtime));
			tempMap.put("OBJ_PIC", ModuleUtil.renderImage(StringUtil.toString(tempInfo.get("rltpurl"))));
			tempMap.put("PIC", ModuleUtil.renderImage(StringUtil.toString(tempInfo.get("zp"))));
			tempMap.put("INFO_ID", StringUtil.toString(tempInfo.get("infoid")));
			tempMap.put("IDENTITY_ID", StringUtil.toString(tempInfo.get("sfzh")));
			tempMap.put("PUB_CODE", StringUtil.toString(tempInfo.get("pubcode")));

			DeviceEntity device = (DeviceEntity) EAP.metadata.getDictModel(DictType.D_FACE, map.get("DEVICE_ID"), DeviceEntity.class);
			tempMap.put("JGSK", map.get("CAPTURE_TIME"));
			tempMap.put("DEVICE_ID", map.get("DEVICE_ID"));
			tempMap.put("DEVICE_NAME", StringUtil.toString(device.getDeviceName()));
			tempMap.put("DEVICE_ADDR", StringUtil.toString(device.getDeviceAddr()));
			tempMap.put("INFO_ID", map.get("FACE_ID"));
			tempMap.put("SCORE", map.get("SCORE"));
			tempMap.put("ORG_NAME", device.getOrgName());

			resultList.add(tempMap);
		}
		
		Collections.sort(resultList, new Comparator<Map<String, Object>>() {
			@Override
			public int compare(Map<String, Object> o1, Map<String, Object> o2) {
				return StringUtil.toString(o2.get("SCORE")).compareTo(StringUtil.toString(o1.get("SCORE")));
			}
		}); 
		return resultList;
	}
	
	@SuppressWarnings("unchecked")
	@BeanService(id = "exportData", description = "数据导出")
	public void dataExport(RequestContext context) throws Exception {
		String excelData = StringUtil.toString(context.getParameter("EXPORT_DATA"));
		
		List<Map<String, Object>> excelDataList = new ArrayList<Map<String, Object>>();
		if (!StringUtil.isNull(excelData)) {
			excelDataList = JSONArray.fromObject(excelData);
		} else {
			context.putParameter("pageNo", "1");
			context.putParameter("pageSize", Constants.EXPORT_MAX_COUNT);
			Map<String, Object> map = query(context);
			excelDataList = (List<Map<String, Object>>) map.get("records");
		}
		
		String[] headers = {"人脸图片", "姓名", "证件", "性别", "登记时间", "网吧编号", "地点", "抓拍时间", "入库时间", "设备名称", "行政区域", "注册状态", "算法类型", "质量分数"};
		String[] dataKey = {"OBJ_PIC", "NAME", "IDENTITY_ID", "SEX", "STARTTIME", "PUB_CODE", "DEVICE_ADDR", "JGSK", "ADD_TIME", "DEVICE_NAME", "ORG_NAME", "REGISTER_STATUE", "ALGORITHM_NAME", "SCORE"};
		List<Map<String, byte[]>> imgList = new ArrayList<>();
		
		try {
			for (Map<String, Object> data : excelDataList) {
				byte[] pic = FileDowloader
						.getImageFromUrl(StringUtil.toString(data
								.get("OBJ_PIC")));
				imgList.add(new HashMap<String, byte[]>() {
					{
						put("OBJ_PIC", pic);
					}
				});
				
				data.put("REGISTER_STATUE", StringUtil.isEmpty("" + StringUtil.toString(data.get("RLTZ")))?0:1);
			}
		} catch (Exception exception) {
			ServiceLog.error("personExport异常", exception);
			throw exception;
		}
		
		boolean returnCodeEnum = ExcelFileUtil.exportExcelFile2Req(
				"网吧人脸检索结果"
						+ com.suntek.eap.util.calendar.DateUtil.formatDate(
								DateUtil.getDateTime(), "yyyyMMddHHmmss"),
				headers, dataKey, excelDataList, imgList, context);

		if (!returnCodeEnum) {
			context.getResponse().setError("导出失败！");
		}
	}
	
}
