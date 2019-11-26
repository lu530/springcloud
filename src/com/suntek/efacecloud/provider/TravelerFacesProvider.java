package com.suntek.efacecloud.provider;

import com.alibaba.fastjson.JSONObject;
import com.suntek.eap.common.CommandContext;
import com.suntek.eap.common.util.DateUtil;
import com.suntek.eap.core.app.AppHandle;
import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.pico.annotation.BeanService;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.pico.annotation.QueryService;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.eaplet.registry.Registry;
import com.suntek.efacecloud.dao.mppdb.MppQueryDao;
import com.suntek.efacecloud.provider.es.TravelerCaptureEsProvider;
import com.suntek.efacecloud.util.CommonUtil;
import com.suntek.efacecloud.util.Constants;
import com.suntek.efacecloud.util.ExcelFileUtil;
import com.suntek.efacecloud.util.FileDowloader;
import com.suntek.efacecloud.util.ModuleUtil;
import com.suntek.sp.common.common.BaseCommandEnum;
import net.sf.json.JSONArray;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 
 * 旅客人脸查询
 * 
 * @author swq
 * @since 1.0.0
 * @version 2018-01-03
 *
 */
@LocalComponent(id = "face/traveler")
public class TravelerFacesProvider {
	private MppQueryDao dao = new MppQueryDao();
	
	@QueryService(id = "query",  description = "旅客人脸查询",since = "2.0", type = "remote", paasService = "true")
	public Map<String, Object> query(RequestContext context) throws Exception {
		boolean isSearchFace = !StringUtil.isNull(StringUtil.toString(context.getParameter("PIC")));
		String deviceIds = StringUtil.toString(context.getParameter("DEVICE_IDS"));
		if (StringUtil.isEmpty(deviceIds)) {
			context.putParameter("DEVICE_IDS", AppHandle.getHandle(Constants.APP_NAME).getProperty("TRAVELER_FACE_DEVICE_ID", ""));
		}
		if (isSearchFace) {
			return searchByPic(context);
		} else {
			return new TravelerCaptureEsProvider().query(context);
		}
	}

	@SuppressWarnings("unchecked")
	private Map<String, Object> searchByPic(RequestContext context) throws Exception {

		ServiceLog.info("旅客人脸查询，1:N开始");
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
		
		List<Map<String, Object>> result = new ArrayList<Map<String, Object>>();
		// 针对存在的数据库主键出现重复的问题，故不使用stream流的方，使用传统的方法转换
		Map<Object, Map<String, Object>> tempMap = new HashMap<>();
		List<String> idList = algoList.stream().map(o -> StringUtil.toString(o.get("FACE_ID"))).collect(Collectors.toList());

		List<Map<String, Object>> tempList = new ArrayList<Map<String, Object>>();
		if (idList.size() > 0) {
			tempList = dao.queryTravelerInfoByIds(idList);
		}
		for (Map<String, Object> temp : tempList) {
			tempMap.put(StringUtil.toString(temp.get("ccode")), temp);
		}

		for (Map<String, Object> infoMap : algoList) {

			Map<String, Object> tempInfo = tempMap.get(StringUtil.toString(infoMap.get("INFO_ID")));
			if (tempInfo == null) {
				tempInfo = new HashMap<String, Object>();
				ServiceLog.debug("infoid:" + StringUtil.toString(infoMap.get("INFO_ID")) + "反查数据为空");
				continue;
			}

			infoMap.put("URL",CommonUtil.renderImage(StringUtil.toString(tempInfo.get("url")).equals("-") ? "" : StringUtil.toString(tempInfo.get("url"))));
			infoMap.put("SOURCE", StringUtil.toString(tempInfo.get("source")));
			infoMap.put("CCODE", StringUtil.toString(tempInfo.get("ccode")));
			infoMap.put("CNAME", StringUtil.toString(tempInfo.get("cname")));
			infoMap.put("SEX", StringUtil.toString(tempInfo.get("sex")));
			infoMap.put("IDCODE", StringUtil.toString(tempInfo.get("idcode")));
			infoMap.put("LTIME", DateUtil.convertByStyle(StringUtil.toString(tempInfo.get("ltime")), "yyyyMMddHHmm", DateUtil.standard_style));
			infoMap.put("FACE_SCORE", "成功");
			result.add(infoMap);
		}
		
		Collections.sort(result, new Comparator<Map<String, Object>>() {
			@Override
			public int compare(Map<String, Object> o1, Map<String, Object> o2) {
				return StringUtil.toString(o2.get("SCORE")).compareTo(StringUtil.toString(o1.get("SCORE")));
			}
		}); 
		return result;
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
		
		String[] headers = {"人脸图片", "姓名", "证件", "人员类型", "入住时间", "旅馆编号", "旅馆类别", "法人", "地址", "电话", "地点", "抓拍时间", "入库时间", "设备名称", "行政区域", "注册状态", "算法类型", "质量分数"};
		String[] dataKey = {"URL", "CNAME", "IDCODE", "", "LTIME", "NOHOTEL", ""};
		List<Map<String, byte[]>> imgList = new ArrayList<>();
		
		try {
			for (Map<String, Object> data : excelDataList) {
				byte[] pic = FileDowloader
						.getImageFromUrl(StringUtil.toString(data
								.get("URL")));
				imgList.add(new HashMap<String, byte[]>() {
					{
						put("URL", pic);
					}
				});
			}
		} catch (Exception exception) {
			ServiceLog.error("personExport异常", exception);
			throw exception;
		}
		
		boolean returnCodeEnum = ExcelFileUtil.exportExcelFile2Req(
				"旅业人脸检索结果"
						+ com.suntek.eap.util.calendar.DateUtil.formatDate(
								DateUtil.getDateTime(), "yyyyMMddHHmmss"),
				headers, dataKey, excelDataList, imgList, context);

		if (!returnCodeEnum) {
			context.getResponse().setError("导出失败！");
		}
	}
	
}
