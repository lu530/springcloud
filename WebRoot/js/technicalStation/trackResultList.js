var fileId = UI.util.getUrlParam('fileId');
var beginTime = UI.util.getUrlParam('beginTime');
var endTime = UI.util.getUrlParam('endTime');
var cameraIds = parent.cachedData.deviceIds||'';
var deviceIdInt = parent.cachedData.deviceIdInt||'';
var pageType = UI.util.getUrlParam("pageType");              // 判断页面的类型
var threshold = UI.util.getUrlParam('threshold');           // 阈值
var number = UI.util.getUrlParam('number'); 
var isScreenShot = UI.util.getUrlParam('isScreenShot');     //是否用截图比对
var sceShotParms = UI.util.getUrlParam('sceShotParms');     //截图参数
var togetherMinute = UI.util.getUrlParam('togetherMinute'); //同行分钟数

var iframeType = UI.util.getUrlParam("iframeType")||'';//判断页面的弹窗方式

var searchParams={
		BEGIN_TIME:beginTime,
		END_TIME:endTime,
		PIC:fileId,
		THRESHOLD:threshold,
		TOP_N:number,
		DEVICE_IDS:cameraIds,
		DEVICE_IDS_INT:deviceIdInt
		
}

var similarData = "";  //模拟数据

var trackArr = [];//人脸轨迹数组
var serviceUrl = 'technicalTactics/personFollow/query';
var logParam = {};
var operateName = '人像云追踪';   //操作行为名称，用作记录日志


$(document).ready(function(){
	initEvents();
	pageTopFixed();
	initData();
	initWaterMark();
	//  顺德项目不显示wifi碰撞
	if(top.projectID !== 'shunde5000') {
		$('#wifiCollisionBtn').removeClass('hide');
	}
});
function doScroll(){
	window.aTime = $('.day-block');
	window.circleTop = $('.circle-top');
	window.aTop = [];
	for(var i=0; i<aTime.length; i++){
		aTop.push(aTime.eq(i).offset().top);
	};
	window.onscroll = function (){
		var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;

		var index = findLatePos(scrollTop + 53 ,aTop);
		if(index != -1){
			for(var i=0; i<aTop.length; i++){
				aTime.eq(i).removeClass('px');
				circleTop.eq(i).addClass('hide').removeClass('px');
			};
			circleTop.eq(index).removeClass('hide').addClass('px')
			aTime.eq(index).addClass('px');
		}else{
			aTime.eq(0).removeClass('px');
			circleTop.eq(0).removeClass('hide').removeClass('px');
		}
						
	};
};
function findLatePos(n,arr){
	var len = arr.length;
	for(var i=0; i<len; i++){
		if(n>=arr[i]){
			if(n<arr[i+1] || i == len-1){
				return i;
			};			
		};
	};
	return -1;
};

//若有截图操作则先创建截图
function creatScreenShot() {
	var params = {};
	params.sceShotParms = sceShotParms;
	params.fileId = fileId;
	UI.control.remoteCall('cs/portraitComparison/creatScreenShot', params, function(resp) {
		fileId = resp.ret;
		fileId = fileId.substring(0, fileId.lastIndexOf('.'));
	});
}

