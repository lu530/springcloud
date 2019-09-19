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
var infoId = UI.util.getUrlParam('infoId');
var pageType = UI.util.getUrlParam('pageType');
var personTagCodeArr = [];

$(function(){
	UI.control.init();
	initPersonTab();
	initEvent();
	initAreaTree(addressOption);
	topUploadPic();
    passport();
	fixation();
	initWaterMark();
});

function initPersonTab(){
	UI.control.remoteCall("face/personTag/list",{},function(resp){
		$('#personTab').append(tmpl("tagTemplate", resp.data));
	});
}
function initEvent(){
	
	if (pageType == "edit") {
		$('.form-head-title').find('span').text('编辑移动终端人脸');
		UI.control.remoteCall("face/terminal/detail",{INFO_ID:infoId},function(resp){
			if(resp.CODE == 0){
				var data = resp.DATA;
				var personTagArr = data.PERSON_TAG.split(",");
				addressOption.data = [data.PERMANENT_ADDRESS||'',data.PRESENT_ADDRESS||''];
				$.each(personTagArr,function(i,n){
					$("#personTab .tag-item[tagcode='"+n+"']").addClass("active");
				});
				$("#personTagVal").val(data.PERSON_TAG);
				UI.util.bindForm($("#mobileForm"),data);
				$("#filterImg").attr("src",data.PIC);
				initTime($("#BIRTHDAY").val());
			}else{
				UI.util.alert(resp.MESSAGE,"warn");
			}
		});		

		$("#submitBtn").click(function() {
			doEditSave();
		})
	}else{
		
		initTime();
		
		$("#submitBtn").click(function() {
			doSave();
		});
		
		//人员标签
		$("#personTab").on("click",".tag-item",function(){
			var $this = $(this);
			var $tagItmeList = $(this).parent();
			var tagcode = $this.attr("tagcode");
			
			personTagCodeArr = $("#personTagVal").val().split(",");
			if($this.hasClass("active")){
				$this.removeClass("active");
				var index = personTagCodeArr.indexOf(tagcode);
				personTagCodeArr.splice(index, 1);
			}
            else if($this.attr('select-type')){ //如果有标签分组的情况
                var type = $this.attr('select-type');
                if (tagcode == '01' || tagcode == '14' ||tagcode == '15') {
                	$this.addClass("active").siblings('[select-type="'+type+'"]').removeClass('active');
                } else {
                	$this.addClass("active").siblings('[tagcode="01"]').removeClass('active');;
                }
                personTagCodeArr  = [];
                $.each($tagItmeList.find('.tag-item.active'),function (i,o) {
                    personTagCodeArr.push($(o).attr('tagcode'));
                })
            }
			else{
				$this.addClass("active");
				personTagCodeArr.push(tagcode);
			}
			
			$("#personTagVal").val(personTagCodeArr.toString());
		});
		
	}
	
	//返回父层列表
	$(".btn-close").click(function(){
		parent.UI.util.hideCommonIframe('.frame-form-full');
	});
}

function doSave(){
	if (UI.util.validateForm($('#mobileForm'))){
		UI.util.showLoadingPanel();
		var formData = UI.util.formToBean($('#mobileForm'));
		formData.INFO_ID = '';
		formData.PIC = $("#filterImg").attr("src");
		UI.control.remoteCall('face/terminal/add', formData, function(resp){
			if (resp.CODE == 0) {
				setTimeout(function(){
					UI.util.alert(resp.MESSAGE);
					UI.util.hideLoadingPanel();
					parent.doSearch();
					parent.UI.util.hideCommonIframe('.frame-form-full');
				},1500);
			}else{
				UI.util.alert(resp.MESSAGE,"warn");
				UI.util.hideLoadingPanel();
			}
		},function(){},{},true);
	}
}

function doEditSave(){
	if (UI.util.validateForm($('#mobileForm'))){
		UI.util.showLoadingPanel();
		var formData = UI.util.formToBean($('#mobileForm'));
		formData.INFO_ID = infoId;
		formData.PIC = $("#filterImg").attr("src");
		UI.control.remoteCall('face/terminal/add', formData, function(resp){
			if (resp.CODE == 0) {
				setTimeout(function(){
					UI.util.hideLoadingPanel();
					UI.util.alert(resp.MESSAGE);
					parent.doSearch();
					parent.UI.util.hideCommonIframe('.frame-form-full');
				},1500);
			}else{
				UI.util.alert(resp.MESSAGE,"warn");
				UI.util.hideLoadingPanel();
			}
		},function(){},{},true);
	}
}

function initTime(time){
    var    now = new Date();
    if(time){
    	BIRTHDAY.val(time);
    }else{
    	BIRTHDAY.val(now.format("yyyy-MM-dd"));
    }
    BIRTHDAY.focus(function(){
        WdatePicker({
        	isShowClear:false,
        	readOnly:true,
            startDate:'%y-#{%M}-%d',
            dateFmt:'yyyy-MM-dd',
            maxDate:now.format("yyyy-MM-dd")
        });
    });
}