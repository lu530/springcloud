$(function () {

    initPage();
});

function initPage () {

    var TASK_ID = UI.util.getUrlParam("TASK_ID") || '';

    UI.control.remoteCall('technicalTactics/task/queryException', {TASK_ID: TASK_ID}, function (resp) {
    
        $('.detailMessage').html(resp.DATA);

    }, function (error){ console.log(error) }, '', true);
}

