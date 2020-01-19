package com.suntek.efacecloud.provider.mppdb;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.suntek.eap.jdbc.TransactionExecutor;
import com.suntek.eap.log.ServiceLog;

import com.alibaba.fastjson.JSONObject;
import com.suntek.eap.EAP;
import com.suntek.eap.common.util.DateUtil;
import com.suntek.eap.jdbc.PageQueryResult;
import com.suntek.eap.metadata.DictType;
import com.suntek.eap.tag.grid.ExportGridDataProvider;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.efacecloud.dao.FaceDispatchedAlarmDao;
import com.suntek.efacecloud.model.DeviceEntity;
import com.suntek.efacecloud.provider.FaceCaptureProvider;
import com.suntek.efacecloud.provider.FaceCaptureProvider.AgeGroup;
import com.suntek.efacecloud.util.Constants;
import com.suntek.efacecloud.util.ModuleUtil;

import org.apache.commons.lang3.math.NumberUtils;
import org.elasticsearch.index.query.BoolQueryBuilder;
import org.elasticsearch.index.query.QueryBuilders;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.TransactionStatus;

/**
 *
 * 人脸抓拍列表服务
 */
public class FaceCaptureMpProvider extends ExportGridDataProvider {

	private StringBuffer countOptionStatement = new StringBuffer();

	@Override
	protected String buildCountSQL() {
	    return null;
	}

	@Override
	protected String buildQuerySQL() {
		String sql = "select * from FACE_INFO where 1=1 "
				+ this.getOptionalStatement();
		return sql;
	}

