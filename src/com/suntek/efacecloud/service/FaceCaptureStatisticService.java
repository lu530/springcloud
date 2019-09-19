package com.suntek.efacecloud.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.elasticsearch.action.search.SearchType;

import com.suntek.eap.EAP;
import com.suntek.eap.index.Query;
import com.suntek.eap.index.SearchEngineException;
import com.suntek.eap.jdbc.PageQueryResult;
import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.pico.annotation.BeanService;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.pico.annotation.QueryService;
import com.suntek.eap.util.DateUtil;
import com.suntek.eap.util.EsUtil;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.efacecloud.dao.FaceCaptureStatisticDao;
import com.suntek.efacecloud.model.ExcelColumn;
import com.suntek.efacecloud.util.Constants;
import com.suntek.efacecloud.util.ExcelUtil;

import net.sf.json.JSONArray;

/**
 * 统计分析 服务类
 * @author wudapei
 *
 */
@LocalComponent(id = "faceCap/statistic")
public class FaceCaptureStatisticService {

    private FaceCaptureStatisticDao dao = new FaceCaptureStatisticDao();
    private DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private String beginTime = "2019-07-01 12:00:00";
       
    @QueryService(id = "query", description = "获取区域设备抓拍统计")
    public void query(RequestContext context) {
        
        String keyWord = StringUtil.toString(context.getParameter("KEY_WORDS"));
        ServiceLog.info("1、获取区域设备抓拍统计--->参数：" + context.getParameters());
        
        //1、查询区域及其下设备数量（派出所org_code是8位？）
        List<Map<String, Object>> numList = dao.getDeviceNumByOrgCode(keyWord);
        ServiceLog.info("2、查询区域及其下设备数量：" + numList);
        
        if(null == numList || numList.size() == 0) {
            context.getResponse().putData("DATA", new ArrayList<Map<String, Object>>());
            context.getResponse().putData("CODE", 0L);
            return;
        }
        
        //取orgCodelist
        Map<String, List<Map<String, Object>>> numListMap = numList.stream().collect(
            Collectors.groupingBy(numMap -> StringUtil.toString(numMap.get("ORG_CODE"))));
        
        List<String> orgCodeList = new ArrayList<String>(numListMap.keySet());  
        
        //2、查询区域下设备
        List<Map<String, Object>> policeDeviceList = dao.getDeviceListByOrgCodeList(orgCodeList);
        ServiceLog.info("3、查询区域下设备id列表：" + policeDeviceList);
        
        //3、按区域编码分组   [{"44010223"="1233"},{"44010201"="45"},{"44010223"="1099"}]
        //--->{"44010223"=["1233","45"],"44010201"=["1099"]}
        Map<String, List<String>> mapList = policeDeviceList.stream().collect(
            Collectors.groupingBy(map -> StringUtil.toString(map.get("ORG_CODE")), 
                Collectors.mapping(map -> StringUtil.toString(map.get("DEVICE_ID")), Collectors.toList())));    
        ServiceLog.info("4、查询结果分组后：" + mapList);
        
        String endTime = formatter.format(LocalDateTime.now());
        
        //5、定义结果集
        List<Map<String, Object>> returnList = new ArrayList<Map<String, Object>>();
        
        int count = 1;
        //按区域编码遍历并组装结果集
        Set<String> keySet = mapList.keySet();
        for(String key : keySet){
            
            List<String> deviceIdList = mapList.get(key);
            
            //6、查询（mysql：face_device_info）设备的状态 正常：？，异常：？
            Map<String, Object> statusMap = dao.getDeviceStatusNum(deviceIdList);
            String normalDeviceStr = StringUtil.toString(statusMap.get("NORMAL_DEVICE"), "0");
            String unnormalDeviceStr = StringUtil.toString(statusMap.get("UNNORMAL_DEVICE"), "0");
            ServiceLog.info("5." + count + "、查询区域：" + key + "设备的状态统计数：" + statusMap);
            
            //7、查询（es/mpp）一批设备的抓拍量
            Long captureTotal = 0L;
            try {
                
                PageQueryResult pageQueryResult = searchEsByDeviceId(deviceIdList, beginTime, endTime);
                
                captureTotal = pageQueryResult.getTotalSize();
                
            } catch (SearchEngineException e) {
                ServiceLog.error("查询设备抓拍量异常：" + e.getLocalizedMessage(), e);
            }
            ServiceLog.info("6." + count + "、查询区域：" + key + "设备的抓拍统计数：" + captureTotal);
            
            //8、组装结果集
            Map<String, Object> tempMap = numListMap.get(key).get(0);
//            tempMap.putAll(statusMap);
            tempMap.put("DEVICE_NORMAL_NUM", normalDeviceStr);
            tempMap.put("DEVICE_UNNORMAL_NUM", unnormalDeviceStr);
            tempMap.put("DEVICE_CAPTURE_TOTAL", captureTotal);
            
            returnList.add(tempMap);
            
            count ++;
        }
        
        ServiceLog.info("7、获取区域设备抓拍统计服务  结束");
        
        context.getResponse().putData("DATA", returnList);
        context.getResponse().putData("CODE", 0L);
    }
    
