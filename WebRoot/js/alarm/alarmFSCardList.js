// 人员告警重复卡片列表
var OBJECT_ID = UI.util.getUrlParam("OBJECT_ID") || '';
var BEGIN_TIME =  UI.util.getUrlParam("BEGIN_TIME") || '';
var END_TIME = UI.util.getUrlParam("END_TIME") || '';
var timeControl = UI.util.getUrlParam("timeControl") || '';
var KEYWORDS = UI.util.getUrlParam("KEYWORDS") || '';
var DEVICE_IDS = UI.util.getUrlParam("DEVICE_IDS") || '';
var AlGORITHM_ID = UI.util.getUrlParam("AlGORITHM_ID") || '';
var DB_ID = UI.util.getUrlParam("DB_ID") || '';
var SORT = parseInt(UI.util.getUrlParam("SORT")) || 0;
var IS_ESCAPE_HIT = UI.util.getUrlParam("IS_ESCAPE_HIT") || '';
var THRESHOLD = UI.util.getUrlParam("THRESHOLD") || '';
var alarmLevel = UI.util.getUrlParam("alarmLevel") || '';
var alarmHandle = UI.util.getUrlParam("alarmHandle") || '';
var isCatch = UI.util.getUrlParam("isCatch") || '';
var today = UI.util.getDateTime("today", "BEGIN_TIME-MM-dd");
var todayTime = UI.util.getDateTime("today", "yyyy-MM-dd HH:mm:ss");
var dateDesc = today;


var timeOption = {
	'elem': $('#timeTagList'),
	'beginTime': $('#beginTime'),
	'endTime': $('#endTime'),
	'callback': doSearchByTime
};

var queryParams = {
		KEYWORDS: KEYWORDS,
		BEGIN_TIME: BEGIN_TIME,
		END_TIME: END_TIME,
		DEVICE_IDS: DEVICE_IDS,
		pageNo:1,
		AlGORITHM_ID:AlGORITHM_ID,
		DB_ID:DB_ID,
		SORT:SORT,
		IS_ESCAPE_HIT: IS_ESCAPE_HIT,
		OBJECT_ID: OBJECT_ID,
		THRESHOLD: THRESHOLD,
		isAsync: true,
		ALARM_LEVEL:alarmLevel,
		ALARM_HANDLE:alarmHandle,
		IS_CATCH:isCatch
}
$(function(){
	UI.control.init();
	compatibleIndexOf();
	initDateTimeControl(timeOption);
	initEvent();
})

