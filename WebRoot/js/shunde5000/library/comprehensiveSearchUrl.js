var options = {
    urlParams: {
        imgSrc: UI.util.getUrlParam("imgSrc") || "",
        KEYWORDS: UI.util.getUrlParam("KEYWORDS") || ""
    },
    params: {
        //  路人库
        faceCaptureLB: {
            BEGIN_TIME: UI.util.getDateTime("nearMonth", 'yyyy-MM-dd HH:mm:ss').bT,
            END_TIME: UI.util.getDateTime("nearMonth", 'yyyy-MM-dd HH:mm:ss').eT,
            TIME_SORT_TYPE: 'DESC',
            SORT_FIELD: 'SCORE',
            PIC: UI.util.getUrlParam("imgSrc") || "",
            pageNo: 1,
            pageSize: 8
        },
        //  告警库
        alarmLB: {
            BEGIN_TIME: (new Date().getFullYear() - 1).toString() + new Date().format("-MM-dd HH:mm:ss"),
            END_TIME: new Date().format("yyyy-MM-dd HH:mm:ss"),
            pageNo: 1,
            pageSize: 8
        },
        //  布控库
        MonitorLB: {
            PIC: UI.util.getUrlParam("imgSrc") || "",
            TIME_SORT_TYPE: 'DESC',
            // BEGIN_TIME: UI.util.getDateTime("nearMonth", 'yyyy-MM-dd HH:mm:ss').bT,
            BEGIN_TIME: (new Date().getFullYear() - 1).toString() + new Date().format("-MM-dd HH:mm:ss"),
            END_TIME: new Date().format("yyyy-MM-dd HH:mm:ss"),
            pageNo: 1,
            pageSize: 8,
        },
        //  一人一档
        personLB: {
            IMG: UI.util.getUrlParam("imgSrc") || "",
            pageNo: 1,
            pageSize: 8,
            SEX: '',
            THRESHOLD: '',
            PERSON_TAG: '',
            ARCHIVE_STATUS: ''
        },
        //  身份核查
        feiShiLB: {
            IMG_URL_LIST: [UI.util.getUrlParam("imgSrc")] || "",
            REPOSITORY_ID: CONSTANTS.RLK.map(function (item) { return item.DB_ID }).join(','),      //  库ID
            ALGORITHM_ID:  CONSTANTS['SF2.0'].map(function (item) { return item.ID }).join(','),    //  算法库ID
            THRESHOLD: 60,
            TOP_NUMBER: 20,
            PRIORITY: 1
        }
    },
    commonParams:{
        KEYWORDS: UI.util.getUrlParam("KEYWORDS") || "",
        ALGO_LIST: ''
    },
    url: {
        //  路人库
        faceCaptureLB: '/efacecloud/rest/v6/face/capture/query',
        //  告警库
        alarmLB: '/efacecloud/rest/v6/face/dispatchedAlarm/grouping/getData',
        //  布控库
        MonitorLB: '/eapmanageutils/rest/v6/facedispatched/relPerson/getData',
        //  一人一档
        personLB: '/efacestore/rest/v6/facestore/archivesPerson/getData',
        //  身份核查
        feiShiLB: '/efacecloud/rest/v6/face/technicalTactics/batchFaceSearch'
    },
    algoList: [],
    surveillanceAlgoList: [],
    efacestoreAlgoList: [],
    algoListRate: {},
    pageUrl: {
        //  路人库
        faceCaptureLB: matcher('/efacecloud/page/library/faceCaptureList.html' + '/' + top.projectID).url,
        //  告警库
        alarmLB: matcher('/efacecloud/page/alarm/personAlarmList.html' + '/' + top.projectID).url,
        //  布控库
        MonitorLB: matcher('/efacesurveillance/page/faceControl/faceDiyStroePersonList.html' + '/' + top.projectID).url,
        //  一人一档
        personLB: matcher('/efacestore/page/library/personnelFileMagList.html' + '/' + top.projectID).url,
        //  身份核查库
        feiShiLB: matcher('/efacecloud/page/technicalStation/verification.html' + '/' + top.projectID).url,
    }
}
