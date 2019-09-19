var pageType = UI.util.getUrlParam("pageType") || '-1';
var StoreID = UI.util.getUrlParam("StoreID") || '-1';
var PortraitID = UI.util.getUrlParam("PortraitID") || '-1';
var type = UI.util.getUrlParam("type") || '-1';
var isLocal = UI.util.getUrlParam("isLocal") || '-1'; //1常控2临控

var userInfo = {};
var MainFaceImgID = '';
var imgUrl="";
$(function(){
	UI.control.init(["userInfo"]);
	userInfo = UI.control.getUserInfo();
	initData(userInfo);
	initBtnEvents();
	initTime("commenceDate","failureTime");
	initCollapsing();
});

function initData(userInfo){
	if(type == -1){
		$("#control").prop("checked", true);
	}
//	if (PortraitID == '-1'){
//		$("#UserCode").val(userInfo.code);
//		$("#Monitor").val(userInfo.name);
//		$("#MonitorDept").val(userInfo.dept.name);
//		$("#MonitorPhone").val(userInfo.telephone);
//		return;
//	}
	
//	UI.util.showLoadingPanel('');
	
	UI.control.remoteCall('person/control/getPersonDetail', {
		StoreID: StoreID,
		PortraitID: PortraitID
	}, function(resp){
		UI.util.bindForm($(".dataForm"),resp.result);
		$('.main-title  .fr').text(renderStatus(resp.result.Status, resp.result.STATUS_CODE));
		
		var baseImg = resp.result.MainFaceImgID;
		imgUrl=baseImg;
		var baseImgSub = baseImg.substring(baseImg.lastIndexOf('/')+1,baseImg.length);
		
		if (pageType == "approval" ||pageType == "synchronized") {
			appendImg(baseImgSub, baseImg, false, true);
		} else {
			appendImg(baseImgSub, baseImg, true);
		}
		
		MainFaceImgID = baseImgSub;
		imgList = resp.result.FaceImgList;
		for (var i = 0; i < imgList.length; i++) {
			var img = imgList[i].FaceImgUrl;
			var imgId = imgList[i].FaceImgID;
			
			if (baseImg == img){
				continue;
			}
			appendImg(imgId, img, false);
		}
		
		var currPhoneList = resp.result.PhoneList;
		for (var i = 0; i < currPhoneList.length; i++) {
			var addPhoneRowHtml = tmpl('phoneTmpl',toString(currPhoneList[i]));
			$("#iphoneInfo").append(addPhoneRowHtml);
		}
		
		if(currPhoneList.length > 0) toggleTableInfo($('.infomation .iphone-title'));
		
		var currCarList = resp.result.CarList;
		for (var i = 0; i < currCarList.length; i++) {
			var obj = {};
			obj[0] = currCarList[i]
			var addCarRowHtml = tmpl('carTmpl',obj);
			$("#carInfo").append(addCarRowHtml);
		}
		
		if(currCarList.length > 0) toggleTableInfo($('.infomation .car-title'));
		UI.util.hideLoadingPanel();
		
		//当审核页面或常控库查看时，以下不可编辑
		if(pageType == "approval" ||pageType == "synchronized"){
			$('.pic-btn-wrap').hide(); //隐藏图像上方的“已为封面，设为封面”标志
			$("#IDCard").attr("readonly","");
			$("#PersonName").attr("readonly","");
			$('select[name = "PersonSex"]').attr("readonly","");
			$('select[name = "PersonSex"]').attr("disabled","");
			UI.util.debug("性别是"+$('select[name = "PersonSex"]').val());
			$("#commenceDate").attr("readonly","");
			$("#commenceDate").attr("disabled","");
			$("#failureTime").attr("readonly","");
			$("#failureTime").attr("disabled","");
			$("#dispatchedReason").attr("readonly","");
			$('#ControlType').attr('disabled','');
			//$("#ControlType").attr("readonly","");
			$(".vphoto").attr("readonly","");
			//添加人像图片隐藏
			$("#addPhotoBtn").removeClass('show').addClass('hide');
			//移除手机关联，车辆关联  点击事件
			$(".infomation .iphone-title").unbind("click"); 
			$(".infomation .car-title").unbind("click"); 
			if(pageType == "synchronized"){
				$('#submitBtn').hide();
			}
			$('.tc i').addClass('hide');
			$("#iphoneInfo input").attr("readonly","");
			$("#carInfo input").attr("readonly","");
			
		}
	}, function(data, status, e) {
		UI.util.hideLoadingPanel();
	}, {
		async : true
	});
}

