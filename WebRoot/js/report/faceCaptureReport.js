
var timeOption = {
    'elem':$('#timeTagList'),
    'beginTime' :$('#beginTime'),
    'endTime' :$('#endTime'),
    'callback':doSearchByTime
};
var beginTime = UI.util.getDateTime("today","yyyy-MM-dd HH:mm:ss").bT;
var endTime = UI.util.getDateTime("today","yyyy-MM-dd HH:mm:ss").eT;

$('#beginTime').val(beginTime);
$('#endTime').val(endTime);

var queryParams = {
    'pageNo': 1,
    'pageSize': 20,
    'beginTime': beginTime,
    'endTime': endTime,
    'keyWords': ''
};

$(function() {
    //UI.control.init();
    initDateTimeControl(timeOption);
    initEvent();    
})

function initEvent() {
    $("#searchBtn").click(function(){
        queryParams.keyWords = $("#searchText").val();
        queryParams.pageNo = 1;
        doSearch();
    })
    $("#export").click(function() {
        console.log("export");
    })
    $("body").on('click', '.item-detail', function() {
        var parentInfo = {
            id: $(this).attr('id'),
            name: $(this).attr('name'),
            beginTime: queryParams.beginTime,
            endTime: queryParams.endTime,
            timeControl: $(".tagsTime.active").attr("time-control")
        }
        var src = '/efacecloud/page/report/faceCaptureReportDetail.html?parentInfo=' + JSON.stringify(parentInfo);
        showFrame(src);
    })
}

function doSearchByTime(dateTime) {
    queryParams.beginTime = dateTime.bT;
    queryParams.endTime = dateTime.eT;
    queryParams.pageNo = 1;
    doSearch();
}

function doSearch() {
    console.log(queryParams);
}

function showFrame(src) {
    $(".frame-form-full").addClass("show");
    $("#frameFormView").attr('src', src);
}
function closeFrame() {
    $(".frame-form-full").removeClass("show");
    $("#frameFormView").attr('src', '');
}