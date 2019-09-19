
/**  重点人员 **/
Mock.mock(/control\/localCommunityTerminal\/getListImportant$/, {
	"listTab":{
		'count|10-20':20,
	    'records|10-20': [{
	        'SEX|1':['男','女'],
	        'SHOTURL': '@imgPersonPhoto(20)',
	        'NAME': '@cname()',
	        'IDCAR':regularField.idCard,
	        'TYPE|1':['盗窃','抢劫','斗殴'],
	        'STATUS|1':['已抓获','未抓获']
	    }]
	}
});
/**  重点人员频次分析 **/
Mock.mock(/cs\/dispatchedFrequency\/getData$/, {
	"alarmStaListView":{
		'count|10-20':20,
	    'records|10-20': [{
	        'TEMPLET_IMG':'@imgPersonPhoto',
	        'PERSON_NAME': '@cname',
	        'COUNT|2-20': 2,
	        'IDENTITY_ID':regularField.idCard
	    }]
	}
});
/**  重点人员频次draw **/
Mock.mock(/efacecloud\/frequencyDetail\/getFreData$/, {
	"alarmDetailListView":{
		'count|10-20':20,
	    'records|3-6': [{
	        'ALARM_IMG':'@imgPersonFrequency',
	        'TEMPLET_IMG':'@imgPersonPhoto(1)',
	        'PERSON_NAME': '440222198010241826',
	        'DEVICE_ADDR': '@city(true)',
	        'NAME': '星河网吧',
	        'ALARM_TIME': '@mockTime'
	    }],
	    'drawData':['5','7','10','3','6'],
	    'xDescData':['2017-06-04','2017-06-12','2017-06-13','2017-06-14','2017-06-15']
	}
});
/**  重点人员频次分析 布控库 **/
Mock.mock(/vehicle\/alarmReport\/sdbList$/, {
	"sdbList|3":[{
	        'text|+1':['源化花园业主库','国保人员','警员库'],
	        'value': '@word(5)'
	    }]
	
});