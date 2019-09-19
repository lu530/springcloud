var CONSTANTS = {
		//车辆类型
		"cllx": { 
			"H": "货车",
			"H1": "重型货车",
			"H2": "中型货车",
			"H3": "轻型货车",	
			"H4": "微型货车",	
			"H5": "低速货车",	
			"K1": "大型客车",	
			"K2": "中型客车",	
			"K3": "小型客车",	
			"K31": "小型普通客车",	
			"K32": "小型越野车",	
			"K33": "小型轿车",	
			"M": "摩托车",	
			"Q": "其他"	
		},
		//车牌类型
		"cphmlx": {
			"01": "大型汽车",
			"02": "小型汽车",
			"03": "使馆汽车",
			"04": "领馆汽车",
			"05": "境外汽车",
			"06": "外籍汽车",
			"07": "普通摩托车",
			"08": "轻便摩托车",
			"09": "使馆摩托车",
			"10": "领馆摩托车",
			"11": "境外摩托车",
			"12": "外籍摩托车",
			"13": "低速车",
			"14": "拖拉机",
			"15": "挂车",
			"16": "教练汽车",
			"17": "教练摩托车",
			"20": "临时入境汽车",
			"21": "临时入境摩托车",
			"22": "临时行驶车",
			"23": "警用汽车",
			"26": "香港入出境车",
			"27": "澳门入出境车",
			"31": "武警号码",
			"32": "军队号码",
			"99": "其他号码"
		},
		//车辆品牌
		"moreBrand": {
			"1":"	奥迪",
			"2":"	阿尔法罗密欧",
			"3":"	阿斯顿马丁",
			"4":"	奔驰",
			"5":"	宝马",
			"6":"	宾利",
			"7":"	布嘉迪",
			"8":"	保时捷",
			"9":"	别克",
			"10":"	本田",
			"11":"	标致",
			"12":"	比亚迪",
			"13":"	北汽",
			"14":"	宝骏",
			"15":"	宝腾",
			"16":"	长城",
			"17":"	长安",
			"18":"	长丰",
			"19":"	昌河",
			"20":"	川汽野马",
			"21":"	东风",
			"22":"	风神",
			"23":"	大发",
			"24":"	帝豪",
			"25":"	东南",
			"26":"	道奇",
			"27":"	大众",
			"28":"	大宇",
			"29":"	大迪",
			"30":"	法拉利",
			"31":"	丰田",
			"32":"	皇冠",
			"33":"	福特",
			"34":"	野马",
			"35":"	菲亚特",
			"36":"	福田",
			"37":"	福迪",
			"38":"	富奇",
			"39":"	广汽",
			"40":"	GMC",
			"41":"	光冈",
			"42":"	海马",
			"43":"	哈飞",
			"44":"	悍马",
			"45":"	霍顿",
			"46":"	华普",
			"47":"	华泰",
			"48":"	红旗",
			"49":"	黄海",
			"50":"	汇众",
			"51":"	捷豹",
			"52":"	吉普",
			"53":"	金杯",
			"54":"	江淮",
			"55":"	吉利",
			"56":"	江铃",
			"57":"	江南",
			"58":"	吉奥",
			"59":"	解放",
			"60":"	九龙",
			"61":"	金龙",
			"62":"	凯迪拉克",
			"63":"	克莱斯勒",
			"64":"	柯尼塞格",
			"65":"	开瑞",
			"66":"	KTM",
			"67":"	克尔维特",
			"68":"	兰博基尼",
			"69":"	劳斯莱斯",
			"70":"	路虎",
			"71":"	莲花",
			"72":"	林肯",
			"73":"	雷克萨斯",
			"74":"	铃木",
			"75":"	雷诺",
			"76":"	力帆",
			"77":"	陆风",
			"78":"	理念",
			"79":"	迈巴赫",
			"80":"	名爵",
			"81":"	迷你",
			"82":"	玛莎拉蒂",
			"83":"	马自达",
			"84":"	纳智捷",
			"85":"	南汽",
			"86":"	欧宝",
			"87":"	讴歌",
			"88":"	奥兹莫比尔",
			"89":"	帕加尼",
			"90":"	庞蒂克",
			"91":"	奇瑞",
			"92":"	起亚",
			"93":"	全球鹰",
			"94":"	庆铃",
			"95":"	启辰",
			"96":"	尼桑",
			"97":"	瑞麒",
			"98":"	荣威",
			"99":"	罗森",
			"100":"	罗孚",
			"101":"	萨博",
			"102":"	斯巴鲁",
			"103":"	双环",
			"104":"	世爵",
			"105":"	斯派朗",
			"106":"	三菱",
			"107":"	双龙",
			"108":"	smart",
			"109":"	斯柯达",
			"110":"	塔塔",
			"111":"	土星",
			"112":"	沃尔沃",
			"113":"	威麟",
			"114":"	五菱",
			"115":"	威兹曼",
			"116":"	沃克斯豪尔",
			"117":"	五十铃",
			"118":"	现代",
			"119":"	雪佛兰",
			"120":"	夏利",
			"121":"	雪铁龙",
			"122":"	西亚特",
			"123":"	英菲尼迪",
			"124":"	英伦",
			"125":"	一汽",
			"126":"	奔腾",
			"127":"	跃进",
			"128":"	依维柯",
			"129":"	永源",
			"130":"	中华",
			"131":"	众泰",
			"132":"	中兴",
			"133":"	中顺",
			"134":"	华阳",
			"135":"	飞虎"
		}
}
//车辆品牌
var brands = {"A":[{id:"001",title:"奥迪",image:"ad.png"},
				{id:"002",title:"阿尔法罗密欧",image:"aeflmo.jpg"},
				{id:"088",title:"奥兹莫比尔",image:"aozimobier.jpg"},
				{id:"003",title:"阿斯顿马丁",image:"asidunmadin.jpg"}],
             "B":[{id:"004",title:"奔驰",image:"bc.png"},
         		{id:"005",title:"宝马",image:"bm.png"},
        		{id:"126",title:"奔腾",image:"benteng.png"},
        		{id:"006",title:"宾利",image:"bl.png"},
        		{id:"007",title:"布嘉迪",image:"bujiadi.jpg"},
        		{id:"008",title:"保时捷",image:"bsj.png"},
        		{id:"009",title:"别克",image:"bk.png"},
        		{id:"010",title:"本田",image:"bt.png"},
        		{id:"011",title:"标致",image:"bz.png"},
        		{id:"012",title:"比亚迪",image:"byd.png"},
        		{id:"013",title:"北汽",image:"beiqi.jpg"},
        		{id:"014",title:"宝骏",image:"bj.png"},
        		{id:"015",title:"宝腾",image:"baoteng.png"},
        		{id:"142",title:"北京汽车",image:"beijingqc.png"},
        		{id:"801",title:"宝龙",image:"baolong.png"}],
             "C":[{id:"016",title:"长城",image:"changcheng.jpg"},
         		{id:"017",title:"长安",image:"changan.jpg"},
        		{id:"018",title:"长丰",image:"changfeng.jpg"},
        		{id:"019",title:"昌河",image:"changhe.jpg"},
        		{id:"020",title:"川汽野马",image:"chuanqi.jpg"}],
             "D":[{id:"021",title:"东风",image:"df.png"},
        		{id:"023",title:"大发",image:"dafa.jpg"},
        		{id:"024",title:"帝豪",image:"dihao.jpg"},
        		{id:"025",title:"东南",image:"dongnan.jpg"},
        		{id:"026",title:"道奇",image:"daoqi.png"},
        		{id:"027",title:"大众",image:"dz.png"},
        		{id:"028",title:"大宇",image:"dayu.png"},
        		{id:"029",title:"大迪",image:"dadi.jpg"}],
            // "E":[],
             "F":[{id:"030",title:"法拉利",image:"fll.png"},
         		{id:"033",title:"福特",image:"ft.png"},
         		{id:"022",title:"风神",image:"fengshen.png"},
        		{id:"035",title:"菲亚特",image:"feiyate.jpg"},
        		{id:"036",title:"福田",image:"futian.jpg"},
        		{id:"135",title:"飞虎",image:"blank.png"},
        		{id:"037",title:"福迪",image:"fudi.jpg"},
        		{id:"038",title:"富奇",image:"blank.png"},
         		{id:"031",title:"丰田",image:"fengtian.png"}],
             "G":[{id:"039",title:"广汽",image:"gq.png"},
         		{id:"040",title:"GMC",image:"gmc.png"},
        		{id:"041",title:"光冈",image:"gg.png"},
        		{id:"806",title:"观致",image:"guanzhi.png"}],
             "H":[{id:"032",title:"皇冠",image:"huangguan.jpg"},
        		{id:"134",title:"华阳",image:"blank.png"},
        		{id:"042",title:"海马",image:"haima.png"},
        		{id:"043",title:"哈飞",image:"hafei.jpg"},
        		{id:"044",title:"悍马",image:"hm.png"},
        		{id:"045",title:"霍顿",image:"huodun.jpg"},
        		{id:"046",title:"华普",image:"huapu.jpg"},
        		{id:"047",title:"华泰",image:"huatai.jpg"},
        		{id:"048",title:"红旗",image:"hongqi.jpg"},
        		{id:"049",title:"黄海",image:"huanghai.jpg"},
        		{id:"050",title:"汇众",image:"huizhong.jpg"},
        		{id:"146",title:"黑豹",image:"heibao.png"},
        		{id:"850",title:"华北",image:"huabei.png"}],
            // "I":[],
             "J":[{id:"051",title:"捷豹",image:"jiebao.jpg"},
         		{id:"052",title:"吉普",image:"jp.png"},
        		{id:"053",title:"金杯",image:"jinbei.jpg"},
        		{id:"054",title:"江淮",image:"jianghuai.jpg"},
        		{id:"055",title:"吉利",image:"jili.jpg"},
        		{id:"056",title:"江铃",image:"jianglin.jpg"},
        		{id:"057",title:"江南",image:"jiangnan.jpg"},
        		{id:"058",title:"吉奥",image:"jiao.png"},
        		{id:"059",title:"解放",image:"jiefang.png"},
        		{id:"060",title:"九龙",image:"jiulong.png"},
        		{id:"812",title:"金龙",image:"jinlong.jpg"},
        		{id:"811",title:"金程",image:"jincheng.png"},
        		{id:"813",title:"金旅",image:"jinlv.png"}],
             "K":[{id:"062",title:"凯迪拉克",image:"kdlk.png"},
         		{id:"063",title:"克莱斯勒",image:"kelaisilei.jpg"},
        		{id:"064",title:"柯尼塞格",image:"blank.png"},
        		{id:"065",title:"开瑞",image:"kairui.jpg"},
        		{id:"066",title:"KTM",image:"blank.png"},
        		{id:"067",title:"克尔维特",image:"keerweite.png"},
        		{id:"814",title:"凯马",image:"kaima.png"},
        		{id:"815",title:"凯翼",image:"kaiyi.png"}],
             "L":[{id:"068",title:"兰博基尼",image:"lbjn.png"},
         		{id:"069",title:"劳斯莱斯",image:"lsls.png"},
        		{id:"070",title:"路虎",image:"lh.png"},
        		{id:"099",title:"罗森",image:"luoshen.png"},
        		{id:"100",title:"罗孚",image:"luofu.png"},
        		{id:"071",title:"莲花",image:"lianhua.jpg"},
        		{id:"072",title:"林肯",image:"lk.png"},
        		{id:"073",title:"雷克萨斯",image:"lkss.png"},
        		{id:"074",title:"铃木",image:"lm.png"},
        		{id:"075",title:"雷诺",image:"leiruo.jpg"},
        		{id:"076",title:"力帆",image:"lifang.jpg"},
        		{id:"077",title:"陆风",image:"lufeng.jpg"},
        		{id:"078",title:"理念",image:"linian.jpg"}],
             "M":[{id:"079",title:"迈巴赫",image:"mbh.png"},
         		{id:"080",title:"名爵",image:"mingjue.jpg"},
        		{id:"081",title:"迷你",image:"mn.png"},
        		{id:"082",title:"玛莎拉蒂",image:"msld.jpg"},
        		{id:"083",title:"马自达",image:"mzd.png"},
        		{id:"818",title:"美亚",image:"meiya.png"}],
             "N":[{id:"084",title:"纳智捷",image:"nazhijie.jpg"},
         		{id:"096",title:"日产",image:"rc.png"},
         		{id:"085",title:"南汽",image:"nanqi.png"}],
             "O":[{id:"086",title:"欧宝",image:"ob.png"},
         		{id:"087",title:"讴歌",image:"og.png"},
         		{id:"136",title:"欧朗",image:"ol.png"}],
             "P":[{id:"089",title:"帕加尼",image:"pojiani.png"},
         		{id:"090",title:"庞蒂克",image:"blank.png"}],
             "Q":[{id:"091",title:"奇瑞",image:"qirui.jpg"},
         		{id:"092",title:"起亚",image:"qy.png"},
        		{id:"093",title:"全球鹰",image:"quanqiuying.jpg"},
        		{id:"094",title:"庆铃",image:"qinling.jpg"},
        		{id:"095",title:"启辰",image:"qichen.jpg"}],
             "R":[{id:"097",title:"瑞麒",image:"ruilin.jpg"},
         		{id:"098",title:"荣威",image:"rongwei.jpg"}],
             "S":[{id:"101",title:"萨博",image:"sabo.png"},
         		{id:"102",title:"斯巴鲁",image:"sbl.png"},
        		{id:"103",title:"双环",image:"shuanghuang.jpg"},
        		{id:"104",title:"世爵",image:"shijue.jpg"},
        		{id:"105",title:"斯派朗",image:"blank.png"},
        		{id:"106",title:"三菱",image:"sanling.jpg"},
        		{id:"107",title:"双龙",image:"sl.png"},
        		{id:"108",title:"smart",image:"smart.png"},
        		{id:"109",title:"斯柯达",image:"sikeda.jpg"},
        		{id:"137",title:"双龙",image:"shuanglong.png"},
        		{id:"138",title:"思铭",image:"siming.png"},
        		{id:"826",title:"陕汽",image:"shanqi.png"},
        		{id:"828",title:"上汽",image:"shangqi.png"}],
             "T":[{id:"110",title:"塔塔",image:"tata.jpg"},
         		{id:"111",title:"土星",image:"tuxing.png"},
         		{id:"139",title:"天马",image:"tiamma.png"}],
             //"U":[],
             //"V":[],
             "W":[{id:"112",title:"沃尔沃",image:"woerwo.jpg"},
         		{id:"113",title:"威麟",image:"weilin.jpg"},
        		{id:"114",title:"五菱",image:"wuling.jpg"},
        		{id:"115",title:"威兹曼",image:"wzm.png"},
        		{id:"116",title:"沃克斯豪尔",image:"erao.png"},
        		{id:"117",title:"五十铃",image:"ISUZU.png"}],
             "X":[{id:"118",title:"现代",image:"xd.png"},
         		{id:"119",title:"雪佛兰",image:"xfl.png"},
        		{id:"120",title:"夏利",image:"xiali.jpg"},
        		{id:"121",title:"雪铁龙",image:"xtl.png"},
        		{id:"122",title:"西亚特",image:"xyt.png"}],
             "Y":[{id:"123",title:"英菲尼迪",image:"yfnd.png"},
         		{id:"127",title:"跃进",image:"yuejin.jpg"},
        		{id:"128",title:"依维柯",image:"IVECO.png"},
        		{id:"842",title:"永源",image:"yongyuan.jpg"},
         		{id:"124",title:"英伦",image:"yinlun.jpg"},
        		{id:"840",title:"野马",image:"yema.jpg"},
        		{id:"125",title:"一汽",image:"yiqi.jpg"},
        		{id:"839",title:"羊城",image:"yangcheng.png"},
        		{id:"841",title:"英致",image:"yingzhi.png"}],
             "Z":[{id:"130",title:"中华",image:"zhonghua.jpg"},
         		{id:"131",title:"众泰",image:"zhongtai.jpg"},
        		{id:"132",title:"中兴",image:"zhongxin.jpg"},
        		{id:"133",title:"中顺",image:"zhongshun.jpg"},
        		{id:"845",title:"中国重汽",image:"zgzhongqi.png"}]
};
//卡口下拉树选择项
var dropdownOptions = {
		isShowFolder: true,
		multiple: true,
		dropdownWidth: '245px',
//		dropdownWidth: '100%',
		dropdowndefault: '请选择卡口/路口',
//		leafNodeRender: kkTreeNodeRender,
		parentNodeRender: function(treeNode){
			if(treeNode.IS_ROLE == 'false'){
				treeNode.chkDisabled = true;
			}
			if(!treeNode.hasChildren){
				treeNode =  $.extend(treeNode, {
					isParent:false,
				});
			}
			return treeNode;
		}
};


