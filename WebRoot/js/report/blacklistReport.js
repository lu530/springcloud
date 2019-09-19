var timeOption = {
		'elem':$('#timeTagList'),
		'beginTime' :$('#beginTime'),
		'endTime' :$('#endTime'),
		'callback':doSearch
};

orgTreeOpts = $.extend(orgTreeOpts, {
	multiple: false,
	search:{
		enable: true,              //是否启用搜索
		searchTreeNode: true,				//搜索参数 key|value为文本框的ID
		ignoreEmptySearchText: true,
		searchTextId: 'orgName',
		searchBtnId: 'search'
	}
});

$(function() {
	UI.control.init();

	initDateTimeControl(timeOption);
	
	initChart();
});

function doSearch( date){
}

function initChart(){
	//地区统计
	var areaBarOptions = {
		seriesDatas:[{color:"#3272BC",data:["14","12","35","13"]}],
		xDatas:["东站派出所","海心沙派出所","新塘派出所","黄村派出所"],
		yTitle:"",
		rotate: -15,
		legend:{
			orient:'horizontal',
			data:["户籍人口","外来人口","港澳台同胞","外籍人士"]
		}
	}
	var areaOption = getBarDrawOption(areaBarOptions);
	drawCharts('areaStatistics', areaOption);
}