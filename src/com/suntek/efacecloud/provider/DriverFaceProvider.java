package com.suntek.efacecloud.provider;

import com.suntek.eap.EAP;
import com.suntek.eap.common.CommandContext;
import com.suntek.eap.common.util.DateUtil;
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
import com.suntek.efacecloud.provider.es.DriverFaceEsProvider;
import com.suntek.efacecloud.util.Constants;
import com.suntek.efacecloud.util.DevicesRedisUtil;
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
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 汽车驾驶员查询
 *
 * @author swq
 * @version 2017-10-09
 * @since 1.0.0
 */
@LocalComponent(id = "face/driver")
public class DriverFaceProvider {
    private MppQueryDao dao = new MppQueryDao();

    @QueryService(id = "query", description = "汽车驾驶员查询", since = "2.0", paasService = "true")
    public Map<String, Object> query(RequestContext context) throws Exception {

        Map<String, Object> params = context.getParameters();
        boolean isSearchFace = !StringUtil.isNull(StringUtil.toString(params.get("PIC")));
        String deviceIds = StringUtil.toString(context.getParameter("DEVICE_IDS"));
        if (StringUtil.isEmpty(deviceIds) && !context.getUserCode().equals("admin")) {
            Set<String> deviceSet = DevicesRedisUtil.getDeviceList(context.getUserCode(), Constants.CAMERA_CAR);
            context.putParameter("DEVICE_IDS", String.join(",", deviceSet));
        }

        if (isSearchFace) {
            return searchByPic(context);
        } else {
            return new DriverFaceEsProvider().query(context);
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> searchByPic(RequestContext context) throws Exception {
        Map<String, Object> params = context.getParameters();

        String beginTime = StringUtil.toString(context.getParameter("beginTime"));
        String endTime = StringUtil.toString(context.getParameter("endTime"));
        String deviceIds = StringUtil.toString(context.getParameter("kkbh"));
        if (!StringUtil.isNull(deviceIds)) {
            params.put("DEVICE_ID_LIST", Arrays.asList(deviceIds.split(",")));
        }

        Map<String, Object> image = new HashMap<>();
        image.put("URL", context.getParameter("PIC"));
        params.put("IMAGE", image);
        params.put("SCORE", context.getParameter("THRESHOLD"));
        params.put("TOPN", context.getParameter("pageSize"));

        // 针对传入时间段进行处理
        String beginDay = StringUtil.toString(context.getParameter("beginDay"));
        String endDay = StringUtil.toString(context.getParameter("endDay"));
        String beginDayTime = StringUtil.toString(context.getParameter("beginDayTime"));
        String endDayTime = StringUtil.toString(context.getParameter("endDayTime"));
        if (!StringUtil.isNull(beginDay) && !StringUtil.isNull(endDay) && !StringUtil.isNull(beginDayTime) && !StringUtil.isNull(endDayTime)) {
            beginTime = beginDay + " " + beginDayTime + ":00";
            endTime = endDay + " " + endDayTime + ":00";
        }
        params.put("BEGIN_TIME", beginTime);
        params.put("END_TIME", endTime);

        CommandContext commandContext = new CommandContext(context.getHttpRequest());

        Registry registry = Registry.getInstance();

        commandContext.setBody(context.getParameters());

        registry.selectCommand(BaseCommandEnum.faceTrack.getUri()).exec(commandContext);

        ServiceLog.debug("调用faceTrack返回参数" + commandContext.getResponse().getResult());

        Map<String, Object> map = new HashMap<>();
        map.put("CODE", commandContext.getResponse().getCode());
        if (commandContext.getResponse().getCode() != 0L) {
            ServiceLog.error("调用开放平台服务出错" + commandContext.getResponse().getMessage());
            context.getResponse().setError("服务发生异常 " + commandContext.getResponse().getMessage());
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
            tempList = dao.queryDriverInfoByIds(idList);
        }
        for (Map<String, Object> temp : tempList) {
            idDataMap.put(temp.get("xxzjbh"), temp);
        }

        for (Map<String, Object> map : algoList) {
            Map<String, Object> tempMap = new HashMap<String, Object>();
            Map<String, Object> tempInfo = idDataMap.get(Long.parseLong(StringUtil.toString(map.get("FACE_ID"))));
            if (tempInfo == null) {
                tempInfo = new HashMap<String, Object>();
                ServiceLog.debug("infoid:" + map.get("FACE_ID") + "反查数据为空");
                continue;
            }

            tempMap.put("HPHM", tempInfo.get("hphm"));
            tempMap.put("PIC_ABBREVIATE", ModuleUtil.renderImage(StringUtil.toString(tempInfo.get("qjtpurl"))));
            tempMap.put("PIC_DRIVER", ModuleUtil.renderImage(StringUtil.toString(tempInfo.get("rltpurl"))));
            tempMap.put("PIC_VEHICLE", ModuleUtil.renderImage(StringUtil.toString(tempInfo.get("cltpurl"))));
            tempMap.put("DRIVER_ROLE", ModuleUtil.renderDriverRole(tempInfo.get("zjwz")));
            tempMap.put("HPYS", EAP.metadata.getDictValue(DictType.V_PLATE_COLOR, StringUtil.toString(tempInfo.get("hpys"))));
            tempMap.put("CLLX_NAME", EAP.metadata.getDictValue(DictType.V_VEHICLE_TYPE, StringUtil.toString(tempInfo.get("cllx"))));
            tempMap.put("CLLX", StringUtil.toString(tempInfo.get("cllx")));
            tempMap.put("CAR_BRAND", StringUtil.toString(tempInfo.get("clpp") + " " + tempInfo.get("clzpp")));
            tempMap.put("ZPPDM", StringUtil.toString(tempInfo.get("clzpp")));
            tempMap.put("PPDM", StringUtil.toString(tempInfo.get("clpp")));

            DeviceEntity device = (DeviceEntity) EAP.metadata.getDictModel(DictType.D_CAR, map.get("DEVICE_ID"), DeviceEntity.class);
            tempMap.put("JGSK", map.get("CAPTURE_TIME"));
            tempMap.put("DEVICE_ID", map.get("DEVICE_ID"));
            tempMap.put("DEVICE_NAME", StringUtil.toString(device.getDeviceName()));
            tempMap.put("KKMC", StringUtil.toString(device.getDeviceAddr()));
            tempMap.put("INFO_ID", map.get("FACE_ID"));
            tempMap.put("SIMILARITY", map.get("SCORE"));
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

        String[] headers = {"原图", "主驾图", "车牌号码", "车辆类型", "车辆品牌", "采集时间", "地点"};
        String[] dataKey = {"PIC_ABBREVIATE", "PIC_DRIVER", "HPHM", "CLLX_NAME", "CAR_BRAND", "JGSK", "KKMC"};
        List<Map<String, byte[]>> imgList = new ArrayList<>();

        try {
            for (Map<String, Object> data : excelDataList) {
                byte[] abbreviate = FileDowloader
                        .getImageFromUrl(StringUtil.toString(data
                                .get("PIC_ABBREVIATE")));
                byte[] driver = FileDowloader
                        .getImageFromUrl(StringUtil.toString(data
                                .get("PIC_DRIVER")));
                imgList.add(new HashMap<String, byte[]>() {
                    {
                        put("PIC_ABBREVIATE", abbreviate);
                        put("PIC_DRIVER", driver);
                    }
                });
            }
        } catch (Exception exception) {
            ServiceLog.error("personExport异常", exception);
            throw exception;
        }

        boolean returnCodeEnum = ExcelFileUtil.exportExcelFile2Req(
                "汽车驾驶人员人脸检索结果"
                        + com.suntek.eap.util.calendar.DateUtil.formatDate(
                        DateUtil.getDateTime(), "yyyyMMddHHmmss"),
                headers, dataKey, excelDataList, imgList, context);

        if (!returnCodeEnum) {
            context.getResponse().setError("导出失败！");
        }
    }

}
