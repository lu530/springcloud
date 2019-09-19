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
	// 查看下发受理人的处置记录
	$('body').on('click', '.emit', function () {
		$(this).addClass('hide').prev().removeClass('hide');
		$('#alarmBottomList').removeClass('hide');
	});
	// 反馈记录的返回按钮
	$('body').on('click', '.reverseBtn', function () {
		$(this).addClass('hide').next().removeClass('hide');
		$('#alarmBottomList').addClass('hide').children('.alarm-list').scrollTop(0);
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
	renderMoreList();
}

function renderMoreList(){
	$.each(top.LIST_DATA, function(i, el) {
		var data = {};
		data.RECORD = el;
		dealWithRemark(data);
		$('#alarmBottomList').append(tmpl("bottomTemplate", data));
	});
}

function dealWithRemark(data){
	if(data.RECORD && data.RECORD.length) {
		// 尝试解析REMARK字段，若可解析则将其用其解析值覆盖，否则保持原值
		$.each(data.RECORD, function(i, obj) {
			try {
				obj.REMARK = JSON.parse(obj.REMARK);
			} catch (error) {}
		});
	}
}