var params = {};
var isBlack = isBlack();
var oneToOneParams = {};
var tabSel = UI.util.getUrlParam('tabSel') || '', // 选中的选项卡id
	img1 = UI.util.getUrlParam('img1') || '', // 比对的第一张图片
	img2 = UI.util.getUrlParam('img2') || ''; // 比对的第二张图片

$(function(){
	UI.util.tabs();
	initEvent();
	headerInit();
	initWaterMark();
	getLocalAlgo();
	if(!isBlack){
		getAlgo();
	}
	if(!tabSel) {
		$('#backBtn').removeClass('hide');
	}
});

function initEvent(){
	//返回菜单
	$('body').on('click','#backBtn',function(){
		parent.showMenu();
	});
	
	//比对按钮
	/*$(".btn-wrap").on("click","#compare",function() {
		
		$(".proportion").addClass("show");
		
		params.URL_FROM = $("#avatar1").attr("src");
		params.URL_TO = $("#avatar2").attr("src");
		
		if (params.URL_FROM == "" || params.URL_TO == "") {
			UI.util.alert("请上传两张图片进行比对", 'warn');
			return;
		}
		
		//检索案件录入
		if(isOpenSearchCause()){
			var searchParams = params;
			searchParams.searchType = 6;
			searchBeforeLogged(searchData,searchParams);
		}else{
			searchData();
		}
		
	});*/

	// 1:1比对按钮
	$(".btn-wrap").on("click","#oneToOneCompare",function() {
		$(".oneToOneProportion").addClass("show");

		oneToOneParams.URL_FROM = $("#avatar3").attr("src");
		oneToOneParams.URL_TO = $("#avatar4").attr("src");
		var algoList = [];
		var algoLocalList = [];
		if($('.tag-item-feishi[class*="all"]').hasClass('active')) {
			$('#oneToOne .tag-item-feishi').each(function(i, ele) {
				if(i > 0) {
					algoList.push($(ele).attr('val'));
				}
			});
		} else {
			$('#oneToOne .tag-item-feishi.active').each(function(i, ele) {
					algoList.push($(ele).attr('val'));
			});			
		}
       if($('.tag-item-local[class*="all"]').hasClass('active')) {
            $('#oneToOne .tag-item-local').each(function(i, ele) {
                if(i > 0) {
                    algoLocalList.push($(ele).attr('val'));
                }
            });
        } else {
            $('#oneToOne .tag-item-local.active').each(function(i, ele) {
                algoLocalList.push($(ele).attr('val'));
            });
        }

		oneToOneParams.ALGORITHM_ID = algoList.join(',');
		oneToOneParams.ALGO_TYPES = algoLocalList.join(',');

		if(oneToOneParams.URL_FROM == undefined || oneToOneParams.URL_TO == undefined) {
			UI.util.alert("请上传两张图片进行比对", 'warn');
			return;
		}
		if(!algoList.length && !algoLocalList.length) {
			UI.util.alert('请选择至少一种算法进行比对', 'warn');
			return;
		}
		
		//检索案件录入
		/*if(isOpenSearchCause()){*/
			var searchParams = oneToOneParams;
			searchParams.searchType = 6;
			searchBeforeLogged(oneToNSearchData, searchParams);
		/*}else{
			searchData();
		}*/
	});
	
	$(".icon-trash").click(function() {
		$(this).parents(".upload-img").children("img").attr("src","/ui/plugins/eapui/img/nophoto.jpg")
	});
	
	//上传图片进行检索
	$('body').on('change','.searchImgButton',function(){
		var $this = $(this);
		var uploadId = $this.attr("id");
		var upBg = $this.parents(".upload-bg");
		var upNextBg = $this.parents(".upload-bg").next();
		var $uploadInput = $this.parents(".image-item").find('[name="uploadPicBtn"]');
		var $ratio = $this.parents('.left-image').find('.ratio');
		
		var flag = ajaxFileUpload(uploadId, picSuccFunction);
		if (!flag) return;
		if (upBg.length > 0) {
			upBg.addClass("hide");
		}
		 
		if (upNextBg.hasClass("hide")) {
			upNextBg.removeClass("hide");
		}
		
		if($ratio.hasClass("show")){
			$ratio.removeClass("show");
			$ratio.find(".con").addClass("hide");
		}
		
	});
	
	// 选择1:1算法
	$('body').on('click', '.tag-item', function() {
		$(this).toggleClass('active');
	});
}

