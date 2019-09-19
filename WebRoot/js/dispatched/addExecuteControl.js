var org_code = UI.util.getUrlParam("org_code") || '';
var taskId = UI.util.getUrlParam("taskId") || '';
var taskName = UI.util.getUrlParam("taskName") || '';
var score = UI.util.getUrlParam("taskScore") || '';
var communityId = UI.util.getUrlParam("communityId") || '';
var localDB = UI.util.getUrlParam("localDB") || '';
var syncDB = UI.util.getUrlParam("syncDB") || '';
var type = UI.util.getUrlParam("type") || '';

var queryParam={
	org_code:org_code
};
var queryTerminalParam={
	org_code:org_code
}

//提供子页面调用
function addListItem(datas){
	if(datas!=null&&datas.length>0){
		for(var i=0;i<datas.length;i++){
			UI.control.getControlById("localCommunityTerminalList").addItem(datas[i]);
		}
	}
}

/*var orgTreeOpts = {
	isShowFolder: false,
	multiple: false,
	dropdownWidth: '250px',
	dropdownDefault: '区域选择'
};*/

$(function() {
	UI.control.init();
	initEvent();
	/*initTreeEvent();*/
	if(type==="edit"){
		initEditEvent();
	}else{
		UI.control.remoteCall('person/control/getPersonAlarmThresold', {}, 
				function(resp){
			$("#taskScore").val(resp.thresold);	//告警阈值
		});
		
	};
	doSearch();
});



