// 人员告警重复卡片列表
var OBJECT_ID = UI.util.getUrlParam("OBJECT_ID") || '';
var BEGIN_TIME =  UI.util.getUrlParam("BEGIN_TIME") || '';
var END_TIME = UI.util.getUrlParam("END_TIME") || '';
var timeControl = UI.util.getUrlParam("timeControl") || '';
var THRESHOLD = UI.util.getUrlParam("THRESHOLD") || '';
var DEVICE_IDS = UI.util.getUrlParam("DEVICE_IDS") || '';
var KEYWORDS = UI.util.getUrlParam("KEYWORDS") || '';
var SORT = parseInt(UI.util.getUrlParam("SORT")) || 0;
var IS_ESCAPE_HIT = UI.util.getUrlParam("IS_ESCAPE_HIT") || '';
var ALARM_TYPE = UI.util.getUrlParam("ALARM_TYPE") || '';
var alarmLevel = UI.util.getUrlParam("alarmLevel") || '';
var alarmHandle = UI.util.getUrlParam("alarmHandle") || '';
var fromAlarmCard = UI.util.getUrlParam("from") || '';
var isCatch = UI.util.getUrlParam("isCatch") || '';
var confirmStatus = UI.util.getUrlParam("confirmStatus") || '';
var pageType = UI.util.getUrlParam("pageType") || '';
var MULIT_ALGO_TYPE = UI.util.getUrlParam("MULIT_ALGO_TYPE") || '';
var today = UI.util.getDateTime("today", "yyyy-MM-dd");
var todayTime = UI.util.getDateTime("today", "yyyy-MM-dd HH:mm:ss");
var dateDesc = today;
var trackData = null;  // 轨迹分析数据

var timeOption = {
	'elem': $('#timeTagList'),
	'beginTime': $('#beginTime'),
	'endTime': $('#endTime'),
	'callback':doSearchByTime
};

var queryParams = {
		isAsync: true,
		OBJECT_ID: OBJECT_ID,
		BEGIN_TIME: BEGIN_TIME,
		END_TIME: END_TIME,
		KEYWORDS: KEYWORDS,
		DEVICE_IDS: DEVICE_IDS,
		THRESHOLD: THRESHOLD,
		SORT:parseInt(SORT),
		isHistory: 0,
		ALARM_TYPE: ALARM_TYPE,
		IS_ESCAPE_HIT: IS_ESCAPE_HIT,
		ALARM_LEVEL:alarmLevel,
		ALARM_HANDLE:alarmHandle,
		IS_CATCH:isCatch
}

var isBlack = isBlack();

if(isBlack){
	window.getAlgoList = slideFn('face/common/getFaceAlgoType', {MENUID:'EFACE_faceCapture'},function(data){
		global.algoNumSnList = data;
	});
	if(MULIT_ALGO_TYPE){
		queryParams.MULIT_ALGO_TYPE = MULIT_ALGO_TYPE;
	}
}
$(function(){
	if(pageType == 'sanfei'){
		$('#cardList').attr('ui-service','face/dispatchedAlarm/illegalForeignerAlarm');
		$('#colorTags').parents('.filter-bar').addClass('hide');
	}else if(isBlack){
		$('#arithmetic').removeClass('hide');
	}
	if(isBlack){
		$('.zdyTimeBtn').addClass('hide');
		if(MULIT_ALGO_TYPE){
			var curAlgoList = MULIT_ALGO_TYPE.split(',');
			if(curAlgoList.length != $('.arithmetic-item').length-1){
				$('.arithmetic-tools').removeClass('on');
				for(var i=0;i<curAlgoList.length;i++){
					$('.arithmetic-tools[algo_type="'+curAlgoList[i]+'"]').addClass('on');
				}
			}
		}
	}
	UI.control.init();
	compatibleIndexOf();
	initDateTimeControl(timeOption);
	initEvent();
})
 
