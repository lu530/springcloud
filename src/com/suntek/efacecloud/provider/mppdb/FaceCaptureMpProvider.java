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
import com.suntek.efacecloud.util.Constants;
import com.suntek.efacecloud.util.ModuleUtil;

import cn.hutool.core.date.DateUtil;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.TransactionStatus;

/**
 *
 * 人脸抓拍列表服务
 */
public class FaceCaptureMpProvider extends ExportGridDataProvider {

	private StringBuffer countOptionStatement = new StringBuffer();
	private FaceDispatchedAlarmDao dao = new FaceDispatchedAlarmDao();

	@Override
	protected String buildCountSQL() {
	    String sql = "select count(1)  from FACE_INFO  where 1=1 " + this.getOptionalStatement();
	    return sql;
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
		//return result.toMap();
	}
	

	@Override
	protected void prepare(RequestContext context) {

		this.setDatasource(Constants.MPPDB_NAME);
		Map<String, Object> body = context.getParameters();
		context.putParameter("sort", " jgsk desc ");

		String beginTime = StringUtil.toString(body.get("BEGIN_TIME"));
		String endTime = StringUtil.toString(body.get("END_TIME"));
		String devides = StringUtil.toString(body.get("DEVICE_IDS"));

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
		ServiceLog.info("prepare end");

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
