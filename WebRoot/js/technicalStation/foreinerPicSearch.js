var pageType = UI.util.getUrlParam('pageType') || '';
var imgUrl = UI.util.getUrlParam("imgUrl");

var queryParams = {};

var hasLocalSearch = false;
UI.control.remoteCall('platform/webapp/config/get', {"applicationName":"efacestore"}, function(resp) {
    var jsonObj = resp.attrList;
    for(var i=0;i<jsonObj.length;i++){
        if(jsonObj[i].key=='IS_LOCAL_SEARCH_OPEN' && jsonObj[i].value == "1"){ //
            hasLocalSearch = true;	     
        }
    }
});
var localrecResult = null; // 本地档案推荐结果
var outrecResult = null; // 外籍人推荐结果
var recResult = null; // 最终推荐结果

var outresultFlag = false,localresultFlag = false; //两个请求成功的标识

var identityId = UI.util.getUrlParam('identityId') || '';
var algoList = UI.util.getUrlParam('algoList') || '';
var ALGO_LIST = [];
if(algoList) {
    algoList = algoList.replace(/-/g, '"');
    try {
        algoList = JSON.parse(algoList);
        $.each(algoList, function(i, obj) {
            ALGO_LIST.push({
                ALGO_TYPE: obj.ALGO_TYPE,
                THRESHOLD: '60'
            });
        });
    } catch (error) {
        UI.util.debug(error);
    }
}

var imgArr = []; //存储检索图片列表
var searchingFlag = false;
var unSearchImg = []; //上传了，但未进行检索的图片数组

var isFirstLoading = true;  //是否是第一次检索
var cacheIDs = []; //存储当前检索的列表IDS

var SFLIST = [
	{ID:'',NAME:'全部'},
	{ID:'112',NAME:'云从'},
    {ID:'110',NAME:'依图'},
    {ID:'111',NAME:'商汤'},
    {ID:'113',NAME:'Face++'},
    {ID:'114',NAME:'云天励飞'},
    {ID:'115',NAME:'像素'}
]
$(function () {
    UI.control.init();
    initPage();
    initEvent();
});

