var appToken = 0x31001;//上传图片永久存储
var curOrgCode = "";
var fileUrl = "";
var keyWords = "";
var searchTime;
var trackData = '';  // 轨迹分析数据
var beginTime = UI.util.getDateTime("today", "yyyy-MM-dd HH:mm:ss").bT,  // 页面默认选中今天
    endTime = UI.util.getDateTime("today", "yyyy-MM-dd HH:mm:ss").eT;
UI.isForeigners = UI.util.getUrlParam("isForeigners") == "0" ? 1 : 0;
$('#beginTime').val(beginTime);
$('#endTime').val(endTime);

var pageLoadType = UI.util.getUrlParam("pageLoadType") || 'false';
var pageType = UI.util.getUrlParam("pageType") || "";
var imgSrc = UI.util.getUrlParam("imgSrc") || "";
var isUpload = UI.util.getUrlParam("isUpload") || UPLOAD_RETRIEW_FALSE;   //0表示不是通过上传图片检索(不需要入排查库)；1表示上传图片检索(需要入排查库)
var imgUrl = UI.util.getUrlParam("imgUrl") || '';
var raceType = UI.util.getUrlParam("raceType") || ''; // 人员分类
var queryDate = UI.util.getUrlParam("queryDate") || ''; // 检索日期
window.getAlgoList = slideFn('face/common/getFaceAlgoType', 'EFACE_faceCapture');
//父页面调用按设备查询，回填
var device_s = UI.util.getUrlParam("DEVICE_S") || '';
var deviceIdStr = top.deviceIdsStr;
var deviceNameStr = top.deviceNameStr;
var orgCodeStr = top.orgCodes;
var deviceIdIntStr = top.deviceIdInts;
// var deviceNameStr = UI.util.getUrlParam("DEVICE_NAME") || '';
// var orgCodeStr = UI.util.getUrlParam("ORG_CODE") || '';
// var deviceIdStr = UI.util.getUrlParam("DEVICE_ID") || '';
// var deviceIdIntStr = UI.util.getUrlParam("DEVICE_IDINT") || '';

var scanData = [];  //缓存人脸扫描结果
var queryParams = {
    ALGO_LIST: JSON.stringify(getAlgoList()),
    PIC: imgSrc ? getFileid(imgSrc, true) : "",
    pageSize: 20,
    THRESHOLD: 60,
    DEVICE_IDS: "",
    KEYWORDS: "",
    /*PIC:imgSrc,*/
    BEGIN_TIME: beginTime,
    END_TIME: endTime,
    SORT_FIELD: 'JGSK',
    TOPN: 60,
    TIME_SORT_TYPE: 'DESC',
    isAsync: true
};
var total = 0; //保存分页总数

var uiOptions = {
    isMedia: false,
    // unload: imgSrc !=''? true: false
    unload: true
}

var timeOption = {
    'elem': $('#timeTagList'),
    'beginTime': $('#beginTime'),
    'endTime': $('#endTime'),
    'callback': getSearchTime
};

var faceRourceType = [
    { label: '路人库', value: '1' },
    { label: '旅业人脸', value: '2' },
    { label: '网吧人脸', value: '3' },
    { label: '汽车驾驶员人脸', value: '4' },
    { label: '门禁人脸', value: '5' }
]

var isNoImg = imgSrc != '' ? false : true;//有无图片上传
var sortSourceObj = {};//多来源排序数据
var sortTimeArr = [];//时间排序数据
var sortSimilarArr = [];//相似度排序数据
var sortAlgorithmObj = null;//算法分类排序数据
var userScene;
var isFaceSource = false;

var deviceType = 194; //卡口设备类型，默认传194
$(function () {
    UI.control.init();
    initEvent();
    compatibleIndexOf();
    initDateTimeControl(timeOption);
    //调用页面回填
    fatherSearchDevice();
    initFilterBar(); //先加载人脸来源再加载数据
    getDeviceModule();  //定义在common中
    //initData();
    topSpecialUploadPic();
    initWaterMark();
   	initPage();
    if (isRedList()) {
        showRedListTask({ searchType: 1, elem: "#redListWrap" });
    }
    
    if (raceType === 'foreign') {
        $('#race [value="3"]').trigger('click');
        if (queryDate) {
            $('#timeTagList [time-control="' + queryDate + '"]').trigger('click');
            UI.util.getUrlParam("BEGIN_TIME") && $('#beginTime').val(UI.util.getUrlParam("BEGIN_TIME"));
        }
        $('#confirmSearch').trigger('click');
    } else if (queryDate) {
        $('#timeTagList [time-control="' + queryDate + '"]').trigger('click');
        UI.util.getUrlParam("BEGIN_TIME") && $('#beginTime').val(UI.util.getUrlParam("BEGIN_TIME"));
        $('#confirmSearch').trigger('click');
    }
});
function initPage(){
	var isPicSearchConfig = getConfigValue({model:"efacecloud",keys:["FACE_LIST_SEARCH"]})["FACE_LIST_SEARCH"];
    if(isPicSearchConfig==1){
    	UI.control.remoteCall("face/capture/getFaceUploadPicConfig",{},function(resp){
    		if(resp&&resp.FACE_SEARCH==true){
    			$(".picUpdata").removeClass("hide");
    			$(".top-box").removeClass("pl0");
    		}    		
    	})
    
    }else{
    	$(".picUpdata").removeClass("hide");
    	$(".top-box").removeClass("pl0");
    }
    domPermission();
}
function hideModule(selector) {
    selector.addClass("hide");
}

function initFilterBar() {
    UI.util.showLoadingPanel();
    UI.control.remoteCall('', {}, function (resp) {
        let data = resp.data.Data;
        if(data && data.length > 0) {
            $("#faceRource").html(tmpl('faceRourceTemplate', data));
            isFaceSource = true;
            $("#faceRource").closest(".filter-bar").removeClass("hide");
            deviceType = data[0].OrgCode;
        }else {
            $("#sortList [type='sourceSort']").addClass('hide');
        }
        initData();
    }, function () {
        $("#sortList [type='sourceSort']").addClass('hide');
        initData();
    }, {url: '/portal/mx/v6/cp/device/getSourceList?DEVICE_TYPE=194', type: 'GET'}, true);
}

