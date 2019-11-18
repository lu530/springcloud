//转换证件类型
function renderIdentityType(type){
	// debugger
	var str = '';
	switch(type){
	case '1':
		str='身份证';
		break;
	case '2':
		str='护照';
		break;
	case '3':
		str='驾驶证';
		break;
	case '4':
		str='港澳通行证';
		break;
	case '14':
		str = '普通护照';
		break;
	default:
		str = '--';
	}
	return str;
}

/**
 * 此js为静态小库人脸检索页面所专用
 */
/*************************常量***********************************/
var UPLOAD_RETRIEW_TRUE = 1; //上传图片在人脸库中引擎检索标志
var UPLOAD_RETRIEW_FALSE = 0; //不是上传图片在人脸库中引擎检索标志


//项目级全局变量
var global = {
	baseUrl : "/oss/v1/eface/facelib/",    //图片上传服务
	flyName: isBlack() ? '公安部' : '飞识' // 飞识的名称，在外籍人项目中有别名
}

var globalCache = {}

//记录是否上传各种文件类型
var fileType = null;
var fileNum = 0;
var fileName = null;

//初始化树基本配置
var orgTreeOpts = {
		isShowFolder: true,
		multiple: true,
		dropdownWidth: '100%',
		search: {
			enable: true,              //是否启用搜索
			searchTreeNode: true,				//搜索参数 key|value为文本框的ID
			ignoreEmptySearchText: true,
			searchTextId: 'deviceNames',
			searchBtnId: 'searchs'
		}
};

var deviceModule = '/portal';  // 感知设备默认加载portal模块的
function getDeviceModule() {
    $.ajax({
        url: '/portal/page/device/deviceList.html',
        async: false,
        success: function(data){
            deviceModule = '/portal'
        },
        error: function(error) {
            deviceModule = '/connectplus'
        }
    })
}


//常用数据字典
var CONSTANTS = {
        ZALX: {
            '01050100': '抢劫',
            '01050200': '盗窃',
            '01050300': '诈骗',
            '01050400': '抢夺',
            '01059900': '其他'
        },
        SURVEIL_CAR_TYPE: {
            "0": "涉案",
            "1": "盗抢",
            "2": "维稳",
            "3": "其他"
        },
        AGE: {     //年龄段
            '-1': '全部',
            '1': '少年',
            '2': '青年',
            '3': '中年',
            '4': '老年',
            '5': '自定义'
        },
        LYLX: {   //抓拍图片来源类型
            '-1': '其他',
            '0': '自建',
            '1': '火车',
            '2': '民航',
            '3': '汽车',
            '4': '住宿',
            '5': '网吧',
            '6': '出入境',
            '7': '涉警'
        },
        SF: {//算法类型
        '10': '全部',
        '112': '云从',
        '116': '海康',
        '117': '优图',
        '111': '依图',
        '110': '商汤',
        '113': 'Face++',
        '115': '云天励飞',
        '114': '像素'
    },
    SFLIST: [//算法类型
        {ID:'10',NAME:'全部'},
        {ID:'112',NAME: '云从'},
        {ID:'116',NAME: '海康'},
        {ID:'117',NAME: '优图'},
        {ID:'111',NAME: '依图'},
        {ID:'110',NAME: '商汤'},
        {ID:'113',NAME: 'Face++'},
        {ID:'115',NAME: '云天励飞'},
        {ID:'114',NAME: '像素'}
    ],
    RLK:[ //人脸库
		{DB_ID: '-1',DB_NAME:'全部'},
		{DB_ID: '88888888888888888888888888880007',DB_NAME:'全国在逃人员'},
		{DB_ID: '88888888888888888888888888880016',DB_NAME:'常住人口'},
		{DB_ID: '88888888888888888888888888880017',DB_NAME:'流动人口'},
		{DB_ID: '88888888888888888888888888880006',DB_NAME:'警综犯罪嫌疑人库'},
		{DB_ID: '2599570e4ddd49fdaaa102fd7329e415',DB_NAME:'新疆人员库'},
		{DB_ID: '88888888888888888888888888880015',DB_NAME:'新疆籍网上在逃'},
		{DB_ID: '88888888888888888888888888880025',DB_NAME:'在粤维族人员'},
		{DB_ID: '88888888888888888888888888880036',DB_NAME:'重点人员-全国涉毒'},
		{DB_ID: '88888888888888888888888888880037',DB_NAME:'重点人员-全国刑事犯罪前科'},
		{DB_ID: '88888888888888888888888888880038',DB_NAME:'重点人员-全国肇事精神病人'},
		{DB_ID: '88888888888888888888888888880010',DB_NAME:'广东监狱'},
		{DB_ID: '88888888888888888888888888880039',DB_NAME:'重点人员-全国重点上访人员'},
		{DB_ID: '88888888888888888888888888880002',DB_NAME:'省违法犯罪库-拘留所'},
		{DB_ID: '88888888888888888888888888880003',DB_NAME:'省违法犯罪库-戒毒所'},
		{DB_ID: '88888888888888888888888888880032',DB_NAME:'陆丰籍涉毒在逃人员'},
		{DB_ID: '88888888888888888888888888880009',DB_NAME:'布控库'},
		{DB_ID: '88888888888888888888888888880021',DB_NAME:'境外人员'},
		{DB_ID: '88888888888888888888888888880020',DB_NAME:'从业人员'},
		{DB_ID: '88888888888888888888888888880023',DB_NAME:'人口注销库'},
		{DB_ID: '88888888888888888888888888880048',DB_NAME:'预备人员'},
		{DB_ID: '88888888888888888888888888880008',DB_NAME:'省违法犯罪库-收教所'},
		{DB_ID: '88888888888888888888888888880011',DB_NAME:'省违法犯罪库-看守所'},
		{DB_ID: '88888888888888888888888888880012',DB_NAME:'省违法犯罪库-劳教所'},
		{DB_ID: '88888888888888888888888888880049',DB_NAME:'溯源专案'},
		{DB_ID: '88888888888888888888888888880050',DB_NAME:'广铁-违法犯罪人员'},
		{DB_ID: '88888888888888888888888888880051',DB_NAME:'广铁-抓获在逃人员'}
	],
    // 人员类型
    RYLX:{
	    '3':"国外",
        '2':"国内",
        '1':"港澳台"
    }
}
initRlk();
function initRlk(){
	UI.control.remoteCall('face/common/feishiAlgoLib', {}, function(resp) {
		var data = resp.DATA ? JSON.parse(JSON.stringify(resp.DATA).replace(/id/g,"DB_ID").replace(/name/g,"DB_NAME")) : [];
		data.push({DB_ID: '-1',DB_NAME:'全部'});
		CONSTANTS.RLK = data;
	}, function() {}); 
}

/*function initCriminalMeans(ref,id){
	var resp = {"list":[{"pid":"01050100","id":"01050101","text":"入户抢劫案"},{"pid":"01050100","id":"01050102","text":"拦路抢劫案"},{"pid":"01050100","id":"01050103","text":"在公共交通工具上抢劫案"},{"pid":"01050100","id":"01050110","text":"抢劫银行或其他金融机构案"},{"pid":"01050100","id":"01050111","text":"抢劫珠宝店案"},{"pid":"01050100","id":"01050112","text":"抢劫提(送)款员案"},{"pid":"01050100","id":"01050113","text":"抢劫运钞车案"},{"pid":"01050100","id":"01050120","text":"抢劫出租汽车案"},{"pid":"01050100","id":"0105012A","text":"抢劫摩托车案"},{"pid":"01050100","id":"0105012B","text":"抢劫其他汽车案"},{"pid":"01050100","id":"0105012C","text":"抢劫电动车案"},{"pid":"01050100","id":"01050130","text":"抢劫军用物资案"},{"pid":"01050100","id":"01050131","text":"抢劫抢险、救灾、救济物资案"},{"pid":"01050100","id":"01050132","text":"抢劫牲畜案"},{"pid":"01050100","id":"01050140","text":"抢劫精神药物和麻醉药品案"},{"pid":"01050100","id":"01050150","text":"冒充军警持枪抢劫案"},{"pid":"01050100","id":"01050160","text":"持枪抢劫案"},{"pid":"01050100","id":"0105016A","text":"持枪抢劫金融场所案"},{"pid":"01050100","id":"0105016B","text":"持枪抢劫机动车案"},{"pid":"01050100","id":"01050199","text":"其它抢劫案"}]}
	if(ref == "#theft"){
		resp.list = [{"pid":"01050200","id":"01050201","text":"入室盗窃案"},{"pid":"01050200","id":"01050202","text":"盗窃精神药物和麻醉药品案"},{"pid":"01050200","id":"01050203","text":"盗窃易制毒化学品案"},{"pid":"01050200","id":"01050204","text":"盗窃金融机构案"},{"pid":"01050200","id":"01050210","text":"盗窃运输物资案"},{"pid":"01050200","id":"01050211","text":"盗窃铁路器材案"},{"pid":"01050200","id":"01050212","text":"盗窃珍贵文物案"},{"pid":"01050200","id":"01050216","text":"盗窃电脑芯片案"},{"pid":"01050200","id":"01050220","text":"盗窃货物案"},{"pid":"01050200","id":"01050221","text":"盗窃旅财案"},{"pid":"01050200","id":"01050222","text":"盗窃路财案"},{"pid":"01050200","id":"01050223","text":"盗窃汽车案"},{"pid":"01050200","id":"01050224","text":"盗窃摩托车案"},{"pid":"01050200","id":"01050225","text":"盗窃电动车案"},{"pid":"01050200","id":"01050227","text":"盗窃自行车案"},{"pid":"01050200","id":"01050230","text":"盗窃保险柜案"},{"pid":"01050200","id":"01050235","text":"盗用他人通讯设施案"},{"pid":"01050200","id":"01050236","text":"盗接通信线路案"},{"pid":"01050200","id":"01050237","text":"盗窃牲畜案"},{"pid":"01050200","id":"01050238","text":"盗窃车内财物案"},{"pid":"01050200","id":"01050240","text":"扒窃案"},{"pid":"01050200","id":"01050299","text":"其它盗窃案"}];
	}
	if(ref == "#fraud"){
		resp.list = [{"pid":"01050300","id":"01050301","text":"电话诈骗案"},{"pid":"01050300","id":"01050302","text":"网络诈骗案"},{"pid":"01050300","id":"01050303","text":"盗刷银行卡"},{"pid":"01050300","id":"01050304","text":"手机短信诈骗"},{"pid":"01050300","id":"01050305","text":"征婚诈骗"},{"pid":"01050300","id":"01050306","text":"招工诈骗"},{"pid":"01050300","id":"01050399","text":"其它诈骗案"}];
	}
	if(ref == "#rob"){
		resp.list = [{"pid":"01050400","id":"01050401","text":"飞车抢夺"},{"pid":"01050400","id":"01050402","text":"路面抢夺"},{"pid":"01050400","id":"01050499","text":"其它抢夺"}];
	}
	if(ref == "#other"){
		resp.list = [{"pid":"01059900","id":"010599000000","text":"其它手段"}];
	}
		$(ref).html(tmpl("criminalMeansListTmpl",resp.list));
}*/

//时间筛选
function initDateTimeControl(option){
	var $ele=option.elem,
	$beginTime=option.beginTime,
	$endTime=option.endTime,
	callback=option.callback,
	format=option.format||'yyyy-MM-dd HH:mm:ss';
	var formatStartB = format=='yyyy-MM-dd HH:mm:ss'?'%y-#{%M}-%d 00:00:00':'%y-#{%M}-%d';
	var formatStartE = format=='yyyy-MM-dd HH:mm:ss'?'%y-#{%M}-%d %H:%m:%s':'%y-#{%M}-%d';
	var todayTime= UI.util.getDateTime("today", format);
	$beginTime.val(option.bT || todayTime.bT);
	$endTime.val(option.eT || todayTime.eT);
	
	var dateTime = {};
	var $zdybtn=$ele.find('.zdyTimeBtn');
	$beginTime.focus(function(){
		WdatePicker({
			startDate:formatStartB,
			dateFmt:format,
			maxDate: option.bTmaxDate || '#F{$dp.$D(\''+$endTime.attr('id')+'\')||\''+todayTime.eT+'\'}',
			isShowClear:false,
			onpicked: option.onBtPicked
		});
	});
	$endTime.focus(function(){
		WdatePicker({
			startDate:formatStartE,
			dateFmt:format,
			minDate:'#F{$dp.$D(\''+$beginTime.attr('id')+'\')}',
			maxDate:todayTime.eT,
			isShowClear:false
		});
	});
	
	//时间控件确定检索按钮
	$zdybtn.click(function(){
		
		dateTime.bT = $beginTime.val();
		dateTime.eT	= $endTime.val();
		
		if( typeof callback == 'function'){
			callback(dateTime);
		}
	});	

	
	//时间
	$ele.on('click','.tag-item',function(){
		var timeId = $(this).attr("time-control");
		
		$timeControl = $(this).parents('.filter-tag').find(".opera-group");
		$timeControl.removeClass("active");
		
		switch (timeId) {		
			case 'qb':
				dateTime.bT="";
				dateTime.eT=""
				break;
				
			case 'jt':
				dateTime= UI.util.getDateTime("today",format);
				break;
				
			case 'zt':
				dateTime= UI.util.getDateTime("yesterday",format);
				break;
				
			case 'bz':
				dateTime = UI.util.getDateTime("thisWeek",format);
				break;
			
			case 'by':			
				dateTime = UI.util.getDateTime("thisMonth",format);
				break;
			case 'bN':
				dateTime = UI.util.getDateTime('thisYear', format);
				break;
			case 'zdy':			
				dateTime = UI.util.getDateTime("today",format);
				$timeControl.addClass("active");
				break;
			case 'nW':			
				dateTime = UI.util.getDateTime("nearWeek",format);
				break;
			case 'nM':			
				dateTime = UI.util.getDateTime("nearMonth",format);
				break;
			
		}

		$beginTime.val(dateTime.bT);
		$endTime.val(dateTime.eT);
		
		$(this).addClass('active').siblings('span').removeClass('active');
		
		if(typeof callback == 'function'&&timeId!='zdy'){
			callback(dateTime);
		}
		
	});
	
}