function initEvent(){
	// 告警时间 默认选中项
	$("[time-control='"+timeControl+"']").addClass('active').siblings().removeClass('active');
	if(timeControl=="zdy"){
		$("#beginTime").parents(".opera-group").addClass("active");
		$('#beginTime').val(BEGIN_TIME);
		$('#endTime').val(END_TIME);
	}
	// 是否已抓捕  默认选中项
	$("#captureFilter .tagItem[value='"+isCatch+"']").addClass('active').siblings().removeClass('active');
	// 告警确认状态
	$("#confirmStatus .tagItem[value='"+confirmStatus+"']").addClass('active').siblings().removeClass('active');
	//回填处置状态和告警等级
	$("#alarmHandle .tagItem[value='"+alarmHandle+"']").addClass('active').siblings().removeClass('active');
	$("#colorTags li").removeClass("active");
	$.each(alarmLevel.split(","),function(index,item){
		$("#colorTags li[val='"+item+"']").addClass('active');
	});
	//从布控库人脸页面进入
	if(fromAlarmCard){
		$(".hasReturn").addClass("hide");
		$('.tagsTime[time-control="nM"]').click();
	}
	
	//点击搜索事件
	$('body').on('click', '.searchBtn', function() {
		var imgurl = $(this).attr('fileUrl');
		var curSrc = matcher('/efacecloud/page/library/faceCaptureList.html/' + top.projectID).url;
		curSrc += "?imgSrc=" + imgurl + "&pageType=record";
		UI.util.showCommonWindow(curSrc, "路人检索", 1250, 650, function() {});
	});
	
	//身份核查
	$("body").on("click", ".verification-search", function() {
		// openWindowPopup('identity', $(this).attr("url"));
		var $this = $(this);
		var faceID = $this.attr('face-id'),
		 	deviceID = $this.attr('device-id'),
		 	captureTime = $this.attr('capture-time'),
		 	identityId = $this.attr('identity-id'),
			checkName = $this.attr('checkName') || "",
		 	algoList = '[{-ALGO_TYPE-:-' + $this.attr('algo-id') + '-,-THRESHOLD-:-60-}]',
			imgUrl = $this.attr('url');
		var title = '身份核查',
			src = matcher('/efacecloud/page/technicalStation/verification.html/' + top.projectID).url,
			query = '?imgUrl=' + imgUrl + '&faceID=' + faceID + '&deviceID=' + deviceID + '&captureTime=' 
				+ captureTime + '&identityId=' + identityId + '&algoList=' + algoList +"&checkName="+checkName;
		
		if(UI.control.hasPermission('EFACE_faceVerificationArchive')){
			src =  '/efacestore/page/library/personnelFileMagList.html';
			query = '?imgUrL=' + imgUrl;
		}
		
		var params = { 
			src: src + query,
			title: title,
			width: $(top.window).width()*.95,
			height: $(top.window).height()*.9,
			callback: function(obj){

			}
        };
		UI.util.openCommonWindow(params);
	});
	
	//返回
	$('#backBtn').click(function() {
		parent.UI.util.hideCommonIframe('.frame-form-full');
	})
	
	//点击详情事件
	$('body').on('click', '.detailBtn', function() {
		var $this = $(this),
			ALARM_ID = $this.attr('ALARM_ID'),
			level = $this.attr("alarm-level"),
			name = $this.attr("name"),
			idCard = $this.attr("idcard"),
			time = $this.attr("time"),
			objectId = $this.attr("objid"),
			curTime = $this.attr("curtime");
			alarmTime = $this.attr("alarmtime"),
		UI.util.showCommonWindow('/efacecloud/page/library/alarmDetails.html?OBJECT_ID='+objectId+'&curTime='+curTime+'&isFly=1&ALARM_ID=' + ALARM_ID + '&level=' + level
				+ '&name=' + name+ '&idCard=' + idCard+ '&time=' + time +'&alarmTime='+alarmTime, "告警详情",
			1080, 730,
			function(obj) {});
	});
	
	//布控详情
	$('body').on('click', '.controlDetailBtn', function() {
		var objId = $(this).attr("objectid");
		var opts = {
				src: '/efacesurveillance/page/faceControl/dispatchedApproval/controlApplyForm.html?pageTitle=布控详情&pageType=detail&funcType=6&objectId='+objId+'&noFooter='+true,
				title: '布控详情',
				width:$(top.window).width()*.95,
				height: $(top.window).height()*.9
		}
		parent.UI.util.openCommonWindow(opts);
	});
	
	//轨迹分析
	$("body").on("click", ".trajectory-search", function() {
		var time = {
	        	bT: queryParams.BEGIN_TIME,
	        	eT: queryParams.END_TIME
	        };
		openWindowPopup('track', $(this).attr("url"),time);
	});
	
	//图片放大
	$("body").on("click","[compareimg]",function(){
		var $this = $(this),
			curImg = $this.attr("compareimg"),
			url = $this.attr("src");
		
		switch(curImg){
			case 'captureZoom':
				var options = {
					isSlide: false,
					series:[url]
				}
				break;
			case 'controlZoom':
				var src = $this.parent().parent().find('[compareimg="captureZoom"]').attr("src");
				//双图
				var options = {
					isCompare: true,
					baseImg: src,//左边的图片
					isMessage: false,
					isSlide: false,
					series: [{'src':url,'show':true}]
			    }
				break;
			case 'flyZoom':
				var src = $this.parent().parent().find('[compareimg="captureZoom"]').attr("src");
				//双图
				var options = {
					isCompare: true,
					baseImg: src,//左边的图片
					isMessage: false,
					isSlide: false,
					series: [{'src':url,'show':true}]
			    }
				break;
		}
		
		top.$.photoZoom(options);
		
	});
	
	//处置状态
	$("#alarmHandle .tagItem").click(function(){
		var $this = $(this);
		var val = $this.attr('value');
		$this.addClass('active').siblings().removeClass('active');
		queryParams.ALARM_HANDLE = val;
		doSearchList();
	});
	
	//是否已抓捕
	$("#captureFilter .tagItem").click(function(){
		var $this = $(this);
		var val = $this.attr('value');
		$this.addClass('active').siblings().removeClass('active');
		queryParams.IS_CATCH = val;
		doSearchList();
	});

    //告警确认状态
    $("#confirmStatus .tagItem").click(function(){
        var $this = $(this);
        var val = $this.attr('value');
        $this.addClass('active').siblings().removeClass('active');
        queryParams.CONFIRM_STATUS = val;
        doSearchList();
    });

	//告警等级
	$("#colorTags li").click(function(){
		var $this = $(this);
		var curVal = $this.parent().attr("curval");
		if(curVal){
			var valArr = curVal.split(",");
		}else{
			var valArr = [];
		}
		if($this.hasClass("tag-item")){
			$this.addClass('active').siblings().removeClass('active');
			valArr = [];
		}else{
			$this.parent().find(".tag-item").removeClass("active");
			var val = $this.attr("val");
			if($this.hasClass("active")){
				$this.removeClass("active");
				var index = valArr.indexOf(val);
				if(index >=0){
					valArr.splice(index,1);
				}
			}else{
				$this.addClass("active");
				valArr.push(val);
			}
		}
		queryParams.ALARM_LEVEL = valArr.join(",");
		$this.parent().attr("curval",valArr.join(","));
		doSearchList();
	});

	// 轨迹查看
	$('#gjSearch').on('click', function() {
		trackData = UI.control.getControlById('cardList').getListviewCheckData();
		if (!trackData.length) {
			UI.util.alert("请勾选轨迹查看数据!","warn");
			return;
		}
		// 数据处理: 按照时间正序排列
		trackData = trackData.sort(function(item1, item2){
			return new Date(item1.ALARM_TIME).getTime() - new Date(item2.ALARM_TIME).getTime();
		})

		$.each(trackData, function(i, n){
			trackData[i].X = n.LONGITUDE;
			trackData[i].Y = n.LATITUDE;
			trackData[i].TIME = n.ALARM_TIME;
			trackData[i].jgsj = n.ALARM_TIME;
			trackData[i].OBJ_PIC = n.ALARM_IMG;
		});
		
		var pageUrl = '/efacecloud/page/technicalStation/tacticsFrame.html?pageType=trackResult&getDataType=trackResult';
		UI.util.showCommonIframe('.frame-form-full', pageUrl);
	});
	
	//确定按钮
	$('#confirmAllSearch').click(function(){
		doSearchList(true);
	});
}

