var imgSrc = UI.util.getUrlParam('imgSrc')||'';
var searchTextVal = UI.util.getUrlParam('val')||'';
var faceControlParams = {
		pageNo: 1,
		pageSize: 10,
		isAsync: true
}
var faceCollectionParams = {
		pageNo: 1,
		pageSize: 10,
		isAsync: true
}
var feishiParams = {
		IMG_URL:'',
		pageNo: 1,
		pageSize: 10,
		TOP_NUMBER:20,
		ALGORITHM_ID:'111,110,113,112,115,117,118',
		REPOSITORY_ID: '10051,10050,10031,10053,10052,10096,10011,10033,10032,10054,10013,10035,10012,10034,10015,10037,10014,10036,10062,10061,10042,10064,10041,10063,10022,10044,10021,10043,10065,10046,10023,10045,100104,100105'
}

var isPrivate = false;

var time = 60, //60毫秒的间隔  函数节流阀值
	timer = null,
	clickTick = false,
	serviceTickTimes = 0;
var dragSrc = null;
$(function() {
	UI.control.init();
	if(imgSrc){
		$("#filterImg").attr('src',imgSrc)
	}
	if(searchTextVal){
		$('#searchText').val(searchTextVal)
	}
	initFaceAlgoType();
	initEvent();
	topUploadPic();
	// 水印
    initWaterMark();
})