/**
 * 年龄段筛选
 * @Author fenghuixia
 */
function initFilterAgeGroup(){
	$("#birthdayTagsList .tags-list-item").click(function(){
		var $this = $(this);
		var $birthdayTagsList = $this.parent();
		var $timeControl = $birthdayTagsList.next();
		var ageGroupVal = UI.control.getControlById('birthdayTagsList').getValue();
		var id = $birthdayTagsList.attr("id");
		
		$birthdayTagsList.attr(id,ageGroupVal);
		
		if(ageGroupVal == '5'){
			$timeControl.addClass("active");
		}else{
			$timeControl.removeClass("active");
			//$timeControl.find("input").val('');
		}
	});
}

/**
 * @Author fenghuixia
 * @version 2017-08-09
 * @description 标签单选与多选
 */
function selectedTag(){
	$(".tagItmeList").on("click",".tag-item",function(){
		var valArr = [] , dbidArr = [];
		var $this = $(this);
		var $tagItmeList = $this.parent();
		var multiple = $tagItmeList.attr("select-multiple");
		var id = $tagItmeList.attr("id");
		var curVal = $this.attr('val');
		var curDbid = $this.attr('dbid');
		var checkedVal = $tagItmeList.attr(id);
		if(checkedVal){
			valArr = $tagItmeList.attr(id).split(",");
			dbidArr = $tagItmeList.attr(id+'-dbid').split(",");
		}
		
		if(multiple){
			if($this.hasClass("tagAll")){
				$this.addClass("active").siblings().removeClass("active");
				valArr = [] ,dbidArr = []; 
			}else if($this.hasClass("active")){
				var index = valArr.indexOf(curVal);
				$this.removeClass("active");
				valArr.splice(index,1);
				dbidArr.splice(index,1);
			}
			else if($this.attr('select-type')){ //如果有标签分组的情况
				var type = $this.attr('select-type');
				var tagcode = $this.attr('tagcode');
				if (tagcode == '01' || tagcode == '14' ||tagcode == '15') {
					$this.addClass("active").siblings('[select-type="'+type+'"]').removeClass('active');
				} else {
					$this.addClass("active").siblings('[tagcode="01"]').removeClass('active');
				}
                // $this.addClass("active").siblings('[select-type="'+type+'"]').removeClass('active');
                valArr  = [];
                dbidArr  = [];
                $.each($tagItmeList.find('.tag-item.active'),function (i,o) {
					valArr.push($(o).attr('tagcode'));
                    dbidArr.push($(o).attr('dbid'));
                });
			}
			else{
				$this.addClass("active");
				valArr.push(curVal);
				dbidArr.push(curDbid);
			}
		}else{
			$this.addClass("active").siblings().removeClass("active");
			valArr=[] , dbid = [];
			valArr.push(curVal);//先清空，再赋值
			dbidArr.push(curDbid);
		}
		
		$("#"+id).attr(id,valArr.join(","));
		$("#"+id).attr(id+'-dbid',dbidArr.join(","));
	});
}

//菜单筛选
function initFilterEvent(callback){
	$('#fiflerState').click(function(){
		var $hideFilterBar = $('.filter-bar-hide'),
		icon           = $(this).find('.icon'),
		$fiflerText    = $(this).find('.fifler-text');
		
		if(icon.hasClass('icon-more')){
			icon.addClass('icon-hide').removeClass('icon-more');
			$hideFilterBar.removeClass('hide');
			$fiflerText.html('收起列表');
		}else{
			icon.addClass('icon-more').removeClass('icon-hide');
			$hideFilterBar.addClass('hide');
			$fiflerText.html('查看更多');
		}
	});
}

//选择卡口后返回卡口编号
function getKkbhIdArr(node) {
	var data = [];
	if(node) {
		data.push(node.id);
		if(node.length > 0) {
			for(var i=0; i<node.length; i++) {
				data.push(getKkbhIdArr(node[i]));
			}
		}
	}
	return data;
}

//初始化下拉选择框
function initTreeEvent(id){
	var treeid = id;
    var orgTree = UI.control.getControlById(id);
    orgTree.bindEvent("onDropdownSelect", function(node){
    	var orgCode="";
    	if(node){
    		for(var i=0;i<node.length;i++){
    			if(!node[i].isParent){
    				if(orgCode===""){
    					orgCode=node[i].id;
    				}else{
    					orgCode=orgCode+","+node[i].id;
    				}
    			}
    		}
    	}
        $('#'+treeid+'Code').val(orgCode);
    });
    
//    var id = orgTree.getNodes()[0].id;
//    orgTree.setDropdownSelectNode(id);
}

//初始可框选区域下拉选择框
function initCyclableTreeEvent(id){
	var treeid = id;
    var orgTree = UI.control.getControlById(id);
    orgTree.bindEvent("onDropdownSelect", function(node){
    	var orgCode="";
    	if(node){
    		for(var i=0;i<node.length;i++){
    			if(!node[i].isParent){
    				if(orgCode===""){
    					orgCode=node[i].id;
    				}else{
    					orgCode=orgCode+","+node[i].id;
    				}
    			}
    		}
    	}
        $('#faceDetect').val(orgCode);
    });
    
//    var id = orgTree.getNodes()[0].id;
//    orgTree.setDropdownSelectNode(id);
}
//卡口图标
function parentNodeRender(treeNode){
	if(treeNode.IS_ROLE == 'false'){
		treeNode.chkDisabled = true;
	}
	if(!treeNode.hasChildren){
		treeNode =  $.extend(treeNode, {
			text:'<span class="ico-passport-name">'+ treeNode.text+'</span>',
			isParent:false,
		});
	}
	return treeNode;
}



(function (){
	
	
	//图片放大
	$("body").on("click","[attrimg='zoom']",function(e){
		e.stopPropagation();
		var $this = $(this);
		var url = $this.attr("src");
		var showIndex = 0;
		var _series = []
		var parentBox = $this.parents('.listviewImgBox');
		if ( $this.attr("zoom-url") != undefined ) {
			url = $this.attr("zoom-url");
		}
		if(parentBox.length > 0){
			// 计算当前图片所在 索引
			if(parentBox.find('[pic-order]').length >0 && ($this.attr('pic-order') || $this.parent('.pic-order').attr('pic-order'))){ //已经自定义序号
				showIndex = parseInt($this.attr('pic-order') || $this.parent('.pic-order').attr('pic-order'));
			}else{
				// 为每个列表添加 listview-item 属性
				parentBox.find("[attrimg='zoom']").each(function(index,item){
					$(this).attr('pic-order',index);
				});
				
				showIndex = parseInt($this.attr('pic-order') || $this.parent('.pic-order').attr('pic-order'));
				
			}
			
			// 图片展示列表数组
			var messDouble = false;
			if(parentBox.find('[attrimg="zoom"]').length /2 == parentBox.find('.picMessage').length){
				messDouble = true;
			}
			parentBox.find('[attrimg="zoom"]').each(function(index,item){
//				_series.push($(this).attr('src'));
				_series.push({
					'src': $(this).attr('src'),
					'mess': messDouble ? renderPicMsg(parentBox,parseInt(index/2)): renderPicMsg(parentBox,index)
				})
			})
		}
		var options = {
				isSlide: false,
				series: _series.length>0 ? _series : [url],
				showIndex: showIndex,
				isMessage: _series.length>0 ? true: false,
                isListView: _series.length>0 ? true: false
		}
		top.$.photoZoom(options);
	});
	
	//双图图片放大
	$("body").on("click","[attrimg='doublezoom']",function(e){
		e.stopPropagation();
		var $this = $(this);
		var $img = $this.find("img");
		var parentBox = $this.parents('.listviewImgBox');
		var baseImg,seriesImg,_series,showIndex = 0;
		var isListView = false;
		
		// 列表展示图片
		if(parentBox.length > 0){
			isListView = true;
			baseImg = [];   seriesImg= [];
			
			// 计算当前图片所在 索引
			if(parentBox.find('[pic-order]').length >0 && ($this.attr('pic-order') || $this.parent('.pic-order').attr('pic-order'))){ //已经自定义序号
				showIndex = parseInt($this.attr('pic-order') || $this.parent('.pic-order').attr('pic-order'));
			}else{
				// 为每个列表添加 listview-item 属性
				parentBox.find("[attrimg='doublezoom']").each(function(index,item){
					$(this).attr('pic-order',index);
				});
				showIndex = parseInt($this.attr('pic-order') || $this.parent('.pic-order').attr('pic-order'));
			}
			
			// 图片展示列表数组
			parentBox.find('[attrimg="doublezoom"]').each(function(index,item){
					baseImg.push($(this).find('img').eq(0).attr('src'));
//					seriesImg.push($(this).find('img').eq(1).attr('src'));
					seriesImg.push({
						'src': $(this).find('img').eq(1).attr('src'),
						'mess': renderPicMsg(parentBox,index)
					})
			})
			_series = seriesImg;
			
		// 普通方式展示图片
		}else{
			baseImg = $img.eq(0).attr("src");
			seriesImg = $img.eq(1).attr("src");
			if ($img.eq(0).attr("zoom-url") != undefined ) {
				baseImg = $img.eq(0).attr("zoom-url");
			}
			
			if ($img.eq(1).attr("zoom-url") != undefined ) {
				seriesImg = $img.eq(1).attr("zoom-url");
			}
			_series = [{'src':seriesImg,'show':true}];
		}

		var regSrc = /:\d+\//g.exec(window.location.href),
			iframeSrc = regSrc ? window.location.href.substr(regSrc.index + regSrc[0].length - 1) : '';

		var options = {
			isCompare: true,
			isMessage: false,
			isSlide: false,
			isListView: isListView,
			series: _series,
			baseImg: baseImg,
			showIndex: showIndex,
			isMessage: isListView,
			//	加入人脸识别框 —— 传false或不传则仍为原功能
			isNeedSearchByImage: false,
			iframeSrc: iframeSrc
        }
		var projectID = top.getConfigItem('portal', 'PROJECT_ID');
		
		if (projectID == undefined){
			projectID = 'base';
		}else{
			projectID = projectID && projectID.value;
		}
		
        UI.control.remoteCall('platform/webapp/config/get', {"applicationName":"datadefence"}, function(resp) {
            $.each(resp.attrList,function(i,v){
                if(v.key=="IS_BLACK" && v.value == '0'){
                    options.isNeedSearchByImage = true
                }
            });
            if(projectID == 'base' || projectID == 'longli' || projectID == 'zhanjiang'){
                options.isNeedSearchByImage = false
            }
            top.$.photoZoom(options);
        }, function () {
            top.$.photoZoom(options);
        });
	});

	//三图图片放大
	$("body").on("click","[attrimg='threezoom']",function(){
		var $this = $(this);
		var $img = $this.find("img");
		var parentBox = $this.parents('.listviewImgBox');
		var baseImg,seriesImg,_series,showIndex = 0;
		var isListView = false;
		var shotPic = $this.attr('shotpic');
		// 列表展示图片
		if(parentBox.length > 0){
			isListView = true;
			baseImg = [];   seriesImg= [];
			
			// 计算当前图片所在 索引
			if(parentBox.find('[pic-order]').length >0 && ($this.attr('pic-order') || $this.parent('.pic-order').attr('pic-order'))){ //已经自定义序号
				showIndex = parseInt($this.attr('pic-order') || $this.parent('.pic-order').attr('pic-order'));
			}else{
				// 为每个列表添加 listview-item 属性
				parentBox.find("[attrimg='threezoom']").each(function(index,item){
					$(this).attr('pic-order',index);
				});
				showIndex = parseInt($this.attr('pic-order') || $this.parent('.pic-order').attr('pic-order'));
			}
			var titleArr = [];
			var searchImg = [];
			// 图片展示列表数组
			parentBox.find('[attrimg="threezoom"]').each(function(index,item){
				baseImg.push($(this).find('img').eq(0).attr('src'));
				//seriesImg.push($(this).find('img').eq(1).attr('src'));
				seriesImg.push({
					'src': $(this).find('img').eq(1).attr('src'),
					'mess': renderPicMsg(parentBox,index)
				});
				searchImg.push($(this).find('img').eq(2).attr('src'));
				titleArr.push($(this).find('em').eq(0).text());
				titleArr.push($(this).find('em').eq(1).text());
				titleArr.push($(this).find('em').eq(2).text());
			});
			_series = seriesImg;
			
		// 普通方式展示图片
		}else{
			baseImg = $img.eq(0).attr("src");
			seriesImg = $img.eq(1).attr("src");
			if ($img.eq(0).attr("zoom-url") != undefined ) {
				baseImg = $img.eq(0).attr("zoom-url");
			}
			
			if ($img.eq(1).attr("zoom-url") != undefined ) {
				seriesImg = $img.eq(1).attr("zoom-url");
			}
			_series = [{'src':seriesImg,'show':true}];
			var titleArr = [];
			titleArr.push($img.eq(0).next().text());
			titleArr.push($img.eq(1).next().text());
			titleArr.push($img.eq(2).next().text());
			var searchImg;
			if ($img.eq(2).attr("zoom-url") != undefined ) {
				searchImg = $img.eq(2).attr("zoom-url");
			}
		}

		function renderImg(index){
			if($this.parents(".tilelist").length>0){
				var $span = $this.parents(".tilelist").find(".list-node-wrap:eq("+index+") [attrimg='threezoom'] span:eq(2)");
			}else{
				var $span = $(".list-node-wrap:eq("+index+") [attrimg='threezoom'] span:eq(2)");
			}
			var src = $span.find("img").attr("src");
			var title = $span.find("em").text();
			renderThirdImg(title, src);
		}

		function renderThirdImg(title, src){
			var search = '<div class="img-area search-img">';
			search += '<span class="img-title">' + title + '</span>';
			search += '<img src="'+src+'" alt="">';
			search += '</div>';
			top.$(".expand-photo .img-area.center-img").next().remove();
			top.$(".expand-photo .img-area.center-img").after(search);
			top.$(".expand-photo .img-area.search-img img").smartZoom({'containerClass':'zoomableContainer'});
			top.$(".expand-photo .Bnext").addClass("turn-right");
		}

		var options = {
			isCompare: true,
			isSlide: false,
			isListView: isListView,
			series: _series,
			baseImg: baseImg,
			showIndex: showIndex,
			isMessage: isListView,
			isShotPic: shotPic,
			shotCallback: function(data){
				var params = {
						src: '/efacecloud/page/library/shotPicture.html?fileSrc='+((shotPic == "left")? data.lsrc : data.rsrc)+'&jgsj='+data.message['时间']+'&deviceName='+data.message['设备名称'],
						title: '全景图抠图',
						width: $(top.window).width()*.95,
						height: $(top.window).height()*.9,
						callback: function(data){}
				}
				top.UI.util.openCommonWindow(params);
			},
			createHtmlCallback: function(i){
				top.$(".expand-photo .base-area").addClass("three-img");
				top.$(".expand-photo .img-area").addClass("three-img center-img");
				renderThirdImg(titleArr[2], ((typeof(searchImg) == "object" && searchImg.length >0) ? searchImg[i] : searchImg));
				//initWaterMarkToZoom();
			},
			fnBPrevCallback: function(index){
				renderImg(index);
				top.$(".expand-photo .base-area").addClass("three-img");
				top.$(".expand-photo .img-area").addClass("three-img center-img");
				renderThirdImg(titleArr[2], ((typeof(searchImg) == "object" && searchImg.length >0) ? searchImg[index] : searchImg));
				//initWaterMarkToZoom();
			},
			fnBNextCallback: function(index){
				renderImg(index);
				top.$(".expand-photo .base-area").addClass("three-img");
				top.$(".expand-photo .img-area").addClass("three-img center-img");
				renderThirdImg(titleArr[2], ((typeof(searchImg) == "object" && searchImg.length >0) ? searchImg[index] : searchImg));
				//initWaterMarkToZoom();
			}
	    }
		top.$.photoZoom(options);
	});
	
	//页面滚动
	if( $("[container='scroll']").length ){
		
		var $pageInfoElm = $('.page-info-metro');
		
		var uploadImgType = $("[container='scroll']").attr('uploadImgType');
		
		var time = 60, //60毫秒的间隔  函数节流阀值
			timer = null,
			offsetTop = '';

		$("[container='scroll']").scroll(function() {
			
			var $nextElm = $pageInfoElm.next();
			if($nextElm.hasClass("hide")){
				$nextElm = $nextElm.next();
			}
			offsetTop = $nextElm.offset().top - 62;
			
			if( typeof timer != "number"){
				
				timer = setTimeout(function(){
					
					if( offsetTop < 0 ){
						$pageInfoElm.addClass('fixed');
						$nextElm.find("[scrollfix]").addClass('fixed');
						$('.compare-picture').addClass('fixed');
						$('.result').addClass('fixed');
					}
				else{
					$pageInfoElm.removeClass('fixed');
					$nextElm.find("[scrollfix]").removeClass('fixed');
					$('.compare-picture').removeClass('fixed');
					$('.result').removeClass('fixed');
				}
					
					
					timer = null;
					
				},time);
				
			}
			
		});	
	}
	
	//页面滚动
	if( $("[container='technicalStationScroll']").length ){
		
		var $pageInfoElm = $('.page-info-metro');
		
		var time = 60, //60毫秒的间隔  函数节流阀值
		timer = null,
		offsetTop = '';
		
		$("[container='technicalStationScroll']").scroll(function() {
			
			offsetTop = $pageInfoElm.next().offset().top - 44;
			
			if( typeof timer != "number"){
				
				timer = setTimeout(function(){
					
					if( offsetTop < 0 ){
						$pageInfoElm.addClass('fixed');
					}
					else{
						$pageInfoElm.removeClass('fixed');
					}
					
					
					timer = null;
					
				},time);
				
			}
			
		});	
	}
	
	
	//搜索框
	$("[clearsearchkey='true'] #searchText").keyup(function(){
		var $searchTextInput = $(this);
		var $clearKeyBtn = $('[clearsearchkey="true"] .clear-key-btn');
		 $clearKeyBtn[ ($searchTextInput.val() != '') ? 'removeClass':'addClass' ]('hide');
		 
	});
	
	//搜索框清除按钮
	$('body').on('click','[clearsearchkey="true"] .clear-key-btn',function(){
		var $searchTextInput = $("[clearsearchkey='true'] #searchText");
		$searchTextInput.val('');
		$(this).addClass('hide');
		doSearch();
	});
	
	
	
	// wifi信息关联
	$("body").on("click","[window-wifi]",function(e){
		var $this = $(this);
		var mac = $this.attr('window-wifi');
		if(mac == ''){
			UI.util.alert('MAC地址为空，无法关联','warn')
		}else{
			
		}
		e.stopPropagation();
	});
	
	//情报弹窗
	$("body").on("click","[window-control]",function(){
		var $this = $(this);
		var type = $this.attr("window-control"),
		    code = $this.attr("window-code") || $this.html();
		openWindowIntelligence(type, code);
	});
	
})();


