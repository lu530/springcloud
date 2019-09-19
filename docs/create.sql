create table SPECIAL_LIB( --专题库
	DB_ID varchar(36) not null, --库ID
	DB_KIND int not null, --库种类（0专题1个人）
	DB_TYPE int not null, --库类型(0人1车)
	DB_NAME varchar(50) not null, --库名称
	CREATOR varchar(50) not null, --创建人
	CREATE_TIME varchar(20) not null, --创建时间
	constraint PK_SPECIAL_LIB primary key nonclustered (DB_ID)
)

create table EFACE_PERSON_ARCHIVE( --人员档案库
	PERSON_ID varchar(36) not null, --人员ID 
	NAME varchar(50) not null, --姓名
	SEX int null, --性别 1男2女0未知
	IDENTITY_TYPE int null, --证件类型 1身份证2护照3驾驶证4港澳通行证
	IDENTITY_ID varchar(20) null, --证件号码
	BIRTHDAY varchar(20) null, --出生日期
	PERMANENT_ADDRESS varchar(100) null, --户籍地址
	PRESENT_ADDRESS varchar(100) null, --现住地址
	PIC varchar(200) not null,         --主图
	CREATOR varchar(50) not null,      --创建人
	CREATE_TIME varchar(20) not null, --创建时间
	constraint PK_EFACE_PERSON_ARCHIVE primary key nonclustered (PERSON_ID)
)

create table ARCHIVE_ID_PERSON_ID_REL( -- 档案与人员关联关系表
	ARCHIVE_ID varchar(32),  --档案标识
	PERSON_ID varchar(32)    --人员标识
)

create table EFACE_TAG_REL( --关联标签表
	ID varchar(36) not null, --主键ID
	REL_ID varchar(36) not null, --关联ID,即人员PERSON_ID 
	REL_TYPE int not null, --1人员关联2收藏夹人脸关联
	TAG_CODE varchar(20) not null, --标签值
	constraint PK_EFACE_TAG_REL primary key nonclustered (ID)
)

create table EFACE_PERSON_ADDRESS(
	CODE varchar(20) not null, --主键编码
	NAME varchar(100) not null, --名称
	PARENT_CODE varchar(20) null, --父节点编码
	constraint PK_EFACE_PERSON_ADDRESS primary key nonclustered (CODE)
)

create table EFACE_PERSON_TAG( --人员标签表
	ID varchar(36) not null, --主键ID
	TAG_CODE varchar(20) not null, --标签code
	PARENT_TAG_CODE varchar(20) not null, --标签父节点code
	TAG_NAME varchar(50) not null, --标签name
	DB_ID varchar(36) null, --专题库ID
	constraint PK_EFACE_PERSON_TAG primary key nonclustered (ID)
)

