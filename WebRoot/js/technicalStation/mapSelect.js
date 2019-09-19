var userCode = "admin";
var cql = null;

$(function(){
	UI.control.init(['userInfo']);
	initCql();
})

//初始化cql
function initCql(){
	var userInfo = UI.control.getUserInfo();
	/*userCode = userInfo.code;*/  //用户信息 先注释
	UI.util.debug("userCode->"+userCode);
	
//	if (userCode != "admin"){ //根据用户编码获取相应的场景
//		UI.control.remoteCall("cs/community/queryByUser", {userCode : userCode}, function(resp){
//			var list = resp.list;
//			if (list.length > 0){
//				cql = "COMMUNITY_ID in ('" + list.join("','") + "')";
//			}
//		});
//	}
}

//地图卡口选择
function selectKkbhForMap(type, layerName){
	if(!layerName) layerName = "V_KK_INFO";
	var layerArr = [];
	layerArr.push(layerName);
	parent.SuntekMap.require("map",[],function(){
		var map = top.SuntekMap.getMap();
		// 5种空间搜索
		if(type=="delete"){
			map.deactivateDraw();
			map.clear();
			if(typeof onFeatureSelected=='function'){
				onFeatureSelected({}, layerName);
			}else{
				document.getElementById("mainFrameContent").contentWindow.onFeatureSelected({}, layerName);
			}
			return false;
		}
		
		if(type=="deactivateDraw"){
			map.deactivateDraw();
			return false;
		}
		
		if(type=="unloadModules"){
			map.unloadModules(["trackLoader","trackplayer"]);
			return false;
		}
		
		var callbackId = map.selectFeatures(
			type,			// mappoint:点选,extent:框选,polyline:线选,polygon:多边形选,circle:圈选
			layerArr.join(","), // 图层名称
			// 查询参数,可以不传即此方法只传前两个参数
			{
				buffer:100,		// 缓冲范围，默认100米
				cql:cql,		// 搜索过滤条件
				labelField:null, // 文本字段名称，如摄像机的为VIDEONAME
				//icon:"/gis/images/icon11.png",		// 自动加载后的要素图标，不设置则使用默认图标
				htmlSrc:null,	// 要素弹窗，不设置则不弹窗，气泡信息的url地址
				drawOnce:true,	// 绘图时是否只绘制一次
				saveGraphic:true,//是否保留绘图
				autoLoad:true,	// 是否自动显示搜索结果
				editable:false
			}
		);
		// 订阅要素查询选择事件
		top.$.subscribe(callbackId+"/getFeatures",function(jq,data){
			if(typeof onFeatureSelected =='function'){
				onFeatureSelected(data.data.features, data.type);
			}else{
				document.getElementById("mainFrameContent").contentWindow.onFeatureSelected(data.data.features, data.type);
			}
		});
		
		// 后续操作，选择单个要素
		map.callObject(callbackId,"selectFeature",0);
		// 移除要素,移除后之前的要素索引会改变
		map.callObject(callbackId,"removeFeature",0);
	});
}