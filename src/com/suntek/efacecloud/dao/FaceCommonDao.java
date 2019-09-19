package com.suntek.efacecloud.dao;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;

import com.suntek.eap.EAP;
import com.suntek.eap.jdbc.dialect.Dialect;
import com.suntek.eap.jdbc.dialect.DialectFactory;
import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.org.UserModel;
import com.suntek.eap.util.SqlUtil;
import com.suntek.eap.util.StringUtil;
import com.suntek.efacecloud.util.Constants;

/**
 * 人脸公共管理Dao
 * 
 * @author lx
 * @since 1.0.0
 * @version 2017-06-29
 *  (C)2017 , Suntektech
 */
public class FaceCommonDao {
	private JdbcTemplate jdbc = EAP.jdbc.getTemplate(Constants.APP_NAME);

	private Dialect dialect = DialectFactory.getDialect(Constants.APP_NAME, "");

	public List<Map<String, Object>> getAddressInfo() {
		String sql = "select CODE, NAME from EFACE_PERSON_ADDRESS";
		return jdbc.queryForList(sql);
	}

	public List<Map<String, Object>> getPersonTagInfo() {
		String sql = "select TAG_CODE CODE, TAG_NAME NAME from EFACE_PERSON_TAG";
		return jdbc.queryForList(sql);
	}

	public List<Map<String, Object>> getArchiveIdByPersonId(String personId) {
		String sql = "select ARCHIVE_ID from ARCHIVE_ID_PERSON_ID_REL where PERSON_ID = ?";
		return jdbc.queryForList(sql, personId);
	}

	public List<Map<String, Object>> getPersonTagRelInfo(Object[] relIds) {
		String sql = "select t.TAG_NAME, r.REL_ID from EFACE_PERSON_TAG t left join"
				+ " EFACE_TAG_REL r on t.TAG_CODE = r.TAG_CODE where REL_ID in" + SqlUtil.getSqlInParams(relIds)
				+ " and REL_TYPE = 1";
		return jdbc.queryForList(sql, relIds);
	}

	public List<Map<String, Object>> getDetectTree(boolean isShowChild, String userCode, UserModel user, int... types) {
		List<Map<String, Object>> result = new ArrayList<Map<String, Object>>();

		String sql = "select t.ORG_CODE DWBH, t.NAME DWMC, t.ID, t.TYPE from ("
				+ "select ORG_CODE, NAME, ID, 'STRUCTURE' TYPE " + "from SYS_STRUCTURE_INFO " + "union all " + "select "
				+ dialect.concat("ORG_CODE", "NODE_FLAG") + " ORG_CODE, NAME, SCENE_ID ID, 'COMMUNITY' TYPE "
				+ "from VPLUS_SCENE_INFO where STATUS<>9) t ";

		if (!user.isAdministrator()) {
			sql += " left join SYS_USERRESOURCE rs on rs.ORG_CODE = t.ORG_CODE " + " where rs.USER_CODE = '" + userCode
					+ "' ";
		}

		sql += " order by t.ORG_CODE ";

		result = jdbc.queryForList(sql);

		return buildDetectTreeNodeData(result, true, isShowChild, types);
	}

	@SuppressWarnings("unchecked")
	private List<Map<String, Object>> buildDetectTreeNodeData(List<Map<String, Object>> result, boolean showCheck,
			boolean isShowChild, int... types) {
		String ROOT_ID = "0";

		String nodeId;

		Map<String, Object> node;
		Map<String, Map<String, Object>> nodeMap = new HashMap<String, Map<String, Object>>();
		List<Map<String, Object>> root = new ArrayList<Map<String, Object>>();
		for (int i = 0; i < result.size(); i++) {
			node = toNodeMap(result.get(i), "DWBH", "DWMC");

			nodeId = (String) node.get("id");

			node.put("showtitles", true);
			if (showCheck) {
				node.put("showcheck", true);
				node.put("checkstate", 0);
			}

			node.put("isParent", true);
			node.put("hasChildren", true);
			node.put("ChildNodes", new ArrayList<Object>());

			nodeMap.put(nodeId, node);

			String parentId = nodeId.length() <= 2 ? "0" : nodeId.substring(0, nodeId.length() - 2);

			if (nodeId.equals(ROOT_ID) || parentId.equals(ROOT_ID)) {
				root.add(node);
				continue;
			}

			ServiceLog.debug(">>>>>>>parentId:" + parentId);

			while (!nodeMap.containsKey(parentId)) { // 找不到父节点时，目录挂在上一级节点
				parentId = parentId.substring(0, parentId.length() - 2);
			}

			((List<Map<String, Object>>) nodeMap.get(parentId).get("ChildNodes")).add(node);

			if (isShowChild) {
				String nodeType = (String) result.get(i).get("TYPE");
				if (nodeType.equals("COMMUNITY")) {
					String communityId = StringUtil.toString(result.get(i).get("ID"));
					buildTreeDetectData(((List<Map<String, Object>>) node.get("ChildNodes")), communityId, types);
				}
			}
		}

		return root;
	}

