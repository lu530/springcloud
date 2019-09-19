var MAX_SIZE = 200*1024*1024;//200M
var ERR_MSG = "上传的文件不能超过200M！！！";

$(function(){
	UI.control.init();
	initEvents();
});

function initEvents(){
	//确定
	$("#savePersonBtn").click(function() {
		var $dataFile = $('#dataFile');
		var param ={};
	    
		if( !$dataFile.val() ){
			UI.util.alert("请选择上传文件","warn");
			return;
			
		}else if( !$dataFile.val().endsWith(".zip") ){
			$('#LIBRARY_FILE').val("");
			$dataFile.val("");
			UI.util.alert("文件格式有误","warn");
			return;
		}
		
		if(document.getElementById('dataFile').files[0].size > MAX_SIZE){
			$dataFile.val("");
			UI.util.alert(ERR_MSG,"warn");
			return;
		}
		
    	UI.upload.uploadFile('oss', 'dataFile', '/efacecloud/rest/v6/face/redlist/import', '', uploadSuccess, param);
	});
	
	
	//取消上传图片
	$('body').on('click','#cancelBtn',function (){
		parent.UI.util.closeCommonWindow();
	});
	
	//选择文件
	$("body").on('change', '#dataFile',function(){
		$("#LIBRARY_FILE").val($(this).val());		
	});
}

//导入
function uploadSuccess(data){
	parent.UI.util.returnCommonWindow(data);
	parent.UI.util.closeCommonWindow();
}

String.prototype.endsWith = function(str) {
	var reg = new RegExp(str + "$");
	
	return reg.test(this);
}
