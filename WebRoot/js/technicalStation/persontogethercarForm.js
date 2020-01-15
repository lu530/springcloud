var taskStatus = UI.util.getUrlParam("taskStatus") || '';
var beginTime = $('#beginTime');
var	endTime = $('#endTime');
var fileUrl;
var uploaded = false;
var topMargin = false;
var imgRatio;
var imgUrl = UI.util.getUrlParam("imgUrl");
var sceShotParms = [];
var SAVE_LEFT_PARAM_DATA = {};
//var orgTreeOpts = {//初始化卡口下拉树
//		isShowFolder: true,
//		multiple: true,
//		dropdownWidth: '100%',
//		dropdowndefault: '请选择人脸抓拍机',
//		search: {
//			enable: true,              //是否启用搜索
//			searchTreeNode: true,				//搜索参数 key|value为文本框的ID
//			searchTextId: 'deviceNames',
//			ignoreEmptySearchText: true,
//			searchBtnId: 'searchs'
//		},
//		parentNodeRender: function(treeNode){
//			if(treeNode.IS_ROLE == 'false'){
//				treeNode.chkDisabled = true;
//			}
//			if(!treeNode.hasChildren){
//				treeNode =  $.extend(treeNode, {
//					text:'<span class="ico-passport-name">'+ treeNode.text+'</span>',
//					isParent:false,
//				});
//			}
//			return treeNode;
//		}	
//};

//查询参数
var queryParams = {};

//红名单搜索条件
var searchParam = {};

$(document).ready(function(){
	UI.control.init(["userInfo"]);
	getDeviceModule();  //定义在common中
	initTime();
	initEvents();
//	initTreeEvent('orgTree');
	/*initFaceDetectDropdowntree();*/
	topUploadPic();
	if (isRedList()) {
		parent.showRedListTask({searchType:3,elem:".redListWrap"});
	}
})

function judgePermission(){
	UI.control.initPermission();
	if(!UI.control.permissionDefaultHandle($("body").attr("menuId"))){
		return;
	}
}