function initEvents(){
	//全选
	$("#checkAll").click(function(){
		var checked = $(this).prop("checked");
		if($("#similar").hasClass("active")){//相似度排序
			if(checked){
				$('.library-info .list-node').addClass("active");
			}else{
				$('.library-info .list-node').removeClass("active");
			}
			$('.library-info .query-checkbox').prop("checked",checked);
		}else if($('#time').hasClass("active")){//时间排序
			$('.people-list .query-checkbox').prop("checked",checked);
		}else if($('#place').hasClass("active")){  //地点排序 
			$('.place-list .query-checkbox').prop("checked",checked);
		}
		
		if(checked){
			$("#trajectoryGeneBtn,#wifiCollisionBtn").removeClass("disabled");
		}else{
			$("#trajectoryGeneBtn,#wifiCollisionBtn").addClass("disabled");
		}
	});

	//轨迹分析
    $("body").on("click",".trajectory-search",function(){
        openWindowPopup('track',$(this).attr("url"));
    });
    //身份核查
    $("body").on("click",".verification-search",function(){
        openWindowPopup('identity',$(this).attr("url"));
    });

	//checkbox
    $("body").on('click','.list-node .lb-elm input',function(event){
        if($(this).is(":checked")){
            $(this).parent().parent().addClass("active");
        }else{
            $(this).parent().parent().removeClass("active");
        }
        if($(".query-checkbox:checked").length>1){
        	$("#trajectoryGeneBtn,#wifiCollisionBtn").removeClass("disabled");
        }else{
        	$("#trajectoryGeneBtn,#wifiCollisionBtn").addClass("disabled");
        }
        
        if($(".list-node:visible").length == $(".query-checkbox:checked").length || $(".people-list .query-checkbox").length == $(".query-checkbox:checked").length){
        	$("#checkAll").prop("checked",true);
        }else{
        	$("#checkAll").prop("checked",false);
        }
        event.stopPropagation();
    });

    $("body").on('click','.list-node',function(){
        var $input = $(this).find(".lb-elm >input");
        if($input.length){
            if($input.is(":checked")){
                $(this).removeClass("active");
                $input.attr("checked",false);
            }else{
                $(this).addClass("active");
                $input.attr("checked","checked");
            }
            if($(".query-checkbox:checked").length>1){
            	$("#trajectoryGeneBtn,#wifiCollisionBtn").removeClass("disabled");
            }else{
            	$("#trajectoryGeneBtn,#wifiCollisionBtn").addClass("disabled");
            }
            
            if($(".list-node:visible").length == $(".query-checkbox:checked").length || $(".people-list .query-checkbox").length == $(".query-checkbox:checked").length){
            	$("#checkAll").prop("checked",true);
            }else{
            	$("#checkAll").prop("checked",false);
            }
        }
    });
	
	//点击列表项的详细按钮
	$('body').on('click','.more-icon',function(){
		var url = $(this).closest('.list-node').find('img')[0].src;
		var curSrc = matcher('/efacecloud/page/library/faceCaptureList.html/' + top.projectID).url;
		curSrc += '?imgSrc='+url;
		top.UI.util.openCommonWindow({
			src: curSrc,
			title: '人脸抓拍库',
			windowType: 'right',
			parentFrame: 'currentPage',
			width: '1250px'
		});
	})
	
	//关闭
	$('body').on('click','#closeBtn',function(){
		parent.rightMainFrameOut();
	});
	
	if( pageType == 'multiple'){
		$('.page-head').html('多重轨迹查询列表');
		$('.tool-bar').addClass('hide');
		$('.tool-bar.multiple').removeClass('hide');
		operateName = '多轨并查';
	}else if( pageType == 'gangs' ){
		$('.page-head').html('请确认目标人脸');
		$('.tool-bar').addClass('hide');
		$('.tool-bar.gangs').removeClass('hide');
		operateName = '团伙分析';
	}
	
	$('#relativeMACbtn').click(function(){
		var param = getOptionIdsParam('wifideviceids');
		if(param != ''){
			showForm('/efacecloud/page/technicalStation/relationMACList.html?type=MAC&checkQuery='+param);
		}
	});
	
	$('#relativeDOORbtn').click(function(){
		var param = getOptionIdsParam('doordeviceids');
		if(param != ''){
			showForm('/efacecloud/page/technicalStation/relationMACList.html?type=DOOR&checkQuery='+param);
		}
	});
	
	$('#relativeCARbtn').click(function(){
		var param = getOptionIdsParam('cardeviceids');
		if(param != ''){
			showForm('/efacecloud/page/technicalStation/relationMACList.html?type=CAR&checkQuery='+param);
		}
	});
	
	$('#relativeIMEIbtn').click(function(){
		var param = getOptionIdsParam('efencedeviceids');
		if(param != ''){
			showForm('/efacecloud/page/technicalStation/relationPHONEList.html?type=IMEI&checkQuery='+param);
		}
	});
	
	$('#relativeIMSIbtn').click(function(){
		var param = getOptionIdsParam('efencedeviceids');
		if(param != ''){
			showForm('/efacecloud/page/technicalStation/relationPHONEList.html?type=IMSI&checkQuery='+param);
		}
	});
	
	$('#relativePERSONbtn').click(function(){
		showForm('/efacecloud/page/technicalStation/searchPersonList.html');
	});
	
	///同行人员-生成轨迹
	$('#generatingLocusBtn').click(function(){
		if(!parent.window.frames['mainFrameContent'].setFieldValue()){
			UI.util.alert('请输入正确的条件','warn');
			return false;
		}
		if(getFaceTrackInfoList()){
			parent.window.frames['mainFrameContent'].showForm('/efacecloud/page/technicalStation/multiPathQueryCheckForm.html');
			parent.window.frames['mainFrameContent'].showMultiTracksOnMap("faceTrack", trackArr, "face");
			top.rightMainFrameOut();
		}
	});
	
	//人像追踪-生成轨迹
	$('#trajectoryGeneBtn').click(function(){
		if(getFaceTrackInfoList()){
		
			trackArr.sort(function(a,b){   //按时间排序
				return a.TIME - b.TIME;
			})
		
			/*parent.window.frames['leftFrameCon'].trackData = trackArr;
			parent.window.frames['leftFrameCon'].showForm('/efacecloud/page/technicalStation/persontogetherResultList.html?type=faceTrack');*/
			
			parent.trackData = trackArr;
			
			//parent.window.frames['mainFrameContent'].showTracksOnMap(trackArr);
			//showTracksOnMap(trackArr);
			
			parent.showLeftResult('/efacecloud/page/technicalStation/persontogetherResultList.html');
			parent.rightMainFrameOut('hide');
		}
	});
	
	//同行人分析
	$('#gangsAnalysisBtn').click(function() {
		var param = {};
		var inputCheck = $('.gangs-checkbox:checked'),
			objArr = [];

		if (inputCheck.length < 1) {
			UI.util.alert('请勾选需要分析的数据！', 'warn');
			return '';
		}
		
		for (var i = 0; i < inputCheck.length; i++) {
			var index = $(inputCheck[i]).attr("index");
			var d = index.split('-');
			var obj = {};
			obj.CAPTURE_TIME = data[d[0]].list[d[1]].list[d[2]].TIME;
			obj.ORIGINAL_DEVICE_ID = data[d[0]].list[d[1]].list[d[2]].ORIGINAL_DEVICE_ID;
			objArr.push(obj);
		}
		
		if (inputCheck.length < 2) {
			UI.util.alert('生成轨迹至少勾选两条记录！', 'warn');
			return false;
		}
		
		var _arr = [];
		for (var i = 0; i < inputCheck.length; i++) {
			var index = $(inputCheck[i]).attr("index");
			var d = index.split('-');
	    	var obj = {};
	    	obj.ORIGINAL_DEVICE_ID = data[d[0]].list[d[1]].list[d[2]].ORIGINAL_DEVICE_ID;
	    	obj.DEVICE_NAME = data[d[0]].list[d[1]].list[d[2]].DEVICE_NAME;
	    	obj.OBJ_PIC = renderVendorImage(data[d[0]].list[d[1]].list[d[2]].vd, data[d[0]].list[d[1]].list[d[2]].capture_image_id);
	    	obj.X = data[d[0]].list[d[1]].list[d[2]].X;
	    	obj.Y = data[d[0]].list[d[1]].list[d[2]].Y;
	    	obj.TIME = data[d[0]].list[d[1]].list[d[2]].TIME;
	    	_arr.push(obj);
		}
		
		param.list = objArr;
		//parent.window.frames['mainFrameContent'].showMultiTracksOnMap("faceTrack", _arr, "face");
		//showForm('/cloudsearch/page/technicalStation/persontogetherRightList.html?recordId='+JSON.stringify(objArr));
		showForm('/efacecloud/page/technicalStation/persontogethercarQueryResult.html?recordId='+JSON.stringify(param)+"&togetherMinute=" + togetherMinute);
	});
	
	//checkbox
	$("body").on('click','.list-node .lb-elm input',function(event){
		if($(this).is(":checked")){
			$(this).parent().parent().addClass("active");
		}else{
			$(this).parent().parent().removeClass("active");
		}
		event.stopPropagation();
	});
	
	$("body").on('click','.list-node',function(){
		var $input = $(this).children(".lb-elm").find("input");
		if($input.length){
			if($input.is(":checked")){
				$(this).removeClass("active");
				$input.attr("checked",false);
			}else{
				$(this).addClass("active");
				$input.attr("checked","checked");
			}
		}
	});
	
	$("body").on('click','.search-video',function(){
		var time = $(this).attr("time");
		var deviceId = $(this).attr("deviceId");
		var beginTime = getLimitSec(time, -30);
		var endTime = getLimitSec(time, 30);
		var openUrl = "http://"+window.location.host+"/connectplus/page/common/videoRecordWindowCache.html?" +
				"videoIds="+deviceId+"&beginTime="+beginTime+"&endTime="+endTime+"&btnType=1";
		UI.util.showCommonWindow(openUrl, "抓拍历史视频", 960, 650, function(){});
		
		/*UI.control.remoteCall("cs/portraitTracking/getPlayUrl", {
			deviceId: deviceId
		}, function (resp){
			var result = resp.result;
			var beginTime = getLimitTime(time, -1);
			var endTime = getLimitTime(time, 1);
			var videoFlag = result.DEVICE_CODE;
			var videoName = result.DEVICE_NAME;
			var openUrl = "http://"+window.location.host+"/videoexplorer/page/servies/videoRecordWindow.html?videoFlag="+videoFlag
				+"&videoName="+videoName+"&beginTime="+beginTime+"&endTime="+endTime;
			UI.util.showCommonWindow(openUrl, "抓拍历史视频", 960, 650, function(){
				
			});
		});*/
	});
	
	$('body').on('dblclick','.node-img img',function(){
		var $this = $(this);
		var src = $this.attr('src');
		top.showPictureZoom( src,true);
	});
	
	//切换按钮样式
	$('.left-bar span').click(function(){
		$(this).addClass('active');
		$(this).siblings('span').removeClass('active');
	})
	
	//切换排序
	$('#time').click(function(){
		$('.library-info').hide();
		$('.placeList').hide();
		$('.personList').show();
		if($(this).hasClass('active')){
			return ;
		}
		$("#trajectoryGeneBtn,#wifiCollisionBtn").addClass("disabled");
		$("#checkAll").prop("checked",false);
		$(".query-checkbox").prop("checked",false);
		$(this).addClass('active').siblings().removeClass('active');
		
	})
	$('#similar').click(function(){
		$('.personList').hide();
		$('.placeList').hide();
		$('.library-info').show();
		if($(this).hasClass('active')){
			return ;
		}
		$(this).addClass('active').siblings().removeClass('active');
		
		$("#checkAll").prop("checked",false);
		$(".query-checkbox").prop("checked",false);
		$(".library-info .list-node").removeClass("active");
		$("#trajectoryGeneBtn,#wifiCollisionBtn").addClass("disabled");
	})

	tranPanel ();
	
	$('#place').click(function(){
		$('.library-info').hide();
		$('.personList').hide();
		$('.placeList').show();
		if($(this).hasClass('active')){
			return;
		}
		$(this).addClass('active').siblings().removeClass('active');
	
		$("#checkAll").prop("checked",false);
		$(".query-checkbox").prop("checked",false);
		$(".library-info .list-node").removeClass("active");
		$("#trajectoryGeneBtn,#wifiCollisionBtn").addClass("disabled");
		
	});
	
	/************************ wifi碰撞 start ************************/
	//wifi碰撞展示列表
	$("#wifiCollisionBtn").click(function(){
		if($(this).hasClass("disabled")){
			UI.util.alert('生成轨迹至少勾选两条记录！', 'warn');
			return false;
		}
		initWifiCollision();
	});
	
	//wifi关闭列表
	$("#removeWifiListBtn").click(function(){
		$(".mac-list").removeClass("show");
	});
	
	//地点展开收起
	$("body").on("click",".mac-title",function(){
		var $this = $(this),
			$macContent = $this.next(),
			$icon = $this.find(".detail-times span");
		if($macContent.hasClass("hide")){
			$macContent.removeClass("hide");
			$icon.attr("class","icon-arrow-down8");
		}else{
			$macContent.addClass("hide");
			$icon.attr("class","icon-arrow-up7");
		}
	});
	
	/************************* wifi碰撞 end ***********************/
}