function getAlgo() {
	UI.control.remoteCall('face/common/feishiAlgoList', null, function(resp) {
		var data = resp.DATA;
		$('#oneToOne .tagslist').html(tmpl('algoTmpl', data));
		autoCompare();
	}, null, null, true);
}
function getLocalAlgo() {
    UI.control.remoteCall('face/common/getFaceAlgoType', {'MENUID':'EFACE_faceCapture'}, function(resp) {
        var data = resp.data;
        $('#oneToOne .tagslocallist').html(tmpl('algoLocalTmpl', data));
        autoCompare();
    }, null, null, true);
}

function searchData(){
	UI.util.showLoadingPanel();
	UI.control.remoteCall('face/technicalTactics/one2one',params,function(resp){	 	
		 if(resp.CODE == "1"){
	    		UI.util.alert("比对失败:" + resp.MESSAGE, "error");	    		
	     }else{
	   		$(".proportion .con").removeClass("hide");
	   		var score = resp.DATA.SIMILARITY;
	    	$(".proportion b").text(score + "%");
			UI.util.alert("比对完成，相似度"+score+"%");
	    }
	    UI.util.hideLoadingPanel();
    }, function(data, status, e) {
	 	UI.util.hideLoadingPanel();
	}, {
		async : true
	});	
}

function oneToNSearchData() {
	UI.util.showLoadingPanel();
	UI.control.remoteCall('face/technicalTactics/faceSearchOnetoOne', oneToOneParams, function(resp){
		// var result = JSON.parse(resp.DATA || '[]');
		var result = resp.DATA;
		if(result && result.length) {
			$(".oneToOneProportion .con").html('');
			$(".oneToOneProportion .con").removeClass("hide");
			if(result.length === 1) {
				$(".oneToOneProportion .con").append(tmpl('singleScoreTmpl', result));
			} else {
				$.each(result, function(i, obj) {
					$(".oneToOneProportion .con").append(tmpl('scoreTmpl', obj));
				});				
			}
		}
	    UI.util.hideLoadingPanel();
    }, function(data, status, e) {
		UI.util.hideLoadingPanel();
	}, {
		async : true
	});
}

function headerInit() {
	var sub = UI.util.getUrlParam("sub");
	if (sub == 1) {
		$(".person-head").addClass("hide");
	}
}

// 传入参数时自动进行比对检索
function autoCompare() {
	if(tabSel) {
		$('[tabs-control="#'+ tabSel +'"]').trigger('click');
		if(img1 && img2) {
			$('#' + tabSel + ' img[foruploadimg]').eq(0).attr('src', img1);
			$('#' + tabSel + ' img[foruploadimg]').eq(1).attr('src', img2);
			$('#' + tabSel + ' .upload-img').removeClass('hide');
		}
		$('#' + tabSel + ' button').trigger('click');
	}
}

// 判断是否是黑人项目
function isBlack(){
	var isBlack = false;
	var configParam ={"applicationName":"datadefence"};
	UI.control.remoteCall('platform/webapp/config/get', configParam, function(resp) {
		var jsonObj = resp.attrList;
		for(var i=0;i<jsonObj.length;i++){
			if(jsonObj[i].key=="IS_BLACK"&&jsonObj[i].value=="1"){
				isBlack = true;
			}
		}
	});   
	return isBlack;
}