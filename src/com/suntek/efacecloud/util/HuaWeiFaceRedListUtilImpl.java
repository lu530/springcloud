package com.suntek.efacecloud.util;

import com.alibaba.fastjson.JSONObject;
import com.suntek.eap.EAP;
import com.suntek.eap.common.CommandContext;
import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.eaplet.registry.Registry;
import com.suntek.sp.common.common.BaseCommandEnum;

import java.util.ArrayList;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 华为红名单操作
 */
public class HuaWeiFaceRedListUtilImpl extends FaceRedListUtil {

    private final int BATCH_IMPORT_NUM = 10;

    @Override
    public void addOrEdit(RequestContext context) throws Exception {
        Map<String, Object> params = context.getParameters();
        String infoId = StringUtil.toString(params.get("INFO_ID"));
        if (!StringUtil.isEmpty(infoId)) {
            this.deletePerson(context);
        } else {
            params.put("INFO_ID", EAP.keyTool.getIDGenerator());
        }
        this.insertPerson(context);
    }

    /**
     * 新增红名单人
     *
     * @param context
     */
    public void insertPerson(RequestContext context) throws Exception {
        Map<String, Object> param = context.getParameters();
        this.addPerson(context, param);
    }

    // 添加布控人员
    private Map<String, Object> addPerson(RequestContext context, Map<String, Object> param)
            throws Exception {

        ServiceLog.info("开始添加静态库人员");
        long startTime = System.currentTimeMillis();
        param.put("PERSON_ID", param.get("INFO_ID"));
        param.put("DB_ID", Constants.STATIC_LIB_ID_RED_LIST);
        param.put("PIC_MD5", FileMd5Util.getUrlMD5String(StringUtil.toString(param.get("PIC"))));
        String pic = StringUtil.toString(param.get("PIC"));

        param.put("PIC", pic);

        // 判断是否需要审核
        // judgeIsNeedApprove(param);

        CommandContext ctx = new CommandContext(context.getHttpRequest());

        ctx.setBody(param);
        ctx.setOrgCode(context.getUser().getDepartment().getCivilCode());
        ctx.setUserCode(context.getUserCode());
        Registry.getInstance().selectCommands("hw" + BaseCommandEnum.staticLibFaceAdd.getUri()).exec(ctx);

        long code = ctx.getResponse().getCode();
        String message = ctx.getResponse().getMessage();
        context.getResponse().putData("CODE", code);
        context.getResponse().putData("MESSAGE", message);

        if (0L == code) {
            this.addExtraInfo(context, param);
            this.insertRedPerson(param);
            ServiceLog.info("添加静态库人员完成 耗时" + (System.currentTimeMillis() - startTime) + "ms");
            return ctx.getResponse().getBody();
        } else {
            ServiceLog.error("添加静态库人员失败" + ctx.getResponse().getMessage());
            throw new Exception("添加静态库人员失败" + ctx.getResponse().getMessage());
        }
    }

    /**
     * 增加额外的信息
     */
    private void addExtraInfo(RequestContext context, Map<String, Object> param) {
        param.put("PIC_QUALITY", null);
        param.put("CREATOR", context.getUser().getCode());
        param.put("CREATE_TIME", DateUtil.dateToString(new Date()));
        param.put("RLTZ", null);
    }

    /**
     * 删除红名单中的人
     *
     * @param context
     * @throws Exception
     */
    public void deletePerson(RequestContext context) throws Exception {
        CommandContext ctx = new CommandContext(context.getHttpRequest());
        Map<String, Object> params = context.getParameters();
        context.getParameters().put("ALGO_TYPE", ModuleUtil.getAlgoTypeStr());
        String infoId = StringUtil.toString(params.get("INFO_ID"));
        params.put("PERSON_ID", infoId);
        params.put("DB_ID", Constants.STATIC_LIB_ID_RED_LIST);
        ctx.setBody(context.getParameters());
        ctx.setOrgCode(context.getUser().getDepartment().getCivilCode());
        ctx.setUserCode(context.getUserCode());
        Registry.getInstance().selectCommands("hw" + BaseCommandEnum.staticLibFaceDel.getUri()).exec(ctx);
        context.getResponse().putData("CODE", ctx.getResponse().getCode());
        context.getResponse().putData("MESSAGE", ctx.getResponse().getMessage());
        long code = ctx.getResponse().getCode();
        if (0L == code) {
            this.deleteRedPerson(infoId);
        } else {
            ServiceLog.error("删除静态人员失败" + ctx.getResponse().getMessage());
            context.getResponse().putData("CODE", Constants.RETURN_CODE_ERROR);
            context.getResponse().putData("MESSAGE", "从静态小库注销人脸失败！");
        }
    }

    /**
     * 把红名单的人员批量添加到数据库
     *
     * @param list
     */
    private void batchInsertRedList(RequestContext context, List<Map<String, Object>> list) {
        list.forEach(row -> {
            try {
                row.put("INFO_ID", row.get("PERSON_ID"));
                this.addExtraInfo(context, row);
                this.insertRedPerson(row);
            } catch (Exception e) {
                ServiceLog.error("红名单批量添加到数据库失败", e);
            }
        });
    }

    @Override
    public int importRedList(RequestContext context, List<Map<String, Object>> successList, List<String> failList, Map<String, String> importErrorMsgCache) throws Exception {
        successList.forEach(row -> row.put("PERSON_ID", EAP.keyTool.getIDGenerator()));
        List<Map<String, Object>> subList = new ArrayList<>(BATCH_IMPORT_NUM);
        for (int i = 0; i < successList.size(); i++) {
            subList.add(successList.get(i));
            if (1 != 0 && i % BATCH_IMPORT_NUM == 0) {
                this.realImportRedList(context, subList, failList);
            }
        }
        this.realImportRedList(context, subList, failList);
        return successList.size();
    }

    private void realImportRedList(RequestContext context, List<Map<String, Object>> subList, List<String> failList) {
        Map<String, Object> tempMap = new LinkedHashMap<>();
        CommandContext commandContext = new CommandContext(context.getHttpRequest());
        tempMap.put("PERSON_LIST", subList);
        tempMap.put("DB_ID", Constants.STATIC_LIB_ID_RED_LIST);
        ServiceLog.debug("此次批量导入数据 ： " + JSONObject.toJSONString(tempMap));
        Registry registry = Registry.getInstance();
        commandContext.setBody(tempMap);
        commandContext.setOrgCode(StringUtil.toString(tempMap.get("ORG_CODE")));
        commandContext.setUserCode(StringUtil.toString(tempMap.get("USER_CODE")));
        registry.selectCommands("hw" + BaseCommandEnum.staticLibFaceBatchAdd.getUri()).exec(commandContext);
        long code = commandContext.getResponse().getCode();
        String message = commandContext.getResponse().getMessage();
        if (0L != code) {
            for (int j = 0; j < BATCH_IMPORT_NUM; j++) {
                failList.add(message);
            }
        } else {
            this.batchInsertRedList(context, subList);
        }
        subList.clear();
    }
}
