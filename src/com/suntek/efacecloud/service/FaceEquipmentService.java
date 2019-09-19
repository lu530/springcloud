package com.suntek.efacecloud.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.elasticsearch.search.sort.SortOrder;

import com.suntek.eap.EAP;
import com.suntek.eap.common.util.StringUtil;
import com.suntek.eap.dict.DictType;
import com.suntek.eap.index.Query;
import com.suntek.eap.pico.annotation.BeanService;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.pico.annotation.QueryService;
import com.suntek.eap.util.DateUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.efacecloud.dao.FaceEquipmentDao;
import com.suntek.efacecloud.model.DeviceEntity;
import com.suntek.efacecloud.util.ExcelFileUtil;

/**
 * 查看设备今天采集数据
 * 
 * @author liuwb
 * @since 
 * @version 2019年1月23日
 */
@LocalComponent(id = "face/equipment")
public class FaceEquipmentService {

    private FaceEquipmentDao dao = new FaceEquipmentDao();

    @QueryService(id = "query", description = "人脸抓拍设备数据查询", since = "2.0", type = "remote", paasService = "true")
    public Map<String, Object> query(RequestContext context) throws Exception {
        
        String date = DateUtil.getDate().replaceAll("-", "");
        String yearMonth = date.substring(2, 6);
        String dateSub = date.substring(2);
        long beginTime = Long.parseLong(dateSub + "000000");
        long endTime = Long.parseLong(dateSub + "235959");
        
        List<Map<String, Object>> devicelist = dao.queryVideo();
        List<Map<String, Object>> existencemap = new ArrayList<>();
        List<Map<String, Object>> notData = new ArrayList<>();

        Query query = new Query(1, devicelist.size());
        query.addRangeCriteria("JGSK", beginTime, endTime);
        query.setAggregation("DEVICE_ID");
        query.setAggregationSort(SortOrder.ASC);
        
        Map<Object, Long> result = EAP.bigdata.queryStatistics("face_indice_" + yearMonth, query, "FACE_INFO");
        for (Map<String, Object> deviceMap : devicelist) {
            Long num = result.get(deviceMap.get("DEVICE_ID"));
            DeviceEntity de = (DeviceEntity) EAP.metadata.getDictModel(DictType.D_FACE, deviceMap.get("DEVICE_ID"), DeviceEntity.class);
            if (num == null) {
                num = 0L;
                deviceMap.put("ORG_NAME", StringUtil.toString(de.getOrgName()));
                deviceMap.put("NUMBER", num);
                notData.add(deviceMap);
            } else {
                deviceMap.put("ORG_NAME", StringUtil.toString(de.getOrgName()));
                deviceMap.put("NUMBER", num);
                existencemap.add(deviceMap);
            }
        }
        
        Map<String, Object> map = new HashMap<>();
        map.put("notData", notData);
        map.put("existencemap", existencemap);
        
        return map;
    }
    
    @BeanService(id = "exportFace", description = "设备数据信息导出到Excel")
	public void equipmentExport(RequestContext context) throws Exception {
        
        Map<String, Object> map = this.query(context);
        List<Map<String, Object>> existenceList = (List<Map<String, Object>>)map.get("existencemap");
        List<Map<String, Object>> notDataList = (List<Map<String, Object>>)map.get("notData");
        existenceList.addAll(notDataList);
        
        String[] headers = {"设备名称", "设备IP", "设备编号", "采集量", "行政区域"};
        String[] dataKey = {"NAME", "IP_ADDR", "DEVICE_ID", "NUMBER", "ORG_NAME"};
        boolean returnCodeEnum =
            ExcelFileUtil.exportExcelFile2Req(
                "导出结果" + com.suntek.eap.util.calendar.DateUtil.formatDate(DateUtil.getDateTime(), "yyyyMMddHHmmss"),
                headers, dataKey, existenceList, null, context);
        if (!returnCodeEnum) {
            context.getResponse().setError("导出失败！");
        }
    }
}
