﻿var pageType = UI.util.getUrlParam('pageType') || '';
var checkName = UI.util.getUrlParam('checkName') || '';
var checkNameString = "";
if(checkName){
	checkNameString = "("+checkName+")";
}
if (pageType === '身份确认') {
    $('.page-title span').text('身份确认'+checkNameString);
    var identityId = UI.util.getUrlParam('identityId') || '';
    var THIS_RPID = UI.util.getUrlParam('rpid') || '';
    var THIS_PERSON_ID = UI.util.getUrlParam('personid') || '';
    var TYPE = '',
        NEW_RPID = '',
        OBJ_PIC = '';
} else {
    $('.page-title span').text('身份核查'+checkNameString);
}

var queryParams = {
    THRESHOLD: '',
    TOP_NUMBER: '',
    IMG_URL_LIST: '',
    ALGORITHM_ID: '',
    REPOSITORY_ID: ''
};
var imgUrl = UI.util.getUrlParam("imgUrl");

var hasLocalSearch = false;
UI.control.remoteCall('platform/webapp/config/get', { "applicationName": "efacestore" }, function (resp) {
    var jsonObj = resp.attrList;
    for (var i = 0; i < jsonObj.length; i++) {
        if (jsonObj[i].key == 'IS_LOCAL_SEARCH_OPEN' && jsonObj[i].value == "1") {
            hasLocalSearch = true;
        }
    }
});
var localrecResult = null; // 本地档案推荐结果
var outrecResult = null; // 外籍人推荐结果
var recResult = null; // 最终推荐结果

var outresultFlag = false, localresultFlag = false; //两个请求成功的标识

var faceID = UI.util.getUrlParam('faceID') || '';
var deviceID = UI.util.getUrlParam('deviceID') || '';
var captureTime = UI.util.getUrlParam('captureTime') || '';
var identityId = UI.util.getUrlParam('identityId') || '';
var algoList = UI.util.getUrlParam('algoList') || '';
var ALGO_LIST = [{"ALGO_TYPE":getFaceAndForeignAlgoType(),"THRESHOLD":"60"}];
if (algoList) {
    ALGO_LIST = [];
    algoList = algoList.replace(/-/g, '"');
    try {
        algoList = JSON.parse(algoList);
        $.each(algoList, function (i, obj) {
            ALGO_LIST.push({
                ALGO_TYPE: obj.ALGO_TYPE,
                THRESHOLD: '60'
            });
        });
    } catch (error) {
        UI.util.debug(error);
    }
}else {
    algoList = ALGO_LIST;
}

var NAME = '',
    IDENTITY_ID = '',
    IDENTITY_TYPE = '',
    rpID = '';
var basicInfo = null;

var imgArr = []; //存储检索图片列表
var searchingFlag = false;
var unSearchImg = []; //上传了，但未进行检索的图片数组

var isFirstLoading = true;  //是否是第一次检索
var cacheIDs = []; //存储当前检索的列表IDS

// var addressOption = {//初始化人脸库
//     'elem': ['domicile'],//地址HTML容器
//     'addressId': ['registerDbList'],//初始化人脸库内容
//     'tmpl': 'childNodeListTemplate',//初始化模板
// };

$(function () {
    UI.control.init();
    initPage();// 初始化算法筛选列表,拿到阈值等进行图片检索，根据ID展示图片检索结果
    initEvent();//初始化页面点击事件
    initWaterMark(); //添加水印
})

