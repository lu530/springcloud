var ALARM_ID = UI.util.getUrlParam("ALARM_ID") || '';
var ALARM_TIME = UI.util.getUrlParam("ALARM_TIME") || '';
var TASK_LEVEL = UI.util.getUrlParam("level") || '';
$(function (){
	initData();
	initEvent();
});

function initEvent(){
	$("#closeBtn").click(function(){
		parent.UI.util.closeCommonWindow();
	});
}

function initData(){
	var curParams = {
			ALARM_ID:ALARM_ID,
			ALARM_TIME:ALARM_TIME,
			TASK_LEVEL:TASK_LEVEL
	}
	UI.control.remoteCall('defence/alarmHandleRecord/list', curParams, function(resp){
		if(resp.data.length >0){
			$("#alarmList").html(tmpl("alarmTemplate",resp.data));
		}else{
			UI.util.alert("反馈失败","warn");
		} 
		UI.util.hideLoadingPanel();
	}, function(){}, {async: false }, true);
}