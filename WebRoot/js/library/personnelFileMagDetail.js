var personID = UI.util.getUrlParam('personId');
var queryParams = {},
	sourceData = [],
	sourceDetailData = [];

$(function () {
    UI.control.init();
    initEvent();
    initData();
	initWaterMark();
})

function initEvent(){
	//删除按钮
	$('body').on('click','.btn-trash',function(){
		var $node =  $(this).closest('.list-node-wrap')
		if($node.siblings().length==0){
			UI.util.alert("至少保留一张图片！");
			return;
		}
		var infoId = $node.attr('infoId');
		UI.util.confirm('确认删除当前人脸档案?',function (){
			   UI.util.showLoadingPanel();
	    	   UI.control.remoteCall('face/archives/picDelete',{INFO_ID:infoId},function (resp){
	    		   if (resp.CODE == 0){
		    			setTimeout(function(){
		    				initData();
		    				$('.page-tab li.active').click();
		    				UI.util.alert(resp.MESSAGE);
		    				UI.util.hideLoadingPanel();
		    			},1500);
	    		   }
	    		   else{
	    			   UI.util.alert(resp.MESSAGE,"warn");
	    			   UI.util.hideLoadingPanel();
	    		   }
	    		},function(){},{},true);
	    });
	});


	$('body').on('click','.btn-cover',function () {
		var pic = $(this).attr('pic');
        UI.util.confirm('确认设置此照片为封面吗?',function (){
            UI.util.showLoadingPanel();
            UI.control.remoteCall('face/archives/updateArchivesCover',{PIC:pic,PERSON_ID:personID},function (resp){
                if (resp.CODE == 0){
                	$("#personImg").attr('src',pic);
                    parent.UI.control.getControlById('dispatchedApprovalList').reloadData();
					UI.util.alert(resp.MESSAGE);
					UI.util.hideLoadingPanel();
                }
                else{
                    UI.util.alert(resp.MESSAGE,"warn");
                    UI.util.hideLoadingPanel();
                }
            },function(){},{},true);
		});
    });
	
	//tab切换
	$('.page-tab ul li').click(function(){
		$(this).addClass('active').siblings('li').removeClass('active');
		switchTabType($(this));
		$("#listWrap").html(tmpl("picListTmpl", sourceDetailData));
	})
	
	//返回
	$('#backBtn').click(function(){
		parent.UI.util.hideCommonIframe('.frame-form-full');
	})
}

//初始化个人数据
function initData(){
	UI.control.remoteCall('face/archives/personDetail', {PERSON_ID:personID}, function(resp){
		var data = resp.DATA;
		sourceData = data.PIC_LIST;
		if (data.SEX == '2') {
			data.SEX = '女';
		} else if (data.SEX == '1') {
			data.SEX = '男';
		} else {
			data.SEX = '未知';
		}
		
		$("#listWrap").html(tmpl("picListTmpl", sourceData));
		initPageCount();
		
		var str="";
		$('.detail-info .item > span').each(function(){
			var id =  $(this).attr('id');
			$(this).text(data[id]);
		})
		$('#personImg')[0].src = data.PIC;
		$('#idTypeName').text(switchDocumentType(data['IDENTITY_TYPE']));
		for(i=0;i<data.PERSON_TAG_LIST.length;i++){
			str+='<span>'+data.PERSON_TAG_LIST[i].TAG_NAME+'</span>'
		}
			$('#tagItem').append(str);
		
	});
}

//证件类型转换
function switchDocumentType(type){
	switch(type){
		case 1:
			return "身份证"
			break;
		case 2:
			return "护照"
			break;
		case 3:
			return "驾驶证"
			break;
		case 4:
			return "港澳通行证"
			break;
	}
}

//筛选来源数据
function switchTabType($this){
	
	switch($this.attr('id')){
		case 'tabAll':
			sourceDetailData = sourceData;
			break;
		case 'tabTrain':
			sourceDetailData = switchSoucreData('1')
			break;
		case 'tabLine':
			sourceDetailData = switchSoucreData('2')
			break;
		case 'tabCar':
			sourceDetailData = switchSoucreData('3')
			break;
		case 'tabAccommodation':
			sourceDetailData = switchSoucreData('4')
			break;
		case 'tabWeb':
			sourceDetailData = switchSoucreData('5')
			break;
		case 'tabImmigration':
			sourceDetailData = switchSoucreData('6')
			break;
		case 'tabPolice':
			sourceDetailData = switchSoucreData('7')
			break;
		case 'tabOthers':
			sourceDetailData = switchSoucreData('-1')
			break;
	 }
}

//来源数据筛选
function switchSoucreData(sourceId){
	return	sourceData.filter(function(item){ return item.DATA_SOURCE == sourceId;});
}

//初始化数量数据
function initPageCount(){
	compatibleFilter();
	var tabArry = ['tabAll','tabTrain','tabLine','tabCar','tabAccommodation','tabWeb','tabImmigration','tabPolice','tabOthers']
	$.each(tabArry,function(i,item){
		$('#'+item).find('.count').text('('+switchSoucreData(i).length+')')
		$('#tabAll').find('.count').text('('+sourceData.length+')')
		$('#tabOthers').find('.count').text('('+switchSoucreData('-1').length+')')
	})
}

//兼容ie的filter方法
function compatibleFilter(){
	if (!Array.prototype.filter)
	{
	  Array.prototype.filter = function(fun /*, thisArg */)
	  {
	    "use strict";

	    if (this === void 0 || this === null)
	      throw new TypeError();

	    var t = Object(this);
	    var len = t.length >>> 0;
	    if (typeof fun !== "function")
	      throw new TypeError();

	    var res = [];
	    var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
	    for (var i = 0; i < len; i++)
	    {
	      if (i in t)
	      {
	        var val = t[i];

	        // NOTE: Technically this should Object.defineProperty at
	        //       the next index, as push can be affected by
	        //       properties on Object.prototype and Array.prototype.
	        //       But that method's new, and collisions should be
	        //       rare, so use the more-compatible alternative.
	        if (fun.call(thisArg, val, i, t))
	          res.push(val);
	      }
	    }

	    return res;
	  };
	}
}