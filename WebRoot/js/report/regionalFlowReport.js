var cityData = [];
var timeOption = {
		'elem':$('#timeTagList'),
		'beginTime' :$('#beginTime'),
		'endTime' :$('#endTime'),
		'callback':doSearch
};
orgTreeOpts = $.extend(orgTreeOpts, {
	multiple: false,
	search:{
		enable: true,          //是否启用搜索
		searchTreeNode: true,				//搜索参数 key|value为文本框的ID
		ignoreEmptySearchText: true,
		searchTextId: 'orgName',
		searchBtnId: 'search'
	}
});

$(function() {
	UI.control.init();
	initDateTimeControl(timeOption);
	initData();
	initWaterMark();
});

function doSearch( date){
	var param = {
			BEGIN_TIME:date.bT,
			END_TIME:date.eT
	}
	paraAreaFaceService(param);
}

function initChart(areaFaceData){
	var seriesDatas = [{
		data:areaFaceData.areaFaceNumArr
	}];
	//横坐标
	var xDesc = areaFaceData.areaFaceCityArr;
	var config = {
			axisLabelColor:'#676767',
			splitLineColor:'rgba(157,180,212,0.3)',
			yTitle:"单位/人次",
			titleColor:'#676767',
			xinterval:0,
	}
	var monthlyOption = getLineDrawOption(xDesc, seriesDatas,config);
	drawCharts('areaStatistics', monthlyOption);
}
function initData(){
	var beginDate = new Date();
	var endDate = new Date();
	var param = {
			BEGIN_TIME:beginDate.format("yyyy-MM-dd 00:00:00"),
			END_TIME:endDate.format("yyyy-MM-dd 23:59:59")  
	}
	paraAreaFaceService(param);
}
function paraAreaFaceService(param){
	var arceParam = param || {};
	UI.control.remoteCall("face/statistic/areaFace", arceParam, function(reply){
		var areaFaceData = {};
		areaFaceData.areaFaceCityArr = [];
		areaFaceData.areaFaceNumArr = [];
		if(reply.data.length==0){
			if(cityData.length==0){
				areaFaceData.areaFaceCityArr = [""];
				areaFaceData.areaFaceNumArr = [0];
			}else{
				areaFaceData.areaFaceCityArr = cityData;
				areaFaceData.areaFaceNumArr = noData(cityData);
			}
		}else{
			for(var i = 0 ; i<reply.data.length;i++ ){
				areaFaceData.areaFaceCityArr.push(reply.data[i].ORG_NAME);
				areaFaceData.areaFaceNumArr.push(reply.data[i].NUM);
			}
			cityData = areaFaceData.areaFaceCityArr;
		}
		initChart(areaFaceData);
		
	});
}
//返回空数据的时候
function noData(oldData){
	var num = [];
	if(oldData.length == 0){
		return [0];
	}else{
		for(var i = 0;i<oldData.length;i++){
			num.push(0);
		}
	}
	return num;
}