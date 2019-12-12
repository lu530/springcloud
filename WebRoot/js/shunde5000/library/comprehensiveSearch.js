

$(function () {

    initPage();
    initEvent();

    faceCompare.init();

    addBtnClickEvent.init();
});

function initPage () {

    uploadPic();    //  图片上传初始化
    
    initEfacesurveillance();    //  布控算法初始化

    initEfaceStore();       //  一人一档算法初始化

    getSpecialTag();    //  一人一档特殊标签初始化

    setTimeout(function () {
        initFaceAlgoType();     //  抓拍算法初始化
    }, 100)
    
    if(options.urlParams.imgSrc) {

        $("#filterImg, #compareTopPhoto").attr("src", options.urlParams.imgSrc);
        $("#filterImg").siblings(".pciImageIcon").removeClass('pci-image-display');
        $("#compareTopPhoto").siblings(".isNeedHide").addClass('hide');
    }
    $("#searchText").val(options.urlParams.KEYWORDS);
}

function initEvent () {

    $(".navItemBtn").click(function() {
		clickTick = true;
		var $this = $(this),
			curAnchor = $this.attr('scrollid'),
			curAnchorTop = $(curAnchor).get(0).offsetTop - 50;
        $this.addClass('active').siblings().removeClass('active');

		$(".pager-wrap").stop().animate({
			scrollTop: curAnchorTop + 'px'
		}, "slow", function() {
			setTimeout(function() {
				clickTick = false;
			}, 600);
		});
    });

    //  显示定点滚动指示栏
    $('.pager-wrap').on('scroll', function () {

        if($(this).scrollTop() > 355) {
            $('.navPb').removeClass('hide');
        }else{
            $('.navPb').addClass('hide');
        }
    });
    
    //  查看更多
    $("body").on('click', '.lookmore', function () {

        var type = $(this).attr('attr-key');

        if( type === 'MonitorLB') {
            UI.util.alert('暂不支持查看更多，敬请期待...');
            return;
        }

        if(type === 'faceCaptureLB' && options.params.faceCaptureLB.PIC === '') {
            UI.util.alert('路人库暂无数据');
            return;
        }

        if(!$('#searchText').val() && $("#filterImg").attr("src") === '/efacecloud/images/noPhoto2.png') {
            UI.util.alert('图片或者姓名身份证至少一项不能为空。');
            return;
        }

        var src = $("#filterImg").attr("src"),
            keywords = $('#searchText').val();

        src = src !== '/efacecloud/images/noPhoto2.png' ? src : '';

        var urlSrc = type === 'feiShiLB' ? 
        options.pageUrl[type] + '?imgUrl=' + src :
        options.pageUrl[type] + '?imgSrc=' + src + '&KEYWORDS=' + keywords

        UI.util.openCommonWindow({
			"title": $(this).attr('attr-title'),
			"height": top.innerHeight*0.95,
			"width": top.innerWidth*0.9,
			"src": urlSrc + '&BEGIN_TIME=' + options.params[type].BEGIN_TIME +  '&END_TIME=' + options.params[type].END_TIME,
			"callback": function(resp){
				doSearch();
			}
		});
    });

    //  ================start 搜索条件改变检索 ===============
    $("#allATFilter").on('click', 'span', function () {

        $(this).addClass('active').siblings().removeClass('active');
        // doSearch();
    });
    $("#searchBtn").on('click', function () {
        doSearch();
    })
    $(".searchSimilarCon, #searchText").keyup(function(event){
		if(event.keyCode == 13){
			doSearch();
		}
    });
    //  ================end 搜索条件改变检索 ===============

    $("#confirmSearch").on('click', function () {
        
        doSearch();
    })

    $(".pageCloseBtn").on('click', function () {

        top.$('#header').find('a[href="#Stereoscopic/DEFENCE_home"]').click();
    });
}

