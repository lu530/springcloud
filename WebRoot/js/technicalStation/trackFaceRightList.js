var fileId = UI.util.getUrlParam('fileId');
var beginTime = UI.util.getUrlParam('beginTime');
var endTime = UI.util.getUrlParam('endTime');
var cameraIds = parent.cachedData.deviceIds||'';
var deviceIdInt = parent.cachedData.deviceIdInt||'';
var pic = UI.util.getUrlParam('PIC');
var pageType = UI.util.getUrlParam("pageType");// 判断页面的类型
var threshold = UI.util.getUrlParam('threshold');// 阈值
var isScreenShot = UI.util.getUrlParam('isScreenShot');  //是否用截图比对
var sceShotParms = UI.util.getUrlParam('sceShotParms');  //截图参数
var togetherMinute = UI.util.getUrlParam('togetherMinute');  //同行分钟数
var topN = UI.util.getUrlParam('topN');  //同行分钟数
var recordId = "";
var gangsThreshold = "80";
var faceScore = '65';
var infoIds = "";
var trackArr = [];//人脸轨迹数组
//var serviceUrl = 'person/follow/query';
var serviceUrl = 'technicalTactics/personFollow/query';

$(document).ready(function(){
	initEvents();
	pageTopFixed();
	initWaterMark();
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
	// 轨迹查看
	$('#gjSearch').click(function(){
		var trackData = [];
		if(!$(this).hasClass("disabled")){
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
				var _data = data[d[0]].LIST[d[1]].LIST[d[2]];
				trackData.push(_data);
			}
			
			if (inputCheck.length < 2) {
				UI.util.alert('至少勾选两条记录！', 'warn');
				return false;
			}
			// 数据处理: 按照时间正序排列
			trackData = trackData.sort(function(item1, item2){
				return new Date(item1.TIME).getTime() - new Date(item2.TIME).getTime();
			})
			var curData = [];
			console.log(trackData)
			$.each(trackData,function(i,n){
				var obj = {};
				obj = n;
				obj.X = n.X;
				obj.Y = n.Y;
				obj.TIME = n.TIME;
				obj.jgsj = n.TIME;
				curData.push(obj);
			});
			parent.showLeftResult('/efacecloud/page/technicalStation/persontogetherResultList.html');
			parent.rightMainFrameOut('hide');
			trackArr = curData;
		}
		
	})
	//全选
	$("#checkAll").click(function(){
		var checked = $(this).prop("checked");
		
		$('.people-list .gangs-checkbox').prop("checked",checked);
		
		if(checked){
			$("#gangsAnalysisBtn").removeClass("disabled");
			$('#gjSearch').removeClass("disabled");
		}else{
			$("#gangsAnalysisBtn").addClass("disabled");
			$('#gjSearch').addClass("disabled");
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

	//关闭
	$('body').on('click','#closeBtn',function(){
		parent.rightMainFrameOut();
	});
	
	if(fileId && beginTime && endTime && threshold){
		
		if(isScreenShot == 'true'){
			creatScreenShot();
		}
		
		UI.util.showLoadingPanel('');
		doCollision();
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
	/*$('#generatingLocusBtn').click(function(){
		if(!parent.window.frames['mainFrameContent'].setFieldValue()){
			UI.util.alert('请输入正确的条件','warn');
			return false;
		}
		if(getFaceTrackInfoList()){
			parent.window.frames['mainFrameContent'].showForm('/efacecloud/page/technicalStation/multiPathQueryCheckForm.html');
			parent.window.frames['mainFrameContent'].showMultiTracksOnMap("faceTrack", trackArr, "face");
			top.rightMainFrameOut();
		}
	});*/
	
	//同行人员-生成轨迹
	$('#generatingLocusBtn').click(function(){
		
		var param = {};
		var inputCheck = $('.gangs-checkbox:checked'),
			objArr = [];
		
		if (inputCheck.length < 2) {
			UI.util.alert('生成轨迹至少勾选两条记录！', 'warn');
			return false;
		}
		
		var objArr = [];
		for (var i = 0; i < inputCheck.length; i++) {
			var index = $(inputCheck[i]).attr("index");
			var d = index.split('-');
	    	var obj = {};
	    	obj.ORIGINAL_DEVICE_ID = data[d[0]].LIST[d[1]].LIST[d[2]].ORIGINAL_DEVICE_ID;
	    	obj.DEVICE_NAME = data[d[0]].LIST[d[1]].LIST[d[2]].DEVICE_NAME;
	    	//obj.OBJ_PIC = renderVendorImage(data[d[0]].list[d[1]].list[d[2]].vd, data[d[0]].list[d[1]].list[d[2]].capture_image_id);
	    	obj.OBJ_PIC = data[d[0]].LIST[d[1]].LIST[d[2]].OBJ_PIC;
	    	obj.X = data[d[0]].LIST[d[1]].LIST[d[2]].X;
	    	obj.Y = data[d[0]].LIST[d[1]].LIST[d[2]].Y;
	    	obj.TIME = data[d[0]].LIST[d[1]].LIST[d[2]].TIME;

	    	objArr.push(obj);
		}
		
		param.list = objArr;
		
		parent.window.frames['leftFrameContent'].showForm('/efacecloud/page/technicalStation/multiPathQueryCheckForm.html?faceTracks='+JSON.stringify(objArr));
		//parent.window.frames['mainFrameContent'].showMultiTracksOnMap("faceTrack", objArr, "face");		
		//parent.window.frames['mainFrameContent'].showTracksOnMap(objArr,"face");
		top.rightMainFrameOut();
		
	
		
	});
	
	//人像追踪-生成轨迹
	/*$('#trajectoryGeneBtn').click(function(){
		if(getFaceTrackInfoList()){
		}
		parent.window.frames['mainFrameContent'].showForm('/efacecloud/page/technicalStation/persontogetherResultList.html');
		//parent.window.frames['mainFrameContent2'].initData(getSelectTrackData());
		parent.window.frames['mainFrameContent'].showTracksOnMap(trackArr);
		top.rightMainFrameOut('hide');
	});*/
	
		//同行人分析
	$('#gangsAnalysisBtn').click(function() {
		
		if(!$(this).hasClass("disabled")){
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
				obj.CAPTURE_TIME = data[d[0]].LIST[d[1]].LIST[d[2]].TIME;
				obj.ORIGINAL_DEVICE_ID = data[d[0]].LIST[d[1]].LIST[d[2]].ORIGINAL_DEVICE_ID;
				objArr.push(obj);
				if(i==0){
		 			infoIds = data[d[0]].LIST[d[1]].LIST[d[2]].INFO_ID;
		 		}else{
		 			infoIds +=","+data[d[0]].LIST[d[1]].LIST[d[2]].INFO_ID;
		 		}
			}
			
			if (inputCheck.length < 2) {
				UI.util.alert('至少勾选两条记录！', 'warn');
				return false;
			}
			
			param.LIST = objArr;
			recordId = JSON.stringify(param);
			
			UI.util.showCommonWindow("/efacecloud/page/technicalStation/thresholdForm.html", "阈值设置", 451, 250,function(resp){
				
	//			var _arr = [];
	//			for (var i = 0; i < inputCheck.length; i++) {
	//				var index = $(inputCheck[i]).attr("index");
	//				var d = index.split('-');
	//		    	var obj = {};
	//		    	obj.ORIGINAL_DEVICE_ID = data[d[0]].LIST[d[1]].LIST[d[2]].ORIGINAL_DEVICE_ID;
	//		    	obj.DEVICE_NAME = data[d[0]].LIST[d[1]].LIST[d[2]].DEVICE_NAME;
	//		    	obj.OBJ_PIC = renderVendorImage(data[d[0]].LIST[d[1]].LIST[d[2]].vd, data[d[0]].LIST[d[1]].LIST[d[2]].capture_image_id);
	//		    	obj.X = data[d[0]].LIST[d[1]].LIST[d[2]].X;
	//		    	obj.Y = data[d[0]].LIST[d[1]].LIST[d[2]].Y;
	//		    	obj.TIME = data[d[0]].LIST[d[1]].LIST[d[2]].TIME;
	//		    	_arr.push(obj);
	//			}
				
				gangsThreshold = resp.THRESHOLD;
				faceScore = resp.FACESCORE;
				//parent.window.frames['mainFrameContent'].showMultiTracksOnMap("faceTrack", _arr, "face");
				//showForm('/cloudsearch/page/technicalStation/persontogetherRightList.html?recordId='+JSON.stringify(objArr));
				showForm('/efacecloud/page/technicalStation/persontogethercarQueryResult.html');
			});
		}
	});
	
	//checkbox
	$("body").on('click','.list-node .lb-elm input',function(event){
		if($(this).is(":checked")){
			$(this).parent().parent().addClass("active");
		}else{
			$(this).parent().parent().removeClass("active");
		}
		if($(".gangs-checkbox:checked").length>1){
        	$("#gangsAnalysisBtn").removeClass("disabled");
        	$('#gjSearch').removeClass("disabled");
        }else{
        	$("#gangsAnalysisBtn").addClass("disabled");
        	$('#gjSearch').addClass("disabled");
        }
		
		if($(".people-list .gangs-checkbox").length == $(".gangs-checkbox:checked").length){
        	$("#checkAll").prop("checked",true);
        }else{
        	$("#checkAll").prop("checked",false);
        }
		event.stopPropagation();
	});
	
	$("body").on('click','.list-node',function(){
		var $input = $(this).find(".lb-elm input");
		if($input.length){
			if($input.is(":checked")){
				$(this).removeClass("active");
				$input.attr("checked",false);
			}else{
				$(this).addClass("active");
				$input.attr("checked","checked");
			}
			if($(".gangs-checkbox:checked").length>1){
	        	$("#gangsAnalysisBtn").removeClass("disabled");
	        	$('#gjSearch').removeClass("disabled");
	        }else{
	        	$("#gangsAnalysisBtn").addClass("disabled");
	        	$('#gjSearch').addClass("disabled");
	        }
			
			if($(".people-list .gangs-checkbox").length == $(".gangs-checkbox:checked").length){
            	$("#checkAll").prop("checked",true);
            }else{
            	$("#checkAll").prop("checked",false);
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
		
	});
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
	//var inputCheck = $('.query-checkbox:checked');
	var inputCheck = $('.gangs-checkbox:checked');

	if (inputCheck.length < 2) {
		UI.util.alert('生成轨迹至少勾选两条记录！', 'warn');
		return false;
	}
	trackArr = [];
	for (var i = 0; i < inputCheck.length; i++) {
    	var obj = {};
    	obj.ORIGINAL_DEVICE_ID = "1";
    	obj.DEVICE_NAME = $(inputCheck[i]).attr("device_name");
    	obj.OBJ_PIC = $(inputCheck[i]).attr("obj_pic");
    	obj.X = $(inputCheck[i]).attr("x");
    	obj.Y = $(inputCheck[i]).attr("y");
    	obj.TIME = $(inputCheck[i]).attr("time");
    	obj.jgsj = formatTimestamp(obj.TIME);
    	
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
function doCollision(){
	var params = {};
//	params.imgId = fileId;
//	params.beginTime = beginTime;
//	params.endTime = endTime;
//	params.cameraIds = cameraIds;
//	params.THRESHOLD = threshold;
	params.PIC = pic;
	params.BEGIN_TIME = beginTime;
	params.END_TIME = endTime;
	params.DEVICE_IDS = cameraIds;
	params.THRESHOLD = threshold;	
	params.TOP_N = topN;
	params.TOGETHER_MINUTE = togetherMinute;
	params.DEVICE_IDS_INT = deviceIdInt;
	
	UI.control.remoteCall(serviceUrl, params, function (resp){
//		resp.data = resp.DATA;
//		
//		resp.dateTime = resp.DATA.DATE_TIME;
//		resp.data.list = resp.data.LIST;
//		resp.data.list.list = resp.data.list.List;
		
		
		if(resp.DATA){
			if(resp.DATA.length == 0){
				UI.util.alert('暂无查询结果！');
			}
			resp.DATA.sort(function (a,b){
				var astr = a.DATE_TIME;
				astr = astr.replace(/-/g,"/");
				astr += ' 00:00:00';
				var adate = new Date(astr);
				
				var bstr = b.DATE_TIME;
				bstr = bstr.replace(/-/g,"/");
				bstr += ' 00:00:00';
				var bdate = new Date(bstr );
				var a = adate - bdate
				return -a;
			});
			UI.util.debug(resp.DATA);
			$(".people-list").append(
					tmpl('personTmpl', resp.DATA));
			data = resp.DATA;
			$("[attrimg='zoom']").lazyload({
				threshold : 200,
				container: $("#wrapBody")
			});
			doScroll();

		}
		UI.util.hideLoadingPanel();
	}, function(data, status, e) {
		$('#backBtn').click();
		UI.util.hideLoadingPanel();
	}, {},true);
}

//2012-03-12
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

function pageTopFixed(){
	var h = $('.list-wrap').offset().top;
	$(window).scroll(function(){
	    var sh=$(this).scrollTop();//获得滚动条距top的高度
	    if(sh>h){
	        $(".list-wrap").addClass('fixed-top');
	    }else{
	    	$(".list-wrap").removeClass('fixed-top');
	    }
	});
}