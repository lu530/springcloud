/**
 * @describe 立体化防控实时告警语音播报功能
 * @author linzewei
 */
var AlarmAudio = (function(win, $, doc, undefined){

	var audioMedia = null;  //音频播放对象
	var stopPlayTimer = 0 ;

	function initAudio(){
		audioMedia = $('#mediaMP3')[0];  
	}

	//播放实时告警语音
	function playRealAlarmAudio(){	
		playAudio();		
	}


	
	/**
	 * @param {string} type 告警类型:人脸, 车辆, 门禁, wifi; 或:未处理的告警（所有类型）
	 * @param {string} 是否开启轮询播报
	 * @describe 警报播放  
	 * */
	function playAudio(){  		
		audioMedia.src = '/efacecloud/images/audio/alarmFace.mp3';	
		audioMedia.play();	
		stopPlayTimer = setTimeout(function(){
			pauseAudio();
			stopPlayTimer = 0;
		},10.5*1000);
		
	}
	
	//警报暂停  
	function pauseAudio(){  
		audioMedia.pause();  
	}



    return {
		init: initAudio,
		play: playRealAlarmAudio,
		stop: pauseAudio
	};
	
	
})(window, jQuery, document);







