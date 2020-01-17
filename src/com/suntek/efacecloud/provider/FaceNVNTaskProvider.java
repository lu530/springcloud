package com.suntek.efacecloud.provider;

import com.suntek.eap.jdbc.PageQueryResult;
import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.pico.annotation.BeanService;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.tag.grid.GridDataProvider;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.efacecloud.service.face.FaceNVNTaskDao;
import com.suntek.efacecloud.util.Constants;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * nvn任务调度
 * 
 * @author wjy
 * @version 2019年06月19日
 */
@LocalComponent(id = "face/nvnTask", isLog = "true")
public class FaceNVNTaskProvider extends GridDataProvider{

    public FaceNVNTaskDao dao = new FaceNVNTaskDao();

    @Override
    protected String buildCountSQL() {
        String sql = "select count(*) from EFACE_NVN_TASK_INFO where 1=1 " + this.getOptionalStatement();
        return sql;
    }

    @Override
    protected String buildQuerySQL() {
        String sql = "select * from EFACE_NVN_TASK_INFO where 1=1 " + this.getOptionalStatement();
        return sql;
    }

    @Override
    protected void prepare(RequestContext context) {
        context.putParameter("sort", "UPDATE_TIME desc, CREATE_TIME asc");
        
        String beginTime = StringUtil.toString(context.getParameter("BEGIN_TIME"));
        String endTime = StringUtil.toString(context.getParameter("END_TIME"));
        if (!StringUtil.isNull(beginTime) && !StringUtil.isNull(endTime)) {
            String sql = "and CREATE_TIME between ? and ? ";
            this.addOptionalStatement(sql);
            this.addParameter(beginTime);
            this.addParameter(endTime);
        }
        
        String taskStatus = StringUtil.toString(context.getParameter("TASK_STATUS"), "");
        if (!StringUtil.isNull(taskStatus)) {
            String sql = "and TASK_STATUS = ? ";
            this.addOptionalStatement(sql);
            this.addParameter(taskStatus);
        }
        
        String userType = context.getUser().getUserType();
        if (!Constants.ADMIN_USER_TYPE.equals(userType)) {
            String sql = "and CREATOR = ? ";
            this.addOptionalStatement(sql);
            this.addParameter(context.getUserCode());
        }
    }
    
    @Override
    @BeanService(id = "getData", description = "nvn任务查询", type = "remote")
    public PageQueryResult getData(RequestContext context) {
        PageQueryResult result = super.getData(context);
        try {
            List<Map<String, Object>> resultSet = result.getResultSet();
            
            List<String> taskIds = resultSet.stream().map(m -> StringUtil
                .toString(m.get("TASK_ID"))).collect(Collectors.toList());
            
            //获取任务的排队序号
            Map<String, Object> taskOrderNum = new HashMap<>();
            if (taskIds.size() > 0) {
                taskOrderNum = dao.getTaskOrderNum(taskIds).stream()
                    .collect(Collectors.toMap(o -> StringUtil.toString(o.get("TASK_ID")), o -> o.get("RANK_NO")));
            }

            if (resultSet.size() > 0) {
                //获取当前时间,将此时间设置为第一个预计处理时间,后面将数据里的相应时间进行累加获取到对应的预计处理时间
//                Map<String, Object> lastMap = resultSet.get(resultSet.size() - 1);
//                String createTimeStr = StringUtil.toString(lastMap.get("CREATE_TIME"));
//                LocalDateTime createTime = LocalDateTime.parse(createTimeStr);
                LocalDateTime createTime = LocalDateTime.now();
                for (Map<String, Object> map : resultSet) {
                    String taskId = StringUtil.toString(map.get("TASK_ID"));
                    
                    map.put("RANK_NO", StringUtil.toString(taskOrderNum.get(taskId), ""));
                    
                    String taskType = StringUtil.toString(map.get("TASK_TYPE"));
                    switch (taskType) {
                        case Constants.FREQUENT_ACCESS:
                            map.put("TASK_TYPE", "频繁出现");
                            break;
                        case Constants.REGION_COLLISION:
                            map.put("TASK_TYPE", "人脸区域碰撞");
                            break;
                        case Constants.FOLLOW_PERSON:
                            map.put("TASK_TYPE", "同伙分析");
                            break;
                        case Constants.DAY_HIDE_NIGHT_ACTIVE:
                            map.put("TASK_TYPE", "昼伏夜出");
                            break;
                        case Constants.FACE_CAPTURE_FREQ_ANALYSIS:
                            map.put("TASK_TYPE", "路人检索频次分析");
                            break;
                        case Constants.NIGHT_ACTIVE:
                            map.put("TASK_TYPE", "深夜出入");
                            break;
                        case Constants.SPECIAL_PERSON:
                            map.put("TASK_TYPE", "特殊人群轨迹分析");
                            break;
                        case Constants.PERSON_FLOW_ANALYSIS:
                            map.put("TASK_TYPE", "人流量分析");
                            break;
                        default:
                            break;
                    }
                    if ("0".equals(StringUtil.toString(map.get("TASK_STATUS")))
                        || "1".equals(StringUtil.toString(map.get("TASK_STATUS")))) {
                        String handleTime = StringUtil.toString(map.get("HANDLE_TIME"));
                        createTime = createTime.plusMinutes(Long.parseLong(handleTime));
                        map.put("PROCESS_TIME", DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss").format(createTime));
                    }
                }
            }

        } catch (Exception e) {
            ServiceLog.error("nvn任务查询异常" + e.getMessage(), e);
        }

        return result;
    }
}
