var queryParams = {StoreType:1,OwnerType:2};

var orgTreeOpts = {
		isShowFolder: false,
		multiple: false,
		dropdownWidth: '250px',
		dropdownDefault: '归属地选择',
		autocomplete:true,
		search: {
			enable: true,              //是否启用搜索
			searchTreeNode: true,				//搜索参数 key|value为文本框的ID
			searchTextId: 'deviceNames',
			ignoreEmptySearchText: true,
			searchBtnId: 'searchs'
		}
};

$(function() {
	UI.control.init();
	initEvent();
	initTreeEvent();
});

function initEvent(){
	//管理
	$('body').on('click','.checkinfo',function(){
		var StoreID = $(this).attr('dbId');
		var StoreOwnerType = 2;
		var StoreName = $(this).attr('dbName');
		showForm('.frame-form-view','/efacecloud/page/dispatched/synchronizedCheckInfo.html?StoreID='
				+StoreID+'&StoreOwnerType='+StoreOwnerType
				+'&StoreName='+StoreName);
	});
	
	$(".liararyDetails").click(function(){
	});
	
	
	$("#addTemporary").click(function(){
		UI.util.showCommonWindow("/efacecloud/page/dispatched/addTemporaryLibrary.html", "新建布控库", 
				442, 250, function(){ doSearch(); });
	});
	
	$("#storeSearch").click(function(){
		doSearch();
	});
	
	$(window).keydown(function(event){
		switch(event.keyCode) {
			case 13:
				$("#storeSearch").trigger("click");
				break;
		}
	});
	
	$("body").on("click", ".editBtn", function(){
		var storeId = $(this).attr("dbId");
		var storeName = $(this).attr("dbName");
		var orgCode = $(this).attr("orgCode");
		
		UI.util.showCommonWindow("/efacecloud/page/dispatched/addTemporaryLibrary.html?" +
				"storeId=" + storeId + "&storeName=" + storeName + "&orgCode=" + orgCode, "修改库", 
				442, 610, function(){ doSearch(); });
	});
	
	$("body").on("click", ".reStationing", function(){
		var dbId = $(this).attr("dbId");
		var storeName = $(this).attr("dbName");
		UI.control.remoteCall("case/stationing/reStationingDB", {dbId:dbId}, function(resp){
			if (resp.StatusCode == "0") {
				UI.util.showLoadingPanel('');
				setTimeout(function(){
					doSearch();
					UI.util.hideLoadingPanel();
					UI.util.alert("重发成功");
				}, 5000);
			}
		});
	});
	
	$("body").on("click", ".delBtn", function(){
		var storeId = $(this).attr("dbId");
		var storeName = $(this).attr("dbName");
		var passNum = $(this).attr("passNum");
		var taskNum = $(this).attr("taskNum");
		var alterMsg = "";
		
		if (parseInt(passNum) > 0){
			alterMsg = "布控库含有未删除的布控信息，";
		}
		
		if (parseInt(taskNum) > 0){
			alterMsg = "此布控库已被添加到布控任务，";
		}
		
		if (alterMsg != ""){
			UI.util.alert(alterMsg + "请先删除布控信息与从布控任务移除此库", "warn");
			return;
		}		
		var param = {};	
		param.StoreID = storeId;

		UI.util.confirm("是否删除选择的库？", function(){
			UI.control.remoteCall("person/control/deleteLib", param, function(resp){
				if (resp.status ==true){
					UI.util.alert("删除成功");
					doSearch();
				}else{
					UI.util.alert(resp.message,"warn");
					doSearch();
				}
			});
		});
	});
}

function initTreeEvent(){
	var orgTree = UI.control.getControlById("orgTree");
	orgTree.bindEvent("onDropdownSelect", function(node){
		UI.util.debug(node);
		var orgCode = node.id;
		$("#orgCode").val(orgCode);
		doSearch();
	});
	
	//默认选中父节点
	var id = orgTree.getNodes()[0].id;
	orgTree.setDropdownSelectNode(id);
}

function doSearch(){
	queryParams.StoreName = $("#storeName").val();
	queryParams.RegionID = $("#orgCode").val();
	UI.control.getControlById("storeList").reloadData('', queryParams);
}

function renderNum(storeNum){
	if (storeNum==null || storeNum==""){
		return 0;
	}
	return storeNum;
}

function renderStatus(code, sync){
	if (parseInt(sync) == 0) {
		return "正在布控..";
	} else {
		if (parseInt(code) == 0) {
			return "布控中";
		}
		return "布控失败";
	}
}

function hideStatus(code, sync){
	if (parseInt(sync) == 0) {
		return "hide";
	} else {
		if (parseInt(code) == 0) {
			return "hide";
		}
		return "";
	}
}