--special_db--
insert into SPECIAL_LIB(DB_ID, DB_KIND, DB_TYPE, DB_NAME, CREATOR, CREATE_TIME) values ('NON_INVOLVED_DB', 0, 0, '未涉案库', 'sys', CONVERT(varchar(100), GETDATE(), 120))
insert into SPECIAL_LIB(DB_ID, DB_KIND, DB_TYPE, DB_NAME, CREATOR, CREATE_TIME) values ('AT_LARGE_DB', 0, 0, '在逃库', 'sys', CONVERT(varchar(100), GETDATE(), 120))
insert into SPECIAL_LIB(DB_ID, DB_KIND, DB_TYPE, DB_NAME, CREATOR, CREATE_TIME) values ('INVOLVED_TERRORISM_DB', 0, 0, '涉恐库', 'sys', CONVERT(varchar(100), GETDATE(), 120))
insert into SPECIAL_LIB(DB_ID, DB_KIND, DB_TYPE, DB_NAME, CREATOR, CREATE_TIME) values ('INVOLVED_STEADY_DB', 0, 0, '涉稳库', 'sys', CONVERT(varchar(100), GETDATE(), 120))
insert into SPECIAL_LIB(DB_ID, DB_KIND, DB_TYPE, DB_NAME, CREATOR, CREATE_TIME) values ('MAJOR_CRIMINAL_DB', 0, 0, '重大刑事犯罪前科库', 'sys', CONVERT(varchar(100), GETDATE(), 120))
insert into SPECIAL_LIB(DB_ID, DB_KIND, DB_TYPE, DB_NAME, CREATOR, CREATE_TIME) values ('TROUBLEMAKING_PSYCHOPATH_DB', 0, 0, '肇事肇祸精神病人库', 'sys', CONVERT(varchar(100), GETDATE(), 120))
insert into SPECIAL_LIB(DB_ID, DB_KIND, DB_TYPE, DB_NAME, CREATOR, CREATE_TIME) values ('PRIORITY_PETITION_DB', 0, 0, '重点上访库', 'sys', CONVERT(varchar(100), GETDATE(), 120))
insert into SPECIAL_LIB(DB_ID, DB_KIND, DB_TYPE, DB_NAME, CREATOR, CREATE_TIME) values ('ROBBERY_DB', 0, 0, '抢劫库', 'sys', CONVERT(varchar(100), GETDATE(), 120))
insert into SPECIAL_LIB(DB_ID, DB_KIND, DB_TYPE, DB_NAME, CREATOR, CREATE_TIME) values ('THEFT_DB', 0, 0, '盗窃库', 'sys', CONVERT(varchar(100), GETDATE(), 120))
insert into SPECIAL_LIB(DB_ID, DB_KIND, DB_TYPE, DB_NAME, CREATOR, CREATE_TIME) values ('FRAUD_DB', 0, 0, '诈骗库', 'sys', CONVERT(varchar(100), GETDATE(), 120))
insert into SPECIAL_LIB(DB_ID, DB_KIND, DB_TYPE, DB_NAME, CREATOR, CREATE_TIME) values ('INVOLVED_DRUG_DB', 0, 0, '涉毒库', 'sys', CONVERT(varchar(100), GETDATE(), 120))
insert into SPECIAL_LIB(DB_ID, DB_KIND, DB_TYPE, DB_NAME, CREATOR, CREATE_TIME) values ('JURISPRUDENCE_DB', 0, 0, '涉黄库', 'sys', CONVERT(varchar(100), GETDATE(), 120))
insert into SPECIAL_LIB(DB_ID, DB_KIND, DB_TYPE, DB_NAME, CREATOR, CREATE_TIME) values ('GAMBLING_DB', 0, 0, '涉赌库', 'sys', CONVERT(varchar(100), GETDATE(), 120))
insert into SPECIAL_LIB(DB_ID, DB_KIND, DB_TYPE, DB_NAME, CREATOR, CREATE_TIME) values ('INHABITANT_DB', 0, 0, '常住人口库', 'sys', CONVERT(varchar(100), GETDATE(), 120))
insert into SPECIAL_LIB(DB_ID, DB_KIND, DB_TYPE, DB_NAME, CREATOR, CREATE_TIME) values ('HOBO_DB', 0, 0, '流动人口库', 'sys', CONVERT(varchar(100), GETDATE(), 120))
--special_db--

