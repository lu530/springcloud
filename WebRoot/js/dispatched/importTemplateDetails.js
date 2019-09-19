var uuid = UI.util.getUrlParam('uuid')||"";
var exportFlag = false;

$(function(){
	UI.control.init();
	initEvent();
	initPage(uuid);
});

function initEvent(){
	
	$(".sureBtn").click(function(){
		closeWindow();
	});
	
	$(".cancelBtn").click(function(){
		closeWindow();
	});
	
	$("#export").click(function(){
		if (exportFlag == false) {
			var url = UI.control.getRemoteCallUrl("surveilImport/manage/export?UUID=" + uuid);
			$("#personExport").attr("src",url);
		}else {
			UI.util.alert("您已经导出过一次，暂不允许重复导出","warn");
		}

		exportFlag = true;
	});	
	
}

function closeWindow(){
	parent.UI.util.closeCommonWindow();
}

function initPage(uuid){
	
	if (uuid !="") {
		UI.control.remoteCall("surveilImport/manage/queryErrorData",{UUID:uuid},function(resp){
			$('tbody').html(tmpl("detailTmpl",resp.data));
		})
		
	}
}