function initData() {
    if (imgSrc != "") {
        queryParams.SORT_FIELD = 'SCORE';
        queryParams.TIME_SORT_TYPE = '';
        $('[type="scoreSort"]').addClass('active').siblings().removeClass('active');
        $('#filterImg').attr('src', imgSrc);
        $('.bottom-pic-bar').removeClass('hide');//阈值框出现
        // bigImg = global.fileid;
        global.fileid = getFileid(imgSrc, true);

        if ($(".arithmetic-tools.on").length == 0) { //如果没有选中的算法，默认选择第一种；
            $(".arithmetic-tools:eq(0) i").trigger('click');
        }
        doSearch();
        /*$('#searchBtn').click();*/
    } else {
        doSearch();
    }

    $("#searchText").val("");
    $('[clearsearchkey="true"]').trigger('keyup');

    if (keyWords != "") {
        $('#searchText').val(keyWords);
    }
    if (pageLoadType == "true") {
        $('#searchText').val(UI.util.getUrlParam("keyword"));
    }
    if (!!imgUrl) {
        $("#filterImg").attr("src", imgUrl);
    }
}

//空字符串或者null转变为“未知”
function renderNullToNotKnow(str) {
    if (str == null || str == "" || typeof (str) == "undefined" || str == "PLATE") {
        return "未知";
    } else {
        return str;
    }
}

/**
 * 提供给父页面调用
 */
function searchAll(searchText) {
    if (searchText) {
        $('#searchText').val(searchText);
        $('[clearsearchkey="true"]').trigger('keyup');
    }
    doSearch();
}

//是否按照设备查询，回填。是否父页面调用
function fatherSearchDevice() {
    if (device_s == 1) {

        $('#deviceNames').html(deviceNameStr);
        $('#deviceNames').attr('title', deviceNameStr);
        $('#deviceNames').attr('orgcode', orgCodeStr);
        $('#orgCode').val(deviceIdStr);
        $('#orgCodeInt').val(deviceIdIntStr);

        addDrowdownDeviceList({
            deviceId: deviceIdStr,
            deviceName: deviceNameStr,
            deviceNameList: $("#deviceNameList"),
            dropdownListText: $(".dropdown-list-text")
        });
        // doSearch();
    }
}


