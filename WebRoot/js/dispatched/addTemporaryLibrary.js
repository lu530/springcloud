var regionId = UI.util.getUrlParam("regionId")||'';
var storeId = UI.util.getUrlParam("storeId")||'';
var storeName = UI.util.getUrlParam("storeName")||'';
var orgCode = UI.util.getUrlParam("orgCode")||'44';
var isLocal = UI.util.getUrlParam("isLocal")||'1';

$(function() {

	UI.control.init();
	initEvent();
//	initTreeEvent();
});

function initEvent() {
	//0常控库，1临控库
	isLocal == '0' ? $("#localHide").removeClass("hide") : $("#localHide").addClass("hide"); 
	isLocal == '1' ? $("#sizeHide").removeClass("hide") : $("#sizeHide").addClass("hide"); 
	//回填数据
	$("#storeName").val(storeName);
	$("#orgCode").val(orgCode);
	
	$("#confirmBtn").click(function(){
		if (isLocal == '0' && $("#SDBID").val()==""){
			UI.util.alert("原始库ID不能为空", "warn");
			return;
		}
		if ($("#storeName").val()==""){
			UI.util.alert("库名称不能为空", "warn");
			return;
		}
		if(!UI.util.validateForm($('body'))) {
			return;
		}
		var url = "person/control/addLib";
		var message = "添加成功";
		var param = {};
		
		

		if (storeId!=""){
			message = "修改成功";
			param.StoreID = storeId;
			
		}
		

		param.StoreName = $("#storeName").val();
		param.StoreSize = $("#storeSize").val();
		param.CreateTime = new Date().format("yyyy-MM-dd HH:mm:ss");
		param.SdbId = $("#SDBID").val();
		param.StoreType = 1;
		param.Range = 0;
		param.isLocal = isLocal;
		param.regionId = regionId;
		UI.control.remoteCall(url, param, function(resp){

			if (resp.status ==true){
				UI.util.alert(resp.message);
				parent.UI.util.returnCommonWindow(null);
				windowClose();
			}else{
				UI.util.alert(resp.message,'warn');
			}
		});
	});
	
	$("#cancelBtn").click(function(){
		windowClose();
	});
	
}

function windowClose(){
	parent.UI.util.closeCommonWindow();
}

function initTreeEvent(){
	var orgTree = UI.control.getControlById("orgTree");
	orgTree.bindEvent("onClick", function(event, treeId, treeNode) {
		UI.util.debug(treeNode);
		$("#orgCode").val(treeNode.id);
	});
	
	var nodes = orgTree.transformToArray(orgTree.getNodes());
	for (var i=0; i < nodes.length; i++) {
		if(nodes[i].id==orgCode){
			orgTree.selectNode(nodes[i]);
		}
	}
}