package com.suntek.efacecloud.provider;

import com.alibaba.fastjson.JSONObject;
import com.suntek.eap.common.CommandContext;
import com.suntek.eap.core.app.AppHandle;
import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.pico.annotation.BeanService;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.pico.annotation.QueryService;
import com.suntek.eap.util.DateUtil;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.eaplet.registry.Registry;
import com.suntek.efacecloud.dao.FaceCommonDao;
import com.suntek.efacecloud.dao.FaceDispatchedAlarmDao;
import com.suntek.efacecloud.provider.es.FaceCaptureEsProvider;
import com.suntek.efacecloud.service.WJFaceCaptureService;
import com.suntek.efacecloud.util.*;
import com.suntek.sp.common.common.BaseCommandEnum;
import net.sf.json.JSONArray;
import org.springframework.util.ObjectUtils;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 人脸抓拍库查询 efacecloud/rest/v6/face/capture
 *
 * @author wsh
 * @since 1.0.0
 * @version 2017-06-29
 */
@LocalComponent(id = "face/capture")
public class FaceCaptureProvider {

	private FaceCommonDao commonDao = new FaceCommonDao();
	private FaceDispatchedAlarmDao dao = new FaceDispatchedAlarmDao();
	
	@QueryService(id = "query", description = "人脸抓拍数据查询", since = "2.0", type = "remote", paasService = "true")
	public Map<String, Object> query(RequestContext context) throws Exception {
		//新增参数：人脸来源(映射成设备选择)
		//算法列表：默认前端传入，当开启人脸检测时，由通过人种选择配置的算法列表 
		Map<String, Object> params = context.getParameters();
		// 大数据检索方式
		String isSearchFace = StringUtil.toString(params.get("PIC"));
		String needDevice = StringUtil.toString(params.get("NEED_DEVICE"));
//		String sourceType = StringUtil.toString(params.get("SOURCE_TYPE"));
		String deviceIds = StringUtil.toString(context.getParameter("DEVICE_IDS"));
		try {
			if (StringUtil.isEmpty(deviceIds) && !context.getUserCode().equals("admin")) {
				Set<String> deviceSet = DevicesRedisUtil.getDeviceList(context.getUserCode(), Constants.DEVICE_TYPE_FACE);
				if (!ObjectUtils.isEmpty(deviceSet)) {
					deviceIds = String.join(",", deviceSet);
					context.putParameter("DEVICE_IDS", deviceIds);
				}
			}
			//根据来源选择设备
			//暂时无用，先隐藏 2019-11-28 wudapei
//			if(!StringUtil.isEmpty(sourceType) && StringUtil.isEmpty(deviceIds)) {
//				context.putParameter("DEVICE_IDS", String.join(",", DeviceInfoUtil.getDeviceListBySourceType(sourceType, context.getUserCode())));
//			}
			// 添加判断条件,当无设备id且needDevice=1时,不是查询所有设备
			if (StringUtil.isEmpty(deviceIds) && needDevice.equals("1")) {
				context.putParameter("DEVICE_IDS", "-1");
			}
		} catch (Exception e) {
			ServiceLog.error("从Redis获取缓存设备失败，", e);
		}
		
		if (!StringUtil.isNull(isSearchFace)) {
			return searchByPic(context);
		} else {
			return new FaceCaptureEsProvider().query(context);
		}
	}

