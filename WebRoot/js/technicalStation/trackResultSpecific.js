
var TASK_ID = UI.util.getUrlParam("TASK_ID") || '',
    searchParam = {
        BEGIN_TIME: '',
        END_TIME: '',
        PIC: '',
        THRESHOLD: '',
        TOP_N: '',
        DEVICE_IDS: '',
        DEVICE_IDS_INT: ''
    };

$(function (){

    initPage();
    initEvent();
});

function initPage () {

    if(!parent.cachedData.noBackBtn){
        $(".form-con.form-silde").css('top','46px');
        $(".page-list-head").show();
    }
	queryTaskDetail();
	
	//  渲染该任务下人员列表
    renderPersonList();
}

function initEvent () {

    $('body').on('click', '.personUnit', function () {

		$(this).addClass('active').siblings().removeClass('active');

        searchParam.PIC = $(this).attr("PIC");

        formSearch();
	});

	//	一人一档点击跳转路人库以图搜图
	$('body').on('click', '.searchByImage', function() {
		openWindowPopup('faceCapture', $(this).attr('imgSrc'));
		return false;
	});

	//  一人一档详情
	$('body').on('click', '.similar-name a,.btn-more', function(event) {
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
		return false;
	});
	//  跳转一人一档检索
	$('body').on('click', '.btn-search', function() {

		var imgUrL = $(this).closest('.list-node').find('img')[0].src;
		openWindowPopup('faceStore', imgUrL);
		return false;
	});
}

function renderPersonList () {

    UI.control.remoteCall('technicalTactics/task/queryTrackResult', {TASK_ID: TASK_ID}, function (resp) {
		
		if(resp.CODE === 0) {

			$('#person').html(tmpl('personTmpl', resp.DATA));
			$('.resultNum').html(resp.DATA.length);

			renderMoreTags();

			$('.personUnit').eq(0).trigger('click');

		}else{
			UI.util.alert(resp.MESSAGE, 'warn');
		}

    }, function (error){ console.log(error) }, '', true);
}

//  由于这里轨迹分析所需的参数来源于任务创建时所填的参数，故而这里先将所需的任务详情参数查询出来。

function queryTaskDetail () {

    UI.control.remoteCall('technicalTactics/task/detail', {TASK_ID: TASK_ID}, function (resp) {
    
        if(resp.CODE === 0) {

			searchParam = resp.DATA[0];

        }else{

            UI.util.alert('任务参数查询失败', 'warn');
		}
		
    }, function (error){ console.log(error) }, '');
}

function formSearch(){

	parent.UI.map.clearDraw();//清除地图框选
	
	parent.cachedData.deviceIdInt = searchParam.DEVICE_IDS_INT;
	parent.cachedData.deviceIds = searchParam.DEVICE_IDS;
	
	parent.rightMainFrameIn('/efacecloud/page/technicalStation/trackResultList4.0.html?fileId='
			+ searchParam.PIC + '&beginTime=' + searchParam.BEGIN_TIME + '&endTime='+ searchParam.END_TIME+ '&number='+ searchParam.TOP_N  
			+ '&threshold='+searchParam.THRESHOLD);
}

function renderMoreTags(){
	var tagLine = $('.tagLine');
	for(var i=0; i<tagLine.length; i++){
		if(parseInt(tagLine.eq(i).height())> 30){
			tagLine.eq(i).parents('.tags').eq(0).find('.more').removeClass('hide');
		}else{
			tagLine.eq(i).parents('.tags').eq(0).find('.more').addClass('hide');
		}
	}
}


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