//人脸抓拍下拉树选择项
var faceDetectDropdownOptions = {
		isShowFolder: true,
		multiple: true,
		dropdownWidth: '100%',
		dropdowndefault: '请选择人脸抓拍机',
		parentNodeRender: function(treeNode){
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
};

//电子围栏下拉树选择项
var efencenDropdownOptions = {
		isShowFolder: false,
		multiple: true,
		dropdownWidth: '270px',
		dropdowndefault: '请选择电子围栏',
//		leafNodeRender: kkTreeNodeRender,
		parentNodeRender: function(treeNode){
			if(treeNode.IS_ROLE == 'false'){
				treeNode.chkDisabled = true;
			}
			if(!treeNode.hasChildren){
				treeNode =  $.extend(treeNode, {
					isParent:false,
				});
			}
			return treeNode;
		}
};

function kkTreeNodeRender(node){
	var icontext = "";
	
	if( node.showvirtual ) {//球机
		icontext = "<span class='img-icon sphere-video'></span>";//正常
	}else{//枪机
		icontext = "<span class='img-icon gun-video'></span>";//正常
	}
	
	//<span class="icon-video001 '+color+'"></span>
	return $.extend({
		text: icontext+'<span class="video-name-text" title="'+node.text+'" >' + node.text + '</span>',
		id: node.id
	}, node);
}

//IE8下不支持数组indexOf的解决方法
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

//渲染号牌颜色
function renderHPYS(hpys) {
	var ret = '';
	if(hpys=='蓝色' || hpys=='0') {
		ret = 'car-num-blue';
	}else if(hpys=='黄色' || hpys=='2') {
		ret = 'car-num-yellow';
	}else if(hpys=='白色' || hpys=='3') {
		ret = 'car-num-write';
	}
	return ret;
}

//根据号牌颜色返回class属性
function renderHPYS1(hpys){
	var ret = '';
	if(hpys=='蓝色' || hpys=='0') {
		ret = 'plate-blue';
	}else if(hpys=='黄色' || hpys=='2') {
		ret = 'plate-yellow';
	}else if(hpys=='白色') {
		ret = 'plate-white';
	}else if(hpys=='黑色') {
		ret = 'plate-black';
	}
	return ret;	
}
//技战法页面加载显示前20条
function renderTwenty(index){
	if(index>21){
		return "hide";
	}
}

//技战法分页大小
var pageSize = 21, currentPage = 1, totalPage = 1, totalNum = 0;
function renderPages(size,pageSize){
	if(size>pageSize){
		$("#totalSize").html(size);
		$("#pageSize").html(pageSize);
	}else{
		$("#moreDiv").hide();
	}
}
//技战法分页功能
function initTechnicalPage(sums){
	totalNum = sums;
	totalPage = Math.ceil(totalNum / pageSize);
	
	
	
	var $pager = $("body").find("[listview-page]");
	$pager.find("[listview-prev-btn]").each(function(){
		$(this).click(function(){
				if(!$(this).hasClass("disable")){
					currentPage--;
					onPageChangeBtn();
				}
				return false;
			});
  	});
	
	$pager.find("[listview-next-btn]").each(function(){
		
		$(this).click(function(){
				if(!$(this).hasClass("disable")){
					currentPage++;
					onPageChangeBtn();
				}
				return false;
			});
	});	
	
	onPageChangeBtn();
}

function onPageChangeBtn(){
	var element = $('body');
	
	element.find('[page]').addClass('hide');
	element.find('[page="'+currentPage+'"]').removeClass('hide');
	
	if(currentPage > 1) {
		element.find('[listview-prev-btn]').removeClass("disable");
	} else {
		element.find('[listview-prev-btn]').addClass("disable");
	}
	if(currentPage == totalPage) {
		element.find('[listview-next-btn]').addClass("disable");
	} else {
		element.find('[listview-next-btn]').removeClass("disable");
	}
	element.find("[listview-total]").html("" + totalPage);
	element.find("[listview-current]").html("" + currentPage);
	element.find("[listview-counts]").html("" + totalNum);
}

function renderPageIndex(index){
	return index % pageSize + 1;
}

function renderCurrentPage(index){
	return parseInt((index-1)/pageSize)+1;
}

//地图展示气泡图片
function showDialogOnMap(title,url,x,y,jgsj){
	//top.SuntekMap.require("map",[],function(){
		//var map = top.SuntekMap.getMap();
		var map = parent.SuntekMap.getMap();
		map.openInfoWindow(
			{x:x,y:y},						    // 点线面的esriJSON格式
			{txmc1:url,jgsj:jgsj},					// 气泡属性，如摄像机名称,ID等，也可以传null
			{
			 frameTitle:title,					// 气泡标题
			 frameSrc:"/gis/page/infowin/ecarsPicInfo.html"	                    // 气泡内容URL地址，可以是html,jpg,png,gif			 
			});
	//});
}

//地图定位展示详情
function showDetailOnMap(title,url,x,y,time,name,type){
	if (name==undefined) {
		name = "";
	}
	if (type==undefined) {
		type = "face";
	}
	var record = {txmc1:url,jgsj:time,name:name};
	renderHtmlType(record, type);
	//var map = top.SuntekMap.getMap();
	var map = parent.UI.map.getMap();
	map.openInfoWindow(
		{x:x,y:y},						    // 点线面的esriJSON格式
		record,					// 气泡属性，如摄像机名称,ID等，也可以传null
		{
		 frameTitle:title,					// 气泡标题
		 //frameSrc:"/gis/page/infowin/ecarsPicInfo.html"
		 frameSrc:record.html  // 气泡内容URL地址，可以是html,jpg,png,gif			 
		}
	);
}

//地图显示轨迹
function showTracksOnMap(list, type){
	var mapJson = [];//TODO linsj

	if (type==undefined) {
		type = "face";
	}
	
	if(list && list.length>=2){
		for(var i=0; i<list.length; i++){
			var record = {};
			if(list[i].KKBH){
				record.id = list[i].KKBH;
				record.title = list[i].HPHM;
				record.name = list[i].KKMC;
				record.image = list[i].TXMC1;
				record.txmc1 = list[i].TXMC1;
			}else if(list[i].ORIGINAL_DEVICE_ID){
				record.id = list[i].ORIGINAL_DEVICE_ID;
				record.title = list[i].DEVICE_NAME;
				record.name = list[i].DEVICE_NAME;
				record.image = list[i].OBJ_PIC;
				record.txmc1 = list[i].OBJ_PIC;
			}
			
			var listTime = list[i].TIME;
			
			if (/^(\d{4})\-(\d{2})\-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/.test(listTime)) {
				listTime = Date.parse(listTime.replace('-','/').replace('-','/'));
			}
			
			record.time = listTime; //时间戳
			record.x = list[i].X;
			record.y = list[i].Y;
//			record.html = "/gis/page/infowin/ecarsPicInfo.html?id={txmc1}";
			record.jgsj = formatTimestamp(listTime);
			
			renderHtmlType(record, type);
			
			mapJson.push(record);
		}
	}else{
		UI.util.alert("在查询条件限定内无轨迹！", "warn");
		return false;
	}
	
	var iconImg = "/efacecloud/images/icon/user.png";
	
	//top.SuntekMap.require("map",["trackLoader","trackplayer"],function(){
	parent.SuntekMap.require("map",["trackLoader","trackplayer"],function(){
		//top.SuntekMap.callLater(function(map){
		parent.SuntekMap.callLater(function(map){
			$.each(mapJson,function(item){
				item.wkid = 4326;
			});
			setTimeout(function(){
				if(tempTrackColors.length==0){
					tempTrackColors = trackColors.concat();
				}
				var trackColor = tempTrackColors.shift();				
				map.callModule("trackLoader","addSample",JSON.stringify(mapJson),trackColor,iconImg);	
			},200);
		});
	});	
}

//轨迹颜色	 参考色：{"橙":16750899,"紫":10966952,"蓝":3368601,"黄":16776960,"靛":6684927,"绿":6750003,"黑":0,"红":13369344}
//var trackColors = [0xcc0000,0x0000cc,0x000000];
var trackColors = [13369344,0,3368601,10966952];
var tempTrackColors = [];
var trackCallbackIds = {};

//地图显示多重轨迹
function showMultiTracksOnMap(name, list, type){
	var mapJson = [];
	if(list && list.length>=2){
		for(var i=0; i<list.length; i++){
			var record = {};
//			if(list[i].ORIGINAL_DEVICE_ID){
			record.id = list[i].ORIGINAL_DEVICE_ID;
			record.title = list[i].DEVICE_NAME;
			record.name = list[i].DEVICE_NAME;
			record.image = list[i].OBJ_PIC;
			record.txmc1 = list[i].OBJ_PIC;
//			}
			record.time = list[i].TIME;
			record.x = list[i].X;
			record.y = list[i].Y;
//			record.html = "/gis/page/infowin/ecarsPicInfo.html?id={txmc1}";
			record.jgsj = formatTimestamp(list[i].TIME);
			
			renderHtmlType(record, type);
			
			mapJson.push(record);
		}
	}else{
		UI.util.alert("在查询条件限定内无轨迹！", "warn");
		return false;
	}
	
	var targetUrl = "/efacecloud/images/icon/";
	if(type=="face"){
		targetUrl += "user.png";
	}else if(type=="car"){
		targetUrl += "car.png";
	}else{
		targetUrl += "car.png";
	}
	
	var len = trackColors.length;
	var color = trackColors[Math.ceil(Math.random()*10)%len];
	//top.SuntekMap.require("map",["multiTrackPlayer"],function(){
	parent.SuntekMap.require("map",["multiTrackPlayer"],function(){
		var option={
			strokeStyle:"solid",	// 线样式，solid:实线,dashdot 虚线,dashdotdot 虚线，dot 点虚线
			strokeColor:color,			// 线颜色，默认为黑色	
			strokeWidth:3,			// 线宽，默认3个像素
			strokeOpacity:0.8,		// 线透明度
			showDistance:false,		// 是否显示两点间的距离，默认不显示
			//icon:"http://localhost/img/%E8%BD%A6%E8%BE%86%E5%9B%BE%E6%A0%87/%E5%8D%A1%E5%8F%A3.png",		// 节点图标地址
			targetIcon:targetUrl,
			iconX:0,				// 节点X偏移
			iconY:12				// 节点Y偏移
		};
		
		//trackCallbackIds[name] = top.SuntekMap.getMap().callModule("multiTrackPlayer","addTrack",JSON.stringify(mapJson),option);	
		trackCallbackIds[name] = parent.SuntekMap.getMap().callModule("multiTrackPlayer","addTrack",JSON.stringify(mapJson),option);	
	});	
}

function renderHtmlType(record, type){
	switch(type){
		case "car" :
			record.width = "200";
			record.height = "150";
			record.html = "/gis/page/infowin/ecarsPicInfo.html?id={txmc1}";
			break;
		case "face" :
			record.width = "146";
//			record.width = "240";
			record.height = "208";
			record.html = "/gis/page/infowin/ecarsPicInfo.html?id={txmc1}";
			break;
		case "wifi" :
			record.width = "200";
			record.height = "80";
			record.html = "/efacecloud/page/technicalStation/macInfo.html";
			break;
	}
}

//点击地图框选
$('.form-con').on('click','[map="mapBtn"]',function(e){
	if($('#kkbhIdx').size()>0){
		var idx = $(this).parents('.map-icon-list').attr("index");
		$('#kkbhIdx').val(idx);
	}
	var $this = $(this),
		name = $this.attr("name"),
		/*togglekk = $this.attr('togglebtn'),
		$kktree = $("[togglekk='"+ togglekk +"']");*/
		layerName = $(this).parents('.map-icon-list').attr("layerName");
		if(typeof top.selectKkbhForMap=='function'){
			top.selectKkbhForMap(name, layerName);
		}else{
			selectKkbhForMap(name, layerName);
		}
	/*if(name == "showKKTree"){
		$kktree.hasClass("hide")?$kktree.removeClass("hide"):$kktree.addClass("hide");
		$this.parent().hasClass("active")?$this.parent().removeClass("active"):$this.parent().addClass("active");
	}else{*/
		if( !$this.parent().hasClass('active') ){
			$this.parents('.map-icon-list').find('[map="mapBtn"]').parent().removeClass('active');
			if( $this.attr('name')!='delete' ){
				$this.parent().addClass('active');
			}
		}else{
			if(typeof top.selectKkbhForMap=='function'){
				top.selectKkbhForMap("deactivateDraw", layerName);
			}else{
				selectKkbhForMap("deactivateDraw", layerName);
			}
			$this.parents('.map-icon-list').find('[map="mapBtn"]').parent().removeClass('active');
		}
	/*}*/
	e.stopPropagation();
});

//车牌
function renderMoreBrands(code) {
	$("#moreBrandUl").html(tmpl("moreBrandsTmpl",brands[code]));
}

//渲染图片，如果没有数据默认显示无图图片
function rendderImgUrl(imgUrl) {
	return imgUrl || '/ecars/images/nophoto.jpg';
}

//解决IE下new Date()不能传参数问题
function newDateAndTime(dateStr){
	var ds = dateStr.split(" ")[0].split("-");
	var ts = dateStr.split(" ")[1].split(":");
	var date = new Date();
	date.setFullYear(ds[0],ds[1] - 1, ds[2]);
	date.setHours(ts[0], ts[1], ts[2], 0);
	return date;
}

function getLimitDate(dateStr, dates){
	var date = newDateAndTime(dateStr);
	date.setDate(date.getDate() + dates);
	return date.format('yyyy-MM-dd HH:mm:ss');
}

function getLimitTime(dateStr, mins){
	var date = newDateAndTime(dateStr);
	date.setMinutes(date.getMinutes() + mins);
	return date.format('yyyy-MM-dd HH:mm:ss');
}

function getLimitSec(dateStr, secs){
	var date = newDateAndTime(dateStr);
	date.setSeconds(date.getSeconds() + secs);
	return date.format('yyyy-MM-dd HH:mm:ss');
}

//解决IE下new Date()不能传参数问题
function newDay(dateStr){
	var ds = dateStr.split(" ")[0].split("-");
	var date = new Date();
	date.setFullYear(ds[0],ds[1] - 1, ds[2]);
	return date;
}

function getLimitDay(dateStr, dates){
	var date = newDay(dateStr);
	date.setDate(date.getDate() + dates);
	return date.format('yyyy-MM-dd');
}

function getRangeDay(beginDate,endDate,formats){
	var ranges = [];
	var end = newDay(endDate);
	var date = newDay(beginDate);
	if(!formats){
		formats = 'yyyyMMdd';
	}
	while(end>=date){
		ranges.push(date.format(formats));
		date.setDate(date.getDate() + 1);
	}
	return ranges.join(",");
}

function getDateByDay(day, flag){
	//返回时间的方法,-1是昨天,1是明天
	var _time = new Date().getTime();
	var aDayLong = 1000*60*60*24;
	if(flag==1)
		return dateFormat(new Date(_time+aDayLong*day), 'yyyy-MM-dd 00:00:00');
	else
		return dateFormat(new Date(_time+aDayLong*day), 'yyyy-MM-dd 23:59:59');
}

function formatTimestamp(time){
	var dateTime = dateFormat(new Date(parseInt(time)), 'yyyy-MM-dd HH:mm:ss');
	return dateTime;
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

//根据id初始化卡口下拉树
function initDropdowntree(id) {
	if(id){
		
		var idx = id.split("_")[1];
		UI.control.getControlById(id).bindEvent("onDropdownSelect", function(node){
			$('#kkbh_'+idx).val(getKkbhIdArr(node).join(','));
		});
	}else{
		
		UI.control.getControlById("kkbhTree").bindEvent("onDropdownSelect", function(node){
			$('#kkbh').val(getKkbhIdArr(node).join(','));
		});
	}
}

//根据id初始化卡口下拉树
function initDropdowntreeById(treeId, id) {
	if(id){
		
		var idx = id.split("_")[1];
		UI.control.getControlById(id).bindEvent("onDropdownSelect", function(node){
			$('#'+treeId+'_'+idx).val(getKkbhIdArr(node).join(','));
		});
	}else{
		
		UI.control.getControlById(treeId+"Tree").bindEvent("onDropdownSelect", function(node){
			$('#'+treeId).val(getKkbhIdArr(node).join(','));
		});
	}
}

//根据id初始化人脸抓拍下拉树
function initFaceDetectDropdowntree(id) {
	if(id){
		
		var idx = id.split("_")[1];
		UI.control.getControlById(id).bindEvent("onDropdownSelect", function(node){
			$('#faceDetect_'+idx).val(getKkbhIdArr(node).join(','));
		});
	}else{
		
		UI.control.getControlById("faceDetectTree").bindEvent("onDropdownSelect", function(node){
			$('#faceDetect').val(getKkbhIdArr(node).join(','));
		});
	}
}

function loadFeatures(node){
	SuntekMap.require("map",[],function(){
		map = SuntekMap.getMap();
		// 动态图层参数
		var options = {
			//htmlSrc:"/gis/page/infowin/cameraInfo.html",		//气泡框html地址			
			labelField:"DEVICE_NAME",									//文字标注属性名称
			icon:"/gis/images/symbol/camera.png"					//图标地址
		};
		
		var callbackId = map.loadFeatures(data,options);
		// 订阅要素点击事件
		$.subscribe(callbackId+"/featureClick",function(jq,data){
			//console.log(data);
		});
		// 将地图缩放平移到能看到所有要素的位置
		map.callObject(callbackId,"viewInMap");
		// 后续操作，选择单个要素
		//map.callObject(callbackId,"selectFeature",0);
		// 移除要素,移除后之前的要素索引会改变
		// map.callObject(callbackId,"removeFeature",0);
	});
}

/******************* map 卡口 begin ********************/
function setSelect(dropDownTree, id) {
	var node = dropDownTree.getNodes();
	
	if(node) {
		for(var i=0; i<node.length; i++) {
			
			searchTree(dropDownTree, node[i], id);
		}
	}
}

function searchTree(dropDownTree, tnode, id) {
	try {
		var cNode = tnode.ChildNodes;
		if(cNode){
			for(var i=0; i<cNode.length; i++) {
				if(cNode[i].hasChildren) {
					searchTree(dropDownTree, cNode[i], id);
				} else {
					if(cNode[i].id == id) {
						dropDownTree.checkNode(cNode[i], true, true);
						break;
					}
				}
			}
		}else{
			if(tnode.id == id) {
				dropDownTree.checkNode(tnode, true, true);
			}
		}
	} catch(e) {
	}
}

function onFeatureSelected(features,layerName){
	/*var treeId = "kkbh";
	if(layerName == 'V_DOOR_INFO'){
		treeId = "doorDetect";
	} else if(layerName == 'V_FACE_DEVICE_INFO') {
		treeId = "faceDetect";
	} else if(layerName == 'V_CAMERA_DEVICE_INFO'){
		treeId = "videoStructure";
	} else {
		onKakouFeatureSelected(features);
	}
	onDeviceFeatureSelected(treeId, features);*/
	
	var deviceId = [],deviceName = [],deviceIdInt = [],deviceNameStr = '',deviceIdStr = '',deviceIdIntStr = '';
	$.each(features,function(i,n){
		deviceId.push(n.properties.DEVICE_ID);
		deviceName.push(n.properties.DEVICE_NAME);
		deviceIdInt.push(n.properties.DEVICE_ID_INT);
	});
	deviceNameStr = deviceName.join(",");
	deviceIdStr = deviceId.join(",");
	deviceIdIntStr = deviceIdInt.join(",");
	
	var idx = $('#kkbhIdx').val();
	idx = idx == undefined ? "":"_"+idx;
	
	$("#deviceNames"+idx).html(deviceNameStr).attr("title",deviceNameStr);
	//$("#faceDetect").html(deviceIdStr).attr("title",deviceIdStr);
	$("#faceDetect"+idx).val(deviceIdStr);
	$("#deviceIdInt"+idx).val(deviceIdIntStr);
}

function onDeviceFeatureSelected(treeId, features)
{
	var idx = $('#kkbhIdx').val();
	idx = idx == undefined ? "":"_"+idx;
	
	var dropDownTree = UI.control.getControlById(treeId+'Tree'+idx); 
	dropDownTree.checkAllNodes(false);
	
	if(features && features.length>0) {
		var values = [];
		var names = [];
		for(var i=0;i<features.length;i++){
			values.push(features[i].properties.ORIGINAL_DEVICE_ID);
			names.push(features[i].properties.DEVICE_NAME);
			
			setSelect(dropDownTree, features[i].properties.ORIGINAL_DEVICE_ID);
		}
		
		$('#'+treeId+idx).val(values.join(','));
		$('#'+treeId+'Tree'+idx+' div.dropdown-tree-text span.tree-title').text(names.join(','));
	}else{
		$('#'+treeId+idx).val('');
		$('#'+treeId+'Tree'+idx+' div.dropdown-tree-text span.tree-title').text('');
	}
}

function clearMapTracks(){
	var map = SuntekMap.getMap();
	
	if (map != null) {
		map.clear();//清除地图框选
		map.callModule("trackplayer","clearAll");//清除轨迹
		map.callModule("multiTrackPlayer","removeAll");//清除多轨轨迹
		map.unloadModules(["trackLoader","trackplayer"]);//清除轨迹播放控件
	}
}

/******************* map 卡口 end ********************************/

//定位显示图片
function vehicleLocator(xxbhs){
	UI.control.remoteCall('vehicle/queryByCombines', {'XXBHS':xxbhs}, function(resp){
		var info = resp.list[0];
		var kkmc = info.KKMC;
		var txmc1 = info.TXMC1;
		var x = info.X;
		var y = info.Y;
		showDialogOnMap(kkmc,txmc1,x,y);
	});
}

//显示轨迹
function vehicleShowTracks(xxbhs){
	UI.control.remoteCall('vehicle/queryByCombines', {'XXBHS':xxbhs}, function(resp){
		if(resp.list){
			showTracksOnMap(resp.list);
		}
	});
}

//查询结果显示详情
//显示轨迹
$('body').on('click','.showRetTrack',function(e){
	var hphm = $(this).attr("hphm");
	parent.queryParams.hphm = hphm;
	UI.control.remoteCall('vehicle/queryByHphms', parent.queryParams, function(resp){
		if(resp.list){
			showTracksOnMap(resp.list);
		}
	});
	
	e.stopPropagation();
});

//清空地图
function clearMap(){
	
	//top.SuntekMap.getMap().closeInfoWindow();  //前张图片清除
	
	//top.SuntekMap.getMap().clear();  //map上图标清除
	
	//top.SuntekMap.getMap().setLayerVisible("V_FACE_DEVICE_INFO",false); //清除卡口点
	
	//top.clearMapTracks();
	
	parent.SuntekMap.getMap().closeInfoWindow();  //前张图片清除
	
	parent.SuntekMap.getMap().clear();  //map上图标清除
	
	//top.SuntekMap.getMap().setLayerVisible("V_FACE_DEVICE_INFO",false); //清除卡口点
	
	parent.clearMapTracks();
}

//同行车分析
$('body').on('click','.followRetCar',function(e){
	top.clearMapTracks();
	var hphm = $(this).attr("hphm");
	showForm('/ecars2.0/page/technicalStation/togethercarForm.html?hphm='+hphm);
	e.stopPropagation();
});

//正则验证
var patterns = {};
patterns.phone = /^1[3|4|5|7|8]\d{9}$/;
patterns.wifi = /[a-zA-Z\d]{2}:[a-zA-Z\d]{2}:[a-zA-Z\d]{2}:[a-zA-Z\d]{2}:[a-zA-Z\d]{2}:[a-zA-Z\d]{2}/;
patterns.car = /^[\u4e00-\u9fa5]{1}[A-Z]{1}[A-Z_0-9]{5}$/;
patterns.idcard = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
patterns.door = /^[\S+\s*\S+]+$/ig;

function matchPatterns(value, type){
	var pattern = patterns[type];
	return value.toUpperCase().match(pattern);
}

//renderVendorImage
function renderVendorImage(vendor, id){
	if (vendor=="PCI") {
		return id;
	}
	return "http://" + window.location.host + "/cloudsearch/portraitImage/"+vendor+"/"+id+".jpg";
}

//布控类型
function renderControlType(type){
	var ret = "";
	
	switch(type){
		case 1:
			ret = "抓捕";
			break;
		case 2:
			ret = "管控";
			break;
	}
	
	return ret;
}

//show and hide form
function showForm(url) {
	$("#frameFormFull").attr("src", url);
	$(".frame-form-full").show();
	
}
function hideForm() {
	$("#frameFormFull").attr("src", "");
	$(".frame-form-full").hide();
}

//测试用图片
var randerImgSrc = [
	'http://10.40.139.63:9080/oss/v1/db/dir/131nblxyeee73101.jpg',
	'http://10.40.139.63:9080/oss/v1/db/dir/1ojvjyerfee73101.jpg',
	'http://10.40.139.63:9080/oss/v1/db/dir/14j91fxwfee73101.jpg',
	'http://10.40.139.63:9080/oss/v1/db/dir/1oia61qhtee73101.jpg',
	'http://10.40.139.63:9080/oss/v1/db/dir/1df1odprree73101.jpg',
	'http://10.40.139.63:9080/oss/v1/db/dir/1uilfn4dtee73101.jpg',
	'http://10.40.139.63:9080/oss/v1/db/dir/1szw4usdeee73101.jpg'
];

function renderImage(){
	//<img src="{%='/oss/v1/cloud/face/'+o[i].OBJ_PIC%}" class="rIMG">
	var num = Math.round(Math.random() * 7) - 1;
	num = num < 0 ? 0 : num;
	return randerImgSrc[num];
}

function showVirtualTracks(){
	var data = [{
			"title" : "2016年02月18日 20时04分",
			"html" :  "/cloudsearch/page/face/picInfo.html?id={image}",
			"image" : renderImage(),
			"time" : "2016-02-18 20:04:00",
			"name" : "黄埔大道中",
			"x" : 12624997.219036175,
			"y" : 2645545.035999414
		}, {
			"title" : "2016年02月18日 19时03分",
			"html" :  "/cloudsearch/page/face/picInfo.html?id={image}",
			"image" : renderImage(),
			"time" : "2016-02-18 19:03:00",
			"name" : "科韵路",
			"x" : 12611234.259294195,
			"y" : 2647557.1573474347
		}, {
			"title" : "2016年02月18日 18时01分",
			"html" :  "/cloudsearch/page/face/picInfo.html?id={image}",
			"image" : renderImage(),
			"time" : "2016-02-18 18:01:00",
			"name" : "科韵路中",
			"x" : 12620797.638127094,
			"y" : 2645145.13295612
		}, {
			"title" : "2016年02月18日 17时44分",
			"html" :  "/cloudsearch/page/face/picInfo.html?id={image}",
			"image" : renderImage(),
			"time" : "2016-02-18 17:44:00",
			"name" : "中山大道",
			"x" : 12613466.23392482,
			"y" : 2647488.623465339
		}, {
			"title" : "2016年02月18日 17时02分",
			"html" :  "/cloudsearch/page/face/picInfo.html?id={image}",
			"image" : renderImage(),
			"time" : "2016-02-18 17:02:00",
			"name" : "中山大道北",
			"x" : 12614830.239225188,
			"y" : 2641887.6545578158
		}
	];
	
	//top.SuntekMap.require("map",["trackLoader","trackplayer"],function(){
	parent.SuntekMap.require("map",["trackLoader","trackplayer"],function(){
		//top.SuntekMap.callLater(function(map){
		parent.SuntekMap.callLater(function(map){
			$.each(data,function(item){
				item.wkid = 4326;
			});
			setTimeout(function(){
				if(tempTrackColors.length==0){
					tempTrackColors = trackColors.concat();
				}
				var trackColor = tempTrackColors.shift();				
				map.callModule("trackLoader","addSample",JSON.stringify(data),trackColor);	
			},200);
		});
	});	
}

function showVirtualTracksOnHQXC(){
	var data = [{
			"title" : "2016年02月18日 20时04分",
			"html" :  "/cloudsearch/page/face/picInfo.html?id={image}",
			"image" : renderImage(),
			"time" : "2016-02-18 20:04:00",
			"name" : "汇桥新城北区1号门人脸抓拍（进）",
			"x" : 113.251608659294,
			"y" : 23.2019519814667
		}, {
			"title" : "2016年02月18日 19时03分",
			"html" :  "/cloudsearch/page/face/picInfo.html?id={image}",
			"image" : renderImage(),
			"time" : "2016-02-18 19:03:00",
			"name" : "汇桥新城北区2号门人脸抓拍（进）",
			"x" : 113.252632909695,
			"y" : 23.201971055031
		}, {
			"title" : "2016年02月18日 18时01分",
			"html" :  "/cloudsearch/page/face/picInfo.html?id={image}",
			"image" : renderImage(),
			"time" : "2016-02-18 18:01:00",
			"name" : "汇桥新城北区4号门人脸抓拍（进）",
			"x" : 113.252461458846,
			"y" : 23.2036661804109
		}, {
			"title" : "2016年02月18日 17时44分",
			"html" :  "/cloudsearch/page/face/picInfo.html?id={image}",
			"image" : renderImage(),
			"time" : "2016-02-18 17:44:00",
			"name" : "汇桥新城北区1号门人脸抓拍（进）",
			"x" : 113.251608659294,
			"y" : 23.2019519814667
		}, {
			"title" : "2016年02月18日 17时02分",
			"html" :  "/cloudsearch/page/face/picInfo.html?id={image}",
			"image" : renderImage(),
			"time" : "2016-02-18 17:02:00",
			"name" : "汇桥新城北区2号门人脸抓拍（进）",
			"x" : 113.252632909695,
			"y" : 23.201971055031
		}
	];
	
	//top.SuntekMap.require("map",["trackLoader","trackplayer"],function(){
	parent.SuntekMap.require("map",["trackLoader","trackplayer"],function(){
		//top.SuntekMap.callLater(function(map){
		parent.SuntekMap.callLater(function(map){
			$.each(data,function(item){
				item.wkid = 4326;
			});
			setTimeout(function(){
				if(tempTrackColors.length==0){
					tempTrackColors = trackColors.concat();
				}
				var trackColor = tempTrackColors.shift();				
				map.callModule("trackLoader","addSample",JSON.stringify(data),trackColor);	
			},200);
		});
	});	
}

var trackIds = {};
function showMultiVirtualTracks1(){
	var img = "/cloudsearch/images/383.jpg";
	var data = [{
			"title" : "粤E8B383 中山大道交界路口   2016-02-16 12:09",
			"txmc1" : img,
			"html" :  "/gis/page/infowin/ecarsPicInfo.html?id={txmc1}",
			"image" : img,
			"x" : 12624997.219036175,
			"y" : 2645545.035999414
		}, {
			"title" : "粤E8B383 东风路空  2016-02-16 12:29",
			"txmc1" : img,
			"html" :  "/gis/page/infowin/ecarsPicInfo.html?id={txmc1}",
			"image" : img,
			"x" : 12620797.638127094,
			"y" : 2645145.13295612
		}, {
			"title" : "粤E8B383 科韵路交界路口  2016-02-16 12:19",
			"txmc1" : img,
			"html" :  "/gis/page/infowin/ecarsPicInfo.html?id={txmc1}",
			"image" : img,
			"x" : 12611234.259294195,
			"y" : 2647557.1573474347
		}, {
			"title" : "粤E8B383 科韵路与中山大道的交界路口  2016-02-16 13:09",
			"txmc1" : img,
			"html" :  "/gis/page/infowin/ecarsPicInfo.html?id={txmc1}",
			"image" : img,
			"x" : 12613466.23392482,
			"y" : 2647488.623465339
		}
	];
	
	//top.SuntekMap.require("map",["multiTrackPlayer"],function(){
	parent.SuntekMap.require("map",["multiTrackPlayer"],function(){
//		top.SuntekMap.callLater(function(map){
		var option={
			strokeStyle:"solid",	// 线样式，solid:实线,dashdot 虚线,dashdotdot 虚线，dot 点虚线
			strokeColor:trackColors[1],			// 线颜色，默认为黑色	
			strokeWidth:3,			// 线宽，默认3个像素
			strokeOpacity:0.8,		// 线透明度
			showDistance:false,		// 是否显示两点间的距离，默认不显示
			//icon:"http://localhost/img/%E8%BD%A6%E8%BE%86%E5%9B%BE%E6%A0%87/%E5%8D%A1%E5%8F%A3.png",		// 节点图标地址
			iconX:0,				// 节点X偏移
			iconY:12				// 节点Y偏移
		};
		
//		setTimeout(function(){
			//trackIds.t1 = top.SuntekMap.getMap().callModule("multiTrackPlayer","addTrack",JSON.stringify(data),option);	
			trackIds.t1 = parent.SuntekMap.getMap().callModule("multiTrackPlayer","addTrack",JSON.stringify(data),option);	
//		},200);
//		});
	});	
}


function showMultiVirtualTracks2(){
	var img = "";//renderImage();
	var data = [{
			"title" : "325.256.12.220",
			"image" : img,
			"time" : "2016-02-16 12:09",
			"html" :  "/cloudsearch/page/face/macInfo.html?id={image}",
			"name" : "中山大道交界路口",
			"x" : 113.278267,
			"y" : 23.142583
		}, {
			"title" : "325.256.12.220",
			"html" :  "/cloudsearch/page/face/macInfo.html?id={image}",
			"name" : "科韵路交界路口",
			"time" : "2016-02-16 12:19",
			"image" : img,
			"x" : 12611234.259294195,
			"y" : 2647557.1573474347
		}, {
			"title" : "325.256.12.220",
			"html" :  "/cloudsearch/page/face/macInfo.html?id={image}",
			"time" : "2016-02-16 12:29",
			"name" : "东风路空",
			"image" : img,
			"x" : 12613466.23392482,
			"y" : 2647488.623465339
		}, {
			"title" : "325.256.12.220",
			"html" :  "/cloudsearch/page/face/macInfo.html?id={image}",
			"time" : "2016-02-16 13:09",
			"name" : "科韵路与中山大道的交界路口",
			"image" : img,
			"x" : 113.376586,
			"y" : 23.111010
		}
	];
	
	//top.SuntekMap.require("map",["multiTrackPlayer"],function(){
	parent.SuntekMap.require("map",["multiTrackPlayer"],function(){
//		top.SuntekMap.callLater(function(map){
		var option={
			strokeStyle:"solid",	// 线样式，solid:实线,dashdot 虚线,dashdotdot 虚线，dot 点虚线
			strokeColor:trackColors[2],			// 线颜色，默认为黑色	
			strokeWidth:3,			// 线宽，默认3个像素
			strokeOpacity:0.8,		// 线透明度
			showDistance:false,		// 是否显示两点间的距离，默认不显示
			//icon:"http://localhost/img/%E8%BD%A6%E8%BE%86%E5%9B%BE%E6%A0%87/%E5%8D%A1%E5%8F%A3.png",		// 节点图标地址
			iconX:0,				// 节点X偏移
			iconY:12				// 节点Y偏移
		};
		
//		setTimeout(function(){
		//trackIds.t2 = top.SuntekMap.getMap().callModule("multiTrackPlayer","addTrack",JSON.stringify(data),option);	
		trackIds.t2 = parent.SuntekMap.getMap().callModule("multiTrackPlayer","addTrack",JSON.stringify(data),option);	
//		},200);
//		});
	});	
}

function showMultiVirtualTracks3(){
	var data = [{
			"title" : "广州市天河区软件园   2016-02-16 12:09",
			"txmc1" : "/cloudsearch/images/person/1.jpg",
			"html" :  "/gis/page/infowin/ecarsPicInfo.html?id={txmc1}",
			"image" : "/cloudsearch/images/person/1.jpg",
			"x" : 113.271314,
			"y" : 23.118430
		}, {
			"title" : "广州市天河区软件园  2016-02-16 12:19",
			"txmc1" : "/cloudsearch/images/person/2.jpg",
			"html" :  "/gis/page/infowin/ecarsPicInfo.html?id={txmc1}",
			"image" : "/cloudsearch/images/person/2.jpg",
			"x" : 12611234.259294195,
			"y" : 2647557.1573474347
		}, {
			"title" : "广州市天河区软件园  2016-02-16 13:09",
			"txmc1" : "/cloudsearch/images/person/3.jpg",
			"html" :  "/gis/page/infowin/ecarsPicInfo.html?id={txmc1}",
			"image" : "/cloudsearch/images/person/3.jpg",
			"x" : 113.376586,
			"y" : 23.111010
		}
	];
	
	//top.SuntekMap.require("map",["multiTrackPlayer"],function(){
	parent.SuntekMap.require("map",["multiTrackPlayer"],function(){
//		top.SuntekMap.callLater(function(map){
		var option={
			strokeStyle:"solid",	// 线样式，solid:实线,dashdot 虚线,dashdotdot 虚线，dot 点虚线
			strokeColor:0,			// 线颜色，默认为黑色	
			strokeWidth:3,			// 线宽，默认3个像素
			strokeOpacity:0.8,		// 线透明度
			showDistance:false,		// 是否显示两点间的距离，默认不显示
			//icon:"http://localhost/img/%E8%BD%A6%E8%BE%86%E5%9B%BE%E6%A0%87/%E5%8D%A1%E5%8F%A3.png",		// 节点图标地址
			iconX:0,				// 节点X偏移
			iconY:12				// 节点Y偏移
		};
		
//		setTimeout(function(){
			//trackIds.t3 = top.SuntekMap.getMap().callModule("multiTrackPlayer","addTrack",JSON.stringify(data),option);	
			trackIds.t3 = parent.SuntekMap.getMap().callModule("multiTrackPlayer","addTrack",JSON.stringify(data),option);	
//		},200);
//		});
	});	
}

function showMultiVirtualHQXC1(){
	var img = "/cloudsearch/images/383.jpg";
	var data = [{
			"title" : "粤E8B383 中山大道交界路口   2016-02-16 12:09",
			"txmc1" : img,
			"html" :  "/gis/page/infowin/ecarsPicInfo.html?id={txmc1}",
			"image" : img,
			"width": "90",
			"height": "150",
			"x" : 113.251608659294,
			"y" : 23.2019519814667
		}, {
			"title" : "粤E8B383 东风路空  2016-02-16 12:29",
			"txmc1" : img,
			"html" :  "/gis/page/infowin/ecarsPicInfo.html?id={txmc1}",
			"image" : img,
			"width": "90",
			"height": "150",
			"x" : 113.252632909695,
			"y" : 23.201971055031
		}, {
			"title" : "粤E8B383 科韵路交界路口  2016-02-16 12:19",
			"txmc1" : img,
			"html" :  "/gis/page/infowin/ecarsPicInfo.html?id={txmc1}",
			"image" : img,
			"width": "90",
			"height": "150",
			"x" : 113.252461458846,
			"y" : 23.2036661804109
		}, {
			"title" : "粤E8B383 科韵路与中山大道的交界路口  2016-02-16 13:09",
			"txmc1" : img,
			"html" :  "/gis/page/infowin/ecarsPicInfo.html?id={txmc1}",
			"image" : img,
			"width": "90",
			"height": "150",
			"x" : 113.251608659294,
			"y" : 23.2019519814667
		}, {
			"title" : "粤E8B383 科韵路与中山大道的交界路口  2016-02-16 13:09",
			"txmc1" : img,
			"html" :  "/gis/page/infowin/ecarsPicInfo.html?id={txmc1}",
			"image" : img,
			"width": "90",
			"height": "150",
			"x" : 113.252632909695,
			"y" : 23.201971055031
		}
	];
	
	//top.SuntekMap.require("map",["multiTrackPlayer"],function(){
	parent.SuntekMap.require("map",["multiTrackPlayer"],function(){
//		top.SuntekMap.callLater(function(map){
		var option={
			strokeStyle:"solid",	// 线样式，solid:实线,dashdot 虚线,dashdotdot 虚线，dot 点虚线
			strokeColor:trackColors[1],			// 线颜色，默认为黑色	
			strokeWidth:3,			// 线宽，默认3个像素
			strokeOpacity:0.8,		// 线透明度
			showDistance:false,		// 是否显示两点间的距离，默认不显示
			targetIcon:'/cloudsearch/images/icon/user.png',
			//icon:"http://localhost/img/%E8%BD%A6%E8%BE%86%E5%9B%BE%E6%A0%87/%E5%8D%A1%E5%8F%A3.png",		// 节点图标地址
			iconX:0,				// 节点X偏移
			iconY:12				// 节点Y偏移
		};
		
//		setTimeout(function(){
			//trackIds.t1 = top.SuntekMap.getMap().callModule("multiTrackPlayer","addTrack",JSON.stringify(data),option);	
			trackIds.t1 = parent.SuntekMap.getMap().callModule("multiTrackPlayer","addTrack",JSON.stringify(data),option);	
//		},200);
//		});
	});	
}

function showMultiVirtualHQXC2(){
	var img = "";//renderImage();
	var data = [{
			"title" : "粤E8B383 中山大道交界路口   2016-02-16 12:09",
			"txmc1" : img,
			"html" :  "/gis/page/infowin/ecarsPicInfo.html?id={txmc1}",
			"image" : img,
			"x" : 113.251608659294,
			"y" : 23.2019519814667
		}, {
			"title" : "粤E8B383 东风路空  2016-02-16 12:29",
			"txmc1" : img,
			"html" :  "/gis/page/infowin/ecarsPicInfo.html?id={txmc1}",
			"image" : img,
			"x" : 113.252835,
			"y" : 23.201919
		}, {
			"title" : "粤E8B383 科韵路交界路口  2016-02-16 12:19",
			"txmc1" : img,
			"html" :  "/gis/page/infowin/ecarsPicInfo.html?id={txmc1}",
			"image" : img,
			"x" : 113.252264,
			"y" : 23.203761
		}, {
			"title" : "粤E8B383 科韵路与中山大道的交界路口  2016-02-16 13:09",
			"txmc1" : img,
			"html" :  "/gis/page/infowin/ecarsPicInfo.html?id={txmc1}",
			"image" : img,
			"x" : 113.251778,
			"y" : 23.201952
		}, {
			"title" : "粤E8B383 科韵路与中山大道的交界路口  2016-02-16 13:09",
			"txmc1" : img,
			"html" :  "/gis/page/infowin/ecarsPicInfo.html?id={txmc1}",
			"image" : img,
			"x" : 113.252149,
			"y" : 23.201781
		}
	];
	
	//top.SuntekMap.require("map",["multiTrackPlayer"],function(){
	parent.SuntekMap.require("map",["multiTrackPlayer"],function(){
//		top.SuntekMap.callLater(function(map){
		var option={
			strokeStyle:"solid",	// 线样式，solid:实线,dashdot 虚线,dashdotdot 虚线，dot 点虚线
			strokeColor:trackColors[2],			// 线颜色，默认为黑色	
			strokeWidth:3,			// 线宽，默认3个像素
			strokeOpacity:0.8,		// 线透明度
			showDistance:false,		// 是否显示两点间的距离，默认不显示
			targetIcon:'/cloudsearch/images/wifi.png',
			//icon:"http://localhost/img/%E8%BD%A6%E8%BE%86%E5%9B%BE%E6%A0%87/%E5%8D%A1%E5%8F%A3.png",		// 节点图标地址
			iconX:0,				// 节点X偏移
			iconY:12				// 节点Y偏移
		};
		
//		setTimeout(function(){
		//trackIds.t2 = top.SuntekMap.getMap().callModule("multiTrackPlayer","addTrack",JSON.stringify(data),option);	
		trackIds.t2 = parent.SuntekMap.getMap().callModule("multiTrackPlayer","addTrack",JSON.stringify(data),option);	
//		},200);
//		});
	});	
}

//地图卡口选择
function selectKkbhForMap(type, layerName){
	if(!layerName) layerName = "V_KK_INFO";
	parent.SuntekMap.require("map",[],function(){
		var map = parent.SuntekMap.getMap();
		// 5种空间搜索
		map.clear();
		if(type=="delete"){
			map.deactivateDraw();
			onFeatureSelected({},layerName);//清除已选卡口
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
			layerName, // 图层名称
			// 查询参数,可以不传即此方法只传前两个参数
			{
				buffer:100,		// 缓冲范围，默认100米
				cql:null,		// 搜索过滤条件
				labelField:"NAME", // 文本字段名称，如摄像机的为VIDEONAME
				icon:"/gis/images/icon11.png",		// 自动加载后的要素图标，不设置则使用默认图标
				htmlSrc:null,	// 要素弹窗，不设置则不弹窗，气泡信息的url地址
				drawOnce:true,	// 绘图时是否只绘制一次
				saveGraphic:true,//是否保留绘图
				autoLoad:true	// 是否自动显示搜索结果
			}
		);
		// 订阅要素查询选择事件
		parent.$.subscribe(callbackId+"/getFeatures",function(jq,data){
			onFeatureSelected(data.data.features, layerName);
		});
		
		// 后续操作，选择单个要素
		map.callObject(callbackId,"selectFeature",0);
		// 移除要素,移除后之前的要素索引会改变
		map.callObject(callbackId,"removeFeature",0);
	});
}
