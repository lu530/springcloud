/**
 * 告警频次分析
 * @author fenghuixia
 * 2018-02-08
 */
var BEGIN_TIME = UI.util.getUrlParam("BEGIN_TIME") || '';
var END_TIME = UI.util.getUrlParam("END_TIME") || '';
var OBJECT_ID = UI.util.getUrlParam("OBJECT_ID") || '';
var THRESHOLD = UI.util.getUrlParam("THRESHOLD") || '';
//告警列表
var queryParamsList = { //初始化告警列表请求参数
	BEGIN_TIME: BEGIN_TIME,
	END_TIME: END_TIME,
	OBJECT_ID: OBJECT_ID,
	THRESHOLD: THRESHOLD
};
$(function (){
	UI.control.init();
	initEvent();
});

function initEvent(){
	$("#beginT").html(BEGIN_TIME);
	$("#endT").html(END_TIME);
	$("#frequencyNum").html($("[listview-counts]").html());
	
	//返回
	$('#backBtn').click(function(){
		parent.UI.util.hideCommonIframe('.frame-form-full');
	});
	
	//轨迹分析
	$("body").on("click", ".trajectory-search", function() {
		openWindowPopup('track', $(this).attr("url"));
	});
	
	//身份核查
	$("body").on("click", ".verification-search", function() {
		openWindowPopup('identity', $(this).attr("url"));
	});
	
	//点击详情事件
	$('body').on('click', '.detailBtn', function() {
		var $this = $(this),
			ALARM_ID = $this.attr('ALARM_ID'),
			level = $this.attr("alarm-level"),
			objectId = $this.attr("objid"),
			curTime = $this.attr("curTime");
		UI.util.showCommonWindow('/efacecloud/page/library/alarmDetails.html?OBJECT_ID='+objectId+'&curTime='+curTime+'&ALARM_ID=' + ALARM_ID + '&level=' + level, "告警详情",
			880, 490,
			function(obj) {});
	});
	
}