/*=================生成UUID========================*/
function getUuid(){
	var len=32;//32长度
	var radix=16;//16进制
	var chars='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
	var uuid=[],i;
	radix=radix||chars.length;
	if(len){
		for(i=0;i<len;i++){
			uuid[i]=chars[0|Math.random()*radix];
		}
		var r;
		uuid[8]=uuid[13]=uuid[18]=uuid[23]='';
		uuid[14]='4';
		for(i=0;i<36;i++){
			if(!uuid[i]){
				r=0|Math.random()*16;
				uuid[i]=chars[(i==19)?(r&0x3)|0x8:r];
			}
		}
	}
		
	return uuid.join('').toLowerCase();;
} 


/*******************************渲染类****************************/

//人脸列表中的搜索按钮是否可见
function renderSearchLinkVisible(pageLoadType){
	if (pageLoadType == "true") {
		$(".search-icon").addClass('hide');
	}
}

//渲染人脸检索分数，保留整数，后面加上百分号
function renderScore(score){
	if (score == "" || score == null) {
		return score;
	}
	var score = (""+score).replace("%","");
	return parseInt(score) + "%";
}
//空字符串或者null转变为“未知”
function renderNullToNotKnow(str) {
	if (str == null || str == "" || typeof(str) == "undefined") {
		return "--";
	} else {
		return str;
	}
}

/**
 * 渲染性别
 * @param {String} sexCode : 性别编码
 * @author：lyy
 */
function renderSex(sexCode){
	if(sexCode == 1){
		return "男";
	}else if(sexCode == 2){
		return "女";
	}else{
		return "未知";
	}
}

//转换证件类型
function renderIdentityType(type){
	var str = '';
	switch(type){
	case '1':
		str='身份证';
		break;
	case '2':
		str='护照';
		break;
	case '3':
		str='驾驶证';
		break;
	case '4':
		str='港澳通行证';
		break;
	}
	return str;
}
/*=========== 标准时间字符串转时间戳  =======================*/
function standardTimeToStamp(standardTime){
	var isStandardTime = /^(\d{4})\-(\d{2})\-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/.test(standardTime);	
	
	if (isStandardTime) {
		return Date.parse(standardTime.replace(/-/g,  "/"));
	}else {
		return Date.parse(new Date());
	}
}

/*初始化布控库列表*/
function initDbTree(options){
	var $addressWrap = options.elem;
	var addressId = options.addressId;
	var service = options.service;
	var addressTmpl = options.tmpl;
	var databaseArr = [];
	
	var selectArr = options.selectArr;
	
	if(!selectArr){
		selectArr = $addressWrap;
	}
	
	$.each($addressWrap,function(i,n){
		var areaHtml = '<div class="tree-wrap dropdown">'+
			'<div class="modular-head dropdown-toggle" data-toggle="dropdown">'+
				'<span class="selectedDb">请选择 </span>'+
				'<input type="hidden" id="registerDb" name="'+selectArr[i]+'"  value="">'+
				'<span class="icon-arrow-down8 tc" style="width:25px;"></span>'+
			'</div>'+
			'<div class="dropdown-menu">'+
				'<div class="db-list">'+
					'<div class="tab-pane active">'+
						'<dl class="attr-list">'+
							'<dd class="attr-list-body" id="'+addressId[i]+'">'+
							'</dd>'+
						'</dl>'+
					'</div>'+
					'<div class="attr-bar"><a class="btn attrSureBtn  btn-small blue-btn btn-purple mr10">确定</a><a class="btn btn-white  btn-small gray-btn attrCancelBtn">取消</a></div>'+
				'</div>'+
			'</div>'+
		'</div>';
		$("#"+n).append(areaHtml);
		UI.control.remoteCall(service, {}, function(resp){
			databaseArr = resp.data;
			$("#"+addressId[i]).html(tmpl(addressTmpl, databaseArr));
		});
		
		//点击标签
		$("#"+n).on("click",".db-list label",function(event){
			//支持多选
			$(this).toggleClass('active')
			//不支持多选
			//$(this).toggleClass('active').siblings().removeClass("active");
			event.stopPropagation();
		});
		$("#"+n).on("click",".db-list",function(){
			return false;
		})
		$("#"+n).on("click",".attrSureBtn",function(){
			var area ="";
			var dbIdList=[];
			var $treeWrap = $(this).parents('.tree-wrap');
			$('#'+addressId[i]+' label').each(function(i,item){
				if($(item).hasClass("active")){
					area+=$(item).text()+",";
					dbIdList.push($(item).attr('node_id'));
				}
			});
			area = area.slice(0,-1);
			area = (area==""?"请选择":area);
			$treeWrap.find(".selectedDb").html(area);
			if(options.callback){
				options.callback(dbIdList);
			}
			$('.dropdown-menu').click();
		});
		$("#"+n).on("click",".attrCancelBtn",function(){
			var $treeWrap = $(this).parents('.tree-wrap');
			$treeWrap.find("label").removeClass("active");
			$treeWrap.find(".selectedDb").html("请选择");
			$treeWrap.find("input").val("");
			$('.dropdown-menu').click();
			if(options.callback){
				options.callback([]);
			}
		});
});
}

//*************省市区start***************//
/**
 * 地址树的初始化、回填和操作
 * @param {array} elem 地址HTML容器
 * @param {array} addressId 初始化省级内容的id
 * @param {string} service 请求服务
 * @param {string} tmpl 初始化模板
 * @param {array} data 回填值
 * @param {array} selectArr 获取值的input的name
 * @Author fenghuixia
 */
