


/**  告警信息 **/
Mock.mock(/control\/localCommunityTerminal\/alarmInfoListData/, {
	'count':10,
    'records|10': [{
    	'IMAGENAME':'timg',
    	'DATE':'@date',
    	'POINTS|1-100':1,
    	'LEVEL|1':[
    		"一级",
    		"二级",
    		"三级"
    		],
    	'ADDR|1':[
            "天河区时代十四街道",
            "番禺区小谷围十六街道",
            "海珠区东晓南二十四街道"
          ],
        'NAME':'@cname'
    }]
});
/**  人员告警 **/
Mock.mock(/control\/localCommunityTerminal\/getAlarmPersonData$/, {
	"tabList":{
		'count|10-20':10,
	    'records|10-20': [{
	    	'perID|1':100,
	        'TASK_ID|+1': 1,
	        'CAMERA_URL':'@imgPersonControl',
	        'DISPATCH_URL': '@imgPersonControlBranch',
	        'NAME': '@cname()',
	        'ID_NO':regularField.idCard,
	        'ADDRESS':'@city(true)',
	        'PERCENT|75-100':75,
	        'TIME':'@mockTime',
	        'LIB':'重点人员'
	    }]
	}
});
/**  人员告警图表 **/
Mock.mock(/report\/stat\/list$/, {
	"data|24":[{
		'TIME|+1':0,
		"STAT_NUM|10-100":66
	}]
});
/**  布控库名 **/
Mock.mock(/eface\/alarm\/getLibData$/, {
		"records|5-10":[{
			'LIBNAME|+1':['星河网吧布控库','海心沙布控库','科韵路布控库','新塘布控库','黄埔布控库','花都沙布控库','越秀沙布控库','广州东站布控库','番禺布控库'],
			"LIBVALUE|+1":1
		}]
});

