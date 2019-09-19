//库id
var dbId = UI.util.getUrlParam('dbId');
//任务id
var taskId = UI.util.getUrlParam('taskId');
$(function(){
	UI.control.init();
	initEvent();
	initData();
});

function initEvent(){
	//返回
	$("#cancelBtn").click(function(){
		parent.UI.util.closeCommonWindow();
	});
	
	//保存
	$("#submitBtn").click(function(){
		doSave();
	});
}

function initData(){
	if(taskId){
		UI.util.showLoadingPanel();
		UI.control.remoteCall("face/distaptchedTask/detail", {DB_ID:dbId,TASK_ID:taskId}, function(resp){
			if (resp.CODE == 0) {
				UI.util.bindForm($("#mainContent"),resp.TASK_INFO);
				
				//短信通知
				if(resp.IS_MSG == 0){
					$('[name="IS_MSG"]').prop("checked",false);
					$("#msgWrap").addClass("hide");
				}
				
				//告警核查
				//一人一档
				if(resp.TASK_INFO.IS_ARCHIVE == 0){
					$('[name="IS_ARCHIVE"]').prop("checked",false);
				}else{
					$('[name="IS_ARCHIVE"]').prop("checked",true);
				}
				//飞识
				if(resp.TASK_INFO.IS_FEISHI == 0){
					$('[name="IS_FEISHI"]').prop("checked",false);
				}else{
					$('[name="IS_FEISHI"]').prop("checked",true);
				}
				//从算法
				if(resp.TASK_INFO.CHECK_ALGO_TYPE){
					$('.checkWay[val="1"]').prop("checked",true);
					$("#examineWayWrap").removeClass("hide");
				}else{
					$('.checkWay[val="1"]').prop("checked",false);
					$("#examineWayWrap").addClass("hide");
				}
				if(resp.TASK_INFO.IS_FEISHI == 0 && resp.TASK_INFO.IS_ARCHIVE == 0 && !resp.TASK_INFO.CHECK_ALGO_TYPE){
					$('.checkWay[val="4"]').prop("checked",true);
				}
				
				//告警提醒
				var warnNamesArr =[],
					warnCodesArr = []; 
				$.each(resp.ALARM_REMIND,function(i,n){
					warnNamesArr.push(n.USER_NAME);
					warnCodesArr.push(n.USER_CODE);
				});
				
				$("#warnNames").html(warnNamesArr.join(","));
				$("#warnNames").attr("title",warnNamesArr.join(","));
				$("#warnNames").attr("usercode",warnCodesArr.join(","));
				$("#warnCode").val(warnCodesArr.join(","));

				addDrowdownDeviceList({
					deviceId:warnCodesArr.join(","),
					deviceName:warnNamesArr.join(","),
					deviceNameList:$("#warnNameList"),
					dropdownListText:$(".warnWrap").find(".dropdown-list-text")
				});
				
				//权限控制
				var permissionNamesArr =[],
					permissionCodesArr = []; 
				$.each(resp.PERSON_PERMISSION,function(i,n){
					permissionNamesArr.push(n.USER_NAME);
					permissionCodesArr.push(n.USER_CODE);
				});
				
				$("#powerNames").html(permissionNamesArr.join(","));
				$("#powerNames").attr("title",permissionNamesArr.join(","));
				$("#powerNames").attr("usercode",permissionCodesArr.join(","));
				$("#powerCode").val(permissionCodesArr.join(","));

				addDrowdownDeviceList({
					deviceId:permissionCodesArr.join(","),
					deviceName:permissionNamesArr.join(","),
					deviceNameList:$("#powerNameList"),
					dropdownListText:$(".powerWrap").find(".dropdown-list-text")
				});
				
				if(resp.DEVICE_LIST.length>0){
					//视频源
					var deviceNamesArr =[],
						deviceCodesArr = [],
						thresholdArr = []; 
					$.each(resp.DEVICE_LIST,function(i,n){
						deviceNamesArr.push(n.DEVICE_NAME);
						deviceCodesArr.push(n.DEVICE_ID);
						thresholdArr.push(n.THRESHOLD);
					});
					
					$("#deviceName").html(deviceNamesArr.join(","));
					$("#deviceName").attr("title",deviceNamesArr.join(","));
					$("#deviceName").attr("orgcode",deviceCodesArr.join(","));
					$("#orgCode").val(deviceCodesArr.join(","));
					
					addDrowdownDeviceList({
						deviceId:deviceCodesArr.join(","),
						deviceName:deviceNamesArr.join(","),
						deviceNameList:$("#deviceNameList"),
						dropdownListText:$(".videoChose").find(".dropdown-list-text")
					});
					
					//阈值设备树回填
					deviceValObj.deviceId = deviceCodesArr;
					deviceValObj.deviceName = deviceNamesArr;
					deviceValObj.threshold = thresholdArr;
					$("#cameraList .list-con").html(tmpl("cameraListTemplate",deviceValObj));
					$('[name="thresholdSetting"]').prop("checked",true);
					$("#cameraList").removeClass("hide");
				}
				
				//布控时限
				if(resp.TASK_INFO.TASK_TIME_LIMIT==1){
					$("#controlTimeWrap").addClass("hide");
				}
				
				//是否短信
				if(resp.TASK_INFO.IS_MSG==0){
					$("#msgWrap").addClass("hide");
				}
				
			}else{
				UI.util.alert(resp.MESSAGE,"warn");
			}
			UI.util.hideLoadingPanel();
		},function(){},{},true);
	}
}

function doSave(){
	UI.util.showLoadingPanel();
	var formData = UI.util.formToBean($("#mainContent"));
	
	$.each($('[type="checkbox"]'),function(i,n){
		var name = $(n).attr("name");
		var checked = $(n).prop("checked");
		if(name){
			formData[name]=checked?1:0;
		}
	});
	
	formData.DB_ID = dbId;
	if(taskId){
		formData.TASK_ID = taskId;
	}
	//摄像机阈值列表
	var deviceListArr = [];
	$.each($(".cameraThreshold"),function(i,n){
		var obj = {
				THRESHOLD:$(n).val(),
				DEVICE_ID:$(n).attr("deviceid"),
				DEVICE_NAME:$(n).attr("devicename")
		};
		deviceListArr.push(obj);
	});
	if(deviceListArr.length>0){
		formData.DEVICE_LIST = JSON.stringify(deviceListArr);
	}else{
		formData.DEVICE_LIST = '';
	}
	
	//告警核查方式
	if($(".checkWay").attr("val")==4){
		delete formData.CHECK_ALGO_TYPE;
	}
	
	//告警提醒
	if(!$('[name="IS_MSG"]').prop("checked")){
		delete formData.ALARM_REMIND;
	}
	
	//长期有效
	if($('[name="TASK_TIME_LIMIT"]').val()==1){
		delete formData.BEGIN_TIME;
		delete formData.END_TIME;
	}
	UI.control.remoteCall("face/distaptchedTask/addOrUpdate", formData, function(resp){
		if (resp.CODE == 0) {
			UI.util.alert(resp.MESSAGE);
			parent.UI.util.returnCommonWindow(true);
			parent.UI.util.closeCommonWindow();
		}else{
			UI.util.alert(resp.MESSAGE,"warn");
		}
		UI.util.hideLoadingPanel();
	},function(){},{},true);
}