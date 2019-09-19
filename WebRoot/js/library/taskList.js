/**
 * 任务查看
 * @author fenghuixia
 * 2018-03-06
 */
var searchType = UI.util.getUrlParam("searchType")||1;
//时间控件初始化参数
var timeOption = {
		'elem':$('#timeTagList'),
		'beginTime' :$('#beginTime'),
		'endTime' :$('#endTime'),
		'callback':doSearch
};
var params = {
		pageSize:15,
		pageNo:1,
		//SEARCH_TYPE:searchType,
		SEARCH_TYPE:'all',
		APPROVAL_STATUS:"0",
		BEGIN_TIME:UI.util.getDateTime("today","yyyy-MM-dd HH:mm:ss").bT,
		END_TIME:UI.util.getDateTime("today","yyyy-MM-dd HH:mm:ss").bT,
		isAsync:true
}

$(function(){
	UI.control.init();
	initEvent();
	initDateTimeControl(timeOption);//初始化时间控件
	doSearch();
});

function initEvent(){
	//继续
	$("body").on("click",".continueBtn",function(){
		var $this = $(this);
		if($this.hasClass("disable")){
			return false;
		}
		var params = $this.attr("params");
		parent.UI.util.returnCommonWindow(params);
		parent.UI.util.closeCommonWindow();
	});
	
	//撤销
	$("body").on("click",".cancelBtn",function(){
		var $this = $(this);
		if($this.hasClass("disable")){
			return false;
		}
		var curParams = {
				APPROVAL_STATUS:3,
				TASK_ID:$this.attr("taskid")
		}
		UI.util.confirm("任务撤销后只能重新发起，确认撤销？",function(){
			UI.control.remoteCall("face/redTask/approve",curParams,function(resp){
				if(resp.CODE == 0){
					UI.util.alert("撤销成功！");
				}else{
					UI.util.alert("撤销失败！","warn");
				}
			
			},function(){},{},true);
		});
	});
	
	//审批状态筛选
	$('[name="APPROVAL_STATUS"]').click(function(){
		doSearch();
	});
}

function doSearch(){
	params.pageNo=1;
	params.APPROVAL_STATUS=$('[name="APPROVAL_STATUS"]:checked').val();
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
	case 'continueBtn':
		if(status == 0 || status == 2){
			str="disable";
		}
		break;
	case 'cancelBtn':
		if(status == 1 || status == 2){
			str="disable";
		}
		break;
	}
	return str;
}