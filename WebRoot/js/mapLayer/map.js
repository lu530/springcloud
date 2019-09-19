/**
 * 	图层气泡详情URL集合
 *  @author: wenyujian
 * */ 
var popupDetailUrls = {
    'L_POLICE_GPS': "patrol/police/getPoliceInfo",
    'L_CAR_GPS': "/datadefence/rest/v6/control/mapLayer/alarmCarPopup",
    'L_CAMERA_KK': "layer/resource/camera/detail",
    'L_CAMERA_DJ': "layer/resource/camera/detail",
    'L_CAMERA_WKK': "layer/resource/camera/detail",
    'L_CAMERA_CAR': "layer/resource/camera/detail",
    'L_CAMERA_VIDEO': "layer/resource/camera/detail",
    'L_CAMERA_FACE': 'layer/resource/camera/detail',
    'L_CAMERA_STRUCTURE': "layer/resource/camera/detail",
    'L_ACDOOR': "layer/resource/acdoor/detail",
    'L_CAMERA_PARKING': "layer/resource/camera/detail",
    'L_WIFI': "layer/resource/wifi/detail",
    'L_EFENCE': "layer/resource/efence/detail",
    'L_BUILDING': "fsfr/MPBuilding/mpInfo",  // 楼栋信息
    'L_INSTITUTIONS': "/datadefence/rest/v6/control/mapLayer/unit",
    'LOCATION': "/datadefence/rest/v6/control/mapLayer/locationPopup",//todo
    'SPECIALCAR': "/datadefence/rest/v6/control/mapLayer/specialcar",//todo
    'L_IMPORTANT_PERSON': "layer/resource/importperson/detail",   
    'MINZHENG': "/datadefence/rest/v6/control/mapLayer/minzheng",//todo
    'L_GRID': "/datadefence/page/multiDimensional/minGridDetails.html",
    'L_SENCE': "/datadefence/page/multiDimensional/communityDetails.html",
    "L_QYDW": "fsfr/unit/info",          //企业
    "L_GOVERNMENT": "fsfr/unit/info",          //政府
    "L_GTGSH": "fsfr/unit/info",          //个体
    "L_SOCIALGP": "fsfr/unit/info",          // 社会团体
    "L_INSTITUTIONS": "fsfr/unit/info",       // 事业单位
    "L_BUILDING_PERSON": 'fsfr/person/list',
    "L_PERSON": '/datadefence/page/tmpls/popup/L_PERSON.html',//人口
    'L_DOORPLATE': "/datadefence/page/tmpls/popup/L_DOORPLATE.html"//门牌
};

//图层搜索输入框提示文字
var placeholder = {
	'DEFAULT': '请选择图层',
	'L_POLICE_GPS': '搜警员名称、账号',
	'L_CAR_GPS': '',
	'L_CAMERA_KK': '搜设备ID、设备名称、地址',
	'L_CAMERA_DJ': '搜设备ID、设备名称、地址',
	'L_CAMERA_WKK': '搜设备ID、设备名称、地址',
	'L_CAMERA_FACE': '搜设备ID、设备名称、地址',
	'L_CAMERA_CAR': '搜设备ID、设备名称、地址',
	'L_CAMERA_VIDEO': '搜设备ID、设备名称、地址',
	'L_CAMERA_STRUCTURE': '搜设备ID、设备名称、地址',
	'L_CAMERA_PARKING': '搜设备ID、设备名称、地址',
	'L_ACDOOR': '搜设备ID、设备名称、地址',
	'L_WIFI': '搜设备ID、设备名称、地址',
	'L_EFENCE': '搜设备ID、设备名称、地址',
	'L_INSTITUTIONS': '搜单位名称',
	'L_QYDW': '搜单位名称',
	'L_GOVERNMENT': '搜单位名称',
	'L_GTGSH': '搜单位名称',
	'L_SOCIALGP': '搜单位名称',
	'L_SENCE': '搜区域名称',
	'L_IMPORTANT_PERSON': '搜人员姓名、身份证',
	'L_GRID': '搜网格名称',
	'L_BUILDING': '搜建筑ID、建筑名称',
//	'L_PERSON': '搜人员姓名'
	'L_BUILDING_PERSON': '搜人员姓名、身份证',
	'L_DOORPLATE': '搜门牌ID、名称'
}

// 标志是否是第一次进行 "警力"的GPS
var firstPOLICEGPS = 0;
// 标志是否第一次进行显示重点人员图层
var firstClusterFlat = 0 ;
// 存放 图层设置， 当前所展示的图层名称集合
var curMultipleList = [];

var userInfo = {};//存放用户信息对象
var personParams = {
	'BEGIN_TIME': getNearstTime(12 * 3600 * 1000),
	'END_TIME': new Date().format('yyyy-MM-dd HH:mm:ss'),
	'DB_IDS': '',
	'IS_AlGORITHM': 1,
	'pageNo': 1,
	'pageSize': 4,
	'KEYWORDS': ''
}

// 重点人员布控库分类
var tpyes = [];
var timerPerson =  null ; //重点人员告警的全局定时器
var intervalTime = 60*1000; //重点人员告警的刷新时间
var mapMarkers = '';
var timeCode = '1';  //时间段，默认选择第一个时间段
var intervalCode = '3'; //刷新时间段，默认选择第一个
var mapObj = {};
$(function () {
	
	UI.control.init(['userInfo']);
	
	userInfo = UI.control.getUserInfo();
	
	UI.map.init({ 
	//	userCode: userInfo.code,//用于GPS服务连接控制权限
	//	connectGpsSocket: true //是否连接GPS服务
		}, function(map){
		UI.map.initWmsLayer(function(obj){
			return getPopupHtmlByLayer(obj);
		});
		
		var options = {
			layerName: UI.map.layerNameMap.L_POLICE_GPS,
			popupHtmlFun: function(obj){
				return getGPSPopupHtmlByLayer(obj);
			}
   		}
		
		mapObj = UI.map.getMap();
		setTimeout(function(){
			$('#searchBar').removeClass('hide');
			// 政区切换
			UI.map.switchRegion('440112',3);
		},800);
   		UI.map.initGpsLayer(options);  //该方法只执行一次
		firstPOLICEGPS = 1;
		
		mapMarkers = L.featureGroup();
		
		/*mapMarkers = L.markerClusterGroup({  
			spiderLegPolylineOptions: { weight: 1.5, color: '#222', opacity: 0 },
			showCoverageOnHover: false
*/
		// 控制地图图层查询列表
		renderLayerList();
		// 注册相关事件
		registerListeners();
		
		// "图层设置"面板相关事件： 控制多图层显示/隐藏
		controlMultipleLayer();
		
		// 底图切换
		switchBaseMap();
		
	});
});


/**
 * 	图层查询列表 和 图层检索结果列表 相关操作
 *  @author: wenyujian
 * */
