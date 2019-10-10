package com.suntek.efacecloud.service;

import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.pico.annotation.BeanService;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.efacecloud.dao.LostPersonDao;
import com.suntek.efacecloud.log.Log;
import org.apache.commons.lang.StringUtils;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 寻人系统 身份确认
 *
 * @author: LiLing
 * @create: 2019-09-26 11:22:14
 */
@LocalComponent(id = "lostPerson")
public class LostPersonService {

    private SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    private LostPersonDao lostPersonDao = new LostPersonDao();

    @BeanService(id="confirm", description="失踪人口确认身份接口", since="1.0", type= "remote")
    public void confirm(RequestContext context) {
        String pic = StringUtil.toString(context.getParameter("PIC"));
        String identity = StringUtil.toString(context.getParameter("IDENTITY"));
        String name = StringUtil.toString(context.getParameter("NAME"));
        String lastAddr = StringUtil.toString(context.getParameter("LAST_ADDR"));
        String lastTime = StringUtil.toString(context.getParameter("LAST_TIME"));
        String state = StringUtil.toString(context.getParameter("STATE"));  //1-确认身份; 2-成功寻人

        String userCode = context.getUserCode();
        Log.joblog.debug("lost 参数: " + context.getParameters());
        try {
            Map<String,Object> map = new HashMap<>();
            map.put("PIC", pic);
            map.put("IDENTITY", identity);
            map.put("NAME", name);
            map.put("LAST_ADDR", lastAddr);
            map.put("LAST_TIME", lastTime);
            map.put("STATE", state);
            map.put("CONFIRM_TIME", sdf.format(new Date()));
            map.put("CREATOR", userCode);

            lostPersonDao.confirm(map);
            context.getResponse().putData("CODE", 0);
            context.getResponse().putData("MESSAGE", "操作成功");
        }catch (Exception e){
            context.getResponse().putData("CODE", 1);
            context.getResponse().putData("MESSAGE", "操作失败! " + e.getMessage() + e);
        }
    }

    @BeanService(id="count", description="寻人系统成效统计接口", since="1.0", type= "remote")
    public void count(RequestContext context) {
        String dbId = StringUtil.toString(context.getParameter("DB_ID"));
        Map<String, Object> resMap = new HashMap<>();
        try {
            if(StringUtils.isBlank(dbId)){
                context.getResponse().putData("CODE", 1);
                context.getResponse().putData("MESSAGE", "请传入布控库id!");
                return;
            }
            List<Map<String, Object>> confirmPerson = lostPersonDao.getConfirmPerson();
            for (Map<String, Object> map : confirmPerson) {
                if("1".equals(map.get("STATE"))){
                    resMap.put("CONFIRM_COUNT", map.get("COUNT"));
                }else if ("2".equals(map.get("STATE"))){
                    resMap.put("FIND_COUNT", map.get("COUNT"));
                }
            }
            resMap.put("LOST_COUNT", lostPersonDao.getLostPerson(dbId));
            context.getResponse().putData("CODE", 0);
            context.getResponse().putData("MESSAGE", "查询成功");
            context.getResponse().putData("DATA", resMap);
        } catch (Exception e) {
            context.getResponse().putData("CODE", 1);
            context.getResponse().putData("MESSAGE", "查询失败! " + e.getMessage() + e);
        }
    }
}
