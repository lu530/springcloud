var queryParam = {};
$(function() {
	UI.control.init();
	initEvent();
});
//doSearch必须
function doSearch(){
	hideForm('.frame-form-full');
	var pageNo = UI.control.getControlById("dispatchedLibList").getCurrentPage();
	queryParam.pageNo = pageNo;
	UI.control.getControlById("dispatchedLibList").reloadData('',queryParam);
}
function initEvent(){
	$("#btnAdd").click(function(){
		showForm(".frame-form-full", "/efacecloud/page/dispatched/addExecuteControl.html?org_code="+queryParam.org_code );
	});
	$("#btnDel").click(function(){
		var checkData=UI.control.getControlById("dispatchedLibList").getListviewCheckData();
		if (checkData.length == 0){
			UI.util.alert("请选择任务再进行删除", "warn");
			return;
		}
		UI.util.confirm("是否删除？", function(){
			var taskIdList=[];
			var taskNameList=[];
			for(var i=0;i<checkData.length;i++){
				taskIdList.push(checkData[i]["TASK_ID"]);
				taskNameList.push(checkData[i]["TASK_NAME"]);
			}
			var url = 'person/control/deleteTask';
			UI.control.remoteCall(url, {taskIds:taskIdList.join(",")},
					function(reply){
						if(reply.message){
							UI.util.alert(reply.message)
							doSearch();
						}
			})
		})
	})

	$("body").on('click','.editBtn',function(event){
		var communityId = $(this).attr("bind-id");
		var taskId = $(this).attr("task-id");
		var taskName = $(this).attr("task-name");
		var localDB = $(this).attr("bind-localdb");
		var syncDB = $(this).attr("bind-syncdb");
		var taskScore = $(this).attr("opt-status");

		showForm(".frame-form-full", "/efacecloud/page/dispatched/addExecuteControl.html?taskId=" + taskId +
				"&org_code="+queryParam.org_code+"&type=edit&taskName="+taskName+"&communityId="+communityId+"&localDB="+localDB+"&syncDB="+syncDB+"&taskScore="+taskScore );
	});
	$("body").on('click','.liararyRemove',function(){
		var taskId = $(this).attr("task-id");
		var task_name=$(this).attr("task_name");
		var url='person/control/deleteTask';
		UI.util.confirm("是否删除？", function(){
			UI.control.remoteCall(url, {taskIds:taskId},
					function(reply){
						if(reply.message){
							UI.util.alert(reply.message)
							doSearch();
						}
			});
		});
	});
	queryParam.org_code="";
	doSearch();
	/*var allNodes = UI.control.getControlById("structureSceneTree").getNodes();

	if(allNodes && allNodes.length > 0){
		UI.control.getControlById("structureSceneTree").selectNode(allNodes[0]);
		queryParam.org_code = allNodes[0].id;
		doSearch();
	}*/
}

function renderStatus(code){
	if (parseInt(code) == 0) {
		return "布控中";
	}
	return "布控失败";
}