function renderLayerList(){
	// 加载图层检索模板
	 var searchTmpl=syncGet('/datadefence/page/tmpls/layerList/searchList.html');
	 $('#layerList').html(searchTmpl);
	/* $('#searchScroll').mCustomScrollbar();*/
	 
	 changeListHeight();
	 // 根据视窗大小,调整检索模板的高度 （注意：模板不出现滚动条的大小为 639px）
	 $(window).resize(function () {          //当浏览器大小变化时
		 changeListHeight();
	});
	 
	 // 图层列表的搜索
	   $('body').find('#searchLayer').on('click', function(){
		   if($('#loadBtn').hasClass('hide')){
			   // 当控制面板打开
			   if($('#layerSet').attr('attr-active') !=''){
				   return ;
			   }
			   if($('#searchLayerList').attr('attr-active') ==''){
				   $('#layerList').addClass('active');
				   $('body').find('#delBtn span').removeClass('hide');
			   }
			   
			   $('#listContent').addClass('animation');
			   
			   if(!$(this).attr("hasInitScroll")){
				   $(this).attr("hasInitScroll",true);
				   $('#searchScroll').mCustomScrollbar();
			   }
		   }
	    })
	      
	    // 关闭/删除按钮
	    $('body').find('#delBtn').on('click',function(){
	    	$('#searchLayer').val('');
	    	$('#searchLayerList').removeClass('active');
	    	// 清除图层检索
	    	UI.map.clearSearchLayers();
	    	clearInterval(timerPerson);
	    	tpyes = [];
	    	
	    	if($('#searchLayerList').attr('attr-active') !=''){	// 关闭图层检索列表,并会退到图层查询列表，同时将检索列表的容器置空
	    		$('#searchLayerList').attr('attr-active', '');
	    		$('#searchLayerList').html('');
	    		$('#layerList').addClass('active');
	    		
	    	}else{			// 关闭图层查询列表
	    		$('#layerList').removeClass('active');
	    		$(this).find('span').addClass('hide');
	    		$('#searchLayer').attr('placeholder', placeholder['DEFAULT']);
	    		
		    	// 清除地图上打点的图标
	    		if($('#searchTitle').attr('attr-name') !=''){
	    			UI.map.setLayerVisible($('#searchTitle').attr('attr-name'), false);
	    		}
		    	
		    	// 图层选中状态
		    	$('body').find('#layerList .item span').each(function(){
	   		   	    $(this).removeClass('active');
	   		   	});
		    	// 重设搜索条的信息
		    	$('#searchTitle').html('图层').attr('attr-name','').attr('attr-list-name','');
		    	
		    	// 将 "建筑" 、 "重点人员" 和"住户信息" 、"门牌"图层开关关了
		    	 $('#switchZdryBtn').removeClass('toggle-label-on');
   		    	 $('#switchBuildingBtn').removeClass('toggle-label-on');
   		    	 $('#switchZhryBtn').removeClass('toggle-label-on');
   		    	 $('#switchDoorplateBtn').removeClass('toggle-label-on');
   		    	 
   		    	$('#listContent').removeClass('animation');
	    	}
	    })
	    
	    // 监听检索输入框的值变化
	    $('body').find('#searchLayer').change(function(){
	    	var inputVal = $(this).val();
	   	 	if(inputVal !=''){
				$('#delBtn').addClass('toggle-label-on');
				$('#delBtn span').removeClass('hide');
			}
	    })
	    
	    // 监听检索输入框，键盘抬起
	    $('body').find('#searchLayer').keyup(function(e){
	    	 if($(this).attr('attr-layer') !=''){
	    		 var inputVal = $(this).val();
	        	 if(inputVal !=''){
	    			$('#delBtn').addClass('toggle-label-on');
	    			$('#delBtn span').removeClass('hide');
	    		}
	    	 }
	    	 
	     });

	    // 选择地图图层
	   	$('body').find('#layerList [attr-layer]').on('click', function(){
	   		// 通过该属性标识， 选中了那个图层
	   		var attrLayer = $(this).attr('attr-layer');
	   		var oldAttrName = $('#searchTitle').attr('attr-name');
	   		var layerName = '图层';
	   		var wmsName = '';
	   		switch(attrLayer){
	  			case 'POLICE': 			layerName = '警力';  			wmsName=UI.map.layerNameMap.L_POLICE_GPS; 		break;
//	  			case 'POLICE_CAR': 		layerName = '警车';			wmsName=UI.map.layerNameMap.L_CAR_GPS;  break;
//	  			case 'POLICE_ALARM': 	layerName = '警情';															break;
//				case 'POLICE_STATION': 	layerName = '派出所';															break;
//				case 'POLICE_PLACE': 	layerName = '防控点';															break;
	  			case 'CAMERA_KK': 		layerName = '车辆卡口';		wmsName=UI.map.layerNameMap.L_CAMERA_KK;  		break;
	  			case 'CAMERA_DJ': 		layerName = '电子警察';		wmsName=UI.map.layerNameMap.L_CAMERA_DJ;		break;
				case 'CAMERA_WKK': 		layerName = '微卡口';			wmsName=UI.map.layerNameMap.L_CAMERA_WKK;		break; 
				case 'CAMERA_XNKK': 	layerName = '结构化';  		wmsName=UI.map.layerNameMap.L_CAMERA_STRUCTURE;	break;
	  			case 'CAMERA_LLZP': 	layerName = '人脸抓拍';		wmsName=UI.map.layerNameMap.L_CAMERA_FACE;		break;
	  			case 'CAMERA_WKK': 		layerName = '车辆卡口';		wmsName=UI.map.layerNameMap.L_CAMERA_CAR;		break;
	  			case 'CAMERA':   		layerName = '摄像机';			wmsName=UI.map.layerNameMap.L_CAMERA_VIDEO;		break;
				case 'DOORS': 			layerName = '门禁';			wmsName=UI.map.layerNameMap.L_ACDOOR;			break;
	  			case 'PARKS': 			layerName = '停车场';			wmsName=UI.map.layerNameMap.L_CAMERA_PARKING;	break;
	  			case 'WIFI': 			layerName = 'WIFI';			wmsName=UI.map.layerNameMap.L_WIFI;				break;
				case 'HZ_HYDRANT': 		layerName = '电围';			wmsName=UI.map.layerNameMap.L_EFENCE;			break;
				case 'UNIT_COMPANY':	layerName = '企业';			wmsName=UI.map.layerNameMap.L_QYDW; 			break;
				case 'UNIT_GOVERNMENT': layerName = '政府';			wmsName=UI.map.layerNameMap.L_GOVERNMENT;		break;
				case 'UNIT_PERSON': 	layerName = '个体';			wmsName=UI.map.layerNameMap.L_GTGSH; 			break;
				case 'UNIT_TEAM': 		layerName = '社会团体';		wmsName=UI.map.layerNameMap.L_SOCIALGP; 		break;
				case 'UNIT_SYDW': 		layerName = '事业单位';		wmsName=UI.map.layerNameMap.L_INSTITUTIONS;		break;
//	  			case 'SCENCE_IMPORTANT':layerName = '重点目标';														break;
	  			case 'SCENCE_FKQY': 	layerName = '防控社区';		wmsName=UI.map.layerNameMap.L_SENCE;			break;
//				case 'SCENCE_ZYQY': 	layerName = '重要区域';														break;
//				case 'SCENCE_SQSC': 	layerName = '商圈市场';														break;
//	  			case 'SCENCE_BAR': 		layerName = '酒吧';															break;
//				case 'SCENCE_INTERNET_BAR': layerName = '网吧';														break;
	  			case 'IMPORTANT_PERSON':layerName = '重点人员'; 		wmsName=UI.map.layerNameMap.L_IMPORTANT_PERSON; break;
	  			case 'BUILDING': 		layerName = '建筑';			wmsName=UI.map.layerNameMap.L_BUILDING; 		break;
//	  			case 'PERSON': 			layerName = '人员信息';		wmsName=UI.map.layerNameMap.L_PERSON; 		break;
	  			case 'BUILDING_PERSON': layerName = '住户信息';		wmsName=UI.map.layerNameMap.L_BUILDING_PERSON; 		break;
	  			case 'DOORPLATE': 		layerName = '门牌';			wmsName=UI.map.layerNameMap.L_DOORPLATE; 		break;
	  		}
	   		
	   		// 输入框获取焦点
	   		$('#searchLayer').focus();
	   		$('#searchLayer').attr('placeholder', placeholder[wmsName]);
	   		
	   		if(layerName != '图层'){
	   			$('body').find('#layerList .item span').each(function(){
	   		   	    $(this).removeClass('active');
	   		   	});
	   	   		$(this).toggleClass('active');
	   		}
	   		
	   		//如果点击的是被禁用的图层,则清除其他图层被选中的状态
	   		if($(this).is('.disable')){
	   			$('body').find('#layerList .item span').each(function(){
   		   	    	$(this).removeClass('active');
				});
	   		}
	   		
   			$('#searchTitle').attr('attr-name', wmsName).attr('attr-list-name', attrLayer).html(layerName);
   			// 清除图层检索
		    UI.map.clearSearchLayers();
		    	 
		    // 控制当前图层的显示与隐藏,分四种情况： 建筑、重点人员、人员信息、其他图层
	   		// 重点人员图层切换  开关
//   			if(attrLayer == 'IMPORTANT_PERSON'){
//   		    	 $('#switchZdryBtn').toggleClass('toggle-label-on');
//   		    	 $('#switchBuildingBtn').removeClass('toggle-label-on');
//   		    	 $('#switchZhryBtn').removeClass('toggle-label-on');
//   		    	 $('#switchDoorplateBtn').removeClass('toggle-label-on');
//   		    	 
//	   	    	// 通过判断 'toggle-label-on' 存在与否来控制图层的显示隐藏
//	   	    	 if($('#switchZdryBtn').is('.toggle-label-on')){  // 开
//	   	    		if(firstClusterFlat == 0){	// 若是第一次显示“重点人员" 图层，则初始化图层，并把标志  firstClusterFlat 设置为 1
//	   	    			// 实例化重点人员图层
//	   	     			UI.map.initClusterLayer(function(obj){
//	   	     				return getPopupHtmlByLayer(obj);
//	   	     			});
//	   	     			firstClusterFlat = 1;
//	   	    		 }
//	   	    		 // 显示"重点人员"图层前，清除其他图层
//	   	    		 UI.map.setLayerVisible(UI.map.layerNameMap.L_BUILDING, false);   // 统一清除 "建筑" 图层
//	   	    		 UI.map.setLayerVisible(UI.map.layerNameMap.L_BUILDING_PERSON, false);   // 统一清除 "人员信息" 图层
//	   	    		 UI.map.setLayerVisible(UI.map.layerNameMap.L_DOORPLATE, false);   // 统一清除 "门牌" 图层
//	   	    		 
//	   	    		 if(oldAttrName!=''){
//	   	   				UI.map.setLayerVisible(oldAttrName, false);
//	   	   				$('body').find('#layerList .item span').each(function(){
//	   	   					$('#switchZdryBtn').removeClass('active');
//	   		   		   	});
//	   	   			 }
//	   	    		 
//	   	    		 UI.map.setLayerVisible(UI.map.layerNameMap.L_IMPORTANT_PERSON, true);
//	   	    		 
//	   	    	 }else{	// 关		   	    		 	 
//			   		UI.map.setLayerVisible(UI.map.layerNameMap.L_IMPORTANT_PERSON, false);
//			   		$('#searchTitle').attr('attr-name', '').attr('attr-list-name', '').html('图层');
//			   		$('#searchLayer').attr('placeholder', placeholder['DEFAULT']);
//	   	    	 }
//	   	    	 
//   			}else if(attrLayer =='BUILDING'){  //建筑
//   				$('#switchBuildingBtn').toggleClass('toggle-label-on');
//   				$('#switchZdryBtn').removeClass('toggle-label-on');
//   				$('#switchZhryBtn').removeClass('toggle-label-on');
//   				$('#switchDoorplateBtn').removeClass('toggle-label-on');
//   				
//   				UI.map.setLayerVisible(UI.map.layerNameMap.L_IMPORTANT_PERSON, false);   // 统一清除 "重点人员" 图层
//   				UI.map.setLayerVisible(UI.map.layerNameMap.L_BUILDING_PERSON, false);   // 统一清除 "人员信息" 图层
//   				UI.map.setLayerVisible(UI.map.layerNameMap.L_DOORPLATE, false);   // 统一清除 "门牌" 图层
//   				
//   				// 通过判断 'toggle-label-on' 存在与否来控制图层的显示隐藏
//   				if($('#switchBuildingBtn').is('.toggle-label-on')){  // 开
//   					// 显示"建筑"图层前，清除其他图层
//   					if(oldAttrName!=''){
//   						UI.map.setLayerVisible(oldAttrName, false);
//   						$('body').find('#layerList .item span').each(function(){
// 		   		   	    	$(this).removeClass('active');
//   						});
//   					}
//   					UI.map.setLayerVisible(UI.map.layerNameMap.L_BUILDING, true);
//   				}else{  //关
//   					UI.map.setLayerVisible(UI.map.layerNameMap.L_BUILDING, false);
//   					$('#searchTitle').attr('attr-name', '').attr('attr-list-name', '').html('图层');
//   					$('#searchLayer').attr('placeholder', placeholder['DEFAULT']);
//   				}
//   		
//   			}else if(attrLayer =='BUILDING_PERSON'){  // 人员信息切换
//   				$('#switchZhryBtn').toggleClass('toggle-label-on');
//   				$('#switchZdryBtn').removeClass('toggle-label-on');
//   				$('#switchBuildingBtn').removeClass('toggle-label-on');
//   				$('#switchDoorplateBtn').removeClass('toggle-label-on');
//   				
//   				UI.map.setLayerVisible(UI.map.layerNameMap.L_BUILDING, false);   // 统一清除 "建筑" 图层
//   				UI.map.setLayerVisible(UI.map.layerNameMap.L_IMPORTANT_PERSON, false);   // 统一清除 "重点人员" 图层
//   				UI.map.setLayerVisible(UI.map.layerNameMap.L_DOORPLATE, false);   // 统一清除 "门牌" 图层
//   				
//   				// 通过判断 'toggle-label-on' 存在与否来控制图层的显示隐藏
//   				if($('#switchZhryBtn').is('.toggle-label-on')){  // 开
//   					// 显示"人员信息"图层前，清除其他图层
//   					if(oldAttrName!=''){
//   						UI.map.setLayerVisible(oldAttrName, false);
//   						$('body').find('#layerList .item span').each(function(){
// 		   		   	    	$(this).removeClass('active');
//   						});
//   					}
//   					UI.map.setLayerVisible(UI.map.layerNameMap.L_BUILDING_PERSON, true);
////   					UI.map.setLayerVisible(UI.map.layerNameMap.L_PERSON, true);
//   				}else{  //关
////   					UI.map.setLayerVisible(UI.map.layerNameMap.L_PERSON, false);
//   					UI.map.setLayerVisible(UI.map.layerNameMap.L_BUILDING_PERSON, false);
//   					$('#searchTitle').attr('attr-name', '').attr('attr-list-name', '').html('图层');
//   					$('#searchLayer').attr('placeholder', placeholder['DEFAULT']);
//   				}
//   				
//   			}else if(attrLayer =='DOORPLATE'){  // 人员信息切换
//   				$('#switchDoorplateBtn').toggleClass('toggle-label-on');
//   				$('#switchZhryBtn').removeClass('toggle-label-on');
//   				$('#switchZdryBtn').removeClass('toggle-label-on');
//   				$('#switchBuildingBtn').removeClass('toggle-label-on');
//   				
//   				UI.map.setLayerVisible(UI.map.layerNameMap.L_BUILDING, false);   // 统一清除 "建筑" 图层
//   				UI.map.setLayerVisible(UI.map.layerNameMap.L_IMPORTANT_PERSON, false);   // 统一清除 "重点人员" 图层
//   				UI.map.setLayerVisible(UI.map.layerNameMap.L_BUILDING_PERSON, false);   // 统一清除 "人员信息" 图层
//   				
//   				
//   				// 通过判断 'toggle-label-on' 存在与否来控制图层的显示隐藏
//   				if($('#switchDoorplateBtn').is('.toggle-label-on')){  // 开
//   					// 显示"人员信息"图层前，清除其他图层
//   					if(oldAttrName!=''){
//   						UI.map.setLayerVisible(oldAttrName, false);
//   						$('body').find('#layerList .item span').each(function(){
// 		   		   	    	$(this).removeClass('active');
//   						});
//   					}
//   					UI.map.setLayerVisible(UI.map.layerNameMap.L_DOORPLATE, true);
////   					UI.map.setLayerVisible(UI.map.layerNameMap.L_PERSON, true);
//   				}else{  //关
////   					UI.map.setLayerVisible(UI.map.layerNameMap.L_PERSON, false);
//   					UI.map.setLayerVisible(UI.map.layerNameMap.L_DOORPLATE, false);
//   					$('#searchTitle').attr('attr-name', '').attr('attr-list-name', '').html('图层');
//   					$('#searchLayer').attr('placeholder', placeholder['DEFAULT']);
//   				}
//   				
//   			}else{  // 其他图层
   				// 隐藏非当前图层
   			if(oldAttrName!=''){
   				UI.map.setLayerVisible(oldAttrName, false);
   			}
   			// 清除图层检索
	    	UI.map.clearSearchLayers();
   			//防控区域图层显示区域
	    	if(wmsName == 'L_SENCE'){
	    		UI.map.setLayerVisible(wmsName,true);
	    	}
   			
//   			// 保证 "建筑" 、  "重点人员" 和 "人员信息" 、"门牌"开关处于关闭状态
//   			$('#switchBuildingBtn').removeClass('toggle-label-on');
//   			$('#switchZdryBtn').removeClass('toggle-label-on');
//   			$('#switchZhryBtn').removeClass('toggle-label-on');
//   			$('#switchDoorplateBtn').removeClass('toggle-label-on');
//   			}
   			
   			// 如果是点击是点击头部的 "防控区域"、"车辆卡口" 和 "人脸抓拍",则一直为其添加 "active" 类
   			if($(this).attr('attr-main') && $(this).attr('attr-main') == 'main'){
   				$(this).addClass('active');
   			}
   			
//   			// 切换 "重点人员" 、 "建筑"  和 "住户信息" 按钮的时候， 不跳转到检索列表
//   			if(attrLayer != 'IMPORTANT_PERSON' && attrLayer != 'BUILDING' && attrLayer != 'BUILDING_PERSON' && attrLayer != 'DOORPLATE' && !$(this).is('.disable')){
			$('#searchLayerList').attr('attr-active', 'active').addClass('active');
   			$('#layerList').removeClass('active');
   			$('#delBtn span').removeClass('hide');
//   			}
   			// 图层检索
	   		if($(this).hasClass('active')){
	   			// 检索
//	   			$('#searchLayerList').html("<div class='load-mask'><div class='loading'></div></div>");
	   			
//	   			resetResultHeight();
	   			
	   			switch(wmsName){
	   				case UI.map.layerNameMap.L_POLICE_GPS:{   //警力
	   					$('#listContent').removeClass('animation');
	   					// 加载动画
	   		   			$('#delBtn').addClass('hide');
	   		   			$('#loadBtn').removeClass('hide');
	   		   			var beforeHttp = new Date();
	   		   			
	   					UI.map.search({
			   				'layerName': wmsName,
			   				'keyWords': $('#searchLayer').val(),
			   				'pageNo': 1,
			   				'pageSize': 10,
			   				'callback': function(data){
			   					if(data && data.records){
			   						var afterHttp = new Date();
			   						if(afterHttp - beforeHttp < 60){
			   							setTimeout(function(){
			   								loadResultList (attrLayer, data);
			   							},60);
			   						}else{
			   							loadResultList (attrLayer, data);
			   						}
			   						
			   					}
			   				}
			   			})
			   			break;
	   				}
	   			  
//	   				case UI.map.layerNameMap.L_BUILDING: 	break;		//建筑
	   			case UI.map.layerNameMap.L_IMPORTANT_PERSON: 	// 重点人员(联调后台接口,非GIS接口)
	   					$('#listContent').removeClass('animation');
	   					// 加载动画
	   		   			$('#delBtn').addClass('hide');
	   		   			$('#loadBtn').removeClass('hide');
	   		   			
	   		   			// 重置参数
		   		   		personParams = {
		   		   			'BEGIN_TIME':  getNearstTime(12 * 3600 * 1000),
		   		   			'END_TIME': new Date().format('yyyy-MM-dd HH:mm:ss') ,
		   		   			'DB_IDS': '',
		   		   			'IS_AlGORITHM': 1,
		   		   			'pageNo': 1,
		   		   			'pageSize': 4,
		   		   			'KEYWORDS': $('#searchLayer').val()
			   		   	}
	   		   			importPData(intervalTime);
	   					break;	
//	   				case UI.map.layerNameMap.L_BUILDING_PERSON: break; //住户信息
//	   				case UI.map.layerNameMap.L_DOORPLATE: break; //门牌
	   				default: {
	   					$('#listContent').removeClass('animation');
	   					// 加载动画
	   		   			$('#delBtn').addClass('hide');
	   		   			$('#loadBtn').removeClass('hide');
	   		   			
	   					UI.map.search({
	   		              'layerName': wmsName,
	   		              'keyWords': $('#searchLayer').val(),
	   		              'pageNo': 1,
	   		              'pageSize': 10,
	   		              'popupHtmlFun': function(obj){
	   		                return getPopupHtmlByLayer(obj);
	   		              },
	   		              'callback': function(data){
	   		            	  if(data && data.records){
	   		            		loadResultList (attrLayer, data);
	   		            	  }
	   		              }
	   		            })
	   		            
	   				}
	   			}
	   			
	   		}
//   			}
	   	})
	   	
	   	
	   	// 向下翻页
		$('body').on('click','.pageNext',function(){
			var layerName = $(this).attr('attr-layer-name');
			var listName = $(this).attr('attr-list-name');
			if(!$(this).hasClass('disable')){
				searchMore(layerName, parseInt($(this).attr('attr-pageno'))+1,listName);
			}
		})
		
		// 向上翻页
		$('body').on('click','.pagePrev',function(){
			var layerName = $(this).attr('attr-layer-name');
			var listName = $(this).attr('attr-list-name');
			if(!$(this).hasClass('disable')){
				searchMore(layerName, parseInt($(this).attr('attr-pageno'))-1, listName);
			}
		})
		
		// 通过检索图标(放大镜)进行检索
		$('body').on('click','#search',function(){
			var _layerName = $('#searchTitle').attr('attr-name');
			var listName = $('#searchTitle').attr('attr-list-name');
			if(_layerName !=''){
				$('#listContent').removeClass('animation');
				$('#searchLayerList').attr('attr-active', '').removeClass('active');
				
				if(_layerName == 'L_IMPORTANT_PERSON'){  // 重点人员检索
					personParams.KEYWORDS = $('#searchLayer').val();
					$('#delBtn').addClass('hide');
					$('#loadBtn').removeClass('hide');
					$('#layerList').removeClass('active');
					$('#delBtn span').removeClass('hide');
					importPData(intervalTime);
					 $('#searchLayerList').attr('attr-active', 'active').addClass('active');
	   			}else{
	   				searchMore(_layerName, 1, listName);
	   			}

				// 跳转到检索列表
				$('#searchLayerList').attr('attr-active', 'active').addClass('active');
	   			$('#layerList').removeClass('active');
	   			$('#delBtn span').removeClass('hide');
	   			
	   			
			}else{ 	//若未选择图层，提示且不进行检索查询
				UI.util.alert("请选择图层","warn");
			}
		})
		
		// 回车，关键字搜索
		$('#searchLayer').keypress(function(e){
			if(((e.keyCode || e.which) == 13)) {
				var _layerName = $('#searchTitle').attr('attr-name');
				var listName = $('#searchTitle').attr('attr-list-name');		
				if(_layerName !=''){
					$('#searchLayerList').attr('attr-active', 'active');
					$('#searchLayerList').addClass('active');
		   			$('#layerList').removeClass('active');
		   			
		   			$('#listContent').removeClass('animation');
		   			$('#searchLayerList').attr('attr-active', '').removeClass('active');
		   			
					if(_layerName == 'L_IMPORTANT_PERSON'){  // 重点人员检索
						personParams.KEYWORDS = $('#searchLayer').val();
						$('#delBtn').addClass('hide');
						$('#loadBtn').removeClass('hide');
						$('#layerList').removeClass('active');
						$('#delBtn span').removeClass('hide');
						importPData(intervalTime);
						 $('#searchLayerList').attr('attr-active', 'active').addClass('active');
					}else{
						
			   			searchMore(_layerName, 1, listName);
					}
				}else if(_layerName == ''){	//若未选择图层，提示且不进行搜索
					UI.util.alert("请选择图层","warn");
				}
			}
		});
		
		// 点击图层筛选结果的列表,进行地图定位联动
		$('body').on('click','.layer-wrap dl',function(){
			var  curLayer = $('#searchTitle').attr('attr-name');
			var returnLayer = null;
			if(curLayer == UI.map.layerNameMap.L_SENCE){
				UI.util.showLoadingPanel();
				returnLayer = UI.map.selectSearchData($(this).attr('layerName'),$(this).attr('id'));
				UI.util.hideLoadingPanel();
			}else{
				returnLayer = UI.map.selectSearchData($(this).attr('layerName'),$(this).attr('id'));
			}
			if(!returnLayer){
				UI.util.alert("该数据超出地图范围","warn");
			}
		});
		
		// 人员信息检索列表的 "放大镜"
		$("body").on("click",".showSearchBtn",function(e){
			var $this = $(this);
			var imgUrl = $this.parents("dl").find("dt img").attr("src");
			var curSrc = matcher('/efacecloud/page/library/faceCaptureList.html/' + top.projectID).url;
			curSrc += '?imgUrl='+imgUrl;
			var options = {
					url: curSrc,
					title: '路人检索',
					width: 1200,
					height: 700,
					callback:function(resp){
						
					}
			};
			
			showWindow(options);
			if(e&&e.stopPropagation){
		        e.stopPropagation()
		    }else if(window.event){
		        window.event.cancelBubble=true;
		    }
		})
		
		//当前住户信息
		$("body").on("click",".showDetailBtn",function(e){
			var $this = $(this);
			var identityNumber = $this.data("identityNumber");
        	var title = $this.data("title");
        	UI.util.showCommonWindow("/datadefence/page/sbss/personDetail.html?identityNumber=" + identityNumber,title, $(top.window).width()*.95, $(top.window).height()*.9, null);
			
//			var imgUrl = $this.parents("dl").find("dt img").attr("src");
//			var url = '/datadefence/page/importantPersonLib/personInfo.html?imgUrl='+imgUrl+'&IDENTITY_ID='+IDENTITY_ID;
//			if($this.parents("dl").hasClass("criminal")){
//				url = '/datadefence/page/importantPersonLib/detailIframe.html?imgsrc='+imgUrl+'&IDENTITY_ID='+IDENTITY_ID;
//			}
//			var options = {
//		        url: url,
//		        title: '人员档案',
//		        width: 1200,
//		        height: 687,
//		        callback:function(resp){
//		        	
//		        }
//		    };
//
//			showWindow(options);
//			if(e&&e.stopPropagation){
//		        e.stopPropagation()
//		    }else if(window.event){
//		        window.event.cancelBubble=true;
//		    }
		})
}