function initEvent() {
    // 四标四实
    $('body').on('click', '.detailIFrame', function (e) {
        if (!UI.control.hasPermission("DEFENCE_WGSBSS")) return;
        var zjlx = $(this).data('zjlx') || '公民身份证';
        var zjhm = $(this).data('zjhm');
        var name = $(this).data('name');
        UI.util.openCommonWindow({
            src: 'http://' + JSON.parse(UI.control.getPermissionMenus().DEFENCE_WGSBSS.URL).URL + '/newui/autoLogin.html?account=' + JSON.parse(UI.control.getPermissionMenus().DEFENCE_WGSBSS.URL).USER_NAME + '&toURL=newui/newpc/dist/index.html^/population?zjhm=' + zjhm,
            width: $(top.window).width() * .95,
            height: $(top.window).height() * .85,
            title: name,
            parentFrame: 'currentPage'
        });
    });
    //跳转个人信息页面
    $("body").on("click", ".privateDetail", function (e) {
        e = e || window.event;
        e.stopPropagation();
        var zjhm = $(this).data("zjhm") || '',
            gjdm = $(this).data("gjdm") || '',
            zjzl = $(this).data("zjzl") || '';
        top.globalCache.verification_url = $(this).data("url");
        var opts = {
            title: "个人信息",
            width: $(top.window).width() * .95,
            height: $(top.window).height() * .9,
            src: '/efacecloud/page/technicalStation/verificationExpand.html?zjhm=' + zjhm + '&gjdm=' + gjdm + '&zjzl=' + zjzl,
            callback: function () { }
        };
        UI.util.openCommonWindow(opts);
    });

    //如果是图片，选择文件之后马上上传，这样才能在页面上显示预览图
    $("body").on('change', '#uploadFile', function () {
        ajaxMultiImageUpload();
    });

    // 切换图片检索结果
    $("body .resultTab").on("click", "li", function () {
        if ($(this).hasClass('disabled')) {
            return;
        }
        var $this = $(this);
        var targetId = $this.attr('attrId');
        showResult(targetId);
    })
    // 向左滚动
    $("body").on("click", ".leftBtn", function () {
        var left = Number($('.photo-scroll').position().left);
        if (left >= 0) {
            $(".photo-scroll").css("left", 0)
        } else {
            $(".photo-scroll").css("left", left + 158 + "px")
        }
    })
    // 向右滚动
    $("body").on("click", ".rightBtn", function () {

        var left = Number($('.photo-scroll').position().left);
        if (left <= $(".face").width() - $(".photo-scroll").width()) {
            return;
        } else {
            $(".photo-scroll").css("left", left - 158 + "px")
        }

    })


    // 点击删除当前图片
    $("body").on("click", ".colse", function () {
        var $this = $(this);
        var targetLi = $this.parents("li");
        var curId = targetLi.attr('attrId');
        var curImg = targetLi.find('img').attr('src');

        if (unSearchImg.indexOf(curImg) != -1) {
            unSearchImg.splice(unSearchImg.indexOf(curImg), 1);
        }
        if (imgArr.indexOf(curImg) != -1) {
            imgArr.splice(imgArr.indexOf(curImg), 1);
        }

        // 此处的tab删除，应该根据唯一的ID来删除
        if (searchingFlag) {
            UI.util.alert("该图片正在查询，请稍后操作", 'warn');
            return;
        } else {
            var imgSrc = $this.siblings().attr("src");
            targetLi.remove(); //删除图片
            deleteResult(curId);
        }

        // 若图片已经全部删除，则将数据清空
        if (cacheIDs.length == 0) {
            clearData();
        }

        if ($("#imgBox li").length < 3) {
            $(".top-box").css("display", "table");
            $(".img-wraper ").width($(".img-list li").length * 158 + 250).css("display", "table-cell");
            $(".filter-view").css({ "top": "0" }, { "display": "table-cell" });
        }
        $("#imgBox").width($(".img-list li").length * 158 + 20);
        if ($("#imgBox li").length * 158 + 158 + 40 < $(".page-title").width() - 50) {
            $("body #silderPrev").addClass("hide");
            $("body #silderNext").addClass("hide");
        }

    })

    //轨迹分析
    $("body").on("click", ".trajectory-search", function () {
        openWindowPopup('track', $(this).attr("url"));
    });

    // 路人检索
    $("body").on("click", ".lrjs-search", function () {
        var curSrc = matcher('/efacecloud/page/library/faceCaptureList.html/' + top.projectID).url;
        curSrc += '?imgSrc=' + $(this).attr("url");
        // 打开页面
        UI.util.showCommonWindow(curSrc, '路人检索', $(top.window).width() * .95, $(top.window).height() * .9, function (obj) { });
    });

    // 一人一档检索
    $("body").on("click", ".yryd-search", function () {
        if ($(this).hasClass("privateDetail")) {
            return;
        }
        var url = '/efacestore/page/library/personnelFileMagList.html?imgSrc=' + $(this).attr("url");
        // 打开页面
        UI.util.showCommonWindow(url, '一人一档', $(top.window).width() * .95, $(top.window).height() * .9, function (obj) { });
    });

    // 一人一档详情
    $("body").on("click", ".yryd-detail", function () {
        var $listNodeWrap = $(this).parents('.list-node-wrap');

        var personId = $listNodeWrap.attr('personid'),
            identitynum = $listNodeWrap.find('.identity-id').text(),
            rpID = $listNodeWrap.attr('face-id'),
            pic = $listNodeWrap.find('.person-img').find('.mb0').attr('src'),
            faceid = $listNodeWrap.attr('face-id'),
            name = $listNodeWrap.find('.similar-name').find('a').text();

        var queryStr = '?personId=' + personId + "&identityNum=" + identitynum + "&rpID=" + rpID + "&pic=" + pic + "&name=" + name + '&faceid=' + faceid;
        UI.util.showCommonWindow('/efacestore/page/personLibrary/foreigners/foreignersPersonalDetail.html' + queryStr, '一人一档详情', $(top.window).width() * .95, $(top.window).height() * .9);
    });

    //返回菜单
    $('body').on('click', '#backBtn', function () {
        // 返回父级页面
        parent.showMenu();
    });

    //点击进入详细页面
    $('.library-info').on('click', '.similar-name a,.btn-more', function (event) {
        var personId = $(this).closest('.list-node-wrap').attr('personid');
        var imgurl = $(this).parents(".library-info").siblings(".page-info-metro").find(".active img").attr("src");
        var imgurl2 = $(this).attr('info')
        var rlk = $(this).attr('info2')
        var name = $(this).html();
        var similar = $(this).attr('info3')
        var trackArr = [];
        var obj = {};
        obj.personId = personId;
        obj.imgurl = imgurl;
        obj.imgurl2 = imgurl2;
        obj.rlk = rlk;
        obj.name = name;
        obj.similar = similar;
        trackArr.push(obj);
        if (parent.window.frames['mainContent']) {
            parent.window.frames['mainContent'].trackData = trackArr;
        }

        // UI.util.showCommonWindow('/efacecloud/page/technicalStation/particulars.html?personId=' + personId + '&imgurl=' + imgurl + '&imgurl2=' + imgurl2 + '&rlk=' + rlk + '&name=' + name + '&similar=' + similar, "详情",
        //     434, 235, function (obj) {
        //
        //     });
        UI.util.showCommonWindow('/efacecloud/page/technicalStation/particulars.html', "详情",
            434, 235, function (obj) {
            });
    });

    // 点击确认检索
    $('#confirmSearch').click(function () {
        // 监听检索条件是否改变  isReload
        var isReload = compareFilter();

        if ($("#imgBox li").length < 2) {
            UI.util.alert("请上传图片之后再进行检索！", 'warn');
            return;
        }
        if (UI.util.validateForm($('#thresholdValidate'), true)) {
            if (searchingFlag) {
                UI.util.alert("正在查询中，请稍后再进行检索", 'warn');
            } else {
                // 限制最多检索十张
                var searchImgsLength = $('#imgBox li').length;
                if (searchImgsLength <= 11) {
                    if (unSearchImg.length > 0) {
                        for (var i = 0; i < unSearchImg.length; i++) {
                            imgArr.push(unSearchImg[i]);
                        }
                    }
                    unSearchImg.length = 0;
                    // 初始化模版
                    for (var i = imgArr.length - 1; i >= 0; i--) {
                        $('#imgBox li').eq(i).attr('attrId', cacheIDs[i]);
                    }
                    if (isReload) {  // 条件变了,全部重新检索
                        imgArr = [];
                        cacheIDs = [];
                        $('#imgBox li').each(function (index, item) {
                            if (index != $('#uploadDiv li').length - 1) {
                                cacheIDs.push($(this).attr('attrid'));
                                imgArr.push($(this).find('img').attr('src'));
                            }
                        })
                        $('#resultTab').html('');
                        // 删除以前的检索模板
                        $('.personList').each(function (index, item) {
                            $(this).remove();
                        })
                        $('.recommendList').each(function (index, item) {
                            $(this).remove();
                        })
                        isFirstLoading = true;
                    }
                    $.each(imgArr, function (index, item) {
                        var html = '<li title="检索结果" attrid='+ cacheIDs[index] +' class="disabled"><span class="load-icon"></span><img src=' + item + ' alt="">&nbsp;&nbsp;&nbsp;检索结果</li>';
                        $("#resultTab").append(html); // tab标签
                    });
                    imgDoSearch();
                } else {
                    UI.util.alert("最多只能检索十张照片！", 'warn');
                }
            }
        }

    });
    // 检索结果展开
    $("body").on("click", ".setting-down", function () {
        var $this = $(this);
        $this.parent().toggleClass("active");

        if ($this.hasClass("icon-uniE91A")) {
            $this.removeClass("icon-uniE91A");
            $this.addClass("icon-arrow-down10");
        } else {
            $this.addClass("icon-uniE91A");
            $this.removeClass("icon-arrow-down10");
        }
    })
    // 算法列表点击
    $("#sfList li").on("click", function () {
        var $this = $(this);
        var checkVal = $this.attr('val');
        var sfVal = '';
        if ($this.hasClass("active")) {
            $this.removeClass("active");
            sfVal = UI.control.getControlById("sfList").getValue();
            sfVal = sfVal.toString()
            $("#sfVal").val(sfVal);
            return;
        }
        if (checkVal == "") {
            $("#sfVal").val('');
            $this.addClass('active').siblings().removeClass('active');
        } else {
            $this.addClass('active').siblings().eq(0).removeClass('active');
            sfVal = UI.control.getControlById("sfList").getValue();
            sfVal = sfVal.toString()
            $("#sfVal").val(sfVal);
        }
    });
    // 开启本地库检索
    if (hasLocalSearch) {
        $('body').on('click', '.list-node', function () {
            var $this = $(this);

            $('.list-node').removeClass('active');
            $(this).addClass('active');

            basicInfo = getBasicInfo($this);
            if (pageType === '身份确认') {
                $('#confirmBtn').removeAttr('disabled');
                TYPE = $this.attr('confirm-type');
                NEW_RPID = $this.attr('rpID');
                IDENTITY_ID = $this.attr('identity-id');
                NAME = $this.attr('name');
                OBJ_PIC = $this.attr('pic');
            } else {
                $('#modifyBtn').removeAttr('disabled');
                rpID = $this.attr('rpID');
                NAME = $this.attr('name');
                IDENTITY_ID = $this.attr('identity-id');
                IDENTITY_TYPE = $this.attr('identity-type');
            }
            $('#newBtn').removeClass('hide');
        });

        $('#modifyBtn').on('click', function () {
            if ($(this).attr('disabled')) {
                return;
            }
            if (rpID) {
                updateFace({
                    RP_ID: rpID, // 需要归档的人员ID
                    NAME: NAME, // 需要归档的人员姓名
                    IDENTITY_TYPE: IDENTITY_TYPE, // 需要归档的人员身份证类型
                    IDENTITY_ID: IDENTITY_ID,   // 需要归档的人员身份证
                    FACE_ID: faceID,       // 抓拍人脸的人脸ID
                    PIC: imgUrl,           // 抓拍人脸URL
                    DEVICE_ID: deviceID,     // 抓拍人脸的设备ID
                    CAPTURE_TIME: captureTime,  // 抓拍人脸的抓拍时间
                    TYPE: 2,          // 判断状态 2、确认或选择推荐 3、误判
                    ALGO_TYPE: algoList[0].ALGO_TYPE
                });
            } else {
                var params = {
                    IDENTITY_TYPE: IDENTITY_TYPE,
                    IDENTITY_ID: IDENTITY_ID,
                    RP_ID: 'temp_'
                };
                UI.control.remoteCall('facestore/archives/idCardQuery', params, function (resp) {
                    var data = resp.data && resp.data[0];
                    if (data) {
                        updateFace({
                            RP_ID: data.RPID, // 需要归档的人员ID
                            NAME: NAME, // 需要归档的人员姓名
                            IDENTITY_TYPE: data.IDENTITY_TYPE, // 需要归档的人员身份证类型
                            IDENTITY_ID: data.IDENTITY_ID,   // 需要归档的人员身份证
                            FACE_ID: faceID,       // 抓拍人脸的人脸ID
                            PIC: imgUrl,           // 抓拍人脸URL
                            DEVICE_ID: deviceID,     // 抓拍人脸的设备ID
                            CAPTURE_TIME: captureTime,  // 抓拍人脸的抓拍时间
                            TYPE: 2,         // 判断状态 2、确认或选择推荐 3、误判
                            ALGO_TYPE: algoList[0].ALGO_TYPE
                        });
                    } else {
                        updateFace({
                            RP_ID: params.RP_ID, // 需要归档的人员ID
                            NAME: NAME, // 需要归档的人员姓名
                            IDENTITY_TYPE: IDENTITY_TYPE, // 需要归档的人员身份证类型
                            IDENTITY_ID: IDENTITY_ID,   // 需要归档的人员身份证
                            FACE_ID: faceID,       // 抓拍人脸的人脸ID
                            PIC: imgUrl,           // 抓拍人脸URL
                            DEVICE_ID: deviceID,     // 抓拍人脸的设备ID
                            CAPTURE_TIME: captureTime,  // 抓拍人脸的抓拍时间
                            TYPE: 2,          // 判断状态 2、确认或选择推荐 3、误判
                            ALGO_TYPE: algoList[0].ALGO_TYPE
                        });
                    }
                }, null, null, true);
            }
        });

        $('#newBtn').on('click', function () {
            var curHtml = '<div class="form-group tc">' +
                '<label class="control-label">姓&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;名：</label>' +
                '<input class="form-control" type="text" name="NAME" placeholder="请输入姓名" value="' + (basicInfo ? basicInfo.name : NAME) + '" ui-text="姓名">' +
                '</div>' +
                '<div class="form-group tc">' +
                '<label class="control-label">证件类型：</label>' +
                '<select class="form-control" name="IDENTITY_TYPE" placeholder="请输入证件类型" value="2" ui-text="证件类型">' +
                '<option value="">请选择</option>' +
                '<option value="1">身份证</option>' +
                '<option value="2" selected>护照</option>' +
                '<option value="3">驾驶证</option>' +
                '<option value="4">港澳通行证</option>' +
                '</select>' +
                '</div>' +
                '<div class="form-group tc">' +
                '<label class="control-label">证件号码：</label>' +
                '<input class="form-control" type="text" name="IDENTITY_ID" placeholder="请输入证件号码" value="' + (IDENTITY_ID) + '" ui-text="证件号码">' +
                '</div>';

            var opts = {
                title: '新建档案',
                renderHtml: curHtml,
                okcallback: function (formData) {
                    if (!formData.NAME) {
                        UI.util.alert('请输入姓名！', 'warn');
                        return;
                    }
                    if (!formData.IDENTITY_TYPE) {
                        UI.util.alert('请选择证件类型！', 'warn');
                        return;
                    }
                    if (!formData.IDENTITY_ID) {
                        UI.util.alert('请输入证件号码！', 'warn');
                        return;
                    }

                    var params = {
                        IDENTITY_TYPE: formData.IDENTITY_TYPE,
                        IDENTITY_ID: formData.IDENTITY_ID,
                        RP_ID: 'temp_'
                    };
                    UI.control.remoteCall('facestore/archives/idCardQuery', params, function (resp) {
                        var data = resp.data && resp.data[0];
                        if (data) {
                            updateFace({
                                RP_ID: data.RPID, // 需要归档的人员ID
                                NAME: formData.NAME || data.NAME, // 需要归档的人员姓名
                                IDENTITY_TYPE: data.IDENTITY_TYPE, // 需要归档的人员身份证类型
                                IDENTITY_ID: data.IDENTITY_ID, // 需要归档的人员身份证
                                FACE_ID: faceID, // 抓拍人脸的人脸ID
                                PIC: img, // 抓拍人脸URL
                                DEVICE_ID: deviceID, // 抓拍人脸的设备ID
                                CAPTURE_TIME: captureTime, // 抓拍人脸的抓拍时间
                                TYPE: 2, // 判断状态 2、确认或选择推荐 3、误判
                                ALGO_TYPE: algoList[0].ALGO_TYPE
                            });
                        } else {
                            updateFace({
                                RP_ID: params.RP_ID, // 需要归档的人员ID
                                NAME: formData.NAME, // 需要归档的人员姓名
                                IDENTITY_TYPE: formData.IDENTITY_TYPE, // 需要归档的人员身份证类型
                                IDENTITY_ID: formData.IDENTITY_ID, // 需要归档的人员身份证
                                FACE_ID: faceID, // 抓拍人脸的人脸ID
                                PIC: img, // 抓拍人脸URL
                                DEVICE_ID: deviceID, // 抓拍人脸的设备ID
                                CAPTURE_TIME: captureTime, // 抓拍人脸的抓拍时间
                                TYPE: 2, // 判断状态 2、确认或选择推荐 3、误判
                                ALGO_TYPE: algoList[0].ALGO_TYPE
                            });
                        }
                    }, null, null, true);

                    return true;
                },
                cancelcallback: function () {

                }
            }
            UI.util.prompt(opts);
            top.$(".confirm-wrapper").css({
                "min-width": "500px",
                "margin-left": "-250px"
            });
        });

        $('#confirmBtn').on('click', function () {
            if ($(this).attr('disabled')) {
                return;
            }
            if (TYPE === '1') {
                confirmFace({
                    TYPE: '1',
                    THIS_RPID: THIS_RPID, // 当前档案RPID
                    NEW_RPID: NEW_RPID //  合并档案RPID
                });
            } else if (TYPE === '2') {
                confirmFace({
                    TYPE: '2',
                    THIS_RPID: THIS_RPID, //    当前档案RPID
                    IDENTITY_ID: IDENTITY_ID, //  第三方推荐 证件号码
                    NAME: NAME, //         第三方推荐 姓名
                    OBJ_PIC: isBase64(OBJ_PIC) ? '' : OBJ_PIC, //	     第三方推荐 封面照
                });
            }
        });
    }
}
function initPage() {
    initVanUnit(); // 初始化飞识算法库列表

    if (!hasLocalSearch) {  // 初始化算法筛选列表
        appendSFList();
    } else {
        $('#sfWrap').hide();
        $('.localSearchItem').children().eq(0).addClass('active').siblings().removeClass('active');
        if (pageType === '身份确认') {
            $('#confirmBtn').removeClass('hide');
        } else {
            $('#modifyBtn').removeClass('hide');
        }
    }
    // 有imgUrl, 页面一进来就进行检索
    if (imgUrl) {
        $("#backBtn").addClass("hide");
        $("#backBtn").parent().find("span").css("marginLeft", "30px")
        $(".page-con").css('minHeight', $(".pager-wrap").height() - $(".page-title").height() - $(".page-info-metro").height() - $(".top-box").height() - 30);
        var html = '<li class="mr30 img-item">' +
            '<div class="file-list-icon icon" >' +
            '<div class="file-icon">' +
            '<img class="rIMG mb0 show" src="' + imgUrl + '" >' +
            '<span class="colse hide">×</span>' +
            '</div>' +
            '</div>' +
            '</li>';
        imgArr.push(imgUrl);
        $("#picCenter").width(158 + 250);
        $(".img-list").width(288);
        $("#imgBox").prepend(html);
        $('#thresholdValidate').removeClass('hide');
        $(".back").removeClass("hide");
        var isIint = true; //标志是有图片，第一次初始化
        // 初始化模版
        var html = '';
        for (var i = 0; i < imgArr.length; i++) {
            html = '<li title="检索结果" class="disabled"><span class="load-icon"></span><img src=' + imgArr[i] + ' alt="">&nbsp;&nbsp;&nbsp;检索结果</li>';
            $("#resultTab").append(html); // tab标签
            $('#imgBox li').eq(i).attr('attrId', cacheIDs[i]);
        }
        imgDoSearch(isIint);  //检索
    }
    // 检索列表设置
    $(".page-con").css('minHeight', $(".pager-wrap").height() - $(".page-title").height() - $(".page-info-metro").height() - $(".top-box").height() - 30);
}

