
var type = UI.util.getUrlParam('type');
var checkQuery = UI.util.getUrlParam('checkQuery');

$(document).ready(function(){
	UI.control.init();
	initData();
	initEvents();
});

var relateDesc = "";
function initData(){
	var param = {};
	param.checkQuery = checkQuery;
	if(type == 'MAC'){
		param.db = 'wifi_detect_indice';
		param.table = 'WIFI_DETECT_INFO';
		param.idField = 'DEVICE_ID';
		param.groupField = 'MAC';
		relateDesc = "MAC地址";
		//param.checkQuery = "{list:[{capture_time:'2016-06-08 00:07:55',capture_device_id:'44010000001970000003'}]}";
	} else if (type == 'DOOR') {
		param.db = 'door_access_indice';
		param.table = 'DOOR_ACCESS_INFO';
		param.idField = 'DEVICE_ID';
		param.groupField = 'ORIGINAL_CARD_ID';
		relateDesc = "门禁刷卡ID";
		//param.checkQuery = "{list:[{capture_time:'2016-06-08 09:23:59',capture_device_id:'44010401001980000002,44010401001980000001'}]}";
	} else if (type == 'CAR') {
		param.db = 'car_detect_indice';
		param.table = 'CAR_DETECT_INFO';
		param.idField = 'KKBH';
		param.groupField = 'HPHM';
		relateDesc = "车牌号码";
		//param.checkQuery = "{list:[{capture_time:'2016-06-07 23:44:24',capture_device_id:'44010000001310000293,44010000001310000292'}]}";
	} else if (type == 'IMEI') {
		param.db = 'efence_detect_indice';
		param.table = 'EFENCE_DETECT_INFO';
		param.idField = 'DEVICE_ID';
		param.groupField = 'IMEI';
		relateDesc = "手机串号";
		//param.checkQuery = "{list:[{capture_time:'2016-06-08 00:07:55',capture_device_id:'44010000001970000003'}]}";
	} else if (type == 'IMSI') {
		param.db = 'efence_detect_indice';
		param.table = 'EFENCE_DETECT_INFO';
		param.idField = 'DEVICE_ID';
		param.groupField = 'IMSI';
		relateDesc = "手机卡串号";
		//param.checkQuery = "{list:[{capture_time:'2016-06-08 00:07:55',capture_device_id:'44010000001970000003'}]}";
	}
	
	UI.util.debug(param);
	
	UI.util.showLoadingPanel('');
	
	doQuery(param); 
}

var deviceInfo = {};

function doQuery(param) 
{
	UI.control.remoteCall('efacecloud/collision/query', param, function(resp) {
		deviceInfo = resp.deviceInfo;
		$("#searchResult").html(tmpl('resultTmpl',coincideSort(resp.ret)));
		UI.util.hideLoadingPanel();
	}, function(data, status, e) {
		UI.util.hideLoadingPanel();
		top.rightMainFrameOut();
	}, {
		async : true
	});
}

function coincideSort(ret){
	
	for (var i=0; i<ret.length; i++) {
		var o = ret[i].lists;
		var m = new Map();
		for (var j=0; j<o.length; j++) {
			if(o[j].DEVICE_ID) {
				m.put(o[j].DEVICE_ID, 1);
			} else if(o[j].KKBH) {
				m.put(o[j].KKBH, 1);
			}
		}
		ret[i].coincide = m.size();
		o.TRACKS.sort(function(a,b) {
			return parseInt(a.JGSJ)-parseInt(b.JGSJ);
		});
	}
	
	return ret.sort(function(a,b) {
		return parseInt(b.followTimes)-parseInt(a.followTimes);
	});;
}

function initEvents()
{
	$('.btn-close').click(function(){
		parent.hideForm();
	});
	
	$('body').on('click','.copyLinkBtn',function(){
		var $this = $(this);
		var linkMacString = $this.parents('.link-group').find('[clipBoardAttr]').html().toUpperCase();
		copyToClipBoard(linkMacString);
	});
}

function renderJgrq(jgrq)
{
	jgrq = "" + jgrq;
	return '20' + jgrq.substring(0,2) + '-' + jgrq.substring(2,4) + '-' + jgrq.substring(4);
}

function renderJgsj(jgsj)
{
	jgsj = "" + jgsj;
	while(jgsj.length<6){
		jgsj = "0"+jgsj;
	}
	return jgsj.substring(0,2)+':'+jgsj.substring(2,4)+':'+jgsj.substring(4);
}

function copyToClipBoard(s) {
    if (window.clipboardData) {
        window.clipboardData.setData("Text", s);
        UI.util.alert("已经复制到剪切板！"+ "\n" + s);
    } else if (navigator.userAgent.indexOf("Opera") != -1) {
        window.location = s;
    } else if (window.netscape) {
        try {
            netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
        } catch (e) {
            alert("被浏览器拒绝！\n请在浏览器地址栏输入'about:config'并回车\n然后将'signed.applets.codebase_principal_support'设置为'true'");
        }
        var clip = Components.classes['@mozilla.org/widget/clipboard;1'].createInstance(Components.interfaces.nsIClipboard);
        if (!clip)
            return;
        var trans = Components.classes['@mozilla.org/widget/transferable;1'].createInstance(Components.interfaces.nsITransferable);
        if (!trans)
            return;
        trans.addDataFlavor('text/unicode');
        var str = new Object();
        var len = new Object();
        var str = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);
        var copytext = s;
        str.data = copytext;
        trans.setTransferData("text/unicode", str, copytext.length * 2);
        var clipid = Components.interfaces.nsIClipboard;
        if (!clip)
            return false;
        clip.setData(trans, null, clipid.kGlobalClipboard);
        UI.util.alert("已经复制到剪切板！" + "\n" + s)
    }
}