/**
 *   加载检索结果列表
 *   @param { String } attrLayer: 图层模板文件名
 *   @param { String } data: 检索列表的结果数据
 * */
function loadResultList (attrLayer, data){
	//当请求成功，在展示检索结果列表
	$('#searchLayerList').attr('attr-active', 'active').addClass('active');
	  
	// 异步加载模板
	$('#searchLayerList').html('');
	var _html=syncGet('/datadefence/page/tmpls/layerList/'+attrLayer+'.html');
	var popupHtml = tmpl(_html, data);
	$('#searchLayerList').html(popupHtml);
//  $(".scroll-wrap").mCustomScrollbar();
	changeListHeight({
		resultData: data
   });
	
	// 清除加载动画
	$('#delBtn').removeClass('hide');
	$('#loadBtn').addClass('hide');

	$('#listContent').addClass('animation');
}

// 获取重点人员列表数据
function importPData (timeNum){
	getImportData();
	clearInterval(timerPerson);
	timerPerson = setInterval(function(){
		getImportData();
	}, timeNum);
	
}

function getImportData(){
	/*$.each($('.filterSub'),function(i,item){
		$(this).addClass('hide');
		 $('.filterItem').eq(i).removeClass('borderBottom');
	})*/
	UI.control.remoteCall('face/keyPersonAlarm/getKeyPersonAlarmList', personParams, function(resp) {
		if(resp.CODE == 0){  //查询成功
			// 渲染重点人员分类  
			var dataList  = resp.data;
			if(tpyes.length > 0){
				$('#listTmplBox').html(tmpl('listTmpl', dataList));
				// 清除加载动画
				changeListHeight();
				$('#delBtn').removeClass('hide');
				$('#loadBtn').addClass('hide');

				$('#listContent').addClass('animation');
				
			}else{
				// 首次加载重点人员模板
				var _html=syncGet('/datadefence/page/tmpls/layerList/IMPORTANT_PERSON.html');
				$('#searchLayerList').html(_html);
				UI.control.remoteCall('face/dispatchedAlarm/dbList', {}, function(result) {
					tpyes = result.data;
					$('#filterTmplBox').html(tmpl('filterTmpl', tpyes));
					$('#listTmplBox').html(tmpl('listTmpl', dataList));
					initTime("beginTime","endTime"); //初始化时间控件
					changeListHeight();
					// 清除加载动画
					$('#delBtn').removeClass('hide');
					$('#loadBtn').addClass('hide');

					$('#listContent').addClass('animation');
					
				},function(){
					UI.util.alert(resp.MESSAGE, 'warn');
				}, {}, true);
			}
			importantPersonLayers(dataList,true);
			
		}else{
			UI.util.alert(resp.MESSAGE, 'warn');
		}
		
		
	},function(){
		UI.util.alert("暂无重点人员信息", 'warn');
	}, {}, true);
}


