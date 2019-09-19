package com.suntek.efacecloud.dao;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;

import com.suntek.eap.EAP;
import com.suntek.efacecloud.util.Constants;

public class ForeignerCertificateSearchDao {
	private final JdbcTemplate jdbc = EAP.jdbc.getTemplate(Constants.APP_NAME);
	
	/** 根据外籍人证件号码检索本地数据 */
	public List<Map<String, Object>> foreignerCertificateSearch(String zjhm) {
		List<Map<String, Object>> resList = new ArrayList<>();
		
			String sql = "select FZRQ AS fzrq,CSRQ AS csrq, XMHYPY AS xmhypy, XXRSKSJ AS xxrsksj, Y_CYZJDM_DMBCMS as t_cyzjdm_dmbcms,"
					+ "Y_FZJG_SPQFJG_GAJGJGDM_DMBCMS AS y_fzjg_spqfjg_gajgjgdm_dmbcms, Y_GJHDQDM_DMBCMS AS y_gjhdqdm_dmbcms,"
					+ "Y_QZJLXKZLDM_DMBCMS AS y_qzjlxkzldm_dmbcms,Y_ZYLBDM_DMBCMS AS y_zylbdm_dmbcms,FZJG_SPQFJG_GAJGJGDM_DMBCMS AS fzjq_spqfjg_gajgjgdm_dmbcms,"
					+ "GJHDQDM AS gjhdqdm,GJHDQDM_DMBCMS AS gjhdqdm_dmbcms, ZYLBDM AS zylbdm, ZYLBDM_DMBCMS AS zylbdm_dmbcms,CYZJDM AS cyzjdm,"
					+ "CYZJDM_DMBCMS AS cyzjdm_dmbcms,FZJG_SPQFJG_GAJGJGDM AS fzjg_spqfjg_gajgjgdm ,QZJLXKZLDM_DMBCMS AS qzjlxkzldm_dmbcms, "
					+ "QZJLXKZLDM AS qzjlxkzldm,ZJHM AS zjhm,XC_ZJHM AS xc_zjhm,XM AS xm from EFACE_FOREIGNER_CRJQZ_INFO where ZJHM=? or XC_ZJHM=? order by XXRSKSJ desc";
			List<Map<String, Object>> list = jdbc.queryForList(sql, zjhm, zjhm);		
			if (list.size() > 0) {
				resList.add(list.get(0));
	            return resList;
	        } else {
	            return Collections.emptyList();
	        }
	}
	
