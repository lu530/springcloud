
$(function () {

    initPage();

    initEvent();
});


function initPage () {

    doSearch();
}


function initEvent () {

    $('body').on('click', '.faceLbUnit', function () {

        $(this).addClass('active').siblings().removeClass('active');
    });

    //输入框的搜索按钮
	$('#searchBtn, #confirmSearch').click(function() {
		doSearch();
	})
	$('#searchText').keydown(function(e) {
		if(e.keyCode == 13) {
			doSearch();
		}
    });
    
    // 确定
    $("#saveBtn").on('click', function(){

        var data = {
            libID: $('.faceLbUnit.active').attr('libID'),
            libName: $('.faceLbUnit.active').attr('libName')
        }
        
		if(!data.libID){
			UI.util.alert("请选择数据","warn");
		}else{
			parent.UI.util.returnCommonWindow(data);
			parent.UI.util.closeCommonWindow();
        }
    });
    
    // 取消
    $("#cancelBtn").click(function(){
		parent.UI.util.closeCommonWindow();
	});
}

function doSearch () {

    var params = {
        HAS_UPDATE: false,
        KEYWORDS: $('#searchText').val() || '',
        ORDER_NAME: 'CREATE_TIME',
        ORDER_PATTERN: 'desc',
        ORG_CODE: '',
        isAsync: true,
        pageNo: 1,
        pageSize: 2000
    }

    UI.control.remoteCall('', '', function(resp) {

        if(resp && resp.data && resp.data.records.length > 0) {
            $('.faceLB').html(tmpl('faceLB', resp.data.records));
        }
	}, function (error) {}, {

        url: '/efacestore/rest/v6/facestore/topicLib/getData',
        data: params
        
    }, true);
}