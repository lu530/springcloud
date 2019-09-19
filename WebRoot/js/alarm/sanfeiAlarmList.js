var SCENE_ID = UI.util.getUrlParam("SCENE_ID") || '';  //场景类型
var isHistory = UI.util.getUrlParam("isHistory") || '0';
var queryParamsList = { //初始化所有告警列表请求参数
	SCENE_ID: SCENE_ID,
	// SCENE_ID: "",
	KEYWORDS: '',
	BEGIN_TIME: UI.util.getDateTime("today", "yyyy-MM-dd HH:mm:ss").bT,
	END_TIME: UI.util.getDateTime("today", "yyyy-MM-dd HH:mm:ss").eT,
	DEVICE_IDS: $("#orgCode_1").val(),
	THRESHOLD: '',
	SORT: 0,
	isHistory: isHistory,
	IS_ESCAPE_HIT: '',
	ALARM_TYPE: '',
	DB_ID: '',
	ALARM_LEVEL: '',
	ALARM_HANDLE: '',
	IS_CATCH: '',
	isAsync: true
};

var timeOption = {
	'elem': $('#timeTagList'),
	'beginTime': $('#beginTime'),
	'endTime': $('#endTime'),
	'callback': doSearchList
};

var algoID = '';

var isBlack = isBlack();

$(function () {
	getAlgoID();
	UI.control.init();
	initEvent();
	selectedTag();
	initDateTimeControl(timeOption);
	UI.control.getControlById("tabList").bind("load", function () {
		ElectronicArchivesSwitch();
	})
});