function initEvents(){
	
	//返回菜单
	$('body').on('click','#backBtn',function(){
		if(taskStatus) {
			parent.parent.hideFrame();
		}else {
			parent.showMenu();
		}
	});
	
	//查询
	$('#searchBtn').click(function(){
//		handleDrawResult(curPoints);
		if(top.GET_TASK_LIST_DATA) {
			setSearchParam();
			return;
		}
		
		if($("#filterImg").attr("src") == "" || $("#filterImg").attr("src").slice(-10) == 'upload.png'){
			UI.util.alert('请上传比对人脸图片','warn');
			return ;
		}
		if($('#faceDetect').val() == ''){
			UI.util.alert('请选择区域或感知设备','warn');
			return ;
		}
		if (UI.util.validateForm($('.form-inline'), true)){
			setSearchParam();
		}
	});

	function setSearchParam() {
		var isScreenShot = false;
			if(sceShotParms && sceShotParms.length !=0){
				isScreenShot = true;
			}
			
			searchParam = {
					PIC:$("#filterImg").attr("src"),
					togetherMinute:$('#TOGETHER_MINUTE').val(),
					beginTime:$('#beginTime').val(),
					endTime:$('#endTime').val(),
					threshold:$('#THRESHOLD').val(),
					isScreenShot:isScreenShot,
					sceShotParms:sceShotParms,
					topN: $("#SEARCHNUM").val(),
					searchType:3
			}
			top.SAVE_LEFT_PARAM_DATA = searchParam
			
			//var cameraIds = $("#faceDetect").val();
			parent.cachedData.deviceIds = $("#faceDetect").val();
			parent.cachedData.deviceIdInt = $("#deviceIdInt").val();
			
			searchBeforeLogged(formSearch,searchParam);
	}
	
	//关闭
	$('body').on('click','#closeBtn',function(){
		top.clearMapTracks();
		top.rightMainFrameOut();
	});
	
	//删除图片
	$('body').on('click','[paint="delete"]',function (){
		top.rightMainFrameOut();
		fileUrl = '';
		$('#capPicImg').removeAttr('src');
		$('.upload-bg').removeClass('hide');
		$('.wrap-img').addClass('hide');
	});
	
	//清空按钮
	$('body').on('click','#removeBtn',function (){
		cleanEditorData();
	});
	
	//绘制按钮
	$('body').on('click','#reDrawRect',function (){
		if (uploaded) {
			$(".draw-picture").removeClass("hide");
			$("#drawMapping").width($("#capPicImg").width());
			$("#drawMapping").height($("#capPicImg").height());
			if (topMargin) {
				$("#drawMapping").css("margin-top",($(".ocx-wrap").height()-$("#capPicImg").height())/2);
			} else {
				$("#drawMapping").css("margin-top",0);
			}
			cleanEditorData();
			initEditor();
			editor.deleteAll();
			curMode = "rect";
			setMode(curMode);
		} else {
			
		}
	});
	
	//统一的通过卡口树加载设备事件
	/*$('body').on('click','[togglebtn="kktree"]',function(){
		//回填数据
		checkDrowDownDeviceList({
			deviceNames:$('#bayonetList').attr("devicename"),
			deviceId:$('#selectedBayonet').val(),
			deviceIdInt:$('#selectedDeviceIdInt').val(),
			orgCode:$("#bayonetList").attr("orgcode")
		});
		
        UI.util.showCommonWindow('/connectplus/page/device/deviceList.html?deviceType=194', '设备选择', 1000, 600,function(resp){
            initListData(resp);
        });
    });
	*/
	
	//删除已选设备
	$("body").on("click",".removeDeviceBtn",function(e){
		var $this = $(this);
		var deviceId = $this.attr("deviceid");
		var deviceIdArr = $('#faceDetect').val().split(",");
		var deviceIdIntArr = $('#deviceIdInt').val().split(",");
		var deviceNameArr = $('#deviceNames').html().split(",");
		var index = deviceIdArr.indexOf(deviceId),
			orgCode = $("#deviceNames").attr("orgcode"),
			orgCodeArr = orgCode.split(",");
		
		$this.parents("li").remove();
		deviceIdArr.splice(index,1);
		deviceIdIntArr.splice(index,1);
		deviceNameArr.splice(index,1);
		orgCodeArr.splice(index,1);
		$('#faceDetect').val(deviceIdArr.join(","));
		$('#deviceIdInt').val(deviceIdIntArr.join(","));
		$('#deviceNames').html(deviceNameArr.join(","));
		$('#deviceNames').attr("title",deviceNameArr.join(","));
		$('#deviceNames').attr("orgcode",orgCodeArr.join(","));
		if($("#deviceNameList li").length == 0){
			$(".dropdown-list-text").attr("data-toggle","");
			$(".dropdown-list-text .dropdown").addClass("hide");
			$(".dropdown-list").removeClass("open");
		}
		
		e.stopPropagation();
	});
	
	//通过卡口树加载设备
	$('#deviceNames').click(function(e){
		//回填数据
		checkDrowDownDeviceList({
			deviceNames:$('#deviceNames').html(),
			deviceId:$('#faceDetect').val(),
			deviceIdInt:$('#deviceIdInt').val(),
			orgCode:$("#deviceNames").attr("orgcode")
		});
		
		UI.util.showCommonWindow(deviceModule + '/page/device/deviceList.html?deviceType=194', '设备选择', 1000, 600,function(resp){
			$('#deviceNames').text(resp.deviceName);
			$('#deviceNames').attr('title',resp.deviceName);
			$('#deviceNames').attr('orgcode',resp.orgCode);
			$('#faceDetect').val(resp.deviceId);
			$('#deviceIdInt').val(resp.deviceIdInt);
			addDrowdownDeviceList({
				deviceId:resp.deviceId,
				deviceName:resp.deviceName,
				deviceNameList:$("#deviceNameList"),
				dropdownListText:$(".dropdown-list-text")
			});
		});
		e.stopPropagation();
	});
	
	     //删除图片
     $('body').on('click','#deleteImg',function (){
         fileUrl = '';
         $('#filterImg').attr('src', '/efacecloud/images/technicalStation-upload.png');
         $("#uploadImg").val("");
         $(this).parent('ul').siblings('input[foruploadform]').val("");
     });
	
	 var sliderT = $( "#sliderThreshold" ).slider({
	      range: "max",
	      min: 0,
	      max: 100,
	      value: 70,
	      slide: function( event, ui ) {
	        $( "#THRESHOLD" ).val( ui.value );
	      }
	    });
	    
	var sliderN = $( "#sliderNum" ).slider({
	      range: "max",
	      min: 0,
	      max: 200,
	      value: 100,
	      slide: function( event, ui ) {
	        $( "#SEARCHNUM" ).val( ui.value );
	      }
	    });
	
	$('#THRESHOLD').keyup(function() {  
        //数值范围为100以内
    	$(this).val($(this).val().replace(/[^0-9]+/,''));
    	if($(this).val() > 100){
    		$(this).val(100);
    	}
     	$('.ui-slider-horizontal .ui-slider-handle').css('transition','0.5s');
    	sliderT.slider( "value", $(this).val() );
     	setTimeout(function(){
     		$('.ui-slider-horizontal .ui-slider-handle').css('transition','0s');
     	},500)
    })
    $('#SEARCHNUM').keyup(function() {  
        //数值范围为100以内
    	$(this).val($(this).val().replace(/[^0-9]+/,''));
    	if($(this).val() > 200){
    		$(this).val(200);
    	}
     	$('.ui-slider-horizontal .ui-slider-handle').css('transition','0.5s');
    	sliderN.slider( "value", $(this).val() );;
     	setTimeout(function(){
     		$('.ui-slider-horizontal .ui-slider-handle').css('transition','0s');
     	},500)
	})

	if(taskStatus && taskStatus != 2){
		$("#searchBtn").addClass("hide");
	}
	
	//从任务列表查看
	if(top.GET_TASK_LIST_DATA){
		//条件回填
		var search = top.GET_TASK_LIST_DATA.search;
		$("#filterImg").attr("src", search.PIC);
		$("#beginTime").val(search.beginTime);
		$("#endTime").val(search.endTime);
		sliderT.slider( "value", search.threshold );
		$( "#THRESHOLD" ).val( search.threshold );
		sliderN.slider( "value", search.topN );
		$( "#SEARCHNUM" ).val( search.topN );
		var deviceName = "",orgCode = "",deviceId = "";
		$.each(search.DEVICE_IDS, function(index, el) {
			var str = "";
			if(index != search.DEVICE_IDS.length - 1){
				str = ",";
			}
			deviceName += el.DEVICE_NAME + str;
			orgCode += el.ORG_CODE + str;
			deviceId += el.DEVICE_ID + str;			
		});
		$('#deviceNames').text(deviceName);
		$('#deviceNames').attr('title',deviceName);
		$('#deviceNames').attr('orgcode',orgCode);
		$('#faceDetect').val(deviceId);
		$('#deviceIdInt').val("");
		addDrowdownDeviceList({
			deviceId:deviceId,
			deviceName:deviceName,
			deviceNameList:$("#deviceNameList"),
			dropdownListText:$(".dropdown-list-text")
		});
		//执行检索
		if(taskStatus == 2)$('#searchBtn').trigger("click");
	}

}

