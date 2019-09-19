//权限控制
var powerOpts = {
		$names:$('#powerNames'),
		$codes:$('#powerCode'),
		$list:$("#powerNameList"),
		$wrap:$(".powerWrap")
};

//告警提醒
var warnOpts = {
		$names:$('#warnNames'),
		$codes:$('#warnCode'),
		$list:$("#warnNameList"),
		$wrap:$(".warnWrap")
}

//记录回填设备阈值
var deviceValObj = {
		deviceId:[],
		deviceName:[],
		threshold:[]
};

$(function(){
	initEvents();
	initDevice();//视频源操作
	initUserList(powerOpts);//权限控制
	initUserList(warnOpts);//告警提醒
	initTime();
	initAlgo();
});

function initEvents(){
	//布控时限
	$('[name="TASK_TIME_LIMIT"]').change(function(){
		var val = $(this).val();
		if(val == 2){
			$("#controlTimeWrap").removeClass("hide");
		}else{
			$("#controlTimeWrap").addClass("hide")
		}
	});
	
	//告警核查方式
	$('.checkWay').click(function(){
		var $this = $(this),
			val = $this.attr("val"),
			checked = $this.prop("checked");
		
		$('.checkWay[val="4"]').prop("checked",false);
		switch(val){
			case "1":
				if(checked){
					$("#examineWayWrap").removeClass("hide");
				}else{
					$("#examineWayWrap").addClass("hide");
				}
				break;
			case "2":
				if(checked){
					$('.checkWay[val="3"]').prop("checked",false);
				}
				break;
			case "3":
				if(checked){
					$('.checkWay[val="2"]').prop("checked",false);
				}
				break;
			case "4":
				if(checked){
					$('.checkWay').prop("checked",false);
					$('.checkWay[val="4"]').prop("checked",checked);
					$("#examineWayWrap").addClass("hide");
				}
				break;
		}
	});
	
	//告警阈值设置
	$('[name="thresholdSetting"]').click(function(){
		var $this = $(this);
		var val = $this.attr("val");
		var checked = $this.prop("checked");
		if(val == 1){
			if(checked){
				$("#cameraList").removeClass("hide");
			}else{
				$("#cameraList").addClass("hide");
			}
		}else{
			if(checked){
				$this.parent().siblings().removeClass("hide");
			}else{
				$this.parent().siblings().addClass("hide");
			}
		}
	});
	
	//短信推送
	$('[name="IS_MSG"]').click(function(){
		var checked = $(this).prop("checked");
		if(checked){
			$("#msgWrap").removeClass("hide");
		}else{
			$("#msgWrap").addClass("hide");
		}
	});
}

function initAlgo(){
	UI.control.remoteCall('face/common/getFaceAlgoList',{},function (resp) {
        if(resp.data.length>0){
            for(var i=0;i<resp.data.length;i++){
                $("#checkType").append(tmpl('checkTypeTmpl',resp.data[i]));
            }
        }
    });
}

//用户列表树
/*$names:$('#powerNames'),
$codes:$('#powerCode'),
$list:$("#powerNameList"),
$wrap:$(".powerWrap")*/
function initUserList(opts){
	var $names = opts.$names,
		$codes = opts.$codes,
		$list = opts.$list,
		$wrap = opts.$wrap;
	//通过卡口树加载设备
	$names.click(function(e){
		$wrap.removeClass("open");
		//回填数据
		var userCode = $codes.val();
		var userName = $names.attr("title");
		//var deptCode = $wrap.find('.deptCode').val();
		if(userCode!=''){
			var obj = {
					userCodeArr:userCode.split(","),
					userNameArr:userName.split(",")/*,
					deptCodeArr:deptCode.split(",")*/
			}
		}else{
			var obj = '';
		}
		
		UI.util.showCommonWindow('/efacecloud/page/executeControl/userInfoList.html?dataObj='+JSON.stringify(obj), '用户选择', 1000, 600,function(resp){
			$names.html(resp.userName);
			$names.attr('title',resp.userName);
			$names.attr('usercode',resp.userCode);
			$codes.val(resp.userCode);
			//$wrap.find('.deptCode').val(resp.deptCode);
			
			addDrowdownDeviceList({
				deviceId:resp.userCode,
				deviceName:resp.userName,
				deviceNameList:$list,
				dropdownListText:$wrap.find(".dropdown-list-text")
			});
		});
		e.stopPropagation();
	});
	
	//删除已选设备
	$wrap.on("click",".removeDeviceBtn",function(e){
		var $this = $(this);
		var userCode = $this.attr("deviceid");
		var userCodeArr = $codes.val().split(",");
		//var deptCodeArr = $wrap.find('.deptCode').val().split(",");
		var deviceNameArr = $names.html().split(",");
		var index = userCodeArr.indexOf(userCode),
			orgCode = $names.attr("usercode"),
			orgCodeArr = orgCode.split(",");
		
		$this.parents("li").remove();
		userCodeArr.splice(index,1);
		//deptCodeArr.splice(index,1);
		deviceNameArr.splice(index,1);
		orgCodeArr.splice(index,1);
		$codes.val(userCodeArr.join(","));
		//$wrap.find('.deptCode').val(deptCodeArr.join(","));
		$names.html(deviceNameArr.join(","));
		$names.attr("title",deviceNameArr.join(","));
		$names.attr("usercode",orgCodeArr.join(","));
		if($list.find("li").length == 0){
			$wrap.find(".dropdown-list-text").attr("data-toggle","");
			$wrap.find(".dropdown-list-text .dropdown").addClass("hide");
			$wrap.removeClass("open");
		}
		
		e.stopPropagation();
	});
}

