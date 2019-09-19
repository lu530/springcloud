/**
 * Created by Administrator on 2017-06-21.
 */
//人脸库管理 surveil/task/getData/faceStoreManage
Mock.mock(/surveil\/task\/getData\/faceStoreManage$/, {
    'dispatchedLibList':{
        'count|50-100':50,
        'records|100': [{
            'TASK_ID|+1':1,
            'TASK_NAME|1':['监控','收集证据','分析案情','监督'],
            'STORE_CNT':/^\d{3}$/,
            'WARM_VPT':/^[1-9]\d{1}\%$/,
            'LEVEL|1':["红色告警","黄色告警","事后关注"]
        }]
    }
});

// 布控告警
Mock.mock(/surveil\/task\/getData\/personControlAlarm$/, {
    'dispatchedLibList':{
        'count|50-100':50,
        'records|100': [{
            'ADDRESS|1':["天河棠下大片路21号","海珠区中山大道西","天河上社吕连路22号"],
            'CAMERA_URL':"@imgPersonControl",
            'DISPATCH_URL':"@imgPersonControlBranch",
            'ID_NO':/^\d{18}$/,
            'LIB':'重点人员',
            'NAME':'@cname',
            'PERCENT':/^\d{2}\%$/,
            'TIME':'@date',
            'TASK_ID|+1':1,
            '_index':1
        }]
    }
});