// 检索主体方法
//params(isInit): 页面一进来就要马上查询，则传isInit=true,否则不用传
function imgDoSearch(isInit) {
    var searchImgList = imgArr;
    if (imgArr.length < 1) {
        return;
    }
    if (isInit) {
        cacheIDs.push(UI.util.guid());
        $('#resultTab li').attr('attrid', cacheIDs[0]);
    }

    if (isFirstLoading) { //第一次检索
        UI.util.showLoadingPanel(null, 'currentPage'); //显示加载进度条
    }
    searchingFlag = true; //页面正在检索
    // 屏蔽本地检索
    // if (hasLocalSearch && !isBlack) {
    //     lacalSearch(JSON.parse(JSON.stringify(searchImgList)));//本地一人一档检索
    // }else {
    //     initTmpl(JSON.stringify(searchImgList));
    // }
    initTmpl(JSON.stringify(searchImgList));
    if (($(".resultTab li").length) * 130 > $(".page-info-metro").width() - 50) {
        $(".resultTab li").width(($(".page-info-metro").width() - 50) / ($(".resultTab li").length) - 5 - 30)
    }
}

// 本地一人一档检索
function lacalSearch(imgList) {
    var _imgList = [];
    if (imgList.length < 1) {
        return;
    } else {
        _imgList  = imgList.splice(0, 1); //取一项查询
    }
    var queryParams = {
        ALGO_LIST: JSON.stringify(ALGO_LIST),
        KEYWORDS: '',
        PERSON_TAG: '',
        SEX: '',
        pageNo: 1,
        pageSize: 30,
        IMG: _imgList[0],
        THRESHOLD: '',
        ARCHIVE_STATUS: 1,
        SORT_FIELD: 'SCORE'
    };
    UI.util.showLoadingPanel(null, 'currentPage');
    UI.control.remoteCall("facestore/archivesPerson/getData", queryParams, function (resp) {
        if (resp.data && resp.data.LIST) {
            for (i = 0; i++; i < resp.data.LIST.length) {
                var data = resp.data && resp.data.LIST && resp.data.LIST[i];
                var list = data && data.ALGORITHM_LIST;
                if (list && list.length) {
                    for (var i = list.length - 1; i >= 0; i--) {
                        if (list[i].IDENTITY_ID == identityId) {
                            list.splice(i, 1); // 删除证件号与本人相同的项
                        }
                    }
                }
            }
            var $_html = $(tmpl('personListTml_local', resp.data.LIST));
            var attrId = $("#resultTab").find("img[src='"+ _imgList[0] +"']").closest('li').attr('attrid');
            $_html.attr('attrid', attrId);
            $('#tmplContent').prepend($_html);
        }
        // localresultFlag = true;
        // if (outresultFlag) {
        //     searchingFlag = false;
        //     UI.util.hideLoadingPanel('currentPage');
        // }
        // $('#resultTab li').find('.load-icon').addClass('hide');
        // $('#resultTab li').removeClass('disabled');
        if(imgList.length == 0) {
            initTmpl(JSON.stringify(imgArr)); //第三方搜索
        }
    }, function (XMLHttpRequest, textStatus) {
        if (textStatus === 'timeout') {
            UI.util.alert('已有档案检索超时', 'warn');
        }
        UI.util.hideLoadingPanel('currentPage');
        $('#resultTab li').find('.load-icon').addClass('hide');
        $('#resultTab li').removeClass('disabled');
    }, {
        timeout: 20000
    }, true);

    if (imgList.length > 0) { //递归查询
        lacalSearch(imgList);
    }
}

