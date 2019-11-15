/**
 * @Author lyy
 * @version 2017-08-11
 * @description 人员告警统计页面;
 */

var today = UI.util.getDateTime("today","yyyy-MM-dd");
var dateDesc = today;
var now = new Date();
var endTime = dateFormat(now,'yyyy-MM-dd 23:59:59');
now.setDate(now.getDate() - 7);
var beginTime = dateFormat(now,'yyyy-MM-dd 00:00:00');
var maxTime  = now.format("yyyy-MM-dd");

//告警统计
var queryParams = {
		'BEGIN_TIME':today.bT,
		'END_TIME':today.eT,
		'DEVICE_IDS':$("#orgCode").val(),
		'STATISTIC_TYPE':"1"
};

var timeOptionDraw = {
		'elem':$('#timeTagDraw'),
		'beginTime' :$('#beginTimeDraw'),
		'endTime' :$('#endTimeDraw'),
		'callback':doSearchChart,
		'format':'yyyy-MM-dd'
};

$(function() {
	UI.control.init();
	getDeviceModule();  //定义在common中
	compatibleIndexOf();
	initEvent();	
	initDateTimeControl(timeOptionDraw);
	initChart(today.desc);	
});

function initEvent(){
	//通过卡口树加载设备--告警列表统计
	$('#deviceNames').click(function(e){
		//回填数据
		checkDrowDownDeviceList({
			deviceNames:$('#deviceNames').html(),
			deviceId:$('#orgCode').val(),
			deviceIdInt:$('#orgCodeInt').val(),
			orgCode:$("#deviceNames").attr("orgcode")
		});
		
		UI.util.showCommonWindow(deviceModule + '/page/device/deviceList.html?deviceType=194', '设备选择', 1000, 600,function(resp){
			$('#deviceNames').html(resp.deviceName);
			$('#deviceNames').attr('title',resp.deviceName);
			$('#deviceNames').attr('orgcode',resp.orgCode);
			$('#orgCode').val(resp.deviceId);
			
			addDrowdownDeviceList({
				deviceId:resp.deviceId,
				deviceName:resp.deviceName,
				deviceNameList:$("#deviceNameList"),
				dropdownListText:$(".dropdown-list-text")
			});
			doSearchChart();
		});
		e.stopPropagation();
	});
	
	//删除已选设备
	$("body").on("click",".removeDeviceBtn",function(e){
		var $this = $(this);
		var deviceId = $this.attr("deviceid");
		var deviceIdArr = $('#orgCode').val().split(",");
		var deviceNameArr = $('#deviceNames').html().split(",");
		var index = deviceIdArr.indexOf(deviceId),
			orgCode = $("#deviceNames").attr("orgcode"),
			orgCodeArr = orgCode.split(",");
		
		$this.parents("li").remove();
		deviceIdArr.splice(index,1);
		deviceNameArr.splice(index,1);
		orgCodeArr.splice(index,1);
		$('#orgCode').val(deviceIdArr.join(","));
		$('#deviceNames').html(deviceNameArr.join(","));
		$('#deviceNames').attr("title",deviceNameArr.join(","));
		$('#deviceNames').attr("orgcode",orgCodeArr.join(","));
		if($("#deviceNameList li").length == 0){
			$(".dropdown-list-text").attr("data-toggle","");
			$(".dropdown-list-text .dropdown").addClass("hide");
			$(".dropdown-list").removeClass("open");
		}
		doSearchChart();
		e.stopPropagation();
	});
	
	//点击进入卡口选择地图--告警列表统计
	$('#locate').click(function(){
		UI.util.showCommonWindow(deviceModule + '/page/device/deviceMap.html?deviceType=194', '设备选择', 1000, 600,function(resp){
			$('#deviceNames').html(resp.deviceName);
			$('#deviceNames').attr('title',resp.deviceName);
			$('#deviceNames').attr('orgcode',resp.orgCode);
			$('#orgCode').val(resp.deviceId);
			
			addDrowdownDeviceList({
				deviceId:resp.deviceId,
				deviceName:resp.deviceName,
				deviceNameList:$("#deviceNameList"),
				dropdownListText:$(".dropdown-list-text")
			});
			doSearchChart();
		});
	});
	
	//选择时间
	$('#timeTagDraw .tag-item').click(function(){
		queryParams.STATISTIC_TYPE = $(this).attr('val');
	});
}

function doSearchChart(date){
	UI.util.showLoadingPanel();
	queryParams.DEVICE_IDS = $("#orgCode").val();
	if(date){
		queryParams.END_TIME = date.eT;
		queryParams.BEGIN_TIME = date.bT;
		if(queryParams.STATISTIC_TYPE==7){
			var beginTimeData = new Date($("#beginTimeDraw").val()).getTime();
			var endTimeData = new Date($("#endTimeDraw").val()).getTime();
			
			if(endTimeData-beginTimeData==0){
				var rest = [];
				for(var i = 0 ; i <= 23 ; i++ ){
					rest.push(i + "时");
				}
				date.desc = rest;
			}else{
				var timeArr = [];
				var start = $("#beginTimeDraw").val();
				var end = $("#endTimeDraw").val();
				var startTimeDay = getDate(start);
				var endTimeDay = getDate(end);
				while((endTimeDay.getTime()-startTimeDay.getTime())>=0){
				  var year = startTimeDay.getFullYear();
				  var month = startTimeDay.getMonth().toString().length==1?"0"+(startTimeDay.getMonth()+1).toString():(startTimeDay.getMonth()+1);
				  var day = startTimeDay.getDate().toString().length==1?"0"+startTimeDay.getDate():startTimeDay.getDate();
				  
				  timeArr.push(month+"/"+day);
				  startTimeDay.setDate(startTimeDay.getDate()+1);
				}
				date.desc = timeArr;
			}
		}
		dateDesc = date;
	}
	if(queryParams){
		initChart(dateDesc.desc);
		UI.util.hideLoadingPanel();
	}
}