---eface_person_tag
insert into EFACE_PERSON_TAG (ID, TAG_CODE, PARENT_TAG_CODE, TAG_NAME, DB_ID) values (REPLACE(newId(), '-', '') ,'01','','未涉案','NON_INVOLVED_DB')
insert into EFACE_PERSON_TAG (ID, TAG_CODE, PARENT_TAG_CODE, TAG_NAME, DB_ID) values (REPLACE(newId(), '-', '') ,'02','','在逃','AT_LARGE_DB')
insert into EFACE_PERSON_TAG (ID, TAG_CODE, PARENT_TAG_CODE, TAG_NAME, DB_ID) values (REPLACE(newId(), '-', '') ,'03','','涉恐','INVOLVED_TERRORISM_DB')
insert into EFACE_PERSON_TAG (ID, TAG_CODE, PARENT_TAG_CODE, TAG_NAME, DB_ID) values (REPLACE(newId(), '-', '') ,'04','','涉稳','INVOLVED_STEADY_DB')
insert into EFACE_PERSON_TAG (ID, TAG_CODE, PARENT_TAG_CODE, TAG_NAME, DB_ID) values (REPLACE(newId(), '-', '') ,'05','','重大刑事犯罪前科','MAJOR_CRIMINAL_DB')
insert into EFACE_PERSON_TAG (ID, TAG_CODE, PARENT_TAG_CODE, TAG_NAME, DB_ID) values (REPLACE(newId(), '-', '') ,'06','','肇事肇祸精神病人','TROUBLEMAKING_PSYCHOPATH_DB')
insert into EFACE_PERSON_TAG (ID, TAG_CODE, PARENT_TAG_CODE, TAG_NAME, DB_ID) values (REPLACE(newId(), '-', '') ,'07','','重点上访','PRIORITY_PETITION_DB')
insert into EFACE_PERSON_TAG (ID, TAG_CODE, PARENT_TAG_CODE, TAG_NAME, DB_ID) values (REPLACE(newId(), '-', '') ,'08','','抢劫','ROBBERY_DB')
insert into EFACE_PERSON_TAG (ID, TAG_CODE, PARENT_TAG_CODE, TAG_NAME, DB_ID) values (REPLACE(newId(), '-', '') ,'09','','盗窃','THEFT_DB')
insert into EFACE_PERSON_TAG (ID, TAG_CODE, PARENT_TAG_CODE, TAG_NAME, DB_ID) values (REPLACE(newId(), '-', '') ,'10','','诈骗','FRAUD_DB')
insert into EFACE_PERSON_TAG (ID, TAG_CODE, PARENT_TAG_CODE, TAG_NAME, DB_ID) values (REPLACE(newId(), '-', '') ,'11','','涉毒','INVOLVED_DRUG_DB')
insert into EFACE_PERSON_TAG (ID, TAG_CODE, PARENT_TAG_CODE, TAG_NAME, DB_ID) values (REPLACE(newId(), '-', '') ,'12','','涉黄','JURISPRUDENCE_DB')
insert into EFACE_PERSON_TAG (ID, TAG_CODE, PARENT_TAG_CODE, TAG_NAME, DB_ID) values (REPLACE(newId(), '-', '') ,'13','','涉赌','GAMBLING_DB')
insert into EFACE_PERSON_TAG (ID, TAG_CODE, PARENT_TAG_CODE, TAG_NAME, DB_ID) values (REPLACE(newId(), '-', '') ,'14','','常住人口','INHABITANT_DB')
insert into EFACE_PERSON_TAG (ID, TAG_CODE, PARENT_TAG_CODE, TAG_NAME, DB_ID) values (REPLACE(newId(), '-', '') ,'15','','流动人口','HOBO_DB')
--eface_person_tag



create table EFACE_DISPATCHED_DB( --布控库表
	DB_ID varchar(36) not null, --库ID
	DB_NAME varchar(36) not null, --库名称
	ALARM_THRESHOLD int null, --告警阈值(1-99)
	ALARM_LEVEL int null, --告警等级(1红色2黄色3事后关注)
	CREATOR varchar(50) null, --创建人
	CREATE_TIME varchar(20) null, --创建时间
	ORG_CODE varchar(20) null, --布控区域，创建人所属行政区划
	constraint PK_EFACE_DISPATCHED_DB primary key nonclustered (DB_ID)
)