// 模板渲染+外部搜索
function initTmpl(searchImgUrl) {
    var THRESHOLD = $("#threshold").val();//;阈值
    var TOP_NUMBER = $("#retrieveNum").val();//检索数量
    if (!THRESHOLD || !TOP_NUMBER) return;
    var params = {
        THRESHOLD: THRESHOLD,
        TOP_NUMBER: TOP_NUMBER,
        IMG_URL_LIST: searchImgUrl,
        ALGORITHM_ID: $('#sfVal').val(),
        REPOSITORY_ID: $("#registerDb").val()
    };
    UI.control.remoteCall('face/technicalTactics/IntegrationFaceSearch', params, function (resp) {
        var data = resp.DATA;
        if(data && data.length) {
            $.each(data, function(i, obj) {
                // 推荐列表渲染
                if (obj.RECOMMEND_RESULT) {
                    $('#recommend').append(tmpl("recommendTmpl", obj.RECOMMEND_RESULT));
                    $('#recommend .nodata').addClass('hide');
                }
                // 第三方搜索
                if (obj.LIST) {
                    var sfListArrOuter = [];
                    for (var key in obj.LIST) {
                        sfListArrOuter.push(key);
                    }
                    var arrOuter = [];
                    for (var i = 0; i < sfListArrOuter.length; i++) {
                        arrOuter.push({ name: sfListArrOuter[i], data: obj.LIST[sfListArrOuter[i]], length: obj.LIST[sfListArrOuter[i]].length });
                    }
                    $('#tmplContent').append(tmpl("personListTml_3rd", arrOuter));
                }
            });
        }
        if (resp.SEARCHTIMES) {
            $('.searchNum').text(resp.SEARCHTIMES).parents('.action-btn-group').removeClass('hide');
        }
        // 给图片列表和下面的图片，增加一个关联ID
        addID();
        var $personList = $('body').find('.personList');
        $personList.each(function(i, ele) {
            var attrId = $(ele).attr('attrId');
            // 隐藏resultTab
            $('#resultTab li[attrId="' + attrId + '"]').find('.load-icon').addClass('hide');
            $('#resultTab li[attrId="' + attrId + '"]').removeClass('disabled');
        });

        // 默认展示第一个tag
        if (isFirstLoading) { //第一次检索
            // 根据ID展示图片检索结果
            showResult(cacheIDs[0]);
            isFirstLoading = false;
        }
        searchingFlag = false;
        $('#resultTab li').find('.load-icon').addClass('hide');
        UI.util.hideLoadingPanel('currentPage'); //隐藏加载进度条
    }, function() {
        searchingFlag = false;
        $('#resultTab li').find('.load-icon').addClass('hide');
        UI.util.hideLoadingPanel('currentPage'); //隐藏加载进度条
    }, null, true);
}