var index = 0;

function getSelectTrackData(){
	var result = [];
	var inputCheck = $('.query-checkbox:checked');
	for (var i = 0; i < inputCheck.length; i++) {
		var index = $(inputCheck[i]).attr("index");
		var d = index.split('-');
		result.push(data[d[0]].list[d[1]].list[d[2]]);
	}
	return result;
}

function getFaceTrackInfoList(){
	if($('#time').is('.active') || $('#place').is('.active')){
		var inputCheck = $('.query-checkbox:checked');
	}
	
	else{
		var inputCheck = $('.list-node.active').find('.query-checkbox');
	}

	if (inputCheck.length < 2) {
		UI.util.alert('生成轨迹至少勾选两条记录！', 'warn');
		return false;
	}
	trackArr = [];
	for (var i = 0; i < inputCheck.length; i++) {
    	var obj = {};
    	obj.ORIGINAL_DEVICE_ID = $(inputCheck[i]).attr("device_id");
    	obj.DEVICE_NAME = $(inputCheck[i]).attr("device_name");
    	obj.OBJ_PIC = $(inputCheck[i]).attr("obj_pic");
    	obj.X = $(inputCheck[i]).attr("x");
    	obj.Y = $(inputCheck[i]).attr("y");
    	
    	//obj.TIME = $(inputCheck[i]).attr("time");
    	//obj.jgsj = formatTimestamp(obj.TIME);
    	obj.jgsj = $(inputCheck[i]).attr("jgsk");
    	obj.TIME = standardTimeToStamp(obj.jgsj); //地图使用,毫秒时间戳
    	trackArr.push(obj);
	}
	
	return true;
}

