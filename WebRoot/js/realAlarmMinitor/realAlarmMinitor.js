var treeService = UI.util.getUrlParam("treeService") || 'user/structure/num/getTree'; //获取树服务
var listService = UI.util.getUrlParam("listService") || 'cp/device/getDeviceList'; //获取列表服务
var deviceType = UI.util.getUrlParam("deviceType") || '194'; //获取列表服务
var pointArray = [];
var mapObj = null;
var isFirstOpenMap = true;
var orgTree = null;
var Xmin = 0;
var Ymin = 0;
var Xmax = 0;
var Ymax = 0;
var historyFaceParam = {
	pageNo: 1,
	pageSize: 20,
	BEGIN_TIME: UI.util.getDateTime("nearWeek", 'yyyy-MM-dd 00:00:00').bT,
	END_TIME: UI.util.getDateTime("nearWeek", 'yyyy-MM-dd 23:59:59').eT
}
var allNode = {};
var orgTreeOpts = {
	service: 'user/structure/num/getTree',
	parentNodeRender: renderTreeNodes,
	multiple: true,
	leafService: function(treeNode) { //延迟加载
		var orgCode = treeNode.ORG_CODE;
		return listService + '?id=result&CASCADE=0&ORG_CODE=' + orgCode + '&DEVICE_TYPE=' + deviceType + '&KEYWORDS=';
	},
	leafNodeRender: treeNodeRender,
	search: {
		enable: true, //是否启用搜索
		searchTreeNode: true, //搜索参数 key|value为文本框的ID
		searchTextId: 'searchCon',
		ignoreEmptySearchText: true,
		searchBtnId: 'search'
	},
	unload:true
};
var structureTreeParam = {
	deviceType: deviceType,
	isShowNum: true
}
var historyFaceOptions = {
	usePage: false
}
//实时告警内容
$(function() {
	UI.control.init();
	initTree();
	initEvent();
})

function initEvent() {
	//地图与视频模式的切换
	$(".tagItem").on("click", function() {
		var $this = $(this);
		$this.addClass("active").siblings().removeClass("active");
		var target = $this.attr("target");
		$("." + target).removeClass("hide").siblings(".right-silde").addClass("hide");
		if(target == "mapModel" && isFirstOpenMap) {
			initMap();
			UI.control.getControlById("structureTree").reloadTree(structureTreeParam);
			isFirstOpenMap = false;
		}
	})
	//实时告警开关
	$(".switchBtn").on("click", function() {
		$(this).toggleClass("active");
	})
	//实时告警弹窗
	$("body").on("click", ".picMessage", function() {
		var $this = $(this);
		var OBJ_ID = $this.attr("OBJ_ID");
		var TASK_TYPE = $this.attr("TASK_TYPE");
		var ALARM_ID = $this.attr("ALARM_ID");
		var url = "/efacecloud/page/realAlarmMinitor/faceRealAlarm.html?OBJ_ID=" + OBJ_ID + "&TASK_TYPE=" + TASK_TYPE + "&ALARM_ID=" + ALARM_ID;
		UI.util.showCommonWindow(url, "告警详情", 1019, 390);
	})
	//声音控制
	$(".voiceControl").click(function() {
		var $this = $(this);
		$this.toggleClass("active");
	})

	//右侧边栏隐藏与展示
	$(".right-hide").on("click", function() {
		$(".frame-con").toggleClass("right-part-hide");
	})

	//注册监听事件：地图气泡中的"监控"按钮 
	$('body').on('click', '.minitor', function() {
		var $this = $(this);
		var DEVICE_ID = $this.attr('DEVICE_ID');
		var NAME = $this.attr('NAME');
		var popupHtml = '';
		var options = {
			url: '/datadefence/page/mapLayer/realFaceList.html?deviceId=' + DEVICE_ID,
			width: 410,
			title: NAME,
			height: 355
		};
		popupHtml = tmpl('<iframe src="{%=o.url%}" name="{%=o.title%}" width="{%=o.width%}" height="{%=o.height%}" frameborder="0" seamless="seamless"></iframe>', options);
		UI.map.getMap()._popup && UI.map.getMap()._popup.setContent(popupHtml);
	});

	// 注册监听事件：地图气泡中的"监控视频"按钮
	$('body').on('click', '.minitorVideo', function(e) {
		var $this = $(this);
		var options = {};
		var NAME = $this.attr('NAME');
		var DEVICE_ID = $this.attr('DEVICE_ID');
		options = {
			url: '/datadefence/page/multiDimensional/faceCamera.html?DEVICE_ID=' + DEVICE_ID,
			title: NAME,
			width: 960,
			height: 636
		};
		UI.util.showCommonWindow(options.url, options.title, options.width, options.height);
	})

}