function initEvent() {	
    //如果是图片，选择文件之后马上上传，这样才能在页面上显示预览图
    $("body").on('change', '#uploadFile', function () {
        ajaxMultiImageUpload();
    });
    
    // 切换图片检索结果 
    $("body .resultTab").on("click", "li", function () {
    	if($(this).hasClass('disabled')){
    		return;
    	}
        var $this=$(this);
        var targetId = $this.attr('attrId');
        showResult(targetId);
    });
    // 向左滚动
    $("body").on("click", ".leftBtn", function () {
        var left = Number($('.photo-scroll').position().left);
        if (left >= 0) {
            $(".photo-scroll").css("left", 0)
        } else {
            $(".photo-scroll").css("left", left + 158 + "px")
        }
    });
    // 向右滚动
    $("body").on("click", ".rightBtn", function () {
        var left = Number($('.photo-scroll').position().left);
        if (left <= $(".face").width() - $(".photo-scroll").width()) {
            return;
        } else {
            $(".photo-scroll").css("left", left - 158 + "px")
        }
    });
    
    // 点击删除当前图片
    $("body").on("click", ".colse", function () {
        var $this=$(this);
        var targetLi = $this.parents("li");
        var curId = targetLi.attr('attrId');
        var curImg = targetLi.find('img').attr('src');
        
        if(unSearchImg.indexOf(curImg) !=-1){
           unSearchImg.splice(unSearchImg.indexOf(curImg),1);
        }
        if(imgArr.indexOf(curImg) !=-1){
        	imgArr.splice(imgArr.indexOf(curImg),1);
         }

        // 此处的tab删除，应该根据唯一的ID来删除
        if(searchingFlag){
        	UI.util.alert("该图片正在查询，请稍后操作", 'warn');
    		return;
        }else{
        	var imgSrc = $this.siblings().attr("src");
            targetLi.remove(); //删除图片
        	deleteResult(curId);
        }
       
        // 若图片已经全部删除，则将数据清空
        if(cacheIDs.length == 0){
        	clearData();
        }

        if ($("#imgBox li").length < 3) {
            $(".top-box").css("display", "table");
            $(".img-wraper ").width($(".img-list li").length * 158 + 250).css("display", "table-cell");
            $(".filter-view").css({"top": "0"},{"display": "table-cell"});
        }
        $("#imgBox").width($(".img-list li").length * 158 + 20);
        if ($("#imgBox li").length * 158 + 158 + 40 < $(".page-title").width() - 50) {
            $("body #silderPrev").addClass("hide");
            $("body #silderNext").addClass("hide");
        }

    });
    
    //返回菜单
    $('body').on('click', '#backBtn', function () {
        parent.showMenu();
    });

    // 点击确认检索
    $('#confirmSearch').click(function () {
    	// 监听检索条件是否改变  isReload
    	var isReload = compareFilter();
    	
        if ($("#imgBox li").length < 2) {
            UI.util.alert("请上传图片之后再进行检索！", 'warn');
            return;
        }

        if(searchingFlag){
            UI.util.alert("正在查询中，请稍后再进行检索",'warn');
        }else{
            // 限制最多检索十张
            var searchImgsLength = $('#imgBox li').length;
            if(searchImgsLength <= 11){
                if(unSearchImg.length>0){
                    for(var i=0;i<unSearchImg.length;i++){
                        imgArr.push(unSearchImg[i]);
                    }
                }
                unSearchImg.length = 0;

                for(var i=imgArr.length-1; i>=0; i--){  
                    $('#imgBox li').eq(i).attr('attrId',cacheIDs[i]);
                }
                if(isReload){  // 条件变了,全部重新检索
                    imgArr = [];
                    cacheIDs = []; 
                    $('#imgBox li').each(function(index, item){
                        if(index != $('#uploadDiv li').length -1){
                            cacheIDs.push($(this).attr('attrid'));
                            imgArr.push($(this).find('img').attr('src'));
                        }
                    })
                    $('#resultTab').html('');
                    // 删除以前的检索模板
                    $('.personList').each(function(index,item){
                        $(this).remove();
                    })
                    $('.recommendList').each(function(index,item){
                        $(this).remove();
                    })
                    isFirstLoading = true;  
                }
                $.each(imgArr, function(index,item){
                    var html = '<li title="检索结果" class="disabled"><span class="load-icon"></span><img src=' + item + ' alt="">&nbsp;&nbsp;&nbsp;检索结果</li>';
                    $("#resultTab").append(html); // tab标签
                });
                imgDoSearch();
            }else{
                UI.util.alert("最多只能检索十张照片！",'warn');
            }
        }
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
}

/**
 * 判断检索条件是否发生变化
 * @returns {isReload} true: 变化; false: 不变
 *
 */
function compareFilter(){
	var isReload = false;  //默认不全部检索
	var filterOptions = {
		ALGORITHM_ID: $('#sfVal').val()||getalgos(),  //算法
		PRIORITY : 1 //最高优先级
	}
	var algorithmIds = [];	
	for(var i in filterOptions){
		if(filterOptions[i] !== queryParams[i] ){
			isReload = true;
		}
	}
	return isReload;
}

function getalgos(){
	var ALGORITHM_IDS = [];
	for(var i = 0 ; i < SFLIST.length ; i++){
		if(SFLIST[i].name != "全部"  && SFLIST[i].NAME != "全部"){
			ALGORITHM_IDS.push(SFLIST[i].id||SFLIST[i].ID);
		}
	}
	return ALGORITHM_IDS.join(",");
}

function initPage() {
    // 初始化算法筛选列表
    if(!hasLocalSearch) {
        appendSFList();
    } else {
        $('#sfWrap').hide();
        $('.localSearchItem').children().eq(0).addClass('active').siblings().removeClass('active');
    }
    
    $(".page-con").css('minHeight', $(".pager-wrap").height() - $(".page-title").height() - $(".page-info-metro").height() - $(".top-box").height() - 30);
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
        data: {'FILE_TYPE': 'picture','IS_THUMB':'1'},
        success: function (data, status) {
            var resp = eval("(" + data + ")");
            if (resp.ids) {
            	// 存储图片IDS
                var html = '';
                $.each(resp.ids, function (i, id) {
                	cacheIDs.push(UI.util.guid());
                    html += '<li class="mr30 img-item" attrId="'+id+'">' +
                        		'<div class="file-list-icon icon" >' +
                        			'<div class="file-icon">' +
                        				'<img class="rIMG mb0 show" src="' + ('http://'+resp.fastDfsParam.server+':'+resp.fastDfsParam.port+'/' + id) + '" >'+
                        				'<span class="colse">×</span>' +
                        			'</div>'+
                        		'</div>'+
                        	'</li>';
                    if(searchingFlag){
                    	unSearchImg.push(('http://'+resp.fastDfsParam.server+':'+resp.fastDfsParam.port+'/' + id));
                    }else{
                    	imgArr.push(('http://'+resp.fastDfsParam.server+':'+resp.fastDfsParam.port+'/' + id));
                    }
                });
                $("#fileUpload").before(html);
                var width = $(".img-list li").length;
                $('.bottom-pic-bar').removeClass('hide');//阈值框出现
                

                if (width > 2) {
                    setWidth();
                } else {
                    $(".img-wraper").width(width * 158 + 250);
                }

                $(".photo-scroll").width(width * 156);
                if (width * 158 + 158 + 40 > $(".page-title").width() - 50) {
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

// 检索主体方法
function imgDoSearch() {
    var _imgArr = [];

    var searchImgList = [];
    if (imgArr.length < 1) {
        return;
    } else if (imgArr.length == 1) {
        _imgArr = searchImgList = imgArr.splice(0, 1);
    } else if (imgArr.length >= 2) {
        _imgArr = searchImgList = imgArr.splice(0, 2);
    }

    queryParams.IMG_URL_LIST = JSON.stringify(searchImgList);
    queryParams.ALGORITHM_ID = $("#sfVal").val()||getalgos();
    queryParams.REPOSITORY_ID = $('body').find("#registerDb").val();
    queryParams.PRIORITY = 1; //最高优先级

    if (isFirstLoading) { //第一次检索
        UI.util.showLoadingPanel(null, 'currentPage'); //显示加载进度条
    }
    searchingFlag = true; //页面正在检索

    wjFaceSearch();
}

// 本地一人一档检索
function lacalSearch() {
    var queryParams = {
        ALGO_LIST: JSON.stringify(ALGO_LIST),
        KEYWORDS: '',
        PERSON_TAG: '',
        SEX: '',
        pageNo: 1,
        pageSize: 30,
        IMG: imgUrl,
        THRESHOLD: '',
        ARCHIVE_STATUS: 1,
        SORT_FIELD: 'SCORE'
    };
    UI.util.showLoadingPanel(null, 'currentPage');
    UI.control.remoteCall("facestore/archivesPerson/getData", queryParams, function (resp) {
        var data = resp.data && resp.data.LIST && resp.data.LIST[0];
        var list = data && data.ALGORITHM_LIST;
        if(list && list.length) {
            for (var i = list.length - 1; i >= 0; i--) {
                if (list[i].IDENTITY_ID == identityId) {
                    list.splice(i, 1); // 删除证件号与本人相同的项
                }
            }
            // list = [{
            //     "PRESENT_ADDRESS": "北京市市辖区房山区",
            //     "SEX": "1",
            //     "WECHAT": "18373288888",
            //     "LONGITUDE": 0,
            //     "type": "PERSON_ARCHIVE_INFO",
            //     "FACE_ID": "396323217935615232",
            //     "FACE_NUM": 2,
            //     "IDENTITY_ID": "rBkUHFwke5WAM",
            //     "WORK_ADDRESS": "北京市市公安局",
            //     "score": "0",
            //     "IDENTITY_TYPE": 1,
            //     "PERMANENT_ADDRESS": "",
            //     "CREATE_TIME": "2018-12-29 15:27:01",
            //     "CAPTURE_TIME": "",
            //     "FACE_PIC": "http://172.25.20.28:8088/g28/M00/00000009/00000016/rBkUHFwnIliAMAlFABDjlXH9vik124.jpg",
            //     "BIRTHDAY": "",
            //     "QQ": "43999999",
            //     "PERSON_TAG": "0201 02 0200 0309",
            //     "TELEPHONE": "13877824907",
            //     "ALGO_TYPE": "10004",
            //     "ARCHIVE_STATUS": "1",
            //     "index": "person_archive_indice",
            //     "PIC": "http://172.25.20.28:8088/g28/M00/00000009/00000016/rBkUHFwnIliAMAlFABDjlXH9vik124.jpg",
            //     "UPDATE_TIME": "2019-01-07 02:45:25",
            //     "NAME": "张冠心",
            //     "PERSON_ID": "396323217935615233",
            //     "_id": "396323217935615233",
            //     "PERSON_TAG_NAME": "重点人员,涉稳,616,未审核",
            //     "LATITUDE": 0,
            //     "RPID": "396323217935615233",
            //     "MP_XY": []
            // }];
            if(list.length) {
                $('#tmplContent').prepend(tmpl('localSearchTemplate', list));
				localrecResult = list[0];
            };
            $('#resultTab li').find('.load-icon').addClass('hide');
            $('#resultTab li').removeClass('disabled');
        }
        localresultFlag = true;
        renderRecommend();
        if(outresultFlag){
        	UI.util.hideLoadingPanel('currentPage');
        }
    }, function(XMLHttpRequest, textStatus){
		if(textStatus === 'timeout') {
            UI.util.alert('已有档案检索超时', 'warn');
        }
        UI.util.hideLoadingPanel('currentPage');  
	},{
		timeout: 20000
	}, true);
}

// 根据ID展示图片检索结果
function showResult(id){
	$('#resultTab li[attrId="'+id+'"]').addClass('active').siblings().removeClass('active');
	if($('body').find('.personList[attrId="'+id+'"]').length>0){
		$('#tmplContent .nodata').addClass('hide');
		$('body').find('.personList[attrId="'+id+'"]').removeClass('hide').siblings().addClass('hide');
        $('body').find('.recommendList[attrId="'+id+'"]').removeClass('hide').siblings().addClass('hide');
        // 添加比对照片
        $('body').find('.personList[attrId="'+id+'"] .comparePic').attr('src', $('#resultTab li[attrId="'+id+'"] img').attr('src'));
	}else{
		$('#tmplContent .nodata').removeClass('hide');
		$('body .personList').addClass('hide');
	};
	
}
//根据ID删除图片检索结果
function deleteResult(id){
	$('body').find('.personList[attrId="'+id+'"]').remove();
	$('body').find('.recommendList[attrId="'+id+'"]').remove();
	$('#resultTab li[attrId="'+id+'"]').remove();
	cacheIDs.splice(cacheIDs.indexOf(id),1);
	var flag = false; // 标志是否有高亮标签.true: 无 ;  false: 有
	if(cacheIDs.length>0){
		for(var i=0; i<cacheIDs.length; i++){
			if($('#resultTab li').eq(i).hasClass('active')){
				flag = true;
			}
		}
	}
	if(!flag){
		showResult(cacheIDs[0]);
	}
}

// 渲染 "算法"的筛选列表
function appendSFList() {
	UI.control.remoteCall('face/common/feishiAlgoList', null, function(resp) {
        var html = ''
        if(resp.CODE == 0) { //请求成功重置 SFLIST
            var algos = []
            var data = resp.DATA
            for(var i = 0;i < data.length; i++){
                algos.push({"ID": data[i].id, "NAME": data[i].name});
            }
            algos.unshift({ID:'',NAME:'全部'})
            SFLIST = algos;
        }
        for(var i = 0;i < SFLIST.length; i++) {
            if(i == 0) {
                html += '<li class="tags-list-item active" val=' + SFLIST[i].ID + '>' + SFLIST[i].NAME + "</li>";
            } else {
                html += '<li class="tags-list-item" val=' + SFLIST[i].ID + '>' + SFLIST[i].NAME + "</li>";
            }
        }
        $('#sfList').append(html);       
    });
}

function setWidth() {
    $(".top-box").css("display", "block");
    $(".img-wraper").css("width", "100%").css("display", "block");
    $(".filter-view").css({"top": "-12px"},{"display": "block"});
}

//将页面恢复未进行检索的状态
function clearData(){
	isFirstLoading = true;
	cacheIDs = [];
	$('#recommend').html('<div class="nodata"></div>');
	$('#tmplContent').html('<div class="nodata"></div>');
}

function  wjFaceSearch(){
	var param = {
        IMG_URL: imgUrl,
        TOP_NUMBER: 20,
        THRESHOLD: 60
    };
    if(hasLocalSearch) {
        lacalSearch();
    }
	UI.control.remoteCall('face/technicalTactics/wjFaceSearch',param,function(resp){
        // resp = {
        //     CODE: 0,
        //     DATA: [{
        //         SIMILARITY: 88,
        //         IMG_URL: 'http://172.25.20.28:8088/g28/M00/00000009/00000016/rBkUHFwmLciAUywVAAB4oUWmhqA954.jpg',
        //         ALARM_LEVEL: 1,
        //         PERSON_ID: 888888888,
        //         NAME: '李翊君',
        //         REPOSITORY_NAME: '酷酷酷',
        //         IDENTITY_TYPE: '2',
        //         GJ: '???'
        //     }],
        //     SEARCHTIMES: 998
        // };
        $('#tmplContent .nodata').addClass('hide');
        var data = resp.DATA;
        if(resp.SEARCHTIMES) {
            $('.searchNum').text(resp.SEARCHTIMES).parents('.action-btn-group').removeClass('hide');
        }
        
        outresultFlag = true;
        if(resp.CODE==1){
            UI.util.alert(resp.MESSAGE,"warn");
            if(hasLocalSearch) {
                if(localresultFlag){
                    UI.util.hideLoadingPanel('currentPage');
                }                
            } else {
                UI.util.hideLoadingPanel('currentPage');
            }

            return;
        }
        if(data && data.length){
            for (var i = data.length - 1; i >= 0; i--) {
                if (data[i].PERSON_ID == identityId) {
                    data.splice(i, 1); // 删除证件号与本人相同的项
                }
            }

            outrecResult = data[0];

            $('#tmplContent').append(tmpl('outerTemplate', data));
        }

        renderRecommend();
        $('#resultTab li').find('.load-icon').addClass('hide');
        $('#resultTab li').removeClass('disabled');
        if(localresultFlag || !hasLocalSearch){
        	UI.util.hideLoadingPanel('currentPage');
        }
	}, function(XMLHttpRequest, textStatus){
		if(textStatus === 'timeout') {
            UI.util.alert('外部检索超时', 'warn');
        }
        $('#resultTab').children().remove();
        UI.util.hideLoadingPanel('currentPage');  
	}, {
		timeout: 20000
	}, true);
}

function renderRecommend(){
	if(localrecResult){
		recResult = localrecResult;
	}
	if(outrecResult){
		recResult = outrecResult;
	}
	if(outrecResult && localrecResult){
		recResult = (outrecResult.SIMILARITY > localrecResult.SCORE) ? outrecResult : localrecResult;
	}
	if(recResult) {
        $('#recommend').html(tmpl('recTemplate', recResult));
	} else {
        $('#recommend').html('<div class="nodata"></div>');
    }
}