function initAreaTree(options){
	var $addressWrap = options.elem;
	var addressId = options.addressId;
	var service = options.service;
	var addressTmpl = options.tmpl;
	var curNode = options.data;
	var selectArr = options.selectArr;
	var addressArr = [];
	var curAreaVal = '';
	
	if(!selectArr){
		selectArr = $addressWrap
	}
	$.each($addressWrap,function(i,n){
		var areaHtml = '<div class="tree-wrap dropdown">'+
			'<div class="modular-head dropdown-toggle" data-toggle="dropdown">'+
				'<span class="selectedArea">请选择 </span>'+
				'<input type="hidden" name="'+selectArr[i]+'" value="">'+
				'<span class="icon-arrow-down8 tc" style="width:25px;"></span>'+
			'</div>'+
			'<div class="dropdown-menu">'+
				'<div class="city-title">'+
					'<ul>'+
						'<li ref=".city" class="active" defaultName="省份">省份</li>'+
						'<li class="hide" ref=".area" defaultName="地市">地市</li>'+
						'<li class="hide" ref=".station" defaultName="区县">区县</li>'+
					'</ul>'+
				'</div>'+
				'<div class="city-area">'+
					'<div class="tab-pane active city">'+
						'<dl class="attr-list">'+
							'<dd class="attr-list-body" id="'+addressId[i]+'">'+
							'</dd>'+
						'</dl>'+
					'</div>'+
					'<div class="tab-pane area">'+
						'<dl class="attr-list">'+
							'<dd class="attr-list-body">'+
							'</dd>'+
						'</dl>'+
					'</div>'+
					'<div class="tab-pane station">'+
						'<dl class="attr-list">'+
							'<dd class="attr-list-body">'+
							'</dd>'+
						'</dl>'+
					'</div>'+
					'<div class="attr-bar"><a class="btn btn-small blue-btn attrSureBtn mr10">确定</a><a class="btn btn-small gray-btn attrCancelBtn">清除</a></div>'+
				'</div>'+
			'</div>'+
		'</div>';
		$("#"+n).append(areaHtml);
		UI.control.remoteCall(service, {}, function(resp){
			addressArr = resp.data;
			$("#"+addressId[i]).html(tmpl(addressTmpl, addressArr));
		});
		
		//数据回填
		if(curNode){
			var curNodeId =typeof( curNode[i])!=='undefined' ?curNode[i]:'';
			var j = 2;
			while (j<curNodeId.length+2) {
				var nodeSubStr = curNodeId.substring(0,j);
				var curLable = $("#"+n).find(".city-area label[nodeid='"+nodeSubStr+"']");
				selectCurArea(addressArr,curLable,n);
				j=j+2;
			}
		}
	});
	
	$('.city-title li').click(function(event){
	    selectCurCity($(this));
	    fixedMenu($addressWrap,$(this).parents(".dropdown-menu").height());
	    event.stopPropagation();
	});
	
	$(".tree-wrap").on("click",".city-area label",function(event){
		var id = $(this).parents(".tree-wrap").parent().attr("id");
		curAreaVal = selectCurArea(addressArr,$(this),id);
		event.stopPropagation();
	});
	
	$(".tree-wrap").on("click",".city-area",function(event){
		event.stopPropagation();
	});
	
	$(".attrSureBtn").click(function(){
		if(options.callback){
			options.callback(curAreaVal);
		}
		$('.dropdown-menu').click();
	});
	
	$(".attrCancelBtn").click(function(){
		var $treeWrap = $(this).parents('.tree-wrap');
		$treeWrap.find(".selectedArea").html("请选择");
		$treeWrap.find("input").val("");
		$.each($treeWrap.find("li"),function(i,n){
			if(i == 0){
				$(n).addClass("active");
			}else{
				$(n).addClass("hide").removeClass("active");
			}
			$(n).html($(n).attr("defaultname"));
		});
		$treeWrap.find("label").removeClass("active");
		$treeWrap.find(".city-title li:first").click();
		$('.dropdown-menu').click();
	});
	
	
	$(".tree-wrap .dropdown-toggle").click(function(){
		if($(this).closest('.form-control').attr('readonly')){ //如果控件禁止编辑，就不做处理；
			$(this).removeAttr('data-toggle').css('cursor','not-allowed');
			return;
		}
		var height = $(this).next().height();
		fixedMenu($addressWrap,height);
	})
	
}

/**
 * 地址树的下拉列表向下下拉展开，还是向上下拉展开
 * @param {array} addressWrap 地址HTML容器
 * @param {array} dropdownHeight 地址HTML容器的高度
 * @Author fenghuixia
 */
function fixedMenu(addressWrap,dropdownHeight){
	var bodyHeight = $("body").height();//获得滚动条距top的高度
	var $addressWrap = $('#'+addressWrap);
    var height = $addressWrap.offset().top+dropdownHeight;
    if(bodyHeight<height){
        $(".tree-wrap .dropdown-menu").addClass('fixed-top');
    }else{
    	$(".tree-wrap .dropdown-menu").removeClass('fixed-top');
    }
}

/**
 * 查询某区域下的下级行政树
 * @param {obj} addressArr 地址树数据
 * @param {string} nodeId 某个地址的id
 * @return {obj} 返回属于某个地址的下级行政树
 * @Author fenghuixia
 */
function queryChildNodes(addressArr,nodeId){
	var nodeList = [];
	var nodeSubStr = nodeId.substring(0,2);
	$.each(addressArr,function(i,n){
		if(nodeSubStr == n.id){
			nodeList = n.ChildNodes;
			if(nodeId.length>2){
				$.each(n.ChildNodes,function(index,obj){
					if(nodeId == obj.id){
						nodeList = obj.ChildNodes;
						return false;
					}
				})
			}
			return false;
		}
	});
	return nodeList;
}

/**
 * 获取选中的地址
 * @param {obj} addressArr 地址树数据
 * @param {string} $this 具体某个地点jQuery元素
 * @param {string} id 地址树包裹层的id
 * @return {obj} 返回当前选中的地址区域
 * @Author fenghuixia
 */
function selectCurArea(addressArr,$this,id){
	var $curTitleLi = $this.parents(".dropdown-menu").find(".city-title li.active");
	var $cityTitleLi = $this.parents(".dropdown-menu").find(".city-title li");
	var NODE_ID = $this.attr("nodeid");
	var area = '';
	var len = $cityTitleLi.length;
	var $selectedArea = $this.parents(".tree-wrap").find(".selectedArea");
	
	$curTitleLi.html($this.html());
	
	$cityTitleLi.each(function(i){
		area+=$(this).text();
		if($(this).hasClass("active")){
			return false;
		}
		if(i!=(len-1)){
			area+=' > ';
		}
	});
	
	$selectedArea.html(area);
	$selectedArea.next().val(NODE_ID);
	var curAreaVal = area;
	
	if($curTitleLi.next().length!=0){
		
		$curTitleLi.nextAll().each(function(){
			$(this).html($(this).attr("defaultName"));
		});
		$curTitleLi.next().removeClass("hide");
		selectCurCity($curTitleLi.next());//点击后，active的li就改变了，要重新选择
		$curTitleLi = $this.parents(".dropdown-menu").find(".city-title li.active");
		
		var nodeList = queryChildNodes(addressArr,NODE_ID);
		
		$("#"+id+" "+$curTitleLi.attr("ref")).find("dd").html(tmpl("childNodeListTemplate",nodeList));
		
	}
	
	$this.addClass("active").siblings().removeClass("active");
	return curAreaVal;
}

/**
 * tab切换行政区域内容
 * @param {string} $this 下个tab的jQuery元素
 * @Author fenghuixia
 */
function selectCurCity($this){
	if(!$this.hasClass("disable")){
    	var ref = $this.attr('ref');
    	var $cityArea = $this.parents(".city-title").next();
    	
    	$this.addClass('active').siblings().removeClass('active');
    	$cityArea.find('.tab-pane').removeClass('active');
    	$cityArea.find(ref).addClass('active');
    }
}

//*************省市区end***************//

// 头部图片上传组件
var isSearch = false;//用于判断上传完成后，是否提示需要点击确定检索，默认提示上传成功
 function topUploadPic() {
	 
	 	var threshold = $('#threshold').val();
	 
	 	/* $('#threshold').keyup(function() {  
            //数值范围为100以内
	    	$(this).val($(this).val().replace(/[^0-9]+/,''));
	    	if($(this).val() > 100){
	    		$(this).val(100);
	    	}
        }).focus(function() {  
            //获得焦点时，如果值为默认值，则设置为空  
            if ($(this).val() == threshold) {  
                $(this).val("");  
            }  
        }).blur(function() {  
            //失去焦点时，如果值为空，则设置为默认值  
            if ($(this).val()== "") {  
                $(this).val(threshold);
            }  
        });  */
	    
     //上传图片
     $("body").on('change','.searchImgButton',function(){
		var $this = $(this);
		
		var file = $this.get(0).files[0];//上传的图片的所有信息
		if(!file){
			return false;
		}
		var size = file.size;
 		//计算机存储数据最为常用的单位是字节(B)
 		//在此处我们限制图片大小为10M
 		if(size>10*1024*1024){
 			UI.util.alert('上传文件的大于10M,请重新选择！！','warn');
 			$this.val('');
 			UI.util.hideLoadingPanel();
 			return false;
 		}
 		
    	 var upImgId = $this.attr('id');
    	 isSearch = $this.attr("issearch");
    	 fileType = $this.attr("filetype");
    	 var val = $(this).val();
	 	 if(val == ''){
	     	return false;
	     }
	 	var isUpFile = ajaxFileUpload(upImgId,picSuccFunction,fileType);
    	 
	 	if(fileType && isUpFile){
			//展示附件
			var html = '<div class="image-item"> '+
			'<div class="upload-img">'+
			'<img class="uploadFile'+fileNum+'" src="/ui/plugins/eapui/img/nophoto.jpg" foruploadimg="uploadFile">'+
			'<input type="hidden" foruploadform="uploadFile'+fileNum+'" name="FILE_URL">'+
			'<span class="icon-btn-wrap">'+
			'<i class="delete-img-btn icon-trash" title="点击删除文件"></i>'+
			'</span>'+
			'<div class="file-name" title="'+fileName+'">'+fileName+'<div class="file-name-bg"></div></div>'
			'</div>'+
			'</div>';
			$('.searchImgButton[filetype="all"]').parents(".image-item").after(html);
    	 }
     });
     
     
     //删除图片
     $('body').on('click','#deleteImgBtn',function (){
         fileUrl = '';
         $('#filterImg').attr('src', '/efacecloud/images/noPhoto2.png');
         $("#uploadImg").val("");
         $(this).parent('ul').siblings('input[foruploadform]').val("");
         //恢复默认值
         $('#threshold').val(threshold);
         
         $('.bottom-pic-bar').addClass('hide');
     });
 }


 /**
  * 批量导入文件成功回调事件处理
  * @param {String} successNum : 成功
  * @param {function} failNum : 失败
  * @param {function} url : 导入错误信息的导出
  * @param {function} callback : 回调方法
  * @author：lwb
  */
//var importingDataTimer = null;
function importingData(successNum,failNum, url, callback){
	var $body = $(window.top.document.body);
	var html = '<div class="loading-data">'+
				'<div class="layer"></div>'+
				'<div class="loading-wrap">'+
				'<div class="loading-con">'+
				'<dl class="w50 fl">'+
				'<dt>合格数据：</dt>'+
				'<dd class="w70 success-num"><span class="green mr5">'+ successNum +'</span>条</dd>'+
				'</dl>'+
				'<dl class="w50 fl">'+
				'<dt>异常数据：</dt>'+
				'<dd class="w70 fail-num"><span class="orange mr5">'+ failNum +'</span>条</dd>'+
				'</dl>'+
				'</div>'+
				'<div class="footer">'+
				'<button class="btn btn-blue sureBtn" type="button">确定</button>'+
				'<button class="btn btn-blue queryDetailBtn ' + renderQueryDetailBtn(failNum) + '" type="button">查看详情</button>'+ 
				'</div>'+
				'</div>'+
				'</div>'+
				'<iframe class="hide" id="messageExport" frameborder="0"/></iframe>';
	$body.append(html)
	
	/*//进度条
	if(importingDataTimer){
		window.clearInterval(importingDataTimer);
	}
	
	importingDataTimer = setInterval("queryImportProgress('" +uuid + "')",200);*/
	
	$body.off("click", ".sureBtn");
	$body.off("click", ".queryDetailBtn");
	
	initImportingEvent(url,callback);
}

function initImportingEvent(url,callback){
	var $body = $(window.top.document.body);
	//确定事件
	$body.on("click",".sureBtn",function(){
		
		$body.find(".loading-data").remove();
		if( typeof callback == 'function'){
			callback();
		}
		//top.removeLayer();
		
	});
	
	//查看详情，关闭当前提示框，弹出新窗口
	$body.on("click",".queryDetailBtn",function(){
		
		var src = UI.control.getRemoteCallUrl(url);
		$body.find("#messageExport").attr("src",src);
		
		$body.find(".loading-data").remove();
		if( typeof callback == 'function'){
			callback();
		}
		/*UI.util.showCommonWindow("/efacecloud/page/dispatched/importTemplateDetails.html?uuid=" + uuid, "查看详情", 
             800, 550, function(obj){
		});*/
	});
}

function renderQueryDetailBtn(failNum){
	
	if(parseInt(failNum) <= 0){
		return "hide";
	}
	return "";  
}

/*function queryImportProgress(uuid){
	UI.control.remoteCall("surveilImport/manage/queryProgress",{UUID:uuid},function(resp){
		
		var total = parseFloat(resp.total); //全部需要处理的数量
		var total_y = parseFloat(resp.totalY); //已经处理的但是错误的数据数量
		var total_n = parseFloat(resp.totalN);	//已经处理的且正常的数据数量	
		var progress = parseFloat(resp.progress); //处理数据的进度
		
		initProgress(progress);//调用任务列表的进度函数
		$(".success-num span").html(total_y);
		$(".fail-num span").html(total_n);
		
		if(progress >= 1){
			window.clearInterval(importingDataTimer);
			$(".loading-data .footer").removeClass("hide");
		}
	});
}

//根据任务度数值初始化进度条
function initProgress(val,type){
	var value = parseInt(val*100)+"%";
	$(".progress-bar").css("width",value);
	$(".progress-bar span").html(value);
	$(".progress-bar").parents("dd").next().find("span").html("进行中");
	
	if(val == 1){
		if(type == "-1"){
			$(".progress-bar").css("backgroundColor","red");
			$(".progress-bar").parents("dd").next().find("span").html("异常");
		}else{
			$(".progress-bar").css("backgroundColor","green");
			$(".progress-bar").parents("dd").next().find("span").html("已完成");
		}
	}
}*/

/**
 * 图片上传执行方法
 * @param {String} fileElementId : 上传元素id
 * @param {function} succFunction : 图片上传成功回调方法
 * @author：lwb
 */
