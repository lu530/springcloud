//移动核查
Mock.mock(/control\/localCommunityTerminal\/getMobileData$/,{
	"mobieList":{
		'count':10,
		'records|10': [{
	        'NAME':'@cname()',
	        'ORGANIZATION|1': ["广东省广州市天河区","广东省广州市白云区","广东省广州市黄埔区","广东省广州市海珠区"],
	        'JOB|1': ['巡警'], 
	        'POLICE_NUM|+1':006654,
	        'PERSON_NUM|1-100':100,
	        'CAR_NUM|1-100':100,
			'TOTAL_NUM|200-300':300
		}]
	}
});

//首页信息查询人员统计
Mock.mock(/control\/localCommunityTerminal\/getPersonData$/,{
	"personData":{
		'count':10,
		'records|1': [{
			'data|90-100':90,
			'xDatas': ["河南","河北","上海","河南","广东","山西","辽宁","吉林","江苏","浙江"]
		}]
	}
});

//首页信息查询车统计
Mock.mock(/control\/localCommunityTerminal\/getCarData$/,{
	"personData":{
		'count':10,
		'records|1': [{
			'data|90-100':90,
			'xDatas': ["广东","河南","河南","上海","河北","山西","辽宁","吉林","江苏","浙江"]
		}]
	}
});

//首页信息查询车统计
Mock.mock(/control\/localCommunityTerminal\/getCaseData$/,{
	"personData":{
		'count':10,
		'records|1': [{
			'data':["@integer(50, 100)","@integer(50, 100)","@integer(50, 100)","@integer(50, 100)","@integer(50, 100)"]
		}]
	}
});
