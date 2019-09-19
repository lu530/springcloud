var pageType = UI.util.getUrlParam('pageType');//用于判断新增、编辑和查看详情
var infoId = UI.util.getUrlParam('infoId')||"";
var addressOption = {
		'elem':['domicile','nowAddress'],//地址HTML容器
		'addressId':['registerAreaList','addressArea'],//初始化省级内容
		'service':'face/address/getTree',//请求服务
		'tmpl':'childNodeListTemplate',//初始化模板
		'selectArr':['PERMANENT_ADDRESS','PRESENT_ADDRESS']
		/*'data':['150623','440111'],//回填值*/
		/*'callback':doSearch//回调函数*/
}

$(function () {
	UI.control.init();
    initEvent();
    //初始化地址树
    initAreaTree(addressOption);
    //上传头部
    topUploadPic();
    //证件验证
    passport();
    //底部按钮定位
    fixation();
});

function initEvent(){
	//编辑和查看详情
	if (pageType == "edit"||pageType == "detail") {
		//水印初始化
		initWaterMark();
		$('.form-head-title').find('span').text('编辑人员档案');
		UI.control.remoteCall("face/redlist/detail",{INFO_ID:infoId},function(resp){
			if(resp.CODE == 0){
				var faceData = resp.DATA;
				//户籍地址和现住地址初始化数据回填
				addressOption.data = [faceData.PERMANENT_ADDRESS||'',faceData.PRESENT_ADDRESS||''];
				//表单回填
				UI.util.bindForm($("#messageForm"),faceData);
				//图片回填
				$("#filterImg").attr("src",faceData.PIC);
				//出生日期回填
				initTime($("#BIRTHDAY").val());
				//详情只看
				if(pageType == "detail"){
					$(".form-control,[type='radio'],.time-control").attr("readonly","readonly").attr("disabled","disabled");
					$("#picNoEdit").show();
					$("#submitBtn").addClass("hide");
				}
				
			}else{
				UI.util.alert(resp.MESSAGE,'warn');
			}
		});
	}else{
		//新建时初始化出生日期
	    initTime();
	}
	
	//保存按钮
	$("#submitBtn").click(function() {
		doSave();
	})
	
	//返回
	$('.btn-close').click(function(){
		parent.UI.util.hideCommonIframe('.frame-form-full');
	});
	
}

//保存
function doSave(){
	if (UI.util.validateForm($('#messageForm'))){
		var formData = UI.util.formToBean($('#messageForm'));
		formData.PIC = $("#filterImg").attr("src");
		formData.INFO_ID = infoId,
		formData.isAsync = true;
		UI.util.showLoadingPanel();
		UI.control.remoteCall('face/redlist/add', formData, function(resp){
			if (resp.CODE == 0) {
				if(infoId==""){
					UI.util.alert("新建成功");
				}
				else{
					UI.util.alert("修改成功");
				}
				parent.doSearch();
				parent.UI.util.hideCommonIframe('.frame-form-full');
			}else{
				UI.util.alert(resp.MESSAGE,"warn");
			}
			UI.util.hideLoadingPanel();
		},function(){},{},true);
	}
}

//出生日期控件
function initTime(time){
    var now = new Date(),
    	$birthday = $('#BIRTHDAY');
    if(time){
    	$birthday.val(time);
    }else{
    	$birthday.val(now.format("yyyy-MM-dd"));
    }
    $birthday.focus(function(){
        WdatePicker({
        	isShowClear:false,
        	readOnly:true,
            startDate:'%y-#{%M}-%d',
            dateFmt:'yyyy-MM-dd',
            maxDate:now.format("yyyy-MM-dd")
        });
    });
}