/**
 *   根据可视区域高度,控制模板列表的高度
 *   @param {Object} {resultData:Object}  检索列表的数据
 *   @author: wenyujian
 * */
function changeListHeight(){
	var searchInitHeight = 632;
	if($('#layerListInfo .page-info-metro ').hasClass('hide')){
		$('#layerListInfo .scroll-wrap-content').css({'bottom': '0'})
	}
	if($('#searchLayerList').attr('attr-active') != ''){
		searchInitHeight = $('#layerTable').outerHeight() -1 + 12;
	}
	var listHeight = {
 		searchList: 682,		// 图层查询列表高度
 		resultList: searchInitHeight,	 // 检索列表的不出现滚动条时候的高度
 		resultInitHeight: 632,  // 检索结果列表的默认高度
 		alarmList: 572,         // 实时告警列表默认高度
 		setHeight: 653,         // 列表的滚动条区域的最大高度
 		nodataHeight: 200		// 当列表内容为空时的高度
 	}
	var bodyHeight = $(document.body).outerHeight(true); //浏览器时下窗口文档body的总高度 包括border padding margin
	var conLayerHeight =  bodyHeight - 190;	//图层区域最大的高度范围
	if($('#layerTable dl').length <1){
		$('#layerListInfo').outerHeight(200);
	} else if(listHeight.resultList+20< conLayerHeight){
		$('#layerListInfo').outerHeight(listHeight.resultList+20);
	}else{
		$('#layerListInfo').outerHeight(conLayerHeight);
	}
	$('#searchScroll').outerHeight(conLayerHeight-30);
	
	$(".scroll-wrap").mCustomScrollbar();
}

