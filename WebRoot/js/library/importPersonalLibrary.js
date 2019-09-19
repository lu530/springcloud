var ERR_MSG = "上传的文件不能超过200M！！！";
var StoreID = UI.util.getUrlParam("StoreID") ||""; 
var libType = UI.util.getUrlParam("libType")|| 'personalLib' ; //库类型，默认为人员档案库
var libID = UI.util.getUrlParam("libID")|| '' ; //库ID
var IS_TEMP = UI.util.getUrlParam("IS_TEMP") || 0;

$(function(){
	UI.control.init();
	initEvent();
	initImportType();
});
function initEvent(){
	// 布控库存，分临控库和非临控库
	if( libType == 'dispatchedLib' ){ //布控库
		ctrlHideOrShow();
	}
	$("#savePersonBtn").click(function() {
		var $dataFile = $('#dataFile');
		var uuid = getUuid();	
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
		
	   
	    UI.util.showLoadingPanel();
	    
	    if( libType == 'personalLib' ){  //人员档案库    	
	    	param.PERSON_TAG = $('#personTab').attr('persontab') || "";
	    	param.PERSON_TAG_DB = $('#personTab').attr('persontab-dbid') || "";
	    	UI.upload.uploadFile('oss', 'dataFile', '/efacecloud/rest/v6/face/archives/import', '', uploadSuccess, param);
	    	
	    }else if( libType == 'themeLib' ){ //专题库
	    	$('#personTagsList').addClass('hide');
	    	param.SOURCE_DB = libID;
	    	UI.upload.uploadFile('oss', 'dataFile', '/efacecloud/rest/v6/face/specialPic/import', '', uploadSuccess, param);
	    	
	    }else if( libType == 'passengersFaceLib' ){ //旅客人脸库
            $('#personTagsList').addClass('hide');
            param.SOURCE_DB = libID;
            UI.upload.uploadFile('oss', 'dataFile', '/efacecloud/rest/v6/face/specialPic/import', '', uploadSuccess, param);

        }else if( libType == 'dispatchedLib' ){ //布控库
	    	/*$('#personTagsList').addClass('hide');*/
	    	/*param.DB_ID = libID;
            var copy = UI.util.getUrlParam("copy")|| '' ;
            if(copy==1){
                UI.upload.uploadFile('oss', 'dataFile', '/efacecloud/rest/v6/face/hw/dispatchedPerson/import', '', uploadSuccess, param);//efacecound-st
			}else {
                UI.upload.uploadFile('oss', 'dataFile', '/efacecloud/rest/v6/face/dispatchedPerson/import', '', uploadSuccess, param);
			}*/
        	if(IS_TEMP == 0){  // 非临控库
        		param.DB_ID = libID;
            	param.IS_TEMP = IS_TEMP;
            	param.PERSON_TAG = caseCode || "";
        	}
        	if(IS_TEMP == 1){  // 临控库
        		param.DB_ID = libID;
        		param.IS_TEMP = IS_TEMP;
        		param.PERSON_TAG = caseCode || "";
        		var curParam = UI.util.formToBean($(".linFlag"));
        		$.extend(param, curParam);
        	}
        	UI.upload.uploadFile('oss', 'dataFile', '/efacecloud/mx/v6/face/dispatchedPerson/import', '', uploadSuccess, param);
        	
	    }else if( libType == 'mobileLib' ){ //移动终端库
	    	param.PERSON_TAG = $('#personTab').attr('persontab') || "";
	    	UI.upload.uploadFile('oss', 'dataFile', '/efacecloud/mx/v6/face/dispatchedPerson/import', '', uploadSuccess, param);
	    	
	    }else if( libType == 'favoriteLib' ){ //我的收藏夹
	    	$('#personTagsList').addClass('hide');
	    	param.PERSON_TAG = $('#personTab').attr('persontab') || "";
	    	param.FAVORITE_ID = libID;
	    	UI.upload.uploadFile('oss', 'dataFile', '/efacecloud/rest/v6/face/favoriteFile/import', '', uploadSuccess, param);
	    }
	    
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

var breakOpts = {
	'elem': '#filterBread',
	'selectDataArr':[],
	// 'selectDataArr':["0101","0102","0202"],
	'service': 'facestore/personTag/list',
	'callback': setPersonTag
}
var caseCode;
function initImportType(){
	
	switch( libType ){
		case 'themeLib':
		/*case 'dispatchedLib':	*/
		case 'favoriteLib':
		case 'passengersFaceLib':
			$('#personTagsList').addClass('hide');
		  break;
		default:
//			initPersonTab();
			initBreak(breakOpts);
	}
	
}
function setPersonTag(code){
	caseCode = code;
}
function initPersonTab(){
	UI.control.remoteCall("face/personTag/list",{},function(resp){
		$('#personTab').append(tmpl("tagTemplate", resp.data));
	});
	selectedTag();
}

//个人档案库导入
function uploadSuccess(data){
	
	parent.UI.util.returnCommonWindow(data);
	parent.UI.util.closeCommonWindow();
	
	/*if(data.CODE == 0){
		var fileID = data.ERROR_FILE_ID;
		var url = "face/archives/exportErrorMsg?ERROR_FILE_ID=" + data.ERROR_FILE_ID ;
		//	UI.util.alert(data.MESSAGE);
		importingData( data.SUCCESS_COUNT, data.FAIL_COUNT , url);
		windowClose();
	}else if(data.CODE == 1){
		UI.util.alert(data.MESSAGE,'wran');
	}*/
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
function ctrlHideOrShow(){
	if(IS_TEMP == 0){
		$('.linFlag').each(function(){
			$(this).addClass('hide');
		})
	}
}