function initEvent(){
	$("body").off("mousedown", ".drag-img-xy").on("mousedown", ".drag-img-xy", function(e){
		// e = e || window.event;
		// var target = e.target || e.srcElement;
		// console.log($(this));
		dragSrc = $(this).attr("src");
	});

	$("body").on("mouseup", function(){
		dragSrc = null;
	});

	$('.compare-img').on('change', '.upload-compare-img', function() {
		var upImgId = $(this).attr('id');
		ajaxFileUpload(upImgId,uploadSuccess)
	})

	$(".photo-tools").off("mouseover").on("mouseover", function(e){
		// e = e || window.event;
		// var target = e.target || e.srcElement;
		// console.log(this);
		if($(this).hasClass("photo-top")){
			photoShowOrHide("t", true, dragSrc);
		}else{
			photoShowOrHide("b", true, dragSrc);
		}
	});

	$("#emptyImg").on("click", function(){
		photoShowOrHide("t", false, "#");
		photoShowOrHide("b", false, "#");
	});

	$("#algoType").on("click", ".algo-item", function(){
		$(this).toggleClass("active");
	});

	$("#oneCompareOne").on("click", function() {
		var params = {};
		params.URL_FROM = $(".photo-tools.photo-top img").attr("src");
		params.URL_TO = $(".photo-tools.photo-bottom img").attr("src");
        var $algoItem = $('.algo-item.active'),
        len = $algoItem.length;
		if (params.URL_FROM.indexOf("http") == -1 || params.URL_TO.indexOf("http") == -1) {
			UI.util.alert("请拖入两张图片进行比对",'warn');
			return;
		}
        if(len == 0){
            UI.util.alert("必须选择一种算法",'warn');
            return;
        }else{
        	params.ALGO_TYPE = $($algoItem[0]).attr("algoid");
        }
		UI.util.showLoadingPanel();
		UI.control.remoteCall('face/technicalTactics/one2one',params,function(resp){	 	
			 if(resp.CODE == "1"){
		    		UI.util.alert("比对失败:" + resp.MESSAGE, "error");	    		
		     }else{
				$(".drap-img-area .percent-num").text(resp.DATA.SIMILARITY+"%");
		    }
		    UI.util.hideLoadingPanel();
	    }, function(data, status, e) {
		 	UI.util.hideLoadingPanel();
		}, {
			async : true
		});	
	});

	$("#twiceCompareTools").click(function(e){
		$(".tool-page-content .img-compare").toggleClass("hide");
		if($(".tool-page-content .img-compare").hasClass("hide")){
			//收起
			$(".tool-page-content .right-panel").css("left", 0);
			// $(".drag-img-xy").css("cursor", "default");
		}else{
			//打开
			$(".tool-page-content .right-panel").css("left", 310);
			// $(".drag-img-xy").css("cursor", "move");
		}
	});

	$(".title-tools .icon-x").click(function(e){
		$("#twiceCompareTools").trigger("click");
	});

	//搜索姓名，身份证查询条回车事件
	$('#searchBtn').click(function(e){
			doSearch();
	});
	$('#searchText').keypress(function(e){
		if(((e.keyCode || e.which) == 13)) {
			doSearch();
		}
	});
	
	// 算法筛选
	$('.arithmeticFilter').on('click', '.tag-item', function() {
		$(this).addClass('active').siblings().removeClass('active');
	});
	
	//确定检索
	$('#confirmSearch').click(function(){
		doSearch();
	})
	
	//布控库详情页面
	$("body").on("click",".detailBtn",function(){
		var PERSON_ID = $(this).attr("PERSON_ID");
        var url = '/efacesurveillance/page/faceControl/dispatchedApproval/controlApplyForm.html?pageType=edit&funcType=1&personId='+PERSON_ID;
        UI.util.showCommonIframe('.frame-form-full', url);
	});
	
	//路人定位
	$("body").on("click",".locationBtn",function(){
		var $this = $(this),
			ref = $this.attr("ref"),
			time = $this.attr('attr-time'),
			addr = $this.attr('attr-addr'),
			imgUrl = $this.attr('fileUrl'),
			longitude = parseFloat($this.attr('LONGITUDE')),
			latitude = parseFloat($this.attr('LATITUDE'));
		if(longitude && longitude && longitude != 0 && longitude !=0){
			var url = ref+'?time='+time+'&addr='+addr+'&imgUrl='+imgUrl+'&longitude='+longitude+'&latitude='+latitude;
			UI.util.showCommonWindow(url, "定位", 
					$(top.window).width()*.95, $(top.window).height()*.9, function(obj){
			});
		}else{
			UI.util.alert("经纬度不合法！", "warn");
		}
	});
	
	//搜索
	$("body").on("click",".searchImgBtn",function(){
		var curImg = $(this).attr('fileUrl');
		$('#uploadImg').val('');
		$("#filterImg").attr('src',curImg);
		doSearch();
	})
	
	//展开收起
	$("body").on("click",".settingDownText",function () {
        var $curParent = $(this).closest('.setting-down-new').prev();
        if($curParent.hasClass('active')) {
            $(this).text('展开此算法');
        }else{
            $(this).text('收起此算法');
        }
        $curParent.toggleClass('active');
    })
    
    $(".pager-wrap").scroll(function(){
		
		if( typeof timer != "number"){
			
			timer = setTimeout(function(){
				var opts = {
						offsetTop:$('.pager-wrap-new').offset().top,
						$anchorSkin:$(".anchor-skin"),
						$curAnchorItem:$(".anchorListBtn.active"),
						$firstAnchorItem:$(".anchorListBtn:first")
				}
				scrolllFun(opts)
				var navOpts = {
					offsetTop:$('.item-list.tilelist').offset().top,
					$curAnchorItem:$(".navItemBtn.active"),
					$firstAnchorItem:$(".navItemBtn:first")
				}
				scrolllFun(navOpts)
				timer = null;
				
			},time);
			
		}
		
	});	
	
	$('body').on("click",".anchorListBtn",function(){
		clickTick = true;
		var $this = $(this),
			curAnchor = $this.find('a').attr('scrollid'),
			curAnchorTop = $(curAnchor).get(0).offsetTop,
			pagerWrapNewTop = $(".pager-wrap-new").get(0).offsetTop,
			anchorBarHeight = $(".anchor-skin-ul").height();
		$this.addClass('active').siblings().removeClass("active");
		$(".pager-wrap").stop().animate({scrollTop: pagerWrapNewTop + curAnchorTop - anchorBarHeight - 10+'px'}, "slow",function(){
			setTimeout(function(){
				clickTick = false;
			},600);
		});
	});
	
	$(".navItemBtn").click(function(){
		clickTick = true;
		var $this = $(this),
			curAnchor = $this.find('a').attr('scrollid'),
			curAnchorTop = $(curAnchor).get(0).offsetTop;
		$this.addClass('active').siblings().removeClass('active');
		$(".pager-wrap").stop().animate({scrollTop: curAnchorTop+'px'}, "slow",function(){
			setTimeout(function(){
				clickTick = false;
			},600);
		});
	})
	
	$(".navTopBtn").click(function(){
		clickTick = true;
		$(this).addClass('active').siblings().removeClass('active');
		$(".pager-wrap").stop().animate({scrollTop: '0px'}, "slow",function(){
			setTimeout(function(){
				clickTick = false;
				$(".navItemBtn:first").addClass('active').siblings().removeClass('active');
			},600);
		});
	})
	
	$("#freshBtn").click(function(){
		//图片检索
	     if($('#filterImg')[0].src.slice(-12)!="noPhoto2.png"){
	    	 var curSrc = $("#filterImg").attr("src");
	    	 feishiParams.IMG_URL = curSrc;
	     }else{
	    	 feishiParams.IMG_URL = '';
	     }
	    feishiParams.THRESHOLD = $('.searchSimilarCon').val();
		feishiService()
	})

	$(".closePageBtn").click(function(){
		parent.closeFaceSearch();
	});

	$('#editImgBtn').on('click',function(){
		var imgUrl = $('#filterImg').attr('src');
		if (imgUrl.slice(-12) != "noPhoto2.png") {  // 已上传图片
			UI.util.showCommonWindow("/efacecloud/page/scan/scan.html?imgUrl="+imgUrl, "编辑图片", 1200, 700,function(data){
				if(data.faceImg !=''){
					if(!data.isCancel){
						$('#filterImg').attr('src',data.scanPic);
					}
					top.screenshotDatas = data;
				}
			},null,null,null,null,null,'false');
		}else{  // 未上传图片
			UI.util.alert("请先上传图片,再编辑", "warn");
		}
	})
}

