var beginTime  = UI.util.getDateTime("today","yyyy-MM-dd HH:mm:ss").bT,  //页面默认选中今天
	endTime = UI.util.getDateTime("today","yyyy-MM-dd HH:mm:ss").eT;

$('#beginTime').val(beginTime);
$('#endTime').val(endTime);

var queryParams={
	pageSize:20,
	pageNo: 1,
	BEGIN_TIME:beginTime,
	END_TIME:endTime,
	TASK_STATUS: "",
	id: "taskList",
	isAsync:true
};  

var timeOption = {
	'elem':$('#timeTagList'),
	'beginTime' :$('#beginTime'),
	'endTime' :$('#endTime'),
	'callback':getSearchTime
};

var userInfo;
var refreshTime = 30,//自动刷新获取数据库数据时间 默认30s
initFreshTime = null;

$(function() {
	UI.control.init(["userInfo"]);
	userInfo = UI.control.getUserInfo();	
	if(userInfo.userType != "9")$(".loginUserType").removeClass("hide");
	initEvent();
	compatibleIndexOf();
	initDateTimeControl(timeOption);
    doSearch();
});

//空字符串或者null转变为“未知”
function renderNullToNotKnow(str) {
	if (str == null || str == "" || typeof(str) == "undefined" || str == "PLATE") {
		return "未知";
	} else {
		return str;
	}
}

function initEvent() {
	$(".tagslist").on("click", ".tag-item", function(){
		$(this).addClass("active").siblings().removeClass("active");
	});

	//确认检索按钮
	$('#confirmSearch').click(function(){
		parent.$(".cFaceList").removeClass("active");//取消左侧列表选中
		doSearch();
	});
	//告警异常点击按钮
	$("body").on("click",".task-error",function(resp){
		var taskId = $(this).parent("span").attr("task_id");
		
		UI.control.remoteCall("face/nvnTask/getTaskResult",{TASK_ID:taskId,remoteUser:userInfo.code},function(resp){
			if(resp.CODE==0){
				UI.util.alert(resp.DATA,"warn");
			}else{
				UI.util.alert(resp.MESSAGE,"warn");
			}
		})
	})
	//查看等按钮
	$("#tilelist").off("click", ".table-btn").on("click", ".table-btn", function(){
		var ID = $(this).parent().attr("ID");
		var TASK_ID = $(this).parent().attr("TASK_ID");
		var TASK_TYPE = $(this).parent().attr("TASK_TYPE");
		var TASK_STATUS = $(this).parent().attr("TASK_STATUS");
		switch($(this).index()) {
			case 0://查看
				doOperation("face/nvnTask/getTaskResult", {TASK_ID: TASK_ID}, function(resp){
					if(resp.CODE == 0){
						if(!resp.DATA){
							resp.DATA = [];
						}else{
							resp.DATA = JSON.parse(resp.DATA);
						}
						top.GET_TASK_LIST_DATA = {};
						top.GET_TASK_LIST_DATA.data = resp;
						top.GET_TASK_LIST_DATA.search = resp.PARAM;
						var arr = ["频繁出现", "区域碰撞", "同伙分析", "昼伏夜出", "深夜出入", "特定人群轨迹分析"];
						var type = "";
						$.each(arr, function(index, el) {
							if(TASK_TYPE.indexOf(el) != -1){
								switch(index) {
									case 0://频繁出现
										type = 'frequently';
										break;
									case 1://区域碰撞
										type = 'region';
										break;
									case 2://同伙分析
										type = 'partner';
										break;
									case 3://昼伏夜出
										type = 'dayLurkNightOut';
										break;
									case 4://深夜出入
										type = 'lateAtNightIn';
										break;
									case 5://特定人群轨迹分析
										type = 'specificResult';
										break;
								}
								if(type) {
									var url = '/efacecloud/page/technicalStation/tacticsFrame.html?pageType='+type+'&taskStatus='+TASK_STATUS+"&TASK_ID="+TASK_ID;
									showFrame(url);
								}
							}
						});
					}else{
						UI.util.alert(resp.MESSAGE, "warn");
					}
				});
				break;
			case 1://置顶
				doOperation("face/nvnTask/updateTaskLevel", {ID: ID}, function(resp){
					if(resp.CODE == 0){
						queryParams.pageNo = 1;
						doSearch();
					}
				});
				break;
			case 2://删除
				UI.util.confirm('确定删除？', function() {
					doOperation("face/nvnTask/deleteTask", {TASK_ID: TASK_ID}, function(resp){
						if(resp.CODE == 0){
							doSearch();
						}
					});					
				});
				break;
		}
	});

	function doOperation(url, params, callback){
		UI.control.remoteCall(url, params, function(resp) {
			callback && callback(resp);
		});
	}
	
	//批量删除
	$("#deleteBtn").click(function(){
		var deleteData = UI.control.getControlById('taskList').getListviewCheckData();
		if(deleteData.length > 0){
			UI.util.confirm('确定删除？', function() {
				var TASK_ID = "",arr = [];
				$.each(deleteData, function(index, el) {
					arr.push(el.TASK_ID);
				});
				TASK_ID = arr.join(",");
				doOperation("face/nvnTask/deleteTask", {TASK_ID: TASK_ID}, function(resp){
					if(resp.CODE == 0){
						doSearch();
					}
				});
			});
		}else{
			UI.util.alert("请勾选要删除任务","warn");
		}
	});
};

function doSearch(){
    if (UI.util.validateForm($('#thresholdValidate'))) {
		$(".page-wrap").removeClass("hide");
        beginTime = $('#beginTime').val();
        endTime	= $('#endTime').val();
        queryParams.BEGIN_TIME = beginTime;
        queryParams.END_TIME = endTime;
        queryParams.TASK_STATUS = $("#taskStatus .tag-item.active").attr("val");
        UI.control.getControlById("taskList").reloadData(null,queryParams);
         
    }
}

function getSearchTime(dateTime){
	beginTime = dateTime.bT;
	endTime = dateTime.eT;
	queryParams.BEGIN_TIME = beginTime;
	queryParams.END_TIME = endTime;
}

function renderTaskStatus(i){
	switch(JSON.stringify(i)) {
		case "0":
			return '<i class="stay-run task-status">待启动</i>';
			break;
		case "1":
			return '<i class="running task-status">进行中</i>';
			break;
		case "3":
			return '<i class="task-error task-status">任务异常</i>';
			break;
		default:
			return '<i class="had-done task-status">已完成</i>';
	}
}
//列表回调
function listviewCallback(){
	$('[data-toggle="popover"]').popover({
		trigger:"hover"
	});
}
//排序
function renderRankNo(data){
	if(!data){
		return "不在队列中";
	}else{
		return data;
	}
}

function showFrame(url) {
	$('.frame-form-full').addClass('block')
		.find('#frameFormView').attr('src', url)
}

function hideFrame() {
	$('.frame-form-full').removeClass('block')
		.find('#frameFormView').attr('src', '')
}
