var params = top.globalCache.faceCaptureParams||{};
$(function(){
	initEvent();
	initData();
});

function initEvent(){
	//导出
    $('#exportBtn').click(function () {
		var url = UI.control.getRemoteCallUrl("face/capture/statistics/download");
		bigDataToDownload(url, "exportFrame", params);
	});
}

function initData(){
	UI.control.remoteCall('face/capture/statistics', params, function (resp) {
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