//设备树
function initDevice(){
	//通过卡口树加载设备
	$('#deviceName').click(function(e){
		$('[data-toggle]').parent().removeClass("open");
		//回填数据
		checkDrowDownDeviceList({
			deviceNames:$('#deviceName').html(),
			deviceId:$('#deviceCode').val(),
			deviceIdInt:$('#orgCodeInt').val(),
			orgCode:$("#deviceName").attr("orgcode")
		});
		
		UI.util.showCommonWindow('/connectplus/page/device/deviceList.html?deviceType=194', '设备选择', 1000, 600,function(resp){
			$('#deviceName').html(resp.deviceName);
			$('#deviceName').attr('title',resp.deviceName);
			$('#deviceName').attr('orgcode',resp.orgCode);
			$('#deviceCode').val(resp.deviceId);
			$('#orgCodeInt').val(resp.deviceIdInt);
			
			addDrowdownDeviceList({
				deviceId:resp.deviceId,
				deviceName:resp.deviceName,
				deviceNameList:$("#deviceNameList"),
				dropdownListText:$(".dropdown-list-text")
			});
			
			var deviceIdArr = resp.deviceId.split(",");
			var deviceNameArr = resp.deviceName.split(",");
			var thresholdArr = [];
			for(var i = 0;i<deviceIdArr.length;i++){
				thresholdArr.push("75.00");
			}
			
			if(resp.deviceId == ''){
				deviceValObj.deviceId=[];
				deviceValObj.deviceName=[];
				deviceValObj.threshold=[];
				$("#cameraList .list-con").empty();
				$('[name="thresholdSetting"]').prop("checked",false);
				$("#cameraList").addClass("hide");
			}else{
				if(deviceValObj.deviceId.length == 0){
					deviceValObj.deviceId = deviceIdArr;
					deviceValObj.deviceName = deviceNameArr;
					deviceValObj.threshold = thresholdArr;
				}else{
					$.each(deviceIdArr,function(i,n){
						var index = deviceValObj.deviceId.indexOf(n);
						if(index<0){
							deviceValObj.deviceId.push(n);
							deviceValObj.deviceName.push(deviceNameArr[i]);
							deviceValObj.threshold.push("75.00");
						}
					});
				}
				$("#cameraList .list-con").html(tmpl("cameraListTemplate",deviceValObj));
			}
			
		});
		e.stopPropagation();
	});
	
	//删除已选设备
	$(".videoChose").on("click",".removeDeviceBtn",function(e){
		var $this = $(this);
		var deviceId = $this.attr("deviceid");
		var deviceIdArr = $('#deviceCode').val().split(",");
		var deviceIdIntArr = $('#orgCodeInt').val().split(",");
		var deviceNameArr = $('#deviceName').html().split(",");
		var index = deviceIdArr.indexOf(deviceId),
			orgCode = $("#deviceName").attr("orgcode"),
			orgCodeArr = orgCode.split(",");
		
		$this.parents("li").remove();
		deviceIdArr.splice(index,1);
		deviceIdIntArr.splice(index,1);
		deviceNameArr.splice(index,1);
		orgCodeArr.splice(index,1);
		$('#deviceCode').val(deviceIdArr.join(","));
		$('#orgCodeInt').val(deviceIdIntArr.join(","));
		$('#deviceName').html(deviceNameArr.join(","));
		$('#deviceName').attr("title",deviceNameArr.join(","));
		$('#deviceName').attr("orgcode",orgCodeArr.join(","));
		
		$("li[deviceid='"+deviceId+"']").remove();
		
		if($("#deviceNameList li").length == 0){
			$(".dropdown-list-text").attr("data-toggle","");
			$(".dropdown-list-text .dropdown").addClass("hide");
			$(".dropdown-list").removeClass("open");
		}
		
		e.stopPropagation();
		
		var curIndex = deviceValObj.deviceId.indexOf(deviceId);
		if(curIndex>=0){
			deviceValObj.deviceId.splice(curIndex, 1);
			deviceValObj.deviceName.splice(curIndex, 1);
			deviceValObj.threshold.splice(curIndex, 1);
		}
	});
	
	//设置阈值
	$("body").on("blur",".cameraThreshold",function(){
		var $this = $(this);
		var deviceId = $this.attr("deviceid");
		var curVal = $this.val();
		var index = deviceValObj.deviceId.indexOf(deviceId);
		deviceValObj.threshold[index] = curVal;
	});
}

function initTime(){
	var $beginTime = $("#BEGIN_TIME"),
		$endTime = $("#END_TIME"),
		todayTime= UI.util.getDateTime("today", 'yyyy-MM-dd HH:mm:ss');
	$beginTime.val(todayTime.bT);
	$endTime.val(todayTime.eT);;
	$beginTime.focus(function(){
		WdatePicker({
			startDate:'%y-#{%M}-%d 00:00:00',
			dateFmt:'yyyy-MM-dd HH:mm:ss',
			maxDate:'#F{$dp.$D(\''+$endTime.attr('id')+'\')||\''+todayTime.eT+'\'}',
			isShowClear:false
		});
	});
	$endTime.focus(function(){
		WdatePicker({
			startDate:'%y-#{%M}-%d %H:%m:%s',
			dateFmt:'yyyy-MM-dd HH:mm:ss',
			minDate:'#F{$dp.$D(\''+$beginTime.attr('id')+'\')}',
			isShowClear:false
		});
	});
}