function toString(obj){
	for(var index in obj){
		if(obj[index] == 'null'){
			obj[index]='';
		}
	}
	return obj;
}

/*var baseUrl = '/oss/v1/efacecloud/face/';
function uploadSuccess( data, status ) {
	var fileId = data;
	UI.control.remoteCall('case/store/proxy', {
		PURI: 'faceimgadd',
		pic: fileId
	}, function(resp){
		imgList.push({
			FaceImgID : resp.FaceImgId,
			FaceImgUrl : resp.FaceImgUrl
		});
		appendImg(resp.FileId, resp.FaceImgUrl);
		if (imgList.length == 1 && MainFaceImgID == '') {
			$('.vphoto .pic-btn-top').removeClass('hide').addClass('show');
			$('.vphoto .pic-btn-base').removeClass('show').addClass('hide');
			MainFaceImgID = resp.FileId;
		}
	});
}*/

function initBtnEvents(){
	
	//上传图片检索
	$("body").on('change','#photo5',function(){
		uploadSinglePic($(this).attr("id"), function (xhr,str){
			var fileResp = JSON.parse(xhr.responseText);
			UI.util.debug(fileResp);		
			var fileUrl = nginxPrefix + fileResp.id;
			imgList.push({
				FaceImgID : fileResp.name,
				FaceImgUrl : fileResp.id
			});
			appendImg(fileResp.id, fileUrl);
				 $('.vphoto .pic-btn-top').removeClass('hide').addClass('show');
				 $('.vphoto .pic-btn-base').removeClass('show').addClass('hide');
				MainFaceImgID = fileUrl;
		});
	});

	if(pageType=='approval'){
		$('#auditOpinion').removeClass('hide');
	}
	
	var addPhoneRowHtml =  tmpl('phoneTmpl',{});
	var addCarRowHtml = tmpl('carTmpl',{});

	$(".infomation .iphone-title").click(function(){
		toggleTableInfo(this);
	});
	$(".infomation .car-title").click(function(){
		toggleTableInfo(this);
	});
	
	createDeleteNode(".iphone-add-tr","#iphoneInfo",addPhoneRowHtml,"#iphoneInfo");
	createDeleteNode(".car-add-tr","#carInfo",addCarRowHtml,"#carInfo");
	
	$(".btn-close").click(function(){
		parent.hideForm('.frame-form-view');
	});
	
	$('body').on('click', '.pic-btn-base', function(){
		$('.vphoto .pic-btn-top').removeClass('show').addClass('hide');
		$(this).parents('.upload-bg').find('.pic-btn-top').removeClass('hide').addClass('show');
		
		$('.vphoto .pic-btn-base').removeClass('hide').addClass('show');
		$(this).parents('.upload-bg').find('.pic-btn-base').removeClass('show').addClass('hide');
		
		var fileId = $(this).attr('fileId');
		MainFaceImgID = fileId;
	});
	
	$('body').on('click','.pic-close',function(){
		$(this).parent().parent().parent().remove();
		
		var isBase = $(this).attr('isBase');
		var fileId = $(this).attr('fileId');
		var fileUrl = $(this).attr('fileUrl');
			
		if ($("#picList img").size()<5){
			$('#addPhotoBtn').removeClass('hide');
			return;
		}
		
		
	});
	
	$('body').on('click', '#submitBtn', function(){
		if(!$('#auditOpinion').hasClass('hide')){  //审批
			var approveParam ={};
			var mess = "审批成功", failMess = "审批失败";
			approveParam.Status =$('input[name="agree"]:checked').val();
			approveParam.Comment = $('#Comment').val();
			if(approveParam.Comment == null || approveParam.Comment == ""){
				UI.util.alert("请添加反馈内容","warn");
				return ;
			}
			approveParam.PortraitID= PortraitID;
			approveParam.idCard= $("#IDCard").val(); 
			approveParam.PersonName=$("#PersonName").val(); 
			approveParam.ControlType=$("#ControlType").val(); 
			approveParam.StoreID=StoreID;
			approveParam.imgUrl=imgUrl;
			UI.util.debug("approveParam.Status==1"+approveParam.Status==1);

			UI.control.remoteCall('person/control/updateApprove', approveParam, function(resp){
				if (resp.status == true){
					UI.util.alert(mess);
					parent.hideForm('.frame-form-view');
					parent.doSearch();
				} else {
					UI.util.alert(resp.message, "warn");
				}
			});
		}else{	//非审批
			if (!UI.util.validateForm($('.dataForm'))) {
				return;
			}
			
			if ($("#picList img").size()<1){
				UI.util.alert("请上传布控图片", "warn");
				return;
			}
			
			var personCode = $("#IDCard").val();
			if (containIDCard(personCode)){
				UI.util.alert("身份证已布控，不能重复布控", "warn");
				return;
			}
			
			var formData = UI.util.formToBean($('.dataForm'));
			formData.MainFaceImgID = MainFaceImgID;
			phoneList = [];
			$("#iphoneInfo").find("tr").each(function(){
				if (UI.util.validateForm($(this).children())) {
					var data = UI.util.formToBean($(this).children());
					phoneList.push(data);
				}
		    });
			
			carList = [];
			$("#carInfo").find("tr").each(function(){
				if (UI.util.validateForm($(this).children())) {
					var data = UI.util.formToBean($(this).children());
					carList.push(data.carPlate);
				}
		    });
	
			formData.FaceImgList = imgList;
			formData.PhoneList =JSON.stringify(phoneList);
			formData.CarList = JSON.stringify(carList);
			
			var form = {};
			var url="person/control/addPerson";
			//form.PURI = 'localstoreportadd';
			var mess = "添加布控人像成功", failMess = "添加布控人像失败";
			if (type == 'edit') {
				//form.PURI = 'localstoreportedit';
				url="person/control/editPerson"
				mess = "修改布控人像成功", failMess = "修改布控人像失败";
			}
			
			formData.StoreID = StoreID;
			formData.PortraitID = PortraitID;
			formData.Status = 0;
			formData.Comment = '';
			
			formData.requestFrom = "web";
			
			form.jsonData = JSON.stringify(formData);
			

			UI.util.debug(form);
			UI.control.remoteCall(url, formData, function(resp){
				if (resp.status == true){
					UI.util.alert(mess);
					parent.hideForm('.frame-form-view');
					parent.doSearch();
				} else {
					var msg = resp.message;
					UI.util.alert(failMess+","+msg, "warn");
				}
			});
		}//else结束
	});

};

