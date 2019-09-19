$(function (){
	initEvent();
});

function initEvent(){
	//保存
	$("#saveBtn").click(function(){
		var $input = $(":checked"),
			controlNamesArr = [],
			controlCodesArr = [];
		$.each($input,function(i,n){
			controlNamesArr.push($(n).parent().text());
		});
		
		if(controlNamesArr.length==0){
			UI.util.alert("请选择数据","warn");
		}else{
			var deviceData = {
					controlNames:controlNamesArr.join(","),
					controlCodes:controlCodesArr.join(",")
			}
			parent.UI.util.returnCommonWindow(deviceData);
			parent.UI.util.closeCommonWindow();
		}
	});
	
	//取消
	$("#cancelBtn").click(function(){
		parent.UI.util.closeCommonWindow();
	});
}