// 外籍人模板渲染
function wjFaceSearch(imgUrl) {
    var param = {
        IMG_URL: imgUrl,
        TOP_NUMBER: $("#retrieveNum").val(),
        THRESHOLD: $("#threshold").val()
    };
    if (hasLocalSearch) {
        lacalSearch();//如果是本地索索
    }
    UI.control.remoteCall('face/technicalTactics/wjFaceSearch', param, function (resp) {
        $('#tmplContent .nodata').addClass('hide');
        var data = resp.DATA;
        // 当天剩余检索次数
        if (resp.SEARCHTIMES) {
            $('.searchNum').text(resp.SEARCHTIMES).parents('.action-btn-group').removeClass('hide');
        }
        outresultFlag = true;
        // var data = [{
        //     SIMILARITY: 88,
        //     IMG_URL: 'http://172.25.20.28:8088/g28/M00/00000009/00000016/rBkUHFwmLciAUywVAAB4oUWmhqA954.jpg',
        //     ALARM_LEVEL: 1,
        //     PERSON_ID: 888888888,
        //     NAME: '李翊君',
        //     REPOSITORY_NAME: '酷酷酷',
        //     IDENTITY_TYPE: '2',
        //     GJ: '???'
        // }];
        if (resp.CODE == 1) {
            UI.util.alert(resp.MESSAGE, "warn");
            if (localresultFlag) {
                UI.util.hideLoadingPanel('currentPage');
            }
            return;
        }
        if (data && data.length) {
            for (var i = data.length - 1; i >= 0; i--) {
                if (data[i].PERSON_ID == identityId) {
                    data.splice(i, 1); // 删除证件号与本人相同的项
                }
            }
            //            recResult = data[0];
            outrecResult = data[0];

            $('#tmplContent').append(tmpl('personListTml_wjr', data));
        }
        renderRecommend();
        $('#resultTab li').find('.load-icon').addClass('hide');
        $('#resultTab li').removeClass('disabled');
        if (localresultFlag) {
            UI.util.hideLoadingPanel('currentPage');
        }
    }, function (XMLHttpRequest, textStatus) {
        if (textStatus === 'timeout') {
            UI.util.alert('外部检索超时', 'warn');
        }
        $('#resultTab').children().remove();
        UI.util.hideLoadingPanel('currentPage');
    }, {
        timeout: 20000
    }, true);
}