function initEvent(){
	//搜索姓名，身份证查询条点击事件
	$('.searchBarBtn').click(function () {
		doSearchList(true);
	});
	//搜索姓名，身份证查询条回车事件
	$('.searchCon').keypress(function (e) {
		if (((e.keyCode || e.which) == 13)) {
			doSearchList(true);
		}
	});
	
	//所有告警确定按钮
	$('#confirmAllSearch').click(function(){
		doSearchList(true);
	});
	
	//删除已选设备
	$("body").on("click", ".removeDeviceBtn", function (e) {
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
		orgCodeArr.splice(index, 1);
		$('#orgCode_' + i).val(deviceIdArr.join(","));
		$('#deviceNames_' + i).html(deviceNameArr.join(","));
		$('#deviceNames_' + i).attr("title", deviceNameArr.join(","));
		$('#deviceNames_' + i).attr("orgcode", orgCodeArr.join(","));
		if ($("#deviceNameList_" + i + " li").length == 0) {
			$("#deviceNames_" + i).parent().attr("data-toggle", "");
			$("#deviceNames_" + i).parent().find(".dropdown").addClass("hide");
			$("#deviceNames_" + i).parent().parent().removeClass("open");
		}

		if (i == 2) {//告警统计图
			doSearchChart();
		} else if (i == 3) {//飞识告警
			doSearchFlyList();
		} else {//全部告警
			doSearchList();
		}

		e.stopPropagation();
	});


	//感知设备通过卡口树加载设备
	$("[id^=deviceNames_]").click(function (e) {
		var index = $(this).attr("id").split("_")[1];
		//回填数据
		checkDrowDownDeviceList({
			deviceNames: $('#deviceNames_' + index).html(),
			deviceId: $('#orgCode_' + index).val(),
			deviceIdInt: $('#orgCodeInt_' + index).val(),
			orgCode: $("#deviceNames_" + index).attr("orgcode")
		});

		UI.util.showCommonWindow('/connectplus/page/device/deviceList.html?deviceType=194', '感知设备', 1000, 600, function (resp) {
			$('#deviceNames_' + index).html(resp.deviceName);
			$('#deviceNames_' + index).attr('title', resp.deviceName);
			$('#deviceNames_' + index).attr('orgcode', resp.orgCode);
			$('#orgCode_' + index).val(resp.deviceId);
			addDrowdownDeviceList({
				deviceId: resp.deviceId,
				deviceName: resp.deviceName,
				deviceNameList: $("#deviceNameList_" + index),
				dropdownListText: $("#deviceNameList_" + index).parent().prev()
			});
			switch (index) {
				case 1://所有告警列表
				case "1":
					doSearchList();
					break;
				case 2://告警统计
				case "2":
					doSearchChart();
					break;
				case 3://二次告警列表
				case "3":
					doSearchFlyList();
					break;
			}
		});
		e.stopPropagation();
	});

	//点击进入卡口选择地图
	$('[id^=locate_]').click(function () {
		var index = $(this).attr("id").split("_")[1];
		UI.util.showCommonWindow('/connectplus/page/device/deviceMap.html?deviceType=194', '感知设备', 1000, 600, function (resp) {
			$('#deviceNames_' + index).html(resp.deviceName);
			$('#deviceNames_' + index).attr('title', resp.deviceName);
			$('#deviceNames_' + index).attr('orgcode', resp.orgCode);
			$('#orgCode_' + index).val(resp.deviceId);
			addDrowdownDeviceList({
				deviceId: resp.deviceId,
				deviceName: resp.deviceName,
				deviceNameList: $("#deviceNameList_" + index),
				dropdownListText: $("#deviceNameList_" + index).parent().prev()
			});
			switch (index) {
				case 1://所有告警列表
				case "1":
					doSearchList();
					break;
				case 2://告警统计
				case "2":
					doSearchChart();
					break;
				case 3://二次告警列表
				case "3":
					doSearchFlyList();
					break;
			}
		});
	});
	
	//频次分析
	$("#freqAnalysisBtn").click(function () {
		var listData = UI.control.getDataById('tabList'),
			checkData = UI.control.getControlById('tabList').getListviewCheckData();
		if (listData.count <= 0) {
			UI.util.alert("暂无数据，请重新查询！", "warn");
			return;
		}
		if (checkData.length == 0) {
			UI.util.alert("请勾选一个数据！", "warn");
			return;
		}
		if (checkData.length > 1) {
			UI.util.alert("只能勾选一个数据！", "warn");
			return;
		}
		UI.util.showCommonWindow("/efacecloud/page/alarm/freqAnalysis.html", "频次分析", 550, 400, function (data) {
			var beginTime = data.beginTime,
				endTime = data.endTime,
				threshold = data.threshold,
				objectId = $(".list-node-wrap.active").attr("obj_id");
			UI.util.showCommonIframe('.frame-form-full', '/efacecloud/page/alarm/alarmAnalysisList.html?BEGIN_TIME=' + beginTime + '&END_TIME=' + endTime +
				'&THRESHOLD=' + threshold + '&OBJECT_ID=' + objectId);
		});
	});
	
	//导出
	$('#exportAll').click(function () {
		var exportParams = {};
		var url = UI.control.getRemoteCallUrl("face/dispatchedAlarm/grouping/exportAlarm");
		var exportData = UI.control.getControlById('tabList').getListviewCheckData();
		if (exportData.length > 0) {
			exportParams.EXPORT_DATA = JSON.stringify(exportData);
			bigDataToDownload(url, "exportFrame", exportParams);
		} else {
			UI.util.alert('请选择导出数据', 'warn');
		}
	});
	
	//刷新按钮
	$("body").on("click", "#freshBtnAll", function () {
		doSearchList(true);
	});
	
	//身份核查
	$("body").on("click", ".verification-search", function () {
		// openWindowPopup('identity', $(this).attr("url"));
		var $this = $(this);
		var faceID = $this.attr('face-id'),
			deviceID = $this.attr('device-id'),
			captureTime = $this.attr('capture-time'),
			identityId = $this.attr('identity-id'),
			algoList = '[{-ALGO_TYPE-:-' + $this.attr('algo-id') + '-,-THRESHOLD-:-60-}]',
			imgUrl = $this.attr('url');
		var title = '身份核查',
			src = matcher('/efacecloud/page/technicalStation/verification.html/' + top.projectID).url,
			query = '?imgUrl=' + imgUrl + '&faceID=' + faceID + '&deviceID=' + deviceID + '&captureTime=' + captureTime + '&identityId=' + identityId + '&algoList=' + algoList

		if (UI.control.hasPermission('EFACE_faceVerificationArchive')) {
			src = '/efacestore/page/library/personnelFileMagList.html';
			query = '?imgUrL=' + imgUrl;
		}

		var params = {
			src: src + query,
			title: title,
			width: $(top.window).width() * .95,
			height: $(top.window).height() * .9,
			callback: function (obj) {

			}
		};
		UI.util.openCommonWindow(params);
	});
	
	//轨迹分析
	$("body").on("click", ".trajectory-searchAll", function () {
		if (isBlack) {
			var time = {
				bT: queryParamsList.BEGIN_TIME,
				eT: queryParamsList.END_TIME
			};
			var params = {
				src: "/efacecloud/page/technicalStation/tacticsFrame.html?pageType=track" + '&beginTime=' + time.bT + '&endTime=' + time.eT + '&noBackBtn=true&zjhm=' + $(this).attr('zjhm'),
				title: '轨迹分析',
				width: $(top.window).width() * .95,
				height: $(top.window).height() * .9,
				callback: function (obj) { }
			};
			UI.util.openCommonWindow(params);
		} else {
			var time = {
				bT: queryParamsList.BEGIN_TIME,
				eT: queryParamsList.END_TIME
			};
			openWindowPopup('track', $(this).attr("url"), time);
		}
	});
	
	//点击搜索事件
	$('body').on('click', '.searchBtnAll', function () {
		var imgurl = $(this).attr('fileUrl');
		var curSrc = matcher('/efacecloud/page/library/faceCaptureList.html/' + top.projectID).url;
		curSrc += "?imgSrc=" + imgurl + "&pageType=record";
		UI.util.showCommonWindow(curSrc, "路人检索", 1250, 650, function () { });
	});
	
	//布控详情
	$('body').on('click', '.controlDetailBtn', function () {
		var objId = $(this).attr("objectid");
		var opts = {
			src: '/efacesurveillance/page/faceControl/dispatchedApproval/controlApplyForm.html?pageTitle=布控详情&pageType=detail&funcType=6&objectId=' + objId + '&noFooter=' + true,
			title: '布控详情',
			width: $(top.window).width() * .95,
			height: $(top.window).height() * .9
		}
		parent.UI.util.openCommonWindow(opts);
	});
	
	//点击详情事件
	$('body').on('click', '.detailBtnAll', function () {
		var $this = $(this),
			isfs = $this.attr("isfs");

		var showIndex = 0;
		var _series = [];
		var parentBox = $this.parents('.tilelist');

		if (parentBox.length > 0) {
			// 计算当前按钮所在索引
			if (parentBox.find('[btn-order]').length > 0 && ($this.attr('btn-order') || $this.parent('.btn-order').attr('btn-order'))) { //已经自定义序号
				showIndex = parseInt($this.attr('btn-order') || $this.parent('.btn-order').attr('btn-order'));
			} else {
				// 为每个按钮添加 btn-order 属性
				parentBox.find('.detailBtnAll').each(function (index, item) {
					$(item).attr('btn-order', index);
				});

				showIndex = parseInt($this.attr('btn-order') || $this.parent('.btn-order').attr('btn-order'));
			}

			// 详情的query参数数组
			parentBox.find('.detailBtnAll').each(function (index, item) {
				_series.push(getAlarmDetailQuery($(item)));
			});
		}
		// 存到top.globalCache中
		top.globalCache.switchAlarmDetail = {
			series: _series.length > 0 ? _series : [url],
			showIndex: showIndex
		};
		// 当前的query参数
		var query = getAlarmDetailQuery($this);
		// query = '?OBJECT_ID=' + OBJECT_ID + '&curTime=' + curTime + '&ALARM_ID=' + ALARM_ID + '&level=' + level
		// 		+ '&alarmTime=' + alarmTime + '&alarmImg=' + alarmImg;
		if (_series.length != 1) {
			if (showIndex == 0) {
				query += '&switchBtn=next';
			} else if (showIndex == _series.length - 1) {
				query += '&switchBtn=prev';
			} else {
				query += '&switchBtn=both';
			}
		}
		// debugger
		
		query += '&pageType=sanfei';

		if (isfs == '1') {
			UI.util.showCommonWindow('/efacecloud/page/library/alarmDetails.html' + query, "告警详情", 1080, 680, function (obj) { });
		} else {
			UI.util.showCommonWindow('/efacecloud/page/library/alarmDetails.html' + query, "告警详情", 880, 510, function (obj) { });
		}
	});
	
	//点击图片展开详情
	$("body").off("click", ".compare-img").on("click", ".compare-img", function (e) {
		// debugger
		$(this).parent().find(".detailBtnAll").trigger('click');
		e.stopPropagation();
	});
	
	// 人脸1：1比对
	$('body').on('click', '.compareBtn', function () {
		var $compareImg = $(this).parents('.list-node-wrap').find('.compare-img');
		var img1 = $compareImg.find('img').eq(0).attr('src'),
			img2 = $compareImg.find('img').eq(1).attr('src');
		var params = {
			src: '/efacecloud/page/technicalStation/oneToOneCheck.html?tabSel=oneToOne&img1=' + img1 + '&img2=' + img2,
			title: '人脸1：1比对',
			width: $(top.window).width() * .95,
			height: $(top.window).height() * .9,
			callback: function (obj) { }
		};
		UI.util.openCommonWindow(params);
	});
	
	// 打开卡片重复的页面
	$('body').on('click', '.openRepeatAll', function () {
		// 当前检索时间
		var timeControl = 'jt';
		$('#timeTagList .tagsTime').each(function (index, item) {
			if ($(this).hasClass('active')) {
				timeControl = $(this).attr('time-control');
			}
		})
		var OBJECT_ID = $(this).attr('OBJECT_ID');
		var bT = queryParamsList.BEGIN_TIME;
		var eT = queryParamsList.END_TIME;
		var THRESHOLD = queryParamsList.THRESHOLD;
		var DEVICE_IDS = queryParamsList.DEVICE_IDS;
		var KEYWORDS = queryParamsList.KEYWORDS;
		var SORT = queryParamsList.SORT;
		var IS_ESCAPE_HIT = queryParamsList.IS_ESCAPE_HIT;
		var ALARM_TYPE = queryParamsList.ALARM_TYPE;
		var alarmLevel = queryParamsList.ALARM_LEVEL;
		var alarmHandle = queryParamsList.ALARM_HANDLE;
		var isCatch = queryParamsList.IS_CATCH;
		var url = '/efacecloud/page/alarm/alarmAllCardList.html?pageType=sanfei&OBJECT_ID=' + OBJECT_ID + '&BEGIN_TIME=' + bT + '&END_TIME=' + eT + '&timeControl=' + timeControl + '&THRESHOLD=' + THRESHOLD + '&DEVICE_IDS=' + DEVICE_IDS + '&KEYWORDS=' + KEYWORDS + '&SORT=' + SORT + '&IS_ESCAPE_HIT=' + IS_ESCAPE_HIT + '&ALARM_TYPE=' + ALARM_TYPE
			+ '&alarmLevel=' + alarmLevel + '&alarmHandle=' + alarmHandle + '&isCatch=' + isCatch;
		parent.UI.util.showCommonIframe('.frame-form-full', url);
	});
	
	UI.control.getControlById("tabList").bind("load", function () {
		if (UI.control.getDataById('tabList').TOTAL && !$('[config-control]').hasClass("hadRender")) {
			$("#alarmTotalAll").html(UI.control.getDataById('tabList').TOTAL);
			eightBtnSwitch();
		}
	})
}