function uploadSuccess(data) {
	var imgUrl = JSON.parse(data).fastDfsParam.fullUrl;
	var elId = $(this)[0].fileElementId;
	$('#' + elId).siblings('img')
		.removeClass('hide')
		.attr('src', imgUrl);
	$('#' + elId).val('');
	UI.util.hideLoadingPanel();
}

function scrolllFun(opts){
	var offsetTop = opts.offsetTop;
	var $anchorSkin = opts.$anchorSkin;
	
	if( offsetTop < 0 ){
		if(!clickTick){
			var $curAnchorItem = opts.$curAnchorItem,
				curAnchorItemId = $curAnchorItem.find('a').attr('scrollid'),
				prevAnchorItemId= $curAnchorItem.prev().find('a').attr('scrollid'); 
			
			if($(curAnchorItemId).offset().top<0){
				$curAnchorItem.next().addClass('active').siblings().removeClass("active");
			}
			if(prevAnchorItemId && $(prevAnchorItemId).offset().top>=0){
				$curAnchorItem.prev().addClass('active').siblings().removeClass("active");
			}
		}
		if($anchorSkin){
			$anchorSkin.addClass('fixed');
		}
	}else{
		if($anchorSkin){
			$anchorSkin.removeClass('fixed');
		}
		if(!clickTick){
			opts.$firstAnchorItem.addClass('active').siblings().removeClass("active");
		}
	}
}

//初始化检索算法
function initFaceAlgoType(){
	var remoteOpts = {
    		serviceUrl:'face/common/getFaceAlgoType',
    		params:{
    			MENUID:'EFACE_faceDispatchedMain'
    		},
    		noMessage:true,
    		okCallback:function(resp){
	        	var ATHtml = '';
	        	$.each(resp.data, function(index, value) {
	        			ATHtml += '<span class="tag-item" at-type="' + value.ALGORITHM_ID + '">' + value.ALGORITHM_NAME + '</span>'
	        	})
	            $('.arithmeticFilter').append(ATHtml);
	        	doSearch()
	        	$("#algoType").html(tmpl("algoListTemplate", resp.data));
    		}
    }
    remoteCall(remoteOpts);
}