function initChart(time){
	var _xData = [],_yData = [];
	
	UI.control.remoteCall('face/dispatchedAlarm/alarmStatistic',queryParams, function(resp){
		resp = resp.DATA;
		var data =[];
		for(var i = 0 ; i < resp.length; i ++){
			var temp = {};
			temp.TIME = i;
			temp.STAT_NUM = resp[i];
			data.push(temp);
		}
		resp = data;										
		var _length = resp.length;
		if (_length != 0 && resp) {
			for(var i = 0; i < _length; i++){
				_yData.push(resp[i]['STAT_NUM']);
			}
			if(_yData.length > time.length){
				_yData = _yData.slice(0,time.length);
			}
			var areaBarOptions = {
					seriesDatas:[{color:"#7CBDE7",data:_yData}],
					xDatas:time,
					barWidth:25,
					yTitle:"次数",
					xTitle:"时间",
					titleColor:"#000",
					rotate: 0
				}
				var areaOption = getBarDrawOption(areaBarOptions);
				drawCharts('areaStatistics', areaOption);
		} else {
			UI.util.alert("查询失败", "error");
		}
	});
	
}

//时间筛选
function initDateTimeControl(option){
	var $ele=option.elem,
	$beginTime=option.beginTime,
	$endTime=option.endTime,
	callback=option.callback,
	format=option.format||'yyyy-MM-dd HH:mm:ss';
	var formatStartB = format=='yyyy-MM-dd HH:mm:ss'?'%y-#{%M}-%d 00:00:00':'%y-#{%M}-%d';
	var formatStartE = format=='yyyy-MM-dd HH:mm:ss'?'%y-#{%M}-%d %H:%m:%s':'%y-#{%M}-%d';
	var targetTime = option.targetTime || 'today';
	var todayTime= UI.util.getDateTime(targetTime, format);
	$beginTime.val(todayTime.bT);
	$endTime.val(todayTime.eT);
/*	var	now = new Date();*/
	
	var dateTime = {};
	var $zdybtn=$ele.find('.zdyTimeBtn');
	$beginTime.focus(function(){
		WdatePicker({
			startDate:formatStartB,
			dateFmt:format,
			maxDate:endTime,
			isShowClear:false,
			onpicked:function(){
				var options = {
						begin: $beginTime.val(),
						end: $endTime.val(),
						space: 30,
						format: 'yyyy-MM-dd'
					}
				var result = UI.util.timeLinkage(options);
				$endTime.val(result.newDate);
				if(result.isSpace){
					 now = new Date();
					 maxTime = now.format("yyyy-MM-dd");
				}else{
					maxTime = '#F{$dp.$D(\'beginTimeDraw\',{d:30})}';
				}		    
			}
		});
	});
	$endTime.focus(function(){
		WdatePicker({
			startDate:formatStartE,
			dateFmt:format,
			minDate:'#F{$dp.$D(\'beginTimeDraw\')}',
			maxDate:maxTime,
			isShowClear:false
		});
	});
	
	//时间控件确定检索按钮
	$zdybtn.click(function(){
		
		dateTime.bT = $beginTime.val();
		dateTime.eT	= $endTime.val();
		
		if( typeof callback == 'function'){
			callback(dateTime);		
		}
	});	

	
	//时间
	$ele.on('click','.tag-item',function(){
		var timeId = $(this).attr("time-control");
		
		$timeControl = $(this).parents('.filter-tag').find(".opera-group");
		$timeControl.removeClass("active");
		
		switch (timeId) {		
			case 'qb':
				dateTime.bT="";
				dateTime.eT=""
				break;
				
			case 'jt':
				dateTime= UI.util.getDateTime("today",format);
				break;
				
			case 'zt':
				dateTime= UI.util.getDateTime("yesterday",format);
				break;
				
			case 'bz':
				dateTime = UI.util.getDateTime("thisWeek",format);
				break;
			
			case 'by':			
				dateTime = UI.util.getDateTime("thisMonth",format);
				break;
			
			case 'zdy':			
				dateTime = UI.util.getDateTime("today",format);
				$timeControl.addClass("active");
				break;
			case 'nW':			
				dateTime = UI.util.getDateTime("nearWeek",format);
				break;
			case 'nM':			
				dateTime = UI.util.getDateTime("nearMonth",format);
				break;
			
		}

		$beginTime.val(dateTime.bT);
		$endTime.val(dateTime.eT);
		
		$(this).addClass('active').siblings('span').removeClass('active');
		
		if(typeof callback == 'function'&&timeId!='zdy'){
			callback(dateTime);
		}
		
	});
	
}

function getDate(datestr){
	  var temp = datestr.split("-");
	  var date = new Date(temp[0]+"/"+temp[1]+"/"+temp[2]);
	  return date;
}