//初始化人脸检索算法
function initFaceAlgoType() {
    options.algoList = [];
	var remoteOpts = {
		serviceUrl: '/efacecloud/rest/v6/face/common/getFaceAlgoType',
		params: {
			MENUID: 'EFACE_faceCapture'
		},
		noMessage: true,
		okCallback: function(resp) {
			var ATHtml = '';
			$.each(resp.data, function(index, value) {
                ATHtml += '<span class="tag-item" at-type="' + value.ALGORITHM_ID + '">' + value.ALGORITHM_NAME + '</span>';
                options.algoList.push({
                    ALGO_TYPE: value.ALGORITHM_ID,
                    THRESHOLD: 60
                });
                options.algoListRate[value.ALGORITHM_ID] = value.SCORE_RATE || '1';
			})
            $('.arithmeticFilter').append(ATHtml);
            options.commonParams.ALGO_LIST = JSON.stringify(options.algoList);
            doSearch();
			$("#algoType").html(tmpl("algoListTemplate", resp.data));
		}
    }
    remoteCall(remoteOpts);
}

//  初始化布控算法
function initEfacesurveillance () {

    options.surveillanceAlgoList = [];

    UI.control.remoteCall('', '', function (resp) {

        $.each(resp.data, function(index, value) {

            options.surveillanceAlgoList.push({

                ALGO_TYPE: value.ALGORITHM_ID,
                THRESHOLD: 60
            });
        });

    }, function (error) {}, {
        
        url: '/efacesurveillance/rest/v6/face/common/getFaceAlgoType',
        data: {

            MENUID: 'EFACE_faceDispatchedCustom'
        }
    }, true);
}

//  初始化一人一档算法
function initEfaceStore () {

    options.efacestoreAlgoList = [];

    UI.control.remoteCall('', '', function (resp) {

        $.each(resp.data, function(index, value) {

            options.efacestoreAlgoList.push({

                ALGO_TYPE: value.ALGORITHM_ID,
                THRESHOLD: 60
            });
        });

    }, function (error) {}, {
        
        url: '/efacestore/rest/v6/face/common/getFaceAlgoType',
        data: {

            MENUID: 'DEFENCE_faceBaseManager'
        }
    }, true);
}

