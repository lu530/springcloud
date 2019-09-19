package com.suntek.efacecloud.provider;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.alibaba.fastjson.JSONObject;
import com.suntek.eap.EAP;
import com.suntek.eap.common.log.ServiceLog;
import com.suntek.eap.dict.DictType;
import com.suntek.eap.jdbc.PageQueryResult;
import com.suntek.eap.pico.annotation.BeanService;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.pico.annotation.QueryService;
import com.suntek.eap.tag.grid.ExportGridDataProvider;
import com.suntek.eap.util.DateUtil;
import com.suntek.eap.util.SqlUtil;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.efacecloud.model.DeviceEntity;
import com.suntek.efacecloud.util.Constants;
import com.suntek.efacecloud.util.ExcelFileUtil;
import com.suntek.efacecloud.util.FileDowloader;
import com.suntek.efacecloud.util.ModuleUtil;

import net.sf.json.JSONArray;

/**
 * 警情调度查询
 * 
 * @author wangsh
 * @since 3.1.2
 * @version 2018-09-13
 */
@LocalComponent(id = "face/faceScheduling")
public class FaceSchedulingProvider extends ExportGridDataProvider {

    @Override
    protected String buildCountSQL() {
        String sql = "select count(1)" + " from EFACE_POLICE_TASK_DISPATCH a,VPLUS_SURVEILLANCE_ALARM b "
            + "where a.REL_ID = b.ALARM_ID " + this.getOptionalStatement();
        return sql;
    }

    @Override
    protected String buildQuerySQL() {
        String sql = "select a.ID, a.DISPATCH_ID, a.REL_ID, a.TASK_TYPE, a.TASK_ID, a.SENDER, a.ACCEPTER, a.CREATE_TIME, "
                + "a.TASK_STATUS,a.TASK_LEVEL, a.REMARK, "
                + "b.ALARM_TIME, b.ALARM_IMG, b.OBJECT_PICTURE, b.SCORE, b.OBJECT_ID, "
                + "b.DEVICE_ID, b.OBJECT_EXTEND_INFO,b.ALARM_ID,o.PERSON_ID "
                + "from EFACE_POLICE_TASK_DISPATCH a "
                + "left join VPLUS_SURVEILLANCE_ALARM b on a.REL_ID = b.ALARM_ID "
                + "left join VIID_DISPATCHED_OBJECT o on b.OBJECT_ID = o.OBJECT_ID where 1=1"
                + this.getOptionalStatement();
        return sql;
    }

    @SuppressWarnings({"unchecked", "serial"})
    @BeanService(id = "export", description = "导出", since="6.0", type = "remote")
    public void exportData(RequestContext context) throws Exception {
        String excelData = StringUtil.toString(context.getParameter("EXPORT_DATA"));
        List<Map<String, Object>> excelDataList = new ArrayList<>();
        if (!StringUtil.isNull(excelData)) {
            excelDataList = JSONArray.fromObject(excelData);
        }
      
        String[] headers = {"图片", "姓名", "身份证号", "受理人", "下发时间", "任务描述", "状态", "任务类型"};
        String[] dataKey = {"OBJECT_PICTURE", "NAME", "IDENTITY_ID", "ACCEPTER", "CREATE_TIME", "REMARK", "TASK_STATUS"};

        List<Map<String, byte[]>> imgList = new ArrayList<>();

        try {
            for (Map<String, Object> data : excelDataList) {
                byte[] objectPicture = FileDowloader.getImageFromUrl(StringUtil.toString(data.get("OBJECT_PICTURE")));
                imgList.add(new HashMap<String, byte[]>() {
                    {
                        put("OBJECT_PICTURE", objectPicture);
                    }
                });
            }
        } catch (Exception exception) {
            ServiceLog.error("Export异常", exception);
            throw exception;
        }

        boolean returnCodeEnum = ExcelFileUtil.exportExcelFile2Req(
            "导出结果" + com.suntek.eap.util.calendar.DateUtil.formatDate(DateUtil.getDateTime(), "yyyyMMddHHmmss"),
            headers, dataKey, excelDataList, imgList, context);

        if (!returnCodeEnum) {
            context.getResponse().setError("导出失败！");
        }

    }

