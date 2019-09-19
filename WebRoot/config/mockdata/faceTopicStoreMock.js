/**
 * Created by Administrator on 2017-06-21.
 */
//人脸专题库管理
//	surveil/task/getData/faceTopicStore  
Mock.mock(/surveil\/task\/getData\/faceTopicStore$/, {
    'dispatchedLibList':{
        'count|50-100':50,
        'records|100': [{
            'TASK_ID|+1':1,
            'TASK_NAME|1':['在逃人员库','涉恐人员库','嫌疑人员库','重犯人员库'],
            'PERSON_CNT':/^\d{3}$/,
            'FACE_VPT':/^\d{2}$/,
            'CREATE_TYPE|1':[1,2] //1初始库，2自建库
        }]
    }
});

//controlPerson/object/getData/faceTopicList 人脸专题库管理内容列表；
Mock.mock(/controlPerson\/object\/getData\/faceTopicList/,{
    "dispatchedApprovalList":{
        'count':100,
        'records|100':[{
            'TASK_ID|+1':1,
            'FaceImgUrl':"@imgPersonPhoto(20)",
            'PersonName':'@cname',
            'IDCard':/^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/,
            '_index':0,
        }]
    }
});

//人员档案库列表
Mock.mock(/controlPerson\/object\/getData\/personnelList/,{
    "dispatchedApprovalList":{
        'count':100,
        'records|100':[{
            'TASK_ID|+1':1,
            'FaceImgUrl':"@imgPersonPhoto(20)",
            'PersonName':'@cname',
            'IDCard':/^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/,
            '_index':0,
            'Percentage|60-100':60,
            'Date':'@date',
            'Quality|0-100':1
        }]
    }
});