function ajaxFileUpload(fileElementId,succFunction,fileType) {
	var orgFileName = $('#'+fileElementId).val();

	var pointArr = [];
	$.each(orgFileName,function(i,n){
		if(n == '.'){
			pointArr.push(i);
		}
	});
	var pointIndex = pointArr[pointArr.length-1];
	
	var postfix = orgFileName.substring(pointIndex+1,orgFileName.length);
	
	var fileNameArr = orgFileName.split('\\');
	fileName = fileNameArr[fileNameArr.length-1];
	
	var upperCasePostFix = postfix.toLocaleUpperCase();
	if(!fileType){
		if(!(upperCasePostFix=='JPG'||upperCasePostFix=='PNG'||upperCasePostFix=='JPEG'||upperCasePostFix=='BMP')){
			UI.util.alert(postfix+'文件不是支持的文件类型！目前仅支持JPG|PNG|JPEG|BMP文件','warn');
			return false;
		}
	}else{
		if(!(upperCasePostFix=='JPG'||upperCasePostFix=='PNG'||upperCasePostFix=='JPEG'||upperCasePostFix=='BMP'
			|| upperCasePostFix == 'XLSX'|| upperCasePostFix == 'DOCX'|| upperCasePostFix == 'DOC'|| upperCasePostFix == 'PDF')){
			UI.util.alert(postfix+'文件不是支持的文件类型！目前仅支持JPG|PNG|JPEG|BMP|DOC|DOCX|PDF|XLSX文件','warn');
			return false;
		}
	}
	UI.util.showLoadingPanel();
	
	var isThumb = null;
	if(!fileType){
		isThumb = 1;
	}
	
    $.ajaxFileUpload({
        url : global.baseUrl, 
        type: 'post',
        secureuri : false,  
        fileElementId : fileElementId,  
        dataType : 'text',
        data : {'FILE_TYPE':'picture','IS_THUMB':isThumb},
        success : succFunction,
        error : function(data, status, e) {
        	UI.util.debug(data);
        	UI.util.debug(status);
        	UI.util.hideLoadingPanel();
        }
    });
    return true;  
}


/**
 * 图片上传成功的回调处理
 * @param {object} data : 图片上传成功返回对象
 * @param {String} status : 图片上传状态
 * @author：lwb
 */
function picSuccFunction(data, status) {
	var fileElementId =  this.fileElementId;
		data = eval("(" + data + ")");
	var fastDfs = null;
	var server = "", port = "", url = "";
	
	if (data && !data.error) {
		
		if(data.fastDfsParam){
			fastDfs = data.fastDfsParam;
			server = fastDfs.server;
			port = fastDfs.port;
			url = "http://";
		}
		var fileId = data.id;
		if(fileId.indexOf("http:")>=0){
 			url = fileId;
 		}else{
 			url += server+":"+port+"/"+fileId;
 			if (data.fastDfsParam && data.fastDfsParam.fullUrl) {
 				url = data.fastDfsParam.fullUrl;
 			}
 		}
		
		$(fileElementId).val('');
		if(fileType){
			
			var pointArr = [];
			$.each(fastDfs.name,function(i,n){
				if(n == '.'){
					pointArr.push(i);
				}
			});
			var pointIndex = pointArr[pointArr.length-1];
			
			var curFileName = fastDfs.name.substring(pointIndex+1,fastDfs.name.length);
			var upperFileName = curFileName.toLocaleUpperCase();
			var imgUrl = '';
			switch(upperFileName){
			case 'DOC':
			case 'DOCX':
				imgUrl = '/efacecloud/images/word.png'
				break;
			case 'RAR':
			case 'ZIP':
				imgUrl = '/efacecloud/images/zip.png'
				break;
			case 'XLSX':
				imgUrl = '/efacecloud/images/excel.png'
				break;
			case 'PDF':
				imgUrl = '/efacecloud/images/pdf.png'
					break;
			}
			if(imgUrl != ''){
				$(".uploadFile"+fileNum).attr("src",imgUrl);
			}else{
				$(".uploadFile"+fileNum).attr("src",url);
			}
			$("[foruploadform='uploadFile"+fileNum+"']").val(url);
			$("[foruploadform='uploadFile"+fileNum+"']").attr('filename',fileName);
			$("[foruploadform='uploadFile"+fileNum+"']").attr('size',fastDfs.size);
			fileNum++;
		}else{
			$('[foruploadform*="'+ fileElementId +'"]').val(url);
			$('[foruploadimg*="'+ fileElementId +'"]').attr("src", url);
		}
		
		var picBar = $('.bottom-pic-bar');
		if(picBar.length!=0){			
			picBar.removeClass('hide');
		}

		if($(".arithmetic-tools.on").length==0){ //如果没有选中的算法，默认选择第一种；
            $(".arithmetic-tools:eq(0) i").trigger('click');
		}

		if(!isSearch){
			UI.util.alert("上传成功！");
		}else{
			UI.util.alert("上传成功！请点击按钮进行检索查询");
		}
		UI.util.hideLoadingPanel();
		return true;
	} else {
		UI.util.alert("上传失败！",'warn');
	}
	
	UI.util.hideLoadingPanel();
	return false;
}


/**
 * 渲染图片，url为空时显示默认图片
 * @param {string} img : 图片src
 * @param {string} width : 备用，此字段在读取缩略图时可用
 * @param {string} height : 备用，同上
 * @author：lwb
 */
function renderImg(img, width, height) {
    if (img==''|| img==undefined) {
        return '/ui/plugins/eapui/img/nophoto.jpg';
    }

    var imgs = img.split(".");

    if (imgs.length==2 && imgs[1].toLowerCase()!="jpg" && imgs[1].toLowerCase()!="png"
        && imgs[1].toLowerCase()!="jpeg" && imgs[1].toLowerCase()!="bmp") {
            return "";
        }

    /*getNginxConfig();*/

    var imgUrl = img;

   /* if (imgUrl.toLowerCase().indexOf("http://") < 0) {
        imgUrl = nginxPrefix + imgUrl;
        if (nginxPrefix == '' && imgUrl.indexOf("/fs") == '-1') {
            imgUrl = "/fs/" + imgUrl; 
        }
    }

    if (width!=undefined && height!=undefined && width!="" && height!="") {
        return imgUrl + "?command=resize&geometry=" + width + "x" + height;
    }*/

    return imgUrl;
}

/**
 * 渲染模板信息字段,不存在或为空时返回暂无
 * @param {object} field : 模板字段
 * @author：llr
 */
function renderFields(field){
	return (typeof field == "undefined"||field=='')?"暂无":field;
}

/**
 * 判断告警等级返回背景颜色类
 * @param {int} value : 告警等级
 * @author：lzh
 * @return {str} "bgred","bgyellow","bgray" :背景颜色类
 */
function color(value){
    switch (value){
        case 1:return "bgred";break;
        case 2:return "bgyellow";break;
        case 3:return "bgray";break;
    }
}

/**
 * 判断告警等级返回告警文字
 * @param {int} value : 告警等级
 * @author：lzh
 */
function warmText(value){
    switch (value){
        case 1:return "红色告警";break;
        case 2:return "黄色告警";break;
        case 3:return "事后关注";break;
    }
}

/**
 * 顺序执行函数；主要用于处理左右分栏页面中，初始化的时候，模拟点击左侧第一个元素，解决右边url没有参数的bug；
 * 通过检测className有没有出现决定执行 fn2；没有fn2 默认模拟点击第一个className元素
 * @param {str} className : 被监听的元素;
 * @param {function} fn1 : 先执行函数
 * @param {function} fn2 : 后执行函数
 * @author：lzh
 */
function sequence(className,fn1,fn2) {
    if(timeControl){
        clearInterval(timeControl);
    }
    if(fn1){
    	fn1();
    }
    var timeControl = null;
    timeControl = setInterval(function () {
        if($(className).length>0){
            if(fn2){
                fn2();
            }else {
                $(className).eq(0).trigger('click');
            }
            clearInterval(timeControl);
        }
    },100)
}

/**
 * 收藏文件
 * @param {object} options : 收藏的请求参数对象
 * @author：fenghuixia
 */
function addFavoriteFile(options){
	var params = {
			BIRTHDAY:'',
			CAPTURE_PIC:'',
			CAPTURE_TIME:'',
			DEVICE_ID:'',
			DEVICE_NAME:'',
			DISPATCHED_DB_ID:'',
			DISPATCHED_DB_NAME:'',
			FAVORITE_ID:'',
			FILE_SOURCE:1,
			IDENTITY_ID:'',
			IDENTITY_TYPE:-1,
			INFO_ID:'',
			NAME:'',
			PERMANENT_ADDRESS:'',
			PERSON_TAG:'',
			PIC:'',
			PRESENT_ADDRESS:'',
			SEX:'',
			SOURCE_DB_ID:'',
			SOURCE_DB_NAME:''
	};
	params = $.extend(true, params, options);
	var returnData = "";
	UI.control.remoteCall("face/favoriteFile/add",params,function(resp){
		returnData = resp;
	});
	
	return returnData;
}

//技战法固定顶部栏
function pageTopFixed(){
	try{
		var h = $('.list-wrap').offset().top;
		}
	catch(e){
		return;
	}
	$(window).scroll(function(){
	    var sh=$(this).scrollTop();//获得滚动条距top的高度
	    if(sh>h){
	        $(".list-wrap").addClass('fixed-top');
	    }else{
	    	$(".list-wrap").removeClass('fixed-top');
	    }
	});
}


/**
 * 通过选择证件类型  改变 证件号码的 验证  1身份证2护照3驾驶证4港澳通行证，默认身份证
 * 回填的时候，通过主动获取回填数据，设置input的验证；
 * @param {str} identity_type : 证件类型select标签 id  默认 IDENTITY_TYPE;
 * @param {str} identity_id : 证件号码 input标签 id  默认 IDENTITY_ID
 * @param {bool} bool : 正则配置 默认{pattern:"required,idCard"}，false为{pattern:"idCard"}；
 * @author：lzh
 */
function passport(identity_type,identity_id,bool) {
    var identity_type = identity_type|| "IDENTITY_TYPE";
    var identity_id = identity_id|| "IDENTITY_ID";
	var value = parseInt($("#"+identity_type).val());
    var initObj = switchPatten(value,bool);
    $("#"+identity_id).attr("ui-validate",initObj.patten).attr("ui-vtext",initObj.text);
    $("#"+identity_type).change(function (){
        var int = parseInt($(this).val());
        var obj = switchPatten(int,bool);
        $("#"+identity_id).attr("ui-validate",obj.patten).attr("ui-vtext",obj.text);
    })
	function switchPatten(value,bool) {
    	var obj = {patten:'',text:""};
    	if(bool == false){
    		bool = false
		}else {
    		bool = true
		}
        switch (value){
            case 1:obj.patten= bool?"{pattern:'required,idCard'}":"{pattern:'idCard'}",obj.text='身份证号码';break;
            case 2:obj.patten= bool?"{pattern:'required,passport'}":"{pattern:'passport'}",obj.text='护照号码';break;
            case 3:obj.patten= bool?"{pattern:'required,driving'}":"{pattern:'driving'}",obj.text='驾照号码';break;
            case 4:obj.patten= bool?"{pattern:'required,hk-passport'}":"{pattern:'hk-passport'}",obj.text='港澳通行证号码';break;
        }
        return obj;
    }
}


/**
 * 扩展 remoteCall方法，默认出loading 图标；回调弹出服务端信息优先，否则弹出自定义消息
 * @param {str} src : 服务接口;
 * @param {obj/str/arr} data : 参数
 * @param {function} sucCallback : 成功回调，可空
 * @param {str} yourMessage : 自定义成功信息 可空
 * @param {function} errCallback : 失败回调，可空
 * @param {str} yourErrMessage : 自定义失败信息 可空
 * @author：lzh
 */
function ExtendRemoteCall(src,data,sucCallback,yourSucMessage,errCallback,yourErrMessage) {
    UI.util.showLoadingPanel()
    UI.control.remoteCall(src, data, function(resp){
        if (resp.CODE == 0) {
            if(sucCallback){
                sucCallback(resp)
            }
            var sucMessage = resp.MESSAGE||resp.message || yourSucMessage;
            if(sucMessage){
                UI.util.alert(sucMessage);
            }
        }else{
            if(errCallback){
                errCallback(resp);
            }
            var errMessage = resp.MESSAGE || resp.message || yourErrMessage;
            if(errMessage){
                UI.util.alert(errMessage,"warn");
            }
        }
        UI.util.hideLoadingPanel();
    },function(){
        UI.util.hideLoadingPanel();
	},{},true);
}

/*人员标签自适应展开事件*/
function initUnfoldTag(){
	if($('.mark-wrap').height()<=40){
		 $('#moreTag').hide();
	}
	//更多标签自适应
	$(window).resize(function() {
	  if($('.mark-wrap').height()<=40){
		  $('#moreTag').hide();
	  }else{
		  $('#moreTag').show();
	  }
	});
	
	//展开更多标签
	$('#moreTag').click(function(){
		$('.more').toggleClass('open');
		var text = $(this).text();
		$(this).text(text=='更多'?'收起':'更多');
	});
}

/**
 * 判断 boxClass 的高度 是否足够容下 它里面的form-con；不可以 给底部的保存按钮 做定位
 * @param {str} boxClass : 外层容器classname;
 * @param {str} contentBox : 高度会变化的内容 classname;
 * @param {str} footBox : footer classname;
 * @author：lzh
 */
function fixation(boxClass,contentBox,footBox) {
    var boxClass = boxClass || "fixation-wrap";
    var contentBox = contentBox || 'form-con';
    var footBox = footBox || 'form-footer';
    trans();
    $(window).resize(function () {
        trans()
    });
    function trans() {
        var $a = $("."+boxClass);
        var $b = $a.find("."+contentBox);
        var $c = $a.find("."+footBox);
        if($a.outerHeight()<$b.outerHeight()){
            $c.addClass('fixation');
            $b.addClass('pb80');
        }else {
            $c.removeClass('fixation');
            $b.removeClass('pb80');
        }
    }
}

/**
 * 页面数据导出下载(此方式支持参数长度大的方式)
 * @param {str} url: 导出服务
 * @param {str} iframeId： iframeid
 * @param {obj} params： 查询参数
 */