//是否按照设备查询，回填。是否父页面调用
function fatherSearchDevice() {
    $('#deviceNames_1').html(deviceNameStr);
    $('#deviceNames_1').attr('title', deviceNameStr);
    $('#deviceNames_1').attr('orgcode', orgCodeStr);
    $('#orgCode_1').val(deviceIdStr);
    $('#orgCodeInt_1').val(deviceIdIntStr);

    addDrowdownDeviceList({
        deviceId: deviceIdStr,
        deviceName: deviceNameStr,
        deviceNameList: $("#deviceNameList"),
        dropdownListText: $(".dropdown-list-text")
    });
    // doSearch();
}

function doSearchList(flag) {
	if (UI.util.validateForm($('#thresholdValidateAll'))) {
		queryParamsList.THRESHOLD = $('.searchSimilarConAll').val();
		queryParamsList.pageNo = 1;
		queryParamsList.KEYWORDS = $('.searchCon').val();
		queryParamsList.DEVICE_IDS = $("#orgCode_1").val();
		queryParamsList.BEGIN_TIME = $('#beginTime').val();
		queryParamsList.END_TIME = $('#endTime').val();
		queryParamsList.isHistory = isHistory;
		queryParamsList.SORT = $('#sortListAll').attr('sortlistall')=='timeSort'?0:1;
		queryParamsList.IS_ESCAPE_HIT = $('#ztFilterAll').attr('ztFilterAll')||'';
		queryParamsList.IS_CATCH = $('#captureFilterAll').attr('captureFilterAll')||'';
		queryParamsList.ALARM_TYPE = $('#zfFilter').attr('zfFilter')||'';
		queryParamsList.ALARM_HANDLE = $('#alarmHandleAll').attr('alarmHandleAll')||'';
		queryParamsList.CHECK_IDENTITY_MSG = $('#matchType').attr('matchType')||'';
		queryParamsList.CONFIRM_STATUS = $('#confirmStatus').attr('confirmStatus')||'';
		if ((queryParamsList && !isBlack)||flag == true) {
			UI.control.getControlById("tabList").reloadData(null, queryParamsList);
		}
	}

}

