

var options = {

    //时间控件初始化
    timeOption: {
        'elem':$('#timeTagList'),
        'beginTime' :$('#beginTime'),
        'endTime' :$('#endTime'),
        'callback': function () {}
    },
    SFLIST: [
        // { ID: '110', NAME: '依图' },
        // { ID: '111', NAME: '商汤' },
        // { ID: '112', NAME: '云从' },
        // { ID: '113', NAME: 'Face++' },
        // { ID: '115', NAME: '像素' },
        // { ID: '117', NAME: '深醒' },
        // { ID: '118', NAME: '网力' }
    ],
    params: {
        faceCapture: {
            ALGO_LIST:'[{"ALGO_TYPE":"10003","THRESHOLD":"60"}]',
            pageSize:20,
            pageNo:1,
            THRESHOLD:60,
            DEVICE_IDS:"",
            KEYWORDS:"",
            PIC:"",
            BEGIN_TIME: UI.util.getDateTime("today", "yyyy-MM-dd HH:mm:ss").bT,//页面默认选中今天
            END_TIME: UI.util.getDateTime("today", "yyyy-MM-dd HH:mm:ss").eT
        },
        // 飞识
        faceSearch: {
            THRESHOLD: '80',
            TOP_NUMBER: '10',
            IMG_URL_LIST: '',
            ALGORITHM_ID: '',
            REPOSITORY_ID: CONSTANTS.RLK.map(function (item) { return item.DB_ID }).filter(function (item) {return item !== '-1'}).join(',')
        },
        // 布控
        monitor: {
            PIC: "",
            KEY_WORDS: "",
            TIME_SORT_TYPE: 'DESC',
            BEGIN_TIME: (new Date().getFullYear() - 1).toString() + new Date().format("-MM-dd HH:mm:ss"),
            END_TIME: new Date().format("yyyy-MM-dd HH:mm:ss"),
            pageNo: 1,
            pageSize: 20,
            ALGO_LIST:'[{"ALGO_TYPE":"10003","THRESHOLD":"60"}]',
            DB_ID: top.getConfigItem('efacecloud', 'PERSON_SEARCH_LB_ID').value,
            ENGINE_DB_ID: top.getConfigItem('efacecloud', 'PERSON_SEARCH_LB_ID').value
        }
    },
    url: {
        //  身份核查库 /efacecloud/rest/v6/
        faceSearch: 'face/technicalTactics/batchFaceSearch',
        //  布控库  /eapmanageutils/rest/v6/
        monitor: '/efacesurveillance/rest/v6/face/dispatchedPerson/getData',
        //  路人抓拍库
        faceCapture: '/efacecloud/rest/v6/face/capture/query'
        // //  告警库
        // alarmLB: '/efacecloud/rest/v6/face/dispatchedAlarm/grouping/getData',
        // //  一人一档
        // personLB: '/efacestore/rest/v6/facestore/archivesPerson/getData',
    },
}

$(function () {

    UI.control.init();
    initPage();
    initEvent();
})


function initPage () {
    
    sFList();

    //  身份核查算法列表参数
    options.params.faceSearch.ALGORITHM_ID = options.SFLIST.map(function (item) {return item.id}).join(',');

    // topSpecialUploadPic();
    uploadPic();

    initDateTimeControl(options.timeOption);
}

function initEvent () {

    //返回菜单
    $('body').on('click','#backBtn',function(){
        parent.showMenu();
    });
    
    $('body').on('click', '#confirmSearch', function () {

        doSearch();
    });

    $('#faceSearch').on('click', '.faceSearchItem', function () {

        $(this).addClass('active').siblings().removeClass('active');

        getMonitorData();
    })
}

function sFList() {

    UI.control.remoteCall('face/common/feishiAlgoList', null, function (resp) {
        if (resp.CODE == 0 && resp.DATA && resp.DATA.length > 0) {
            var data = resp.DATA;
            options.SFLIST = data;
        }
    }, function() {});
}

function doSearch() {

    var src = $("#filterImg").attr("src");

    if(src !== '/efacecloud/images/noPhoto2.png') {

        options.params.faceSearch.IMG_URL_LIST = JSON.stringify([src]);

        options.params.faceCapture.PIC = src;

    }else{
        UI.util.alert('人员身份确认需要先上传图片', 'warn');
        return;
    }

    //  时间参数更新
    var time = {
        BEGIN_TIME: $("#beginTime").val(),
        END_TIME: $("#endTime").val()
    }
    $.extend(options.params.faceCapture, time);
    $.extend(options.params.monitor, time);

    UI.control.remoteCall(options.url.faceSearch, options.params.faceSearch, function (resp) {

        $('#faceSearch').html(tmpl('faceSearchTmpl', resp.DATA[0].RECOMMEND_RESULT));

        getMonitorData();

    }, function (error) {}, '', true);

    //  获取路人库数据
    getFaceCaptureData();
}

//  获取布控信息
function getMonitorData () {

    options.params.monitor.KEY_WORDS = $('#faceSearch').find('.faceSearchItem.active').attr("PERSON_ID");

    UI.util.showLoadingPanel();

    UI.control.remoteCall('', '', function (resp) {

        $('#monitor').html(tmpl('monitorTmpl', resp.data));

        UI.util.hideLoadingPanel();

    }, function (error) {}, {

        url: options.url.monitor,
        data: options.params.monitor
        
    }, true);
}

//  获取路人抓拍以图搜图信息
function getFaceCaptureData () {

    UI.control.remoteCall(options.url.faceCapture, options.params.faceCapture, function (resp) {

        if(resp.data.LIST && resp.data.LIST.length > 0){
            $('#faceCapture').html(tmpl('faceCaptureTmpl', resp.data.LIST[0].ALGORITHM_LIST));
        }else{

            var nullContent = "<div class='container-unit'> " +
                                "<div class='pb10'>路人抓拍以图搜图信息（0）</div>" +
                                "<div class='nodata'></div>" +
                            "</div>";

            $('#faceCapture').html(nullContent);
        }
    }, function (error) {
        var nullContent = "<div class='container-unit'> " +
                                "<div class='pb10'>路人抓拍以图搜图信息（0）</div>" +
                                "<div class='nodata'></div>" +
                            "</div>";

            $('#faceCapture').html(nullContent);
    }, '', true);
}

function uploadPic() {
    
    //上传图片
    $("body").on('change','.searchImgButton',function(){

        var upImgId = $(this).attr('id');

        ajaxFileUploadSpecial(upImgId, picSuccFunctionSpecial);
        
    });
    
    //删除图片
    $('body').off('click', '#deleteImgBtn');
    $('body').on('click','#deleteImgBtn',function (){

       $(".pciImageIcon").addClass('pci-image-display');
        fileUrl = '';
        $('#filterImg').attr('src', '/efacecloud/images/noPhoto2.png');
        $("#uploadImg").val("");
        $(this).parent('ul').siblings('input[foruploadform]').val("");
        
        $('.bottom-pic-bar').addClass('hide');
        global.fileid = '';
        // doSearch();
    });
}