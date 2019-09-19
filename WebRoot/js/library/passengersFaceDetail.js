var personID = UI.util.getUrlParam('personId');
var sourceId = UI.util.getUrlParam('sourceId');
var queryParams = {},
	sourceData = [],
	sourceDetailData = [];

$(function () {
    UI.control.init();
    initData();
    initEvent();
})
function initEvent() {
    //返回
    $('#backBtn').click(function(){
        parent.UI.util.hideCommonIframe('.frame-form-full');
    })
}

//初始化个人数据
function initData(){
	UI.control.remoteCall('face/traveler/detail', {CCODE:personID,SOURCE:sourceId}, function(resp){
        if(resp.CODE==0) {
            var data = resp.TRAVELER_INFO;
            // sourceData = data.PIC_LIST;
            if (data.SEX == '2') {
            data.SEX = '女';
            } else if (data.SEX == '1') {
            data.SEX = '男';
            } else {
            data.SEX = '未知';
            }

            // $("#listWrap").html(tmpl("picListTmpl", sourceData));
            // initPageCount();

            // var str="";
            $('.detail-info .item > span').each(function(){
                var id =  $(this).attr('id');
                $(this).text(data[id]);
            })
            if(data.URL!=""&& typeof data.URL !="undefined") {
                $('#personImg')[0].src = data.URL;
                // $('#personImg')[0].src="/ui/plugins/eapui/img/nophoto.jpg"
            } else {
                $('#personImg')[0].src="/ui/plugins/eapui/img/nophoto.jpg"
            }
            // $('#personImg')[0].src = data.URL;
            // $('#idTypeName').text(switchDocumentType(data['IDENTITY_TYPE']));
            // for(i=0;i<data.PERSON_TAG_LIST.length;i++){
            //     str+='<span>'+data.PERSON_TAG_LIST[i].TAG_NAME+'</span>'
            // }
            // $('#tagItem').append(str);
        } else if(resp.CODE==1) {
            UI.util.alert(resp.MESSAGE,'warn')
        }
		
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

// //初始化数量数据
// function initPageCount(){
// 	compatibleFilter();
// 	var tabArry = ['tabAll','tabTrain','tabLine','tabCar','tabAccommodation','tabWeb','tabImmigration','tabPolice','tabOthers']
// 	$.each(tabArry,function(i,item){
// 		$('#'+item).find('.count').text('('+switchSoucreData(i).length+')')
// 		$('#tabAll').find('.count').text('('+sourceData.length+')')
// 		$('#tabOthers').find('.count').text('('+switchSoucreData('-1').length+')')
// 	})
// }

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