create table EFACE_DISPATCHED_PERSON( --布控库人员表
	PERSON_ID varchar(36) not null, --人员ID
	DB_ID varchar(36) not null, --布控库ID
	NAME varchar(50) not null, --姓名
	SEX int null, --性别 0未知 1男2女
	PIC varchar(500) null, --图片 
	IDENTITY_TYPE int null, --证件类型 1身份证 2护照 3驾驶证 4港澳通行证	
	IDENTITY_ID varchar(30) null, --证件号码
	BIRTHDAY varchar(20) null, --出生日期
	PERMANENT_ADDRESS varchar(200) null, --户籍地址
	PRESENT_ADDRESS varchar(200) null, --现住地址
	CREATOR varchar(50) null, --创建人
	CREATE_TIME varchar(20) null, --创建时间
	constraint PK_EFACE_DISPATCHED_PERSON primary key nonclustered (PERSON_ID)
)

create table EFACE_DISPATCHED_TASK( --布控任务表 布控库与抓拍设备关联
	ID varchar(36) not null, --主键ID
	TASK_ID varchar(36) not null, --任务ID
	TASK_NAME varchar(50) null, --任务名称
	DB_ID varchar(36) not null, --布控库ID
	DEVICE_ID varchar(36) not null, --设备ID
	CREATOR varchar(50) null, --创建人
	CREATE_TIME varchar(20) null, --创建时间
	constraint PK_EFACE_DISPATCHED_DB_REL_DEVICE primary key nonclustered (ID)
)



create table EFACE_FAVORITE( --收藏夹表
	FAVORITE_ID varchar(36) not null, --主键ID
	FAVORITE_NAME varchar(50) not null, --收藏夹名称
	FAVORITE_TYPE int null, --收藏夹类型 1抓拍收藏 2系统收藏
	LEVEL int null, --层级
	PARENT_ID varchar(36) null, --上级收藏夹id
	CREATOR varchar(50) null, --创建人
	CREATE_TIME varchar(20) null, --创建时间
	STATUS int null, --收藏夹状态
	constraint PK_EFACE_FAVORITE primary key nonclustered (FAVORITE_ID)
)

create table EFACE_FAVORITE_FILE( --收藏夹文件表
	FILE_ID varchar(36) not null, --主键ID
	FAVORITE_ID varchar(36) not null, --收藏夹ID
	INFO_ID varchar(36) not null, --来源图片ID
	SOURCE_DB_ID varchar(36) null, --来源库ID
	SOURCE_DB_NAME varchar(50) null, --来源库名称
	DISPATCHED_DB_ID varchar(36) null, --布控库ID
	DISPATCHED_DB_NAME varchar(36) null, --布控库名称
	DEVICE_ID varchar(36) null, --设备ID
	DEVICE_NAME varchar(36) null, --设备名称
	NAME varchar(50) not null, --姓名
	SEX int null, --性别 0未知 1男2女 
	BIRTHDAY varchar(20) null, --出生日期
	IDENTITY_TYPE int null, --证件类型 1身份证 2护照 3驾驶证 4港澳通行证	
	IDENTITY_ID varchar(30) null, --证件号码
	PERMANENT_ADDRESS varchar(200) null, --户籍地址
	PRESENT_ADDRESS varchar(200) null, --现住地址
	PIC varchar(500) null, --图片
	CAPTURE_TIME varchar(20) null, --抓拍时间
	CAPTURE_PIC varchar(500) null, --抓拍图片
	CREATOR varchar(50) null, --创建人
	CREATE_TIME varchar(20) null, --创建时间
	FILE_SOURCE int null, --文件来源 1抓拍检索收藏 2其他库收藏及自增
	constraint PK_EFACE_FAVORITE_FILE primary key nonclustered (FILE_ID)
)

-- alter table VPLUS_SURVEILLANCE_LIBRARY add THRESHOLD int default 0--汇聚布控增加告警阈值
-- alter table EFACE_FAVORITE add FAVORITE_TYPE int null--已放到create table字段

alter table VPLUS_SURVEILLANCE_ALARM add DEAL_STATUS int null; --处理状态 1已确认 2已删除

