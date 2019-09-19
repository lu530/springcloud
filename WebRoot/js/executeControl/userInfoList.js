var treeService = UI.util.getUrlParam("treeService")||'user/dept/getTree';//获取树服务
var listService = UI.util.getUrlParam("listService")||'user/sysDept/queryDeptUser';//获取列表服务
var searchService = UI.util.getUrlParam("searchService")||'user/sysDept/searchDeptUser';//获取查询服务
var dataObj = UI.util.getUrlParam("dataObj")||'';//获取回填数据
if(dataObj!=''){
	dataObj = JSON.parse(dataObj);
}
var orgTreeOpts = {
	multiple: true,
	service:treeService,
	leafService: function(userNode){//延迟加载
		var deptCode = userNode.DEPT_CODE;
		return listService+'?id=result&DEPT_CODE='+deptCode;
	}, 
	leafNodeRender: treeNodeRender
};
var noCheckedArr = [];//存储未回填的id
var userCodeArr = dataObj!=''?(dataObj.userCodeArr?dataObj.userCodeArr:[]):[];
var userNameArr = dataObj!=''?(dataObj.userNameArr?dataObj.userNameArr:[]):[];
var deptCodeArr = dataObj!=''?(dataObj.deptCodeArr?dataObj.deptCodeArr:[]):[];
var orgTree = null;
var curSelectNode = null;

$(function() {
	UI.control.init();
	compatibleIndexOf();
	initEvent();
	initSearch();
	initTree();
	initSelectedList();
});

function initEvent(){
	
	$("body").on("click","#searchList li",function(e){
		addSelectedUser(null,$(this));
		e.stopPropagation();
	});
	
	//保存
	$("#saveBtn").click(function(){
		if(userCodeArr.length==0){
			UI.util.alert("请选择数据","warn");
		}else{
			var userData = {
					userCode:userCodeArr.join(","),
					userName:userNameArr.join(","),
					deptCode:deptCodeArr.join(",")
			}
			parent.UI.util.returnCommonWindow(userData);
			parent.UI.util.closeCommonWindow();
		}
	});
	
	//取消
	$("#cancelBtn").click(function(){
		parent.UI.util.closeCommonWindow();
	});
	
	//右移添加
	$("#addDataBtn").click(function(){		
		if(curSelectNode && $("#structureTreeWrap").hasClass("active")){
			addSelectedUser(curSelectNode);
			curSelectNode = null;
		}else{
			if($("#searchList li.active").length>0){
				addSelectedUser(null,$("#searchList li.active"));
			}
		}
	});
	
	//右侧列表删除单个
	$("body").on("click",".closeBtn",function(){
		var $li = $(this).parent();
		removeSelectedUser($li);
	});
	
	//左移删除
	$("#removeDataBtn").click(function(){
		if($("#selectedList li.active").length>0){
			removeSelectedUser($("#selectedList li.active"));
		}
	});
	
	$("body").on("click",'#selectedList li,#searchList li',function(){
		$(this).addClass("active").siblings().removeClass("active");
	});
}

//删除选中了的列表
function removeSelectedUser($li){
	var userCode = $li.attr("usercode");
	var index = userCodeArr.indexOf(userCode);
	var node = orgTree.getNodeByParam('USER_CODE',userCode);//获取拥有属性值等于某值的树节点
	var deptCode = $li.attr("deptcode");
	var flag = true;
	
	userCodeArr.splice(index, 1);
	userNameArr.splice(index, 1);
	deptCodeArr.splice(index, 1);
	$li.remove();
	$("#totalNum").html(userCodeArr.length);
	$.each($("#selectedList li"),function(i,n){
		var curDeptCode = $(n).attr("deptcode");
		var index = curDeptCode.indexOf(deptCode);
		if(index == 0){
			flag = false;
			return false;
		}
	});
	if($("#selectedList li[deptcode='"+deptCode+"']").length == 0 && flag){
		node = orgTree.getNodeByParam('DEPT_CODE',deptCode);//获取拥有属性值等于某值的树节点
	}
	if(node){
		orgTree.checkNode(node,false,true);
	}
}