function getactivitydata(data) {
    top.ACTIVITY_NAME = data.ACTIVITY_NAME;
    top.ACTIVITY_TIME = data.ACTIVITY_TIME;
    top.ACTIVITY_PLACE = data.ACTIVITY_PLACE;
    top.PURCHASER_NAME = data.PURCHASER_NAME;
    top.PURCHASER_SEAT_NO = data.PURCHASER_SEAT_NO;
}

//获取算法id，用于身份核查
function getAlgoID() {
	UI.control.remoteCall('face/common/getFaceAlgoType', { MENUID: 'EFACE_faceCapture' }, function (resp) {
		var data = resp.data;
		if (data && data.length) {
			algoID = data[0].ALGORITHM_ID;
		}
	});
}

function eightBtnSwitch(){
	var map={"applicationName":"efacecloud"};
	UI.control.remoteCall('platform/webapp/config/get', map, function(resp) {
		var jsonObj = resp.attrList;
		for (var i = 0; i < jsonObj.length; i++) {
			if (jsonObj[i].key == "FACEALARM_CARD_OPERATION") {
				var $btns = $('[config-control]');
				var arr = jsonObj[i].value.split(",");
				for (var a = 0; a < arr.length; a++) {
					if (JSON.parse(arr[a])) $('[config-control="' + (a + 1) + '"]').removeClass("hide").addClass("hadRender");
				}
			}
		}
	});
};