function loadPoint(nodes) {
	/*var popupHtml = tmpl("mapPopup", nodes);*/
	var marker = L.marker(nodes.latlng, nodes).addTo(mapObj);
	pointArray.push(marker);

	marker.on("click",function(data){
		var $this = $(this);
		var options = {};
		var NAME = nodes.DEVICE_NAME;
		var DEVICE_ID = nodes.DEVICE_ID;
		options = {
			url: '/datadefence/page/multiDimensional/faceCamera.html?DEVICE_ID=' + DEVICE_ID,
			title: NAME,
			width: 960,
			height: 636
		};
		UI.util.showCommonWindow(options.url, options.title, options.width, options.height);		
	});


}
//初始化地图
function initMap() {
	var options = {
		closePopupOnClick: false
	}

	UI.map.init(options, function(map) {
		UI.map.initWmsLayer(function(obj) {
			return getPopupHtmlByLayer(obj);
		});
		mapObj = UI.map.getMap();
	});
	
}

function initTree() {
	orgTree = UI.control.getControlById('structureTree');
	orgTree.bindEvent('onClick', function(event, treeId, treeNode) {
		if(treeNode.checked) {
			var lng = treeNode.LONGITUDE;
			var lat = treeNode.LATITUDE;
			var latlng = [lat, lng];
			var popupHtml = tmpl("mapPopup", treeNode);
			L.popup({
				offset: L.point(0, -35)
			}).setLatLng(latlng).setContent(popupHtml).openOn(mapObj);
			mapObj.flyTo(latlng);
		}
		console.log(treeNode);
	});

	orgTree.bindEvent('onCheck', function(event, treeId, treeNode) {
		removePoint();
		Xmin = 0;
		Ymin = 0;
		Xmax = 0;
		Ymax = 0;
		var nodes = orgTree.getCheckedNodes(true);
		$.each(nodes, function(i,treeNode) {
			if(!treeNode.isParent && treeNode.LONGITUDE && treeNode.LATITUDE) {
				setPoint(treeNode);
			} else if(treeNode.isParent) {
				if(treeNode.checked&&!treeNode.getCheckStatus().half) {
					addSelectedDevice(treeNode);
				}
			}
			if(i==nodes.length-1){
				if(Xmin !=0 && Ymin !=0 && Xmax != 0 && Ymax != 0){
					mapObj.fitBounds([[Ymin,Xmin],[Ymax,Xmax]]);
				}  
			}
		});
		

	});
	
	
	orgTree.bindEvent('onExpand', function(event, treeId, treeNode) {
		console.log(treeNode);
		var getCheckStatus = treeNode.getCheckStatus();
		var treeNodeArr = allNode[treeNode.ORG_CODE];
		if(treeNodeArr&&treeNodeArr.length>0&&treeNodeArr[0]){
			if(getCheckStatus.checked){
				for(var i=0;i<treeNodeArr.length;i++){
					var node = orgTree.getNodeByParam('id',treeNodeArr[i]);
					if(node){
						orgTree.checkNode(node,true,true);
					}				
				}
				treeNodeArr[0] = false;
			}
		}
    });
}
//实时告警
function initSubscribeInfo(data) {
	if(data.TASK_TYPE!=1){
		return ;		
	}else{
		$(".alarmList").prepend(tmpl("alarmListTemplate", data));
		if($(".alarmList").find(".picMessage").length > 100) {
			$(".alarmList").find(".picMessage").last().remove();
		}
		if($(".switchBtn").hasClass("active")) {
			if($('.window-overlay', parent.document).length > 0) {
				parent.UI.util.closeCommonWindow();
			}
			/*var ALARM_IMG = data.ALARM_IMG || "";
			var OBJECT_PICTURE = data.OBJECT_PICTURE || "";
			var ORIGINAL_DEVICE_ID = data.ORIGINAL_DEVICE_ID || "";
			var ALARM_TIME = data.ALARM_TIME || "";
			var SCORE = data.SCORE || "";
			var PERSON_NAME = data.PERSON_NAME || "";
			var PERSON_SEX = data.PERSON_SEX || "";
			var IDENTITY_ID = data.IDENTITY_ID || "";
			var DB_NAME = data.DB_NAME || "";
			var DEVICE_NAME = data.DEVICE_NAME || "";
			var url = "/efacecloud/page/realAlarmMinitor/faceRealAlarmWindow.html?ALARM_IMG=" + ALARM_IMG + "&OBJECT_PICTURE=" + OBJECT_PICTURE + "&ORIGINAL_DEVICE_ID=" + ORIGINAL_DEVICE_ID + "&ALARM_TIME=" + ALARM_TIME + "&SCORE=" + SCORE + "&PERSON_NAME=" + PERSON_NAME + "&PERSON_SEX=" + PERSON_SEX + "&IDENTITY_ID=" + IDENTITY_ID + "&DB_NAME=" + DB_NAME + "&DEVICE_NAME=" + DEVICE_NAME;
			UI.util.showCommonWindow(url, DEVICE_NAME, 940, 490, null, "", "", "", true);*/
			//$(".alarmList").find(".picMessage").first().click();
			var ALARM_IMG = data.ALARM_IMG || "";
			var OBJECT_PICTURE = data.OBJECT_PICTURE || "";
			var FRAME_IMG = data.FRAME_IMG || "";
			var DEVICE_ID = data.DEVICE_ID || "";
			var ALARM_TIME = data.ALARM_TIME || "";
			var ALARM_ADDR = data.DEVICE_NAME || "";
			var SCORE = data.SCORE || "";
			var PERSON_NAME = data.PERSON_NAME || "";
			var PERSON_SEX = data.PERSON_SEX || "";
			var IDENTITY_ID = data.IDENTITY_ID || "";
			var DB_NAME = data.DB_NAME || "";
			var DEVICE_NAME = data.DEVICE_NAME || "";
			var FACE_RECT = data.FACE_RECT || "";			
			var url = "/efacecloud/page/realAlarmMinitor/faceRealAlarm.html?getDataByParent=true"+"&ALARM_IMG=" 
			+ ALARM_IMG + "&OBJECT_PICTURE=" + OBJECT_PICTURE + "&DEVICE_ID=" + DEVICE_ID 
			+ "&ALARM_TIME=" + ALARM_TIME + "&SCORE=" + SCORE + "&PERSON_NAME=" + PERSON_NAME 
			+ "&PERSON_SEX=" + PERSON_SEX + "&IDENTITY_ID=" + IDENTITY_ID + "&DB_NAME=" + DB_NAME 
			+ "&DEVICE_NAME=" + DEVICE_NAME +"&FRAME_IMG="+FRAME_IMG+"&FACE_RECT="+FACE_RECT;
			UI.util.showCommonWindow(url, "告警详情", 1019, 390, null, "", "", "", true);
		}
		if($(".voiceControl").hasClass("active")) {
			AlarmAudio.init();
			AlarmAudio.play();
		}
	}
}
//实时告警等级
function setAlarmColor(num) {
	switch(num) {
		case "2":
			return "yellow";
		case "3":
			return "red";
		case "4":
			return "black";
		default:
			break;
	}
}