function initEditEvent(){
	if(communityId){
		$("#taskId").val(taskId);
		$("#taskName").val(taskName);
		$("#taskScore").val(score);
		$("#manufacturer").val(communityId);
		$("#leftList").empty();
		UI.control.remoteCall('person/control/lib/local', {taskId:taskId}, 
				function(reply){
			if(reply&&reply["proList"]){
				var data=reply["proList"];
				var item="";
				for(var i = 0; i < data.length; i++) {
					data[i].TITLE = data[i].TITLE == undefined ? data[i].title : data[i].TITLE;
					data[i].VALUE = data[i].VALUE == undefined ? data[i].value : data[i].VALUE;
					item=item+'<li library="lk" title="' + (data[i].title || data[i].TITLE) +  '" sid="' + data[i].SID +  '"><span class="selection-value">' 
					+ (data[i].value || data[i].VALUE) + '</span><span class="selection-type">布控库</span></li>';
					$("#proList li").each(function(){
						if($(this).attr("title")==data[i].TITLE){
							$(this).hide();
						}
					})
				}
				$("#leftList").append(item);
			}
			
		});
		UI.control.remoteCall('person/control/lib/sync', {taskId:taskId}, 
				function(reply){
			if(reply&&reply["SynchronizationList"]){
				var data=reply["SynchronizationList"];
				var item="";
				for(var i = 0; i < data.length; i++) {
					data[i].TITLE = data[i].TITLE == undefined ? data[i].title : data[i].TITLE;
					data[i].VALUE = data[i].VALUE == undefined ? data[i].value : data[i].VALUE;
						item=item+'<li library="tb" title="' + (data[i].title || data[i].TITLE) + '" sid="' + data[i].SID +  '"><span class="selection-value">' 
						+ (data[i].value || data[i].VALUE) + '</span><span class="selection-type">常控库</span></li>';
					$("#SynchronizationList li").each(function(){
						if($(this).attr("title")==data[i].TITLE){
							$(this).hide();
						}
					})
				}
				$("#leftList").append(item);
			}
	});
	}
}
function initEvent(){
	
	//关联警务通
	$("#linkBtn").click(function (e) { 
		var policeNum="";
		var data=UI.control.getControlById("localCommunityTerminalList").data();
		if(data!=null){
			var records=data["localCommunityTerminalList"].records;
			if(records!=null&&records.length>0){
				for(var i=0;i<records.length;i++){
					if(i==0){
						policeNum=records[i]["ZRRJH"];
					}else{
						policeNum=policeNum+","+records[i]["ZRRJH"];
					}
				}
			}
		}
		UI.util.showCommonWindow("/efacecloud/page/dispatched/linkPoliceInquiry.html?policeNum="+policeNum, "警务通关联", 
				800, 540, function(obj){
			addListItem(obj);
		});
	});
	
	//取消关联
	$("#cancelBtn").click(function (i) { 
		$("#localCommunityTerminalList tr.active").each(function(){
			var o={key:"ZRRJH",value:$(this).attr("obj-id")};
			UI.control.getControlById("localCommunityTerminalList").delItem(o,$(this));
		})
		
	});
	$("body").on('click','.del-term',function(event){
		var policeNum = $(this).attr("obj-id");
		var style= $(this).attr("bind-style");
		/*if(style==1){*/
			var o={key:"ZRRJH",value:policeNum};
			UI.control.getControlById("localCommunityTerminalList").delItem(o,$(this).parent().parent().parent().parent());
		/*}else{
			var communityId=$("#manufacturer").val();
			UI.control.remoteCall('efacecloud/localCommunityTerminal/delRelate', {policeNum:policeNum,communityId:communityId}, 
					function(reply){
				UI.util.alert(reply.message);
				doSearch();
			});
		}
		*/
	});
	
	UI.control.remoteCall('person/control/lib/localall', {org_code:org_code}, 
			function(reply){
		$("#proList").empty();
		if(reply&&reply["proList"]){
			var data=reply["proList"];
			var item="";
			for(var i = 0; i < data.length; i++) {
				data[i].TITLE = data[i].TITLE == undefined ? '0' : data[i].TITLE;
				data[i].VALUE = data[i].VALUE == undefined ? '0' : data[i].VALUE;
				item=item+'<li library="lk" title="' + (data[i].title || data[i].TITLE) +  '" sid="' + data[i].SID +  '"><span class="selection-value">' 
				+ (data[i].value || data[i].VALUE) + '</span></li>';
			}
			$("#proList").append(item);
		}
		
	});
	UI.control.remoteCall('person/control/lib/syncall', {org_code:org_code}, 
			function(reply){
		$("#SynchronizationList").empty();
		if(reply&&reply["SynchronizationList"]){
			var data=reply["SynchronizationList"];
			var item="";
			for(var i = 0; i < data.length; i++) {
				data[i].TITLE = data[i].TITLE == undefined ? '0' : data[i].TITLE;
				data[i].VALUE = data[i].VALUE == undefined ? '0' : data[i].VALUE;
				item=item+'<li library="tb" title="' + (data[i].title || data[i].TITLE) + '" sid="' + data[i].SID +  '"><span class="selection-value">' 
				+ (data[i].value || data[i].VALUE) + '</span></li>';
			}
			$("#SynchronizationList").append(item);
		}
		
	});
	
	/*$("#manufacturer").change(function(){
		$("#leftList").empty();
		UI.control.remoteCall('person/control/lib/localall', {org_code:org_code}, 
				function(reply){
			$("#proList").empty();
			if(reply&&reply["proList"]){
				var data=reply["proList"];
				var item="";
				for(var i = 0; i < data.length; i++) {
					data[i].TITLE = data[i].TITLE == undefined ? '0' : data[i].TITLE;
					data[i].VALUE = data[i].VALUE == undefined ? '0' : data[i].VALUE;
					item=item+'<li library="lk" title="' + (data[i].title || data[i].TITLE) +  '" sid="' + data[i].SID +  '">' 
					+ (data[i].value || data[i].VALUE) + '</li>';
				}
				$("#proList").append(item);
			}
			
		});
		UI.control.remoteCall('cs/caseDispatched/lib/syncall', {org_code:org_code}, 
				function(reply){
			$("#SynchronizationList").empty();
			if(reply&&reply["SynchronizationList"]){
				var data=reply["SynchronizationList"];
				var item="";
				for(var i = 0; i < data.length; i++) {
					data[i].TITLE = data[i].TITLE == undefined ? '0' : data[i].TITLE;
					data[i].VALUE = data[i].VALUE == undefined ? '0' : data[i].VALUE;
					item=item+'<li library="tb" title="' + (data[i].title || data[i].TITLE) + '" sid="' + data[i].SID +  '">' 
					+ (data[i].value || data[i].VALUE) + '</li>';
				}
				$("#SynchronizationList").append(item);
			}
			
		});
		UI.control.remoteCall('cs/caseDispatched/lib/local', {communityId:$("#manufacturer").val()}, 
				function(reply){
			if(reply&&reply["proList"]){
				var data=reply["proList"];
				var item="";
				$("#proList li").each(function(){
					$(this).show();
				})
				for(var i = 0; i < data.length; i++) {
					data[i].TITLE = data[i].TITLE == undefined ? '0' : data[i].TITLE;
					data[i].VALUE = data[i].VALUE == undefined ? '0' : data[i].VALUE;
					item=item+'<li library="lk" title="' + (data[i].title || data[i].TITLE) +  '" sid="' + data[i].SID +  '">' 
					+ (data[i].value || data[i].VALUE)
					+ '(临控库)'
					+ '</li>';
					$("#proList li").each(function(){
						if($(this).attr("title")==data[i].title){
						   $(this).hide();
						}
					})
				}
				$("#leftList").append(item);
			}
			
		});
		UI.control.remoteCall('cs/caseDispatched/lib/sync', {communityId:$("#manufacturer").val()}, 
				function(reply){
			if(reply&&reply["SynchronizationList"]){
				var data=reply["SynchronizationList"];
				var item="";
				$("#SynchronizationList li").each(function(){
					$(this).show();
				})
				for(var i = 0; i < data.length; i++) {
					data[i].TITLE = data[i].TITLE == undefined ? '0' : data[i].TITLE;
					data[i].VALUE = data[i].VALUE == undefined ? '0' : data[i].VALUE;
						item=item+'<li library="tb" title="' + (data[i].title || data[i].TITLE) + '" sid="' + data[i].SID +  '">' 
						+ (data[i].value || data[i].VALUE) + '(常控库)</li>';
					$("#SynchronizationList li").each(function(){
						if($(this).attr("title")==data[i].title){
							$(this).hide();
						}
					})
				}
				$("#leftList").append(item);
			}
		});
		doSearch()
	})*/
	
	$("#submitBtn").on("click",function(){
		if (!UI.util.validateForm($('.dataForm'))) {
			return;
		}
		var taskName = $("#taskName").val();
		if(!taskName){
			UI.util.alert("请输入任务名称", "warn");
			return;
		}
		
		var communityId=$("#manufacturer").val();
		if(communityId=="-1"){
			UI.util.alert("请先选择场景", "warn");
			return;
		}
		var taskId = $("#taskId").val();
        var taskScore= $("#taskScore").val();
		var dbId="";
		var sdbId="";
		var policeNum="";
		var dbNameArr=[];
		$('ul[id=leftList] li').each(function(i){
			dbNameArr.push($(this).find(".selection-value").html()+"("+$(this).find(".selection-type").html()+")");
			
			if(i==0){
				dbId=$(this).attr("title");
				sdbId=$(this).attr("sid");
			}else{
				dbId=dbId+","+$(this).attr("title");
				sdbId=sdbId+","+$(this).attr("sid");
			}
		})
		
		if (dbId=="" && sdbId==""){
			UI.util.alert("请选择布控库", "warn");
			return;
		}
		
//		var records=UI.control.getControlById("localCommunityTerminalList").data()["localCommunityTerminalList"].records;
//		if(records!=null&&records.length>0){
//			for(var i=0;i<records.length;i++){
//				if(i==0){
//					policeNum=records[i]["ZRRJH"];
//				}else{
//					policeNum=policeNum+","+records[i]["ZRRJH"];
//				}
//			}
//		}
		
		var url = 'person/control/updateTask';
		
		UI.control.remoteCall(url, {taskId:taskId,taskName:taskName,communityId:communityId,dbId:dbId,sdbId:sdbId,policeNum:policeNum,taskScore:taskScore},
				function(reply){
			UI.util.alert(reply.message);
			//记录操作日志
			parent.doSearch();
		});
	});
	

	$(".btn-close").click(function(){
		parent.hideForm('.frame-form-full');
	})
	
	$('#subMenuTab li').click(function(){
		var $this = $(this);
		var	id = $this.attr('ref');
		$this.addClass('active').siblings().removeClass('active');
		$('.tab-info').addClass('hide');
		$(id).removeClass('hide');
	});
	
	$('body').on('click','.selection-list-box li',function(){
		if($(this).hasClass('active')){
			$(this).removeClass('active');
		}else{
			$(this).addClass('active');
		}
	});
	//移除选中的
	$('body').on('click','#btn-remove-one',function(){
		var relationFrom = $('#leftList'),
			relationToSyn = $('#SynchronizationList'),
			relationToPro = $('#proList'),
			li = relationFrom.find('li'),
			tmpHtml = '',
			lkSelectArr = [],
			tbSelectArr = [];
		$.each(li, function(i, n){
			var flag = $(this).hasClass('active');
			if(flag){	
				var thisli=li.eq(i);
				var thisliHtml = thisli.html();
				thisliHtml = thisliHtml.split("(")[0];
				thisli.html(thisliHtml);
				thisli.find('.selection-type').remove();
				tmpHtml = thisli.removeClass('active').prop("outerHTML");
				if(thisli.attr("library")=="lk"){
					relationToPro.append(tmpHtml);
					lkSelectArr.push(i);	
				}
				if(thisli.attr("library")=="tb"){
					relationToSyn.append(tmpHtml);
					tbSelectArr.push(i);
				}		
			}			  
		});
		
		for(var i=lkSelectArr.length-1; i>-1; i-- ){
			li.eq(lkSelectArr[i]).remove();
		}
		for(var i=tbSelectArr.length-1; i>-1; i-- ){
			li.eq(tbSelectArr[i]).remove();
		}
	});
	//添加选中的
	$('body').on('click','#btn-add-one',function(){
		if ($("#manufacturer").val()=="-1"){
			UI.util.alert("请先选择场景", "warn");
			return;
		}
		
		var relationFromSyn = $('#SynchronizationList'),
			relationFromPro = $('#proList'),
			relationTo = $('#leftList'),
			tmpHtml = '',
			lkSelectArr = [],
			tbSelectArr = [];
		var tbLi = relationFromSyn.find('li');
		var lkLi = relationFromPro.find('li');
		$.each(tbLi, function(i, n){
			var flag = $(this).hasClass('active');
			if(flag){
				var $tbLi = tbLi.eq(i);
				var tbLiHtml = $tbLi.html();
				tbLiHtml += "<span class='selection-type'>布控库</span>";
				$tbLi.html(tbLiHtml);
				tmpHtml +=  $tbLi.removeClass('active').prop("outerHTML");
				lkSelectArr.push(i);				
			}			  
		});
		$.each(lkLi, function(i, n){
			var flag = $(this).hasClass('active');
			if(flag){
				var $lkLi = lkLi.eq(i);
				var lkLiHtml = $lkLi.html();
				lkLiHtml += "<span class='selection-type'>布控库</span>";
				$lkLi.html(lkLiHtml);
				tmpHtml +=  $lkLi.removeClass('active').prop("outerHTML");
				tbSelectArr.push(i);				
			}			  
		});
		
		for(var i=lkSelectArr.length-1; i>-1; i-- ){
			tbLi.eq(lkSelectArr[i]).remove();
		}
		for(var i=tbSelectArr.length-1; i>-1; i-- ){
			lkLi.eq(tbSelectArr[i]).remove();
		}
		relationTo.append(tmpHtml);	
	});
	
	$('body').on('dblclick',"#SynchronizationList li",function(){
		if ($("#manufacturer").val()=="-1"){
			UI.util.alert("请先选择场景", "warn");
			return;
		}
		
		var $this = $(this);
		var liHtml = $this.html();
		
		liHtml += "<span class='selection-type'>布控库</span>";
		$this.html(liHtml);
		var tmpHtml =  $this.removeClass('active').prop("outerHTML");
		
		$this.remove();
		
		$('#leftList').append(tmpHtml);	
	});
	
	$('body').on('dblclick',"#proList li",function(){
		if ($("#manufacturer").val()=="-1"){
			UI.util.alert("请先选择场景", "warn");
			return;
		}
		
		var $this = $(this);
		var liHtml = $this.html();
		
		liHtml += "<span class='selection-type'>布控库</span>";
		$this.html(liHtml);
		var tmpHtml =  $this.removeClass('active').prop("outerHTML");
		
		$this.remove();
		
		$('#leftList').append(tmpHtml);	
	});
	
	$('body').on('dblclick',"#leftList li",function(){
		var $this = $(this),
			relationToSyn = $('#SynchronizationList'),
			relationToPro = $('#proList');
		
		var thisliHtml = $this.html();
		thisliHtml = thisliHtml.split("(")[0];
		$this.html(thisliHtml);
		$this.find('.selection-type').remove();
		var tmpHtml = $this.removeClass('active').prop("outerHTML");
		
		if($this.attr("library")=="lk"){
			$('#proList').append(tmpHtml);
		}
		
		if($this.attr("library")=="tb"){
			$('#SynchronizationList').append(tmpHtml);
		}
		
		$this.remove();
	});
}

