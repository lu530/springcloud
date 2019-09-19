var defaultWidth = 1015;
var defaultHeight = 500;

var imgWidth = 352; //cif坐标系
var imgHeight = 288;//cif坐标系
var curPoints = null;

var tempColor = '';  //颜色
var curMode = '';     //mode
var editor = null;         //编辑对象
var editorWidth =  parseInt($("#videoPlayer").css("width"));
var editorHeight = parseInt($("#videoPlayer").css("height"));

function clearEditor(){
	editor = null;
	$("#videoMapping").find("svg").remove();
}
//清空截图
function cleanEditorData(){
	if(!editor){
		return;
	}
	editor.deleteAll();
	
	if(sceShotParms && sceShotParms.length != 0){
		sceShotParms.length = 0;
	}
}
//rect
function initEditor(){
	if(editor){
		return;
	}
	
	//var capPicHW = getImgSize("capPicImg");
	editorWidth = parseInt($("#videoMapping").css("width"));
	editorHeight = parseInt($("#videoMapping").css("height"));
	
	UI.util.debug("editorWidth:"+editorWidth+"--editorHeight:"+editorHeight);
//	imgWidth = capPicHW[0];
//	imgHeight = capPicHW[1];
	editor = new VectorEditor(document.getElementById("videoMapping"), editorWidth, editorHeight, imgWidth, imgHeight);

    editor.set("stroke-width", 3);
    editor.set("fill-rule", "nonzero");
	editor.set("stroke", "#000");
	editor.set("fill", "#CFC");
    tempColor="red";
    editor.bindEvent("onDrawFinal",function(s, mode, points){
    	setMode("");
    	if(points){
    		curPoints = points;
    		UI.util.debug(curPoints);
 //   		handleDrawResult(curPoints);
    	}
    });
}


function setMode(mode){
	editor.set("fill", "none");
	editor.set("stroke", tempColor);
	  
    if(mode == "text"){
        editor.set("fill", tempColor);
        editor.set("stroke", "none");
        editor.prop.text = prompt("Text:", editor.prop.text);
        
    }
    UI.util.debug(mode);
    editor.setMode(mode == 'selectp' ? 'select+' : mode);
}
/**
 * 获取图片的分辨率（实际大小）
 * @param objId
 * @returns {Array}
 */
function getImgSize(objId) {
	
	var imageEl = document.getElementById(objId);
	
	if (imageEl.naturalWidth) {//支持HTML5
		nWidth = imageEl.naturalWidth;
		nHeight = imageEl.naturalHeight;
		return new Array(nWidth, nHeight);
	} else {
		var i = new Image(); //新建一个图片对象
		if(imageEl.src.indexOf('?')>=0){
			i.src = imageEl.src.split('?')[0];
		}else{
			i.src = imageEl.src; //将图片的src属性赋值给新建图片对象的src 
		}
		return new Array(i.width, i.height); //返回图片的长宽像素 
	}
}

function setImgPath(fileName){
	fileName = fileName.replace(new RegExp("\\\\","g"),"/");
	fileName = fileName.replace(new RegExp("//","g"),"/");
	UI.util.debug(fileName);
	$("#videoMapping").css("background-image", "url('file:///" + fileName+"')");
	$("#videoMapping").css('filter','progid:DXImageTransform.Microsoft.AlphaImageLoader(src="file:///' + fileName+ '",sizingMethod="scale")');
	$("#capPicImg").attr("src", "file:///" + fileName);
	
	$("#videoPlayer").addClass("hide");
	$("#videoMapping").removeClass("hide");
	
}

function getScaleVal(o, f, r) {
	var val = Math.round((o/f)*r);
	val = val < 0 ? -val : val;
	return val;
}