function renderTreeNodes(treeNode) {

	if(!treeNode.hasChildren) {
		var treeNodeText = '<span class="ico-passport-name mr5"></span><span class="tree-con" x="' + treeNode.X + '" y="' + treeNode.Y + '">' + treeNode.text + '</span>';
		treeNodeText += (treeNode.X && treeNode.Y) ? '' : '<span class="icon-location4 map-btn mapBtn" title="增加坐标" nodeid="' + treeNode.id + '" nodename="' + treeNode.text + '"></span>';
		treeNode = $.extend(treeNode, {
			text: treeNodeText,
			nodename: treeNode.text,
			isParent: false,
		});
	}
	return treeNode;
}
//清除地图上的摄像机信息
function removePoint() {
	for(var i = 0; i < pointArray.length; i++) {
		pointArray[i].remove();
	}
	pointArray = [];
}
//插入设备到列表
function treeNodeRender(node) {
	return $.extend({
		text: '<span class="tree-con" deviceid="' + node.DEVICE_ID + '" title="' + node.DEVICE_NAME + '" ><span class="camera-icon mr10"></span><span class="text-overflow" style="max-width: 350px;">' + node.DEVICE_NAME + '</span></span>',
		id: node.DEVICE_ID
	}, node);
}

//check增加地图节点
//地图上添加设备
function addSelectedDevice(treeNode) {
	var queryParams = {
		KEYWORDS: '',
		DEVICE_TYPE: deviceType,
		ORG_CODE: treeNode.ORG_CODE,
		CASCADE: 1
	}
	//只有当前节点从未展开，才允许添加数据
	if(!allNode[treeNode.ORG_CODE]){
		allNode[treeNode.ORG_CODE] = [];
	}
	UI.control.remoteCall(listService, queryParams, function(resp) {
		$.each(resp.data, function(i, n) {
			
			var id = n.DEVICE_ID;
			if(allNode[treeNode.ORG_CODE][0]!=false){
				if(allNode[treeNode.ORG_CODE].indexOf(id)=="-1"){
					allNode[treeNode.ORG_CODE].push(id);
				}
			}			
			setPoint(n);
		});
	});
}
function setPoint(treeNode) {
	var X = 0,
		Y = 0;
	X = parseFloat(treeNode.LONGITUDE);
	Y = parseFloat(treeNode.LATITUDE);
	if(i == 0 || Xmin == 0 || Ymin == 0 || Xmax == 0 || Ymax == 0) {
		Xmin = Xmax = X;
		Ymin = Ymax = Y;
	} else {
		if(X > Xmax) {
			Xmax = X;
		}
		if(X < Xmin) {
			Xmin = X;
		}
		if(Y < Ymin) {
			Ymin = Y;
		}
		if(Y > Ymax) {
			Ymax = Y;
		}
	}
	var kkObj = {},
		latlng = {};
	latlng.lat = treeNode.LATITUDE;
	latlng.lng = treeNode.LONGITUDE;
	kkObj.title = treeNode.DEVICE_NAME;
	kkObj.id = treeNode.id;
	kkObj.latlng = latlng;
	kkObj.DEVICE_ID = treeNode.DEVICE_ID;
	kkObj.DEVICE_NAME = treeNode.DEVICE_NAME;
	kkObj.icon = L.icon({
		iconUrl: '/efacecloud/images/face-video-icon.png',
		iconSize: [30, 30],
		iconAnchor: [15, 40]
	});
	loadPoint(kkObj);
	
}