/**
 * @Author zenghaiming
 * @version 2017-06-21
 * @description 
 */
var params={};
params.BEGIN_TIME = UI.util.getUrlParam("beginTime");
params.END_TIME = UI.util.getUrlParam("endTime");
params.IDENTITY_ID = UI.util.getUrlParam("identity");

$(function(){
	UI.control.init();
	initData();
	initEvent();
})

function initEvent(){
	$('body').on('click','.back-btn',function() {
		parent.UI.util.hideCommonIframe('.frame-form-full');
	});
}
function initData(){
	var drawData = [];
	var xDescData = [];
	UI.control.remoteCall('face/dispatchedFrequencyDetail/statistics',params, function(resp){
		var arr = resp.personList;
		for(var i=0;i<arr.length;i++){
			drawData.push(arr[i].COUNT);
			xDescData.push(arr[i].DAY);
		}
	});

	var seriesDatas = [{
		data:drawData
	}];
	//横坐标
	var xDesc = xDescData
	var config = {
			axisLabelColor:'#676767',
	}

	areaOption =  getLineDrawOption(xDesc, seriesDatas,config);
	drawCharts('areaReport', areaOption);
}

function doSearch( date){
}