function initEvent() {
    //详情
    $('body').on('click', '.detailSearch', function() {
        var id = $(this).attr('id'),
            type = $(this).attr('type');
        var url = '/efacecloud/page/library/faceCaptureDetail.html?id=' + id + '&type=' + type;
        UI.util.showCommonWindow(url, '人脸详情', 1000, 600, function(data) {});
    });
    //人员库切换
    $("#personBase .tag-item").click(function (e) {
        $(this).addClass('active').siblings().removeClass('active');
    })

    //有人脸检索的选中问题
    $(".page-con-sort").on("click", ".list-node-wrap", function () {
        var $this = $(this);
        if ($this.hasClass("active")) {
            $this.removeClass("active");
        } else {
            $this.addClass("active");
        }

        if ($(".sort-item").not(".hide").find(".list-node-wrap.active").length == $(".sort-item").not(".hide").find(".list-node-wrap").length) {
            $("#checkAll").prop("checked", true);
        } else {
            $("#checkAll").prop("checked", false);
        }
    });

    //有人脸检索表格选中问题
    $(".page-con-sort").on("click", ".picTableMessage", function () {
        var $this = $(this);
        if ($this.hasClass("active")) {
            $this.removeClass("active");
            $this.find(".picTableCheck").prop("checked", false);
        } else {
            $this.addClass("active");
            $this.find(".picTableCheck").prop("checked", true);
        }

        if ($(".sort-item").not(".hide").find(".picTableMessage.active").length == $(".sort-item").not(".hide").find(".picTableMessage").length) {
            $("#checkAll").prop("checked", true);
        } else {
            $("#checkAll").prop("checked", false);
        }
    });
    $(".page-con-sort").on("click", ".picTableCheck", function () {
        var $this = $(this);
        if ($this.prop("checked")) {
            $this.addClass("active");
            $this.find(".picTableCheck").prop("checked", true);
        } else {
            $this.removeClass("active");
            $this.find(".picTableCheck").prop("checked", false);
        }

        if ($(".sort-item").not(".hide").find(".picTableMessage.active").length == $(".sort-item").not(".hide").find(".picTableMessage").length) {
            $("#checkAll").prop("checked", true);
        } else {
            $("#checkAll").prop("checked", false);
        }
    });

    //有图片检索，全选功能
    $("#checkAll").click(function () {
        var type = $(".barItem.active").attr("type"),
            checked = $(this).prop("checked");

        if (checked) {
            if ($(".module.active").attr("attr-type") == 'card' || type == 'calcuSort') {
                $("#" + type).find(".list-node-wrap").addClass("active");
            } else {
                $("#" + type).find(".picTableMessage").addClass("active");
                $("#" + type).find(".picTableCheck").prop("checked", true);
            }
        } else {
            if ($(".module.active").attr("attr-type") == 'card' || type == 'calcuSort') {
                $("#" + type).find(".list-node-wrap").removeClass("active");
            } else {
                $("#" + type).find(".picTableMessage").removeClass("active");
                $("#" + type).find(".picTableCheck").prop("checked", false);
            }
        }
    });

    // 人员分类切换
    $('#race .tag-item').on('click', function () {
        var $this = $(this);

        $this.addClass('active').siblings().removeClass('active');
        // 选择全部
        if ($this.attr('value') === '') {
            // 所有算法可用
            $('.arithmetic-tools[algo_type]').removeClass('disabled');
            // 默认选综合算法
            $('.arithmetic-tools').removeClass('on');
            $('.arithmetic-tools.all span').trigger('click');
        } else {
            var params = {
                'MENUID': 'EFACE_faceCapture',
                'RACE': $this.attr('value')
            };
            UI.control.remoteCall('face/common/getAlgorithmByRace', params, function (resp) {
                var data = resp.data;
                if (data && data.length) {
                    $('.arithmetic-tools[algo_type]').addClass('disabled');
                    // 取消已选
                    $('.arithmetic-tools').removeClass('on');
                    $.each(data, function (i, obj) {
                        var id = obj.ALGORITHM_ID;
                        // 只有相应算法可用
                        $('.arithmetic-tools[algo_type="' + id + '"]').removeClass('disabled');
                        // 且默认选中相应算法
                        $('.arithmetic-tools[algo_type="' + id + '"] span').trigger('click');
                    });
                }
            });
        }
    });

    //多算法切换条件
    $("body").on("click", ".sort-list li", function () {
        var $this = $(this),
            index = $this.index();

        $this.addClass("active").siblings().removeClass("active");
        if (index == 0) {
            $("[container='scroll']").animate({ scrollTop: 0 }, 500);
        } else {
            var scrollWrapTop = $("[container='scroll']").scrollTop();
            if (scrollWrapTop == 0) {
                $("[container='scroll']").animate({ scrollTop: $(".sort-con-title").eq(index).offset().top + $("[container='scroll']").scrollTop() - 230 }, 500);
            } else {
                $("[container='scroll']").animate({ scrollTop: $(".sort-con-title").eq(index).offset().top + $("[container='scroll']").scrollTop() - 120 }, 500);
            }
        }

    });

    // 打开人脸扫描页面
    $('#editImgBtn').on('click', function () {
        //		var imgUrl = $('#filterImg').attr('src');
        var imgUrl = global.fileid;
        if ($('#filterImg').attr('src').slice(-12) != "noPhoto2.png") {  // 已上传图片
            UI.util.showCommonWindow("/efacecloud/page/scan/scanOld.html?imgUrl=" + imgUrl, "选择人脸", 1200, 700, function (data) {
                if (data.faceImg != '') {
                    if (!data.isCancel) {
                        $('#filterImg').attr('src', data.faceImg);
                    }
                    top.scanData = data.scanData;
                    //					global.fileid = data.faceImg;
                }
            }, null, null, null, null, null, 'false');
        } else {  // 未上传图片
            UI.util.alert("请先上传图片,再编辑", "warn");
        }
    })

    // 列表卡片展示方式
    $('.module').on('click', function () {
        var $this = $(this),
            type = $this.attr('attr-type');

        $this.addClass('active').siblings().removeClass('active');
        $(".list-node-wrap,.picTableMessage").removeClass("active");
        $("#checkAll").prop("checked", false);
        $(".picTableCheck").prop("checked", false);

        if (type == 'card') {	//卡片展示
            if (isNoImg && $(".barItem.active").attr("attr-type") === "time") {
                UI.control.getControlById("faceCollectionList").changeTemplate('faceTemplate');
            }
            $('body').find('.cardBox').removeClass('hide');
            $('body').find('.tableBox').addClass('hide');
            $('body').find('.tableCheck').each(function (i, item) {
                $(this).removeAttr('listview-check');
            });
            $('body').find('.nodeCheck').each(function (i, item) {
                $(this).attr('listview-check', '');
            });
        } else {  // 列表展示
            if (isNoImg && $(".barItem.active").attr("attr-type") === "time") {
                UI.control.getControlById("faceCollectionList").changeTemplate('faceTableTemplate');
            }
            $('body').find('.cardBox').addClass('hide');
            $('body').find('.tableBox').removeClass('hide');
            $('body').find('.nodeCheck').each(function (i, item) {
                $(this).removeAttr('listview-check');
            });
            $('body').find('.tableCheck').each(function (i, item) {
                $(this).attr('listview-check', '');
            });
        }
        // 若列表初始化无数据,则显示暂未图片
        if ($('.pageData').hasClass('hide')) {
            $('.listBox').each(function (i, item) {
                var parentDom = $(this).parent();
                if (parentDom.find('.nodata').length < 1) {
                    $(this).after('<div class="nodata"></div>');
                }
            })
        }
    });

    //排序切换
    $('.barItem').click(function () {
        var $this = $(this);

        if ($this.hasClass("disabled")) {
            return;
        }
        var type = $this.attr('attr-type'),
            timepx = $this.attr('attr-arc');
        prevType = $(".barItem.active").attr('attr-type');
        $(".list-node-wrap,.picTableMessage").removeClass("active");
        $("#checkAll").prop("checked", false);

        $this.addClass("active").siblings().removeClass("active");
        $('.px-icon').removeClass('active');
        $(".page-info-metro").removeClass("fixed");

        if (isNoImg && type == "time") {
            if (!(prevType == "time")) {
                queryParams.pageNo = 1;
            }
            $(".page-con,.tabs-box").removeClass("hide");
            $(".page-con-sort").addClass("hide");
            if (timepx == 'timeArc') {
                $this.attr('attr-arc', 'timeDesc');
                queryParams.SORT_FIELD = 'JGSK';
                queryParams.TIME_SORT_TYPE = 'DESC';
                $('.descIcon').removeClass('hide').siblings().addClass('hide');
            } else {
                $this.attr('attr-arc', 'timeArc');
                queryParams.SORT_FIELD = 'JGSK';
                queryParams.TIME_SORT_TYPE = 'ASC';
                $('.arcIcon').removeClass('hide').siblings().addClass('hide');
            }
            doSearch();
        } else if (isNoImg && type == "source") {
            if (!(prevType == "source")) {
                queryParams.pageNo = 1;
            }
            $(".page-con,.tabs-box").addClass("hide");
            doSearch();
        } else {
            if (type == 'time') {
                if (timepx == 'timeArc') {
                    $this.attr('attr-arc', 'timeDesc');
                    $('.descIcon').removeClass('hide').siblings().addClass('hide');
                } else {
                    $this.attr('attr-arc', 'timeArc');
                    $('.arcIcon').removeClass('hide').siblings().addClass('hide');
                }
            }
            if (type == 'calculate' || type == 'source') {
                $(".tabs-box").addClass("hide");
            } else {
                $(".tabs-box").removeClass("hide");
            }
            showHasImgData();
        }

    });

    //人脸来源切换
    $("#faceRource").on('click', '.tag-item', function (e) {
        $(this).toggleClass('active');
        var sourceType = $("#faceRource .tag-item.active").map(function (i, item) {
            return $(item).attr("value");
        })
        deviceType = [].slice.call(sourceType, 0).join(",");
    })

    //通过卡口树加载设备
    $('#deviceNames').click(function (e) {
        //回填数据
        checkDrowDownDeviceList({
            deviceNames: $('#deviceNames').html(),
            deviceId: $('#orgCode').val(),
            deviceIdInt: $('#orgCodeInt').val(),
            orgCode: $("#deviceNames").attr("orgcode")
        });
        UI.util.showCommonWindow(deviceModule + '/page/device/deviceList.html?deviceType=' + deviceType, '设备选择', 1000, 600, function (resp) {
            $('#deviceNames').html(resp.deviceName);
            $('#deviceNames').attr('title', resp.deviceName);
            $('#deviceNames').attr('orgcode', resp.orgCode);
            $('#orgCode').val(resp.deviceId);
            $('#orgCodeInt').val(resp.deviceIdInt);

            addDrowdownDeviceList({
                deviceId: resp.deviceId,
                deviceName: resp.deviceName,
                deviceNameList: $("#deviceNameList"),
                dropdownListText: $(".dropdown-list-text")
            });
        });
        e.stopPropagation();
    });

    //删除已选设备
    $("body").on("click", ".removeDeviceBtn", function (e) {
        var $this = $(this);
        var deviceId = $this.attr("deviceid");
        var deviceIdArr = $('#orgCode').val().split(",");
        var deviceIdIntArr = $('#orgCodeInt').val().split(",");
        var deviceNameArr = $('#deviceNames').html().split(",");
        var index = deviceIdArr.indexOf(deviceId),
            orgCode = $("#deviceNames").attr("orgcode"),
            orgCodeArr = orgCode.split(",");

        $this.parents("li").remove();
        deviceIdArr.splice(index, 1);
        deviceIdIntArr.splice(index, 1);
        deviceNameArr.splice(index, 1);
        orgCodeArr.splice(index, 1);
        $('#orgCode').val(deviceIdArr.join(","));
        $('#orgCodeInt').val(deviceIdIntArr.join(","));
        $('#deviceNames').html(deviceNameArr.join(","));
        $('#deviceNames').attr("title", deviceNameArr.join(","));
        $('#deviceNames').attr("orgcode", orgCodeArr.join(","));
        if ($("#deviceNameList li").length == 0) {
            $(".dropdown-list-text").attr("data-toggle", "");
            $(".dropdown-list-text .dropdown").addClass("hide");
            $(".dropdown-list").removeClass("open");
        }

        e.stopPropagation();
    });

    //点击进入卡口选择地图
    $('#locate').click(function () {
        UI.util.showCommonWindow(deviceModule + '/page/device/deviceMap.html?deviceType=' + deviceType, '感知设备', 1000, 600, function (resp) {
            $('#deviceNames').html(resp.deviceName);
            $('#deviceNames').attr('title', resp.deviceName);
            $('#deviceNames').attr('orgcode', resp.orgCode);
            $('#orgCode').val(resp.deviceId);
            $('#orgCodeInt').val(resp.deviceIdInt);

            addDrowdownDeviceList({
                deviceId: resp.deviceId,
                deviceName: resp.deviceName,
                deviceNameList: $("#deviceNameList"),
                dropdownListText: $(".dropdown-list-text")
            });
        });
    })

    //点击进入详细页面
    $('.library-info').on('click', '.similar-name a,.btn-more', function (event) {
        var id = $(this).closest('.list-node').find('.w100 span').text();
        showForm('/efacecloud/page/library/personnelFileMagDetail.html?id' + id);
        event.stopPropagation();
    });

    //展开搜索条件
    $('#fiflerState').click(function () {
        var $hideFilterBar = $('.filter-bar-hide'),
            icon = $(this).find('.icon'),
            $fiflerText = $(this).find('.fifler-text');

        if (icon.hasClass('icon-arrow-down9')) {
            icon.addClass('icon-arrow-up8').removeClass('icon-arrow-down9');
            $hideFilterBar.removeClass('hide');
            $fiflerText.html('收起');
        } else {
            icon.addClass('icon-arrow-down9').removeClass('icon-arrow-up8');
            $hideFilterBar.addClass('hide');
            $fiflerText.html('更多');
        }
    });

    //确认检索按钮
    $('#confirmSearch').click(function () {
        queryParams.pageNo = 1;
        doSearch();
    })

    //搜索
    $("#searchBtn").click(function () {
        doSearch();
    });

    //回车事件
    $('#searchText').keypress(function (e) {
        if (((e.keyCode || e.which) == 13)) {
            doSearch();
        }
    });

    //收藏
    $("body").on("click", ".collectionBtn", function () {
        var ref = $(this).attr("ref");
        UI.util.showCommonWindow(ref, "收藏文件夹",
            600, 450, function (obj) {
            });
    });

    //图片定位
    $("body").on("click", ".locationBtn", function () {
        var ref = $(this).attr("ref"),
            time = $(this).attr('attr-time'),
            addr = $(this).attr('attr-addr'),
            imgUrl = $(this).attr('fileUrl'),
            longitude = parseFloat($(this).attr('LONGITUDE')),
            latitude = parseFloat($(this).attr('LATITUDE'));
        if (longitude && longitude && longitude != 0 && longitude != 0) {
            var url = ref + '?time=' + time + '&addr=' + addr + '&imgUrl=' + imgUrl + '&longitude=' + longitude + '&latitude=' + latitude;
            UI.util.showCommonWindow(url, "定位",
                $(top.window).width() * .95, $(top.window).height() * .9, function (obj) {
                });
        } else {
            UI.util.alert("经纬度不合法！", "warn");
        }
    });

    //轨迹分析
    $("body").on("click", ".trajectory-search", function () {
        var url = $(this).attr("url");
        var time = {
            bT: queryParams.BEGIN_TIME,
            eT: queryParams.END_TIME
        }
        openWindowPopup('track', url, time, 'faceCaptureList');
        /*UI.util.showCommonWindow("/portal/page/tacticsFrame.html?pageUrl=/efacecloud/page/technicalStation/trackFaceForm.html?imgUrl=" + $(this).attr("url"), "轨迹预判",
                $(top.window).width()*.95, $(top.window).height()*.9, function(obj){
        });*/
        //top.animateLeftFrameIn("/efacecloud/page/technicalStation/trackFaceForm.html?imgUrl=" + $(this).attr("url")+'&backPageType=faceCaptureList');
    });

    //身份核查
    $("body").on("click", ".verification-search", function () {
        var $this = $(this);
        // openWindowPopup('identity',$(this).attr("url"));
        var faceID = $this.attr('face-id'),
            deviceID = $this.attr('device-id'),
            captureTime = $this.attr('capture-time'),
            identityId = $this.attr('identity-id'),
            algoList = '[{-ALGO_TYPE-:-' + $this.attr('algo-id') + '-,-THRESHOLD-:-60-}]',
            imgUrl = $this.attr('url');
        var title = '身份核查',
            src = matcher('/efacecloud/page/technicalStation/verification.html/' + top.projectID).url,
            query = '?imgUrl=' + imgUrl + '&faceID=' + faceID + '&deviceID=' + deviceID + '&captureTime=' + captureTime + '&identityId=' + identityId + '&algoList=' + algoList

        if (UI.control.hasPermission('EFACE_faceVerificationArchive')) {
            src = '/efacestore/page/library/personnelFileMagList.html';
            query = '?imgUrL=' + imgUrl;
        }

        var params = {
            src: src + query,
            title: title,
            width: $(top.window).width() * .95,
            height: $(top.window).height() * .9,
            callback: function (obj) {

            }
        };
        UI.util.openCommonWindow(params);
    });
    //以人搜人
    $("body").on("click", ".turnStructuredSearch", function () {
        var imgSrc = $(this).attr("imgSrc");
        UI.util.showCommonWindow("/efacecloud/page/library/imageCapture.html?imgSrc=" + imgSrc, "以人搜人", 1200, 700, function (cutImage) {
            top.UI.util.closeCommonWindow();
            UI.util.showCommonWindow("/datadefence/page/retrieval/structuredSearch.html?imgSrc=" + cutImage, "以人搜人", $(top.window).width() * .95, $(top.window).height() * .9,
                function (resp) {});
        });

    })
    //列表中的搜索链接
    $("body").on("click", ".search-btn", function () {
        searchByImage({
            fileUrl: $(this).attr("fileUrl"),
            bigImg: $(this).attr('bigImg')
        });
    });

    $("#freqAnalysisBtn").click(function () {
        var listData = UI.control.getDataById('faceCollectionList');
        beginTime = $('#beginTime').val();
        endTime = $('#endTime').val();
        if (listData.count <= 0) {
            UI.util.alert("暂无数据，请重新查询！", "warn");
            return;
        }
        if (!beginTime || !endTime) {
            UI.util.alert("请先选择一个时间或时间段", "warn");
            return;
        }
        UI.util.showCommonWindow("/efacecloud/page/perception/freqAnalysis.html", "频次分析", 451, 300, function (data) {
            var params = {};
            params.DEVICE_IDS = $("#orgCode").val();
            params.BEGIN_TIME = beginTime;
            params.END_TIME = endTime;
            /*params.similarity=77;*/
            var freqNum = data.freqNum;
            var THRESHOLD = data.THRESHOLD;
            var FACESCORE = data.FACESCORE;
            params.FREQ_NUM = freqNum;
            var pageSize = $("[listview-counts]").text() || 10000;//resp.pageSize ||
            var orgName = $('#deviceNames').html();
            searchTime = searchTime || "today";
            UI.util.showCommonIframe('.frame-form-full', '/efacecloud/page/perception/faceCaptureN2N.html?pageSize=' + pageSize + '&freqNum=' + freqNum +
                '&searchTime=' + searchTime + '&beginTime=' + beginTime + '&endTime=' + endTime + '&treeNodeId=' + $("#orgCode").val() +
                '&orgName=' + orgName + '&threshold=' + THRESHOLD + '&facescore=' + FACESCORE);
        });
    });
    /**
     * zyy
     * 修改频次分析跳转页面
     * 2018-07-77
     */
    $("#freqAnalysisBtn_1").click(function () {
        var listData = UI.control.getDataById('faceCollectionList');
        beginTime = $('#beginTime').val();
        endTime = $('#endTime').val();
        if (listData.count <= 0) {
            UI.util.alert("暂无数据，请重新查询！", "warn");
            return;
        }
        if (!beginTime || !endTime) {
            UI.util.alert("请先选择一个时间或时间段", "warn");
            return;
        }
        UI.util.showCommonWindow("/efacecloud/page/perception/freqAnalysis.html", "频次分析", 451, 300, function (data) {
            var params = {};
            params.DEVICE_IDS = $("#orgCode").val();
            params.BEGIN_TIME = beginTime;
            params.END_TIME = endTime;
            /*params.similarity=77;*/
            var freqNum = data.freqNum;
            var treeNodeId = $("#orgCode").val();
            var THRESHOLD = data.THRESHOLD;
            var FACESCORE = data.FACESCORE;
            params.FREQ_NUM = freqNum;
            var pageSize = $("[listview-counts]").text() || 10000;//resp.pageSize ||
            var orgName = $('#deviceNames').html();
            searchTime = searchTime || "today";

            UI.util.showLoadingPanel('', 'currentPage');
            var url = "face/capture/optimization/freqAnalysis";
            var queryParams = {/*similarity: 77,*/
                NUMS: freqNum,
                DEVICE_IDS: treeNodeId,
                DEVICE_GROUP: '',
                BEGIN_TIME: beginTime,
                END_TIME: endTime/*, sort: "JGSK"*/,
                THRESHOLD: THRESHOLD,
                FACE_SCORE: FACESCORE
            };

            UI.control.remoteCall(url, queryParams, function (resp) {
                var taskId = resp.TASK_ID;
                UI.util.showCommonIframe('.frame-form-full', '/efacecloud/page/perception/faceCaptureN2N_1.html?taskId=' + taskId + '&freqNum=' + freqNum +
                    '&searchTime=' + searchTime + '&beginTime=' + beginTime + '&endTime=' + endTime + '&treeNodeId=' + $("#orgCode").val() +
                    '&orgName=' + orgName + '&threshold=' + THRESHOLD + '&facescore=' + FACESCORE);
                UI.util.hideLoadingPanel('currentPage');
            }, function (data, status, e) {
                UI.util.hideLoadingPanel('currentPage');
            }, {
                    async: true
                });
        });
    });

    //阈值回车事件
    $('#threshold').keypress(function (e) {
        if (((e.keyCode || e.which) == 13)) {
            doSearch();
        }
    });

    //导出
    $('#exportPersonalBtn').click(function () {
        var exportParams = {};
        var url = UI.control.getRemoteCallUrl("face/capture/exportFace");
        var exportData = "";
        if ($('#filterImg')[0].src.slice(-12) != "noPhoto2.png" || $(".barItem.active").attr("attr-type") === "source") {

            var checkDataArr = [],
                id = $(".sort-item").not(".hide").attr("id");
            $.each($(".page-con-sort .list-node-wrap.active"), function (i, n) {
                var index = $(n).attr("curindex");
                switch (id) {
                    case 'timeSort':
                        checkDataArr.push(sortTimeArr[index]);
                        break;
                    case 'scoreSort':
                        checkDataArr.push(sortSimilarArr[index]);
                        break;
                    case 'calcuSort':
                        var subIndex = $(n).attr("subindex");
                        checkDataArr.push(sortAlgorithmObj[index].ALGORITHM_LIST[subIndex]);
                        break;
                    case 'sourceSort':
                        var key = $(n).attr("parentkey");
                        checkDataArr.push(sortSourceObj[key][index]);
                        break;
                }
            });
            $.each($(".page-con-sort .picTableMessage.active"), function (i, n) {
                var index = $(n).attr("curindex");
                switch (id) {
                    case 'timeSort':
                        checkDataArr.push(sortTimeArr[index]);
                        break;
                    case 'scoreSort':
                        checkDataArr.push(sortSimilarArr[index]);
                        break;
                }
            });
            exportData = checkDataArr;

            if (exportData.length <= 0) {
                UI.util.alert("请勾选导出的数据", "warn");
                return;
            }
            if (!isNoImg) {
                exportParams.SEARCH_IMG_URL = $('#filterImg')[0].src;
            }
            exportParams.EXPORT_DATA = JSON.stringify(exportData);
        } else {
            exportData = UI.control.getControlById('faceCollectionList').getListviewCheckData();
            if (exportData.length > 0) {
                exportParams.EXPORT_DATA = JSON.stringify(exportData);
            } else {
                exportParams.DEVICE_IDS = $("#orgCode").val();
                exportParams.THRESHOLD = $('#threshold').val();
                exportParams.KEYWORDS = $("#searchText").val() || "";
                exportParams.BEGIN_TIME = $('#beginTime').val() || "";
                exportParams.END_TIME = $('#endTime').val() || "";
            }
        }
        bigDataToDownload(url, "exportFrame", exportParams);
    });

    // 轨迹查看
    $('#gjSearch').click(function () {
        if (isNoImg && $(".barItem.active").attr("attr-type") === "time") {
            trackData = UI.control.getControlById('faceCollectionList').getListviewCheckData();
        } else {
            var checkDataArr = [],
                id = $(".sort-item").not(".hide").attr("id");
            $.each($(".page-con-sort .list-node-wrap.active"), function (i, n) {
                var index = $(n).attr("curindex");
                switch (id) {
                    case 'timeSort':
                        checkDataArr.push(sortTimeArr[index]);
                        break;
                    case 'scoreSort':
                        checkDataArr.push(sortSimilarArr[index]);
                        break;
                    case 'calcuSort':
                        var subIndex = $(n).attr("subindex");
                        checkDataArr.push(sortAlgorithmObj[index].ALGORITHM_LIST[subIndex]);
                        break;
                    case 'sourceSort':
                        var key = $(n).attr("parentkey");
                        checkDataArr.push(sortSourceObj[key][index]);
                        break;
                }
            });
            $.each($(".page-con-sort .picTableMessage.active"), function (i, n) {
                var index = $(n).attr("curindex");
                switch (id) {
                    case 'timeSort':
                        checkDataArr.push(sortTimeArr[index]);
                        break;
                    case 'scoreSort':
                        checkDataArr.push(sortSimilarArr[index]);
                        break;
                }
            });
            trackData = checkDataArr;
        }
        // 数据处理: 按照时间正序排列
        trackData = trackData.sort(function (item1, item2) {
            return new Date(item1.JGSK).getTime() - new Date(item2.JGSK).getTime();
        })
        if (trackData.length <= 0) {
            UI.util.alert("请勾选轨迹查看数据!", "warn");
            return;
        } else {
            //var pageUrl = '/efacecloud/page/library/trackSearch.html';
            //UI.util.showCommonIframe('.frame-form-full','/portal/page/tacticsFrameJs.html?pageUrl='+pageUrl);
            var curData = [];
            $.each(trackData, function (i, n) {
                var obj = {};
                obj = n;
                obj.X = n.LONGITUDE;
                obj.Y = n.LATITUDE;
                obj.TIME = n.CJSJ;
                obj.jgsj = n.JGSK;
                curData.push(obj);
            });
            var pageUrl = '/efacecloud/page/technicalStation/tacticsFrame.html?pageType=trackResult&getDataType=trackResult';
            UI.util.showCommonIframe('.frame-form-full', pageUrl);
            //top.showTrajectoryWindow(curData);
        }
    });


    // 抓拍设备列表
    $('#capDevice').click(function () {
        UI.util.showCommonIframe(".frame-form-full", "/eapmanageutils/page/retrieval/faceCapDeviceSum.html");
    });

    //自定义分页
    $(".page-prev-btn").click(function (e) {
        if ($(this).hasClass('disabled')) return;
        queryParams.pageNo--
        doSearch();
    })
    $(".page-next-btn").click(function (e) {
        if ($(this).hasClass('disabled')) return;
        queryParams.pageNo++
        doSearch();
    })

    UI.control.getControlById("faceCollectionList").bind("load", function () {
        StructuredSearchSwitch();
    })


    if (UI.control.hasPermission("DEFENCE_capDevice")) {
        $("#capDevice").removeClass("hide");
    }
};
function setSourcePage() {
    var page = Math.ceil(total / queryParams.pageSize);
    $(".page-number span").text(total);
    $(".page-total").text(page)
    $(".page-current").text(queryParams.pageNo);
    if (queryParams.pageNo == 1) {
        $(".page-prev-btn").addClass("disabled")
    } else {
        $(".page-prev-btn").removeClass("disabled")
    }
    if (queryParams.pageNo == page) {
        $(".page-next-btn").addClass("disabled")
    } else {
        $(".page-next-btn").removeClass("disabled")
    }
}

