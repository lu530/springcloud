
var queryParams = {
    // 'pageNo': 1,
    // 'pageSize': 20,
    'KEY_WORDS': ''
};

var listData = [];

$(function() {
    //UI.control.init();
    initPage(); 
    initEvent(); 
})
function initPage() {
    doSearch();
}

function initEvent() {
    $("#searchBtn").click(function(){
        queryParams.KEY_WORDS = $("#searchText").val();
        //queryParams.pageNo = 1;
        doSearch();
    })
    $('#searchText').keypress(function (e) {
        if ((e.keyCode || e.which) == 13) {
            $("#searchBtn").trigger('click');
        }
    });
    $("#export").click(function() {
        var exportParams = {},
            exportData = [];
        $("[listview-check]:checked").each(function(i, item) {
            var index = $(item).attr('listview-item');
            exportData.push(listData[index]);
        });
        if(exportData.length == 0) {
            UI.util.alert('请选择导出数据', 'warn');
        }else {
            var url = UI.control.getRemoteCallUrl('faceCap/statistic/export');
            exportParams.EXCCEL_TYPE = 1;
            exportParams.EXPORT_DATA = JSON.stringify(exportData);
		    bigDataToDownload(url, "exportFrame", exportParams);
        }
    })
    $("body").on('click', '.item-detail', function() {
        var id = $(this).attr('id'),
            name = $(this).attr('name')

        var src = '/efacecloud/page/report/dataCollectReportDetail.html?id=' + id + '&name=' + name;
        showFrame(src);
    })
    $("#checkAll").click(function() {
        if($(this).prop('checked')) {
            $("[listview-check]").prop('checked', true)
        } else {
            $("[listview-check]").prop('checked', false)
        }
    });
    $("#faceCapture").on('click', '[listview-check]', function(e){
        if($(this).prop('checked')) {
            if($('[listview-check]:checked').length == listData.length) {
                $("#checkAll").prop('checked', true);
            }
        }else {
            $("#checkAll").prop('checked', false);
        }
        e.stopPropagation();
    })
    $('#faceCapture').on('click', 'tr', function(){
        var $checkbox = $(this).find('[listview-check]');
        $checkbox.prop('checked', !$checkbox.prop('checked'));
        if($checkbox.prop('checked')) {
            if($('[listview-check]:checked').length == listData.length) {
                $("#checkAll").prop('checked', true);
            }
        }else {
            $("#checkAll").prop('checked', false);
        }
    })
}

function doSearch() {
    var url = 'faceCap/statistic/query';
    UI.util.showLoadingPanel();
    UI.control.remoteCall(url, queryParams, function(resp){
        if(resp.CODE == 0) {
            listData = resp.DATA;
            $("#faceCapture").html(tmpl('faceCaptureTemplate', resp.DATA));
        }
        UI.util.hideLoadingPanel();
    },function(){},{},true);
}

function showFrame(src) {
    $(".frame-form-full").addClass("show");
    $("#frameFormView").attr('src', src);
}
function closeFrame() {
    $(".frame-form-full").removeClass("show");
    $("#frameFormView").attr('src', '');
}