// 渲染外籍人推荐模板
function renderRecommend() {
    if (localrecResult) {
        recResult = localrecResult;
    }
    if (outrecResult) {
        recResult = outrecResul
    }
    if (outrecResult && localrecResult) {
        recResult = (outrecResult.SIMILARITY > localrecResult.SCORE) ? outrecResult : localrecResult;
    }
    if (recResult) {
        $('#recommend').html(tmpl('recommendTmpl_wjr', recResult));
    } else {
        $('#recommend').html('<div class="nodata"></div>');
    }
}


/**
 * @author: dorsey
 * @description: 多选框组件，由 initDbTree 改版
 * @version: 2019-07-11
 *
 * */

function initTmplRender (options) {

    $("#" + options.ele).html(tmpl(options.tmpl, options.data));
    //点击标签
    $("#" + options.ele).on("click","label",function(event){
        $(this).toggleClass('active');
        event.stopPropagation();
    });
    //点击全选或全不选标签
    $("#" + options.ele).on("click", ".selectAll", function () {

        if($(this).hasClass('active')){
            $("#" + options.ele).find('label').addClass('active');
            $(this).removeClass('active').html('取消');
        }
        else{
            $("#" + options.ele).find('label').removeClass('active');
            $(this).addClass('active').html('全选');;
        }
    })
    $("body").on("click",".db-list",function(){
        return false;
    });
    $(".attrSureBtn").click(function(){
        var area ="";
        vanList = [];
        $('#' + options.ele + ' label').each(function(i){
            if($(this).hasClass("active")){

                area+=$(this).text()+",";
                vanList.push($(this).attr('NODE_ID'));
            }
        });
        area = area.slice(0,-1);
        area = (area==""?"请选择":area);
        $('.selectedDb').html(area);
        $('#registerDb').val(vanList.join(','));
        if(typeof options.callback === 'function') {
            options.callback(vanList);
        }
        $('.dropdown-menu').click();
    });
    $(".attrCancelBtn").click(function(){
        var $treeWrap = $(this).parents('.tree-wrap');
        $treeWrap.find(".selectedDb").html("请选择");
        $treeWrap.find("input").val("");
        $('.dropdown-menu').click();
    });
    return false;
}