function formSearch(){
	/*var fileId = getNginxId(fileUrl);*/
	var fileId = 'fileId';
//	var cameraId = $('#faceDetect').val();
//	var cameraIds = [];
	/*var cIds = cameraId.split(",");
	for (var i=0; i<cIds.length; i++){
		if (cIds[i].length >= 20){
			cameraIds.push(cIds[i]);
		}
	}*/
	parent.UI.map.clearDraw();//清除地图框选
	parent.rightMainFrameIn('/efacecloud/page/technicalStation/trackFaceRightList.html?fileId='
			+ fileId + '&PIC='+ searchParam.PIC +  '&togetherMinute=' + searchParam.togetherMinute  + '&beginTime=' + searchParam.beginTime + '&endTime='+ searchParam.endTime 
			+ '&threshold='+searchParam.threshold+'&isScreenShot='+searchParam.isScreenShot+'&sceShotParms='+searchParam.sceShotParms + '&topN=' + searchParam.topN);
}

//初始化日期选择框
function initTime(){
	var	now = new Date();
	var maxTime = today = now.format("yyyy-MM-dd 23:59:59");
	beginTime.val(now.format("yyyy-MM-dd 00:00:00"));
	endTime.val(today);
	
	beginTime.focus(function(){
		WdatePicker({
			/*isShowClear:false,*/
			startDate:'%y-#{%M}-%d %H:%m:%s',
			dateFmt: 'yyyy-MM-dd HH:mm:ss',
			maxDate: today,
			// onpicked:function(){
			// 	var options = {
			// 			begin: beginTime.val(),
			// 			end: endTime.val(),
			// 			space: 10,
			// 			format: 'yyyy-MM-dd 23:59:59'
			// 		}
			// 	var result = UI.util.timeLinkage(options);
			// 	endTime.val(result.newDate);
			// 	if(result.isSpace){
			// 		 now = new Date();
			// 		 maxTime = now.format("yyyy-MM-dd 23:59:59");
			// 	}else{
			// 		maxTime = '#F{$dp.$D(\'beginTime\',{d:10})}';
			// 	}		    
			// }
		});
	});
	endTime.focus(function(){
		WdatePicker({
			/*isShowClear:false,*/
			startDate:'%y-#{%M}-%d 23:59:59',
			dateFmt:'yyyy-MM-dd HH:mm:ss',
			minDate:'#F{$dp.$D(\'beginTime\')}',
			maxDate: maxTime
		});
	});

}

