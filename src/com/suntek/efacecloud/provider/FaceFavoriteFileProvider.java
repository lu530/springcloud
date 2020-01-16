package com.suntek.efacecloud.provider;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.suntek.eap.EAP;
import com.suntek.eap.dict.DictType;
import com.suntek.eap.jdbc.IFieldRender;
import com.suntek.eap.jdbc.PageQueryResult;
import com.suntek.eap.log.ServiceLog;
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
 * 人脸收藏文件夹文件查询
 * efacecloud/rest/v6/face/favoriteFile
 *
 * @author hzh
 * @version 2017-07-11
 * @Copyright (C)2017 , Suntektech
 * @since 1.0.0
 */
@LocalComponent(id = "face/favoriteFile") public class FaceFavoriteFileProvider extends ExportGridDataProvider {
    private static String FILE_TYPE_CAPTURE = "1"; //路人收藏夹类型
    private static String FILE_TYPE_TACTICS = "7"; //人员技战法收藏夹类型
    private static String FILE_TYPE_MOTOR = "3"; //汽车驾驶人收藏夹类型
    private static String FILE_TYPE_NONMOTOR = "4"; //非汽车驾驶人收藏夹类型

    @Override protected String buildCountSQL() {
        String sql = "select count(1) from EFACE_FAVORITE_FILE where 1=1  " + this.getOptionalStatement();
        return sql;
    }

    @Override protected String buildQuerySQL() {
        String sql =
            "select FILE_ID, DISPATCHED_DB_NAME, DEVICE_ID, DEVICE_NAME, NAME, SEX, IDENTITY_TYPE, IDENTITY_ID, "
                + " PERMANENT_ADDRESS, PRESENT_ADDRESS, PIC, CAPTURE_PIC, CREATE_TIME, CAPTURE_TIME "
                + " from EFACE_FAVORITE_FILE where 1=1 " + this.getOptionalStatement();
        return sql;
    }

    @Override protected void prepare(RequestContext context) {
        context.putParameter("sort", "CREATE_TIME desc");

        String sex = StringUtil.toString(context.getParameter("SEX"));//性别
        String birthday_start = StringUtil.toString(context.getParameter("BEGIN_TIME"));//出生日期起
        String birthday_end = StringUtil.toString(context.getParameter("END_TIME"));//出生日期止
        String FAVORITE_ID = StringUtil.toString(context.getParameter("FAVORITE_ID"));//收藏夹ID
        String PERMANENT_ADDRESS = StringUtil.toString(context.getParameter("PERMANENT_ADDRESS"));//户籍住址
        String PRESENT_ADDRESS = StringUtil.toString(context.getParameter("PRESENT_ADDRESS"));//现住址
        String personTag = StringUtil.toString(context.getParameter("PERSON_TAG"));//人员标签-涉案类型
        String age = StringUtil.toString(context.getParameter("AGE"));//年龄段
        String captureTimeStart = StringUtil.toString(context.getParameter("CAPTURE_TIME_START"));//抓拍时间起
        String captureTimeEnd = StringUtil.toString(context.getParameter("CAPTURE_TIME_END"));//抓拍时间止
        String sortType = StringUtil.toString(context.getParameter("sortType"));

        if (!StringUtil.isNull(sortType)) {
            context.putParameter("sort", sortType);
        }

        if (!StringUtil.isNull(personTag)) {
            addOptionalStatement(
                " and FILE_ID in (SELECT DISTINCT REL_ID FROM EFACE_TAG_REL WHERE TAG_CODE in" + SqlUtil
                    .getSqlInParams(personTag) + ")");
            String[] tags = personTag.split(",");
            for (int i = 0; i < tags.length; i++) {
                addParameter(tags[i]);
            }
        }

        if (!StringUtil.isNull(age)) {
            String[] timeArr = ModuleUtil.getAgeGroupTime(Integer.parseInt(age.trim()));
            addOptionalStatement(" and BIRTHDAY BETWEEN ? AND ?");
            addParameter(timeArr[0]);
            addParameter(timeArr[1]);
        } else if (!StringUtil.isNull(birthday_start) && !StringUtil.isNull(birthday_end)) {
            addOptionalStatement(" and BIRTHDAY BETWEEN ? AND ?");
            addParameter(birthday_start);
            addParameter(birthday_end);
        }

        if (!StringUtil.isNull(captureTimeStart) && !StringUtil.isNull(captureTimeEnd)) {
            addOptionalStatement(" and CAPTURE_TIME BETWEEN ? AND ?");
            addParameter(captureTimeStart);
            addParameter(captureTimeEnd);
        }

        if (!StringUtil.isNull(PERMANENT_ADDRESS)) {
            addOptionalStatement(" and PERMANENT_ADDRESS LIKE ?");
            addParameter(PERMANENT_ADDRESS + "%");
        }

        if (!StringUtil.isNull(PRESENT_ADDRESS)) {
            addOptionalStatement(" and PRESENT_ADDRESS LIKE ?");
            addParameter(PRESENT_ADDRESS + "%");
        }

        if (!StringUtil.isNull(sex)) {
            addOptionalStatement(" and SEX = ?");
            addParameter(sex);
        }

        if (!StringUtil.isNull(FAVORITE_ID)) {
            addOptionalStatement(" and FAVORITE_ID = ?");
            addParameter(FAVORITE_ID);
        }

        String deviceKeywords = StringUtil.toString(context.getParameter("DEVICE_KEYWORDS"));
        if (!StringUtil.isNull(deviceKeywords)) {
            addOptionalStatement(" and DEVICE_NAME like ?");
            addParameter("%" + deviceKeywords + "%");
        }

        String personKeywords = StringUtil.toString(context.getParameter("PERSON_KEYWORDS"));
        if (!StringUtil.isNull(personKeywords)) {
            addOptionalStatement(" and (NAME like ? or IDENTITY_ID like ?)");
            addParameter("%" + personKeywords + "%");
            addParameter("%" + personKeywords + "%");
        }

        this.addFieldRender(new RenderAddress(), "PRESENT_ADDRESS");
    }