function StructuredSearchSwitch() {
    var map = {
        "applicationName": "portal"
    };
    UI.control.remoteCall('platform/webapp/config/get', map, function (resp) {
        var jsonObj = resp.attrList;
        for (var i = 0; i < jsonObj.length; i++) {
            //结构化检索显隐开关。
            if (jsonObj[i].key == "MENU_COMPATIBLE_SEQUENCE" && jsonObj[i].value != "默认") {
                $("[title='结构化检索']").addClass('hide');
            }
        }
    });
};

function searchByImage(option) {

    similayDec(); //默认是相似度排序
    fileUrl = option.fileUrl;
    isUpload = UPLOAD_RETRIEW_FALSE;
    $("#filterImg").attr("src", fileUrl);
    global.fileid = option.bigImg;
    if ($(".arithmetic-tools.on").length == 0) { //如果没有选中的算法，默认选择第一种；
        $(".arithmetic-tools:eq(0) i").trigger('click');
    }
    $("#filterImg").attr("hasImg", "1"); //1:存在图片 0：不存在
    $('.bottom-pic-bar').removeClass('hide');//阈值框出现

    // 将搜索框的hidden input
    $('#uploadImg').val('');
    doSearch();
}


//初始化下拉选择框
function initTreeEvent() {
    var orgTree = UI.control.getControlById("orgTree");
    orgTree.bindEvent("onDropdownSelect", function (node) {
        var orgCode = "";
        if (node) {
            for (var i = 0; i < node.length; i++) {
                if (!node[i].isParent) {
                    if (orgCode === "") {
                        orgCode = node[i].id;
                    } else {
                        orgCode = orgCode + "," + node[i].id;
                    }
                }
            }
        }
        $("#orgCode").val(orgCode);
        curOrgCode = orgCode;
    });
    var allNodeIds = orgTree.getDropdownSelectIds();
    curOrgCode = allNodeIds;

}