function showForm(url) {
	$("#frameFormFull").attr("src", url);
	$(".frame-form-full").show();
	$("#wrapBody").hide();
}

function hideForm() {
	$("#frameFormFull").attr("src", "");
	$(".frame-form-full").hide();
	$("#wrapBody").show();
}

var data = [];

function dayTimeFormat(time){
	return time.split('-');
}

function formatScore(score){
	var sscore = score+'';
	if(sscore.indexOf('.') > 0){
		return sscore.split('.')[0];
	}
	return sscore;
}

function getOptionIdsParam(type){
	var param = {};
	var inputCheck = $('.query-checkbox:checked'),
		objArr = [];

	if (inputCheck.length < 1) {
		UI.util.alert('请勾选需要碰撞的数据！', 'warn');
		return '';
	}
	var flag = (type == 'doordeviceids');
	for (var i = 0; i < inputCheck.length; i++) {
    	var obj = {};
    	obj.capture_device_id = $(inputCheck[i]).attr(type);
    	if(obj.capture_device_id != ''){
    		var capture_time = $(inputCheck[i]).attr('real-time');
    		if(flag){
    			//var time = newDateAndTime(capture_time);
        		//time.setDate(time.getDate()-7);
        		//capture_time = time.format("yyyy-MM-dd HH:mm:ss");
    		}
    		obj.capture_time = capture_time;
        	objArr.push(obj);
    	}
	}
	
	if(objArr.length == 0){
		UI.util.alert('没有查询到可碰撞的设备！', 'warn');
		return '';
	}
	
	param.list = objArr;
	return JSON.stringify(param);
}

