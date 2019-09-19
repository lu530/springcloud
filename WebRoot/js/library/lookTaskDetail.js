/**
 * 初始化红名单详情
 * @author fenghuixia
 * 2018-03-08
 */
var taskId = UI.util.getUrlParam("taskId")||"";

$(function(){
	initData();
});

function initData(){
	UI.util.showLoadingPanel();
	UI.control.remoteCall("face/redTask/detail",{TASK_ID:taskId},function(resp){
		$("#filterImg").attr("src",resp.list[0].SEARCH_PIC);
		$("#dataList").html(tmpl("faceTemplate",resp.list));
		UI.util.hideLoadingPanel();
	},function(){},{},true);
}

function randerImg(url){
	var imgUrl = '/ui/plugins/eapui/img/nophoto.jpg';
	if(url && url!=''){
		imgUrl = url;
	}
	return imgUrl;
}