    @Override
    @QueryService(id = "getData", type = "remote", description = "警情调度查询")
    public PageQueryResult getData(RequestContext context) {
        PageQueryResult data = super.getData(context);
        List<Map<String, Object>> resultSet = data.getResultSet();
        try {
            for (Map<String, Object> result : resultSet) {
                JSONObject objectExtendInfo = JSONObject.parseObject(
                    StringUtil.toString(result.get("OBJECT_EXTEND_INFO")));
                result.put("IDENTITY_ID", objectExtendInfo.getString("IDENTITY_ID"));
                result.put("NAME", objectExtendInfo.getString("NAME"));
                result.put("SEX", objectExtendInfo.getString("SEX"));
                String deviceId = StringUtil.toString(result.get("DEVICE_ID"));
                DeviceEntity device = (DeviceEntity)EAP.metadata.getDictModel(
                    DictType.D_FACE, deviceId, DeviceEntity.class);
                result.put("DEVICE_ADDR", device.getDeviceAddr());
                result.put("ALARM_IMG", ModuleUtil.renderImage(StringUtil.toString(result.get("ALARM_IMG"))));
                result.put("OBJECT_PICTURE", ModuleUtil.renderImage(StringUtil.toString(result.get("OBJECT_PICTURE"))));
            }
        } catch (Exception e) {
            ServiceLog.error(e);
        }
        return data;
    }

    @Override
    protected void prepare(RequestContext context) {

        Map<String, Object> params = context.getParameters();

        String type = StringUtil.toString(params.get("TYPE"));// 列表类型1:下发 2：签收
        this.addOptionalStatement(" and b.TASK_TYPE = ?");
        this.addParameter(Constants.DISPATCHED_TASK_TYPE_FACE);
        if ("1".equals(type)) {
            this.addOptionalStatement(" and a.SENDER = ?");
        } else {
            this.addOptionalStatement(" and a.ACCEPTER = ?");
        }
        this.addParameter(context.getUserCode());

        // 排序
        String sort = (String)context.getParameter("SORT");
        if (!StringUtil.isEmpty(sort)) {
            context.putParameter("sort", sort);
        } else {
            context.putParameter("sort", " CREATE_TIME desc");
        }

        String keywords = StringUtil.toString(context.getParameter("KEYWORDS"));
        if (!StringUtil.isNull(keywords)) {
            this.addOptionalStatement(" and b.OBJECT_EXTEND_INFO like ? ");
            this.addParameter("%" + keywords + "%");
        }

        String taskStatus = StringUtil.toString(context.getParameter("TASK_STATUS"));
        if (!StringUtil.isNull(taskStatus)) {
            this.addOptionalStatement(" and a.TASK_STATUS in " + SqlUtil.getSqlInParams(taskStatus));
            for (int i = 0; i < taskStatus.split(",").length; i++) {
                addParameter(taskStatus.split(",")[i]);
            }
        }

        String beginTime = StringUtil.toString(context.getParameter("BEGIN_TIME"));
        String endTime = StringUtil.toString(context.getParameter("END_TIME"));
        if (!StringUtil.isNull(beginTime) && !StringUtil.isNull(endTime)) {
            this.addOptionalStatement(" and a.CREATE_TIME between ? and ?");
            this.addParameter(beginTime);
            this.addParameter(endTime);
        } else if (!StringUtil.isNull(beginTime)) {
            this.addOptionalStatement(" and a.CREATE_TIME > ?");
            this.addParameter(beginTime);
        } else if (!StringUtil.isNull(endTime)) {
            this.addOptionalStatement(" and a.CREATE_TIME < ?");
            this.addParameter(endTime);
        }

    }

}
