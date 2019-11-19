var titleType = UI.util.getUrlParam("titleType") || 'false';
var queryParams = {};
var currentRef = '';
var beforeRef = '';
var today = UI.util.getDateTime("today", "yyyy-MM-dd");
var todayTime = UI.util.getDateTime("today", "yyyy-MM-dd HH:mm:ss");
var dateDesc = today;
$('#beginTimeDraw').val(today.bT);
$('#endTimeDraw').val(today.eT);
$('#beginTime').val(todayTime.bT);
$('#endTime').val(todayTime.eT);

var addressOption = { //初始化布控库
	'elem': ['domicile'], //地址HTML容器
	'addressId': ['registerDbList'], //初始化布控库内容
	'service': 'face/dispatchedAlarm/dbList', //请求服务
	'tmpl': 'childNodeListTemplate', //初始化模板
	'callback': doSearchByDb //回调函数
};
var timeOption = {
	'elem': $('#timeTagList'),
	'beginTime': $('#beginTime'),
	'endTime': $('#endTime'),
	"callback": doSearch
};
var queryParamsList = { //初始化告警列表请求参数
	KEYWORDS: '',
	BEGIN_TIME: UI.util.getDateTime("today", "yyyy-MM-dd HH:mm:ss").bT,
	END_TIME: UI.util.getDateTime("today", "yyyy-MM-dd HH:mm:ss").eT,
	DEVICE_IDS: $("#orgCode_1").val(),
	THRESHOLD: '',
};
$(function() {
	UI.control.init();
	getDeviceModule();  //定义在common中
	initEvent();
	initDateTimeControl(timeOption);
})

function initEvent() {
	//通过卡口树加载设备--告警列表页面
	$('#deviceNames_1').click(function(e) {
		//回填数据
		checkDrowDownDeviceList({
			deviceNames:$('#deviceNames_1').html(),
			deviceId:$('#orgCode_1').val(),
			deviceIdInt:$('#orgCodeInt_1').val(),
			orgCode:$("#deviceNames_1").attr("orgcode")
		});
		
		UI.util.showCommonWindow(deviceModule + '/page/device/deviceList.html?deviceType=194', '感知设备', 1000, 600, function(resp) {
			$('#deviceNames_1').html(resp.deviceName);
			$('#deviceNames_1').attr('title', resp.deviceName);
			$('#deviceNames_1').attr('orgcode',resp.orgCode);
			$('#orgCode_1').val(resp.deviceId);
			addDrowdownDeviceList({
				deviceId: resp.deviceId,
				deviceName: resp.deviceName,
				deviceNameList: $("#deviceNameList_1"),
				dropdownListText: $("#deviceNameList_1").parent().prev()
			});
			doSearch();
		});
		
		e.stopPropagation();
	});
	//删除已选设备
	$("body").on("click", ".removeDeviceBtn", function(e) {
		var $this = $(this);
		var i = $this.parents("ul").attr("index");
		var deviceId = $this.attr("deviceid");
		var deviceIdArr = $('#orgCode_' + i).val().split(",");
		var deviceNameArr = $('#deviceNames_' + i).html().split(",");
		var index = deviceIdArr.indexOf(deviceId),
			orgCode = $("#deviceNames_" + i).attr("orgcode"),
			orgCodeArr = orgCode.split(",");

		$this.parents("li").remove();
		deviceIdArr.splice(index, 1);
		deviceNameArr.splice(index, 1);
		orgCodeArr.splice(index,1);
		$('#orgCode_' + i).val(deviceIdArr.join(","));
		$('#deviceNames_' + i).html(deviceNameArr.join(","));
		$('#deviceNames_' + i).attr("title", deviceNameArr.join(","));
		$('#deviceNames_' + i).attr("orgcode",orgCodeArr.join(","));
		if($("#deviceNameList_" + i + " li").length == 0) {
			$("#deviceNames_" + i).parent().attr("data-toggle", "");
			$("#deviceNames_" + i).parent().find(".dropdown").addClass("hide");
			$("#deviceNames_" + i).parent().parent().removeClass("open");
		}
		doSearch();
		e.stopPropagation();
	});
	//搜索姓名，身份证查询条点击事件
	$('#keyWordsSearch .searchBarBtn').click(doSearch);
	//搜索姓名，身份证查询条回车事件
	$('.searchCon').keypress(function(e) {
		if(((e.keyCode || e.which) == 13)) {
			doSearch();
		}
	});
	//相似度搜索
	$('#thresholdValidate .searchBarBtn').click(doSearch);
	//相似度搜索回车事件
	$('.searchSimilarCon').keypress(function(e) {
		if(((e.keyCode || e.which) == 13)) {
			doSearch();
		}
	});
	//点击进入卡口选择地图--告警列表页面
		$('#locate_1').click(function() {
			UI.util.showCommonWindow(deviceModule + '/page/device/deviceMap.html?deviceType=194', '感知设备', 1000, 600, function(resp) {
				$('#deviceNames_1').html(resp.deviceName);
				$('#deviceNames_1').attr('title', resp.deviceName);
				$('#deviceNames_1').attr('orgcode',resp.orgCode);
				$('#orgCode_1').val(resp.deviceId);

				addDrowdownDeviceList({
					deviceId: resp.deviceId,
					deviceName: resp.deviceName,
					deviceNameList: $("#deviceNameList_1"),
					dropdownListText: $("#deviceNameList_1").parent().prev()
				});
				doSearch();
			});
		})
	//警情下发
	$("body").on("click",".tilelist .policePositionSend",function(){
		var type = "eventAlarm";
		var alarmId = $(this).attr("alarmId"); 
		UI.util.showCommonWindow('/datadefence/page/mobileControl/linkPoliceInquiry.html?type='+type+"&ALARM_ID="+alarmId, '警情下发', 1000, 690, 
		function(resp){
			
		});
		
	})
	$("#freshBtn").click(doSearch)
}

function doSearchByDb(dbIdList) {
	if(currentRef == 'tabDraw') {
		queryParams.DB_IDS = dbIdList.join(",");
	} else {
		queryParams.DB_ID = dbIdList.join(",");
	}
}


function doSearch() {
	if(UI.util.validateForm($('#thresholdValidate'))){
		queryParamsList.KEYWORDS = $(".searchCon").val();
		queryParamsList.DEVICE_IDS = $('#orgCode_1').val();
		queryParamsList.THRESHOLD = $(".searchSimilarCon").val();
		queryParamsList.BEGIN_TIME = $('#beginTime').val();
		queryParamsList.END_TIME = $('#endTime').val();
		queryParamsList.pageNo = 1;
		UI.util.showLoadingPanel();
		UI.control.getControlById("tabList").reloadData("", queryParamsList);
		UI.util.hideLoadingPanel();
	}
	
}
function setArithmetic(arr){
	var result = ""
	if(arr.length==0){
		return "暂无";
	}else{
		for(var i =0;i<arr.length;i++){
			result += arr[i].ALGORITHM_NAME+arr[i].SCORE+"  ";
		}
	}
	return result;
}