function doSearch() {
    if (UI.util.validateForm($('#thresholdValidate'))) {
        queryParams.isAsync = true;
        //queryParams.pageNo = 1;
        queryParams.DEVICE_IDS = $("#orgCode").val();
        queryParams.DEVICE_IDS_INT = $("#orgCodeInt").val();
        queryParams.THRESHOLD = $('#threshold').val();
        queryParams.KEYWORDS = $("#searchText").val();
        beginTime = $('#beginTime').val();
        endTime = $('#endTime').val();
        queryParams.BEGIN_TIME = beginTime;
        queryParams.END_TIME = endTime;
        queryParams.ALGO_LIST = JSON.stringify(getAlgoList());
        if ($(".arithmetic-tools.on").hasClass('all')) {
            queryParams.ALGOALL = 1;
        } else {
            queryParams.ALGOALL = '';
        }

        if ($('#filterImg')[0].src.slice(-12) != "noPhoto2.png") {
            queryParams.PIC = $('#filterImg').attr('src');
        } else {
            queryParams.PIC = "";
        }
        if (isFaceSource) {
            queryParams.SOURCE_TYPE = deviceType;
        }

        queryParams.REGISTER_STATUS = $("#personBase .tag-item.active").attr("value");
        //检索案件录入
        /*if(isOpenSearchCause()){*/
        var searchParams = queryParams;
        searchParams.searchType = 1;
        searchParams.deviceName = $("#deviceNames").html();
        searchParams.THRESHOLD = $("#threshold").val();
        searchBeforeLogged(function () {
            filterSearch();
        }, searchParams);
        /*}else{
            filterSearch();
        }*/

    }
}

