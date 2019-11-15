var beginTime = $('#beginTime');
var	endTime = $('#endTime');
var fileUrl;
var uploaded = false;
var topMargin = false;
var imgRatio;
var pageType = UI.util.getUrlParam("pageType");//判断页面的类型
var imgUrl = UI.util.getUrlParam("imgUrl");
var sceShotParms = [];

//查询参数
var queryParams = {};

//红名单搜索条件
var searchParam = {};

$(document).ready(function(){
	/*UI.control.init(["userInfo"]);*/
	UI.control.init();
	getDeviceModule();  //定义在common中
	/*judgePermission();*/
	initEvents();
	initTime();
/*	initorgTreeCodeDropdowntree();*/
	/*getNginxConfig();*/
	topUploadPic();
	if (isRedList()) {
		parent.showRedListTask({searchType:2,elem:".redListWrap"});
	}
})

function judgePermission(){
	UI.control.initPermission();
	if(!UI.control.permissionDefaultHandle($("body").attr("menuId"))){
		return;
	}
}

function initEvents(){
	
    if(parent.cachedData && !parent.cachedData.noBackBtn){
		$(".form-con.form-silde").css('top','46px');
        $(".page-list-head").show();
    }
	
	//返回菜单
	$('body').on('click','#backBtn',function(){
		var backPageType = parent.backPageType;
		if(backPageType){
			switch (backPageType){
				case 'faceCaptureList':
					var curSrc = matcher('/efacecloud/page/library/faceCaptureList.html/' + top.projectID).url;
					top.goUrl( '#home' ,curSrc,'fullFrame');
					break;
				case 'faceCollection':
					top.goUrl( '#home' ,'/efacecloud/page/technicalStation/faceCollection.html','fullFrame');
					break;
			}
		}else{
			parent.showMenu();
		}
	});
	
	if(imgUrl){
		fileUrl = imgUrl;
		uploaded = true;
		$('#filterImg').attr('src', imgUrl);
		$('.upload-bg').addClass('hide');
	}
	
	/*setTimeout(function(){
		$('#showKKTree').click();
	},750);*/
	
	/*//上传图片
	$("body").on('change','#photo5',function(){
		uploadSinglePic($(this).attr("id"), function (xhr,str){
			var fileResp = JSON.parse(xhr.responseText);
			UI.util.debug(fileResp);
			
			var picUrl = nginxPrefix + fileResp.id;
			$('#capPicImg').attr('src', picUrl);
			initImg($(".ocx-wrap"),picUrl);
			$('.upload-bg').addClass('hide');
			$('.imgUplaod').removeClass('hide');
			$("#faceImage").attr('src', picUrl);
			$(".wrap-img").removeClass("hide");
			$(".ocx-wrap").removeClass("hide");
			uploaded = true;
			
			fileUrl =picUrl;

//			editor.deleteAll();
		});
	});*/
	
	//查询
	$('#searchBtn').click(function(){
//		handleDrawResult(curPoints);
		
	    if($('#filterImg')[0].src.slice(-10)!="upload.png"){
	    	fileUrl = $('#filterImg')[0].src
	    }
		
		if(!fileUrl || '' == fileUrl){
			UI.util.alert('请上传比对人脸图片','warn');
			return ;
		}
		if('' == $('#faceDetect').val()){
			UI.util.alert('请选择感知设备','warn');
			return ;
		}
		if (UI.util.validateForm($('.form-inline'), true)){
			//检索案件录入
			var isScreenShot = false;
			if(sceShotParms && sceShotParms.length !=0){
				isScreenShot = true;
			}
			
			searchParam = {
					PIC:fileUrl,
					beginTime:$('#beginTime').val(),
					endTime:$('#endTime').val(),
					number: $('#SEARCHNUM').val(),
					pageType:pageType,
					threshold:$('#THRESHOLD').val(),
					isScreenShot:isScreenShot,
					sceShotParms:sceShotParms,
					searchType:2
			}
			
//			var cameraId = $('#faceDetect').val();
			
			/*if(isOpenSearchCause()){*/
				searchBeforeLogged(formSearch,searchParam,true);
			/*}else{
				formSearch();
			}*/
		}
	});
	
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
		editor = null;
		$("#videoMapping").find("svg").remove().removeAttr("style");
		$("#photo5").val("");
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
	})
	
	     //删除图片
     $('body').on('click','#deleteImg',function (){
         fileUrl = '';
         $('#filterImg').attr('src', '/efacecloud/images/technicalStation-upload.png');
         $("#uploadImg").val("");
         $(this).parent('ul').siblings('input[foruploadform]').val("");
     });
	
	//初始化滑块事件
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
	
	
}

