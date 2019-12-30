package com.suntek.efacecloud.provider;

import com.suntek.eap.common.util.StringUtil;
import com.suntek.eap.jdbc.PageQueryResult;
import com.suntek.eap.pico.annotation.BeanService;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.tag.grid.ExportGridDataProvider;
import com.suntek.eap.web.RequestContext;
import com.suntek.efacecloud.util.ModuleUtil;

import java.util.List;
import java.util.Map;

/**
 * @author: LiLing
 * @create: 2019-11-04 14:21:19
 */
@LocalComponent(id = "technicalTactics/task")
public class SpecialPersonTaskProvider extends ExportGridDataProvider {
    @Override
    protected String buildCountSQL() {
        String sql = "SELECT count(1) FROM SPECIAL_PERSON_TRACK_TASK t where 1=1 " + this.getOptionalStatement();
        return sql;
    }

    @Override
    protected String buildQuerySQL() {
        String sql = "SELECT t.TASK_ID, t.TASK_NAME, t.TASK_TYPE, t.CREATOR, t.TASK_STATUS, t.IS_TOP, t.CREATE_TIME "
                + "FROM SPECIAL_PERSON_TRACK_TASK t where 1=1 " + this.getOptionalStatement();
        return sql;
    }

    @Override
    protected void prepare(RequestContext context) {
        String keyword = StringUtil.toString(context.getParameter("KEYWORD"));
        String beginTime = StringUtil.toString(context.getParameter("BEGIN_TIME"));
        String endTime = StringUtil.toString(context.getParameter("END_TIME"));
        String taskStatus = StringUtil.toString(context.getParameter("TASK_STATUS"));
        String taskType = StringUtil.toString(context.getParameter("TASK_TYPE"));
        if (!StringUtil.isNull(keyword)) {
            this.addOptionalStatement(" AND (t.TASK_ID LIKE ? OR t.TASK_NAME LIKE ?) ");
            this.addParameter("%" + keyword + "%");
            this.addParameter("%" + keyword + "%");
        }
        if (!StringUtil.isNull(beginTime)) {
            this.addOptionalStatement(" AND t.CREATE_TIME >= ? ");
            this.addParameter(beginTime);
        }
        if (!StringUtil.isNull(endTime)) {
            this.addOptionalStatement(" AND t.CREATE_TIME <= ? ");
            this.addParameter(endTime);
        }
        if (!StringUtil.isNull(taskStatus)) {
            if ("2".equals(taskStatus)) {
                this.addOptionalStatement(" AND t.TASK_STATUS IN (2,3) ");
            } else {
                int i = Integer.parseInt(taskStatus);
                this.addOptionalStatement(" AND t.TASK_STATUS = ? ");
                this.addParameter(i);
            }
        }
        if (!StringUtil.isNull(taskType)) {
            int i = Integer.parseInt(taskType);
            this.addOptionalStatement(" AND t.TASK_TYPE = ? ");
            this.addParameter(i);
        }
        if (!context.getUser().isAdministrator()) {
            this.addOptionalStatement(" AND t.CREATOR = ? ");
            this.addParameter(context.getUserCode());
        }
        this.addOptionalStatement(" order by t.IS_TOP desc, t.CREATE_TIME desc ");
    }

    @Override
    @BeanService(id = "getData", description = "特定人群轨迹任务列表查询", type = "remote")
    public PageQueryResult getData(RequestContext context) {
        PageQueryResult result = super.getData(context);
        List<Map<String, Object>> list = result.getResultSet();
        for (Map<String, Object> map : list) {
            String taskType = StringUtil.toString(map.get("TASK_TYPE"));
            if ("1".equals(taskType)) {
                map.put("TASK_NAME", "【人脸聚档(人流量估计分析)】" + StringUtil.toString(map.get("TASK_NAME")));
            } else if ("2".equals(taskType)) {
                map.put("TASK_NAME", "【特定人群轨迹分析】" + StringUtil.toString(map.get("TASK_NAME")));
            }
            String pic = StringUtil.toString(map.get("PIC"));
            if (!StringUtil.isEmpty(pic)) {
                map.put("PIC", ModuleUtil.renderPic(ModuleUtil.renderImage(pic)));
            }
        }
        return result;
    }
}