// 重置检索列表的高度: 由于每次检索加载列表，其高度都会通过js进行调整，因此在下一次请求开始前需要调整默认高度
function resetResultHeight(){
	var listHeight = {
 		resultInitHeight: 632  // 检索结果列表的默认高度
 	}
	
    var bodyHeight = $(document.body).outerHeight(true); //浏览器时下窗口文档body的总高度 包括border padding margin
    var conLayerHeight =  bodyHeight - 190;	//图层区域最大的高度范围
    
    // 控制图层结果列表的高度
	if(conLayerHeight < 50){
		$('#searchLayerList').outerHeight(0).css({'border':'none'});
	}else if(conLayerHeight < listHeight.resultInitHeight  && conLayerHeight > 50 ){
		$('#searchLayerList').outerHeight(conLayerHeight).css({'border-bottom':'2px solid #2b73d5'});
	}else if(conLayerHeight > listHeight.resultInitHeight) {
		$('#searchLayerList').outerHeight(listHeight.resultInitHeight).css({'border-bottom':'2px solid #2b73d5'});
	}
}


/**
 * 	图层二次检索
 *  @param { String } layerName: 图层名称
 *  @param { Number } pageNo: 页码
 *  @param { String } listName: 检索列表的模板名称	
 * 	@author: wenyuajian
 * */
