/*!
 * raphaeljs.serialize
 *
 * Copyright (c) 2010 Jonathan Spies
 * Licensed under the MIT license:
 * (http://www.opensource.org/licenses/mit-license.php)
 *
 */

Raphael.fn.serialize = function(paper,nodes){
    return {
        json: function() {
            var svgdata = [], object = null;
            
	        if( !nodes ){

                for(var node = paper.bottom; node != null; node = node.next) {
                    if(node.save === false){
                        // 不希望被序列化保存的图形，比如操作手柄
                        continue;
                    }
                    object =  this.renderNodes(node);
                    if (object) {
                        svgdata.push(object);
                    }
                }
                
	        }else{

                for(var i = 0; i < nodes.length; i++){
                    object =  this.renderNodes(nodes[i]);
                    if (object) {
                        svgdata.push(object);
                    }
                }
			}
			
			console.warn(svgdata);
			
	        if(svgdata){
				var strSvgData = JSON.stringify(svgdata);
	        	return strSvgData;
	        }
        	//return(JSON.stringify(svgdata));
	        
        },
        
        renderNodes: function(node){
        	var object = null;
        	if (node && node.type) {
        		
	            switch(node.type) {
	                case "image":
	                object = {
	                    type: node.type,
	                    width: node.attrs['width'],
	                    height: node.attrs['height'],
	                    x: node.attrs['x'],
	                    y: node.attrs['y'],
	                    src: node.attrs['src'],
	                    transform: node.transformations ? node.transformations.join(' ') : ''
	                }
	                break;
	                
	                case "ellipse":
	                object = {
	                    type: node.type,
	                    rx: node.attrs['rx'],
	                    ry: node.attrs['ry'],
	                    cx: node.attrs['cx'],
	                    cy: node.attrs['cy'],
	                    stroke: node.attrs['stroke'] === 0 ? 'none': node.attrs['stroke'],
	                    'stroke-width': node.attrs['stroke-width'],
	                    // fill: node.attrs['fill']
	                    // 自定义属性，用于识别
	                    key: node.id,
	                    selected: node.selected || false, // 判断是否为截图区域
	                    sibling: node.sibling || 0,
	                    lineTo: node.lineTo || 0,
						fill: node.attrs['fill'],
						uuid: node.uuid,
	                    'fill-opacity':node.attrs['fill-opacity'],
	                    cursor:node.attrs['cursor'],
	                    tagType:node.tagType,
	                    pathColor: node.pathColor
	                }
	                break;
	                
	                case "circle":
	                object = {
	                    type: node.type,
	                    r: node.attrs['r'],
	                    cx: node.attrs['cx'],
	                    cy: node.attrs['cy'],
	                    stroke: node.attrs['stroke'] === 0 ? 'none': node.attrs['stroke'],
	                    'stroke-width': node.attrs['stroke-width'],
	                    // fill: node.attrs['fill']
	                    // 自定义属性，用于识别
	                    key: node.id,
	                    selected: node.selected || false, // 判断是否为截图区域
	                    sibling: node.sibling || 0,
	                    lineTo: node.lineTo || 0,
						fill: node.attrs['fill'],
						uuid: node.uuid,
	                    'fill-opacity':node.attrs['fill-opacity'],
	                    cursor:node.attrs['cursor'],
	                    tagType:node.tagType,
	                    pathColor: node.pathColor
	                }
	                break;
	                
	                case "rect":
	                object = {
	                    type: node.type,
	                    r:node.attr('r'),
	                    rx: node.attrs['rx'],
	                    ry: node.attrs['ry'],
	                    x: node.attrs['x'],
	                    y: node.attrs['y'],
	                    width: node.attrs['width'],
	                    height: node.attrs['height'],
	                    stroke: node.attrs['stroke'] === 0 ? 'none': node.attrs['stroke'],
	                    'stroke-width': node.attrs['stroke-width'],
	                    // 自定义属性，用于识别
	                    key: node.id,
	                    selected: node.selected || false, // 判断是否为截图区域
	                    sibling: node.sibling || 0,
	                    lineTo: node.lineTo || 0,
						fill: node.attrs['fill'],
						uuid: node.uuid,
	                    'fill-opacity':node.attrs['fill-opacity'],
	                    tagType:node.tagType,
	                    cursor:node.attrs['cursor'],
	                    pathColor: node.pathColor
	                }
	                console.log(object);
	                break;
	                
	                case "text":
	                object = {
	                    type: node.type,
	                    font: node.attrs['font'],
	                    'font-family': node.attrs['font-family'],
	                    'font-size': node.attrs['font-size'],
	                    stroke: node.attrs['stroke'] === 0 ? 'none': node.attrs['stroke'],
	                    fill: node.attrs['fill'] === 0 ? 'none' : node.attrs['fill'],
	                    'stroke-width': node.attrs['stroke-width'],
	                    x: node.attrs['x'],
	                    y: node.attrs['y'],
	                    text: node.attrs['text'],
	                    'text-anchor': node.attrs['text-anchor'],
	                    key: node.id,
	                    lineTo: node.lineTo || 0,
	                    sibling: node.sibling || 0
	                }
	                break;
	    
	                case "path":
	                var path = "";
	                if(node.attrs['path'].constructor != Array){
	                    path += node.attrs['path'];
	                }
	                else{
	                    $.each(node.attrs['path'], function(i, group) {
	                    $.each(group,
	                        function(index, value) {
	                        if (index < 1) {
	                            path += value;
	                        } else {
	                            if (index == (group.length - 1)) {
	                            path += value;
	                            } else {
	                            path += value + ',';
	                            }
	                        }
	                        });
	                    });
	                }
	                object = {
	                    type: node.type,
	                    fill: node.attrs['fill'],
	                    opacity: node.attrs['opacity'],
	                    translation: node.attrs['translation'],
	                    scale: node.attrs['scale'],
	                    path: path,
	                    stroke: node.attrs['stroke'] === 0 ? 'none': node.attrs['stroke'],
	                    'stroke-width': node.attrs['stroke-width'],
	                    transform: node.transformations ? node.transformations.join(' ') : ''
	                }
	            }
        	}
        	
        	if (object) {
        		return object;
            }
        	
        },
    
        loadJson : function(json) {
			var self = this;
            if (typeof(json) == "string") { json = JSON.parse(json); } // allow stringified or object input
        
            var set = paper.set();
            $.each(json, function(index, node) {
                try {
	                if(node.type == 'image'){
	                    return true;
	                }
	                var el = paper[node.type]().attr(node);
	                el.selected = node.selected || false;
	                el.lineTo = node.lineTo || 0;
	                el.sibling = node.sibling || 0;
	                el.key = node.key || 0;
					el.pathColor = node.pathColor;
					
					if(node.uuid) el.uuid = node.uuid;	//xc mark
					if(node.tagType) el.tagType = node.tagType;	//xc mark

	                set.push(el);
                } catch(e) {}
            });
            return set;
        }
    }
};
  