function doSearch(){
	UI.util.showLoadingPanel();
	
	//算法
	 var alogList = [],
	 	$alogs = $("#allATFilter .tag-item"),
	 	$active = $("#allATFilter .tag-item.active"),
	 	number = $(".searchSimilarCon").val();
     if($active.text() == "全部"){
     	$.each($alogs, function(i, el) {
     		if(i != 0){
     			alogList.push({
     				ALGO_TYPE: $(this).attr("at-type"),
     				ALGO_NAME: $(this).text(),
     				THRESHOLD: number
     			});
     		}
     	});
     }else{
        alogList.push({
			ALGO_TYPE: $active.attr("at-type"),
			ALGO_NAME: $active.text(),
			THRESHOLD: number
		});
     }
     faceControlParams.ALGO_LIST = JSON.stringify(alogList);
     faceCollectionParams.ALGO_LIST = JSON.stringify(alogList);
     
     //检索框
     var searchText = $('#searchText').val();
     faceControlParams.KEY_WORDS = searchText;
     faceCollectionParams.KEYWORDS = searchText;
     
     //图片检索
     if($('#filterImg')[0].src.slice(-12)!="noPhoto2.png"){
    	 var curSrc = $("#filterImg").attr("src");
    	 faceControlParams.PIC = curSrc;
    	 faceCollectionParams.PIC = curSrc;
     }else{
    	 faceControlParams.PIC = '';
    	 faceCollectionParams.PIC = '';
     }
	
	faceControlService()
	faceCollectionService()
	$("#feishiList").html('<div class="nodata"></div>');
}

function serviceTick(){
	serviceTickTimes++;
	if(serviceTickTimes == 2){
		serviceTickTimes = 0;
		UI.util.hideLoadingPanel();
	}
}

//布控库
function faceControlService(){
	if(faceControlParams.PIC == ''){
		$("#faceControlList .page-info-metro").removeClass('hide');
		UI.control.getControlById("faceControlList").reloadData(null, faceControlParams);
	}else{
		faceControlParams.id = 'data';
		var remoteOpts = {
	    		serviceUrl:'face/dispatchedPerson/getData',
	    		params:faceControlParams,
	    		okCallback:function(resp){
	    			var sortSimilarArr = [];//相似度排序数据
	    			var sortAlgorithmObj = resp.data?resp.data.LIST:resp.dispatchedApprovalList.LIST;
	    			for(var j = 0;j<sortAlgorithmObj.length;j++){
	            		for(key in sortAlgorithmObj[j]){
	            			if(key == 'ALGORITHM_LIST'){
	            				$.each(sortAlgorithmObj[j][key],function(i,n){
	            					//相似度排序
	            					if(sortSimilarArr.length == 0){
	            						sortSimilarArr.unshift(n);
	            					}else{
	            						$.each(sortSimilarArr,function(index,listCon){
	            							if(compareScore(n.SCORE,listCon.SCORE)){
	            								sortSimilarArr.splice(index,0,n);
	            								return false;
	            							} if((sortSimilarArr.length-1) == index){
	            								sortSimilarArr.push(n);
	            							}
	            						});
	            					}
	            				});
	            			}
	            		}
	        		}
	    			$("#faceControlList .page-info-metro").addClass('hide');
	    			$("#faceControlList .list-node-wrap").remove();
	    			var html = '';
	    			$.each(sortSimilarArr,function(i,n){
	    				html += tmpl("faceControlListTmpl",n)
	    			})
	    			if(html == ''){
	    				if($("#faceControlList .item-con .nodata").length == 0){
	    					html = '<div class="nodata"></div>'
    						$("#faceControlList .item-con").append(html);
	    				}
	    			}else{
	    				$("#faceControlList .item-con").append(html);
	    			}
	    			serviceTick()
	    		}
	    }
	    remoteCall(remoteOpts);
	}
}

