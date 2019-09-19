/**
 * 成效统计墙
 * @author lilu
 * 2018-08-08
 */
var timeOption = {//所有告警列表时间控件
		'elem': $('#timeTagList'),
		'beginTime': $('#beginTime'),
		'endTime': $('#endTime'),
		'callback':doSearchList
};

//告警地点：组织架构，单选
var orgTreeOpts = {
		multiple: false
}

var addressTreeOpts={
		
}

var queryParamsList={
		CASE_TYPE: '',
		BEGIN_TIME: UI.util.getDateTime("thisMonth", "yyyy-MM-dd HH:mm:ss").bT,
		END_TIME: UI.util.getDateTime("thisMonth", "yyyy-MM-dd HH:mm:ss").eT,
		ALARM_LEVEL:'',
		ORG_CODE:'',
		REGION_NAME:'',
		isAsync: true
}

$(function(){
	UI.control.init();
	initEvent();
	initDateTimeControl(timeOption);
	initTree();
	$("[time-control='by']").trigger("click");
});


function initTree(){
	var structureTree = UI.control.getControlById("orgTree");
	structureTree.bindEvent("onClick", function(event, treeId, treeNode){
		$('#orgCode').val(treeNode.DEPT_CODE);
		queryParamsList.ORG_CODE = treeNode.DEPT_CODE;
		doSearchList();
	});
	
	var addressTree = UI.control.getControlById("addressOrgTree");
	addressTree.bindEvent("onClick", function(event, treeId, treeNode){
		$('#addressOrgCode').val(treeNode.text);
		queryParamsList.REGION_NAME = treeNode.text;
		doSearchList();
	});
}

function initEvent(){
	
	//清除条件
	$("#cancelCondition").on("click",function(){
		$(".searchConAll").val('');
		$('#orgCode').val('');
		$('#addressOrgCode').val('');
		$("#colorTagsAll .tag-item").addClass("active").siblings().removeClass("active");
		queryParamsList.ORG_CODE = '';
		queryParamsList.REGION_NAME = '';
		queryParamsList.ALARM_LEVEL = '';
		$(".tree-title").html('').attr("title",'');
		$("[time-control='by']").trigger("click");
	});
	
	$('.searchBarBtn').click(function(){
		doSearchList();
	});
	$('.searchUserBtn').click(function(){
		doSearchList();
	});
	$('.searchConAll').keypress(function(e) {
		if(((e.keyCode || e.which) == 13)) {
			doSearchList();
		}
	});
	//告警等级
	$("#colorTagsAll li").click(function(){
		var $this = $(this);
		var curVal = $this.parent().attr("curval");
		if(curVal){
			var valArr = curVal.split(",");
		}else{
			var valArr = [];
		}
		if($this.hasClass("tag-item")){
			$this.addClass('active').siblings().removeClass('active');
			valArr = [];
		}else{
			$this.parent().find(".tag-item").removeClass("active");
			var val = $this.attr("val");
			if($this.hasClass("active")){
				$this.removeClass("active");
				var index = valArr.indexOf(val);
				if(index >=0){
					valArr.splice(index,1);
				}
			}else{
				$this.addClass("active");
				valArr.push(val);
			}
		}
		queryParamsList.ALARM_LEVEL = valArr.join(",");
		$this.parent().attr("curval",valArr.join(","));
		doSearchList();
	});
	//点击详情事件
	$('body').on('click', '.detailBtnAll', function() {
		var $this = $(this),
			ALARM_ID = $this.attr('ALARM_ID'),
			level = $this.attr("alarm-level"),
			OBJECT_ID = $this.attr("objid"),
			isfs = $this.attr("isfs"),
			alarmTime = $this.attr("alarmtime"),
			curTime = $this.attr("curtime"),
			imgUrl = $this.parents(".list-node").find(".compare-img img").eq(0).attr("src");
		if(isfs == '1'){
			var name = $this.attr("name"),
			idCard = $this.attr("idcard"),
			time = $this.attr("time");
			
			UI.util.showCommonWindow('/efacecloud/page/library/alarmDetails.html?OBJECT_ID='+OBJECT_ID+'&curTime='+curTime+'&isFly=1&ALARM_ID=' + ALARM_ID + '&level=' + level
					+ '&name=' + name+ '&idCard=' + idCard+ '&time=' + time +'&alarmTime='+alarmTime+'&imgUrl='+imgUrl, "告警详情",
				1180, 666,
				function(obj) {});
		}else{
			UI.util.showCommonWindow('/efacecloud/page/library/alarmDetails.html?OBJECT_ID='+OBJECT_ID+'&curTime='+curTime+'&ALARM_ID=' + ALARM_ID + '&level=' + level +'&alarmTime='+alarmTime+'&imgUrl='+imgUrl, "告警详情",
					1180, 579,
					function(obj) {});
		}
	});
	
	//布控详情
	$('body').on('click', '.controlDetailBtn', function() {
		var objId = $(this).attr("objectid");
		var opts = {
				src: '/efacesurveillance/page/faceControl/dispatchedApproval/controlApplyForm.html?pageTitle=布控详情&pageType=detail&funcType=6&objectId='+objId+'&noFooter='+true,
				title: '布控详情',
				width:$(top.window).width()*.95,
				height: $(top.window).height()*.9
		}
		parent.UI.util.openCommonWindow(opts);
	});
}


function doSearchList() {
	if(UI.util.validateForm($('#thresholdValidateAll'))) {
		queryParamsList.pageNo = 1;
		queryParamsList.CASE_TYPE = $('.searchConAll').val();
		queryParamsList.USER_CODE = $('.searchUser').val();
		queryParamsList.BEGIN_TIME = $('#beginTime').val();
		queryParamsList.END_TIME = $('#endTime').val();
		if(queryParamsList) {
			UI.control.getControlById("tabList").reloadData(null, queryParamsList);
		}
	}

}