var BIRTHDAY = $('#BIRTHDAY');
var pageType = UI.util.getUrlParam('pageType');
var personId = UI.util.getUrlParam('personId')||"";
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
var personTagIdArr = [];


$(function () {
	UI.control.init();
	initPersonTab();
    initEvent();
    initAreaTree(addressOption);
  //上传头部
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
		$('.form-head-title').find('span').text('编辑人员档案');
		setInterval(function () {
            $("#picNoEdit").show();
        },50);
		UI.control.remoteCall("face/archives/personDetail",{PERSON_ID:personId},function(resp){
			var faceData = resp.DATA;
			addressOption.data = [faceData.PERMANENT_ADDRESS||'',faceData.PRESENT_ADDRESS||''];
			$.each(faceData.PERSON_TAG_LIST,function(i,n){
				$("#personTab .tag-item[tagcode='"+n.TAG_CODE+"']").addClass("active");
			});
			UI.util.bindForm($("#messageForm"),faceData);
			$("#filterImg").attr("src",faceData.PIC);
			$("#IDENTITY_TYPE").attr("disabled","disabled");
			$("#IDENTITY_ID").attr("readonly","readonly");  //编辑时证件号码和证件类型不可修改
			initTime($("#BIRTHDAY").val());
		});
	}else{

	    initTime();
		
		$("#personTab").on("click",".tag-item",function(){
			var $this = $(this);
            var $tagItmeList = $this.parent();
			var tagcode = $this.attr("tagcode");
			var dbid = $this.attr("dbId");
			if($this.hasClass("active")){
				$this.removeClass("active");
				var codeIndex = personTagCodeArr.indexOf(tagcode);
				var idIndex = personTagIdArr.indexOf(dbid);
				personTagIdArr.splice(idIndex, 1);
				personTagCodeArr.splice(codeIndex, 1);
			}
            else if($this.attr('select-type')){ //如果有标签分组的情况
                var type = $this.attr('select-type');
                if (tagcode == '01' || tagcode == '14' ||tagcode == '15') {
                	$this.addClass("active").siblings('[select-type="'+type+'"]').removeClass('active');
                } else {
                	$this.addClass("active").siblings('[tagcode="01"]').removeClass('active');;
                }
                
                personTagIdArr  = [];
                personTagCodeArr  = [];
                $.each($tagItmeList.find('.tag-item.active'),function (i,o) {
                    personTagIdArr.push($(o).attr('dbId'));
                    personTagCodeArr.push($(o).attr('tagcode'));
                })
            }
			else{
				$this.addClass("active");
				personTagCodeArr.push(tagcode);
				personTagIdArr.push(dbid);
			}
			
			$("#personTagVal").val(personTagCodeArr.toString());
			$("#personTagDb").val(personTagIdArr.toString());
		})
	}
	
	$("#submitBtn").click(function() {
		doSave();
	})
	

	
	//返回
	$('.btn-close').click(function(){
		parent.UI.util.hideCommonIframe('.frame-form-full');
	});
	
	$(".page-title .back-btn").click(function(){
		parent.UI.util.hideCommonIframe('.frame-form-full');
	});
}

function doSave(){
	if (UI.util.validateForm($('#messageForm'))){
		var formData = UI.util.formToBean($('#messageForm'));
		formData.PIC = $("#filterImg").attr("src");
		formData.PERSON_ID = personId,
		formData.isAsync = true;
		UI.util.showLoadingPanel();
		UI.control.remoteCall('face/archives/addPerson', formData, function(resp){
			if (resp.CODE == 0) {
				if(personId==""){
					UI.util.alert("新建成功");
				}
				else{
					UI.util.alert("修改成功");
				}
				$('.btn-close').click();
				parent.UI.util.hideCommonIframe('.frame-form-full');
				parent.doSearch();
			}else{
				UI.util.alert(resp.MESSAGE,"warn");
			}
			UI.util.hideLoadingPanel();
		},function(){},{},true);
	}
}

/*function doEditSave(){
	if (UI.util.validateForm($('#messageForm'))){
		var formData = UI.util.formToBean($('#messageForm'));
		formData.PERSON_ID = PERSON_ID;
		formData.PIC = $("#filterImg").attr("src");
		UI.control.remoteCall('face/archives/addPerson', formData, function(resp){
			if (resp.CODE == 0) {
				UI.util.alert("修改成功,请刷新");
				$('.btn-close').click();
				parent.UI.util.hideCommonIframe('.frame-form-full');
				parent.doSearch();
			}else{
				UI.util.alert(resp.MESSAGE,"warn");
			}

		});
	}
}*/

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