function initData(){
	
	UI.util.showLoadingPanel('');
	UI.control.remoteCall(serviceUrl, searchParams, function (resp){
		var data = resp.DATA;
		if(data.length>0){
			var sortArr = [];
			for(var  i=0;i<data.length;i++){
				for(var j=0;j<data[i].LIST.length;j++){
					for(var k=0, obj=data[i].LIST[j].LIST;k<obj.length;k++){
						obj[k].PLACE = data[i].LIST[j].PLACE;
						obj[k].index = i+'-'+j+'-'+k;
						sortArr.push(obj[k]);
					}
					data[i].LIST[j].LIST.sort(sortByTime); //按时间排序
				}
			}
			data.sort(sortByDateTime); //按日期排序
			sortArr.sort(sortNumber);
			$(".personList").html(tmpl('personTmpl', data)); 
			$(".tilelist").html(tmpl('personTmplP',sortArr));
			$(".placeList").html(tmpl('personPlaceTmpl',resp.PALCE));
		}else{
			UI.util.alert('没有查询到结果！','warn');
		}
		UI.util.hideLoadingPanel();
	},function(data, status, e) {
		UI.util.hideLoadingPanel();
	}, {
		async : true
	})
}
function sortNumber(a, b){
    return b.SCORE - a.SCORE
}
function sortByTime(a, b){
	return Date.parse(new Date(b.TIME.replace(/-/g,'/'))) - Date.parse(new Date(a.TIME.replace(/-/g,'/')));
}
function sortByDateTime(a, b){
	var astr = a.DATE_TIME;
	astr = astr.replace(/-/g,"/");
	astr += ' 00:00:00';
	var adate = new Date(astr);
	
	var bstr = b.DATE_TIME;
	bstr = bstr.replace(/-/g,"/");
	bstr += ' 00:00:00';
	var bdate = new Date(bstr);
	var a = adate - bdate
	return -a;
}