    @QueryService(id = "detail", description = "获取设备抓拍统计")
    public void detail(RequestContext context) {
        
        //1、获取参数
        String orgCode = StringUtil.toString(context.getParameter("ORG_CODE"));
        String keyWord = StringUtil.toString(context.getParameter("KEY_WORDS"));
        
        ServiceLog.info("1、获取设备抓拍统计，参数：" + context.getParameters());
        
        if(StringUtil.isEmpty(orgCode)) {
            context.getResponse().setError("参数异常：区域编码不能为空！");
            return;
        }
        
        //2、查询区域下设备
        List<Map<String, Object>> deviceList = dao.getDeviceListByOrgCode(orgCode, keyWord);
        ServiceLog.info("2、查询区域下设备，结果：" + deviceList);
        
        if(null == deviceList || deviceList.size() == 0) {
            context.getResponse().putData("DATA", new ArrayList<Map<String, Object>>());
            context.getResponse().putData("CODE", 0L);
            return;
        }
        
        
        //3、按设备编码分组
        Map<String, List<Map<String, Object>>> deviceListMap = deviceList.stream().collect(
            Collectors.groupingBy(numMap -> StringUtil.toString(numMap.get("DEVICE_ID"))));   
        ServiceLog.info("3、按设备编码分组，结果：" + deviceList);
        
        Set<String> keySet = deviceListMap.keySet();
        List<String> deviceIdList = new ArrayList<String>(keySet);  
        
        //4、获取设备状态 key=deviceid，value=status
        List<Map<String, Object>> deviceStatusList = dao.getDeviceStatus(deviceIdList);
        Map<String, String> deviceStatusMap = deviceStatusList.stream().collect(
            Collectors.groupingBy(map -> StringUtil.toString(map.get("DEVICE_ID")), 
                Collectors.mapping(map -> StringUtil.toString(map.get("DEVICE_STATUS")), Collectors.joining()))); 
        ServiceLog.info("4、获取设备状态并分组，结果：" + deviceStatusMap);
        
        //5、获取设备抓拍量 key=deviceid，value=num
        Map<Object, Long> deviceCountMap = new HashMap<Object, Long>();
        try {
            String endTime = formatter.format(LocalDateTime.now());
            
            ServiceLog.info("5.1、获取设备抓拍量，参数：" + "deviceIdList = " + deviceIdList 
                + ", beginTime = " + beginTime + ", endTime = " + endTime);
            deviceCountMap = queryStatisticsByDeviceId(deviceIdList, beginTime, endTime);
            ServiceLog.info("5.2、获取设备抓拍量，结果：" + deviceCountMap);
            
        } catch (SearchEngineException e) {
            ServiceLog.error("获取设备抓拍量异常！" + e.getLocalizedMessage(), e);
        }
        
        List<Map<String, Object>> returnList = new ArrayList<Map<String, Object>>();
        
        //6、组装结果集
        for(String key : keySet){
            
            Map<String, Object> device = deviceListMap.get(key).get(0);
            
            String status = deviceStatusMap.getOrDefault(key, "正常");
            
            Long num = deviceCountMap.getOrDefault(key, 0L);
            
            device.put("DEVICE_STATUS", status);
            device.put("DEVICE_CAPTURE_NUM", num);
            
            returnList.add(device);
        }
        
        context.getResponse().putData("DATA", returnList);
        context.getResponse().putData("CODE", 0L);
    }
    
