var TASK_ID = UI.util.getUrlParam("TASK_ID") || '',
    TASK_TYPE = UI.util.getUrlParam("TASK_TYPE") || '';

$(function () {

    initPage();
});

function initPage () {

    UI.control.remoteCall('technicalTactics/task/detail', {TASK_ID: TASK_ID}, function (resp) {

        if(resp.CODE === 0) {
            $(".taskDetail").html(tmpl('taskDetail', resp.DATA[0]));
        }else{
            $(".taskDetail").html("<div class='nodata'></div>");
        }

        UI.util.alert(resp.MESSAGE, resp.CODE === 0 ? '' : 'warn');

    }, function (error){ console.log(error) }, '', true);
}

function addSpace (str) {

    return str ? str.replace(/[,]/g, ', ') : str;
}