var imgList = [], phoneList = [], carList = [];
function appendImg(fileId, fileUrl, flag, isClose) {
	var base='', top='hide', isBase=false, closeFlag='show';
	if (flag) {
		base='hide';
		top='show';
		isBase=true;
	}
	
	if (isClose) {
		closeFlag='hide';
	}
	
	var html = '<li class="vphoto" ptg="photo2"> '
			+ '<div class="upload-bg pic">'
			+ '<img src="' + renderImg(fileUrl) + '"/>'
			+ '<span class="icon-btn-wrap">'
			+ '<span isBase="'+isBase+'" fileUrl="'+fileUrl+'" fileId="'+fileId+'" class="pic-close '+closeFlag+'">×</span></span>'
			+ '<span fileId="' + fileId
			+ '"class="pic-btn-wrap pic-btn-top '+top+'"><span class="f14">已为封面</span></span>'
			+ '<span fileId="'+fileId+'" class="pic-btn-wrap pic-btn-bottom pic-btn-base '+base
			+ '"><i class="icon-image2"></i>'
			+ '<span class="f14">设为封面</span></span>'
			+ '</div></li>';
	$("#addPhotoBtn").before(html);
	if ($("#picList img").size()>=1){
		//UI.util.alert("提示：最多只允许上传5张图片哦!", "warn");
		$('#addPhotoBtn').addClass('hide');
		return;
	}
}

