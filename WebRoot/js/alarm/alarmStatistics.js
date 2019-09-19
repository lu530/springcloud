var timeOption = {
		'elem':$('#timeTagList'),
		'beginTime' :$('#beginTime'),
		'endTime' :$('#endTime'),
		'callback':getSearchTime
};
var queryParams = {
		pageSize:20,
		DB_IDS:"",
		BEGIN_TIME:UI.util.getDateTime("today","yyyy-MM-dd HH:mm:ss").bT.split(" ")[0],
		END_TIME:UI.util.getDateTime("today","yyyy-MM-dd HH:mm:ss").eT.split(" ")[0]
}; 
var dbOption = {
		'elem':['domicile'],//地址HTML容器
		'addressId':['registerDbList'],//初始化布控库内容
		'service':'face/dispatchedAlarm/dbList',//请求服务
		'tmpl':'childNodeListTemplate',//初始化模板
		'callback':doSearchByDb//回调函数
}

$(function(){
	UI.control.init();
	initEvent();
	initsdbList();
	initDateTimeControl(timeOption);
	initFilterEvent(doSearch);
	initDbTree(dbOption);
})

function initEvent(){
	$('#tabTitle .btn').click(function(){
		var ref = $(this).attr('ref');
		$(this).addClass('actives').siblings('.btn').removeClass('actives');
		$('#'+ref).addClass('active').siblings('.tab-pane').removeClass('active');
		if(ref=='tabDraw'){
			drawCharts('drawView', areaOption);
		}
	})
	$('#drawType li').click(function(){
		var ref=$(this).attr('ref');
		$(this).addClass('active').siblings('li').removeClass('active');
		$('#'+ref).addClass('active').siblings('.tab-pane').removeClass('active');
		if(ref=='area'){
			drawCharts('drawViewArea', areaOption2);
		}
	})
	$('body').on('click','.detail',function(){
		var beginTime = queryParams.BEGIN_TIME;
		var endTime = queryParams.END_TIME;
		var identity = $(this).parent().attr('attrId');
		var options = {
				url:'/efacecloud/page/alarm/statisticsDetails.html?identity='+identity+'&beginTime='+beginTime+ '&endTime='+endTime,
				title:'频次分析',
				width:1000,
				height:600
		};
		showRightWindow(options);
	})
	//搜索按钮
	$('#searchBtn').click(function(){
		doSearch();
	})
	$('#keyWord').keydown(function(e){
		if(e.keyCode==13){
			doSearch();
		}
	})
	
	//检索按钮
	$('#confirmSearch').click(function(){
		doSearch();
	})
}

function showRightWindow(options) {
	var defaults = {
			url: '',
			title: '',
			callback:function(resp){
				
			}
	};
	var options = $.extend(true, defaults, options);
	
	parent.UI.util.openCommonWindow({
		src: options.url,
		title: options.title,
		windowType: 'right',
		parentFrame: 'currentPage',
		width: '1200px',
		callback: options.callback
	});
}
function doSearch(){
	queryParams.KEYWORDS = $('#keyWord').val();
	UI.control.getControlById("alarmStaListView").reloadData('', queryParams);
}
function getSearchTime(date){
	queryParams.BEGIN_TIME = date.bT.split(" ")[0];
	queryParams.END_TIME = date.eT.split(" ")[0];
}
function doSearchByDb(dbIdList){
	queryParams.DB_IDS = dbIdList.join(",");
}

//初始化布控库
function initsdbList(){

	$("#sdbList_multipleMenu li").click(function() {
				queryParams.sdbNames = "";
				$("#sdbList_multipleMenu li").each(function() {
							if ($(this).attr("class") == "active") {
								queryParams.sdbNames = queryParams.sdbNames + $(this)[0].innerText + ",";
							}
				});
	});
	// 布控库多选确定按钮
	$(".submitBtn").click(function() {
		doSearch();
	});
	// 全选
	$(".allselect").click(function() {
		$("#sdbList_multipleMenu li").each(function() {
			if ($(this).attr("class") == "active") {
				queryParams.sdbNames = queryParams.sdbNames + $(this)[0].innerText + ",";
			}
		});
	});

}