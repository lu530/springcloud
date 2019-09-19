var MAX_SIZE = 200*1024*1024;//200M
var ERR_MSG = "上传的文件不能超过200M！！！";
var StoreID = UI.util.getUrlParam("StoreID") ||""; 

$(function(){
	UI.control.init();
	initEvents();
	initPersonTab();
});
function initEvents(){
	
	
	$("#savePersonBtn").click(function() {
		var $dataFile = $('#dataFile');
		var uuid = getUuid();	
	    var param ={};
	    param.PERSON_TAG = $('#personTab').attr('persontab');
	    param.PERSON_TAG_DB = $('#personTab').attr('persontab-dbid');
	    
	    if( !param.PERSON_TAG ){
	    	UI.util.alert("请选择人员标签","warn");
	    	return;
	    }
	    
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
	   
	    UI.util.showLoadingPanel();
	    
		// 使用oss上传
	    UI.upload.uploadFile('oss', 'dataFile', '/efacecloud/rest/v6/face/archives/import', '', uploadSuccess, param);
	    
	});
	
	
	//取消上传图片
	$('body').on('click','#cancelBtn',function (){
		windowClose();
	});
	
	//
	$("body").on('click', '#selectFile',function(){
		UI.util.showCommonWindow("/caseanalysis/page/case/collectionFolder.html", "收藏文件夹", 
				600, 450, function(obj){
			showImportFile();
		});
	});
	
	//选择文件
	$("body").on('change', '#dataFile',function(){
		
		$("#LIBRARY_FILE").val($(this).val());		
	});
}


function initPersonTab(){
	
	UI.control.remoteCall("face/personTag/list",{},function(resp){
		$('#personTab').append(tmpl("tagTemplate", resp.data));
	});
	selectedTag();
}

function uploadSuccess(data){
	
	var fileID = data.ERROR_FILE_ID;
	var url = "face/archives/exportErrorMsg?ERROR_FILE_ID=" + data.ERROR_FILE_ID ;
	
	if(data.CODE == 0){
		//	UI.util.alert(data.MESSAGE);
		importingData( data.SUCCESS_COUNT, data.FAIL_COUNT , url);
		windowClose();
	}else if(data.CODE == 1){
		UI.util.alert(data.MESSAGE,'wran');
	}
	
	
	//UI.util.alert('上传成功');
}

function showImportFile(){
	$('#importFiles').removeClass('hide');
	
}


function windowClose(){
	parent.UI.util.closeCommonWindow();
}


function showLoadingPanel(){
	$('.loading-panel').removeClass('hide');
}
function hideLoadingPanel(){
	$('.loading-panel').addClass('hide');
}
