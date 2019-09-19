var params = {
			pageSize:15,
			pageNo:1,
			SEARCH_TYPE:'',
			APPROVAL_STATUS:"0",
			KEYWORDS:"",
			BEGIN_TIME:UI.util.getDateTime("today","yyyy-MM-dd HH:mm:ss").bT,
			END_TIME:UI.util.getDateTime("today","yyyy-MM-dd HH:mm:ss").bT,
			isAsync:true
	}
//时间控件初始化参数
var timeOption = {
		'elem':$('#timeTagList'),
		'beginTime' :$('#beginTime'),
		'endTime' :$('#endTime'),
		'callback':doSearch
};
$(function() {
	UI.control.init();
	initEvent();
	initDateTimeControl(timeOption);//初始化时间控件
	doSearch();
})

function initEvent() {
	//返回
	$('#backBtn').click(function() {
		parent.UI.util.hideCommonIframe('.frame-form-full');
	});
	
	//通过&&不通过
	$("body").on("click",".passBtn,.noPassBtn",function(){
		var $this = $(this);
		if($this.hasClass("disable")){
			return false;
		}
		var opts = {
				approvalStatus:$this.attr("type"),
				taskId:$this.attr("taskid")
		}
		UI.util.confirm("确定"+$this.text()+"?",function() {
			approvalService(opts);
		});
	});
	
	//详情
    $('body').on('click', '.detailBtn',function(event) {
    	var taskId = $(this).attr("taskid");
        UI.util.showCommonWindow('/efacecloud/page/library/lookTaskDetail.html?taskId='+taskId,"任务详情", 1000, 600,
      		function(data){
      	});
    });
    
  //审批状态筛选
	$('[name="APPROVAL_STATUS"]').click(function(){
		doSearch();
	});
	
	//搜索
	$("#searchBtn").click(function(){
		    doSearch();
	});
	
	//回车事件
	$('#searchText').keyup(function(e){
		if(((e.keyCode || e.which) == 13)) {
			doSearch();
		}
	});
}

function approvalService(opts){
	var params = {
			APPROVAL_STATUS:opts.approvalStatus,
			TASK_ID:opts.taskId
	}
	UI.control.remoteCall("face/redTask/approve",params,function(resp){
		if(resp.CODE == 0){
			UI.util.alert("操作成功！");
			doSearch();
		}else{
			UI.util.alert("操作失败！","warn");
		}
		UI.util.hideLoadingPanel();
	},function(){},{},true);
}

function doSearch(){
	params.pageNo=1;
	params.APPROVAL_STATUS=$('[name="APPROVAL_STATUS"]:checked').val();
	params.KEYWORDS=$(".search-input").val();
	params.BEGIN_TIME=$('#beginTime').val();
	params.END_TIME=$('#endTime').val();
	UI.control.getControlById("taskList").reloadData(null,params);
}

/**
 * 转换审批状态
 * @param status
 * @returns {String}
 */
function randerStatus(status){
	var str = '';
	switch (status){
		case 0:
			str="待审核";
			break;
		case 1:
			str="通过";
			break;
		case 2:
			str="不通过";
			break;
		case 3:
			str="已撤销";
			break;
	}
	return str;
}
/**
 * 转换是否审批
 * @param status
 * @returns {String}
 */
function randerApprove(type){
	var str = '';
	switch (type){
	case 0:
		str="是";
		break;
	case 1:
		str="否";
		break;
	case 2:
		str="未知";
		break;
	}
	return str;
}

/**
 * 是否显示操作按钮
 * @param type
 * @returns {String}
 */
function showBtn(type,status){
	var str = '';
	switch (type){
	case 'passBtn':
		if(status == 2||status == 1 || status == 3){
			str="disable";
		}
		break;
	case 'noPassBtn':
		if(status == 2||status == 1 || status == 3){
			str="disable";
		}
		break;
	}
	return str;
}
function renderCause(caseType,cause){
	var str = "";
	switch (caseType){
		case 0:
			str = '管控';
			break;
		case 1:
			str = '侦查';
			break;
		case 2:
			str = '便民服务';
			break;
		case 3:
			str = cause;
			break;
	}
	return str;
}