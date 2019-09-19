var queryParams = {
	ZJHM: '',
	GJDM: '',
};

$(function() {
	UI.control.init();
	initEvent();
});

function initEvent() {
    $('body').on('click', '#backBtn', function () {
        parent.showMenu();
    });

	//输入框的搜索按钮
	$('#inputSearch').click(function() {
		doSearch();
	})
	$('.search-input').keydown(function(e) {
		if(e.keyCode == 13) {
			doSearch();
		}
	});
	$('#confirmSearch').click(function() {
		doSearch();
    });
}

function doSearch() {
	queryParams.ZJHM = $('#searchInput').val();
	queryParams.GJDM = $('#nation').attr('code');
	queryParams.ZJZL = $('#cardType').val();
	if(queryParams.ZJHM == ''){
		UI.util.alert("证件号码不能为空", 'warn');
		return;
	}
	if(queryParams.GJDM == ''){
		UI.util.alert("国籍不能为空", 'warn');
		return;
	}
	if(queryParams.ZJZL == ''){
		UI.util.alert("证件类型不能为空", 'warn');
		return;
	}
	UI.util.showLoadingPanel();
	UI.control.remoteCall('platform/webapp/config/get', { "applicationName": "efacestore" }, function (resp) {
		var jsonObj = resp.attrList;
		for (var i = 0; i < jsonObj.length; i++) {
			if (jsonObj[i].key == 'MOCKBASICINFO_URL') {
				if(jsonObj[i].value) { // 如果该url存在,则从该url获取数据
					getMockInfo(jsonObj[i].value)
				} else {
					getBasicInfo();
				}
				break;
			}
		}
	});
}

function getBasicInfo(){
	UI.control.remoteCall('facestore/getBasicInfo', queryParams, function(resp) {
		//var data = resp.DATA;
		var code = resp.CODE;
		var message = resp.MESSAGE;
		if(code == 1){
			UI.util.alert(message, 'warn');
			UI.util.hideLoadingPanel();
			return;
		}
		if(message && message.length) {
			$('.page-content').html(tmpl('formTpl', message));
		}else{
			UI.util.alert("该证件号码没有查询到关联信息", 'warn');
		}
	    UI.util.hideLoadingPanel();
	});
}

function getMockInfo(url) {
	$.getJSON(url, function(data) {
		if (data && data.info && data.info.length) {
			var info = data.info;
			$('.page-content').html(tmpl('formTpl', info));
		}
		UI.util.hideLoadingPanel();
	});
}