//飞识告警查询
function doSearchByTime(dateTime){
	queryParams.BEGIN_TIME = dateTime.bT;
	queryParams.END_TIME = dateTime.eT;
	doSearchList();
}
//飞识告警查询
function doSearchList(flag) {
	queryParams.pageNo = 1;
	queryParams.isHistory = 0;
	if((queryParams&& !isBlack)||flag == true) {
		if(isBlack){
			var queryAlgoListArr = getAlgoList();
			var curAlgoListArr = [];
			for(var i=0;i<queryAlgoListArr.length;i++){
				curAlgoListArr.push(queryAlgoListArr[i].ALGO_TYPE);
			}
			queryParams.MULIT_ALGO_TYPE = curAlgoListArr.join(',');
		}
		UI.control.getControlById("cardList").reloadData(null, queryParams);
	}
	
}
function renderTagColor(text){
	var tagClass = '';
	switch(text){
	case '已签收':
		tagClass = 'sign-color';
		break;
	case '已反馈':
		tagClass = 'feedback-color';
		break;
	case '已下发':
		tagClass = 'issued-color';
		break;
	}
	return tagClass;
}

//显示使用算法和全部算法
function renderAlgo(algoObj){
	//var algoStr = '{"80003":"60","10003":"80"}';
	if(algoObj){
		var	algoList = global.algoNumSnList,
		html = '';
		
		for(var i=0;i<algoList.length;i++){
			var curAlgoId = algoList[i].ALGORITHM_ID;
			if(algoObj[curAlgoId]){
				html += '<span class="alg-tag-item active"><span>'+algoList[i].ALGORITHM_NAME+'</span><span class="alg-tag-score">'+algoObj[curAlgoId]+'</span></span>';
			}else{
				html += '<span class="alg-tag-item"><span>'+algoList[i].ALGORITHM_NAME+'</span></span>';
			}
		}
		return html;
	}
}