// 过滤搜索
function filterSearch() {
    if ($('#filterImg')[0].src.slice(-12) != "noPhoto2.png") {
        $("#freqAnalysisBtn").addClass("hide");
        //        queryParams.FILE_ID = global.fileid;
        $(".tag-item[type=scoreSort]").removeClass("disabled");
        $(".tag-item[type=calcuSort]").removeClass("disabled");
        $(".page-info-metro.square-pager").addClass("hide");

        UI.util.showLoadingPanel();
        UI.control.remoteCall("face/capture/query", queryParams, function (resp) {

            UI.util.hideLoadingPanel();
            sortSourceObj = {};
            sortTimeArr = [];
            sortSimilarArr = [];//相似度排序数据
            sortAlgorithmObj = resp.data ? resp.data.LIST : resp.faceCollectionList.LIST;

            for (var j = 0; j < sortAlgorithmObj.length; j++) {
                for (key in sortAlgorithmObj[j]) {
                    if (key == 'ALGORITHM_LIST') {
                        if(isFaceSource) {
                            sortSourceObj = getSourceData(sortAlgorithmObj[j][key]);
                        }
                        $.each(sortAlgorithmObj[j][key], function (i, n) {
                            //时间排序
                            if (sortTimeArr.length == 0) {
                                sortTimeArr.unshift(n);
                            } else {
                                $.each(sortTimeArr, function (index, listCon) {
                                    if (compareTime(n.JGSK, listCon.JGSK)) {
                                        sortTimeArr.splice(index, 0, n);
                                        return false;
                                    } else if ((sortTimeArr.length - 1) == index) {
                                        sortTimeArr.push(n);
                                    }
                                });
                            }
                            //相似度排序
                            if (sortSimilarArr.length == 0) {
                                sortSimilarArr.unshift(n);
                            } else {
                                $.each(sortSimilarArr, function (index, listCon) {
                                    if (compareScore(n.SCORE, listCon.SCORE)) {
                                        sortSimilarArr.splice(index, 0, n);
                                        return false;
                                    }
                                    if ((sortSimilarArr.length - 1) == index) {
                                        sortSimilarArr.push(n);
                                    }
                                });
                            }
                        });
                    }
                }
            }
            //选择相似度排序
            $('#sortList [attr-type="similar"]').addClass('active').siblings().removeClass('active');
            $('[type="scoreSort"],[type="calcuSort"]').attr("isFirst", true);
            showHasImgData();
            isNoImg = false;
            $("#checkAll").removeAttr("listview-checkall");
            $(".tabs-box").removeClass("hide");
        }, function () {
        }, {}, true);
    } else {
        $(".tag-item[type=scoreSort]").addClass("disabled");
        $(".tag-item[type=calcuSort]").addClass("disabled");
        isNoImg = true;
        if ($(".px-item.active").attr("attr-type") === "time") {
            $("#freqAnalysisBtn").removeClass("hide");
            UI.control.getControlById("faceCollectionList").reloadData(null, queryParams);
            $(".source-page").addClass("hide");
            $(".page-info-metro.square-pager").removeClass("hide");
            $("#checkAll").attr("listview-checkall", "");
            $(".page-con").removeClass("hide");
            $(".page-con-sort").addClass("hide");
        } else if ($(".px-item.active").attr("attr-type") === "source") {
            UI.control.remoteCall("face/capture/query", queryParams, function (resp) {
                total = resp.faceCollectionList.count;
                if(isFaceSource) {
                    sortSourceObj = getSourceData(resp.faceCollectionList.records);
                }
                $(".page-info-metro.square-pager").addClass("hide");
                $(".page-info-metro").removeClass("fixed");
                $(".source-page").removeClass("hide");
                setSourcePage();
                showHasImgData();
            }, function () { }, {}, true)
        }
    }
}

