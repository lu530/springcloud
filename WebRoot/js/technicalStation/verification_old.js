var queryParams = {};
var imgUrl = UI.util.getUrlParam("imgUrl");
var imgArr = [];
var faceImgListArr=[];
var imgDate = [];
var width = '';
var data = [];
var flag=true;
var faceListNum=0;
var imgNum=0;

var addressOption = {//初始化人脸库
    'elem': ['domicile'],//地址HTML容器
    'addressId': ['registerDbList'],//初始化人脸库内容
    'tmpl': 'childNodeListTemplate',//初始化模板
};
$(function () {
    UI.control.init();
    initPage();
    initEvent();
    initDbTree(addressOption);
})
function initDbTree(options) {
    var $addressWrap = options.elem;
    var addressId = options.addressId;
    var addressTmpl = options.tmpl;
    var databaseArr = [];
    $.each($addressWrap, function (i, n) {
        var areaHtml = '<div class="tree-wrap dropdown">' +
            '<div class="modular-head dropdown-toggle" data-toggle="dropdown">' +
            '<span class="selectedDb">请选择 </span>' +
            '<input type="hidden" id="registerDb" value="">' +
            '<span class="icon-arrow-down8 tc" style="width:25px;"></span>' +
            '</div>' +
            '<div class="dropdown-menu" style="z-index: 999">' +
            '<div class="db-list">' +
            '<div class="tab-pane active">' +
            '<dl class="attr-list">' +
            '<dd class="attr-list-body" id="' + addressId[i] + '">' +
            '</dd>' +
            '</dl>' +
            '</div>' +
            '<div class="attr-bar"><a class="btn attrSureBtn btn-purple mr10">确定</a><a class="btn btn-white attrCancelBtn">取消</a></div>' +
            '</div>' +
            '</div>' +
            '</div>';
        $("#" + n).append(areaHtml);

        databaseArr = CONSTANTS.RLK
        $("#" + addressId[i]).html(tmpl(addressTmpl, databaseArr));

        //点击标签
        $(".tree-wrap").on("click", ".db-list label", function (event) {
            $(this).toggleClass('active')
            event.stopPropagation();
        });
        $("body").on("click", ".db-list", function () {
            return false;
        })
        $(".attrSureBtn").click(function () {
            var area = "";
            var dbIdList = [];
            $('#registerDbList label').each(function (i) {
                if ($(this).hasClass("active")) {
                    area += $(this).text() + ",";
                    dbIdList.push($(this).attr('node_id'));
                }
            });
            $("#registerDb").val(dbIdList);
            area = area.slice(0, -1);
            area = (area == "" ? "请选择" : area);
            $('.selectedDb').html(area);

            $('.dropdown-menu').click();
        });
        $(".attrCancelBtn").click(function () {
            var $treeWrap = $(this).parents('.tree-wrap');
            $treeWrap.find("label").removeClass("active");
            $treeWrap.find(".selectedDb").html("请选择");
            $treeWrap.find("input").val("");
            $('.dropdown-menu').click();
        });
    });
}
function initPage() {
    if (imgUrl) {
        flag=true;
        $("#backBtn").addClass("hide");
        $("#backBtn").parent().find("span").css("marginLeft", "30px");
        $(".page-con").css('minHeight', $(".pager-wrap").height() - $(".page-title").height() - $(".page-info-metro").height() - $(".top-box").height() - 30);
        fileUrl = imgUrl;
        uploaded = true;
        var html = '';
        html += '<li class="mr30 img-item">' +
            '<div class="file-list-icon icon" >' +
            '<div class="file-icon">' +
            '<img attrimg="zoom" class="rIMG mb0 show" src="' +  imgUrl + '" ><span class="colse hide">×</span>' +
            '</div></div></li>';
        imgArr.push(imgUrl);
        faceImgListArr=imgArr.slice(0);
        $(".img-wraper ").width(158+250);
        $(".img-list").width(288);
        $(".file-upload-btn").before(html);
        $('.bottom-pic-bar').removeClass('hide');
        $(".back").removeClass("hide");
        imgDoSearch();
    }
    $(".page-con").css('minHeight', $(".pager-wrap").height() - $(".page-title").height() - $(".page-info-metro").height() - $(".top-box").height() - 30);
    appendSFList();
}
function initEvent() {
    //如果是图片，选择文件之后马上上传，这样才能在页面上显示预览图
    $("body").on('change', '#uploadFile', function () {
        ajaxMultiImageUpload();
    });
    // 切换图片检索结果
    $("body .resultTab").on("click", "li", function () {
        var $this=$(this);
        $this.addClass("active");
        $this.siblings().removeClass("active");
        var index = $this.attr("num");
        var data =imgDate[index];
        initTmpl(data);
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
            // $(".photo-scroll").css("left",$(".face").width()-$(".photo-scroll").width())
        } else {
            $(".photo-scroll").css("left", left - 158 + "px")
        }

    })
    // 鼠标移入图片出现删除图片按钮
    $("body .scroll-wraper").on("mouseover", "li", function () {

        if ($(this).find("img").attr("src").slice(-12) == "noPhoto2.png") {
            return;
        }
        $(this).find(".colse").removeClass("hide");
    });
    // 鼠标移出图片隐藏删除图片按钮
    $("body .scroll-wraper").on("mouseout", "li", function () {

        $(this).find(".colse").addClass("hide");
    });
    // 点击删除当前图片
    $("body").on("click", ".colse", function () {
        var $this=$(this);
        var imgSrc = $this.siblings().attr("src");
        removeByValue(imgArr, imgSrc);
        removeByValue(faceImgListArr, imgSrc);
        $this.parents("li").remove();

        $(".resultTab li img").each(function (i, t) {
            if (imgSrc == $(t).attr("num")) {
                $(t).remove();
            }
        })
        imgArr=faceImgListArr.slice(0);
        if ($(".img-list li").length < 3) {
            $(".top-box").css("display", "table");
            $(".img-wraper ").width($(".img-list li").length * 158 + 250).css("display", "table-cell");
            $(".filter-view").css({"top": "0"},{"display": "table-cell"});
        }
        $(".photo-scroll").width($(".img-list li").length * 158 + 130);
        if ($(".img-list li").length * 158 + 158 + 40 < $(".page-title").width() - 100) {
            $("body .slider-btn-prev").addClass("hide");
            $("body .slider-btn-next").addClass("hide");
        }

    })
    //轨迹分析
    $("body").on("click", ".trajectory-search", function () {
        openWindowPopup('track', $(this).attr("url"));
    });
    //身份核查
    $("body").on("click", ".verification-search", function () {
        openWindowPopup('identity', $(this).attr("url"));
    });
    //返回菜单
    $('body').on('click', '#backBtn', function () {
        parent.showMenu();
    });

    //点击进入详细页面
    $('.library-info').on('click', '.similar-name a,.btn-more', function (event) {
        var personId = $(this).closest('.list-node-wrap').attr('personid');
        var imgurl=$(this).parents(".library-info").siblings(".page-info-metro").find(".active img").attr("src");
        var imgurl2=$(this).attr('info')
        var rlk = $(this).attr('info2')
        var name = $(this).html();
        var similar = $(this).attr('info3')

        UI.util.showCommonWindow('/efacecloud/page/technicalStation/particulars.html?personId=' + personId + '&imgurl=' + imgurl + '&imgurl2=' + imgurl2 + '&rlk=' + rlk + '&name=' + name + '&similar=' + similar, "详情",
            434, 235, function (obj) {
                UI.util.hideLoadingPanel();
            });
    });


    // 点击确认检索
    $('#confirmSearch').click(function () {
        if ($(".img-list li").length < 1) {
            UI.util.alert("请上传图片之后再进行检索！", 'warn');
            return;
        }
        imgDate=[];
        faceListNum=0;
        imgNum=0;
        $(".resultTab").html('');
        imgDoSearch();
    });
    // 检索结果展开
    $("body").on("click", ".setting-down", function () {
        var $this=$(this);
        $this.parent().toggleClass("active");

        if ($this.hasClass("icon-uniE91A")) {
            $this.removeClass("icon-uniE91A");
            $this.addClass("icon-arrow-down10");
        } else {
            $this.addClass("icon-uniE91A");
            $this.removeClass("icon-arrow-down10");
        }
    })

    $("#sfList li").on("click", function () {
        var $this=$(this);
        var checkVal = $this.attr('val');
        var sfVal='';
        if ($this.hasClass("active")) {
            $this.removeClass("active");
            sfVal = UI.control.getControlById("sfList").getValue();
            sfVal = sfVal.toString()
            $("#sfVal").val(sfVal);
            return;
        }
        if (checkVal == "10") {
            $("#sfVal").val('');
            $this.addClass('active').siblings().removeClass('active');
        } else {
            $this.addClass('active').siblings().eq(0).removeClass('active');
        }
        sfVal = UI.control.getControlById("sfList").getValue();
        sfVal = sfVal.toString()
        $("#sfVal").val(sfVal);
    })
}
// 删除数组指定值
function removeByValue(arr, val) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] == val) {
            arr.splice(i, 1);
            break;
        }
    }
}
function ajaxMultiImageUpload() {

    if (!$("#uploadFile").val() || $("#uploadFile").val() == '') {
        UI.util.alert("请选择要上传的文件！",'warn');
        return;
    }
    $.ajaxFileUpload({
        url: "/oss/v1/casedb/case",
        type: 'post',
        secureuri: false,
        fileElementId: 'uploadFile',
        dataType: 'text',
        data: {'FILE_TYPE': 'picture'},
        success: function (data, status) {
            var resp = eval("(" + data + ")");
            if (resp.ids) {
                var html = '';
                $.each(resp.ids, function (i, id) {
                    html += '<li class="mr30 img-item">' +
                        '<div class="file-list-icon icon" >' +
                        '<div class="file-icon">' +
                        '<img attrimg="zoom" class="rIMG mb0 show" src="' + ('http://'+resp.fastDfsParam.server+':'+resp.fastDfsParam.port+'/' + id) + '" ><span class="colse hide">×</span>' +
                        '</div></div></li>';
                    imgArr.push(('http://'+resp.fastDfsParam.server+':'+resp.fastDfsParam.port+'/' + id));
                    faceImgListArr.push(('http://'+resp.fastDfsParam.server+':'+resp.fastDfsParam.port+'/' + id));
                });
                $(".file-upload-btn").before(html);
                var width = $(".img-list li").length;
                $('.bottom-pic-bar').removeClass('hide');//阈值框出现
                if(imgUrl) {
                    if (width > 1) {
                        setWidth();
                    } else {
                        $(".img-wraper ").width(width+1 * 158 + 250);
                    }
                    $(".photo-scroll").width(width+1 * 158 + 130);
                }
                if (width > 2) {
                    setWidth();
                } else {
                    $(".img-wraper ").width(width * 158 + 250);
                }
                $(".photo-scroll").width(width * 158 + 130);
                if (width * 158 + 158 + 40 > $(".page-title").width() - 100) {
                    $("body .slider-btn-prev").removeClass("hide");
                    $("body .slider-btn-next").removeClass("hide");
                }
            }
        },
        error: function (data, status, e) {
            UI.util.debug(data);
            UI.util.debug(status);
        }
    });
    return false;
}
function imgDoSearch() {
    if (UI.util.validateForm($('#thresholdValidate'), true)) {
        if (imgArr.length < 1) {
            imgArr=faceImgListArr.slice(0);
            flag=true;
            return;
        }
        var imgList = [];
        for (var i = 0; i < imgArr.length; i++) {
            if (imgArr.length < 2) {
                imgList[i] = imgArr[i];
            }
            if (i < 2) {
                imgList[i] = imgArr[i];
            }
        }
        imgList = JSON.stringify(imgList);
        queryParams.IMG_URL_LIST = imgList;
        queryParams.ALGORITHM_ID = $("#sfVal").val();
        queryParams.REPOSITORY_ID = $("#registerDb").val();
        queryParams.THRESHOLD = $("#threshold").val();
        queryParams.TOP_NUMBER = $("#retrieveNum").val();
        $.each(queryParams, function (i, val) {
            if (typeof val == "undefined") {
                queryParams[i] = "";
            }
        });
        UI.control.remoteCall('face/technicalTactics/batchFaceSearch',queryParams,function(resp){

            if (resp.CODE == 0) {
                var resultTab=$(".resultTab");
                var html=''
                for(var i=0;i<imgArr.length;i++) {
                    if(i<2) {
                        if(faceListNum==0) {
                            html += '<li class="active" title="检索结果" num=' + (faceListNum) + '><img src=' + imgArr[i] + ' alt="">&nbsp;&nbsp;&nbsp;检索结果</li>'
                        } else {
                            html += '<li class="" title="检索结果" num=' + (faceListNum) + '><img src=' + imgArr[i] + ' alt="">&nbsp;&nbsp;&nbsp;检索结果</li>'
                        }
                        faceListNum++;
                    }
                }
                resultTab.append(html);
                if (($(".resultTab li").length) * 130 > $(".page-info-metro").width()-50) {
                    $(".resultTab li").width(($(".page-info-metro").width()-50) / ($(".resultTab li").length) - 5-30)
                }
                for(var i=0;i<resp.DATA.length;i++) {
                    resp.DATA[i].imgNUM=imgNum++;
                    imgDate = imgDate.concat(resp.DATA[i]);
                }
                imgArr.splice(0, 2);
                if(flag) {
                    initTmpl(imgDate[0]);
                }
                flag=false;
                imgDoSearch();
            } else {
                UI.util.alert(resp.MESSAGE,'warn');
            }
        },'','',true);
    }
}
function appendSFList() {
    var sfList = $("#sfList");
    var html = '';
    for(var i=0;i<CONSTANTS.SFLIST.length;i++) {
        if(i==0) {
            html += '<li class="tags-list-item active" val=' + CONSTANTS.SFLIST[i].ID + '>' + CONSTANTS.SFLIST[i].NAME + "</li>";
        } else {
            html += '<li class="tags-list-item" val=' + CONSTANTS.SFLIST[i].ID + '>' + CONSTANTS.SFLIST[i].NAME + "</li>";
        }

    }
    sfList.append(html);
}
function setWidth() {
    $(".top-box").css("display", "block");
    $(".img-wraper").css("width", "100%").css("display", "block");
    $(".filter-view").css({"top": "-12px"},{"display": "block"});
}
function initTmpl(data) {
    if(!data) {
        $('.left-page .list-node-wrap').html('<div class="nodata"></div>');
        $('#tmplContent').html('<div class="nodata"></div>');
        return;
    }
    if (data.RECOMMEND_RESULT == '') {
        $('.left-page .list-node-wrap').html('<div class="nodata"></div>');
    } else {
        $('.left-page .list-node-wrap').html(tmpl("personListTemplate2", data.RECOMMEND_RESULT));
    }
    if (data.LIST == '') {
        $('#tmplContent').html('<div class="nodata"></div>');
    } else {
        var sfListArr = [];
        for (var key in data.LIST) {
            sfListArr.push(key);
        }
        var arr = [];
        for (var i = 0; i < sfListArr.length; i++) {
            arr.push({name: sfListArr[i], data: data.LIST[sfListArr[i]], length: data.LIST[sfListArr[i]].length});
        }
        $('#tmplContent').html(tmpl("personListTemplate", arr));
    }
}