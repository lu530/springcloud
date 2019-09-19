var id = UI.util.getUrlParam('id') || '';
var type = UI.util.getUrlParam('type') || '';

$(function() {
    initData();
})

function initData() {
    console.log('initData' + id + '----------------' + type);
}