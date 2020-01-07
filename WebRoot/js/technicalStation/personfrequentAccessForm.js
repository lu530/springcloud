var taskStatus = UI.util.getUrlParam("taskStatus") || '';
var now = new Date();
var endTime = dateFormat(now,'yyyy-MM-dd 23:59:59');
now.setDate(now.getDate() - 7);
var beginTime = dateFormat(now,'yyyy-MM-dd 00:00:00');
var queryParams = {};

$(document).ready(function(){
	/*UI.control.init(["userInfo"]);*/
	UI.control.init();
	getDeviceModule();  //定义在common中
	/*judgePermission();*/
	initTime();
	initEvents();
	/*initFaceDetectDropdowntree();*/
})

function judgePermission(){
	UI.control.initPermission();
	if(!UI.control.permissionDefaultHandle($("body").attr("menuId"))){
		return;
	}
}

function initEvents(){
	
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
	 var sliderS = $( "#sliderScore" ).slider({
	      range: "max",
	      min: 0,
	      max: 100,
	      value: 65,
	      slide: function( event, ui ) {
	        $( "#FACESCORE" ).val( ui.value );
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
    $('#FACESCORE').keyup(function() {  
		//数值范围为100以内
		$(this).val($(this).val().replace(/[^0-9]+/,''));
		if($(this).val() > 100){
			$(this).val(100);
		}
		$('.ui-slider-horizontal .ui-slider-handle').css('transition','0.5s');
		sliderS.slider( "value", $(this).val() );
		setTimeout(function(){
			$('.ui-slider-horizontal .ui-slider-handle').css('transition','0s');
		},500)
	})
	
	//返回菜单
	$('body').on('click','#backBtn',function(){
		if(taskStatus) {
			parent.parent.hideFrame();
		}else {
			parent.showMenu();
		}
	});
	
	//查询按钮
	$('#searchBtn').click(function(){
		if(initQueryParams()){
			searchParam = {
					NUMS:queryParams.NUMS,
					BEGIN_TIME: queryParams.BEGIN_TIME,
					END_TIME:queryParams.END_TIME,
					THRESHOLD:queryParams.THRESHOLD,
					searchType:4
			}
			
			/*if(isOpenSearchCause()){*/
				searchBeforeLogged(function(){
					parent.UI.map.clearDraw();//清除地图框选
					parent.rightMainFrameIn('/efacecloud/page/technicalStation/personfrequentAccessRightList.html?type=frequent&param='+JSON.stringify(queryParams));
				},searchParam);
			/*}else{
				parent.rightMainFrameIn('/efacecloud/page/technicalStation/personfrequentAccessRightList.html?type=frequent&param='+JSON.stringify(queryParams));
			}*/
		}
	});
	
	//关闭
	$('body').on('click','#closeBtn',function(){
		top.rightMainFrameOut();
	});
	/*//检测方式
    $("#DetectionMethod li").click(function() {
		$(this).addClass('active').siblings().removeClass('active');
    });*/
    
    //tab切换
    $('#warningTabMenuList > li').click(function(){
	   	 var ref = $(this).find('a').attr('ref');
	   	 $(this).addClass('active').siblings().removeClass('active');
	   	 $('.tab-content > .tab-pane').removeClass('active');
	   	 $(ref).addClass('active');
   });
    
  //统一的通过卡口树加载设备事件
//	$('body').on('click','[togglebtn="kktree"]',function(){
//		//回填数据
//		checkDrowDownDeviceList({
//			deviceNames:$('#bayonetList').attr("devicename"),
//			deviceId:$('#selectedBayonet').val(),
//			deviceIdInt:$('#selectedDeviceIdInt').val(),
//			orgCode:$("#bayonetList").attr("orgcode")
//		});
//		
//        UI.util.showCommonWindow('/connectplus/page/device/deviceList.html?deviceType=194', '设备选择', 1000, 600,function(resp){
//            initListData(resp);
//        });
//    });
    
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

	if(taskStatus && taskStatus != 2){
		$("#searchBtn").addClass("hide");
	}

	//从任务列表查看
	if(top.GET_TASK_LIST_DATA){
		//条件回填
		var search = top.GET_TASK_LIST_DATA.search;
		$("#arithmeticSelect").val(search.ALGORITHM_CODE);
		$("#beginTime").val(search.BEGIN_TIME);
		$("#endTime").val(search.END_TIME);
		$("#kks").val(search.NUMS);
		sliderT.slider( "value", search.THRESHOLD );
		$( "#THRESHOLD" ).val( search.THRESHOLD );
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

//初始化查询参数
function initQueryParams() {
	
	if($('#beginTime').val() == '') {
		UI.util.alert("请选择开始时间", "warn");
		return false;
	}
	
	if($("#endTime").val() == '') {
		UI.util.alert("请选择结束时间", "warn");
		return false;
	}
	
	if($('#faceDetect').val()=="" || $('#faceDetect').val()==undefined){ 
		UI.util.alert("请选择区域或感知设备","warn");
		return false;
	}
	
	if($("#kks").val()=="" || $('#kks').val()==undefined){
		UI.util.alert("请填写出入频次","warn");
		return false;
	}
	
	if($("#kks").val().match('\\D')){
		UI.util.alert("出入频次应为整数", "warn");
		return false;
	}
	
	if(parseInt($("#kks").val()) > 1000){
		UI.util.alert("出入频次不能大于1000次", "warn");
		return false;
	}
    if (UI.util.validateForm($('.form-inline'), true)){
        queryParams.NUMS = $('#kks').val();
        parent.cachedData.deviceIds = $('#faceDetect').val();
        //queryParams.DEVICE_IDS = $('#faceDetect').val();
        queryParams.BEGIN_TIME = $('#beginTime').val();
        queryParams.END_TIME = $('#endTime').val();/*
         queryParams.time = $("input[name='time']:checked").val();*/
        queryParams.THRESHOLD = $('#THRESHOLD').val();
        queryParams.FACE_SCORE = $('#FACESCORE').val();
        return true;
    }
}

//初始化日期选择框
function initTime(){
	$("#beginTime").val(beginTime);
	$("#endTime").val(endTime);
	var	now = new Date();
	var maxTime = today = now.format("yyyy-MM-dd 23:59:59");
	
	$("#beginTime").focus(function(){
		WdatePicker({
			/*isShowClear:false,*/
			startDate:'%y-#{%M}-%d %H:%m:%s',
			dateFmt:'yyyy-MM-dd HH:mm:ss',
			maxDate: endTime,
			onpicked: function(){
				var options = {
						begin: $("#beginTime").val(),
						end: $("#endTime").val(),
						space: 6,
						format: 'yyyy-MM-dd 23:59:59'
					}
				var result = UI.util.timeLinkage(options);
				$("#endTime").val(result.newDate);
				if(result.isSpace){
					 now = new Date();
					 maxTime = now.format("yyyy-MM-dd 23:59:59");
				}else{
					maxTime = '#F{$dp.$D(\'beginTime\',{d:6})}';
				}	
				UI.util.debug(maxTime)
			}
		});
	});
	$("#endTime").focus(function(){
		WdatePicker({
			/*isShowClear:false,*/
			startDate:'%y-#{%M}-%d 23:59:59',
			dateFmt:'yyyy-MM-dd HH:mm:ss',
			minDate:'#F{$dp.$D(\'beginTime\')}',
			maxDate: maxTime
		});
	});
}

function showForm(url) {
	$("#frameFormFull").attr("src", url);
	$(".frame-form-full").show();
	
}
function hideForm() {
	$("#frameFormFull").attr("src", "");
	$(".frame-form-full").hide();
}