var BIRTHDAY = $('#BIRTHDAY');
var favoriteId = UI.util.getUrlParam('favoriteId');
var pageType = UI.util.getUrlParam('pageType');
var fileId = UI.util.getUrlParam('fileId');
var addressOption = {
		'elem':['domicile','nowAddress'],//地址HTML容器
		'addressId':['registerAreaList','addressArea'],//初始化省级内容
		'service':'face/address/getTree',//请求服务
		'tmpl':'childNodeListTemplate',//初始化模板
		'selectArr':['PERMANENT_ADDRESS','PRESENT_ADDRESS']
		/*'data':['150623','440111'],//回填值*/
		/*'callback':doSearch//回调函数*/
}
var personTagCodeArr = [];

$(function () {
	UI.control.init();
	//initPersonTab();
    initEvent();
    initTime();
    initEdit();
    initAreaTree(addressOption);
  //上传头部
    topUploadPic();
    passport();
    fixation();
});

function initPersonTab(){
	UI.control.remoteCall("face/personTag/list",{},function(resp){
		$('#personTab').append(tmpl("tagTemplate", resp.data));
	});
}

function initEdit(){
	if (pageType == "edit") {
		initWaterMark();
		$('.form-head-title').find('span').text('编辑收藏夹人脸');

		UI.control.remoteCall("face/favoriteFile/detail",{FILE_ID:fileId},function(resp){
			var faceData = resp.FACE_DETAIL_DATA[0];
			addressOption.data = [faceData.PERMANENT_ADDRESS||'',faceData.PRESENT_ADDRESS||''];
			$.each(resp.PERSON_TAG_DATA,function(i,n){
				$("#personTab .tag-item[tagcode='"+n.TAG_CODE+"']").addClass("active");
			});
			UI.util.bindForm($("#messageForm"),faceData);
			$("#filterImg").attr("src",faceData.PIC);
		});		

		$("#submitBtn").click(function() {
			doEditSave();
		})
	}else{
		
		$("#submitBtn").click(function() {
			doSave();
		})
		
	}
}

function initEvent(){
	
	$("#personTab").on("click",".tag-item",function(){
		var $this = $(this);
		var tagcode = $this.attr("tagcode");
		if($this.hasClass("active")){
			$this.removeClass("active");
			var index = personTagCodeArr.indexOf(tagcode);
			personTagCodeArr.splice(index, 1);
		}else{
			$this.addClass("active");
			personTagCodeArr.push(tagcode);
		}
		
		$("#personTagVal").val(personTagCodeArr.toString());
	})
	
	//返回
	$('.btn-close').click(function(){
		parent.UI.util.hideCommonIframe('.frame-form-full');
	});
	
	//删除图片
	$("body").on("click",".delete-img-btn",function(){
		$(this).parents(".image-item").remove();
		$(".image-item:last").removeClass("hide");
	});
	
	$(".page-title .back-btn").click(function(){
		parent.UI.util.hideCommonIframe('.frame-form-full');
	});
}




function doSave(){
	if (UI.util.validateForm($('#messageForm'))){
		var formData = UI.util.formToBean($('#messageForm'));
		formData.FAVORITE_ID = favoriteId;
		formData.FILE_SOURCE = 3;
		formData.PIC = $("#filterImg").attr("src");
		formData.SOURCE_DB_ID = '';
		formData.INFO_ID = '';
		formData.SOURCE_DB_NAME = '';
		formData.DISPATCHED_DB_ID = '';
		formData.DISPATCHED_DB_NAME = '';
		formData.CAPTURE_PIC = '';
		formData.DEVICE_ID = '';
		formData.DEVICE_NAME = '';
		formData.CAPTURE_TIME = '';
		UI.control.remoteCall('face/favoriteFile/add', formData, function(resp){
			if (resp.CODE == 0) {
				UI.util.alert(resp.MESSAGE);
				$('.btn-close').click();
				parent.UI.util.hideCommonIframe('.frame-form-full');
				parent.doSearch();
			}else{
				UI.util.alert(resp.MESSAGE,"warn");
			}

		});
	}
}

function doEditSave(){
	if (UI.util.validateForm($('#messageForm'))){
		var formData = UI.util.formToBean($('#messageForm'));
		formData.FAVORITE_ID = favoriteId;
		formData.FILE_ID = fileId;
		formData.PIC = $("#filterImg").attr("src");
		UI.control.remoteCall('face/favoriteFile/update', formData, function(resp){
			if (resp.CODE == 0) {
				UI.util.alert(resp.MESSAGE);
				$('.btn-close').click();
				parent.UI.util.hideCommonIframe('.frame-form-full');
				parent.doSearch();
			}else{
				UI.util.alert(resp.MESSAGE,"warn");
			}

		});
	}
}

function initTime(){
    var    now = new Date();
    BIRTHDAY.val(now.format("yyyy-MM-dd"));
    BIRTHDAY.focus(function(){
        WdatePicker({
        	isShowClear:false,
        	readOnly:true,
            startDate:'%y-#{%M}-%d',
            dateFmt:'yyyy-MM-dd',
            alwaysUseStartDate:true,
            maxDate: now.format("yyyy-MM-dd")
        });
    });
}