function initVanUnit () {
    initFeishiAlgoLib();
    var options = {
        ele: 'faceDb',
        data: CONSTANTS.RLK,
        tmpl: 'faceDbTmpl',
        callback: ''
    }
    initTmplRender(options);
    $(".faceLibrary").removeClass("hide");
}

// 根据人物标签属性请求接口获取任务人物基本信息
function getBasicInfo($dom) {
    var basicInfo = null;
    if ($dom.find('.privateDetail').length) {
        var $privateDetail = $dom.find('.privateDetail');
        var params = {
            ZJHM: $privateDetail.data('zjhm'),
            GJDM: $privateDetail.data('gjdm'),
            ZJZL: $privateDetail.data('zjzl')
        };
        UI.control.remoteCall('facestore/getBasicInfo', params, function (resp) {
            if (resp.CODE == 0) {
                var data = resp.MESSAGE;
                if (data && data.length) {
                    basicInfo = data[0];
                }
            }
        });
    }
    return basicInfo;
}

/**
 * 判断检索条件是否发生变化
 * @returns {isReload} true: 变化; false: 不变
 *
 */
function compareFilter() {
    var isReload = false;  //默认不全部检索
    var filterOptions = {
        THRESHOLD: $("#threshold").val(),
        TOP_NUMBER: $("#retrieveNum").val(),
        ALGORITHM_ID: $('#sfVal').val(),
        REPOSITORY_ID: $("#registerDb").val()
    }

    for (var i in filterOptions) {
        if (filterOptions[i] !== queryParams[i]) {
            isReload = true;
        }
    }
    return isReload;
}

// 删除数组指定值
function removeByValue(arr, val) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] == val) {
            arr.splice(i, 1);
            return i;
            break;
        }
    }
}

function ajaxMultiImageUpload() {
    if (!$("#uploadFile").val() || $("#uploadFile").val() == '') {
        UI.util.alert("请选择要上传的文件！", 'warn');
        return;
    }
    $.ajaxFileUpload({
        url: "/oss/v1/casedb/case",
        type: 'post',
        secureuri: false,
        fileElementId: 'uploadFile',
        dataType: 'text',
        data: { 'FILE_TYPE': 'picture', 'IS_THUMB': '1' },
        success: function (data, status) {
            var resp = eval("(" + data + ")");
            if (resp.ids) {
                // 存储图片IDS
                var html = '';
                $.each(resp.ids, function (i, id) {
                    cacheIDs.push(UI.util.guid());
                    html += '<li class="mr30 img-item" attrId="' + id + '">' +
                        '<div class="file-list-icon icon" >' +
                        '<div class="file-icon">' +
                        '<img class="rIMG mb0 show" src="' + ('http://' + resp.fastDfsParam.server + ':' + resp.fastDfsParam.port + '/' + id) + '" >' +
                        '<span class="colse">×</span>' +
                        '</div>' +
                        '</div>' +
                        '</li>';
                    if (searchingFlag) {
                        unSearchImg.push(('http://' + resp.fastDfsParam.server + ':' + resp.fastDfsParam.port + '/' + id));
                    } else {
                        imgArr.push(('http://' + resp.fastDfsParam.server + ':' + resp.fastDfsParam.port + '/' + id));
                    }
                });
                $("#fileUpload").before(html);
                var width = $(".img-list li").length;
                $('.bottom-pic-bar').removeClass('hide');//阈值框出现

                if (imgUrl) {
                    if (width > 1) {
                        setWidth();
                    } else {
                        $(".img-wraper ").width(width + 1 * 158 + 250);
                    }
                    $(".photo-scroll").width(width + 1 * 158 + 130);
                }
                if (width > 2) {
                    setWidth();
                } else {
                    $(".img-wraper ").width(width * 158 + 250);
                }
                //                $(".photo-scroll").width(width * 158 + 130);
                $(".photo-scroll").width(width * 156);
                if (width * 158 + 158 + 40 > $(".page-title").width() - 50) {
                    $("body .slider-btn-prev").removeClass("hide");
                    $("body .slider-btn-next").removeClass("hide");
                }
            }
            // if (isBlack) {
            //     $("#uploadFile").parent().empty();
            // }

        },
        error: function (data, status, e) {
            UI.util.debug(data);
            UI.util.debug(status);
        }
    });
    return false;
}

