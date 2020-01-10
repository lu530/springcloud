package com.suntek.efacecloud.provider.export.excel;

import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.pico.annotation.QueryService;
import com.suntek.eap.tag.grid.ImageExcelExportProvider;
import com.suntek.eap.web.RequestContext;

import java.util.LinkedHashMap;

@LocalComponent(id = "test/excel")
public class TestExcelExportProvider extends ImageExcelExportProvider {

    @Override
    protected LinkedHashMap<String, String> buildFieldTransferMap() {
        LinkedHashMap<String, String> map = new LinkedHashMap<>();
        map.put("ALARM_IMG", "告警图片");
        map.put("FRAME_IMG", "抓拍图片");

        map.put("ALARM_TIME", "告警时间");
        map.put("score", "分数");
        map.put("DB_NAME", "库名称");
        return map;
    }

    @Override
    protected String[] buildImgFieldNames() {
        String[] array = {"ALARM_IMG", "FRAME_IMG"};
        return array;
    }

    @Override
    protected String buildQuerySQL() {
        return "select ALARM_IMG,FRAME_IMG,ALARM_TIME,score,DB_NAME from VPLUS_SURVEILLANCE_ALARM limit 1200";
    }


    @QueryService(id = "export")
    public void export(RequestContext context) {
        super.doExport(context);
    }

    @Override
    protected void prepare(RequestContext context) {

    }
}