function bigDataToDownload(url,iframeId,params){
	
	$("#"+iframeId).remove();
	$("body").append('<iframe class="hide" src="about:blank" id="' + iframeId + '" frameborder="0" ></iframe>');
	var dateId = new Date().getTime();
	var html = '<form action="'+url+'" method="post" target="_self" id="'+dateId+'">'; 
	for(param in params){
		html = html + "<input id='"+param+"' name='"+param+"' type='hidden' value='"+params[param]+"'/>";    
	}
	html = html + '</form>';
	document.getElementById(iframeId).contentWindow.document.write(html);  
	document.getElementById(iframeId).contentWindow.document.getElementById(dateId).submit();  
}

/**
 * 设备下拉列表
 * @param opts.deviceId	设备id
 * @param opts.deviceName	设备名称
 * @param opts.deviceNameList	设备下拉展示元素
 * @param opts.dropdownListText	设备缩略内容
 * @author fenghuixia
 */
function addDrowdownDeviceList(opts){
	if(opts.deviceId && opts.deviceId!=""){
		var deviceIdArr = opts.deviceId.split(",");
		var deviceNameArr = opts.deviceName.split(",");
		var html='';
		
		$.each(deviceIdArr,function(i,n){
			html += '<li><a>'+
			'<span class="deviceName">'+deviceNameArr[i]+'</span>'+
			'<span class="removeDeviceBtn operate-btn" deviceid='+deviceIdArr[i]+'>×</span>'+
			'</a></li>';
		});
		
		opts.deviceNameList.html(html);
		opts.dropdownListText.attr("data-toggle","dropdown");
		opts.dropdownListText.find(".dropdown").removeClass("hide");
	}else{
		opts.dropdownListText.attr("data-toggle","");
		opts.dropdownListText.find(".dropdown").addClass("hide");
		opts.deviceNameList.empty();
		opts.dropdownListText.parent().removeClass("open");
	}
}

/**
 * 设备下拉列表数据回填
 * @param opts.deviceId	设备id
 * @param opts.deviceName	设备名称
 * @param opts.deviceIdInt	
 * @param opts.orgCode	设备树父节点code
 * @author fenghuixia
 */
