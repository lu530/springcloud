var ALARM_ID = UI.util.getUrlParam("ALARM_ID") || '';
var ALARM_TIME = UI.util.getUrlParam("ALARM_TIME") || '';
var TASK_LEVEL = UI.util.getUrlParam("level") || '';
var personId = UI.util.getUrlParam("personId") || '';
$(function () {
	getJSON();
	initEvent();
	backFill();
});

function getJSON() {
	var map = {
		"applicationName": "efacecloud"
	};
	UI.control.remoteCall('platform/webapp/config/get', map, function (resp) {
		var jsonObj = resp.attrList;
		for (var i = 0; i < jsonObj.length; i++) {
			if (jsonObj[i].key == "FED_BACK_JSON" && jsonObj[i].value) { //1为黄埔版本
				var configJSON = JSON.parse(jsonObj[i].value.replace(/'/g, "\""));
				var initArr = [];
				$.each(configJSON, function (i, obj) {
					if (obj.type == 'show')
						initArr.push(obj);
				});
				generateOptions(initArr, configJSON);
			}
		}
	});
	/*UI.control.remoteCall('face/faceScheduling/getFedBackJson',{}, function(resp) {
		var jsonObj = JSON.parse(resp.DATA);
    	var initArr = []
    	$.each(jsonObj, function (i, obj) {
    		if (obj.type == 'show')
    			initArr.push(obj);
    	});
    	generateOptions(initArr, jsonObj);
	});*/
}; 
//回填上次反馈的信息
var notePublic;
function backFill(){
	var map = {
			"applicationName": "datadefence",
			"ALARM_ID":ALARM_ID
		};
	UI.control.remoteCall('defence/alarmHandleRecord/getRecord', map, function (resp) {
		var code = resp["CODE"];
		if(code == "0"){
			var result = JSON.parse(resp["DATA"]["HANDLE_RESULT"]);
			var note = result["NOTE"];

			for(var i in result){
				if(result.hasOwnProperty(i)){
					if(i=='NOTE'){
						notePublic = note;
						$("[name=NOTE").val(note);
					}else{
						$("[name='"+i+"'][value="+result[i]+"]").click();
					}
				}
			}
		}
		
	});
}

function initEvent() {

	//保存
	$("#submitBtn").click(function () {
		var checkAll = true,
			msg = '';
		$('.form-warper').find('[name]').each(function () {
			var $this = $(this);
			var name = $this.attr("name");

			if ($this.is(':hidden')) {
				return;
			}

			//如果是出警，备注项可不填
			// if ($("[name=IS_POLICE_OUT][value=1]").is(":checked") && name == "NOTE") {
			// 	return;
			// }
			//如果不是误报,且第二项未选，可直接保存【湛江需求】
			 if ($("[name=IS_ERRORINFO][value=1]").is(":checked") && $('input:radio[name="IS_FOUND"]:checked').val() == null) {
			 	return;
			 }

			if ($('[name="' + name + '"]:checked').length == 0 && name != "NOTE") {
				checkAll = false;
				msg = $this.parents(".form-group").find(".control-label").text();
				return false;
			}

			if (!$('[name=NOTE]').val() && $('[name=OTHER]:checked').val() == 1) {
				checkAll = false;
				msg = $('[name=NOTE]').parents(".form-group").find(".control-label").text();
				return false;
			}
			
			
		});


		if (!checkAll) {
			UI.util.alert("[" + msg.slice(0, msg.length - 1) + ']不能为空！', 'warn');
			return false;
		}

		UI.util.showLoadingPanel();
		var handleResult = UI.util.formToBean($(".form-group").not(".hide"));
		var curParams = {
			ALARM_ID: ALARM_ID,
			ALARM_TIME: ALARM_TIME,
			HANDLE_RESULT: JSON.stringify(handleResult),
			OP_TYPE: 2,
			TASK_LEVEL: TASK_LEVEL,
			PERSON_ID: personId
		}
		//三个选项全部为是不可反馈
		var flag = false;
		flag = $('[name="IS_FOUND"]:checked').val() == 1 && $('[name="IS_CONTROL"]:checked').val() == 1 && $('[name="IS_CONSISTENT"]:checked').val() == 1 ? true : false;
		/*if(!flag){
			flag = $('[name="IS_CANCEL_DISPATCHED"]:checked').val() == 1 ? true :false;
		}*/
		
		UI.control.remoteCall('defence/alarmHandleRecord/add', curParams, function (resp) {
			if (resp.CODE == 0) {
				UI.util.alert(resp.MESSAGE);
				parent.UI.util.returnCommonWindow(flag);
			} else {
				UI.util.alert(resp.MESSAGE, "warn");
			}
			UI.util.hideLoadingPanel();
			parent.UI.util.closeCommonWindow();
		}, function () {}, {
			async: false
		}, true);
	});

	$("#closeBtn").click(function () {
		parent.UI.util.closeCommonWindow();
	});
}

/**
 * 生成表单选项
 * @author yangzonghong
 * @param {Array} arr 初始需要显示的选项
 * @param {Object} json 完整的配置json
 */
function generateOptions(arr, json) {
	$.each(arr, function (index, arrObj) {
		if (arrObj == null || $('[name="' + arrObj.key + '"]').length) {
			return;
		}
		if (arrObj.key === 'NOTE') {
			$('.form-single').append(tmpl('noteTmpl', {note:notePublic}));
		} else {
			$('.form-single').append(tmpl('formGroupTmpl', arrObj));
			arrObj.clear = true;

			$('[name="' + arrObj.key + '"]').on('change', function () {
				var $this = $(this);
				var val = $this.val();

				if (val == 1) {
					var nextArr = [];
					$.each(arrObj['是'], function (i, obj) {
						var target = getObj(json, 'key', obj.key);
						if (target.showTheCondition) {
							arrObj.clear = false;
						}
						nextArr.push(target);
					});
					
					if (arrObj.clear) {
						$(this).parents('.form-group').nextAll().remove();
					}
					generateOptions(nextArr, json);
				} else if (val == 0) {
					var nextArr = [];
					$.each(arrObj['否'], function (i, obj) {
						var target = getObj(json, 'key', obj.key);						
						if (target.showTheCondition) {
							arrObj.clear = false;
						}
						nextArr.push(target);
					});
					if (arrObj.clear) {
						$(this).parents('.form-group').nextAll().remove();
					}
					generateOptions(nextArr, json);
				}
			});
		}
		if (arrObj.showTheCondition) {
			for (var key in arrObj.showTheCondition) {
				if (arrObj.showTheCondition.hasOwnProperty(key)) {
					$('[name="'+ key +'"]').on('change', function() {
						$this = $(this);
						var mactchCondition = true;
						for (var innerKey in arrObj.showTheCondition) {
							if (arrObj.showTheCondition.hasOwnProperty(innerKey)) {
								if($('[name="'+ innerKey +'"]:checked').val() != arrObj.showTheCondition[innerKey]) {
									mactchCondition = false;
								}
							}
						}

						if(mactchCondition) {
							$('[name="'+ arrObj.key +'"]').parents('.form-group').removeClass('hide');
						} else {
							$('[name="'+ arrObj.key +'"]').parents('.form-group').addClass('hide');
						}
					})
				}
			}
		}
	})
}

/**
 * 从数组中取到匹配的对象
 * @author yangzonghong
 * @param {Array} json 完整的配置json
 * @param {String} key 查询的键
 * @param {String} val 应匹配的值
 */
function getObj(json, key, val) {
	var target = null;
	$.each(json, function (index, obj) {
		if (obj[key] == val) {
			target = obj;
		}
	})
	return target;
}