

$(function () {
    initEvent();
});

function initEvent() {
    
    showBall();
}

function showBall () {

    if(parent.pageType) {
        parent.$("body").find("#taskLibrary").remove();
        parent.pageType === 'library' ? parent.$("body").append(tmpl("taskBall",'')) : null;
    }
    else{
        setTimeout(function() {
            showBall();
        },100);
    }
}