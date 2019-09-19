/**
 * 案情信息录入
 * @author fenghuixia
 * 2018-03-20
 */
$(function(){
	initEvent();
});

function initEvent(){
	//案情类型切换
	$('[name="CASE_ID_TYPE"]').change(function(){
		var val = $(this).val();
		$(".caseItem").removeClass("hide");
		switch(val){
			case "0"://案件
				$(".caseName").html("案件名称：");
				$(".caseName").next().attr("placeholder","请输入案件名称");
				$(".caseName").next().attr("ui-vtext","案件名称");
				
				$(".caseId").html("案件编号：");
				$(".caseId").next().attr("placeholder","请输入案件编号");
				$(".caseId").next().attr("ui-vtext","案件编号");
				$(".caseId").next().attr("maxlength","23");
				break;
			case "1"://警情
				$(".caseName").html("警情名称：");
				$(".caseName").next().attr("placeholder","请输入警情名称");
				$(".caseName").next().attr("ui-vtext","警情名称");
				
				$(".caseId").html("警情编号：");
				$(".caseId").next().attr("placeholder","请输入警情编号");
				$(".caseId").next().attr("ui-vtext","警情编号");
				$(".caseId").next().attr("maxlength","25");
				break;
			case "2"://其他
				$(".caseItem").addClass("hide");
				break;
		}
	});
	
	//案件事由，其它
	$('[name="CAUSE_TYPE"]').change(function(){
		var val = $(this).val();
		if(val == 3){
			$(".otherReasonItem").removeClass("hide");
		}else{
			$(".otherReasonItem").addClass("hide");
		}
	});	
	
	//确定
	$("#submitBtn").click(function(){
		var val = $('[name="CASE_ID_TYPE"]:checked').val();
		if(val == "2"){
			if (UI.util.validateForm($('.reasonItem'))){
				var data = UI.util.formToBean($('.form-single'));
				data.CASE_ID = "";
				data.CASE_NAME = "";
			}
		}else{
			if (UI.util.validateForm($('.form-single'))){
				var data = UI.util.formToBean($('.form-single'));
				var caseIdType = data.CASE_ID_TYPE;
				var flag = true;
				var caseId = data.CASE_ID;
				var regCase = /^(A)\d{22}$/;
				var regClue = /^(J)\d{24}$/;
				if (caseIdType == 1) {
					if (!regClue.test(caseId)) {
						flag = false;
					}
				} else if (caseIdType == 0) {
					if (!regCase.test(caseId)) {
						flag = false;
					}
				}
				if (!flag) {
					UI.util.alert('请输入正确的案件/警情编号!','warn');
					return false;
				}
			}
		}
		
		UI.control.remoteCall("face/redlist/isChecked",data,function(resp){
			if(resp.CODE == 0){
				parent.UI.util.returnCommonWindow(data);
				parent.UI.util.closeCommonWindow();
			}else{
				UI.util.alert(resp.MESSAGE,"warn");
			}
		},function(){},{},true);
	});
	
	//取消
	$("#cancelBtn").click(function(){
		parent.UI.util.closeCommonWindow();
	});
	
	//搜索历史记录
	$('#searchName,#searchId').click(function(){
		var $this = $(this);
		var listCon = $this.attr("listid");
		var opts = {
				keywords:$this.prev().val(),
				listCon:"#"+listCon
		}
		initDropdownSearch(opts);
	});
	
	//回车事件
	$('[name="CASE_NAME"],[name="CASE_ID"]').keyup(function(e){
		/*if(((e.keyCode || e.which) == 13)) {*/
			var listsearch = $(this).attr("listsearch");
			$("#"+listsearch).click();
		/*}*/
	});
	
	//聚焦事件
	$('[name="CASE_NAME"],[name="CASE_ID"]').click(function(e){
		/*if(((e.keyCode || e.which) == 13)) {*/
		var listsearch = $(this).attr("listsearch");
		$("#"+listsearch).click();
		/*}*/
	});
	
	$("body").on("click",function(){
		$(".form-group").removeClass("open");
	});
	
	//获取历史记录
	$("body").on("click",".list-item",function(){
		var $this = $(this),
			obj = {}/*,
			caseType = $this.parent().attr("id")*/;
		
		obj.CASE_ID = $this.attr("caseid"),
		obj.SEARCH_CAUSE = $this.attr("cause"),
		obj.CASE_NAME = $this.attr('casename');
		UI.util.bindForm($(".form-group"),obj);
		
		/*if(caseType == 'caseNameCon'){
			var opts = {
					KEYWORDS:obj.CASE_NAME,
					listCon:"#caseIdCon"
			}
			initDropdownSearch(opts);
		}*/
		
	});
}

function initDropdownSearch(opts){
	var params = {
		CASE_ID_TYPE:$('[name="CASE_ID_TYPE"]:checked').val(),
		pageNo:1,
		pageSize:10
	};
	var $dropdownWrap = $(opts.listCon).parent().parent();
	if(opts.listCon == '#caseNameCon'){
		params.CASE_NAME = opts.keywords;
	}else{
		params.CASE_ID = opts.keywords;
	}
	UI.control.remoteCall("face/searchTaskHistory/getData",params,function(resp){
		var html = '';
		var data  = resp.data.records;
		
		if(data.length >0){
			if(opts.listCon == '#caseNameCon'){
				$.each(data,function(i,n){
					html += '<li class="list-item" caseid="'+n.CASE_ID+'" title="'+n.CASE_NAME+'" cause="" casename="'+n.CASE_NAME+'">'+n.CASE_NAME+'</li>'
				});
			}else{
				$.each(data,function(i,n){
					html += '<li class="list-item" caseid="'+n.CASE_ID+'" title="'+n.CASE_ID+'" cause="" casename="'+n.CASE_NAME+'">'+n.CASE_ID+'</li>'
				});
			}
			$(opts.listCon).html(html);
			$dropdownWrap.addClass("open");
		}
	},function(){},{},true);
}