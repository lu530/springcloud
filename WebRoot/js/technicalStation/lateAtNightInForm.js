/**
 * 说明：  id属性值末位为2，表示 预警设置页面  与  昼伏夜出页面 具有类似的页面元素，以表区分
 */
var queryParams = {};
var isEdit = false;
var beginTime = $('#beginTime');
var	endTime = $('#endTime');

var beginnightTime = $('#beginnightTime');
var	endnightTime = $('#endnightTime');
var nightNum= $('#nightNum');

$(document).ready(function(){
	UI.control.init(["userInfo"]);
	initEvents();
	initTime();
	getDeviceModule();  //定义在common中
	$('#technicalTitle').text('人员深夜出入分析');
})

function initEvents(){
	//返回菜单
	$("#backBtn").click(function(){
		parent.showMenu();
	})
	
	//搜索
	$('#searchBtn').click(function(){
		if(initQueryParams()){
			parent.UI.map.clearDraw();  //清除地图框选
			$('.form-con [map=mapBtn]').parent('li.active').removeClass('active');
			
			showForm('/efacecloud/page/technicalStation/dayLurkNightOut.html?type=lateNight');
		}
	});
	//关闭
	$('body').on('click','#closeBtn',function(){
		parent.animateLeftFrameOut();
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
	var sliderS = $( "#sliderScore" ).slider({
		range: "max",
		min: 0,
		max: 100,
		value: 60,
		slide: function( event, ui ) {
			$( "#FACESCORE" ).val( ui.value );
		}
	});
	$( "#THRESHOLD" ).val(70);
	$( "#FACESCORE" ).val(60);
	 
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
	
}
function showForm(url) {
	$("#frameFormFull").attr("src", url);
	$(".frame-form-full").show();
}
function hideForm() {
	$("#frameFormFull").attr("src", "");
	$(".frame-form-full").hide();
}
//昼伏夜出查询  初始化参数
function initQueryParams(){
	if(beginTime.val() == '') {
		UI.util.alert("开始日期不能为空！", "warn");
		return false;
	}
	
	if(endTime.val() == '') {
		UI.util.alert("结束日期不能为空！", "warn");
		return false;
	}
	
	if(nightNum.val()=="" || nightNum.val()==undefined){ 
		UI.util.alert("夜出频次不能为空","warn");
		return false;
	}
     var patt = new RegExp("^[0-9]*[1-9][0-9]*$");//正整数正则验证
     
	if(!patt.test(nightNum.val())){
		UI.util.alert("夜出频次应为正整数！", "warn");
		return false;
	}
	if(nightNum.val() > 100000){
		UI.util.alert("夜出频次不可大于10万次！", "warn");
		return false;
	}
	
	if($('#faceDetect').val()=="" || $('#faceDetect').val()==undefined){ 
		UI.util.alert("请选择区域或感知设备","warn");
		return false;
	}
	
	if (beginnightTime.val() == "" ||endnightTime.val() == "" ) {
		UI.util.alert("夜时间不可为空!","warn");
		return false;
	}

	queryParams = {

		BEGIN_DATE: beginTime.val(),			//	开始时间
		END_DATE: endTime.val(),				//	结束时间
		NIGHT_BEGIN_TIME: beginnightTime.val(),	//	夜开始时间
		NIGHT_END_TIME: endnightTime.val(),		//	夜结束时间
		NIGHT_FREQUENCE: nightNum.val(),		//	夜最小频次
		THRESHOLD: $('#THRESHOLD').val(),		//	相似度阈值
		FACE_SCORE: $('#FACESCORE').val(),		//	人脸特征分数
		DEVICE_IDS: $('#faceDetect').val()		//	设备IDs
	}
	return true;
}

//初始化日期选择框
function initTime(){
	var	now = new Date();
	var maxTime = curTime = now.format("yyyy-MM-dd");
	endTime.val(curTime);
	now.setDate(now.getDate() - 7);
	beginTime.val(maxTime);
	// beginnightTime.val('18:00:00');
	// endnightTime.val('06:00:00');

	beginnightTime.val('18:00:00');
	endnightTime.val('23:59:59');
	
	beginTime.focus(function(){ 
		WdatePicker({
			startDate:'%y-#{%M}-%d',
			dateFmt:'yyyy-MM-dd',
			maxDate:curTime,
			minDate:get3MonthsBeforeDate().format("yyyy-MM-dd"),
			onpicked:function(){
				var options = {
						begin: beginTime.val(),
						end: endTime.val(),
						space: 7,
						format: 'yyyy-MM-dd'
					}
				var result = UI.util.timeLinkage(options);
				endTime.val(result.newDate);
				if(result.isSpace){
					 now = new Date();
					 maxTime = now.format("yyyy-MM-dd");
				}else{
					maxTime = '#F{$dp.$D(\'beginTime\',{d:7})}';
				}	    
			}
		});
	});
	endTime.focus(function(){
		WdatePicker({
			startDate: '%y-#{%M}-%d',
			dateFmt: 'yyyy-MM-dd',
			minDate: '#F{$dp.$D(\'beginTime\')}',
			maxDate: maxTime
		});
		
	});
	beginnightTime.focus(function(){
		WdatePicker({
			startDate:'%H:%m:%s',
			dateFmt:'HH:mm:ss'
		});
	});
	endnightTime.focus(function(){
		WdatePicker({
			startDate:'%H:%m:%s',
			dateFmt:'HH:mm:ss'
		});		
	});		
}

function get3MonthsBeforeDate(){ //获取三个月前日期，作时间限制
	var	now = new Date();
	return getLimitDate(now.format("yyyy-MM-dd 00:00:00"), -90);
}