function doSearch(){
	 queryTerminalParam.org_code=org_code;
//	 queryTerminalParam.communityId=$("#manufacturer").val();
	 queryTerminalParam.taskId=$("#taskId").val();
	 var pageNo = UI.control.getControlById("localCommunityTerminalList").getCurrentPage();
	 queryTerminalParam.pageNo = pageNo;
	UI.control.getControlById("localCommunityTerminalList").reloadData('', queryTerminalParam);
}

function getDeviceByCommunity(id){
	UI.control.remoteCall("", {id:id}, function(resp){
		var list = resp.list;
		list.join(",");
	});
}

/*function initTreeEvent(){
	var orgTree = UI.control.getControlById("orgTree");
	orgTree.bindEvent("onDropdownSelect", function(node){
		UI.util.debug(node);
		var orgCode = node.GB_ORG_CODE;
		$("#orgCode").val(orgCode);
		doSearch();
	});
	
	//默认选中父节点
	var id = orgTree.getNodes()[0].id;
	orgTree.setDropdownSelectNode(id);
}

function doSearch(){
	queryParams.RegionID = $("#orgCode").val();
	UI.control.getControlById("storeList").reloadData('', queryParams);
}*/

function ReplaceAll(str, sptr, sptr1){
    while (str.indexOf(sptr) >= 0){
       str = str.replace(sptr, sptr1);
    }
    return str;
}
