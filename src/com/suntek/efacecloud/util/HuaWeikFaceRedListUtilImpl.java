package com.suntek.efacecloud.util;

import com.suntek.eap.common.CommandContext;
import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.eaplet.registry.Registry;
import com.suntek.sp.common.common.BaseCommandEnum;

import java.util.List;
import java.util.Map;

/**
 * 华为红名单操作
 */
public class HuaWeikFaceRedListUtilImpl extends FaceRedListUtil {

    @Override
    public void addOrEdit(RequestContext context) throws Exception {
        Map<String, Object> params = context.getParameters();
        String infoId = StringUtil.toString(params.get("INFO_ID"));
        if (!StringUtil.isEmpty(infoId)) {
            this.deletePerson(context);
        }

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
            String personId = StringUtil.toString(param.get("PERSON_ID"));
            param.put("PERSON_ID", personId);
            param.put("FILING_UNIT_NAME", StringUtil.toString(param.get("FILING_UNIT_NAME")));
            this.insertPerson(context);
            // if (result) {
            // sendDispatchedNoticeMsg(context);
            // }
            ServiceLog.info("添加静态库人员完成 耗时" + (System.currentTimeMillis() - startTime) + "ms");
            return ctx.getResponse().getBody();
        } else {
            ServiceLog.error("添加静态库人员失败" + ctx.getResponse().getMessage());
            throw new Exception("添加静态库人员失败" + ctx.getResponse().getMessage());
        }
    }

    /**
     * 删除红名单中的人
     * @param context
     * @throws Exception
     */
    public void deletePerson(RequestContext context) throws Exception {
        CommandContext ctx = new CommandContext(context.getHttpRequest());
        Map<String, Object> params = context.getParameters();
        context.getParameters().put("ALGO_TYPE", ModuleUtil.getAlgoTypeStr());
        String infoId = StringUtil.toString(params.get("INFO_ID"));
        params.put("DELETE_THIRD_PERSON_ID", infoId);
        params.put("THIRD_DB_ID", Constants.STATIC_LIB_ID_RED_LIST);
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

    @Override
    public int importRedList(RequestContext context, List<Map<String, Object>> successList, List<String> failList, Map<String, String> importErrorMsgCache) throws Exception {
        return 0;
    }
}
