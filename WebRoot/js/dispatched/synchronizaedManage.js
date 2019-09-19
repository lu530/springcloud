var queryParam = {
		StoreType:1,
		OwnerType:1
};

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
	$(window).keydown(function(event){
		switch(event.keyCode) {
			case 13:
				$("#storeSearch").trigger("click");
				break;
		}
	});
	
	$("#storeSearch").click(function(){
		doSearch();
	});
	
	$("#btnAdd").click(function(){
		UI.util.showCommonWindow("/efacecloud/page/dispatched/addTemporaryLibrary.html?isLocal=0", "新建常控库", 
				442, 240, function(){ doSearch(); });
	});
	
	$('body').on('click','.checkinfo',function(){
		var StoreID = $(this).attr('dbId');
		var StoreOwnerType = 1;
		var StoreName = $(this).attr('dbName');
		showForm('.frame-form-view','/efacecloud/page/dispatched/synchronizedCheckInfo.html?StoreID='
				+StoreID+'&StoreOwnerType='+StoreOwnerType
				+'&StoreName='+StoreName);
	});
	
	$("body").on("click", ".editBtn", function(){
		var storeId = $(this).attr("dbId");
		var storeName = $(this).attr("dbName");
		var orgCode = $(this).attr("orgCode");
		
		UI.util.showCommonWindow("/efacecloud/page/dispatched/addTemporaryLibrary.html?" +
				"storeId=" + storeId + "&storeName=" + storeName +
				"&orgCode=" + orgCode + "&isLocal=0", "修改库", 
				442, 610, function(){ doSearch(); });
	});
	
	$("body").on("click", ".reStationing", function(){
		var dbId = $(this).attr("dbId");

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
		var taskNum = $(this).attr("taskNum");
		
		if (parseInt(taskNum) > 0){
			UI.util.alert("此布控库已被添加到布控任务，请先从对应布控任务移除此库", "warn");
			return;
		}
		
		var url = "case/store/proxy";
		var param = {};
		
		param.PURI = "deletelocalstore";
		param.StoreID = storeId;
		

		UI.util.confirm("是否删除选择的库？", function(){
			UI.control.remoteCall(url, param, function(resp){
				if (resp.StatusCode == 0){
					UI.util.alert("删除成功");
					doSearch();
				}
			});
		});
	});
	
	$("body").on("click", ".importBtn", function(){
		var dbId = $(this).attr("dbId");
		var userCode = $(this).attr("userCode");
		var storeName=$(this).attr('storeName');
		UI.util.showCommonWindow("/efacecloud/page/dispatched/importSynchronizaedLibrary.html" +
				"?dbId=" + dbId + "&userCode=" + userCode + "&time=" + new Date() + "&storeName=" + storeName, "导入", 
				800, 700, function(obj){
					doSearch();
				});
	});
}

function doSearch(){
	queryParam.StoreName = $("#storeName").val();
	queryParam.RegionID = $("#orgCode").val();
	UI.control.getControlById("SYNC_DB_LIST").reloadData(null, queryParam);
}

function renderNum(storeNum){
	if (storeNum==null || storeNum==""){
		return 0;
	}
	return storeNum;
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