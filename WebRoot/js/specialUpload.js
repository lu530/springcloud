// 头部图片上传组件
 function topSpecialUploadPic() {

	 var threshold = $('#threshold').val();

     //上传图片
     $("body").on('change','.searchImgButton',function(){
    	 var upImgId = $(this).attr('id');
    	 var file;
    	 var maxSize = 1024 * 1024 * 10;
		 var fileFormat = /\.(JPG|JPEG|PNG|BMP)$/i;
    	 if ((file = $(this)[0].files[0])) {
			 if (!fileFormat.test(file.name)) {
				 UI.util.alert("上传图片格式错误，请上传JPG/JPEG/PNG/BMP格式文件", "warn");
				 $(this).val("");
				 return;
			 }

			 if (file.size > maxSize) {
				 UI.util.alert("上传超过10M图片限制，请重新上传", "warn");
				 $(this).val("");
				 return;
			 }
		 } else {
    	 	return;
		 }

    	 ajaxFileUploadSpecial(upImgId,picSuccFunctionSpecial);
    	 if(similayDec){
    		 similayDec();
    	 }
     });

     //删除图片
     $('body').on('click','#deleteImgBtn',function (){
         fileUrl = '';
         $('#filterImg').attr('src', '/efacecloud/images/noPhoto2.png');
         $("#uploadImg").val("");
         $(this).parent('ul').siblings('input[foruploadform]').val("");
         //恢复默认值
         $('#threshold').val(threshold);

         $('.bottom-pic-bar').addClass('hide');
         global.fileid = '';
         if(timeDecFun){
        	 timeDecFun();
         }
     });

 }

 /**
  * 图片上传执行方法
  * @param {String} fileElementId : 上传元素id
  * @param {function} succFunction : 图片上传成功回调方法
  * @author：lwb
  */
 function ajaxFileUploadSpecial(fileElementId,succFunction) {
	 var orgFileName = $('#'+fileElementId).val();
	 var pointArr = [];
	$.each(orgFileName,function(i,n){
		if(n == '.'){
			pointArr.push(i);
		}
	});
	var pointIndex = pointArr[pointArr.length-1];

	var postfix = orgFileName.substring(pointIndex+1,orgFileName.length);

	var upperCasePostFix = postfix.toLocaleUpperCase();

	if(!(upperCasePostFix=='JPG'||upperCasePostFix=='PNG'||upperCasePostFix=='JPEG'||upperCasePostFix=='BMP')){
		UI.util.alert(postfix+'文件不是支持的文件类型！目前仅支持JPG|PNG|JPEG|BMP文件','warn');
		return false;
	}
	UI.util.showLoadingPanel();
		$.ajaxFileUpload({
			url : global.baseUrl,
			type: 'post',
			secureuri : false,
			fileElementId : fileElementId,
			dataType : 'text',
			data : {'FILE_TYPE':'picture','IS_THUMB':'1'},
			success : succFunction,
			error : function(data, status, e) {
			UI.util.debug(data);
			UI.util.debug(status);
			UI.util.hideLoadingPanel();
			}
		});
		return true;
 }


 /**
  * 图片上传成功的回调处理
  * @param {object} data : 图片上传成功返回对象
  * @param {String} status : 图片上传状态
  * @author：lwb
  */

 global.fileid = '';
 function picSuccFunctionSpecial(data, status) {

 	var fileElementId =  this.fileElementId;
 		data = eval("(" + data + ")");
 	var fastDfs = null;
 	var server = "", port = "", url = "";

 	if (data && !data.error) {

 		if(data.fastDfsParam){
 			fastDfs = data.fastDfsParam;
 			server = fastDfs.server;
 			port = fastDfs.port;
 			url = "http://";
 		}
 		var fileId = data.id;

 		if(fileId.indexOf("http:")>=0){
 			url = fileId;
 		}else{
 			url += server+":"+port+"/"+fileId;

 	 		if (data.fastDfsParam && data.fastDfsParam.fullUrl) {
 	 			url = data.fastDfsParam.fullUrl;
 	 		}
 		}

 		//fileid = getFileid(url);

 		getFileid(url,false,fileElementId);


 	} else {
 		UI.util.alert("上传失败！",'warn');
 		UI.util.hideLoadingPanel();
 	}

 	return true;
 }

function getFileid(url,bool,fileElementId){

	UI.control.remoteCall("face/common/fileUpload",{PIC: url}, function(resp){
		if( resp && resp.CODE == 0 && resp.FILE_ID != ''){
			global.fileid = fileid = resp.FILE_ID;

			if(!bool){

				$(fileElementId).val('');
				$('[foruploadform*="'+ fileElementId +'"]').val(url);
				$('[foruploadimg*="'+ fileElementId +'"]').attr("src", url);

				var picBar = $('.bottom-pic-bar');
				if(picBar.length!=0){
					picBar.removeClass('hide');
				}

				if($(".arithmetic-tools.on").length==0){ //如果没有选中的算法，默认选择第一种；
					$(".arithmetic-tools:eq(0) i").trigger('click');
				}

                UI.util.alert("上传成功！");
			}
		}else{
			UI.util.alert("上传失败！" + resp.MESSAGE,'warn');
		}
		UI.util.hideLoadingPanel();
	},function(){
		UI.util.hideLoadingPanel();
	});
	return global.fileid;
}