function searchMore(layerName, pageNo, listName){
//	$('#searchLayerList').html("<div class='load-mask'><div class='loading'></div></div>");
	// 增加加载动画
	$('#delBtn').addClass('hide');
	$('#loadBtn').removeClass('hide');
	$('#layerList').removeClass('active');
	$('#delBtn span').removeClass('hide');
	
//	resetResultHeight();
	if( layerName == UI.map.layerNameMap.L_POLICE_GPS){   // 警力GPS检索
	    UI.map.search({
	      'layerName': layerName,
	      'keyWords': $('#searchLayer').val(),
	      'pageNo': pageNo,
	      'pageSize': 10,
	      'callback': function(data){
	        if(data && data.records){
	          //当请求成功，在展示检索结果列表
              $('#searchLayerList').attr('attr-active', 'active').addClass('active');
              
	          // 异步加载模板
	          $('#searchLayerList').html('');
	          var _html=syncGet('/datadefence/page/tmpls/layerList/'+listName+'.html');
	          var popupHtml = tmpl(_html, data);
	            $('#searchLayerList').html(popupHtml);
//	            $(".scroll-wrap").mCustomScrollbar();
	            changeListHeight({
	            	resultData: data
	            });
	            
	            // 清除加载动画
	            $('#delBtn').removeClass('hide');
		   		$('#loadBtn').addClass('hide');
		   		
		   		$('#listContent').addClass('animation');
	        }
	      }
	    })
	  }else{  //一般图层的检索
	    UI.map.search({
	      'layerName': layerName,
	      'keyWords': $('#searchLayer').val(),
	      'pageNo': pageNo,
	      'pageSize': 10,
	      'popupHtmlFun': function(obj){
	        return getPopupHtmlByLayer(obj);
	      },
	      'callback': function(data){
	        if(data && data.records){
	         //当请求成功，在展示检索结果列表
         	  $('#searchLayerList').attr('attr-active', 'active').addClass('active');
         	  
	          // 异步加载模板
	          $('#searchLayerList').html('');
	          var _html=syncGet('/datadefence/page/tmpls/layerList/'+listName+'.html');
	          var popupHtml = tmpl(_html, data);
	            $('#searchLayerList').html(popupHtml);
//	            $(".scroll-wrap").mCustomScrollbar();
	           
	            changeListHeight({
	            	resultData: data
	            });
	            
	            // 清除加载动画
	            $('#delBtn').removeClass('hide');
		   		$('#loadBtn').addClass('hide');
		   		
		   		$('#listContent').addClass('animation');
	        }
	      }
	    })
	 }
}


/**
 * 获取自定义的气泡模板
 * @param layerName wmslayer弹出气泡的回调getPopup(layer)传回的layer.feature.layerName
 * @returns {string} html模版
 *
 */
function getPopupHtmlByLayer(obj,params,ARtype, featureId, name, DEVICE_ID) {
	console.log(obj);
    var popupHtml = '';
    var layerName = '';
	if(obj.properties && obj.properties.count){
		layerName = obj.layerName;
	}else{
		layerName = obj.id.split('.')[0];
	}
	// 聚合数据，且非 "人员信息" 图层, 不作处理
//	if(obj.properties && obj.properties.count && obj.properties.layerName != UI.map.layerNameMap.L_PERSON){
//	if(obj.properties && obj.properties.count && obj.properties.layerName != UI.map.layerNameMap.L_BUILDING_PERSON){
//		return ;
//	}
        switch (layerName) {
            case 'L_GRID': {
                // 场景:网格
                var options = {
                    url: popupDetailUrls['L_GRID'],
                    width: 430,
                    height: 430
                };
                popupHtml = tmpl('<iframe src="{%=o.url%}" name="{%=o.title%}" width="{%=o.width%}" height="{%=o.height%}" frameborder="0" seamless="seamless" ></iframe>', options);
                break;
            }
            case 'L_SENCE': {
                //场景:防控场景
            	var newfeatureId = featureId || obj.id;
            	var newName = name || obj.properties.NAME;
            	var DEVICE_ID = DEVICE_ID || obj.properties.FULL_VIEW_CAMERA_ID;
            	if(ARtype) {}else{
            		var ARtype = obj.properties.FULL_VIEW_CAMERA_ID? 'AR': 'NOTAR';
            	}
                var options = {
                    url: popupDetailUrls['L_SENCE'] + '?featureId='+newfeatureId+'&ARtype='+ARtype+'&NAME='+newName+'&DEVICE_ID='+DEVICE_ID,
                    width: 670,
                    height: 360
                };
                popupHtml = tmpl('<iframe src="{%=o.url%}" name="{%=o.title%}" width="{%=o.width%}" height="{%=o.height%}" frameborder="0" seamless="seamless"></iframe>', options);
                break;
            }
            case'L_PERSON':
            case 'L_DOORPLATE' : {
                //门牌
            	var popupTmpl=syncGet(popupDetailUrls[layerName]);
                popupHtml = tmpl(popupTmpl, obj.properties);
                break;
            }
            default: {
                // 警力:警员 警车
                // 监控:卡口
                // 出入口:门禁 停车场
                // 手机:wifi 电围
                // 房屋:住宅 企事业单位 场所
                // 车辆:出租车 公交车 特种车
                // 人员:民政
            	
            	// 聚合数据，且是"人员信息" 图层
//            	if(obj.properties && obj.properties.count && obj.properties.layerName == UI.map.layerNameMap.L_PERSON){
//            	if(obj.properties && obj.properties.count && layerName == UI.map.layerNameMap.L_BUILDING_PERSON){
//            		var _features = obj.properties.features.split(',');
//            		var personIds = '';
//            		$.each(_features,function(index, item){
//            			personIds == ''? personIds += item.split('.')[1] : personIds += (','+item.split('.')[1]);
//            		});
//            		var options = {
//            			url:'/datadefence/page/mapLayer/personList.html?PERSON_IDS='+personIds+'&count='+obj.properties.count,
//            			 width: 650,
//                         height: 560
//            		}
//            		popupHtml = tmpl('<iframe src="{%=o.url%}" name="{%=o.title%}" width="{%=o.width%}" height="{%=o.height%}" frameborder="0" seamless="seamless"></iframe>', options);
//                    break;
//                    
//            	}
            	if(layerName == UI.map.layerNameMap.L_BUILDING_PERSON &&  obj.geometry && obj.geometry.type == 'MultiPolygon'){
            		var params = {
            			'BUILD_CODES':	obj.properties.BUILD_CODE,
            			'pageNo': 1,
            			'pageSize': 10
            		}
            		UI.control.remoteCall('fsfr/person/query',params, function (resp) {
            			if(resp && (resp.data || resp.result)){
            				if(resp.data.count == 0){
            					UI.util.alert("暂无数据");

            				}else if(resp.data.count >0){
            					var options = {
        	            			url:'/datadefence/page/mapLayer/buildingPerson.html?BUILD_CODES='+obj.properties.BUILD_CODE,
        	            			 width: 650,
        	                         height: 560
        	            		}
            					popupHtml = tmpl('<iframe src="{%=o.url%}" name="{%=o.title%}" width="{%=o.width%}" height="{%=o.height%}" frameborder="0" seamless="seamless"></iframe>', options);
            				}
            			}
                   	});
            		
            	}else{
            		UI.control.remoteCall(popupDetailUrls[layerName],getHttpParams(obj), function (resp) {
            			if(resp && (resp.data || resp.result)){
            				if(layerName == UI.map.layerNameMap.L_BUILDING ){
            					resp.data.AREA = obj.properties.AREA;
            				}
            				if(layerName == UI.map.layerNameMap.L_BUILDING_PERSON && resp.data.length == 0){
            					return ;
            				}
            				// 若是防控区域 和住户信息,拼接图片前缀
            				 var popupTmpl=syncGet('/datadefence/page/tmpls/popup/'+layerName+'.html');
                             popupHtml = tmpl(popupTmpl, resp.data || resp.result);
            			}
                   	});
            	}
            }
        } 
         return popupHtml;	 
	
}

function getMP(id){
	alert(id);
}

/**
 * 	获取GPS自定义气泡模板
 *  @param { Object } obj: 图标信息
 * 	@author： wenyujian
 * */
function getGPSPopupHtmlByLayer(obj){
	var popupHtml = '';
	var layerName = UI.map.layerNameMap.L_POLICE_GPS;
	/*UI.control.remoteCall(popupDetailUrls[layerName],{'USER_CODE': obj.userCode}, function (resp) {
		if(resp && resp.data){
			 var popupTmpl=syncGet('/datadefence/page/tmpls/popup/'+layerName+'.html');
             popupHtml = tmpl(popupTmpl, resp.data);
		}
   });*/
	var popupTmpl=syncGet('/datadefence/page/tmpls/popup/'+layerName+'.html');
	var props = obj.properties;
	var data = {
			PIC: props.PIC,
			USER_NAME: props.USER_NAME,
			POLICE_ID: props.POLICE_ID,
			ORG_NAME: props.DEPT_NAME,
			TELEPHONE: props.TELEPHONE
	};
    popupHtml = tmpl(popupTmpl, data);
	return popupHtml;
}