function containIDCard(personCode){
	UI.control.remoteCall("person/control/containPersonCode",
			{ personId:PortraitID, personCode:personCode }, 
			function(resp){
				return resp.flag;
			});
}

function toggleTableInfo( object){
	var $elm = $(object).next(".table-info");
	if( !$elm.is(':visible')){
		$(object).find('i:last').removeClass('icon-arrow-down10').addClass('icon-arrow-up9');
		$elm.show();
	}else{
		$(object).find('i:last').removeClass('icon-arrow-up9').addClass('icon-arrow-down10');
		$elm.hide();
	}
	$('.form-con').scrollTop($('.form-con').scrollTop()+30);
	/*$('.form-con').scrollTop($('.form-warper').height());*/
}

function createDeleteNode(add,tbody,node,info){
	$(add).click(function(event){
		$(tbody).append(node);
		$('.form-con').scrollTop($('.form-con').scrollTop()+30);
		/*$('.form-con').scrollTop($('.form-warper').height());*/
		event.stopPropagation();
	});
	
	$("body").on('click', '.dele-tr-btn', function(event){
		$(this).parents('tr').remove();
		if($(info+' tr').length == 0){
			$(info+' tr').find('td:last-child').html('');
		}
		event.stopPropagation();
	});
}

function initTime(start,end){
	var now = new Date();
	
	var executionStartTime = $('#'+start);
	executionStartTime.val(dateFormat(now,'yyyy-MM-dd 00:00:00'));

	/*时间初始化*/
	executionStartTime.click(function(){
		WdatePicker({
			startDate:'%y-#{%M}-%d 00:00:00',
			dateFmt:'yyyy-MM-dd HH:mm:ss',
			maxDate:'#F{$dp.$D(\''+end+'\')}'
		});
	});
	
	var executionEndTime = $('#'+end);
	now.setDate(now.getDate() + 14);
	executionEndTime.val(dateFormat(now,'yyyy-MM-dd 23:59:59'));
	
	/*时间初始化*/
	executionEndTime.click(function(){
		WdatePicker({
			startDate:'%y-#{%M}-%d 23:59:59',
			dateFmt:'yyyy-MM-dd HH:mm:ss',
			minDate:'#F{$dp.$D(\''+start+'\')}'
		});
	});
}

function initCollapsing(){
	//收起展开事件
	$(".main-title a").click(function(){
		var _this = $(this);
		var hide_box = _this.find(".hide-box");//收起按钮
		var show_box = _this.find(".show-box");//展开按钮
		if(hide_box.is(":visible")){
			_this.parent().parent().find("dl").hide();
			hide_box.hide();
			show_box.attr("style","display:block");
		}else{
			_this.parent().parent().find("dl").show();
			show_box.hide();
			hide_box.attr("style","display:block");
		}
	});
	//初始化只展示第一行表单的内容
/*	$(".main-title a:gt(0)").click();*/
}

function renderStatus(status, code){
	if(status == "0"){
		return isLocal == "1" ? "状态：已同步" : "状态：待审核";
	}else if(status == "1"){
		return code == "0" ? "状态：布控中" : "状态：布控失败";
	}else if(status =="2"){
		return "状态：未通过";
	}
}
