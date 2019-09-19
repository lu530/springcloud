$(function(){
	initTime("beginTime","endTime");
});

function initTime(start,end){

    var    now = new Date();
    var dateTime = UI.util.getDateTime("today","yyyy-MM-dd HH:mm:ss");
    var executionStartTime = $('#'+start);
    var executionEndTime = $('#'+end);

    executionStartTime.val(dateTime.bT);
    executionEndTime.val(dateTime.eT);


    /*时间初始化*/
    executionStartTime.click(function(){
        WdatePicker({
            startDate:'%y-#{%M}-%d 00:00:00',
            dateFmt:'yyyy-MM-dd HH:mm:ss',
            alwaysUseStartDate:true,
            maxDate:'#F{$dp.$D(\''+end+'\')}'
        });
    });


    /*时间初始化*/
    executionEndTime.click(function(){
        WdatePicker({
            startDate:'%y-#{%M}-%d 23:59:59',
            dateFmt:'yyyy-MM-dd HH:mm:ss',
            alwaysUseStartDate:true,
            minDate:'#F{$dp.$D(\''+start+'\')}'
        });
    });

}
