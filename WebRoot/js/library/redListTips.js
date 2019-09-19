var paramsStr = UI.util.getUrlParam("params");
var dataStr = UI.util.getUrlParam("data");
$(function(){
	initEvent();
	initTime();
	initData();
});

function initEvent(){
	$("#submitBtn").click(function(){
		parent.UI.util.returnCommonWindow({CODE:0,controlTime:$("#controlTime").val()});
		parent.UI.util.closeCommonWindow();
	});
	$("#closeBtn").click(function(){
		parent.UI.util.returnCommonWindow({CODE:1,controlTime:$("#controlTime").val()});
		parent.UI.util.closeCommonWindow();
	});
}

function initData(){
	if(dataStr){
		var data = JSON.parse(dataStr);
		var params = JSON.parse(paramsStr);
		
		var html = '<dd class="form-group mb10"><label class="control-label">案情类型：</label><label class="radio-inline">'+renderCaseIdType(data.CASE_ID_TYPE)+'</label></dd>'
		+'<dd class="form-group mb10 '+renderShow(data.CASE_ID_TYPE)+'"><label class="control-label">'+renderCaseIdType(data.CASE_ID_TYPE)+'编号：</label><label class="radio-inline">'+data.CASE_ID+'</label></dd>'
		+'<dd class="form-group mb10 '+renderShow(data.CASE_ID_TYPE)+'"><label class="control-label">'+renderCaseIdType(data.CASE_ID_TYPE)+'名称：</label><label class="radio-inline">'+data.CASE_NAME+'</label></dd>'
		+'<dd class="form-group mb10"><label class="control-label">操作事由：</label><label class="radio-inline">'+renderCause(params.CAUSE_TYPE,params.SEARCH_CAUSE)+'</label></dd>'
		
		$(".form-single").append(html);
	}
}

function renderShow(t){
	if(t == "2"){
		return "hide";
	}else{
		return "";
	}
}

function renderCaseIdType(t){
	if(t == "0"){
		return "案件";
	}else if(t == "1"){
		return "警情";
	}else if(t == "2"){
		return "其它";
	}
	return t;
}

function renderCause(caseType,cause){
	var str = "";
	switch (caseType){
		case '0':
			str = '管控';
			break;
		case '1':
			str = '侦查';
			break;
		case '2':
			str = '便民服务';
			break;
		case '3':
			str = "其它：" + cause;
			break;
	}
	return str;
}

//申请有效截止期
function initTime(){
    var now = new Date();
    var beginTime = $('#controlTime');
    if(beginTime.val() == ''){
    	beginTime.val(now.format("yyyy-MM-dd"));
    }
    beginTime.focus(function(){
        WdatePicker({
        	isShowClear:false,
        	readOnly:true,
            startDate:'%y-#{%M}-%d',
            dateFmt:'yyyy-MM-dd',
            minDate:now.format("yyyy-MM-dd")
        });
    });
}