//更新人脸数据
function updateFace(params) {
    UI.util.showLoadingPanel(null, 'currentPage');
    UI.control.remoteCall('facestore/archives/updateFace', params, function (resp) {
        if (resp.CODE == '1') {
            UI.util.alert(resp.MESSAGE);
            parent.UI.util.returnCommonWindow(false);
            parent.UI.util.closeCommonWindow();
        } else {
            UI.util.alert(resp.MESSAGE, 'warn');
        }
        UI.util.hideLoadingPanel('currentPage');
    }, function () {
        UI.util.hideLoadingPanel('currentPage');
    }, null, true);
}

// 确定人脸
function confirmFace(params) {
    if (!params.THIS_RPID) {
        params.THIS_PERSON_ID = THIS_PERSON_ID;
    }
    $.ajax({
        url: 'http://' + window.location.host + '/efacestore/rest/v6/facestore/archives/confirmTheIdentity',
        type: 'post',
        data: params,
        beforeSend: function () {
            UI.util.showLoadingPanel(null, 'currentPage');
        },
        success: function (resp) {
            try {
                resp = JSON.parse(resp);
                if (resp.CODE == '1') {
                    UI.util.alert(resp.MESSAGE);
                    parent.UI.util.returnCommonWindow(false);
                    parent.UI.util.closeCommonWindow();
                } else {
                    UI.util.alert(resp.MESSAGE, 'warn');
                }
            } catch (error) {
                console.debug(error);
            }
        },
        error: function (resp) {
            try {
                resp = JSON.parse(resp);
                UI.util.alert(resp.MESSAGE, 'warn');
            } catch (error) {
                console.debug(error);
            }
        },
        complete: function () {
            UI.util.hideLoadingPanel('currentPage');
        }
    });
}

// 给图片列表和下面的图片，增加一个关联ID
function addID() {
    for (var i = 0; i < cacheIDs.length; i++) {
        $('#imgBox li').eq(i).attr('attrId', cacheIDs[i]);
        $('#resultTab li').eq(i).attr('attrId', cacheIDs[i]);
        $('body').find('.personList').eq(i).attr('attrId', cacheIDs[i]);
        $('body').find('.recommendList').eq(i).attr('attrId', cacheIDs[i]);
    }
}

// 根据ID展示图片检索结果
function showResult(id) {
    $('#resultTab li[attrId="' + id + '"]').addClass('active').siblings().removeClass('active');
    if ($('body').find('.personList[attrId="' + id + '"]').length > 0) {
        $('#tmplContent .nodata').addClass('hide');
        $('body').find('.personList').addClass('hide');
        $('body').find('.personList[attrId="' + id + '"]').removeClass('hide');
        $('body').find('.recommendList').addClass('hide');
        $('body').find('.recommendList[attrId="' + id + '"]').removeClass('hide');
    } else {
        $('#tmplContent .nodata').removeClass('hide');
        $('body .personList').addClass('hide');
    };
}

//根据ID删除图片检索结果
function deleteResult(id) {
    $('body').find('.personList[attrId="' + id + '"]').remove();
    $('body').find('.recommendList[attrId="' + id + '"]').remove();
    $('#resultTab li[attrId="' + id + '"]').remove();
    cacheIDs.splice(cacheIDs.indexOf(id), 1);
    var flag = false; // 标志是否有高亮标签.true: 无 ;  false: 有
    if (cacheIDs.length > 0) {
        for (var i = 0; i < cacheIDs.length; i++) {
            if ($('#resultTab li').eq(i).hasClass('active')) {
                flag = true;
            }
        }
    }
    if (!flag) {
        showResult(cacheIDs[0]);
    }
}

// 渲染 "算法"的筛选列表
function appendSFList() {
    initFeishiAlgoList();
    var data = CONSTANTS.SFLIST;
    data.unshift({ id: '', name: '全部' });
    for (var i = 0; i < data.length; i++) {
        if (i == 0) {
            html += '<li class="tags-list-item active" val=' + data[i].id + '>' + data[i].name + "</li>";
        } else {
            html += '<li class="tags-list-item" val=' + data[i].id + '>' + data[i].name + "</li>";
        }
    }
    $('#sfList').append(html);
    $("#sfWrap").removeClass("hide");
}

function setWidth() {
    $(".top-box").css("display", "block");
    $(".img-wraper").css("width", "100%").css("display", "block");
    $(".filter-view").css({ "top": "-12px" }, { "display": "block" });
}
//将页面恢复未进行检索的状态
function clearData() {
    isFirstLoading = true;
    cacheIDs = [];
    $('#recommend').html('<div class="nodata"></div>');
    $('#tmplContent').html('<div class="nodata"></div>');
}

/**
 * 判断某图片是否是base64编码
 * @param src 图片src
 * @returns Boolean true 是base64编码 ； false 不是
 */
function isBase64(src) {
    var validSrcRegex = /^\s*data:([a-z]+\/[a-z0-9-+.]+(;[a-z-]+=[a-z0-9-]+)?)?(;base64)?,([a-z0-9!$&',()*+;=\-._~:@\/?%\s]*?)\s*$/i;
    return validSrcRegex.test(src);
}

//获取当前算法或者黑人算法
function getFaceAndForeignAlgoType(){
	var algoType;
    var params = {
            'MENUID':'EFACE_faceVerification'
        };
    var serviceUrl = 'face/common/getFaceAlgoType';

	UI.control.remoteCall(serviceUrl, params, function (resp) {
		algoType = resp && resp.data && resp.data.length > 0 ? resp.data[0].ALGORITHM_ID : '10003';
	});
	return algoType;
}