//人脸与wifi碰撞
function initWifiCollision(){
	var curDeviceList = getWifiList();
	var params = {
			PARAMS:curDeviceList,
			SORT_TYPE:"date"
	}
	UI.util.showLoadingPanel();
	UI.control.remoteCall("collision/face/wifi", params, function (resp){
		var data = resp.data;
		if(data.code == 0){
			if(data.record.length>0){
				$(".mac-list-detail").html(tmpl('wifiTmpl', data.record)); 
			}else{
				$(".mac-list-detail").html('<div class="nodata"></div>');
			}
			if(data.collisionRet.length>0){
				$(".list-result-con").html(tmpl('wifiResultTmpl', data.collisionRet)); 
			}else{
				$(".list-result-con").html('<div class="nodata"></div>');
			}
			$(".mac-list").addClass("show");
		}else{
			UI.util.alert('没有查询到结果！','warn');
		}
		UI.util.hideLoadingPanel();
	},function(data, status, e) {
		UI.util.hideLoadingPanel();
	}, {
		async : true
	});
}

//获取wifi碰撞设备
function getWifiList(){
	var wifiListArr = [];
	if($('#time').is('.active') || $('#place').is('.active')){
		var inputCheck = $('.query-checkbox:checked');
	}
	
	else{
		var inputCheck = $('.list-node.active').find('.query-checkbox');
	}

	for (var i = 0; i < inputCheck.length; i++) {
    	var obj = {};
    	obj.DEVICE_ID = $(inputCheck[i]).attr("device_id");
    	obj.TIME = $(inputCheck[i]).attr("jgsk");
    	wifiListArr.push(obj);
	}
	return JSON.stringify(wifiListArr);
}

// 切换面板
function tranPanel () {

	var whiteList = {
		'longli': 'similar'
	}
	if('undefined' !== typeof whiteList[top.projectID]) {
		$('#' + whiteList[top.projectID]).click();
	}else{
		$('#time').click();
	}
}