//添加右侧设备
function addSelectedUser(userNode,$li,opts){
	if(userNode){
		var userCode = userNode.USER_CODE;
		var deptCode = userNode.DEPT_CODE;
		if(userCode){
			var node = orgTree.getNodeByParam('USER_CODE',userCode);//获取拥有属性值等于某值的树节点
			var userName = userNode.USER_NAME;
		}else{
			UI.control.remoteCall(listService, {DEPT_CODE:deptCode,SEARCH_CHILD:true}, function(resp){
				$.each(resp.data,function(i,n){
					addSelectedUser(null,null,n);
				})
			});
			return false;
		}
		
	}else if($li){
		var userCode = $li.attr('usercode');
		var node = orgTree.getNodeByParam('USER_CODE',userCode);//获取拥有属性值等于某值的树节点
		var userName = $li.attr('username');
		var deptCode = $li.attr('deptcode');
	}else{
		var userCode = opts.USER_CODE;
		var node = orgTree.getNodeByParam('USER_CODE',userCode);//获取拥有属性值等于某值的树节点
		var userName = opts.USER_NAME;
		var deptCode = opts.DEPT_CODE;
	}
	var index = userCodeArr.indexOf(userCode);
	
	if(userCode && index<0){
		userCodeArr.push(userCode);
		userNameArr.push(userName);
		deptCodeArr.push(deptCode);
		if(node){
			orgTree.checkNode(node,true,true);
		}else{
			noCheckedArr.push(userCode);
		}
		html = "<li deptcode='"+deptCode+"' usercode='"+userCode+"' username='"+userName+"' title='"+userName+"'>"+userName+"("+userCode+")<span class='closeBtn delete-btn'>×</span></li>";
		$("#selectedList").append(html);
		$("#totalNum").html(userCodeArr.length);
	}else{
		if(userCode){
			//UI.util.alert("已添加人员",'warn');
		}else{
			UI.control.remoteCall(searchService, {KEYWORD:'', APPROVE_TYPE: approveType}, function(resp){
				$.each(resp.data,function(i,n){
					addSelectedUser(null,null,n);
				})
			});
		}
	}
}

//插入设备到列表
function treeNodeRender(node){
	//<span class="icon-video001"></span>
	return $.extend({
		text: '<span class="tree-con" usercode="'+node.USER_CODE+'" title="'+node.USER_NAME+'" ><span class="icon-user2 mr5"></span><span class="text-overflow" style="max-width: 350px;">' + node.USER_NAME+'(' +node.USER_CODE +')</span></span>',
		id: node.DEVICE_ID
	}, node);
}

function initSelectedList(){
	/*UI.control.remoteCall('face/dispatchedLib/getAuthUserByLibId',{DB_ID:dbId},function(resp){
		if(resp.CODE == 0){
			var html = '';
			$.each(resp.DATA,function(i,n){
				html += "<li deptcode='"+n.DEPT_CODE+"' usercode='"+n.USER_CODE+"' username='"+n.USER_NAME+"' title='"+n.USER_NAME+"'>"+n.USER_NAME+"("+n.USER_CODE+")<span class='closeBtn delete-btn'>×</span></li>";
				userCodeArr.push(n.USER_CODE);
				userNameArr.push(n.USER_NAME);
				var node = orgTree.getNodeByParam('USER_CODE',n.USER_CODE);//获取拥有属性值等于某值的树节点
				if(node){
					orgTree.checkNode(node,true,true);
				}else{
					noCheckedArr.push(n.USER_CODE);
				}
			});
			$("#selectedList").append(html);
			$("#totalNum").html(userCodeArr.length);
		}else{
			UI.util.alert(resp.MESSAGE,"warn");
		}
	});*/
	
	if(dataObj != ''){
		if(dataObj.userCodeArr){
			var html = ''
			$.each(dataObj.userCodeArr,function(i,n){
				html += "<li deptcode='"+deptCodeArr[i]+"' usercode='"+n+"' username='"+userNameArr[i]+"' title='"+userNameArr[i]+"'>"+userNameArr[i]+"("+n+")<span class='closeBtn delete-btn'>×</span></li>";
				var node = orgTree.getNodeByParam('USER_CODE',n);//获取拥有属性值等于某值的树节点
				if(node){
					orgTree.checkNode(node,true,true);
				}else{
					noCheckedArr.push(n);
				}
			});
			$("#selectedList").append(html);
			$("#totalNum").html(userCodeArr.length);
		}
	}
}

