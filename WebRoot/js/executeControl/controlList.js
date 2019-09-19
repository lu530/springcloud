/**
 * @Author fenghuixia
 * @version 2018-05-08
 * @description 布控任务
 */

//初始化 表单变量
var queryParams = {
    pageNo:1,
    pageSize:10,
    isAsync:true
};

$(function(){	
	UI.control.init();
	selectedTag();
	initEvent();
})

function initEvent(){
	//新建布控任务
	$("#addBtn").click(function(){
		UI.util.showCommonIframe('.frame-form-full','/efacecloud/page/executeControl/controlForm.html');
	});
	
	//点击同步
	$("body").on("click",".syncStatusBtn",function(){
		var $this = $(this);
		
		if($this.hasClass("disabled")) return;
		UI.control.remoteCall('',{},function(resp){
			if(resp.CODE==0){
				
			}else{
				UI.util.alert(resp.MESSAGE,'warn');
			}
		});
	});
	
	//点击启动
	$("body").on("click",".playTaskBtn",function(){
		var $this = $(this);
		
		if($this.hasClass("disabled")) return;
		UI.control.remoteCall('',{},function(resp){
			if(resp.CODE==0){
				doSearch();
			}else{
				UI.util.alert(resp.MESSAGE,'warn');
			}
		});
	});
	
	//点击停止
	$("body").on("click",".stopTaskBtn",function(){
		var $this = $(this);
		
		if($this.hasClass("disabled")) return;
		UI.control.remoteCall('',{},function(resp){
			if(resp.CODE==0){
				doSearch();
			}else{
				UI.util.alert(resp.MESSAGE,'warn');
			}
		});
	});
	
	//点击撤控
	$("body").on("click",".revokeTaskBtn",function(){
		var $this = $(this);
		
		if($this.hasClass("disabled")) return;
		UI.util.confirm("确定要撤销布控？",function(){
			UI.control.remoteCall('',{},function(resp){
				if(resp.CODE==0){
					UI.util.alert("撤控成功！");
					doSearch();
				}else{
					UI.util.alert(resp.message,'warn');
				}
			});
		});
	});
	
	//确定检索
	$("#confirmSearchBtn").click(function(){
		doSearch();
	});

}

function doSearch(){
	queryParams.TASK_STATUS = $("#status .tag-item.active").attr("val");
	queryParams.TASK_LEVEL = $("#warnLevel .tag-item.active").attr("val");
	queryParams.SORT = $("#sort .tag-item.active").attr("val");
	queryParams.KEYWORDS = $("#keyWord").val();
	UI.control.getControlById("controlList").reloadData(null,queryParams);
}

//任务状态,1--待启动 2--进行中 3--暂停 4--已撤销
function renderStatus(type){
	var str = '';
	switch(type){
	case 1:
		str = "待启动"
		break;
	case 2:
		str = "进行中"
			break;
	case 3:
		str = "已暂停"
			break;
	case 4:
		str = "已撤销"
			break;
	}
	return str;
}
//告警等级,1--红色告警 2--黄色告警 3--事后关注
function renderLevel(type){
	var str = '';
	switch(type){
	case 1:
		str = "红色告警"
			break;
	case 2:
		str = "黄色告警"
			break;
	case 3:
		str = "事后关注"
			break;
	}
	return str;
}

//同步状态，1--正在同步 2-同步成功 -1-同步失败
function renderSuncStatus(type){
	var str = '';
	switch(type){
	case 1:
		str = "正在同步"
			break;
	case 2:
		str = "同步成功"
			break;
	case -1:
		str = "同步失败"
			break;
	}
	return str;
}