    class RenderAddress implements IFieldRender {
        @Override public Object render(String field, ResultSet resultSet) throws SQLException {
            if ("PRESENT_ADDRESS".equals(field)) {
                return ModuleUtil.renderPersonAddress(resultSet.getString(field));
            }

            return "";
        }
    }

    @QueryService(id = "getData", type = "remote") public PageQueryResult query(RequestContext context)
        throws Exception {
        PageQueryResult pgr = getData(context);
        return pgr;
    }

    @SuppressWarnings({"unchecked", "serial"}) @BeanService(id = "exportFaceSearch", description = "我的收藏结果导出")
    public void faceExport(RequestContext context) throws Exception {
        String excelData = StringUtil.toString(context.getParameter("EXPORT_DATA"));
        List<Map<String, Object>> excelDataList = new ArrayList<Map<String, Object>>();
        if (!StringUtil.isNull(excelData)) {
            excelDataList = JSONArray.fromObject(excelData);
        } else {
            context.putParameter("pageNo", "1");
            context.putParameter("pageSize", Constants.EXPORT_MAX_COUNT);
            PageQueryResult result = super.getData(context);
            excelDataList = result.getResultSet();
        }

        String fileType = StringUtil.toString(context.getParameter("FILE_TYPE"));
        List<Map<String, byte[]>> imgList = new ArrayList<>();
        String[] headers = {"图片", "姓名", "性别", "证件号码", "户籍地址", "现住地址"};
        String[] dataKey = {"imageUrl", "NAME", "SEX", "IDENTITY_ID", "PERMANENT_ADDRESS", "PRESENT_ADDRESS"};
        String[] capHeaders = {"原图", "抓拍图", "抓拍时间", "设备名称", "设备地址"};
        String[] capDataKey = {"imageUrl", "capImg", "CAPTURE_TIME", "DEVICE_NAME", "DEVICE_ADDR"};
        String[] tacHeaders = {"抓拍图", "抓拍时间", "设备名称", "设备地址"};
        String[] tacDataKey = {"capImg", "CAPTURE_TIME", "DEVICE_NAME", "DEVICE_ADDR"};
        if (FILE_TYPE_CAPTURE.equals(fileType)) {
            headers = capHeaders;
            dataKey = capDataKey;
            try {
                for (Map<String, Object> person : excelDataList) {
                    byte[] imageUrl = FileDowloader.getImageFromUrl(StringUtil.toString(person.get("PIC")));
                    byte[] capImg = FileDowloader.getImageFromUrl(StringUtil.toString(person.get("CAPTURE_PIC")));
                    imgList.add(new HashMap<String, byte[]>() {{
                        put("imageUrl", imageUrl);
                        put("capImg", capImg);
                    }});
                    DeviceEntity faceDevice = (DeviceEntity)EAP.metadata
                        .getDictModel(DictType.D_FACE, StringUtil.toString(person.get("DEVICE_ID")),
                            DeviceEntity.class);
                    person.put("DEVICE_ADDR", faceDevice.getDeviceAddr());
                }
            } catch (Exception e) {
                ServiceLog.error("personExport异常" + e.getMessage(), e);
                throw e;
            }
        } else if (FILE_TYPE_TACTICS.equals(fileType)) {
            headers = tacHeaders;
            dataKey = tacDataKey;
            try {
                for (Map<String, Object> person : excelDataList) {
                    byte[] capImg = FileDowloader.getImageFromUrl(StringUtil.toString(person.get("CAPTURE_PIC")));
                    imgList.add(new HashMap<String, byte[]>() {{
                        put("capImg", capImg);
                    }});
                    DeviceEntity faceDevice = (DeviceEntity)EAP.metadata
                        .getDictModel(DictType.D_FACE, StringUtil.toString(person.get("DEVICE_ID")),
                            DeviceEntity.class);
                    person.put("DEVICE_ADDR", faceDevice.getDeviceAddr());
                }
            } catch (Exception e) {
                ServiceLog.error("tacticsExport异常" + e.getMessage(), e);
                throw e;
            }
        } else {
            try {
                for (Map<String, Object> person : excelDataList) {
                    byte[] imageUrl = FileDowloader.getImageFromUrl(StringUtil.toString(person.get("PIC")));
                    imgList.add(new HashMap<String, byte[]>() {{
                        put("imageUrl", imageUrl);
                    }});
                    person.put("PERMANENT_ADDRESS",
                        ModuleUtil.renderPersonAddress(StringUtil.toString(person.get("PERMANENT_ADDRESS"))));
                    person.put("PRESENT_ADDRESS",
                        ModuleUtil.renderPersonAddress(StringUtil.toString(person.get("PRESENT_ADDRESS"))));
                    person.put("SEX",
                        EAP.metadata.getDictValue(DictType.P_RECOGNIZE_SEX, StringUtil.toString(person.get("SEX"))));
                }
            } catch (Exception e) {
                ServiceLog.error("personExport异常" + e.getMessage(), e);
                throw e;
            }
        }

        boolean returnCodeEnum = ExcelFileUtil.exportExcelFile2Req(
            "导出结果" + com.suntek.eap.util.calendar.DateUtil.formatDate(DateUtil.getDateTime(), "yyyyMMddHHmmss"),
            headers, dataKey, excelDataList, imgList, context);

        if (!returnCodeEnum) {
            context.getResponse().setError("导出失败！");
        }
    }
}
