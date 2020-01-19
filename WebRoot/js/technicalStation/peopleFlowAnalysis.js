var now = new Date();
var taskStatus = UI.util.getUrlParam("taskStatus") || '';
var endTime = dateFormat(now,'yyyy-MM-dd 23:59:59');
now.setDate(now.getDate() - 7);
var beginTime = dateFormat(now,'yyyy-MM-dd 00:00:00');
var TASK_ID = UI.util.getUrlParam("TASK_ID") || '';
    queryParams = {},
    taskInfo = {};

$(document).ready(function(){

	UI.control.init();
	
    initTime();

    if(UI.util.getUrlParam("resultLooking") === "resultLooking") {

        getTaskInfo();

        //  地图相关
        peopleFlowMap.init();
    }
	getDeviceModule();  //定义在common中
	initEvents();
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
		value: taskInfo.THRESHOLD || CONSTANTS.TACTICS_TASK.VAL.THRESHOLD,
		slide: function( event, ui ) {
			$( "#THRESHOLD" ).val( ui.value );
		}
	});
	var sliderS = $( "#sliderScore" ).slider({
		range: "max",
		min: 0,
		max: 100,
		value: taskInfo.FACE_SCORE || CONSTANTS.TACTICS_TASK.VAL.FACESCORE,
		slide: function( event, ui ) {
			$( "#FACESCORE" ).val( ui.value );
		}
	});
	$( "#THRESHOLD" ).val(CONSTANTS.TACTICS_TASK.VAL.THRESHOLD);
	$( "#FACESCORE" ).val(CONSTANTS.TACTICS_TASK.VAL.FACESCORE);
	 
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

		if(UI.util.validateForm($("#frequentAccess"))) {

			// parent.UI.map.clearDraw();  //清除地图框选
			// $('.form-con [map=mapBtn]').parent('li.active').removeClass('active');

            var params = UI.util.formToBean($("#frequentAccess"));

            params.LIB_TYPE = $("#libType option:selected").attr('value');
            params.TASK_TYPE = '1';
            params.DEVICE_NAMES = $('#deviceNames').html();

            UI.util.showLoadingPanel();

            UI.control.remoteCall('person/flow/addAsyncTask', params, function (resp) {

                UI.util.alert(resp.MESSAGE, resp.CODE === 0 ? '' : 'warn');
				UI.util.hideLoadingPanel();
				UI.util.alert("异步查询, " + resp.MESSAGE + " , 即将打开任务列表");
				setTimeout(() => {
					var url = window.location.origin + '/portal/page/datadefenceMenu.html#tasklist';
					window.open(url, '_blank');
				}, 800);

            }, function (error){ console.log(error) }, '', true);
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
		
		UI.util.showCommonWindow(deviceModule + '/page/device/deviceList.html?deviceType=194', '设备选择', 1000, 600,function(resp){
            console.log(resp);
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

        UI.util.showCommonWindow('/efacecloud/page/technicalStation/version4.0/faceThematicSelect.html', '人员专题库选择', 1150, 700, function(resp){
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
			src: '/efacecloud/page/technicalStation/tacticsTask.html?taskType=flow',
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

function getTaskInfo () {

    UI.control.remoteCall('technicalTactics/task/detail', {TASK_ID: TASK_ID}, function (resp) {

        if(resp.CODE === 0) {

            taskInfo = resp.DATA[0];

        }else{
            UI.util.alert(resp.MESSAGE, 'warn');
        }

    }, function () {}, '', false);
}

//  地图操作相关

var peopleFlowMap = {

    init: function () {

        this.map = parent.UI.map.getMap();
        this.deviceID = '';
        this.deviceInfo = {};
        this.taskInfo = {};

        this.resultlooking();
    },
    resultlooking: function () {

        this.taskInfo = taskInfo;

        this.deviceID = this.taskInfo.DEVICE_IDS.split(',')[0];

        this.getDeviceInfo();

        this.backfill();
    },
    drawCircle: function () {

        var map = parent.UI.map.getMap(),
            latitude = this.deviceInfo.latitude,
            longitude = this.deviceInfo.longitude;

        parent.L.circle([latitude,longitude], {
            radius: 1000,
            color: '#999',
            color: 'rgb(87, 154, 247)',
            fillColor: 'rgb(87, 154, 247)', 
            fillOpacity: 0.2

        }).addTo(map);
        // 22.95913, 113.10239
        
        map.flyTo([latitude, longitude]);

        this.statistic = parent.L.marker().setLatLng([latitude, longitude]).addTo(map);

        //  填充人流量结果
        this.getFlowResult();
    },
    getDeviceInfo: function () {

        var _self = this;
        var params = {
            DEVICE_ID: this.deviceID,
            DEVICE_TYPE: 194,
            ORG_CODE: '',
            CASCADE: 1
        }

        UI.control.remoteCall('', '', function (resp) {

            _self.deviceInfo = resp.data[0];

            _self.drawCircle();
    
        }, function (error) {}, {
            
            url: '/portal/rest/v6/cp/device/getDeviceInfoFromCache',
            data: params

        }, true);
    },
    //  根据任务信息回填界面，并隐藏新建任务按钮与已建任务查看按钮
    backfill: function () {

        //  数据回填
        UI.util.bindForm($("#frequentAccess"), this.taskInfo);
        $('#deviceNames').html(this.taskInfo.DEVICE_NAMES)

        //  按钮隐藏
		$('#searchBtn, #taskLooking, #backBtn').addClass('hide');
		if(parent.cachedData&&parent.cachedData.hasBackBtn){
			$("#backBtn").removeClass("hide");
		}

    },
    //  查看人流量分析结果
    getFlowResult: function () {

        var _self = this;

        UI.control.remoteCall('technicalTactics/task/queryPersonFlow', {TASK_ID: TASK_ID}, function (resp) {

            if(resp.CODE === 0) {

                _self.statistic.bindPopup('<p>'+ resp.COUNT +'人</p>').openPopup();

            }else{

                UI.util.alert('人流量分析结果：' + resp.MESSAGE, 'warn');
            }
        }, function (error) {}, '', true);
    }

}