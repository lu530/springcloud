//页面默认选中近七天
var time = UI.util.getDateTime("nearWeek","yyyy-MM-dd HH:mm:ss"),
    taskType = UI.util.getUrlParam("taskType") || '';

//  技战法任务类型
var tacticsType = {
    'flow': 1,      //  人流量分析
    'specific': 2   //  特定人群轨迹分析
}

var queryParams = {
    BEGIN_TIME: time.bT,
    END_TIME: time.eT,
    KEYWORK: '',
    TASK_TYPE: tacticsType[taskType] || '',
    TASK_STATUS: '',
    pageNo: 1,
    pageSize: 20
}
 
// var timeOption = {
// 	$dom: $('#timeTagListDatepicker'),
// 	callback: doSearch
// }
var timeOption = {
	'elem':$('#timeTagList'),
	'beginTime' :$('#beginTime'),
	'endTime' :$('#endTime'),
	'callback':doSearch
};

$(function () {

	UI.control.init();
    initPage();
    initEvents();
});

function initPage () {

    // datePickerInit (timeOption);    //  新版时间组件
    initDateTimeControl(timeOption);
    $('#beginTime').val(time.bT);
    $('#endTime').val(time.eT);

    $('.listviewImgBox').removeClass('hide');

    $('#taskType .taskItem[val='+ tacticsType[taskType] +']').addClass('active').siblings().removeClass('active');
}

function initEvents () {

    //搜索任务点击事件
	$('.searchTaskBtn').click(function(){
		doSearch();
	});
	//搜索任务回车事件
	$('.searchTask').keypress(function(e) {
		if(((e.keyCode || e.which) == 13)) {
			doSearch();
		}
	});

    //  搜索条件修改
    $('#taskType,#taskStatus').on('click', '.taskItem', function () {

        $(this).addClass('active').siblings().removeClass('active');
        doSearch();
    });

    //  删除任务
    $('body').on('click', '.deleteBtn', function () {

        var params = {
            TASK_IDS: $(this).attr('TASK_ID')
        }

        UI.util.confirm('确定删除这条任务吗？', function () {

            UI.util.showLoadingPanel();

            UI.control.remoteCall('technicalTactics/task/delete', params, function (resp) {
    
                UI.util.alert(resp.MESSAGE, resp.CODE === 0 ? '' : 'warn');
                doSearch();
                UI.util.hideLoadingPanel();
    
            }, function (error){ console.log(error) }, '', true);
        });
    });

    //  查看异常
    $('body').on('click', '.errorCause', function () {

        var params = { 
			src: '/efacecloud/page/technicalStation/errorCause.html?TASK_ID=' + $(this).attr('TASK_ID'),
			title: '任务异常',
			width: 600,
			height: 400,
			callback: function(obj){}
        };
	    UI.util.openCommonWindow(params);
    });

    //  任务详情
    $('body').on('click', '.detailBtn', function () {

        var params = { 
			src: '/efacecloud/page/technicalStation/taskDetail.html?TASK_ID=' + $(this).attr('TASK_ID') + '&TASK_TYPE=' + $(this).attr('TASK_TYPE'),
			title: '任务详情',
			width: 1000,
			height: 600,
			callback: function(obj){}
        };
	    UI.util.openCommonWindow(params);
    });

    //  结果查看
    $('body').on('click', '.resultBtn', function () {

        var params = { 
			src: '/efacecloud/page/technicalStation/tacticsFrame.html?pageType=' + CONSTANTS.TACTICS_TASK.TASK_TYPE[$(this).attr('TASK_TYPE')] + '&TASK_ID=' + $(this).attr('TASK_ID') + '&resultLooking=resultLooking',
			title: '结果查看',
			width: $(top.window).width()*.95,
			height: $(top.window).height()*.9,
			callback: function(obj){}
        };
	    UI.util.openCommonWindow(params);
    });
    
}
function doSearch () {

    queryParams = {
        BEGIN_TIME: $('#beginTime').val(),
        END_TIME: $('#endTime').val(),
        KEYWORD: $('.searchTask').val(),
        TASK_STATUS: $('#taskStatus .taskItem.active').attr('val'),
        TASK_TYPE: $('#taskType .taskItem.active').attr('val'),
        pageNo: 1,
        pageSize: 20
    }

    UI.util.showLoadingPanel();
    UI.control.getControlById("personStructuredList").reloadData(null, queryParams);
    UI.util.hideLoadingPanel();
	
}