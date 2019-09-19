var zjhm = UI.util.getUrlParam('zjhm') || '';
var gjdm  = UI.util.getUrlParam('gjdm') || '';
var zjzl = UI.util.getUrlParam('zjzl') || '';

$(function(){
	UI.control.init();
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
});

function getBasicInfo(){
	var params={
		ZJHM:zjhm,
		GJDM:gjdm,
		ZJZL:zjzl
	};
	UI.control.remoteCall('facestore/getBasicInfo', params, function(resp){
		if(resp.CODE==0){
			var data = resp.MESSAGE;
			if(data && data.length){
				$('#tableContent').html(tmpl('tableTemplate', data));
			}else{
				$('#tableContent').html('<div class="nodata"></div>');
			}
			$(".peoplePic").attr("src",top.globalCache.verification_url || "/ui/plugins/eapui/img/nophoto.jpg");
		}else{
			UI.util.alert(resp.MESSAGE,"warn");
		}
		
	},function(){},{},true);
}

function getMockInfo(url) {
	$.getJSON(url, function(data) {
		if (data && data.info && data.info.length) {
			var info = data.info;
			$('#tableContent').html(tmpl('tableTemplate', info));
		}
	});
}