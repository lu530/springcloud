package com.suntek.efacecloud.model;

import java.util.HashMap;
import java.util.Map;

import com.suntek.eap.EAP;
import com.suntek.eap.util.DateUtil;
import com.suntek.eap.util.StringUtil;
import com.suntek.efacecloud.util.FaceFeatureUtil;
import com.suntek.efacecloud.util.FaceFeatureUtil.FeatureResp;

/**专题库es数据实体模型
 * @version 2017-07-13
 * @since 1.0
 * @author gaosong
 */
public class FaceSpecialEsModel {
	
	/**信息编号,主键ID,使用snowflake算法生成**/
	private long infoId; 
	
	/**人员编号**/
	private long personId;
	
	/**证件类型[1:身份证 2:护照 3:驾驶证 4:港澳通行证]**/
	private byte identityType; 
	
	/**证件号码**/
	private String identityId;
	
	/**出生日期**/
	private int birthday;
	
	/**户籍地址**/
	private String permanentAddress;
	
	/**现住地址**/
	private String presentAddress;
	
	/**姓名**/
	private String name;	
	
	/**性别**/
	private byte sex;
	
	
	/**图片路径**/
	private String  pic;
	
	/**图片质量 **/
	private int picQuality;
	
	/**来源专题库id**/
	private String sourceDb;
	
	/**创建人**/
	private String creator;
	
	/**创建时间**/
	private long createTime;
	
	/**人脸特征**/
	private String rltz;
	
	/**档案库图片编号**/
	private long archivePicInfoId;
	
	public FaceSpecialEsModel() {

	}
	
	public FaceSpecialEsModel(long infoId, long personId, String pic, int picQuality, String sourceDb, String creator,
				String rltz, long archivePicInfoId) {
		super();
		this.infoId = infoId;
		this.personId = personId;
		this.pic = pic;
		this.picQuality = picQuality;
		this.sourceDb = sourceDb;
		this.creator = creator;
		this.createTime = Long.valueOf(DateUtil.convertByFormat(DateUtil.getDateTime(), DateUtil.standard_sdf, DateUtil.yyMMddHHmmss_sdf));
		this.rltz = rltz;
		this.archivePicInfoId = archivePicInfoId;
	}
	
	public FaceSpecialEsModel(long infoId, long personId, String pic, String sourceDb, String creator,long archivePicInfoId) {
		super();
		this.infoId = infoId;
		this.personId = personId;
		this.pic = pic;
		this.sourceDb = sourceDb;
		this.creator = creator;
		this.createTime = Long.valueOf(DateUtil.convertByFormat(DateUtil.getDateTime(), DateUtil.standard_sdf, DateUtil.yyMMddHHmmss_sdf));
		this.archivePicInfoId = archivePicInfoId;
		
		FeatureResp resp = FaceFeatureUtil.faceQualityCheck(pic);
		
		String faceFeature = resp.getRltz();
		
		this.rltz = faceFeature;
		this.picQuality =  resp.getScore();
		
	}
	
	

	public long getInfoId() {
		return infoId;
	}

	public void setInfoId(long infoId) {
		this.infoId = infoId;
	}

	public long getPersonId() {
		return personId;
	}

	public void setPersonId(long personId) {
		this.personId = personId;
	}

	public String getPic() {
		return pic;
	}

	public void setPic(String pic) {
		this.pic = pic;
	}

	public float getPicQuality() {
		return picQuality;
	}

	public void setPicQuality(int picQuality) {
		this.picQuality = picQuality;
	}

	public String getSourceDb() {
		return sourceDb;
	}

	public void setSourceDb(String sourceDb) {
		this.sourceDb = sourceDb;
	}

	public String getCreator() {
		return creator;
	}

	public void setCreator(String creator) {
		this.creator = creator;
	}

	public long getCreateTime() {
		return createTime;
	}

	public void setCreateTime(long createTime) {
		this.createTime = createTime;
	}

	public String getRltz() {
		return rltz;
	}

	public void setRltz(String rltz) {
		this.rltz = rltz;
	}

	public long getArchivePicInfoId() {
		return archivePicInfoId;
	}

	public void setArchivePicInfoId(long archivePicInfoId) {
		this.archivePicInfoId = archivePicInfoId;
	}
	
	
	
	public byte getIdentityType() {
		return identityType;
	}

	public void setIdentityType(byte identityType) {
		this.identityType = identityType;
	}

	public String getIdentityId() {
		return identityId;
	}

	public void setIdentityId(String identityId) {
		this.identityId = identityId;
	}

	public int getBirthday() {
		return birthday;
	}

	public void setBirthday(int birthday) {
		this.birthday = birthday;
	}

	public String getPermanentAddress() {
		return permanentAddress;
	}

	public void setPermanentAddress(String permanentAddress) {
		this.permanentAddress = permanentAddress;
	}

	public String getPresentAddress() {
		return presentAddress;
	}

	public void setPresentAddress(String presentAddress) {
		this.presentAddress = presentAddress;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public byte getSex() {
		return sex;
	}

	public void setSex(byte sex) {
		this.sex = sex;
	}

	public Map<String,Object> toESMap(){
		HashMap<String, Object> map = new HashMap<String,Object>();
		
		map.put("INFO_ID", infoId);
		if (personId !=0) {
			map.put("PERSON_ID", personId);	
		}
		if (archivePicInfoId !=0) {
			map.put("ARCHIVE_PIC_INFO_ID", archivePicInfoId);
		}

		map.put("PIC", pic);
		map.put("PIC_QUALITY", picQuality);
		map.put("SOURCE_DB", sourceDb);
		map.put("CREATOR", creator);
		map.put("CREATE_TIME", createTime);
		map.put("RLTZ", rltz);
	
		map.put("PRESENT_ADDRESS", presentAddress);
		
		map.put("SEX", sex);

		map.put("IDENTITY_ID", identityId);
		
		map.put("IDENTITY_TYPE", identityType);

		map.put("PERMANENT_ADDRESS", permanentAddress);

		map.put("BIRTHDAY", birthday);
		
		map.put("NAME",name);
		
		return map;	
	}
	
	/**应用参数构造专题库es实体**/
	public static FaceSpecialEsModel paramsToModel(Map<String,Object> params){
		FaceSpecialEsModel model = new FaceSpecialEsModel();
		
		model.infoId = EAP.keyTool.getIDGenerator();
		
		model.birthday = Integer.valueOf(StringUtil.toString(params.get("BIRTHDAY")).replaceAll("-", ""));

		model.identityId = StringUtil.toString(params.get("IDENTITY_ID"));
	
		model.identityType = Byte.valueOf(StringUtil.toString(params.get("IDENTITY_TYPE")));

		model.name = StringUtil.toString(params.get("NAME"));
		
		model.permanentAddress = StringUtil.toString(params.get("PERMANENT_ADDRESS"));

		model.presentAddress = StringUtil.toString(params.get("PRESENT_ADDRESS"));

		model.sex = Byte.valueOf(StringUtil.toString(params.get("SEX")));
		
		model.sourceDb      =  StringUtil.toString(params.get("SOURCE_DB"));
		
		model.pic =  StringUtil.toString(params.get("PIC"));
		model.creator = StringUtil.toString(params.get("CREATOR"));
		model.createTime = Long.valueOf(DateUtil.convertByFormat(DateUtil.getDateTime(), DateUtil.standard_sdf, DateUtil.yyMMddHHmmss_sdf));
	
		return model;		
	}
	
}