function initEvent(){
	
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

	
	// 告警时间 默认选中项
	$("[time-control='"+timeControl+"']").addClass('active').siblings().removeClass('active');
	if(timeControl=="zdy"){
		$("#beginTime").parents(".opera-group").addClass("active");
		$('#beginTime').val(BEGIN_TIME);
		$('#endTime').val(END_TIME);
	}
	// 是否已抓捕  默认选中项
	$("#captureFilter .tagItem[value='"+isCatch+"']").addClass('active').siblings().removeClass('active');
	//回填处置状态和告警等级
	$("#alarmHandle .tagItem[value='"+alarmHandle+"']").addClass('active').siblings().removeClass('active');
	$("#colorTags li").removeClass("active");
	$.each(alarmLevel.split(","),function(index,item){
		$("#colorTags li[val='"+item+"']").addClass('active');
	});
	
	
	//点击搜索事件
	$('body').on('click', '.searchBtn', function() {
		var imgurl = $(this).attr('fileUrl');
		var curSrc = matcher('/efacecloud/page/library/faceCaptureList.html/' + top.projectID).url;
		curSrc += "?imgSrc=" + imgurl + "&pageType=record";
		UI.util.showCommonWindow(curSrc, "路人检索", $(top.window).width()*.95, $(top.window).height()*.9, function(obj){  });
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
			objectId = $this.attr("objectid"),
			curTime = $this.attr("curtime");
			alarmTime = $this.attr("alarmtime"),
		UI.util.showCommonWindow('/efacecloud/page/library/alarmDetails.html?OBJECT_ID='+objectId+'&curTime='+curTime+'&isFly=1&ALARM_ID=' + ALARM_ID + '&level=' + level
				+ '&name=' + name+ '&idCard=' + idCard+ '&time=' + time +'&alarmTime='+alarmTime, "告警详情",
			1080, 640,
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
		
		var parentBox = $this.parents('.listviewImgBox');
		var _baseImgArr = [], 
			baseImgSeries=[],
			controlZoomSeries=[],
			flyZoomSeries = [],
			showIndex = 0;
		var $baseImg = $('body').find('[compareimg="captureZoom"]'),
			$controlImg = $('body').find('[compareimg="controlZoom"]'),
			$flyImg = $('body').find('[compareimg="flyZoom"]');
		
		// 给每个卡片加索引
		if(parentBox.find('[pic-order]').length >0){ //已经自定义序号
			showIndex = parseInt($this.parents('.imgOrder').attr('pic-order'));
		}else{
			// 为每个列表添加 listview-item 属性
			parentBox.find(".imgOrder").each(function(index,item){
				$(this).attr('pic-order',index);
			});
			showIndex = parseInt($this.parents('.imgOrder').attr('pic-order'));
		}
		
		$baseImg.each(function(index,item){
			baseImgSeries.push({
				'src': $(this).attr("src"),
				'mess': renderPicMsg(parentBox,index)
			});
			_baseImgArr.push($(this).attr("src"));
		})
		
		
		switch(curImg){
			case 'captureZoom':
				/*var options = {
					isSlide: false,
					series:[url]
				}*/
				var options = {
						isSlide: false,
						series: baseImgSeries,
						showIndex: showIndex,
						isMessage: true,
						isListView: true
				}
				break;
			case 'controlZoom':
				var src = $this.parent().parent().find('[compareimg="captureZoom"]').attr("src");
				//双图
				/*var options = {
					isCompare: true,
					baseImg: src,//左边的图片
					isMessage: false,
					isSlide: false,
					series: [{'src':url,'show':true}]
			    }*/
				$controlImg.each(function(index,item){
					controlZoomSeries.push({
						'src': $(this).attr("src"),
						'mess': renderPicMsg(parentBox,index)
					})
				})
				var options = {
					isCompare: true,
					isMessage: false,
					isSlide: false,
					isListView: true,
					series: controlZoomSeries,
					baseImg: _baseImgArr,
					showIndex: showIndex,
					isMessage: true
				}
				break;
			case 'flyZoom':
				var src = $this.parent().parent().find('[compareimg="captureZoom"]').attr("src");
				//双图
				/*var options = {
					isCompare: true,
					baseImg: src,//左边的图片
					isMessage: false,
					isSlide: false,
					series: [{'src':url,'show':true}]
			    }*/
				$flyImg.each(function(index,item){
					flyZoomSeries.push({
						'src': $(this).attr("src"),
						'mess': renderPicMsg(parentBox,index)
					})
				})
				var options = {
					isCompare: true,
					isMessage: false,
					isSlide: false,
					isListView: true,
					series: flyZoomSeries,
					baseImg: _baseImgArr,
					showIndex: showIndex,
					isMessage: true
				}
				break;
		}
		
		top.$.photoZoom(options);
		
	});
}
//飞识告警查询
function doSearchByTime(dateTime){
	queryParams.BEGIN_TIME = dateTime.bT;
	queryParams.END_TIME = dateTime.eT;
	doSearchList();
}
function doSearchList() {
	queryParams.pageNo = 1;
	if(queryParams) {
		UI.control.getControlById("cardList").reloadData(null, queryParams);
	}
}

//布控库查询
function doSearchByDb(dbIdList) {
	queryParams.DB_ID = dbIdList.join(",");
	doSearchList();
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