	private Map<String, Object> toNodeMap(Map<String, Object> row, String id, String text) {
		Map<String, Object> map = new HashMap<String, Object>();
		Map<String, Object> nodeValue = new HashMap<String, Object>();

		Iterator<String> iter = row.keySet().iterator();
		String key;

		while (iter.hasNext()) {
			key = iter.next();

			if (key.equals(id)) {
				map.put("id", row.get(key));
			} else if (key.equals(text)) {
				map.put("text", row.get(key));
			} else {
				nodeValue.put(key, row.get(key));
			}
		}

		map.put("value", nodeValue);

		return map;
	}

	private void buildTreeDetectData(List<Map<String, Object>> list, String nodeId, int... types) {
		List<Map<String, Object>> gate = getDetectTreeById(nodeId, types);

		Map<String, Object> node;
		Map<String, Map<String, Object>> nodeMap = new HashMap<String, Map<String, Object>>();

		for (int i = 0; i < gate.size(); i++) {
			node = toNodeMap(gate.get(i), "ID", "NAME");
			nodeId = (String) node.get("id");

			node.put("showtitles", true);
			node.put("showcheck", true);
			node.put("checkstate", 0);

			if (nodeId.length() == 32) {
				node.put("showvirtual", true);
			} else {
				node.put("showpassport", true);
			}

			node.put("isParent", true);
			node.put("hasChildren", false);
			nodeMap.put(nodeId, node);
			list.add(node);
		}
	}

	public List<Map<String, Object>> getDetectTreeById(String id, int... types) {
		List<Object> list = new ArrayList<Object>();

		String sql = "select a.DEVICE_ID ID, a.DEVICE_NAME NAME, a.LONGITUDE X, a.LATITUDE Y "
				+ " from V_VPLUS_DEVICE_INFO a left join VPLUS_SCENE_DEVICE b on a.DEVICE_ID = b.DEVICE_ID"
				+ " where b.SCENE_ID = ? and a.DEVICE_TYPE in ( ";

		list.add(id);

		for (int i = 0; i < types.length; i++) {
			if (i == types.length - 1) {
				sql += "?)";
			} else {
				sql += "?,";
			}
			list.add(types[i]);
		}

		return jdbc.queryForList(sql, list.toArray(new Object[] {}));
	}

	public List<Map<String, Object>> getAlgorithmByRace(String race) {// 通过人脸种族获取算法值列表
		String sql = "select DISTINCT h.ALGORITHM_ID " + 
				" from VPLUS_VIDEO_CAMERA a  " + 
				" inner join VPLUS_FACE_CAMERA_ROTER b on a.DEVICE_ID = b.DEVICE_ID " + 
				" inner join VPLUS_FACE_ROTER c on c.ROTER_ID = b.ROTER_ID and c.ROTER_STATUS = 1 " + 
				" inner join VPLUS_FACE_ROTER_OPTIONS d on d.ROTER_ID = c.ROTER_ID " + 
				" inner join VPLUS_FACE_TYPE_STANDARD g on g.STANDARD_TYPE_ID = d.STANDARD_TYPE_ID and g.TYPE_STATUS = 1 " + 
				" inner join VPLUS_FACE_ALGORITHM_TYPE h on h.ALGORITHM_ID = d.EXTRACT_ALGORITHM_ID and h.ENABLED = 1 and h.ALGORITHM_TYPE = '0'" + 
				" and g.TYPE_VALUE = ?";
 
		return jdbc.queryForList(sql, race);
	}
	
	public List<Map<String, Object>> getDeviceRace(String deviceIds, String race) {// 通过摄像机获取摄像机路由绑定算法
	    List<String> list = new ArrayList<>();
	    String sql = "select a.DEVICE_ID, h.ALGORITHM_ID , g.TYPE_VALUE , g.TYPE_NAME" + 
                " from VPLUS_VIDEO_CAMERA a  " + 
                " inner join VPLUS_FACE_CAMERA_ROTER b on a.DEVICE_ID = b.DEVICE_ID " + 
                " inner join VPLUS_FACE_ROTER c on c.ROTER_ID = b.ROTER_ID and c.ROTER_STATUS = 1 " + 
                " inner join VPLUS_FACE_ROTER_OPTIONS d on d.ROTER_ID = c.ROTER_ID " + 
                " inner join VPLUS_FACE_TYPE_STANDARD g on g.STANDARD_TYPE_ID = d.STANDARD_TYPE_ID and g.TYPE_STATUS = 1 " + 
                " inner join VPLUS_FACE_ALGORITHM_TYPE h on h.ALGORITHM_ID = d.EXTRACT_ALGORITHM_ID and h.ENABLED = 1 and h.ALGORITHM_TYPE = '0'" + 
                " and a.DEVICE_ID in " + SqlUtil.getSqlInParams(deviceIds);
	    list.addAll(Arrays.asList( deviceIds.split(",")));
	    if(!StringUtil.isNull(race)) {
	        sql+= " and g.TYPE_VALUE = ?";
	        list.add(race);
	    }
        return jdbc.queryForList(sql, list.toArray());
    }
	
}