function formSearch(){
	//parent.SuntekMap.getMap().clear();//清除地图框选
	parent.UI.map.clearDraw();//清除地图框选
	
	parent.cachedData.deviceIdInt = $('#deviceIdInt').val();
	parent.cachedData.deviceIds = $('#faceDetect').val();
	
	parent.rightMainFrameIn('/efacecloud/page/technicalStation/trackResultList.html?fileId='
			+ searchParam.PIC + '&beginTime=' + searchParam.beginTime + '&endTime='+ searchParam.endTime+ '&number='+ searchParam.number  
			+ '&pageType=' + searchParam.pageType + '&threshold='+searchParam.threshold+'&isScreenShot='+searchParam.isScreenShot+'&sceShotParms='+searchParam.sceShotParms);
}

//初始化日期选择框
function initTime(){
	var	now = new Date();
    var maxTime , endTime = '';
    maxTime = endTime = now.format("yyyy-MM-dd 23:59:59");
    if(parent.cachedData && parent.cachedData.endTime.length>0){
    	$('#endTime').val(parent.cachedData.endTime);
    }else{
    	$('#endTime').val(endTime);
    }
    //now.setDate(now.getDate() - 30);
    if(parent.cachedData && parent.cachedData.beginTime.length>0){
    	$('#beginTime').val(parent.cachedData.beginTime);
    }else{
    	$('#beginTime').val(now.format("yyyy-MM-dd 00:00:00"));
    }

    $('#beginTime').focus(function(){
        WdatePicker({
            startDate:'%y-#{%M}-%d %H:%m:%s',
            dateFmt:'yyyy-MM-dd HH:mm:ss',
            maxDate: endTime,
            onpicked:function(){
            	  now = new Date();
                  maxTime = now.format("yyyy-MM-dd 23:59:59");
            }
        });
    });

	 $('#endTime').focus(function(){
	        WdatePicker({
	            startDate:'%y-#{%M}-%d 23:59:59',
	            dateFmt:'yyyy-MM-dd HH:mm:ss',
	            minDate:'#F{$dp.$D(\'beginTime\')}',
	            maxDate: maxTime
	        });
	    });

}

/*function ajaxFileUpload(fId){
	var orgFileName = $('#'+fId).val();
	var postfix = orgFileName.substring(orgFileName.indexOf('.')+1,orgFileName.length);
	var upperCasePostFix = postfix.toLocaleUpperCase();
	if(!(upperCasePostFix=='JPG' || upperCasePostFix=='BMP' || upperCasePostFix=='PNG')){
		UI.util.alert(postfix+'文件不是支持的文件类型！目前仅支持JPG/BMP/PNG文件','warn');
		return ;
	}
	var baseUrl = '/oss/v1/cloudsearch/face/';
	var finalUrl = '';
	UI.util.showLoadingPanel();
	$.ajaxFileUpload( {
		url : baseUrl,
		type : 'post',
		secureuri : false,
		fileElementId : fId,
		dataType : 'text',
		data : {
			'FILE_TYPE' : 'picture'
		},
		success : function(data, status) {
			data = eval("(" + data + ")");
			if (data && !data.error) {
				var fileId = data.id;
				fileId = fileId.substring(0, fileId.indexOf('.'))
				finalUrl = baseUrl + fileId;
				fileUrl = finalUrl;
				$('#capPicImg').attr('src', fileUrl);
				initImg($(".ocx-wrap"),fileUrl);
				$('.upload-bg').addClass('hide');
				$('.imgUplaod').removeClass('hide');
				$(".wrap-img").removeClass("hide");
				$(".ocx-wrap").removeClass("hide");
				uploaded = true;
				editor.deleteAll();
			} else {
				UI.util.alert("上传失败！",'warn');
			}
			UI.util.hideLoadingPanel();
		},
		error : function(data, status, e) {
			UI.util.debug(data);
			UI.util.debug(status);
			UI.util.hideLoadingPanel();
			UI.util.alert("上传失败！",'warn');
		}
	});
}*/

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

function showForm(url) {
	$("#frameFormFull").attr("src", url);
	$(".frame-form-full").show();
	
}

function hideForm() {
	$("#frameFormFull").attr("src", "");
	$(".frame-form-full").hide();
}