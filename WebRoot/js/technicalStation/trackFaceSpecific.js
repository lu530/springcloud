var now = new Date();
var endTime = dateFormat(now,'yyyy-MM-dd 23:59:59');
now.setDate(now.getDate() - 7);
var beginTime = dateFormat(now,'yyyy-MM-dd 00:00:00');
var queryParams = {};

$(document).ready(function(){
	UI.control.init();
	initEvents();
	initTime();
	top.logSwitch && top.LogToolPackage && top.LogToolPackage.yiSaLogs('特定人群轨迹分析');
});

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
		value: CONSTANTS.TACTICS_TASK.VAL.THRESHOLD,
		slide: function( event, ui ) {
			$( "#THRESHOLD" ).val( ui.value );
		}
	});
	 var sliderS = $( "#sliderScore" ).slider({
		range: "max",
		min: 0,
		max: 200,
		value: CONSTANTS.TACTICS_TASK.VAL.SEARCHNUM,
		slide: function( event, ui ) {
			$( "#SEARCHNUM" ).val( ui.value );
		}
	});

	$( "#THRESHOLD" ).val(CONSTANTS.TACTICS_TASK.VAL.THRESHOLD);
	$( "#SEARCHNUM" ).val(CONSTANTS.TACTICS_TASK.VAL.SEARCHNUM);


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
		parent.showMenu();
	});

	//查询按钮
	$('#searchBtn').click(function(){

		if(UI.util.validateForm($("#frequentAccess"))) {

            // parent.UI.map.clearDraw();  //清除地图框选
			// $('.form-con [map=mapBtn]').parent('li.active').removeClass('active');

            var params = UI.util.formToBean($("#frequentAccess"));

            params.LIB_TYPE = $("#libType option:selected").attr('value');
            params.TASK_TYPE = '2';
            params.DEVICE_NAMES = $('#deviceNames').html();

            UI.util.showLoadingPanel();

            UI.control.remoteCall('special/person/addAsyncTask', params, function (resp) {

                UI.util.alert(resp.MESSAGE, resp.CODE === 0 ? '' : 'warn');
				if (resp.CODE === 0) {
					UI.util.hideLoadingPanel();
					UI.util.alert("异步查询, " + resp.MESSAGE + " , 即将打开任务列表");
					setTimeout(() => {
						var url = window.location.origin + '/portal/page/datadefenceMenu.html#tasklist';
						window.open(url, '_blank');
					}, 800);
				}


			}, function (error){ console.log(error) }, '', true)
        }
    });

	//关闭
	$('body').on('click','#closeBtn',function(){
		top.rightMainFrameOut();
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

		getDeviceModule();
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


    //  人员库选择
    $("body").on('click', '#faceLibName', function () {

        UI.util.showCommonWindow('/efacecloud/page/technicalStation/faceThematicSelect.html', '人员专题库选择', 1150, 700, function(resp){
            $("#faceLibName").html(resp.libName);
            $("#faceLibID").val(resp.libID);
            $(".faceLibName").val(resp.libName);
		});
	});

	//	已建任务查看
	$('body').on('click', '#taskLooking', function () {

		UI.util.openCommonWindow({
			title: "技战法任务",
			width: $(top.window).width()*0.95,
			height: $(top.window).height()*0.95,
			src: '/efacecloud/page/technicalStation/tacticsTask.html?taskType=specific',
			onClose:function(){}
		});
	});
}

//初始化日期选择框
function initTime(){
	$("#beginTime").val(beginTime);
	$("#endTime").val(endTime);
	var	now = new Date();
	var maxTime = today = now.format("yyyy-MM-dd 23:59:59");

	$("#beginTime").focus(function(){
		WdatePicker({
			isShowClear:false,
			startDate:'%y-#{%M}-%d %H:%m:%s',
			dateFmt:'yyyy-MM-dd HH:mm:ss',
			maxDate: endTime,
			// skin:'jdBlack',
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
			isShowClear:false,
			startDate:'%y-#{%M}-%d 23:59:59',
			dateFmt:'yyyy-MM-dd HH:mm:ss',
			minDate:'#F{$dp.$D(\'beginTime\')}',
			// skin:'jdBlack',
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
