var ALARM_ID = UI.util.getUrlParam("ALARM_ID") || '';
var ALARM_TIME = UI.util.getUrlParam("ALARM_TIME") || '';
var TASK_LEVEL = UI.util.getUrlParam("level") || '';
var personId = UI.util.getUrlParam("personId") || '';
$(function() {
    initEvent();
});

function initEvent() {

    $('[type="radio"]').change(function() {
        var $this = $(this);
        var name = $this.attr("name");
        var val = $this.val();
        showSelectData(name, val);
    });

    //保存
    $("#submitBtn").click(function() {
        var checkAll = true,
            msg = '';
        $('.form-warper').find('[name]').each(function() {
            var $this = $(this);
            var name = $this.attr("name");
            if ($this.is(':hidden')) {
                return;
            }
            if ($('[name="' + name + '"]:checked').length == 0 && name != "DEPARTMENT") {
                checkAll = false;
                msg = $this.parents(".form-group").find(".control-label").text();
                return false;
            }
            if (!$('[name=DEPARTMENT]').val() && $('[name=IS_HANDOVER][value=1]').prop("checked")) {
                checkAll = false;
                msg = $('[name=DEPARTMENT]').parents(".form-group").find(".control-label").text();
                return false;
            }
        });
        if (!checkAll) {
            UI.util.alert("[" + msg.slice(0, msg.length - 1) + ']不能为空！', 'warn');
            return false;
        }
        var handleResult = UI.util.formToBean($(".form-group").not(".hide"));
        var curParams = {
            ALARM_ID: ALARM_ID,
            ALARM_TIME: ALARM_TIME,
            HANDLE_RESULT: JSON.stringify(handleResult),
            OP_TYPE: 2,
            TASK_LEVEL: TASK_LEVEL,
            PERSON_ID: personId
        }
        UI.util.confirm('该告警是否确认已抓捕？（确认抓捕的告警记录将作为工作成效永久保存）', function () {
            UI.util.showLoadingPanel();
			UI.control.remoteCall("defence/alarmHandleRecord/addArrest", curParams, function (resp) {
				if (resp.CODE == 0) {
					UI.util.alert(resp.MESSAGE);
					parent.UI.util.returnCommonWindow({});
				} else {
					UI.util.alert(resp.MESSAGE, "warn");
				}
				UI.util.hideLoadingPanel();
				$("#closeBtn").click();
			}, function () {
				UI.util.hideLoadingPanel()
			}, {}, true);
		});
    });

    //取消
    $("#closeBtn").click(function() {
        parent.UI.util.closeCommonWindow();
    });
}

//根据选择，显示对应选项
function showSelectData(name, val) {
    var $parentGroup = $('[name="' + name + '"]').parents(".form-group");
    //$('[name="'+name+'"][value='+val+']').prop("checked",true);
    $parentGroup.removeClass("hide");
    $parentGroup.nextAll().addClass("hide");
    switch (name) {
        case 'IS_ARREST': //是否抓捕
            if (val == 1) {
                showSelectData("IS_HANDOVER", $("[name=IS_HANDOVER][value=1]").prop("checked") ? 1 : 0);
            }
            break;
    }
    if ($("[name=IS_HANDOVER][value=1]").prop("checked")) {
        $("[name=DEPARTMENT]").parents(".form-group").removeClass("hide");
    }
}