/**
 * 获取气泡详情的参数
 * @param { Object } obj: 图标信息
 * @author: wenyujian
 * */
function getHttpParams(obj){
	var params ={};
	var layerName = obj.id.split('.')[0];
	switch(layerName){
		case 'L_QYDW':				params = {'RELATION_ID': obj.properties.UNIT_CODE };
			break;
		case 'L_GOVERNMENT':		params = {'RELATION_ID': obj.properties.UNIT_CODE };
			break;
		case 'L_GTGSH':				params = {'RELATION_ID': obj.properties.UNIT_CODE };
			break;
		case 'L_SOCIALGP':			params = {'RELATION_ID': obj.properties.UNIT_CODE };
			break;
		case 'L_INSTITUTIONS':		params = {'RELATION_ID': obj.properties.UNIT_CODE };
			break;
		case 'L_IMPORTANT_PERSON': 	params = {'ALARM_ID': obj.properties.ALARM_ID }; 
			break;
		case 'L_BUILDING': 			params = {'BUILDING_CODE': obj.properties.ID };
			break;	
		case 'L_PERSON': 			params = {'PR_IDS': obj.id.split('.')[1]};
			break;	
		case 'L_BUILDING_PERSON': 	params = {'PR_IDS': obj.id.split('.')[1]};
			break;	
		default:					params = {'DEVICE_ID': obj.id.split('.')[1]};
	}
	return  params;
}

// 初始化时间控件
function initTime(start,end){

    var now = new Date();
    var dateTime = UI.util.getDateTime("today","yyyy-MM-dd HH:mm:ss");
    var executionStartTime = $('body').find('#'+start);
    var executionEndTime = $('body').find('#'+end);

    executionStartTime.val(dateTime.bT);
    executionEndTime.val(dateTime.eT);


    /*时间初始化*/
    executionStartTime.click(function(){
        WdatePicker({
            startDate:'%y-#{%M}-%d 00:00:00',
            dateFmt:'yyyy-MM-dd HH:mm:ss',
            alwaysUseStartDate:true,
            maxDate:'#F{$dp.$D(\''+end+'\')}'
        });
    });


    /*时间初始化*/
    executionEndTime.click(function(){
        WdatePicker({
            startDate:'%y-#{%M}-%d %H:%m:%s',
            dateFmt:'yyyy-MM-dd HH:mm:ss',
            alwaysUseStartDate:true,
            maxDate:'#F{$dp.$D(\''+end+'\')}'
        });
    });

}

function registerListeners() {
	// 重点人员告警的相关事件
	importantEvent();
	
    // 注册监听事件：地图气泡中的"详情"按钮
    $('body').on('click', '[data-ctrl-detail]', function (e) {
    	var $this = $(this);
        var ctrlDetail = $(this).data("ctrl-detail");

        var options = {};
        var NAME = $this.attr('NAME');
        var DEVICE_ID = $this.attr('DEVICE_ID');

        //打开图层相应的详情页面
        if (ctrlDetail) {
            switch (ctrlDetail) {
                case 'JMD'://弹出楼栋信息
                	var doorPlate = $this.data("door-plate");
                	var title = $this.data("title");
                    UI.util.openCommonWindow({
                        src: '/datadefence/page/multiDimensional/doorplateDetails.html?DOOR_PLATE='+doorPlate,
                        width: 1100,
                        windowType: 'right',
                        title: title,
                        parentFrame: 'currentPage'
                    });
                break;
                case 'LOCATION':
                    options = {
                        url: '/datadefence/page/multiDimensional/employeesList.html',
                        title: '从业人员',
                        width: 700,
                        height: 600
                    };
                    showWindow(options);
                    break;
//                case 'POLICE':
//                    options = {
//                        url: '/efacecloud/page/dispatched/linkPoliceInquiry.html',
//                        title: '任务下发',
//                        width: 900,
//                        height: 700
//                    };
//                    showWindow(options);
//                    break;
                case 'ZDRY_SFHC':
                	openWindowPopup('identity',$(this).attr("url"));
                	break;
                case 'CAMERA':
                    options = {
                        url: '/datadefence/page/multiDimensional/camera.html?DEVICE_ID='+DEVICE_ID,
                        title: NAME,
                        width:1072,
    					height:570
                    };
                    showWindow(options);
                    break;
                case 'CAMERA_LLZP':
                    options = {
                        url: '/datadefence/page/multiDimensional/faceCamera.html?DEVICE_ID='+DEVICE_ID,
                        title: NAME,
                        width:960,
    					height:636
                    };
                    showWindow(options);
                    break;
                case 'CAMERA_CLZP':
                    options = {
                        url: '/datadefence/page/multiDimensional/vehicleCamera.html?DEVICE_ID='+DEVICE_ID,
                        title: NAME,
                        width:1040,
    					height:630
                    };
                    showWindow(options);
                    break;
                case 'CAMERA_LYJGH':
                    options = {
                        url: '/datadefence/page/multiDimensional/structuredCamera.html?DEVICE_ID='+DEVICE_ID,
                        title: NAME,
                        width:1000,
    					height:625
                    };
                    showWindow(options);
                    break;
                case 'ZDRY_TRAJECTORY':
                	var now = new Date();
                	var time = UI.util.getDateTime('nearMonth','yyyy-MM-dd HH:mm:ss');
                	time.eT = now.format('yyyy-MM-dd HH:mm:ss');
                	openWindowPopup('track',$(this).attr('url'),time);
                    break;
                case 'multiple_track'://多轨并查
                	$('.map').addClass('hide');
            		$('.3DMap').removeClass('hide');
            		var center = UI.map.getMap().getCenter();
                	var params = {
                    		'PERSON_ID': $('body').find('#specialman').attr('person-id'),
                    		'LNG':center.lng,
                    		'LAT':center.lat
                    	}
            		$('.3DMapIframe').attr('src',"/gis/map3D.html?PERSON_ID="+params.PERSON_ID+"&LNG="
            				+params.LNG+"&LAT=" + params.LAT);
            		UI.map.showBaseMap(3);

                	break;
                case 'DOORS_HISTORY':
                    options = {
                        url: '/datadefence/page/mapLayer/doorHistoryList.html?deviceId='+DEVICE_ID,
                        title: '门禁历史列表',
                        width:984,
    					height:720
                    };
                    showWindow(options);
                    break;
                case 'WIFI_HISTORY':
                    options = {
                        url: '/datadefence/page/mapLayer/wifiHistoryList.html?deviceId='+DEVICE_ID,
                        title: 'WIFI历史列表',
                        width:820,
    					height:660
                    };
                    showWindow(options);
                    break;
                case 'PERSON_DETAIL'://人员详情
                	var identityNumber = $this.data("identityNumber");
                	var title = $this.data("title");
                	UI.util.showCommonWindow("/datadefence/page/sbss/personDetail.html?identityNumber=" + identityNumber,title, $(top.window).width()*.95, $(top.window).height()*.9, null);
                    break;
            }
        }
    })

    /**
     * 注册监听事件：地图气泡中的"监控"按钮 
     * 根据layerID更新popupHtml，实时刷新iframe
     *
     * @author huangzhenjie
     */
    $('body').on('click', '[data-ctrl-monitor]', function () {
        var ctrlMonitor = $(this).data("ctrl-monitor");
        var NAME = $(this).attr('NAME');
        var DEVICE_ID = $(this).attr('DEVICE_ID');

        if (ctrlMonitor) {
            var popupHtml = '';
            switch (ctrlMonitor) {
                case 'CAMERA_LLZP': {// 人脸抓拍
                    var options = {
                        url: '/datadefence/page/mapLayer/realFaceList.html?deviceId='+DEVICE_ID,
                        width: 410,
                        height: 355
                    };
                    popupHtml = tmpl('<iframe src="{%=o.url%}" name="{%=o.title%}" width="{%=o.width%}" height="{%=o.height%}" frameborder="0" seamless="seamless"></iframe>', options);
                    break;
                }
                case 'CAMERA_CLZP': {
                    var options = {
                        url: '/datadefence/page/mapLayer/realCarList.html?deviceId='+DEVICE_ID+'&source=CAMERA_CLZP',
                        width: 380,
                        height: 400
                    };
                    popupHtml = tmpl('<iframe src="{%=o.url%}" name="{%=o.title%}" width="{%=o.width%}" height="{%=o.height%}" frameborder="0" seamless="seamless"></iframe>', options);
                    break;
                }
                case 'WIFI': {
                    var options = {
                        url: '/datadefence/page/mapLayer/realWifiMacList.html?deviceId='+DEVICE_ID,
                        width: 600,
                        height: 390
                    };
                    popupHtml = tmpl('<iframe src="{%=o.url%}" name="{%=o.title%}" width="{%=o.width%}" height="{%=o.height%}" frameborder="0" seamless="seamless"></iframe>', options);
                    break;
                }
                case 'DOORS': {
                    var options = {
                        url: '/datadefence/page/mapLayer/realDoorList.html?deviceId='+DEVICE_ID,
                        width: 520,
                        height: 466
                    };
                    popupHtml = tmpl('<iframe src="{%=o.url%}" name="{%=o.title%}" width="{%=o.width%}" height="{%=o.height%}" frameborder="0" seamless="seamless"></iframe>', options);
                    break;
                }
                case 'CAMERA_DZWL': {
                    var options = {
                        url: '/datadefence/page/mapLayer/realDzwlList.html?deviceId='+DEVICE_ID,
                        width: 610,
                        height: 390
                    };
                    popupHtml = tmpl('<iframe src="{%=o.url%}" name="{%=o.title%}" width="{%=o.width%}" height="{%=o.height%}" frameborder="0" seamless="seamless"></iframe>', options);
                    break;
                }
                case 'PARKS': {
                	var options = {
                        url: '/datadefence/page/mapLayer/realCarList.html?deviceId='+DEVICE_ID+'&source=PARKS',
                        width: 320,
                        height: 320
                    };
                    popupHtml = tmpl('<iframe src="{%=o.url%}" name="{%=o.title%}" width="{%=o.width%}" height="{%=o.height%}" frameborder="0" seamless="seamless"></iframe>', options);
                    break;
                }
            }
            UI.map.getMap()._popup && UI.map.getMap()._popup.setContent(popupHtml);
        }
    });
    
    // 建筑图层详情， 点击查看更多
    $('body').on('click','#plateMore', function(){
    	$(this).addClass('hide');
    	$('#doorPlate span').removeClass('hide');
    	$('#plateLess').removeClass('hide');
    })
    
    // 建筑图层详情, 点击收起门牌列表
    $('body').on('click', '#plateLess', function(){
    	$(this).addClass('hide');
    	$('#plateMore').removeClass('hide');
    	$('#doorPlate .plateItem').each(function(i,n){
    		if(i>2){
    			$(this).addClass('hide');
    		}
    	})
    })
}


