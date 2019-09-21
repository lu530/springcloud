var params = top.globalCache.faceCaptureParams||{};
var pageType = UI.util.getUrlParam("pageType") || '';
$(function(){
	initEvent();
	initData();
});

function initEvent(){
	//导出
    $('#exportBtn').click(function () {
		var serviceUrl = "face/capture/statistics/download";
		if(pageType=='alarm'){
			serviceUrl = 'face/dispatchedAlarm/statistics/download';
		}
		var url = UI.control.getRemoteCallUrl(serviceUrl);
		bigDataToDownload(url, "exportFrame", params);
	});
}

function initData(){
	var serviceUrl = 'face/capture/statistics';
	if(pageType=='alarm'){
		serviceUrl = 'face/dispatchedAlarm/statistics';
	}
	UI.control.remoteCall(serviceUrl, params, function (resp) {
		if(resp.CODE == 0){
			var data = resp.DATA;
			if(data.length>0 && data[0].algo.length>0){
				var algoNameList = [];
				for(var i = 0;i<data[0].algo.length;i++){
					algoNameList.push(data[0].algo[i].algoName);
				}
				var curData = {
						data:data,
						algoNameList:algoNameList
				}
				$('.table').html(tmpl('tableTmpl',curData));
			}else{
				$('.table').html('<div class="nodata"></div>');
			}
			UI.util.alert(resp.MESSAGE);
		}else {
			UI.util.alert(resp.MESSAGE,'warn');
		}
    },function(){},{},true);
}