	/**
	 *
	 * @param context
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> query(RequestContext context) throws Exception {
		PageQueryResult result = this.getData(context);
		long totalCount = getCountFromProcedure();
		return new PageQueryResult(totalCount, render(result.getResultSet())).toMap();
	}
	

	@Override
	protected void prepare(RequestContext context) {
		this.setDatasource(Constants.MPPDB_NAME);
		Map<String, Object> body = context.getParameters();
		context.putParameter("sort", " jgsk desc ");

		String beginTime = StringUtil.toString(body.get("BEGIN_TIME"));
		String endTime = StringUtil.toString(body.get("END_TIME"));
		String devides = StringUtil.toString(body.get("DEVICE_IDS"));
		
		// 性别
        String sex = StringUtil.toString(body.get("SEX"));
        // 年龄段
        String ageGroup = StringUtil.toString(body.get("AGE_GROUP"));
        // 年龄
        String age = StringUtil.toString(body.get("AGE"));
        // 人种
        String race = StringUtil.toString(body.get("RACE"));
        // 是否戴眼镜
        String withGlasses = StringUtil.toString(body.get("WITH_GLASSES"));
        // 是否戴口罩
        String withRespirator = StringUtil.toString(body.get("WITH_RESPIRATOR"));
        // 颜值
        String pretty = StringUtil.toString(body.get("PRETTY"));
        // 表情
        String faceExpression = StringUtil.toString(body.get("FACE_EXPRESSION"));
        // 笑容
        String smile = StringUtil.toString(body.get("SMILE"));
        // 3、代表人脸结构化
        String dataSrc = StringUtil.toString(body.get("DATA_SRC"));

		ServiceLog.info("人脸抓拍 MPPDB 检索， 参数：" + JSONObject.toJSONString(body));

		if (!StringUtil.isEmpty(beginTime) && !StringUtil.isEmpty(endTime)) {
		    this.addOptionalStatement(" and jgsk between ? and ?");
		    String formatBeginTime =DateUtil.convertByStyle(beginTime, DateUtil.standard_style, DateUtil.yyMMddHHmmss_style);
		    String formatEndTime = DateUtil.convertByStyle(endTime, DateUtil.standard_style, DateUtil.yyMMddHHmmss_style);
		    this.addParameter(formatBeginTime);
		    this.addParameter(formatEndTime);
		   
			/*this.addOptionalStatement(
					" and (" + "jgrqsjb between extract (epoch from to_date ('" + beginTime + "','yyyy-mm-dd hh24:mi:ss'))::bigint  "
							+ "and extract (epoch from to_date ('" + endTime + "','yyyy-mm-dd hh24:mi:ss'))::bigint )");*/
			countOptionStatement.append("'").append(beginTime).append("',");
			countOptionStatement.append("'").append(endTime).append("'");
		}

		if (!StringUtil.isEmpty(devides)) {
			this.addOptionalStatement(" and device_id = any " + getDeviceSqlInParams(devides.split(",")));
			countOptionStatement.append(",").append(getCountSqlInParams(devides.split(",")));
		}
		
		if (!StringUtil.isEmpty(sex)) {
		    this.addOptionalStatement(" and gender_code = ? ");
		    this.addParameter(sex);
        }
        if (!StringUtil.isEmpty(ageGroup)) {
            AgeGroup group = AgeGroup.getAgeGroup(ageGroup);
            this.addOptionalStatement(" and age >= ? and age < ? ");
            this.addParameter(group.getAgeLowerLimit());
            this.addParameter(group.getAgeUpperLimit());
        }
        if (NumberUtils.isNumber(age)) {
            this.addOptionalStatement(" and age = ? ");
            this.addParameter(age);
        }
        if (!StringUtil.isEmpty(race)) {
            this.addOptionalStatement(" and race = ? ");
            this.addParameter(race);
        }
        if (!StringUtil.isEmpty(withGlasses)) {
            this.addOptionalStatement(" and with_glasses = ? ");
            this.addParameter(withGlasses);
        }
        if (!StringUtil.isEmpty(withRespirator)) {
            this.addOptionalStatement(" and with_respirator = ? ");
            this.addParameter(withRespirator);
        }
        if (NumberUtils.isNumber(pretty)) {
            this.addOptionalStatement(" and pretty = ? ");
            this.addParameter(pretty);
        }
        if (!StringUtil.isEmpty(faceExpression)) {
            this.addOptionalStatement(" and face_expression = ? ");
            this.addParameter(faceExpression);
        }
        if (!StringUtil.isEmpty(smile)) {
            this.addOptionalStatement(" and smile = ? ");
            this.addParameter(smile);
        }
        if (!StringUtil.isEmpty(dataSrc)) {
            // 目前的设计，DATA_SRC字段有值，就代表是结构化人脸
            this.addOptionalStatement(" and data_src = ? ");
            this.addParameter(dataSrc);
        }

	}

	private List<Map<String, Object>> render(List<Map<String, Object>> resultSet) throws Exception {

		List<Map<String, Object>> tempList = new ArrayList<Map<String, Object>>();

		for (Map<String, Object> map : resultSet) {
			Map<String, Object> tempMap = new HashMap<String, Object>();

			String jgsk = StringUtil.toString(map.get("jgsk"));
			tempMap.put("JGSK", DateUtil.convertByStyle(jgsk, DateUtil.yyMMddHHmmss_style, DateUtil.standard_style));
			
			String deviceId = StringUtil.toString(map.get("device_id"));
			
			DeviceEntity device = (DeviceEntity) EAP.metadata.getDictModel(DictType.D_FACE, deviceId, DeviceEntity.class);
			tempMap.put("DEVICE_ID", deviceId);
			tempMap.put("DEVICE_NAME", StringUtil.toString(device.getDeviceName()));
			tempMap.put("DEVICE_ADDR", StringUtil.toString(device.getDeviceAddr()));
			tempMap.put("ORG_NAME", device.getOrgName());
			tempMap.put("OBJ_PIC", ModuleUtil.renderAlarmImage(StringUtil.toString(map.get("obj_pic"))));
			tempMap.put("PIC", ModuleUtil.renderAlarmImage(StringUtil.toString(map.get("pic"))));
			tempMap.put("INFO_ID", map.get("info_id"));
			tempMap.put("LATITUDE", StringUtil.toString(device.getDeviceY()));
			tempMap.put("LONGITUDE", StringUtil.toString(device.getDeviceX()));
			tempMap.put("AGE", StringUtil.toString(map.get("age")));
			tempMap.put("SEX", StringUtil.toString(map.get("gender_code")));
			tempMap.put("RLTZ", "MPPDB");//华为MPPDB默认提取特征，只有注册库

			String infoId = StringUtil.toString(map.get("info_id"));
			String algoTyoeStr = StringUtil.toString(map.get("algorithm_id"));
			if (!StringUtil.isNull(algoTyoeStr)) {
				tempMap.put("ALGORITHM_NAME", ModuleUtil.getAlgorithmById(Integer.valueOf(algoTyoeStr)).get("ALGORITHM_NAME"));
			}
			
			tempMap.put("SEX", StringUtil.toString(FaceCaptureProvider.GENDER.get(map.get("sex"))));
			tempMap.put("AGE", StringUtil.toString(map.get("age")));
			tempMap.put("RACE", StringUtil.toString(FaceCaptureProvider.RACE.get(map.get("race"))));
			tempMap.put("WITH_GLASSES", StringUtil.toString(FaceCaptureProvider.WITH_GLASSES.get(map.get("with_glasses"))));
			tempMap.put("WITH_RESPIRATOR", StringUtil.toString(FaceCaptureProvider.WITH_RESPIRATOR.get(map.get("with_respirator"))));
			tempMap.put("FACE_EXPRESSION", StringUtil.toString(FaceCaptureProvider.FACE_EXPRESSION.get(map.get("face_expression"))));
			tempMap.put("SMILE", StringUtil.toString(FaceCaptureProvider.SMILE.get(map.get("smile"))));
			tempMap.put("PRETTY", StringUtil.toString(map.get("pretty")));
			tempMap.put("AGE_GROUP", AgeGroup.getAgeGroupByAge(Integer.parseInt(StringUtil.toString(map.get("age"), "0"))).getGroupName());
			
			tempList.add(tempMap);
		}
		return tempList;
	}

	/**
	 * 通过存储过程获取抓拍总量
	 * @return
	 * @throws SQLException
	 */
	public long getCountFromProcedure() throws SQLException {

		long beginTime = System.currentTimeMillis();

		String preSql = "set enable_hashjoin = on;";

		String sql = "select proc_face_info_count(" + countOptionStatement.toString() + ")";

		String afterSql = "set enable_hashjoin = off;";

		long total = (long) EAP.jdbc.getTransactionTemplate(Constants.APP_NAME, Constants.MPPDB_NAME).execute(new TransactionExecutor() {

			@Override
			public Object transaction(TransactionStatus arg0, JdbcTemplate arg1) {
				arg1.execute(preSql);
				long total = arg1.queryForObject(sql, Long.class);
				arg1.execute(afterSql);
				return total;
			}
		});

		long endTime = System.currentTimeMillis();
		ServiceLog.info("procedure count sql:" + sql);
		ServiceLog.info("存储过程count耗时：" + (endTime - beginTime) + "ms");

		return total;
	}

	/**
	 *
	 * @param params
	 * @return
	 */
	public static String getDeviceSqlInParams(Object[] params) {
		StringBuffer strbuf = new StringBuffer();
		strbuf.append("(values");
		for (int i = 0; i < params.length; i++) {
			strbuf.append("('"+params[i]+"'),");
		}
		strbuf.deleteCharAt(strbuf.length()-1);
		strbuf.append(")");
		return strbuf.toString();
	}

	/**
	 * append the count sql's param values
	 * @param params
	 * @return
	 */
	private String getCountSqlInParams(Object[] params) {

		// '(''44010564001320300262''),(''44011250001320500220'')'
		StringBuffer strbuf = new StringBuffer();
		strbuf.append("'");
		for (int i = 0; i < params.length; i++) {
			strbuf.append("(''" + params[i] + "''),");
		}
		strbuf.deleteCharAt(strbuf.length() - 1);
		strbuf.append("'");
		return strbuf.toString();
	}
}