// 异步请求方法
var syncGet = function (url) {
    var data=null;
    $.ajax({
        url: url,
        async: false,
        success: function (resp) {
            data=resp;
        },
        error: function (error) {
            data=error;
        }
    });
    return data;
};


//关闭3D地图
function hide3DMap(){
	var $3DMainContent = $('#3DMap');
	$3DMainContent.addClass('hide');
	$('#map').removeClass('hide');
	UI.map.showBaseMap(1);
}

/**
 * 	地图设置面板 相关事件： 允许多图层同时查看
 *  @author: wenyujian
 * */
function controlMultipleLayer(){
	
	// 控制 "图层设置"面板 的显示/隐藏, 通过面板属性 "attr-active"的值来判断是否被打开了
    $('body').on('click', '#layerSetBtn', function(){
    	// 清除图层检索
	    UI.map.clearSearchLayers();
	    	 
    	// 隐藏图层查询列表
    	$('#layerList').removeClass('active');
    	$('#listContent').removeClass('animation');
		setTimeout(function(){
			var _html=syncGet('/datadefence/page/tmpls/layerList/multipleLayerList.html');
			$('#layerSet').html(_html);
			$('#layerSet').attr('attr-active', 'active');
			changeListHeight();
			$('#multipleCon').mCustomScrollbar();
			$('#listContent').addClass('animation');
		},200);
		
//		//将 "重点人员" 、 "建筑" 和 "人员信息" 的开关 关闭
//		$('#switchBuildingBtn').removeClass('toggle-label-on');
//		$('#switchZdryBtn').removeClass('toggle-label-on');
//		$('#switchZhryBtn').removeClass('toggle-label-on');
//		$('#switchDoorplateBtn').removeClass('toggle-label-on');
		
		// 隐藏头部的搜索条
		$('#searchBar').toggleClass('hide');
		
		// 重置 图层查询列表信息
		var curLayerName = $('#searchTitle').attr('attr-name');
		if( curLayerName != ''){
			UI.map.setLayerVisible(curLayerName, false);
	    	// 图层选中状态
	    	$('body').find('#layerList .item span').each(function(){
   		   	    $(this).removeClass('active');
   		   	});
	    	// 重设搜索条的信息
	    	$('#searchTitle').html('图层').attr('attr-name','').attr('attr-list-name','');
	    	
	    	$('#searchLayer').attr('placeholder', placeholder['DEFAULT']);
		}
    })
    
    // 退出 " 图层设置 "面板，回到图层查询面板
    $('body').on('click', '#returnSearchList', function(){
    	// 显示头部的搜索条
		$('#searchBar').toggleClass('hide');
		
		$('#layerSet').attr('attr-active', '');
		$('#layerSet').html('');
		$('#layerList').addClass('active');
		
		// 隐藏在  "图层设置面板" 显示的图层
		for(var i=0; i < curMultipleList.length; i++){
			UI.map.setLayerVisible(curMultipleList[i], false);
		}
    })
    
    
	// 控制图层的显示与隐藏
	$('body').on('click', '#layerSetPanel .item', function(e){
		var $this = $(this);
		
		if($this.is('.disable')){
			return false ;
		}
		$this.toggleClass('active');
		var layerId = $this.attr('layerId');
		
		curMultipleList.length = 0;
		var activeLists = $('#layerSetPanel p.active');
		for(var i=0; i< activeLists.length; i++){
			if(activeLists.eq(i).is('.active')){
				curMultipleList.push(activeLists.eq(i).attr('layerId'));
			}
		}
		
		// 分三种情况处理： 普通图层、 重点人员、 GPS 
		switch(layerId){
			// 重点人员：
			case UI.map.layerNameMap.L_IMPORTANT_PERSON: {
				if($this.is('.active') && firstClusterFlat == 0){
					// 实例化重点人员图层
   	     			UI.map.initClusterLayer(function(obj){
   	     				return getPopupHtmlByLayer(obj);
   	     			});
   	     			firstClusterFlat = 1;
				}
				break;
			}
			
			//GPS： 如警力
			/*case UI.map.layerNameMap.L_POLICE_GPS: {
				if($this.is('.active') && firstPOLICEGPS == 0){
					var options = {
		   				layerName: layerId,
		   				popupHtmlFun: function(obj){
		   					return getGPSPopupHtmlByLayer(obj);
		   				}
		   			}
		   			UI.map.initGpsLayer(options);  //该方法只执行一次
		   			firstPOLICEGPS = 1;
				}
				break;
			}*/
		}
		
		// 控制图层显示/ 隐藏
		if($this.is('.active')){
			UI.map.setLayerVisible(layerId, true);
		}else{
			UI.map.setLayerVisible(layerId, false);
		}
		
	})
}


// 底图切换
function switchBaseMap(){
	$('body').on('click', '#switchMap .map-base', function(){
    	var $this = $(this);
    	$('.map-selected').removeClass('map-selected');    	
    	$this.addClass('map-selected');
    	var index = $this.attr('dataindex');
    	$('.map').addClass('hide');
    	if(index==3){
    		$('#3DMap').removeClass('hide');
    		$('#3DMapIframe').attr('src',"/gis/map3D.html");
    	}
    	else{
    		$('#map').removeClass('hide');
    	}
    	UI.map.showBaseMap(index);
    });
}
/**
 * 更新gps数据（提供给顶层父页面socket调用）
 * @param data
 */
function updateGPSMsg(data){
	UI.map.updateGPSMessage(UI.map.layerNameMap.L_POLICE_GPS, data);
}
