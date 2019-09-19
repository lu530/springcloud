var dbId = UI.util.getUrlParam("dbId");
var userCode = UI.util.getUrlParam("userCode");
var storeName=UI.util.getUrlParam("storeName");
var host = window.location.host;
var obj = null;

window.onload = function () {
};

$(function(){
	initEvents();
})

function initEvents(){
	obj = document.getElementById('imgPrc');        //获取对象

	if (!obj.Version){
		UI.util.alert("导入控件没安装或版本过低！<a href='/VMOCX/ocx/FaceControlSPActiveX.msi'>下载</a>", 'error');
		closeWindow();
		return;
	}
	
	setTimeout(function(){
		var url = "http://"+host+"/efacecloud/api/rest";
		obj.InitControl(url,dbId,userCode);//加载控件
	},200);
	
	$("#cancelBtn").click(function(){
		closeWindow();
	});
}

function closeWindow(){
	obj.DeInitControl();//卸载控件
	parent.UI.util.closeCommonWindow();
}