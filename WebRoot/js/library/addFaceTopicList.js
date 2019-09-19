/**
 * @Author lzh
 * @version 2017-08-09
 * @description 添加专题库人脸；
 */
var BIRTHDAY = $('#BIRTHDAY');
var addressOption = {
		'elem':['domicile','nowAddress'],//地址HTML容器
		'addressId':['registerAreaList','addressArea'],//初始化省级内容
		'service':'face/address/getTree',//请求服务
		'tmpl':'childNodeListTemplate',//初始化模板
		'selectArr':['PERMANENT_ADDRESS','PRESENT_ADDRESS']
		/*'data':['150623','440111'],//回填值*/
		/*'callback':doSearch//回调函数*/
}

var pageType = UI.util.getUrlParam('pageType'); //操作类型
var SOURCE_DB = UI.util.getUrlParam('SOURCE_DB'); //源专题库id
var info_id = UI.util.getUrlParam('info_id'); //专题库人脸标识
$(function(){
	UI.control.init();
    initTime();
	initEvent();
	initAreaTree(addressOption);
	topUploadPic();
    fixation();//保存按钮定位判断
    passport('IDENTITY_TYPE','IDENTITY_ID',false);
});

function initEvent(){
	if (pageType == "edit"||pageType == "detail") {
		initWaterMark();
		UI.control.remoteCall("face/specialPic/queryById",{INFO_ID:info_id, DB_ID: SOURCE_DB },function(resp){
			var faceData = resp.info;
            addressOption.data = [faceData.PERMANENT_ADDRESS||"",faceData.PRESENT_ADDRESS||""];
			UI.util.bindForm($("#mobileForm"),faceData);
			$("#filterImg").attr("src",faceData.PIC);
            //回填时 如果有证件号码了，就不能编辑；
            if($("[name='IDENTITY_ID']").val()){
                $("[name='IDENTITY_TYPE']").attr("disabled","");
                $("[name='IDENTITY_ID']").attr("disabled","");
            };
            if(pageType=="detail"){
                noEdit(".form-control","[type='radio']",'.time-control');
                $('.form-head-title').find('span').text('专题库人脸详情');
                setInterval(function () {
                    $("#picNoEdit").show();
                },50);
                $("#submitBtn").remove();
            }else {
                $('.form-head-title').find('span').text('编辑专题库人脸');
                setInterval(function () {
                    $("#picNoEdit").show();
                },50);
                $("#submitBtn").click(function() {
                    if (UI.util.validateForm($('#mobileForm'))){
                        doEditSave();
                    }
                })
            }
		});
	}else{
	    //保存
        $("#submitBtn").click(function(){
            if (UI.util.validateForm($('#mobileForm'))){
                addSave();
            }
        });
	}

	//返回父层列表
	$(".btn-close").click(function(){
		parent.UI.util.hideCommonIframe('.frame-form-full');
	});
	
}

//新增保存
function addSave(){
    var formData = UI.util.formToBean($('#mobileForm'));
    formData.SOURCE_DB = SOURCE_DB;
    ExtendRemoteCall('face/specialPic/add', formData,function () {
    	setTimeout(function(){
            parent.UI.util.hideCommonIframe('.frame-form-full');
            parent.doSearch();
            parent.parent.doRefresh();
		}, 1000);
    },"新增成功")
}

//编辑保存
function doEditSave(){
	var formData = UI.util.formToBean($('#mobileForm'));
	formData.INFO_ID = info_id;
	formData.SOURCE_DB = SOURCE_DB;
    ExtendRemoteCall('face/specialPic/edit', formData,function () {
    	setTimeout(function(){
    		parent.UI.util.hideCommonIframe('.frame-form-full');
    		 parent.doSearch();
    	}, 1000);
    },"编辑成功")
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
            maxDate:now.format("yyyy-MM-dd")
        });
    });
}


/*
 * 设置元素为不可编辑；
 * @param {arr} arguments : 需要禁止编辑 的 元素的jq 选择器
 * @author：lzh
 */
function noEdit() {
    for(var i=0;i<arguments.length;i++){
        $(arguments[i]).attr("readonly","").attr("disabled","");
    }
}