//function ajaxFileUpload(fId){
//	var orgFileName = $('#'+fId).val();
//	var postfix = orgFileName.substring(orgFileName.indexOf('.')+1,orgFileName.length);
//	var upperCasePostFix = postfix.toLocaleUpperCase();
//	if(!(upperCasePostFix=='JPG' || upperCasePostFix=='BMP' || upperCasePostFix=='PNG')){
//		UI.util.alert(postfix+'文件不是支持的文件类型！目前仅支持JPG/BMP/PNG文件','warn');
//		return ;
//	}
//	var baseUrl = '/oss/v1/cloudsearch/face/';
//	var finalUrl = '';
//	UI.util.showLoadingPanel();
//	$.ajaxFileUpload( {
//		url : baseUrl,
//		type : 'post',
//		secureuri : false,
//		fileElementId : fId,
//		dataType : 'text',
//		data : {
//			'FILE_TYPE' : 'picture'
//		},
//		success : function(data, status) {
//			data = eval("(" + data + ")");
//			if (data && !data.error) {
//				var fileId = data.id;
//				fileId = fileId.substring(0, fileId.indexOf('.'))
//				finalUrl = baseUrl + fileId;
//				fileUrl = finalUrl;
//				$('#capPicImg').attr('src', fileUrl);
//				initImg($(".ocx-wrap"),fileUrl);
//				$('.upload-bg').addClass('hide');
//				$('.imgUplaod').removeClass('hide');
//				$(".wrap-img").removeClass("hide");
//				$(".ocx-wrap").removeClass("hide");
//				uploaded = true;
//				editor.deleteAll();
//			} else {
//				UI.util.alert("上传失败！",'warn');
//			}
//			UI.util.hideLoadingPanel();
//		},
//		error : function(data, status, e) {
//			UI.util.debug(data);
//			UI.util.debug(status);
//			UI.util.hideLoadingPanel();
//			UI.util.alert("上传失败！",'warn');
//		}
//	});
//}

function initImg($canvas,$img) {
	var img = new Image();
	img.src = $img;
	img.onload = function() {
		imgWidth = img.width;
		imgHeight = img.height;
		canvasWidth = $canvas.width();
		canvasHeight = $canvas.height();
		if ((imgWidth/imgHeight) > (canvasWidth/canvasHeight)) {
			$("#capPicImg").attr("style","width: 100%;height: auto;margin: auto 0;");
			$("#capPicImg").css("margin-top",(canvasHeight-$("#capPicImg").height())/2);
			imgRatio = $("#capPicImg").width()/imgWidth;
			topMargin = true;
			UI.util.debug("imgRatio:"+imgRatio);
		} else {
			$("#capPicImg").attr("style","height: 100%;width: auto;margin: 0 auto;");
			imgRatio = $("#capPicImg").width()/imgWidth;
			topMargin = false;
			UI.util.debug("imgRatio:"+imgRatio);
		}
	}

}