//展示结果
function showHasImgData() {
    UI.util.showLoadingPanel();
    var $curSort = $(".px-item.active"),
        curId = $curSort.attr("type"),
        tmplHtml = '',
        data = [];
    $(".page-con").addClass("hide");
    $(".page-con-sort").removeClass("hide");
    if (!isNoImg) {
        $(".source-page").addClass("hide");
    }
    if ($curSort.attr('isFirst') == 'true') {
        switch (curId) {
            case "timeSort":
                var timepx = $curSort.attr("attr-arc");
                data = sortTimeArr.reverse();
                tmplHtml = 'timeScoreTemplate';
                break;
            case "scoreSort":
                tmplHtml = 'timeScoreTemplate';
                data = sortSimilarArr;
                $curSort.attr("isFirst", false);
                break;
            case "calcuSort":
                tmplHtml = 'calcuTemplate';
                $curSort.attr("isFirst", false);

                var keyArr = [],
                    sortAlgorithmArr = [];
                for (var i = 0; i < sortAlgorithmObj.length; i++) {
                    if (sortAlgorithmObj[i].ALGORITHM_LIST.length > 0) {
                        for (key in sortAlgorithmObj[i]) {
                            if (key == 'ALGORITHM_ANME') {
                                keyArr.push(sortAlgorithmObj[i][key]);
                            }
                            if (key == 'ALGORITHM_LIST') {
                                sortAlgorithmArr.push(sortAlgorithmObj[i][key]);
                            }
                        }
                    }
                }

                if (keyArr.length > 0) {
                    var curObj = {
                        key: keyArr,
                        sortAlgorithmObj: sortAlgorithmArr
                    };
                    data = [];
                    data.push(curObj);
                }

                break;
            case "sourceSort":
                tmplHtml = 'sourceTemplate';
                break;
        }

        if (data.length > 0) {
            $("#" + curId).html(tmpl(tmplHtml, data));
            $('.pageData').removeClass('hide');//不进入添加nodata
        } else if (JSON.stringify(sortSourceObj) !== "{}") {
            $("#" + curId).html(tmpl(tmplHtml, sortSourceObj));
            $('.pageData').removeClass('hide');//不进入添加nodata
        } else {
            $("#" + curId).html('<div class="nodata"></div>');
        }
        $(".module.active").click();
        if (curId == 'calcuSort') {
            $(".sort-list li:first").addClass("active");
        }
    }
    $(".sort-item").addClass("hide");
    $("#" + curId).removeClass("hide");
    UI.util.hideLoadingPanel();
}