function checkDrowDownDeviceList(opts){
	var deviceNames = opts.deviceNames,
		deviceId = opts.deviceId,
		deviceIdInt = opts.deviceIdInt,
		orgCode = opts.orgCode;
	
	//是否有设备名称
	if(deviceNames && deviceNames.length>0){
		top.globalCache.deviceName = deviceNames.split(",");
	}else{
		top.globalCache.deviceName = null;
	}
	
	//是否有设备id
	if(deviceId && deviceId.length>0){
		top.globalCache.deviceId = deviceId.split(",");
	}else{
		top.globalCache.deviceId = null;
	}
	
	if(deviceIdInt && deviceIdInt.length>0){
		top.globalCache.deviceIdInt = deviceIdInt.split(",");
	}else{
		top.globalCache.deviceIdInt = null;
	}
	
	if(orgCode && orgCode.length>0){
		top.globalCache.orgCode = orgCode.split(",");
	}else{
		top.globalCache.orgCode = null;
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


/**
 * 判断告警level,返回颜色类名
 * @param {String} level : 告警等级
 * @return {str} 颜色类
 * @author lzh
 */
function renderColor(level) {
	var colorClass = '';
    switch (level){
	    case 0:
	    case "0":
	    	colorClass = "color-red" ;
	    	break;
        case 1:
        case "1":
        	colorClass = "color-orange"; 
        	break;
        case 2:
        case "2":
        	colorClass = "color-yellow" ;
        	break;
        case 3:
        case "3":
        	colorClass = "color-blue" ;
        	break;
    }
    return colorClass;
}

/**
 *  将车牌颜色文字，转化为对应的颜色类并返回
 *  @param {String} PLATE_COLOR: 车牌颜色
 *  @return {str} 颜色类
 *  @author wenyujian
 * */
function getHpysCalss(PLATE_COLOR){
	// class 蓝牌：plate-blue，黑牌：plate-black，白牌：plate-white，黄牌：plate-yellow 
	UI.util.debug("PLATE_COLOR:"+PLATE_COLOR);
	if(PLATE_COLOR == "蓝色"){
		return "plate-blue";
	}
	if(PLATE_COLOR == "黑色"){
		return "plate-black";
	}
	if(PLATE_COLOR == "黄色"){
		return "plate-yellow";
	}
	if(PLATE_COLOR == "白色"){
		return "plate-white";
	}
	return "";
}


/**
 * 功能：渲染算法列表
 * @param {String} src: 申请服务渲染算法路径
 * @Author lzh
 */
function getALG(src) {
    UI.control.remoteCall(src,null,function (resp) {
        if(resp.data.length>0){
            for(var i=0;i<resp.data.length;i++){
                $("#arithmetic").append(tmpl('ALGTemplate',resp.data[i]));
            }
        }
    })
}
//	判断是否是外籍人员
function isForeigner (tagCode) {
	return /(0308)/g.test(tagCode);
}
function renderSex(sexCode){
	if(sexCode == 1){
		return "男";
	}else if(sexCode == 2){
		return "女";
	}else{
		return "未知";
	}
}
/**
 * 功能：滑块组件的事件；
 * @param {String} src: 申请服务渲染算法路径
 * @Author lzh
 */
function slideFn(src, argu, callback) {
    if(src){
		var params;
		// 直接传入menuID
		if(typeof(argu) == 'string') {
			params = {
				MENUID: argu
			};
		} else if(typeof(argu) == 'object') {
			// 新增：需要加入人员分类，传入请求对象
			params = argu;
		}
        UI.control.remoteCall(src, params, function (resp) {
            if(resp.data.length>0){
                for(var i=0;i<resp.data.length;i++){
                    $("#arithmetic").append(tmpl('ALGTemplate',resp.data[i]));
                }
                $(".arithmetic-tools.all").addClass("on");
                if($.isFunction(callback)){
                	callback(resp.data);
                }
            }
        })
	}

    var ALGO_LIST = getInputVal();
    //初始化滑块控件
    $(".arithmetic-btn").slider({
        range: "max",
        min: 60,
        max: 100,
        value: 60,
        slide: function( event, ui ) {
            $(event.target).closest('.arithmetic-max').find("input").val(ui.value );
            $(event.target).closest('.arithmetic-max').siblings().attr('title',ui.value);
            ALGO_LIST = getInputVal();
        }
    });

    //点击其中一个算法
	$("body").on('click',".arithmetic-tools span",function (e) {//点文字选择或者取消
		var $tools =  $(this).closest('.arithmetic-tools');
		// disabled时不可用
		if($tools.hasClass('disabled')) {
			return;
		}
        if($tools.hasClass('on')){
            if($(".arithmetic-tools.on").length==1&&$('#filterImg').attr("src").indexOf("http://") != -1){ //如果有上传图片 不能取消所有算法
                UI.util.alert("人脸检索 必须保留至少一种算法",'warn');
                return;
            }
            $tools.removeClass('on').removeAttr('title');
            UI.util.alert("取消算法成功");
        }else {
        	
        	var noScore = $(this).parents('.arithmetic').attr('no-score');
        	if(noScore){
        		$tools.addClass('on');
        		if($tools.hasClass('all')){
        			$tools.parent().parent().find(".arithmetic-tools:not(:eq(0))").removeClass('on');
        		}else {
        			$tools.parent().parent().find(".arithmetic-tools").eq(0).removeClass('on');
        		}
        	}else{
        		$tools.addClass('on').hide().siblings().show();
        		$tools.attr('title',$tools.siblings().find('input').val());
        		if($tools.hasClass('all')){
        			$tools.parent().parent().find(".arithmetic-tools:not(:eq(0))").removeClass('on').show().siblings().hide();
        		}else {
        			$tools.parent().parent().find(".arithmetic-tools").eq(0).removeClass('on').show().siblings().hide();
        		}
        	}
        	
        }
        ALGO_LIST = getInputVal();
        e.stopPropagation();
    });
    $("body").on('click',".arithmetic-tools i",function ( e) {//点图标修改；
		var $tools =  $(this).closest('.arithmetic-tools');
		var noScore = $(this).parents('.arithmetic').attr('no-score')
		// disabled时不可用
		if($tools.hasClass('disabled')) {
			return;
		}
		if(noScore){
			$(this).siblings('span').trigger('click');
		}else{
			if($tools.hasClass('on')){
				$tools.hide().siblings().show();
			}else {
				$(this).siblings('span').trigger('click');
			}
		}
        ALGO_LIST = getInputVal();
        e.stopPropagation();
    });

    //点击弹窗
    $('body').on('click',".arithmetic-max",function (e) {
        e.stopPropagation();
    });

    //点击其他地方消失
    $("body").click(function () {
        $(".arithmetic-tools").show().siblings().hide();
    });

    //input 与 滑块绑定
    $('.arithmetic-input input').keyup(function() {
        //数值范围为100以内
        var $this = $(this);
        var $silider = $this.closest('.arithmetic-max').find(".arithmetic-btn");
        $this.val($this.val().replace(/[^0-9]+/,''));
        if($this.val() > 100){
            $this.val(100);
        };
        $('.ui-slider-horizontal .ui-slider-handle').css('transition','0.5s');
        $silider.slider("value", $this.val());
        $this.closest('.arithmetic-max').siblings().attr('title',$this.val());
        setTimeout(function(){
            $('.ui-slider-horizontal .ui-slider-handle').css('transition','0s');
        },500);
        ALGO_LIST = getInputVal();
    }).blur(function () {
        if(!$(this).val()||parseInt($(this).val())<60){
            UI.util.alert('最小值为60','warn');
            $(this).val(60);
            $(this).closest('.arithmetic-max').find(".arithmetic-btn").slider("value",60);
            $(this).closest('.arithmetic-max').siblings().attr('title',$this.val());
        }
        ALGO_LIST = getInputVal();
    });

    function getInputVal() {
        var algoList = [];
        
        if( $(".arithmetic-tools.on:visible").hasClass('all') || $(".arithmetic-item:visible .arithmetic-tools.on").hasClass('all') ){
        	algoList = getAllAlgorithm($(".arithmetic-item:visible .arithmetic-tools:not('.all'):not('.disabled')"));
        }else{
        	algoList = getAllAlgorithm($(".arithmetic-item:visible .arithmetic-tools.on"));
        }
		
        return algoList;
    }
    
    //取算法参数
    function getAllAlgorithm(elms){
    	var algoList = [];
    	elms.each(function () {
			var $input = $(this).closest('.arithmetic-item').find('input');
			var obj = {
				ALGO_TYPE:$input.attr("algo_type"),
				THRESHOLD:$input.val()
			};
			algoList.push(obj);
		});
    	return algoList;
    }

    function getAlgoList() {
        return ALGO_LIST
    }

    return getAlgoList;
};

/**
 * 弹窗
 * @param {str} type : 业务类型;
 * @param {str} imgUrl : 参数( 轨迹分析/身份核查：图片src , 情报：身份证号 ;);
 * @param {str} time : 页面默认查询时间(bT:开始时间; eT: 结束时间)
 * @param {str} resourcePage : 来源页面 (路人库页面》轨迹分析)
 * @author lwb
 * */
function openWindowPopup( type, imgUrl,time,checkName){
	var src = '',
		title='';
	switch(type){
		case 'track':
			title = '轨迹分析';
			if(time && time.bT && time.eT){
				src = "/efacecloud/page/technicalStation/tacticsFrame.html?pageType=track&imgUrl=" + imgUrl +'&beginTime='+time.bT+'&endTime='+time.eT+'&noBackBtn=true';
			}else{
				src = "/efacecloud/page/technicalStation/tacticsFrame.html?pageType=track&imgUrl=" + imgUrl+'&noBackBtn=true';
			}
			break;
		case 'identity':
			title = '身份核查';
			src = matcher('/efacecloud/page/technicalStation/verification.html/' + top.projectID).url + '?imgUrl=' + imgUrl+"&checkName="+(checkName||"");
			if(UI.control.hasPermission('EFACE_faceVerificationArchive')){
				src =  '/efacestore/page/library/personnelFileMagList.html?imgUrL=' + imgUrl;
			}
			break;
		case 'faceCapture':
			title = '路人检索';
			var src = matcher('/efacecloud/page/library/faceCaptureList.html/' + top.projectID).url;
			break;
	}
	
	var params = { 
			src: src,
			title: title,
			width: $(top.window).width()*.95,
			height: $(top.window).height()*.9,
			callback: function(obj){}
        };
	UI.util.openCommonWindow(params);
	
}


/**
 * 链接情报，外部打开
 * @param {str} type : 人脸或车辆;
 * */
function openWindowIntelligence( type, code){
	var src = '', title='',param='';
	switch(type){
		case 'car':
			title = '机动车电子档案';
			param = 'hphm=';
			if(top.cIntelligenceSrc == ''){
//				intelligencePortal(type);
				UI.util.alert("暂无情报信息", 'warn');
				return;
			}
			var url  = top.cIntelligenceSrc+'&'+ param + code;
			window.open(url);
		  break;
		case 'person':
			param = 'uuid=';
			title = '人员电子档案';
			if(top.pIntelligenceSrc == ''){
//				top.intelligencePortal(type);
				UI.util.alert("暂无情报信息", 'warn');
				return;
			}
			var url  = top.pIntelligenceSrc+'&'+ param + code;
			window.open(url);
		  break;
	}
	
}


//nginx&fdfs服务
var nginxIp = "", nginxPrefix = "", fdfsPrefix = "";
var fileSizeLimit = 600 * 1024 * 1024 ;
var caseEverAppToken = 0x31001;//上传图片永久存储
var appToken = 0x41001;//图片保存1-2天
var taskTimer = ""; //以图搜XX任务实时刷新进度定时器
var SEARCH_MONTH = 3 //搜索页面限制范围（月：默认前3个月）
//缓存全局变量
var Global = {
    userName : ''
};

$(function(){
    //setInterval("initTask('.task')", 1000);
});



function getNginxConfig(){
    // var url = "case/common/getNginxIp";
    // if (nginxIp == "" || fdfsPrefix=="") {
    //     UI.control.remoteCall(url, {}, function(resp){
    //         if (resp.ip != '' && resp.ip.indexOf("/fs") == -1) {
    //             nginxIp = resp.ip + "/fs";
    //             nginxPrefix = resp.ip + "/fs/";
    //         } else {
    //             nginxIp = resp.ip;
    //             nginxPrefix = resp.ip;
    //         }
    //
    //         fdfsPrefix = resp.fdfsPrefix;
    //     });
    // }
}

function getNginxId(picUrl){
    getNginxConfig();
    return picUrl.replace(nginxPrefix,"");
}

function uploadSinglePic(id, callback){
    getNginxConfig();

    var files = document.getElementById(id).files;

    var fileItem = files[0];

    var byteTo = fileItem.size;
    var blob = fileItem.slice(0,byteTo,fileItem.type);
    var headers = {
        "Content-Range":"bytes 0-"+byteTo-1+"/"+fileItem.size,
        "Access-Control-Allow-Origin":"*",
        "X-AppToken-Id":appToken
    };

    $.ajax({
        url: nginxPrefix + encodeURI(fileItem.name),
        type:"POST",
        appToken:appToken,
        contentType:fileItem.type,
        processData:false,
        headers:headers,
        data:blob,
        complete:callback
    });


}


function isPic(pic) {
    var type = pic.toLowerCase();
    if (type.lastIndexOf('jpg')>=0 || type.lastIndexOf('png')>=0 || type.lastIndexOf('bmp')>=0 || type.lastIndexOf('jpeg')>=0) {
        return "";
    } else {
        return "hide";
    }
}


function renderFileType( filetype ){

    switch( filetype ){

        case 'image/png':
        case 'image/jpeg':
        case 'image/bmp':
            return 'image';

        case 'application/msword':
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            return 'word';

        case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
            return 'xlsx';

        case 'application/zip':
        case 'application/java-archive':
        case 'application/x-zip-compressed':
            return 'zip';

        case 'audio/mpeg':
        case 'audio/mp3':
            return "mp3";

        case 'video/mp4':
        case 'video/x-msvideo':
        case 'video/x-ms-wmv':
            return "video";
        default:
            return "file";

    }
}

//卡口选择后显示卡口列表
function initListData(resp,index){
    var dataList = [],curIndex = '';
    var dName =  resp.deviceName.split(',');
    var dId = resp.deviceId.split(',');
    
    if(index){
    	curIndex = index;
    }
    if(dName.length>0&&resp.deviceName.length>0){
        for(i=0;i<dName.length;i++){
            dataList.push({
                DEVICE_NAME:dName[i],
                DEVICE_ID:dId[i]
            })
        }
        $('#bayonetList'+curIndex).html(tmpl('bayonetListTemp',dataList));
        $('#bayonetList'+curIndex).attr('orgcode',resp.orgCode);
        $('#bayonetList'+curIndex).attr('devicename',resp.deviceName);
        $('#selectedBayonet'+curIndex).val(resp.deviceId);
        $('#selectedDeviceIdInt'+curIndex).val(resp.deviceIdInt || '');
        $("#bayonetList"+curIndex).closest('.table-wrap').removeClass('hide');
    }else {
        $("#bayonetList"+curIndex).closest('.table-wrap').addClass('hide');
	}
    
}

//卡口选择后显示卡口列表,回填数据到感知设备中
function initDeviceListData(resp,index){
    var dataList = [],curIndex = '';
    var dName =  resp.deviceName.split(',');
    var dId = resp.deviceId.split(',');
    
    if(index){
    	curIndex = index;
    }
    if(dName.length>0&&resp.deviceName.length>0){
        for(i=0;i<dName.length;i++){
            dataList.push({
                DEVICE_NAME:dName[i],
                DEVICE_ID:dId[i]
            })
        }
        $('#deviceNameList'+curIndex).html(tmpl('deviceNameListTemp',dataList));
        $('#deviceNames'+curIndex).attr('orgcode',resp.orgCode);
        $('#deviceNames'+curIndex).html(resp.deviceName);
        $('#faceDetect'+curIndex).val(resp.deviceId);
        $('#deviceIdInt'+curIndex).val(resp.deviceIdInt || '');
        addDrowdownDeviceList({
			deviceId:resp.deviceId,
			deviceName:resp.deviceName,
			deviceNameList:$("#deviceNameList"),
			dropdownListText:$(".dropdown-list-text")
		});
    }
    
}

//检测卡口列表是否为空，为空则移除
function checkFieldList($this){
	if($this.closest('tbody').find('tr').length<=1){
		$this.closest('.table-wrap').addClass('hide');
	}
}

//获取图片信息
function renderPicMsg(targetBox,index){
	var picMsg=[];
	var $picMessage = targetBox.find('.picMessage').eq(index);
	$picMessage.find('[picMsg]').each(function(i,item){
		var msg = $(this).attr('picMsg');
		var title = msg.substring(0, msg.indexOf(':'));
		var value = msg.substring(msg.indexOf(':')+1,msg.length);
		picMsg[title] = value;
	})
	return picMsg;
}

/**
 * 检索前案件录入
 * @author fenghuixia
 * @param callback 回调函数
 */
function searchBeforeLogged(callback,curParam,loadingFlag){
	
	var curPic = curParam.PIC?curParam.PIC:"";
	var imgArr = curPic.split(",");
	var obj = {
			imgArr:imgArr,
			index:0,
			len:imgArr.length
		};
	
	//开启操作事由
	if(isOpenSearchCause()){
		UI.util.showCommonWindow('/efacecloud/page/library/lookupReasonForm.html',"查询事由", 600, 425,function(data){
			var params = {
					CASE_ID_TYPE:data.CASE_ID_TYPE,
					CASE_ID:data.CASE_ID,
					CASE_NAME:data.CASE_NAME,
					SAERCH_PARAM:JSON.stringify(curParam),
					SEARCH_CAUSE:data.SEARCH_CAUSE,
					SEARCH_PIC:curParam.PIC?curParam.PIC:"",
					SEARCH_TYPE:curParam.searchType,	//1路人库检索,2技战法轨迹分析，3技战法团伙分析，4技战法频繁出现，5技战法区域碰撞，6技战法人脸比对，7技战法身份核查，8技战法人脸集合
					CAUSE_TYPE:data.CAUSE_TYPE//0管控 1侦查 2便民服务 3其他
			}
			UI.util.showLoadingPanel();
			
			if(isRedList()){
				if(obj.len == 1){
					checkRedList(callback,params,data,null,loadingFlag);
				}else{
					params.SEARCH_PIC = imgArr[0];
					checkRedList(callback,params,data,obj);
				}
			}else{
				if(callback && $.isFunction(callback)){
					callback(data);
				}
				UI.util.hideLoadingPanel();
			}
		});
	}else{
		//开启红名单
		if(isRedList()){
			var params = {
					SAERCH_PARAM:JSON.stringify(curParam),
					SEARCH_PIC:curParam.PIC?curParam.PIC:"",
							SEARCH_TYPE:curParam.searchType	//1路人库检索,2技战法轨迹分析，3技战法团伙分析，4技战法频繁出现，5技战法区域碰撞，6技战法人脸比对，7技战法身份核查，8技战法人脸集合
			}
			UI.util.showLoadingPanel();
			if(obj.len == 1){
				checkRedList(callback,params,null,null,loadingFlag);
			}else{
				params.SEARCH_PIC = imgArr[0];
				checkRedList(callback,params,null,obj);
			}
		}else{
			UI.util.showLoadingPanel();
			if(callback && $.isFunction(callback)){
				callback();
			}
			if(!loadingFlag){
				UI.util.hideLoadingPanel();
			}
		}
	}
	
	
	
}

function checkRedList(callback,params,data,obj,loadingFlag){
	UI.control.remoteCall("face/redlist/belongRedList",params,function(resp){
		if(resp.CODE == 0){
			if(resp.BELONG_FLAG == 0){
				if(data){
					var curSrc = '/efacecloud/page/library/redListTips.html?data='+JSON.stringify(data)+'&params='+JSON.stringify(params);
				}else{
					var curSrc = '/efacecloud/page/library/redListTips.html?data=&params='+JSON.stringify(params);
				}
				var openWinParams = { 
						src: curSrc,
						title: '检索管理',
						width: 600,
						height: 400,
						btnClose:false,
						callback: function(data){
							//确定
							if(data.CODE == 0){
								var checkParams = {
										APPLY_FLAG:0,
										TASK_ID:resp.TASK_ID,
										EXPIRY_DATE:data.controlTime
								}
								UI.control.remoteCall("face/redlist/confirmApply",checkParams,function(data){
									if(data.CODE == 0){
										UI.util.alert("请等待审核通过后继续查询！");
									}else{
										UI.util.alert("执行失败！",'warn');
									}
									UI.util.hideLoadingPanel();
								},function(){},{},true);
								
							}else if(data.CODE == 1){
								//取消
								var checkParams = {
										APPLY_FLAG:1,
										TASK_ID:resp.TASK_ID,
										EXPIRY_DATE:data.controlTime
								}
								UI.control.remoteCall("face/redlist/confirmApply",checkParams,function(data){
									if(data.CODE == 0){
										UI.util.alert("取消审批！");
									}else{
										UI.util.alert("执行失败！",'warn');
									}
									UI.util.hideLoadingPanel();
								},function(){
									UI.util.hideLoadingPanel();
									},{},true);
							}
						}
			        };
				UI.util.openCommonWindow(openWinParams);
				
			}else{
				if(obj){
					obj.index = obj.index+1;
					if(obj.index < obj.len){
						params.SEARCH_PIC = obj.imgArr[obj.index];
						checkRedList(callback,params,data,obj);
					}else{
						if(callback && $.isFunction(callback)){
							callback(data);
						}
						UI.util.hideLoadingPanel();
					}
				}else{
					if(callback && $.isFunction(callback)){
						callback(data);
					}
					if(!loadingFlag){
						UI.util.hideLoadingPanel();
					}
				}
			}
		}else{
			UI.util.alert(resp.MESSAGE,"warn");
			UI.util.hideLoadingPanel();
		}
	},function(){},{},true);
}

function renderShow(t){
	if(t == "2"){
		return "hide";
	}else{
		return "";
	}
}
function renderCaseIdType(t){
	if(t == "0"){
		return "案件";
	}else if(t == "1"){
		return "警情";
	}else if(t == "2"){
		return "其它";
	}
	return t;
}

function promptSearch(curOpts){
	var cancelcallback = curOpts.cancelcallback?curOpts.cancelcallback:function(){};
	var opts = {
            title :'检索管理 ',
            renderHtml:curOpts.curHtml,
            okcallback:curOpts.callback,
            cancelcallback:cancelcallback
        }
    UI.util.prompt(opts);
}

//是否开启红名单
function isRedList(){
	var flag = false;
	UI.control.remoteCall("face/redlist/open",{},function(data){
		if(data.STATUS == 1){
			flag = true;
		}
	});
	return flag;
}

//是否开启查询操作事由
function isOpenSearchCause(){
	var flag = false;
	UI.control.remoteCall("face/redlist/openSearchCause",{},function(data){
		if(data.STATUS == 1){
			flag = true;
		}
	});
	return flag;
}

//显示红名单任务
function showRedListTask(opts){
	UI.control.remoteCall("face/redTask/getUnReadCount",{SEARCH_TYPE:opts.searchType},function(resp){
		var num = resp.COUNT,className = '';
		if(num == 0){
			className = 'hide';
		}
		var html = '<div class="look-task-wrap" id="checkTaskBtn">'+
	        		'<span class="icon-wrap">'+
					'<b class="icon-look-task"></b>'+
					'</span>'+
					'<span class="txt-wrap">任务</span>'+
					'<span class="txt-tips '+className+'">'+num+'</span>'+
					'</div>';
		
		$(opts.elem).addClass("pr").append(html);
		
		$("#checkTaskBtn").unbind("click");
		$("#checkTaskBtn").click(function(){
			
			UI.control.remoteCall("face/redTask/updateReadStatus",{SEARCH_TYPE:opts.searchType},function(resp){
				if(resp.CODE == 0){
					$("#checkTaskBtn .txt-tips").addClass("hide");
				}
			},function(){},{},true);
			
			UI.util.showCommonWindow('/efacecloud/page/library/taskList.html?searchType='+opts.searchType,"检索管理", $(top.window).width()*.95, $(top.window).height()*.9,
	      		function(data){
				if(opts && $.isFunction(opts.callback)){
					opts.callback(data);
				}
	      	});
		});
	},function(){},{},true);
}

/**
 * 获得Cookie的原始值
 */
function getCookie(name) {
	var arg = name + "=";
	var alen = arg.length;
	var clen = document.cookie.length;
	var i = 0;
	while (i < clen) {
		var j = i + alen;
		if (document.cookie.substring(i, j) == arg) {
		  var endstr = document.cookie.indexOf (";", j);
		  if (endstr == -1)
			endstr = document.cookie.length;
		  return document.cookie.substring(j, endstr);
		}
		i = document.cookie.indexOf(" ", i) + 1;
		if (i == 0) break;
	}
	return "";
}

/**
 * 增加水印
 * @author fenghuixia
 */
function initWaterMark(){
	var warterMark = null; //开启水印 0 否；1 是
	UI.control.remoteCall("face/redlist/open",{},function(data){
		if(data.WARTERMARK_OPEN != null){
			warterMark = data.WARTERMARK_OPEN;
		}
	});
	if(warterMark == "2") {
		//自动登录不开启水印
		var url = getCookie("toUrl");
	    console.log("toUrl:" + url)
	    if(url) {
	        return;
	    }
	} else if(warterMark != "1") {
		//没开启水印直接返回
		return;
	}
	$("html").append('<script type="text/javascript" src="/efacecloud/js/jquery.watermark.js"></script>');
	var userInfo = top.getUserInfo(),
		idCard = userInfo.idCard,
		policeId = userInfo.policeId,
		name = userInfo.name,
		textsArr = [];
	if(idCard){
		textsArr.push(idCard);
	}
	if(policeId){
		textsArr.push(policeId);
	}
	if(name){
		textsArr.push(name);
	}
    $('.pager-content').watermark({
        texts : textsArr, //水印文字
        textColor : "#CCCCCC", //文字颜色
        textFont : '16px 宋体', //字体
        width : 100, //水印文字的水平间距
        height : 80,  //水印文字的高度间距（低于文字高度会被替代）
        textRotate : -30 //-90到0， 负数值，不包含-90
    })
}

/**
 * @author fenghuixia
 * @param opts.selectDataArr 初始化数据
 * @param opts.elem 面包屑包裹层
 */
function initBreak(opts){
	var service = opts.service,
		elem = opts.elem,
		leftMenu = '',
		rightMenu = '',
		/*lefMenuTitle = '',
		lefMenuSubTitle = '',*/
		casecode = '',
		mapObj = new Map();
	
	/*var breakDataArr = showCommonTab()||[];*/
	var breakDataArr = [];
	
	compatibleIndexOf();
	
	UI.control.remoteCall(service, {}, function(resp){
		if(resp.data.length > 0){
			initBreakData(resp.data);
			
			$(elem).find(".bread-left-nav").append(leftMenu)/*.mCustomScrollbar();*/
			$(elem).find(".bread-right-item-con").append(rightMenu)/*.mCustomScrollbar();*/
			$(elem).find(".tab-content").removeClass("no-data");
			
			$(elem).find(".bread-left-nav .left-item").click(function(){
				var $this = $(this);
				var index = $this.attr("index");
				
				$(elem).find(".left-item").removeClass("active");
				$this.addClass("active");
				$(elem).find(".bread-right-item-con dl").addClass("hide");
				$(elem).find(".bread-right-con dl[index='"+index+"']").removeClass("hide");
				
			});

			$(elem).find(".bread-left-nav .left-item:first").addClass("active");
			
			$(".bread-right-con .title-item").on("click",function(){
				var $this = $(this),
					$curLeftItem = $(".left-item.active"),
					caseCode = $this.attr("casecode");
				if($this.hasClass("active")){
					$this.removeClass("active");
					var objArr = mapObj.get(caseCode);
					var objIndex = 0;
					$.each(objArr, function (i, n) {
						if (n.code == caseCode) {
							objIndex = i;
							return false;
						}
					});
					objArr.splice(objIndex, 1);
					mapObj.put(caseCode, objArr);
				}else{
					$this.addClass("active");
					if($this.parent().parent().find(".right-item").hasClass("active")){
						 $this.parent().parent().find(".right-item.active").click();
					}
					var obj = {
						code: caseCode,
						name: $this.find("span").eq(0).html()
					};
					if (!mapObj.containsKey(caseCode)) {
						var objArr = [];
						objArr.push(obj);
						mapObj.put(caseCode, objArr);
					} else {
						var objArr = mapObj.get(caseCode);
						objArr.push(obj);
						mapObj.put(caseCode, objArr);
					}
				}
				mapObj.values();				
			});
			
			$(".bread-right-con .right-item").click(function(){
				var $this = $(this),
					$curLeftItem = $(".left-item.active"),
					caseCode = $this.attr("casecode");
				if($this.hasClass("active")){
					$this.removeClass("active");
					var objArr = mapObj.get(caseCode);
					var objIndex = 0;
					$.each(objArr,function(i,n){
						if(n.code == caseCode){
							objIndex = i;
							return false;
						}
					});
					objArr.splice(objIndex, 1);
					mapObj.put(caseCode, objArr);
				}else{
					$this.addClass("active");
					if($this.parent().parent().find(".title-item").hasClass("active")){
						$this.parent().parent().find(".title-item.active").click();
					}
					var obj = {
							code:caseCode,
							name:$this.html()
					};
					if(!mapObj.containsKey(caseCode)){
						var objArr = [];
						objArr.push(obj);
						mapObj.put(caseCode, objArr);
					}else{
						var objArr = mapObj.get(caseCode);
						objArr.push(obj);
						mapObj.put(caseCode, objArr);
					}
				}
				mapObj.values();
			});
			
		}else{
			if(resp.data.length ==0){
				$(elem).find(".tab-content").addClass("no-data");
			}else{
				UI.util.alert(resp.MESSAGE,'error');
			}
		}
		UI.util.hideLoadingPanel();
	}/*,function(){},{},true*/);
	
	$(elem).find('#showAllTab').click(function(){
		casecode = '';
		if( typeof opts.callback == 'function'){
			opts.callback(casecode);		
		}
		$(elem).removeClass("open");
		$(".right-item").removeClass("active");
		$(".title-item").removeClass("active");
		mapObj.clear();
		$(opts.elem+" .selectedArea").html('请选择');// 20180427
	});
	
	$(".filter-bread .dropdown-menu").click(function(e){
		e.stopPropagation();
	});
	
	$(".breadSureBtn").click(function(){
		
		
		// if( typeof opts.callback == 'function' && $(".right-item.active").length>0){
		if( typeof opts.callback == 'function'){

			// 标签选择可以为空
			if($(".right-item.active").length<=0 && $(".title-item.active").length<=0) {
				casecode = '';
				if( typeof opts.callback == 'function'){
					opts.callback(casecode);		
				}
				$(elem).removeClass("open");
				$(".right-item").removeClass("active");
				mapObj.clear();
				$(opts.elem+" .selectedArea").html('请选择');// 20180427
				return;
			}

			var code = [],html = '';
			if(mapObj != ''){
				var data = mapObj.values();
				$.each(data,function(i,n){
					$.each(n,function(j,con){
						code.push(con.code);
						html += '<span class="label-item" code="'+con.code+'">'+con.name+'<b class="removeLableBtn">×</b></span>';
					});
				});
				$(opts.elem+" .selectedArea").html(html);
			}else{
				$(opts.elem+" .selectedArea").html('请选择');
			}
			
			$(".removeLableBtn").click(function(){
				var $this = $(this);
				var $parent = $this.parent();
				var curCode = $parent.attr("code");
				var index = code.indexOf(curCode);
				if(index>=0){
					code.splice(index,1);
					if(mapObj.remove(curCode)){
						$parent.remove();
						$("[casecode='"+curCode+"']").removeClass("active");
					}
					if($(".removeLableBtn").length == 0){
						$(opts.elem+" .selectedArea").html('请选择');
					}
					return false;
				}
			});
			
			opts.callback(code);
			$(elem).removeClass("open");
		}else{
			UI.util.alert("请选择标签！","warn");
		}
	});
	
	$(".breadEditBtn").click(function(){
		UI.util.showCommonWindow("/efacestore/page/personLabel/editLabel.html","编辑人员标签", 850, 600,
	      		function(resp){
				if(resp){
					$(elem).find(".bread-left-nav").empty();
					$(elem).find(".bread-right-item-con").empty();
					$(".breadSureBtn").unbind( "click" );
					initBreak(opts)
					mapObj.clear();
	        	}
			});
	});
	
	//回填数据
	if(opts.selectDataArr && opts.selectDataArr.length>0){
		var selectDataArr = opts.selectDataArr;
		$.each(selectDataArr,function(i,n){
			$("[casecode='"+n+"']").click();
		});
		$(".breadSureBtn").click();
	}
	
	function initBreakData(data){
		leftMenu = '';
		rightMenu = '';
		leftMenu += '<dl>';
		for(var i = 0;i<data.length;i++){
			leftMenu += '<dd class="left-item" index="'+i+'" casecode="'+data[i].TAG_CODE+'">'+data[i].TAG_NAME+'</dd>';
					if(data[i].SECOND_LEVEL_LIST.length>0){
						for(var j = 0; j<data[i].SECOND_LEVEL_LIST.length;j++){
							if(i == 0){
								rightMenu += '<dl index="'+i+'"><dt><div class="title-item" casecode="'+data[i].SECOND_LEVEL_LIST[j].TAG_CODE+'"><span>'+data[i].SECOND_LEVEL_LIST[j].TAG_NAME+'</span>';
							}else{
								rightMenu += '<dl class="hide" index="'+i+'"><dt><div class="title-item" casecode="'+data[i].SECOND_LEVEL_LIST[j].TAG_CODE+'"><span>'+data[i].SECOND_LEVEL_LIST[j].TAG_NAME+'</span>';
							}
							if(data[i].SECOND_LEVEL_LIST[j].THIRD_LEVEL_LIST.length>0){
								rightMenu += '<span class="ml5 icon-arrow-right8"><span></div></dt>';
							}else{
								rightMenu += '</div></dt>';
							}
							for(var k = 0; k<data[i].SECOND_LEVEL_LIST[j].THIRD_LEVEL_LIST.length;k++){
								if(k==0){
									rightMenu += '<dd><span class="right-item" casecode="'+data[i].SECOND_LEVEL_LIST[j].THIRD_LEVEL_LIST[k].TAG_CODE+'">'+data[i].SECOND_LEVEL_LIST[j].THIRD_LEVEL_LIST[k].TAG_NAME+'</span>';
								}else{
									rightMenu += '<span class="right-item" casecode="'+data[i].SECOND_LEVEL_LIST[j].THIRD_LEVEL_LIST[k].TAG_CODE+'">'+data[i].SECOND_LEVEL_LIST[j].THIRD_LEVEL_LIST[k].TAG_NAME+'</span>';
								}
								if( k == data[i].SECOND_LEVEL_LIST[j].THIRD_LEVEL_LIST.length-1){
									 rightMenu += '</dd>';
								 }
							}
							rightMenu += '</dl>';
						}
					}
				
				if( i == data.length-1){
					leftMenu += '</dl>';
				}
		}
	}
	
}

//渲染时间查询人脸检索分数
function renderSeachScore(score){
	return Math.round(score / 1.09);
}

//展示时间格式
function showTime(time,type){
	var timeArr = time.split(' ');
	
	if(timeArr.length>1){
		if(type == 'date'){
			return timeArr[0];
		}else{
			return timeArr[1];
		}
	}
	
}

// 格式化时间
function formatTime(time) {
	var year = time.getFullYear();
	var month = (time.getMonth() + 1) >= 10 ? (time.getMonth() + 1) : '0' + (time.getMonth() + 1);
	var date = time.getDate() >= 10 ? time.getDate() : '0' + time.getDate();
	var hour = time.getHours() >= 10 ? time.getHours() : '0' + time.getHours();
	var min = time.getMinutes() >= 10 ? time.getMinutes() : '0' + time.getMinutes();
	var sec = time.getSeconds() >= 10 ? time.getSeconds() : '0' + time.getSeconds();
	return year + '-' + month + '-' + date + ' ' + hour + ':' + min + ':' + sec;
}

/**
* @Author lilu
* @version 2018-12-20
* @description 判断是否是黑人项目
*/
function isBlack(){
	var isBlack = false;
	var configParam ={"applicationName":"datadefence"};
	UI.control.remoteCall('platform/webapp/config/get', configParam, function(resp) {
		var jsonObj = resp.attrList;
		for(var i=0;i<jsonObj.length;i++){
			if(jsonObj[i].key=="IS_BLACK"&&jsonObj[i].value=="1"){
				isBlack = true;
			}
		}
	});   
	return isBlack;
}

/**
* @Author linzewei
* @version 2019-08-23
* @description 获取模块配置
* @param {model:模块名(string),keys:关键字[]}
* @return {key:value,...}
*/
function getConfigValue(configInfo){
	var configParam ={"applicationName":configInfo.model};
	var result = {};
	UI.control.remoteCall('platform/webapp/config/get', configParam, function(resp) {
		var jsonObj = resp.attrList;
		for(var i=0;i<jsonObj.length;i++){
			for(var j=0;j<configInfo.keys.length;j++){
				if(jsonObj[i].key==configInfo.keys[j]){
					result[jsonObj[i].key] = jsonObj[i].value;
				}
			}
			
		}
	});   
	return result;
}

/**
 * 判断模块是否配置{@param key}，其值为{@param value}则调用回调函数 {@param call}
 * @param moduleName 模块名称
 * @param key 属性名
 * @param value 属性值
 * @param call 回调函数
 */
function ifConfigProperty(moduleName, key, value, call) {
    UI.control.remoteCall('platform/webapp/config/get', {
            "applicationName": moduleName
        }, function (response) {
            if (response && response.attrList) {
                var match = response.attrList.some(function (item) {
                    return item.key === key && item.value == value;
                });
                match && call()
            } else {
                // 未知错误
                console.error(response)
            }
        }
    );
}