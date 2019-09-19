var parentInfo = JSON.parse(UI.util.getUrlParam('parentInfo')) || {};

var timeOption = {
    'elem':$('#timeTagList'),
    'beginTime' :$('#beginTime'),
    'endTime' :$('#endTime'),
    'callback':doSearchByTime
};
$('#beginTime').val(parentInfo.beginTime);
$('#endTime').val(parentInfo.endTime);

var queryParams = {
    'pageNo':1,
    'pageSize':20,
    'beginTime':parentInfo.beginTime,
    'endTime':parentInfo.endTime,
    'keyWords': ''
};

$(function() {
    //UI.control.init();
    initDateTimeControl(timeOption);
    initEvent(); 
    initData();   
})

function initData() {
    $(".page-title span").text(parentInfo.name);
    $("[time-control="+ parentInfo.timeControl +"]").trigger('click');
    if(parentInfo.timeControl == 'zdy') {
        doSearch();
    }
}

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

    })
    $("#backBtn").click(function() {
        parent.closeFrame();
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