var recordId = parent.recordId;
var togetherMinute = parent.togetherMinute;
var threshold = parent.gangsThreshold;
var faceScore = parent.faceScore;
var infoIds = parent.infoIds;
$(function() {
	initEvent();
	gangsAnalysis();
	initWaterMark();
});

var isload = false;
function initEvent(){
	  //轨迹分析
    $("body").on("click",".trajectory-search",function(){
        openWindowPopup('track',$(this).attr("url"));
    });
    //身份核查
    $("body").on("click",".verification-search",function(){
        openWindowPopup('identity',$(this).attr("url"));
    });
	//选项卡
    $('.switch > li').click(function(){
	   	 var ref = $(this).find('a').attr('ref');
	   	 $(this).addClass('active').siblings().removeClass('active');
	   	 $('.people-list').addClass('hide');
	   	 $(ref).removeClass('hide');
	   	 if(!isload && ref=="#time"){
	   		isload = true;
	   		$("#time").html(tmpl('resultDateTmpl', coincideDateGroup(coincideDateGroupData)));
	   	 }
    });
    $('#backBtn').click(function(){
    	parent.hideForm();
   });
    
   //同行分析结果-生成轨迹
	$('#trajectoryGeneBtn').click(function(){
		parent.parent.window.frames['mainFrameContent'].showForm('/efacecloud/page/technicalStation/personGangsFrequencyList.html');
		top.rightMainFrameOut('hide');
	});

	if(top.GET_TASK_LIST_DATA) $('#backBtn').addClass("hide");
}

function coincideTimesGroup(ret) {
	ret.sort(function(a,b){
		return parseInt(b.REPEATS) - parseInt(a.REPEATS);
	});
	
	var m = new Map();
	for (var i=0; i<ret.length; i++) {
		var o = ret[i];
		var objArr=[];
		if(m.get(o.REPEATS)){
			m.get(o.REPEATS).push(ret[i]);
		} else {
			objArr.push(ret[i]);
			m.put(o.REPEATS, objArr);
		}
	}

	return m.values();
}

function coincideDateGroup(ret) {
	if( ret && ret.length == 0 ){
		UI.util.debug("团伙分析数据为空");
		return ;
	}
	var m = new Map();
	for (var i=0; i<ret.length; i++) {
		var o = ret[i];
		var timeSplit = o.TIMES.split(',');
		var addrSplit = o.ADDRS.split(',');
		var picSplit = o.PICS.split(',');
		var bigPicSplit = o.BIG_PIC.split(',');
		var namesSplit = o.NAMES.split(',');
		for (var j = 0; j < timeSplit.length; j++) {
			var objArr=[];
			var _obj = {};
			_obj.time = timeSplit[j];
			_obj.addr = addrSplit[j];
			_obj.pic = picSplit[j];
			_obj.name = namesSplit[j];
			_obj.BIG_PIC = bigPicSplit[j];
			if(timeSplit[j]=='-'){
				continue;
			}
			var date = timeSplit[j].split(' ')[0];
			if(m.get(date)){
				m.get(date).push(_obj);
			} else {
				objArr.push(_obj);
				m.put(date, objArr);
			}
		}
	}
	
	var keys = m.keys();
	keys.sort(function(a,b){
		return toDayLong(b) - toDayLong(a);
	});
	
	var arrValues=[];
	for (var k = 0; k < keys.length; k++) {
		arrValues.push(m.get(keys[k]));
	}

	return coincideDeviceGroup(arrValues);
}

function toDayLong(day){
	var day_split = day.split("-");
	return parseInt(day_split[0] + day_split[1] + day_split[2]);
}

function coincideDeviceGroup(list){
	var obj = {};
	for (var i = 0; i < list.length; i++) {
		var m = new Map();
		for (var j = 0; j < list[i].length; j++) {
			var objArr=[];
			if(m.get(list[i][j].addr)){
				m.get(list[i][j].addr).push(list[i][j]);
			} else {
				objArr.push(list[i][j]);
				m.put(list[i][j].addr, objArr);
			}
		}
		for(var k = 0; k < m.keys().length; k++){  //时间排序
			m.get(m.keys()[k]).sort(function(a,b){
				return new Date(b.time.replace(/-/g,'/')) - new Date(a.time.replace(/-/g,'/'));
			});
		}
		obj[i] = m.values();
	}
	
	return obj;
}

function renderDate(time, type)
{
	var timeSplit = time.split(' ')[0].replace('-','');
	if(type == 'year'){
		return timeSplit.substring(0,4);
	}
	return timeSplit.substring(4).replace('-','-');
}

var timesGroupData,coincideDateGroupData;
function gangsAnalysis(){
	if(top.GET_TASK_LIST_DATA){
		var resp = top.GET_TASK_LIST_DATA.data;
		dealWithListData(resp);
		delete top.GET_TASK_LIST_DATA;		
	}else{
		if (recordId) {
			UI.util.showLoadingPanel('');
			UI.control.remoteCall('technicalTactics/personFollow/togetherAnalysis', {
				RECORD_IDS: recordId,
				TOGETHER_MINUTE:togetherMinute,
				THRESHOLD:threshold,
				FACE_SCORE:faceScore,
				INFO_IDS:infoIds,
				ONECOMPARE_PARAM: JSON.stringify(top.SAVE_LEFT_PARAM_DATA)
			}, function(resp) {
				if(resp.IS_ASYNC == 1){
					UI.util.hideLoadingPanel();
					UI.util.alert("异步查询, " + resp.MESSAGE + " , 即将打开任务列表");
					setTimeout(() => {
						var url = window.location.origin + '/portal/page/datadefenceMenu.html#tasklist';
						window.open(url, '_blank');
					}, 800);
				}else{
					dealWithListData(resp);
				}
			}, function(data, status, e) {
				UI.util.hideLoadingPanel();
			}, {
				async : true
			});
		}
	}
}

function dealWithListData(resp){
	if(resp.DATA.length>0){
		timesGroupData = coincideTimesGroup(resp.DATA);
		coincideDateGroupData = resp.DATA;
		$("#frequency").html(tmpl('resultTmpl', timesGroupData));
		$("[attrimg='zoom']").lazyload({
			threshold : 200,
			container: $(".pager-container")
		});
	}else{
		UI.util.alert("查询结果为空",'warn');
	}
	UI.util.hideLoadingPanel();
}

function renderForRecord(index){
	if(index == 0){
		return 'hide';
	}
}