/**
 * 获取某项告警记录打开详情时url的query参数
 * @author yangzonghong
 * @version 2019-05-07
 * @param {Object} $dom 该项记录详情按钮的jquery dom对象
 * @returns 详情按钮对应的query参数
 */
function getAlarmDetailQuery($dom) {
	var ALARM_ID = $dom.attr('ALARM_ID'),
		level = $dom.attr("alarm-level"),
		OBJECT_ID = $dom.attr("objid"),
		isfs = $dom.attr("isfs"),
		alarmTime = $dom.attr("alarmtime"),
		curTime = $dom.attr("curtime"),
		alarmImg = $dom.attr('alarm-img');
	var query = '';
	if (isfs == '1') {
		var name = $dom.attr("name"),
			idCard = $dom.attr("idcard"),
			time = $dom.attr("time");
		query = '?OBJECT_ID=' + OBJECT_ID + '&curTime=' + curTime + '&isFly=1&ALARM_ID=' + ALARM_ID + '&level=' + level
			+ '&name=' + name + '&idCard=' + idCard + '&time=' + time + '&alarmTime=' + alarmTime + '&alarmImg=' + alarmImg;
	} else {
		query = '?OBJECT_ID=' + OBJECT_ID + '&curTime=' + curTime + '&ALARM_ID=' + ALARM_ID + '&level=' + level
			+ '&alarmTime=' + alarmTime + '&alarmImg=' + alarmImg;
	}
	if (confirmStatus) {
		query += '&confirmStatus=1';
	}
	return query;
}

//情报接口显隐开关。
function ElectronicArchivesSwitch() {
	var map = { "applicationName": "portal" };
	UI.control.remoteCall('platform/webapp/config/get', map, function (resp) {
		var jsonObj = resp.attrList;
		for (var i = 0; i < jsonObj.length; i++) {
			if (jsonObj[i].key == "MENU_COMPATIBLE_SEQUENCE" && jsonObj[i].value != "默认") {
				$("[window-control='person']").removeClass("hide");
			}
		}
	});
};