    @BeanService(id = "export", description = "人脸抓拍统计导出")
    public void statisticsExport(RequestContext context) throws Exception {
        
        //excelType：1：按区域统计，2：按设备统计
        String excelType = StringUtil.toString(context.getParameter("EXCCEL_TYPE"));
        String excelData = StringUtil.toString(context.getParameter("EXPORT_DATA"));
        if (StringUtil.isNull(excelData)) {
            context.getResponse().setError("请选择需要导出的数据！");
            return;
        }
        
        if(StringUtil.isEmpty(excelType)) {
            context.getResponse().setError("参数异常！EXCCEL_TYPE不能为空");
            return;
        }
        
        List<Map<String, Object>> excelDataList = JSONArray.fromObject(excelData);
        ServiceLog.info("excelDataList-->" + excelDataList);

        String fileName = null;
        List<ExcelColumn> columns = null;
        if ("1".equals(excelType)) {
            ExcelColumn column1 = new ExcelColumn("ORG_NAME", "区域名称", false);
            ExcelColumn column2 = new ExcelColumn("DEVICE_COUNT", "设备数量", false);
            ExcelColumn column3 = new ExcelColumn("DEVICE_NORMAL_NUM", "正常", false);
            ExcelColumn column4 = new ExcelColumn("DEVICE_UNNORMAL_NUM", "故障", false);
            ExcelColumn column5 = new ExcelColumn("DEVICE_CAPTURE_TOTAL", "抓拍量", false);

            columns = Arrays.asList(column1, column2, column3, column4, column5);
            fileName = "区域人脸抓拍设备统计表";
        } else if ("2".equals(excelType)) {
            columns = new ArrayList<>();
            columns.add(new ExcelColumn("DEVICE_NAME", "设备名称", false));
            columns.add(new ExcelColumn("DEVICE_ID", "设备编号", false));
            columns.add(new ExcelColumn("DEVICE_MANUFACTURER_NAME", "厂家", false));
            columns.add(new ExcelColumn("DEVICE_INSTALL_ADDR", "设备地址", false));
            columns.add(new ExcelColumn("DEVICE_IP_ADDR", "IP地址", false));
            columns.add(new ExcelColumn("DEVICE_STATUS", "状态", false));
            columns.add(new ExcelColumn("DEVICE_CAPTURE_NUM", "抓拍量", false));

            fileName = "人脸抓拍设备统计表";
        } 
        fileName = fileName + "-" + formatter.format(LocalDateTime.now())
            .replaceAll("-", "").replaceAll(":", "").replaceAll(" ", "");
        ServiceLog.info("fileName--->" + fileName);
        
        boolean returnCodeEnum = ExcelUtil.export(fileName, columns, excelDataList, context.getHttpResponse());

        if (!returnCodeEnum) {
            context.getResponse().setError("导出失败！");
        }

        context.getResponse().setMessage("导出成功！");
    }
    
    /**
         * 查询抓排量
     * @param deviceIdList 设备id集合
     * @param beginTime    开始时间
     * @param endTime      结束时间
     * @return PageQueryResult
     * @throws SearchEngineException
     */
    private PageQueryResult searchEsByDeviceId(List<String> deviceIdList, String beginTime,
            String endTime) throws SearchEngineException {
        
        Long sjgsk = Long.valueOf(DateUtil.convertByStyle(beginTime, DateUtil.standard_style,
            DateUtil.yyMMddHHmmss_style, "-1"));
        Long ejgsk = Long.valueOf(DateUtil.convertByStyle(endTime, DateUtil.standard_style,
            DateUtil.yyMMddHHmmss_style, "-1"));
        String[] indices = EsUtil.getIndexNameByTime(Constants.FACE_INDEX + "_", beginTime, endTime);
    
        Query query = new Query(1, 1);
        query.addEqualCriteria("DEVICE_ID", deviceIdList.toArray());
        query.addBetweenCriteria("JGSK", sjgsk, ejgsk);
        query.setSearchType(SearchType.DEFAULT);
        
        return EAP.bigdata.query(indices, Constants.FACE_TABLE, query);
    }
    
    /**
     * 
     * @param deviceIdList
     * @param beginTime
     * @param endTime
     * @return
     * @throws SearchEngineException
     */
    private Map<Object, Long> queryStatisticsByDeviceId(List<String> deviceIdList, String beginTime,
        String endTime) throws SearchEngineException {
    
        Long sjgsk = Long.valueOf(DateUtil.convertByStyle(beginTime, DateUtil.standard_style,
            DateUtil.yyMMddHHmmss_style, "-1"));
        Long ejgsk = Long.valueOf(DateUtil.convertByStyle(endTime, DateUtil.standard_style,
            DateUtil.yyMMddHHmmss_style, "-1"));
        String[] indices = EsUtil.getIndexNameByTime(Constants.FACE_INDEX + "_", beginTime, endTime);
    
        Query query = new Query(1, 1);
        query.addEqualCriteria("DEVICE_ID", deviceIdList.toArray());
        query.addBetweenCriteria("JGSK", sjgsk, ejgsk);
        query.setAggregation("DEVICE_ID");
        query.setSearchType(SearchType.DEFAULT);
        
        return EAP.bigdata.queryStatistics(indices, query, Constants.FACE_TABLE);
    }   
}