	@SuppressWarnings("unchecked")
	private Map<String, Object> searchByPic(RequestContext context)
			throws Exception {

        // 外籍人以图搜图逻辑
        if (ConfigUtil.isBlack()) {
            return new WJFaceCaptureService().searchByPic(context);
        }

		ServiceLog.info("路人库检索，1:N开始");
		Map<String, Object> params = context.getParameters();
		String vendor = ConfigUtil.getVendor();

		// 通过上传图片调用开放平台人脸属性提取服务开始 2018年9月4日 陈文杰添加
		String faceTypeAlgoTypes = AppHandle.getHandle(Constants.APP_NAME)
				.getProperty("FACE_TYPE_ALGO_TYPES", "");
		String algoAll = StringUtil.toString(params.get("ALGOALL"));
		String isSearchFace = StringUtil.toString(params.get("PIC"));
		ServiceLog.info("ALGO_LIST:" + params.get("ALGO_LIST"));
		ServiceLog.info("FACE_TYPE_ALGO_TYPES:" + faceTypeAlgoTypes);
		ServiceLog.info("是否进行综合查询:" + algoAll);
		if (!faceTypeAlgoTypes.equals("") && !algoAll.equals("")) {
			JSONArray searchAlgoArray = JSONArray.fromObject(StringUtil
					.toString(params.get("ALGO_LIST")));// 前端需要查询的算法列表
			Map<String, String> searchAlgoMap = new HashMap<String, String>();
			for (int i = 0; i < searchAlgoArray.size(); i++) {
				net.sf.json.JSONObject searchAlgoJsonObject = searchAlgoArray
						.getJSONObject(i);
				searchAlgoMap.put(searchAlgoJsonObject.get("ALGO_TYPE")
						.toString(), searchAlgoJsonObject.get("THRESHOLD")
						.toString());
			}
			ServiceLog.info("前端需要查询的算法列表:" + searchAlgoMap);
			CommandContext commandContext = new CommandContext(
					context.getHttpRequest());
			Registry registry = Registry.getInstance();
			params.put("fileUrl", isSearchFace);
			params.put("algoType", faceTypeAlgoTypes);// 分类算法
			commandContext.setBody(params);
			registry.selectCommand(
					BaseCommandEnum.faceAttributesExtract.getUri(), "4401",
					vendor).exec(commandContext);
			if (commandContext.getResponse().getCode() != 0L) {
				ServiceLog.error("调用开放平台人脸属性提取服务出错"
						+ commandContext.getResponse().getMessage());
			} else {
				JSONObject structInfo = JSONObject.parseObject(StringUtil
						.toString(commandContext.getResponse().getData(
								"struct_info")));
				String race = StringUtil.toString(structInfo.get("race"));// 照片的种族
				ServiceLog.info("照片的种族:" + race);
				List<Map<String, Object>> algorithmList = commonDao
						.getAlgorithmByRace(race);
				JSONArray algoArray = new JSONArray();
				for (Map<String, Object> algoMap : algorithmList) {
					JSONObject algoObject = new JSONObject();
					algoObject.put("ALGO_TYPE", algoMap.get("ALGORITHM_ID"));
					algoObject.put("THRESHOLD",
							searchAlgoMap.get(algoMap.get("ALGORITHM_ID")));
					algoArray.add(algoObject);
				}
				if (algoArray.size() > 0) {
					ServiceLog
							.info("种族[" + race + "]路由查询到的特征提取算法：" + algoArray);
					context.putParameter("ALGO_LIST", algoArray.toString());
				} else {
					ServiceLog.info("未配置种族特征提取算法路由");
				}
				ServiceLog.info("请求参数:" + context.getParameters());
			}

		}
		// //通过上传图片调用开放平台人脸属性提取接口结束

		String deviceIds = StringUtil.toString(params.get("DEVICE_IDS"));

		Map<String, Object> image = new HashMap<>();
		deviceIds = StringUtil.toString(context.getParameter("DEVICE_IDS"));
		if (!StringUtil.isNull(deviceIds)) {
			params.put("DEVICE_ID_LIST", Arrays.asList(deviceIds.split(",")));
		}
		image.put("URL", context.getParameter("PIC"));
		params.put("IMAGE", image);
		params.put("SCORE", context.getParameter("THRESHOLD"));
		params.put("ALGO_LIST", JSONObject.parseArray((String) context
				.getParameter("ALGO_LIST")));

		CommandContext commandContext = new CommandContext(
				context.getHttpRequest());
		Registry registry = Registry.getInstance();
		commandContext.setBody(context.getParameters());

		// registry.selectCommand(BaseCommandEnum.faceCapture.getUri()).exec(commandContext);

		registry.selectCommand(BaseCommandEnum.faceCapture.getUri(), "4401",
				vendor).exec(commandContext);

		Map<String, Object> map = new HashMap<>();

		if (commandContext.getResponse().getCode() != 0L) {
			ServiceLog.error("调用开放平台服务出错"
					+ commandContext.getResponse().getMessage());
			context.getResponse().setError(
					commandContext.getResponse().getMessage());
			map.put("LIST", Collections.emptyList());
		} else {
			List<Map<String, Object>> tempResultList = (List<Map<String, Object>>) commandContext
					.getResponse().getData("ALGO_LIST");
			List<Map<String, Object>> resultList = new ArrayList<>();
			//添加来源字段
//			String sourceType = StringUtil.toString(params.get("SOURCE_TYPE"));
//			boolean isAdd = !StringUtil.isEmpty(sourceType);
			for (Map<String, Object> algoDataMap : tempResultList) {
				Map<String, Object> tempMap = new HashMap<String, Object>();

				ServiceLog.error("路人库检索返回的行数据：" + algoDataMap);
				ArrayList<Map<String, Object>> algoList = (ArrayList<Map<String, Object>>) algoDataMap
						.get("LIST");
				String algorithmCode = StringUtil.toString(algoDataMap
						.get("ALGO_CODE"));
				Map<Object, Object> algoMap = ModuleUtil
						.getAlgorithmById(Integer.valueOf(algorithmCode));
				String algorithmName = StringUtil.toString(algoMap
						.get("ALGORITHM_NAME"));
				List<Map<String, Object>> infoList = algoList;

				if (infoList.size() == 0) {
					ServiceLog.debug("算法代码为" + algorithmCode + "的算法"
							+ algorithmName + "数据为空,过滤掉该算法返回");
					continue;
				}
//              Map<String, Map<String, Object>> idGriupMap = new HashMap<String, Map<String, Object>>();
//				if(isAdd) {
//					Set<String> set = infoList.stream().map(o -> StringUtil.toString(o.get("DEVICE_ID"))).collect(Collectors.toSet());
//					idGriupMap = DeviceInfoUtil.queryDeviceGroupByIds(String.join(",", set));
//				}

                //一次性查询获得infoId为key的数据集
                //Map<String, Map<String, Object>> actMap = getActivityMap(infoList);

				for (Map<String, Object> info : infoList) {
					String createTime = StringUtil.toString(info
							.get("CREATETIME"));
					if (!StringUtil.isEmpty(createTime)) {
						createTime = DateUtil.convertByStyle(createTime,
								DateUtil.yyMMddHHmmss_style,
								DateUtil.standard_style);
					}
					info.put("CREATETIME", createTime);

					/*String infoId = StringUtil.toString(info.get("INFO_ID"));
					if (actMap.containsKey(infoId)) {
                        info.putAll(actMap.get(infoId));
                    }*/
					//是否添加来源类型
//					if(isAdd) {
//						Map<String, Object> devideGroup = idGriupMap.get(info.get("DEVICE_ID"));
//						info.put("SOURCE_TYPE", devideGroup == null ? "未知" : devideGroup.get("groupId"));
//						info.put("SOURCE_NAME", devideGroup == null ? "未知" : devideGroup.get("name"));
//					}
				}
				tempMap.put("ALGORITHM_CODE", algorithmCode);
				tempMap.put("ALGORITHM_ANME", algorithmName);
				tempMap.put("ALGORITHM_LIST", infoList);
				resultList.add(tempMap);
			}
			map.put("LIST", resultList);
		}
		return map;
	}

