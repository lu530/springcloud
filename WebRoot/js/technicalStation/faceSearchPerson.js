var fieldId = UI.util.getUrlParam('fieldId');
var threshold = UI.util.getUrlParam('threshold');
var personLib = UI.util.getUrlParam('personLib');
var personLibName = UI.util.getUrlParam('personLibName');
var vd = UI.util.getUrlParam('vd');
var topN = UI.util.getUrlParam('topN');

$( function() {
	UI.control.init();
	initEvents();
});

function initEvents() {
	if (fieldId && personLib) {
		UI.util.showLoadingPanel('');
		doQuery();
	}
	
	$('body').on('click','.node-img img',function(){
		var $this = $(this);
		var src = $this.attr('src');
		top.showPictureZoom( src,true);
	});
}

function doQuery() {
	var params = {};
	params.IMG_ID = fieldId;
	params.PERSONLIB = personLib;
	params.THRESHOLD = threshold;
	params.VENDER = vd;
	params.TOPN = topN;
	UI.control.remoteCall('cs/portraitComparison/search', params, function(resp) {
		if(resp.result == 'success'){
			if (resp.data) { // 渲染返回结果
				if (resp.data.total > 0) {
					$('#sCount').html(resp.data.total);
					$(".people-list").append(
					tmpl('personTmpl', resp.data.persons));
				} else {
					$('#sCount').html(resp.data.total);
					UI.util.alert('比对完成！未在指定库命中目标！');
				}
			}
		}else{
			UI.util.alert(resp.msg,'warn');
		}
		UI.util.hideLoadingPanel();
	}, function(data, status, e) {
		UI.util.hideLoadingPanel();
		top.rightMainFrameOut();
	}, {
		async : true
	});
}

function formatScore(score){
	var sscore = score+'';
	if(sscore.indexOf('.') > 0){
		return sscore.split('.')[0];
	}
	return sscore;
}