//初始化下拉选择框
function initTree(){
	//移除设备CheckBox
	$("#structureTree [deviceid]").parent().siblings('[treenode_check]').css("visibility","hidden");
	
    orgTree = UI.control.getControlById('structureTree');
    
    orgTree.bindEvent('onClick', function(event, treeId, userNode) {
    	if(userNode && userNode.USER_CODE){
    		addSelectedUser(userNode);
    	}
    });
    
    orgTree.bindEvent('onCheck', function(event, treeId, userNode) {
    	if(userNode.checked){
    		addSelectedUser(userNode);
    	}else{
    		var $curLi = $("#selectedList li[deptcode^='"+userNode.DEPT_CODE+"']");
    		$.each($curLi,function(i,n){
    			removeSelectedUser($(n));
    		})
    	}
    });

    orgTree.bindEvent('onExpand', function(event, treeId, treeNode) {
    	//由于展开才加载叶子结点，因此需要回填搜索选中的设备
		var indexArr = [];
		$.each(noCheckedArr,function(i,n){
			var node = orgTree.getNodeByParam('USER_CODE',n);//获取拥有属性值等于某值的树节点
			if(node){
				var index = noCheckedArr.indexOf(n);
				orgTree.checkNode(node,true,true);
				indexArr.push(index);
			}
		});
		
		indexArr.sort(sortNumber);
		
		$.each(indexArr,function(i,n){
			noCheckedArr.splice(n, 1);
		});
    	
    	//移除设备CheckBox
		$("#structureTree [usercode]").parent().siblings('[treenode_check]').css("visibility","hidden");
    });
    
    /*var id = orgTree.getNodes()[0].id;
    orgTree.selectTreeNode(id);*/
}

//数组排序
function sortNumber(a, b){
    return b - a
}

//搜索查询
function initSearch(){
	$("#search").click(function(){
		if($("#searchCon").val()!=''){ 
			doTreeSearch();
		}
	});        	
	$("#searchCon").keyup(function(event){
		$('#clearSearchTextBtn')[$(this).val()!=""?"removeClass":"addClass"]('hide');
		if(event.which==13 && $(this).val()!=''){ 
			doTreeSearch();
		}
		if(event.which==8 && $(this).val()==''){ 
			$("#structureTreeWrap").addClass("active").siblings().removeClass("active");
		}
	});
	$('#clearSearchTextBtn').click(function(){
		$("#searchCon").val('');
		$(this).addClass('hide');
		doTreeSearch('clear');
	});
}

function doTreeSearch(param){
	
	if(param == "clear"){
		$("#structureTreeWrap").addClass("active").siblings().removeClass("active");
		return ;
	}
	var searchCon = $("#searchCon").val()
	
	/*if(searchCon.length == 0){
		UI.util.alert("请输入查询关键字","warn");
	} else {*/
		UI.control.remoteCall(searchService,{KEYWORD:searchCon, APPROVE_TYPE: approveType },function(resp){
			$("#searchList").html(tmpl("cameraListTemplate", resp.data));
			$("#deviceListWrap").addClass("active").siblings().removeClass("active");
		});
	/*}*/
}

function reloadCheck(){
	$.each(deviceIdArr,function(i,n){
		//$("#searchList li[deviceid='"+n+"']").addClass("active").find("input").prop("checked", true);
		$("#searchList li[deviceid='"+n+"']").find("input").prop("checked", true);
	});
	
	toggleCheck();
}

/**
 *	全选与单选的互动
 */
function toggleCheck(){
	if($(".checkSingle:checked").length == $(".checkSingle").length){
		$("#checkAll").prop("checked", true);
	}else{
		$("#checkAll").prop("checked", false);
	}
}

/**
 * 兼容ie8的indexOf方法
 */
function compatibleIndexOf(){
	if (!Array.prototype.indexOf)
	{
	  Array.prototype.indexOf = function(elt /*, from*/)
	  {
	    var len = this.length >>> 0;
	    var from = Number(arguments[1]) || 0;
	    from = (from < 0)
	         ? Math.ceil(from)
	         : Math.floor(from);
	    if (from < 0)
	      from += len;
	    for (; from < len; from++)
	    {
	      if (from in this &&
	          this[from] === elt)
	        return from;
	    }
	    return -1;
	  };
	}
}