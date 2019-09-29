

var options = {

    //时间控件初始化
    timeOption: {
        'elem':$('#timeTagList'),
        'beginTime' :$('#beginTime'),
        'endTime' :$('#endTime'),
        'callback': function () {}
    },
    SFLIST: [
        // { id: '110', name: '依图' },
        // { id: '111', name: '商汤' },
        // { id: '112', name: '云从' },
        // { id: '113', name: 'Face++' },
        // { id: '115', name: '像素' },
        // { id: '117', name: '深醒' },
        // { id: '118', name: '网力' }
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
            ALGO_LIST:'[{"ALGO_TYPE":"10003","THRESHOLD":"60"}]',
            DB_ID: top.getConfigItem('efacecloud', 'PERSON_SEARCH_LB_ID').value,
            ENGINE_DB_ID: top.getConfigItem('efacecloud', 'PERSON_SEARCH_LB_ID').value,
            PIC: "",
            KEY_WORDS: "",
            TIME_SORT_TYPE: 'DESC',
            BEGIN_TIME: (new Date().getFullYear() - 1).toString() + new Date().format("-MM-dd HH:mm:ss"),
            END_TIME: new Date().format("yyyy-MM-dd HH:mm:ss"),
            pageNo: 1,
            pageSize: 20
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
    faceCaptureData: []
}


var trackData = [];

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
    });

    //有人脸检索的选中问题
    $("#faceCapture").on("click", ".list-node-wrap", function () {
        var $this = $(this);
        if ($this.hasClass("active")) {
            $this.removeClass("active");
        } else {
            $this.addClass("active");
        }

        if ($("#faceCapture").find(".list-node-wrap.active").length == $("#faceCapture").find(".list-node-wrap").length) {
            $("#checkAll").prop("checked", true);
        } else {
            $("#checkAll").prop("checked", false);
        }
    });
    //有图片检索，全选功能
    $("#checkAll").click(function () {

        var flag = $(this).prop("checked");

        if(flag){
            $("#faceCapture").find(".list-node-wrap").addClass('active');
        }else{
            $("#faceCapture").find(".list-node-wrap").removeClass('active');
        }
    });

    //  一键布控
    $('body').on('click','.monitorBtn',function(event){
        var PERSON_ID = $(this).attr("PERSON_ID"),
            PIC = $(this).attr('PIC'),
            DB_ID = top.getConfigItem('efacecloud', 'PERSON_SEARCH_LB_ID').value;

        var url = '/efacesurveillance/page/faceControl/addFaceStoreForm.html?type=add&PERSON_ID='+PERSON_ID+'&PIC='+ PIC+'&db_id=' + DB_ID;
        UI.util.showCommonIframe('.frame-form-full', url);
    });

    //  轨迹查看
    $('body').on('click', '.trackSearch', function () {

        if($('#faceCapture').find(".list-node-wrap.active").length <= 0) {
            UI.util.alert('请先选择抓拍数据', 'warn');
            return;
        }
        trackData = [];

        $.each($('#faceCapture').find(".list-node-wrap.active"), function (){

            var baseData = options.faceCaptureData[$(this).index() - 1];

            baseData.X = baseData.LONGITUDE;
            baseData.Y = baseData.LATITUDE;
            baseData.TIME = baseData.CJSJ;
            baseData.jgsj = baseData.JGSK;

            trackData.push(baseData);
        });

        trackData = trackData.sort(function (item1, item2) {
            return new Date(item1.JGSK).getTime() - new Date(item2.JGSK).getTime();
        })

        var pageUrl = '/efacecloud/page/technicalStation/tacticsFrame.html?pageType=trackResult&getDataType=trackResult';
            UI.util.showCommonIframe('.frame-form-full', pageUrl);
    });
    
    //  踪迹查找反馈
    $('#faceSearch').on('click', '.findPerson', function () {

        var params = {

            IDENTITY: $(this).attr('PERSON_ID'),
            LAST_ADDR: '',
            LAST_TIME: '',
            NAME: $(this).attr('NAME'),
            PIC: $(this).attr('PIC'),
            STATE: '2'
        }

        UI.util.confirm('该失踪人员找到了么？', function () {
            
            sendFindPersonRequest(params);
        });
        return false;
    })
}

function sendFindPersonRequest (params) {

	UI.control.remoteCall('', '', function (resp) {

		if( resp.CODE === 0 ) {
			UI.util.alert(resp.MESSAGE);
		}else{
            UI.util.alert(resp.MESSAGE, 'warn');
        }

	}, function (error) {}, {

		url: '/efacecloud/mx/v6/lostPerson/confirm',
		data: params

	}, true);
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
    
    if(src === '/efacecloud/images/noPhoto2.png' && $('#searchText').val() === "") {
        UI.util.alert('图片与搜索关键词请至少填写一项', 'warn');
        return;
    }

    //  时间参数更新
    var time = {
        BEGIN_TIME: $("#beginTime").val(),
        END_TIME: $("#endTime").val()
    }

    if(src !== '/efacecloud/images/noPhoto2.png') {

        options.params.faceSearch.IMG_URL_LIST = JSON.stringify([src]);

        options.params.faceCapture.PIC = src;

    }else{
        options.params.faceSearch.IMG_URL_LIST = [];
        options.params.faceCapture.PIC = "";
    }

    
    $.extend(options.params.faceCapture, time);
    $.extend(options.params.monitor, time);

    if(src !== '/efacecloud/images/noPhoto2.png') {

        UI.control.remoteCall(options.url.faceSearch, options.params.faceSearch, function (resp) {

            $('#faceSearch').html(tmpl('faceSearchTmpl', resp.DATA[0].RECOMMEND_RESULT));
    
            getMonitorData();
    
        }, function (error) {}, '', true);

    }else{
        var nullContent = "<div class='container-unit'> " +
                                "<div class='pb10'>飞识身份核实（0）</div>" +
                                "<div class='nodata'></div>" +
                            "</div>";

            $('#faceSearch').html(nullContent);

        getMonitorData();
    }

    //  获取路人库数据
    getFaceCaptureData();
}

//  获取布控信息
function getMonitorData () {

    options.params.monitor.KEY_WORDS = $('#searchText').val() || $('#faceSearch').find('.faceSearchItem.active').attr("PERSON_ID");

    UI.util.showLoadingPanel();

    UI.control.remoteCall('', '', function (resp) {

        $('#monitor').html(tmpl('monitorTmpl', $.extend({}, resp.data, {
            PIC: options.params.faceCapture.PIC,
            PERSON_ID: options.params.monitor.KEY_WORDS
        }) ));

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

            options.faceCaptureData = resp.data.LIST[0].ALGORITHM_LIST;

            $('#faceCapture').html(tmpl('faceCaptureTmpl', resp.data.LIST[0].ALGORITHM_LIST));

        }else{

            var nullContent = "<div class='container-unit'> " +
                                "<div class='pb10'>路人抓拍信息（0）</div>" +
                                // "<div class='btn btn-i-t trackSearch'>轨迹查看</div>" +
                                "<div class='nodata'></div>" +
                            "</div>";

            $('#faceCapture').html(nullContent);
        }
    }, function (error) {}, '', true);
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