    /**
     * 一次查询activity_info表
     * @param infoList
     * @return
     */
    public Map<String, Map<String, Object>> getActivityMap(List<Map<String, Object>> infoList) {
        Set<String> infoIds = infoList.stream().map(o -> StringUtil.toString(o.get("INFO_ID"))).collect(Collectors.toSet());
        Map<String, Map<String, Object>> actMap = Collections.emptyMap();
        if (!infoIds.isEmpty()) {
            try {
                List<Map<String, Object>> actList = dao.queryActivityInfo(infoIds);
                actMap = actList.stream().collect(Collectors.toMap(a -> StringUtil.toString(a.get("INFO_ID")), a -> a, (oldValue, newValue) -> newValue));
            } catch (Exception e) {
                ServiceLog.error("不存在activity_info表: " + e);
            }
        }
        return actMap;
    }



	@SuppressWarnings({ "unchecked", "serial" })
	@BeanService(id = "exportFace", description = "路人库检索导出")
	public void faceExport(RequestContext context) throws Exception {
		String searchImg = StringUtil.toString(context
				.getParameter("SEARCH_IMG_URL"));
		String excelData = StringUtil.toString(context
				.getParameter("EXPORT_DATA"));
		List<Map<String, Object>> excelDataList = new ArrayList<Map<String, Object>>();
		if (!StringUtil.isNull(excelData)) {
			excelDataList = JSONArray.fromObject(excelData);
		} else {
			context.putParameter("pageNo", "1");
			context.putParameter("pageSize", Constants.EXPORT_MAX_COUNT);
			Map<String, Object> map = this.query(context);
			excelDataList = (List<Map<String, Object>>) map.get("records");
		}

		String[] searchImgHeader = {"检索图片", "原图", "抓拍图片", "相似度", "地点", "抓拍时间", "设备名称"};
		String[] searchImgDataKey = {"searchImgUrl", "imageUrl", "frameImageUrl", "SCORE", "DEVICE_ADDR", "JGSK", "DEVICE_NAME"};
		String[] headers = {"原图", "抓拍图片", "地点", "抓拍时间", "设备名称"};
		String[] dataKey = {"imageUrl", "frameImageUrl", "DEVICE_ADDR", "JGSK", "DEVICE_NAME"};
		List<Map<String, byte[]>> imgList = new ArrayList<>();
		if (!StringUtil.isEmpty(searchImg)) {
			headers = searchImgHeader;
			dataKey = searchImgDataKey;
			try {
				byte[] searchImgUrl = FileDowloader.getImageFromUrl(searchImg);
				for (Object obj : excelDataList) {
					Map<String, Object> data = (Map<String, Object>) obj;
					byte[] imageUrl = FileDowloader.getImageFromUrl(StringUtil
							.toString(data.get("PIC")));
					byte[] frameImageUrl = FileDowloader
							.getImageFromUrl(StringUtil.toString(data
									.get("OBJ_PIC")));
					imgList.add(new HashMap<String, byte[]>() {
						{
							put("searchImgUrl", searchImgUrl);
							put("imageUrl", imageUrl);
							put("frameImageUrl", frameImageUrl);
						}
					});
					data.put("SCORE", StringUtil.toString(data.get("SCORE"))
							+ "%");
				}
			} catch (Exception exception) {
				ServiceLog.error("faceExport异常", exception);
				throw exception;
			}
		} else {
			try {
				for (Map<String, Object> data : excelDataList) {
					byte[] imageUrl = FileDowloader.getImageFromUrl(StringUtil
							.toString(data.get("PIC")));
					byte[] frameImageUrl = FileDowloader
							.getImageFromUrl(StringUtil.toString(data
									.get("OBJ_PIC")));
					imgList.add(new HashMap<String, byte[]>() {
						{
							put("imageUrl", imageUrl);
							put("frameImageUrl", frameImageUrl);
						}
					});
					data.put("SCORE", StringUtil.toString(data.get("SCORE"))
							+ "%");
				}
			} catch (Exception exception) {
				ServiceLog.error("personExport异常", exception);
				throw exception;
			}
		}

		boolean returnCodeEnum = ExcelFileUtil.exportExcelFile2Req(
				"导出结果"
						+ com.suntek.eap.util.calendar.DateUtil.formatDate(
								DateUtil.getDateTime(), "yyyyMMddHHmmss"),
				headers, dataKey, excelDataList, imgList, context);

		if (!returnCodeEnum) {
			context.getResponse().setError("导出失败！");
		}
	}

}