//相似度比较大小
function compareScore(firstScore,secondScore){
	var d1 = parseInt(firstScore);
	var d2 = parseInt(secondScore);
	
	if(firstScore!=""&&secondScore!=""&&d1 >=d2){
		 //firstScore > secondScore
		 return true;  
	 }else{
		 return false;
	 }
}

//路人检索
function faceCollectionService(){
	if(!faceCollectionParams.BEGIN_TIME){
		var dateTime = UI.util.getDateTime("nearMonth",'yyyy-MM-dd HH:mm:ss');
		faceCollectionParams.BEGIN_TIME = dateTime.bT;
		faceCollectionParams.END_TIME = dateTime.eT;
	}
	if(faceCollectionParams.PIC == ''){
		$("#imgSearch").removeClass('active').siblings().addClass('active');
		/*$("#faceCollectionList .page-info-metro").removeClass('hide');
		UI.control.getControlById("faceCollectionList").reloadData(null, faceCollectionParams);*/
	}else{
		faceCollectionParams.id = 'data';
		var remoteOpts = {
	    		serviceUrl:'face/capture/query',
	    		params:faceCollectionParams,
	    		okCallback:function(resp){
	    			var list = resp.data.LIST;
	    			if(list.length == 0){
	    				$("#imgSearch .item-con").html('<div class="nodata"></div>');
	    			}else{
	    				$("#imgSearch .item-con").html(tmpl('ALGfaceTemplate',list));
	    			}
	    			$("#imgSearch").addClass('active').siblings().removeClass('active');
	    			$("#faceCollectionList .page-info-metro").addClass('hide');
	    			serviceTick()
	    		}
	    }
	    remoteCall(remoteOpts);
	}
}

//飞识结果
function feishiService(){
	if(feishiParams.IMG_URL != ''){
		UI.util.showLoadingPanel();
		feishiParams.id = 'data';
		var remoteOpts = {
	    		serviceUrl:'face/technicalTactics/faceSearch',
	    		params:feishiParams,
	    		okCallback:function(resp){
	                var arr2=[];
	                for(var key in resp.DATA) {
	                    arr2.push(key);
	                }

	                var arr = [];
	                for(var i=0;i<arr2.length;i++) {
	                    arr.push({name:arr2[i],data:resp.DATA[arr2[i]],length:resp.DATA[arr2[i]].length});
	                }
	                var anchorListArr = [];
	                $.each(arr, function(i, o) {
	                    anchorListArr.push({
	                        name: CONSTANTS.SF[o.name]?CONSTANTS.SF[o.name]:'未知算法',
	                        id: '#anchor' + o.name
	                    })
	                })
	                var anchorHtml = tmpl("anchorTemplate", anchorListArr);
	                $('#feishiList').html(tmpl("personListTemplate", arr)).prepend(anchorHtml);
                	UI.util.hideLoadingPanel();
	    		}
	    }
	    remoteCall(remoteOpts);
	}else{
		UI.util.alert('飞识比对需要检索图片！','warn');
	}
}

function remoteCall(opts){
	UI.control.remoteCall(opts.serviceUrl,opts.params,function(resp){
		if(resp.CODE == 0 || (resp.data && (resp.data.length>0 || resp.data.LIST))){
			if(opts.okCallback){
				opts.okCallback(resp)
			}
		}else{
			if(opts.warnCallback){
				opts.warnCallback(resp)
			}
			UI.util.alert(resp.MESSAGE,"warn");
		}
	},function(){},opts.confOpts?opts.confOpts:{},true);
}

function photoShowOrHide(where, flag, src){
	if(!src)return;
	var $img;
	switch(where) {
		case "t":
			$img = $("#compareTopPhoto");
			TIMG = src;
			break;
		case "b":
			$img = $("#compareBottomPhoto");
			break;
	}
	if(flag){
		$img.removeClass("hide").siblings("div").addClass("hide");
	}else{
		$img.addClass("hide").siblings("div").removeClass("hide");
	}
	$img.attr("src", src);
	dragSrc = null;
}

function afterUploadImg(src){
	photoShowOrHide("t", true, src);
}