function getSourceData(data) {
    var sourceObject = {};
    for (var i = 0; i < data.length; i++) {
        if (data[i].SOURCE_TYPE in sourceObject) {
            sourceObject[data[i].SOURCE_TYPE].push(data[i])
        } else {
            sourceObject[data[i].SOURCE_TYPE] = [data[i]]
        }
    }
    return sourceObject;
}

function renderFaceRourceType(val) {
    var label = '';
    faceRourceType.some(function (item) {
        if (item.value === val) {
            label = item.label;
            return true;
        }
    });
    return label;
}

//相似度比较大小
function compareScore(firstScore, secondScore) {
    var d1 = parseInt(firstScore);
    var d2 = parseInt(secondScore);

    if (firstScore != "" && secondScore != "" && d1 >= d2) {
        //firstScore > secondScore
        return true;
    } else {
        return false;
    }
}

//日期比较时间大小
function compareTime(firstTime, secondTime) {
    var d1 = new Date((firstTime + '').replace(/\-/g, "\/"));
    var d2 = new Date((secondTime + '').replace(/\-/g, "\/"));

    if (firstTime != "" && secondTime != "" && d1 >= d2) {
        //firstTime > secondTime
        return true;
    } else {
        return false;
    }
}


function getSearchTime(dateTime) {
    beginTime = dateTime.bT;
    endTime = dateTime.eT;
    queryParams.BEGIN_TIME = beginTime;
    queryParams.END_TIME = endTime;
}

//两个时间相差天数 兼容firefox chrome
function datedifference(sDate1, sDate2) {    //sDate1和sDate2是2006-12-18格式
    var dateSpan,
        tempDate,
        iDays;
    sDate1 = Date.parse(sDate1);
    sDate2 = Date.parse(sDate2);
    dateSpan = sDate2 - sDate1;
    dateSpan = Math.abs(dateSpan);
    iDays = Math.ceil(dateSpan / (24 * 3600 * 1000));
    return iDays
};

//上传图片后,将查询方式改为按照相似度查询
function similayDec() {
    //$('#sortList [attr-type="similar"]').addClass('active').siblings().removeClass('active');
    queryParams.SORT_FIELD = 'SCORE';
    //doSearch();
}

// 普通检索，按照时间倒序排列
function timeDecFun() {
    $('#sortList [attr-type="time"]').addClass('active')
        .attr('attr-arc', 'timeDesc')
        .siblings().removeClass('active');
    queryParams.SORT_FIELD = 'JGSK';
    queryParams.TIME_SORT_TYPE = 'DESC';
}