	/** 落地证件检索查询返回数据 */
	public void addForeignerCRJQZInfo(List<Map<String, Object>> list){
		String insertSql
    	= "insert into EFACE_FOREIGNER_CRJQZ_INFO(XMHYPY,XXRKSJ,Y_CRJ_KADM_DMBCMS,BZ_PDBZ_DMBCMS,XXRSKSJ,"
			+"Y_CYZJDM_DMBCMS,Y_FZJG_SPQFJG_GAJGJGDM_DMBCMS,Y_GJHDQDM_DMBCMS,"
			+"Y_JTFSDM_DMBCMS,Y_QZJLXKZLDM_DMBCMS,Y_ZYLBDM_DMBCMS,"
			+"JTFSDM_DMBCMS,JWRYRJSYDM_DMBCMS,SFYHBJL_PDBZ_DMBCMS,"
			+"FZJG_SPQFJG_GAJGJGDM_DMBCMS,GJHDQDM,GJHDQDM_DMBCMS,"
			+"CRJ_KADM_DMBCMS,ZYLBDM,ZYLBDM_DMBCMS,BZ_PDBZ,CRJRYLBDM_DMBCMS,"
			+"CYZJDM,CYZJDM_DMBCMS,FZJG_SPQFJG_GAJGJGDM,Y_JWRYRJSYDM_DMBCMS,"
			+"CRJ_RQSJ,HJK_CRJ_RQSJ,FZRQ,CSRQ,Y_CRJRYLBDM_DMBCMS,HJK_XXRKSJ,"
			+"JTFSDM,BZK_XXGXSJ,CRJRYLBDM,CRJ_KADM,QWD_GJHDQDM,"
			+"QWD_GJHDQDM_DMBCMS,QZJLXKZLDM_DMBCMS,BZK_XXZJBH,BS_PDBZ,GJDX_BH,"
			+"JC_RYBH,JTGJ,JWRYRJSYDM,SFYHBJL_PDBZ,QZJLXKZLDM,ZJHM,SFYHC_PDBZ,"
			+"SFYHC_PDBZ_DMBCMS,TDH_BH,HJK_FZRQ,LYT_BH,HC_RQSJ,HJK_CRJ_RQ,HJK_CRJ_SJ,"
			+"HJK_CSRQ,XC_ZJHM,XM,BZKFQ,BZK_SJYCSM,BZK_XXRKSJ,JLYXX_PDBZ,UPDATE_TIME)"
			+" values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,"
			+ "?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,"
			+ "?,?,?,?,"
			+ "?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
		 List<Object[]> args = new ArrayList<Object[]>();
	        int[] retCode; 
	        for (Map<String, Object> m : list) {
	            args.add(new Object[] {m.get("XMHYPY"),m.get("XXRKSJ"),m.get("Y_CRJ_KADM_DMBCMS"),m.get("BZ_PDBZ_DMBCMS"),
	            		m.get("XXRSKSJ"),m.get("Y_CYZJDM_DMBCMS"),m.get("Y_FZJG_SPQFJG_GAJGJGDM_DMBCMS"),
	            		m.get("Y_GJHDQDM_DMBCMS"),m.get("Y_JTFSDM_DMBCMS"),m.get("Y_QZJLXKZLDM_DMBCMS"),
	            		m.get("Y_ZYLBDM_DMBCMS"),m.get("JTFSDM_DMBCMS"),m.get("JWRYRJSYDM_DMBCMS"),
	            		m.get("SFYHBJL_PDBZ_DMBCMS"),m.get("FZJG_SPQFJG_GAJGJGDM_DMBCMS"),m.get("GJHDQDM"),
	            		m.get("GJHDQDM_DMBCMS"),m.get("CRJ_KADM_DMBCMS"),m.get("ZYLBDM"),m.get("ZYLBDM_DMBCMS"),
	            		m.get("BZ_PDBZ"),m.get("CRJRYLBDM_DMBCMS"),m.get("CYZJDM"),m.get("CYZJDM_DMBCMS"),
	            		m.get("FZJG_SPQFJG_GAJGJGDM"),m.get("Y_JWRYRJSYDM_DMBCMS"),m.get("CRJ_RQSJ"),
	            		m.get("HJK_CRJ_RQSJ"),m.get("FZRQ"),m.get("CSRQ"),m.get("Y_CRJRYLBDM_DMBCMS"),
	            		m.get("HJK_XXRKSJ"),m.get("JTFSDM"),m.get("BZK_XXGXSJ"),m.get("CRJRYLBDM"),
	            		m.get("CRJ_KADM"),m.get("QWD_GJHDQDM"),m.get("QWD_GJHDQDM_DMBCMS"),
	            		m.get("QZJLXKZLDM_DMBCMS"),m.get("BZK_XXZJBH"),m.get("BS_PDBZ"),m.get("GJDX_BH"),
	            		m.get("JC_RYBH"),m.get("JTGJ"),m.get("JWRYRJSYDM"),m.get("SFYHBJL_PDBZ"),
	            		m.get("QZJLXKZLDM"),m.get("ZJHM"),m.get("SFYHC_PDBZ"),m.get("SFYHC_PDBZ_DMBCMS"),
	            		m.get("TDH_BH"),m.get("HJK_FZRQ"),m.get("LYT_BH"),m.get("HC_RQSJ"),m.get("HJK_CRJ_RQ"),
	            		m.get("HJK_CRJ_SJ"),m.get("HJK_CSRQ"),m.get("XC_ZJHM"),m.get("XM"),m.get("BZKFQ"),
	            		m.get("BZK_SJYCSM"),m.get("BZK_XXRKSJ"),m.get("JLYXX_PDBZ"),m.get("UPDATE_TIME")});
	        }
	        retCode = jdbc.batchUpdate(insertSql, args);
	}
}