function remoteCall(opts) {

	UI.control.remoteCall('', '', function(resp) {

		if(resp.CODE == 0 || (resp.data && (resp.data.length > 0 || resp.data.LIST))) {
			if(opts.okCallback) {
				opts.okCallback(resp);
			}
		} else {
			if(opts.warnCallback) {
				opts.warnCallback(resp)
			}
			if(resp.MESSAGE) {
				UI.util.alert(resp.MESSAGE, "warn");
			}
		}
	}, function() {}, {
		url: opts.serviceUrl,
		data: opts.params
	}, true);
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
function doSearch () {

    //  公共参数调整
    commonParamshandle();

    if(!$('#searchText').val() && $("#filterImg").attr("src") === '/efacecloud/images/noPhoto2.png') {
        UI.util.alert('图片或者姓名身份证至少一项不能为空。');
        return;
    }

    if(!UI.util.validateForm($('#thresholdValidate'))){
    	UI.util.alert('阈值必须为1-100的整数。');
    	return;
    }
    UI.util.showLoadingPanel();

    for(var i in options.url) {
        if((i === 'alarmLB' && options.params.personLB.IMG !== '' ) || (i === 'faceCaptureLB' && options.params.faceCaptureLB.PIC === '') ) {
            $('#' + i).find('.itemContent').html("<div class='nodata'></div>");
            continue;
        }
        getDataUnit(i);
    }
    UI.util.hideLoadingPanel();
}

function commonParamshandle () {

    //  路人库检索的传参在算法选择时有效
    options.algoList = [];

    var $alogs = $("#allATFilter .tag-item"),
		$active = $("#allATFilter .tag-item.active"),
        number = $(".searchSimilarCon").val();
    
    if($active.text() == "全部") {
		$.each($alogs, function(i, el) {
			if(i != 0) {
                var rate = options.algoListRate[$(this).attr("at-type")];
				options.algoList.push({
					ALGO_TYPE: $(this).attr("at-type"),
					THRESHOLD: Math.round( number / rate )
				});
			}
		});
	} else {
		options.algoList.push({
			ALGO_TYPE: $active.attr("at-type"),
			// ALGO_NAME: $active.text(),
			THRESHOLD: number
		});
    }

    options.commonParams = {
        ALGO_LIST : JSON.stringify(options.algoList),
        KEYWORDS : $('#searchText').val()
    }

    //  其他的两个算法仅仅更新算法阈值
    options.surveillanceAlgoList = options.surveillanceAlgoList.map(function (item) { item.THRESHOLD = number; return item; });
    options.efacestoreAlgoList = options.efacestoreAlgoList.map(function (item) { item.THRESHOLD = number; return item; });

    //  图片
    var src = $("#filterImg").attr("src");

    options.params.feiShiLB.IMG_URL_LIST = (src !== '/efacecloud/images/noPhoto2.png' ? JSON.stringify([src]) : '');
    options.params.MonitorLB.PIC = (src !== '/efacecloud/images/noPhoto2.png' ? src : '');
    options.params.faceCaptureLB.PIC = (src !== '/efacecloud/images/noPhoto2.png' ? src : '');
    options.params.personLB.IMG = (src !== '/efacecloud/images/noPhoto2.png' ? src : '');
}

function getDataUnit (type) {

    UI.control.remoteCall('', '', function (resp) {

        if(type === 'feiShiLB') {

            if (resp.CODE == 0) {

                resp.DATA && resp.DATA.length ? feiShiDataHandle(resp.DATA[0], type) :

                $('#' + type).find('.itemContent').html("<div class='nodata'></div>");
            }
        }else{
            if(resp && resp.data) {

                var renderData = JSON.parse(JSON.stringify(resp.data));

                if((type === 'personLB' && options.params[type].IMG !== "") || (type === 'faceCaptureLB' && options.params[type].PIC !== "")) {
                    renderData = renderData.LIST[0].ALGORITHM_LIST;
                }else{
                    renderData = renderData.records;
                }
                renderData.length > 0 ? 

                $('#' + type).find('.itemContent').html(tmpl(type + 'Tmpl', renderData)) :
                $('#' + type).find('.itemContent').html("<div class='nodata'></div>");

                if(type === 'MonitorLB' && options.params.MonitorLB.PIC !== "" && renderData.length > 0) {

                    reloadAlarmPart(renderData[0].IDENTITY_ID);
                }
            }
        }
        
    }, function (err) {}, {

        url: options.url[type],
        data: $.extend({}, options.params[type], options.commonParams, {
            //  调整，路人库KEYWORDS参数实际上是代表设备ID，不能传
            KEYWORDS: type === 'faceCaptureLB' ? "" : options.commonParams.KEYWORDS
        },
        type === 'personLB' ? {
            //  一人一档的算法
            ALGO_LIST: JSON.stringify(options.efacestoreAlgoList)
            // ALGO_LIST: JSON.stringify(options.algoList.filter(function (item) {return item.ALGO_TYPE === '10003'}))
        } : {},
        type === 'MonitorLB' ? {
            //  布控库的算法不一致
            ALGO_LIST: JSON.stringify(options.surveillanceAlgoList)
        } : {})
    }, true);
}
//  ===================================start 身份核查相关 ======================================
//  飞识接口特殊处理
function feiShiDataHandle (data, type) {

    var sfListArr = [];
    for (var key in data.LIST) {
        sfListArr.push(key);
    }
    var arr = [];
    for (var i = 0; i < sfListArr.length; i++) {
        arr.push({name: sfListArr[i], data: data.LIST[sfListArr[i]], length: data.LIST[sfListArr[i]].length});
    }
    // var arr = [{
    //     name: '112',
    //     data: [{
    //         PERSON_ID: '1124',
    //         IMG_URL: 'http://172.25.20.28:8088/g28/M00/00031003/20181022/rBkUHFvNPA-IOM-fAAA0vKpvYykAAA1twAA4psAADTU645.jpg',
    //         ALARM_LEVEL: '',
    //         SIMILARITY: 88,
    //         REPOSITORY_NAME: 's222'
    //     }, {
    //         PERSON_ID: '6544',
    //         IMG_URL: 'http://172.25.20.28:8088/g28/M00/00031003/20181022/rBkUHFvNPA-IOM-fAAA0vKpvYykAAA1twAA4psAADTU645.jpg',
    //         ALARM_LEVEL: '',
    //         SIMILARITY: 90,
    //         REPOSITORY_NAME: 's222'  
    //     }],
    //     length: 2
    // }];
    $('#' + type).find('.itemContent').html(tmpl(type + 'Tmpl', arr));
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
//  ===================================end 身份核查相关 ======================================

/** ============================== start 一人一档相关函数 ==================================*/

var specialTag = [];

function renderTag(datas){
	if(datas == '' || !datas){  // 标签为空
		return [];
	}
	return datas;
}

function renderAddress(msg){
	if(!msg){
		return '未知';
	}
	return msg;
}
function renderTagArr(tags,type){
	var isFloat = '';
	if(type){
		isFloat = 'fl';
	}
	sort(tags);
	var html = '';
	for(var j=0; j<tags.length; j++){  
		var specialFlag = '';
		$.each(specialTag,function(i,v){
			if(tags[j].TAG_CODE.indexOf(v)==0){
				specialFlag = 'special-flag';
				return false;
			}
		});
		if(tags[j].TAG_CODE.length>2){ 
			html+='<span class="tagitem mb5 '+isFloat+' '+specialFlag+'">'+tags[j].TAG_NAME+'</span>';
		}
	}
	return html;
}
// function getSpecialTag(){
// 	UI.control.remoteCall("facestore/archives/getPersonTagConf",{},function(resp){
// 		if(resp.CODE==0){
// 			specialTag = resp.DATA.split(",");
// 		}
// 	});
// }
function getSpecialTag(){
	UI.control.remoteCall("","",function(resp){
		if(resp.CODE==0){
			specialTag = resp.DATA.split(",");
		}
	}, function (error) {}, {
        url: '/efacestore/rest/v6/facestore/archives/getPersonTagConf',
        data: {}
    });
}

function sort(data){
	$.each(data,function(i,v){
		$.each(specialTag,function(j,k){
			if(data[i].TAG_CODE.indexOf(k)==0){
				var cur = data.splice(i,1)[0];
				data.unshift(cur);
			}
		});
	});
	return data;
}
/** ============================== end 一人一档相关函数 ==================================*/

var faceCompare = {

    init: function () {

        this.initEvent();
    },
    initEvent: function () {

        var _self = this;

        //  人脸比对窗口显示隐藏
        $("#twiceCompareTools").click(function(e) {

            if($(".tool-page-content .img-compare").css("left") !== '0px' ) {
                //打开
                $(".tool-page-content .right-panel").css("left", 310);
                $(".tool-page-content .img-compare").css("left", 0);
            } else {
                //收起
                $(".tool-page-content .right-panel").css("left", 0);
                $(".tool-page-content .img-compare").css("left", -310);
            }
        });

        //上传图片进行检索
        $('#imgCompare').on('change','.compareBtn',function(){
            var $this = $(this);
            var uploadId = $this.attr("id");

            var flag = ajaxFileUploadSpecial(uploadId, picSuccFunctionSpecial);
            if (!flag) return;
        });
        //  清空图片
        $('#emptyImg').on('click', function () {

            $("#compareTopPhoto").attr("src", "").siblings(".isNeedHide").removeClass("hide");
            $("#compareBottomPhoto").attr("src", "").siblings(".isNeedHide").removeClass("hide");
        });

        //  进行人脸比对
        $("#oneCompareOne").on('click', function () {

            var params = {
                searchType: 6,
                URL_FROM: $("#compareTopPhoto").attr("src"),
                URL_TO: $("#compareBottomPhoto").attr("src")
            }
            if(params.URL_FROM && params.URL_TO){
                _self.searchData(params);
            }else{
                UI.util.alert('请先上传两张图片进行比对', 'warn');
            }
        });
    },
    searchData: function (params) {

        UI.util.showLoadingPanel();

        UI.control.remoteCall('face/technicalTactics/one2one',params,function(resp){	 	
             if(resp.CODE == "1"){

                UI.util.alert("比对失败:" + resp.MESSAGE, "error");	    		
             }else{

                var score = resp.DATA.SIMILARITY;
                $(".percentNum").html(score + "%");
                UI.util.alert("比对完成，相似度" + score + "%");
            }
            UI.util.hideLoadingPanel();
        }, function(data, status, e) {
             UI.util.hideLoadingPanel();
        }, {
            async : true
        });
    },

}

//  重新渲染告警部分
//  由于告警不能做以图搜图，解决措施是图片查到布控数据的第一条，将结果作为keyWords去查告警数据
function reloadAlarmPart (keyWords) {

    UI.control.remoteCall('', '', function (resp) {

        var renderData = JSON.parse(JSON.stringify(resp.data));

        if(renderData.records.length > 0) {
            $('#alarmLB').find('.itemContent').html(tmpl('alarmLBTmpl', renderData.records));
        }else{
            $('#alarmLB').find('.itemContent').html("<div class='nodata'></div>");
        }

    }, function (error) {}, {
        url: '/efacecloud/rest/v6/face/dispatchedAlarm/grouping/getData',
        data: $.extend({}, options.params['alarmLB'], options.commonParams, {KEYWORDS: keyWords})
    })
}

//  综合检索每个小卡片上的按钮事件问题统计在这里添加

var addBtnClickEvent = {

    init: function () {
        //  路人库
        this.faceCapture();
        //  告警库
        this.alarm();
        //  布控库
        this.monitor();
        //  一人一档
        this.person();
        //  身份核查库
        this.feiShi();
    },
    // 路人库
    faceCapture: function () {

        //身份核查
        $("#faceCaptureLB").on("click",".verification-search",function(){
            openWindowPopup('identity',$(this).attr("url"));
        });

        //轨迹分析
        $("#faceCaptureLB").on("click",".trajectory-search",function(){
            var url = $(this).attr("url");
            var time = {
                bT: options.params.faceCaptureLB.BEGIN_TIME,
                eT: options.params.faceCaptureLB.END_TIME
            }
            openWindowPopup('track', url, time,'faceCaptureList');
        });

        //路人库检索
        $("#faceCaptureLB").on("click",".searchBtn",function(){
            
            var imgSrc = $(this).attr("fileUrl");
            
            UI.util.openCommonWindow({
                width:$(top.window).width()*0.95,
                height:$(top.window).height()*0.95,
                title:"路人库检索以图搜图",
                src: matcher('/efacecloud/page/library/faceCaptureList.html/' + top.customization.projectID).url + '?imgSrc=' + imgSrc
            });
        });
        //收藏
        $("#faceCaptureLB").on("click",".collectionBtn",function(){
            var ref = $(this).attr("ref");
            UI.util.showCommonWindow(ref, "收藏文件夹", 
                    600, 450, function(obj){
            });
        });
        //图片定位
        $("#faceCaptureLB").on("click",".locationBtn",function(){
            var ref = $(this).attr("ref"),
                time = $(this).attr('attr-time'),
                addr = $(this).attr('attr-addr'),
                imgUrl = $(this).attr('fileUrl'),
                longitude = parseFloat($(this).attr('LONGITUDE')),
                latitude = parseFloat($(this).attr('LATITUDE'));
            if(longitude && longitude && longitude != 0 && longitude !=0){
                var url = ref+'?time='+time+'&addr='+addr+'&imgUrl='+imgUrl+'&longitude='+longitude+'&latitude='+latitude;
                UI.util.showCommonWindow(url, "定位", 
                        $(top.window).width()*.95, $(top.window).height()*.9, function(obj){
                });
            }else{
                UI.util.alert("经纬度不合法！", "warn");
            }
        });
    },
    // 告警库
    alarm: function () {

        //点击搜索事件
        $('#alarmLB').on('click', '.searchBtnAll', function() {
            openWindowPopup('faceCapture', $(this).attr('fileUrl'));
        });
        //布控详情
        $('#alarmLB').on('click', '.controlDetailBtn', function() {
            var objId = $(this).attr("objectid");
            var opts = {
                    src: '/efacesurveillance/page/faceControl/dispatchedApproval/controlApplyForm.html?pageTitle=布控详情&pageType=detail&funcType=6&objectId='+objId+'&noFooter='+true,
                    title: '布控详情',
                    width:$(top.window).width()*.95,
                    height: $(top.window).height()*.9
            }
            //	=== @start 若产生的告警的人员是来自专题库的，则跳转到新的一人一档详情页，并在该详情页显示库来源。===
            if($(this).attr('specialFlag') == "1") {
                var idcard = $(this).attr('idcard');
                var surveillanceTime = $(this).attr("surveillanceTime");
                opts.src = '/efacestore/page/personnelLibrary/personDetailList.html?idcard=' + idcard + '&sourceDbName=' + "专题库" + '&isWindowFrame=' + true + '&surveillanceTime=' + surveillanceTime
            }
            //	=== @end ===
            parent.UI.util.openCommonWindow(opts);
        });
        
        //轨迹分析
        $("#alarmLB").on("click", ".trajectory-searchAll", function() {
            var time = {
                bT: options.params.alarmLB.BEGIN_TIME,
                eT: options.params.alarmLB.END_TIME
            };
            openWindowPopup('track', $(this).attr("url"),time);
        });
        //身份核查
        $("#alarmLB").on("click", ".verification-search", function() {
            openWindowPopup('identity', $(this).attr("url"));
        });

        //点击详情事件
        $('#alarmLB').on('click', '.detailBtnAll', function() {
            var $this = $(this),
                ALARM_ID = $this.attr('ALARM_ID'),
                level = $this.attr("alarm-level"),
                OBJECT_ID = $this.attr("objid"),
                isfs = $this.attr("isfs"),
                alarmTime = $this.attr("alarmtime"),
                curTime = $this.attr("curtime"),
                imgUrl = $this.parents(".list-node").find(".compare-large img").attr("src");
            if(isfs == '1'){
                var name = $this.attr("name"),
                idCard = $this.attr("idcard"),
                time = $this.attr("time");
                
                UI.util.showCommonWindow('/efacecloud/page/library/alarmDetails.html?OBJECT_ID='+OBJECT_ID+'&curTime='+curTime+'&isFly=1&ALARM_ID=' + ALARM_ID + '&level=' + level
                        + '&name=' + name+ '&idCard=' + idCard+ '&time=' + time +'&alarmTime='+alarmTime +'&imgUrl='+imgUrl, "告警详情",
                    1180, 666,
                    function(obj) {});
            }else{
                UI.util.showCommonWindow('/efacecloud/page/library/alarmDetails.html?OBJECT_ID='+OBJECT_ID+'&curTime='+curTime+'&ALARM_ID=' + ALARM_ID + '&level=' + level +'&alarmTime='+alarmTime +'&imgUrl='+imgUrl, "告警详情",
                        1180, 579,
                        function(obj) {});
            }
        });

        // 打开历史告警
        $('#alarmLB').on('click', '.openRepeatAll', function(){
            
            var OBJECT_ID = $(this).attr('OBJECT_ID');
            var bT = options.params.alarmLB.BEGIN_TIME;
            var eT = options.params.alarmLB.END_TIME;
            var THRESHOLD = '60';
            var DEVICE_IDS = '';
            var KEYWORDS = options.commonParams.KEYWORDS;
            //	新增若是专题库告警则跳转到一人一档详情页
            var specialFlag = $(this).attr("specialFlag"),
                surveillanceTime = $(this).attr("surveillanceTime");

            var url = '/efacecloud/page/alarm/alarmAllCardList.html?OBJECT_ID='+OBJECT_ID+'&BEGIN_TIME='+bT+'&END_TIME='+eT+'&THRESHOLD='+THRESHOLD+'&DEVICE_IDS='+DEVICE_IDS+'&KEYWORDS='+KEYWORDS+
            '&specialFlag=' + specialFlag + '&surveillanceTime=' + surveillanceTime + '&isDialog=true';

            UI.util.openCommonWindow({
                src: url,
                title: '历史告警',
                width: $(top.window).width()*.95,
                height: $(top.window).height()*.9,
                callback: function(obj){}
            });
        });
    },
    //  布控库
    monitor: function () {

        //人脸卡片跳转路人检索
        $("#MonitorLB").on("click",".searchPassBtn",function(){
            var imgUrl = $(this).parents("dl").find("img").attr("src");
            openWindowPopup('faceCapture', imgUrl);
        });
        
        //人脸卡片跳转历史告警页面
        $("#MonitorLB").on("click",".toHisBtn",function(){
            var OBJECT_ID = $(this).attr("OBJECT_ID");
            UI.util.openCommonWindow({
                title:"告警列表",
                width:$(top.window).width()*.95,
                height:$(top.window).height()*.95,
                src:"/efacecloud/page/alarm/alarmAllCardList.html?from=alarmCard&OBJECT_ID="+OBJECT_ID+"&timeControl=nM"
            });
        });

        // 布控详情
        $('#MonitorLB').on('click','.detailBtn',function(){
            var PERSON_ID = $(this).attr("PERSON_ID");
            var url = '/efacesurveillance/page/faceControl/dispatchedApproval/controlApplyForm.html?pageType=detail&noFooter=true&funcType=3&personId='+PERSON_ID;
            UI.util.openCommonWindow({
                src: url,
                title: '布控详情',
                width: $(top.window).width()*.95,
                height: $(top.window).height()*.9,
                callback: function(obj){}
            });
        });
    },
    // 一人一档
    person: function () {

        //	一人一档点击跳转路人库以图搜图
        $('#personLB').on('click', '.searchByImage', function() {
            openWindowPopup('faceCapture', $(this).attr('imgSrc'));
        });

        //  一人一档详情
        $('#personLB').on('click', '.similar-name a,.btn-more', function(event) {
            var personId = $(this).closest('.list-node-wrap').attr('personid');
            var idcard = $(this).closest('.list-node-wrap').attr('idcard');
            var kssNum = $(this).attr('kss-num');

            UI.util.openCommonWindow({
                src: '/efacestore/page/personnelLibrary/personDetailList.html?personId=' + personId + '&idcard=' + idcard + '&KSS_NUM=' + kssNum + '&isDialog=true',
                title: '人员档案详情',
                width: $(top.window).width()*.95,
                height: $(top.window).height()*.9,
                callback: function(obj){}
            });
        });
        //  跳转一人一档检索
        $('#personLB').on('click', '.btn-search', function() {

            var imgUrL = $(this).closest('.list-node').find('img')[0].src;
            openWindowPopup('faceStore', imgUrL);
        });
    },
    //  身份核查库
    feiShi: function () {

        // 轨迹分析
        $("#feiShiLB").on("click", ".trajectory-search", function () {
            openWindowPopup('track', $(this).attr("url"));
        });
        
        // 路人检索 
        $("#feiShiLB").on("click", ".lrjs-search", function () {
            var imgUrl = $(this).attr("url");
            openWindowPopup('faceCapture', imgUrl);
        });
        
        // 一人一档检索
        $("#feiShiLB").on("click", ".yryd-search", function () {

            openWindowPopup('faceStore', $(this).attr("url"));
        });
    }
}