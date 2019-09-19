var freqNum = UI.util.getUrlParam("freqNum") || "";
var threshold = UI.util.getUrlParam("threshold") || "";
var facescore = UI.util.getUrlParam("facescore") || "";
var orgName = UI.util.getUrlParam("orgName") || "";
var beginTime = UI.util.getUrlParam("beginTime") || "";
var endTime = UI.util.getUrlParam("endTime") || "";
var searchTime = UI.util.getUrlParam("searchTime") || "";
var taskId = UI.util.getUrlParam("taskId") || "";
var queryParams = {/*similarity: 77,*/
	TASK_ID: taskId,
	pageNo: 1,
	pageSize: 20
};
var uiOptions = {
	isMedia: false
}
var data = null;
var PERSON_ID = '';
var NUMS = 0;
var detailPageNo = 1;
var detailPagSize = 5;
$(function () {
	UI.control.init();
	initPage();
	initEvent();
});
function initPage() {
	$("#beginTime").val(beginTime);
	$("#beginTime").addClass('active');
	$("#endTime").val(endTime);
	$("#endTime").addClass('active');
	/* if(searchTime == 'userDefined'){
	} */
	//$("#happenTime").find("[searchtime='"+searchTime+"']").addClass('active');
	$("#orgName").text(orgName);
	$("#orgName").attr("title", orgName);
	$("#freqNum").text(freqNum);
	$("#threshold").text(threshold);
	$("#faceScore").text(facescore);
}

function initEvent() {
	//点击图片，显示时间轴
	$("body").on("click", ".capture-data .list-node", function () {
		var g = $(this);
		PERSON_ID = $(this).find('.personId').attr('title');
		detailPageNo = 1;
		//$(this).parents(".pager-content").addClass("show");
		$(".list-view").remove();
		UI.control.remoteCall("NNInfo/detail/query", { PERSON_ID: PERSON_ID, pageNo: detailPageNo, pageSize: detailPagSize }, function (resp) {
			NUMS = resp.data.count;
			$html = tmpl('testChildTmpl', resp.data);
			NUMS = NUMS - detailPagSize;
		});
		$("#dataList").append('<div class="list-view">' +
			'<span class="list-close close-bg"></span>' + $html + '</div>');// g.find('.faceChild').html()
		$("[attrimg='zoom']").lazyload({
			effect: "fadeIn",
			container: '.list-view'
		});
		g.parents(".pager-content").addClass("show");
	});

	//点击关闭时间轴
	$("body").on("click", ".list-close", function () {
		$(this).parents(".pager-content").removeClass("show");
	});

	//返回
	$('#backBtn').click(function () {
		parent.UI.util.hideCommonIframe('.frame-form-full');
	})

	$('body').on('click', '#more', function () {
		detailPageNo++;
		UI.control.remoteCall("NNInfo/detail/query", { PERSON_ID: PERSON_ID, pageNo: detailPageNo, pageSize: detailPagSize }, function (resp) {
			$('#more').remove();
			$('.list-view').append(tmpl('testChildTmpl', resp.data));
			NUMS = NUMS - detailPagSize;
		});
	})
}
