	//路人库导出我的库返回
	Mock.mock(/efacecloud\/mine\/libinfo\/getMineLibList$/, {
		data:[{
			CREATE_TIME: 170531143500,
			IMPORT_LIB_ID: "FACE_INFO",
			KEYWORDS: "tjk,",
			LIBRARY_ID: 187212341529939600,
			LIBRARY_NAME: "tjk",
			LIBRARY_SIZE: 324,
			LIBRARY_THEME: 0,
			LIBRARY_TYPE: 1,
			PERSON_ID: "admin",
			SOURCE_TYPE: 2,
			UPDATE_TIME: 170531143500,
			score: "0.00",
			text: "tjk",
			value: "187212341529939584"
		}
		]
	});
	
	//路人库导出我的库返回
	Mock.mock(/efacecloud\/mine\/libinfo\/addOrEditLib$/, {
				IMPORT_LIB_ID: "FACE_INFO",
				LIBRARY_SIZE: "100000",
				pageNo: 1,
				pageSize: 25
	});

	//人脸N:N结果返回对象
	Mock.mock(/efacecloud\/es\/faceN\/collection\/freqAnalysis$/, {
		pageSize:9,
		result:[{'list|9':[{CJSJ: 170617152536,
			CREATETIME: 170617152632,
			DATA_SRC: "1",
			DEVICE_ADDR: "",
			DEVICE_ID: "44010000001320000002",
			DEVICE_NAME: "天河公园105",
			FACE_ID: "http://172.16.56.204:8088/g1/M00/00012001/20170617/rBA4zFlE2eSIG8HLAAAKwSvuZoQAABDqgBD0pAAAArZ706.jpg",
			INFO_ID: "193385669852777984",
			JGRQ: 170617,
			JGSJ: 152533,
			JGSK: "2017-06-17 15:25:33",
			OBJ_PIC: "http://172.16.56.204:8088/g1/M00/00012001/20170617/rBA4zFlE2eSIG8HLAAAKwSvuZoQAABDqgBD0pAAAArZ706.jpg",
			ORG_CODE: "4401",
			ORG_NAME: "广州市",
			ORIGINAL_DEVICE_ID: "44010000001320000002",
			PERSON_ID: "0",
			PIC: "http://172.16.56.204:8088/g1/M00/00012001/20170617/rBA4zFlE2eSIeM5iAALLcMcxsQcAABDqgBD3WkAAsuI217.jpg",
			STARTTIME: "",
			WITH_GLASSES: "0",
			WITH_HAT: "0",
			score: "0.00"}],personId:"193401292968283648"}]
    });
	
	//居住地
	Mock.mock(/efacecloud\/rest\/v6\/efacecloud\/favorite\/addFavoriteFile$/, {
		'status': true
	});
	
	//人脸库添加文件夹
	Mock.mock(/user\/sysStructure\/queryChildNodes$/, {
		pageSize:9,
		'data|9':[{'NAME|1': ["广州市"]}]
	});
	
	//移动终端人脸库
	Mock.mock(/mobileLibrary\/getData$/,{
		"mobileList":{
			'count':100,
		    'records|100':[{
		    	'fileId|+1':1,
		    	'imgUrl':'@imgPersonPhoto',
		    	'percentage|75-100':75,
				'name':"@cname",
				'sex|1':["男","女",'未知'],
				'IDCard':/^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/,
				'address':"@city(true)"
		    }]
		}
	});
	
	//我的收藏列表
	Mock.mock(/personalLibrary\/getData$/,{
		"mobileList":{
			'count':1,
			'records|10':[{
				'LIBRARY_NAME|+1':1,
				'PERSON_ID':'admin',
				'LIBRARY_SIZE|5-10':5
			}]
		}
	});
	
	//批量导入
	Mock.mock(/surveilImport\/manage\/queryProgress$/,{
			progress:1,
			registerStatus:1,
			totalN:2,
			totalY:0
	});
	
	//批量导入详情
	Mock.mock(/surveilImport\/manage\/queryErrorData$/,{
		data:[{
			DESC:"身份证号不合法",
			IDENTITY_ID:"测试",
			PERSON_NAME:"411522199309090224"
		}]
	})
	
	//待确定身份人脸库
	Mock.mock(/faceIdentity\/getData$/,{
		"faceIdentityList":{
			'count':50,
		    'records|50': [{
		    		'perId|+1':1,
		    		'fileId|+1':1,
		    		'PIC': "@imgPersonControl",
		    		'OBJ_PIC': '@imgPersonControlBranch',
		    		'ORG_NAME|1': ["广州市","佛山市","深圳市"],
		    		'DEVICE_NAME|1': function(){
		    			return this.ORG_NAME + '芙蓉路225'
		    		},
		    		JGSK: "2017-06-17 13:28:24",
		    		PER_NAME:"@cname",
		    		'FACE_LIB|1':['在逃库','路人库','档案库','专题库'],
		    		'percentage|70-99':80
		    }]
		}
	});
	
	/**  布控库名 **/
	Mock.mock(/faceIdentity\/controlLibrary\/getData/, {
			"records|10-20":[{
				'LIBNAME|+1':['在逃库','路人库','涉毒库','涉黄库','涉赌库','涉恐库','涉稳库','重大刑事犯罪前科库','肇事肇祸精神病人库','抢劫库','盗窃库','诈骗库','未涉案库','常住人口库','流动人口库','重点人员库'],
				"LIBVALUE|+1":1
			}]
	});
	/*
	 Mock.mock(/faceIdentity\/controlLibrary\/getData/,{	
				    	"ZALX":{
							'01050100':'在逃库',
							'01050200':'路人库',
							'01050300':'涉毒库',
							'01050400':'涉黄库',
							'01059500':'涉赌库',
							'01059600':'涉恐库',
							'01059700':'涉稳库',
							'01059800':'重大刑事犯罪前科库',
							'01059900':'肇事肇祸精神病人库',
							'01059901':'抢劫库',
							'01059902':'盗窃库',
							'01059903':'诈骗库',
							'01059904':'未涉案库',
							'01059905':'常住人口库',
							'01059906':'流动人口库',
							'01059907':'重点人员库'
						}
				    
	 });
	 */
	//报警详情信息
	 Mock.mock(/alarmDetails\/getData$/,{
		'data':{
			'perId|+1':1,
    		'fileId|+1':1,
    		'zjz_PIC': '@imgPersonPhoto',
    		'zpt_PIC':'@imgPersonCamera',
    		'PIC': "@imgPersonCameraBranch",
    		'ORG_NAME|1': ["广州市","佛山市","深圳市"],
    		'DEVICE_NAME|1': function(){
    			return this.ORG_NAME + '芙蓉路225'
    		},
    		'JGSK': "2017-06-17 13:28:24",
    		'FACE_LIB|1':['在逃库','路人库','档案库','专题库'],
    		'percentage|70-99':80,
    		'certificate':'身份证',
    		'remark':'备注信息',
    		'IDCard':/^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/,
    		'sex|1':["男","女",'未知'],
    		'PER_NAME':"@cname"
		}			    			
	});
	 
	//我的收藏夹
	Mock.mock(/myCollectionList\/getData$/,{
		"myCollectionList":{
			'count':10,
			'records|10':[{
				'imgUrl':'@imgPersonPhoto',
				'percentage|75-100':75,
				'name':"@cname",
				'sex|1':["男","女"],
				'IDCard':/^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/,
				'address':"@city(true)"
			}]
		}
	});

	//新建导入库列表项目
	Mock.mock(/efacecloud\/mine\/libinfo\/getMineLibList$/, {
		data:[{
			CREATE_TIME: 170503115406,
			KEYWORDS: "5.4renliantst,",
			LIBRARY_ID: 177024991533583870,
			LIBRARY_NAME: "5.4renliantst",
			LIBRARY_SIZE: 0,
			LIBRARY_THEME: 0,
			LIBRARY_TYPE: 1,
			PERSON_ID: "admin",
			SOURCE_TYPE: 1,
			UPDATE_TIME: 170503145211,
			score: "0.00",
			text: "5.4renliantst",
			value: "177024991533583872"	
		},{
			CREATE_TIME: 170602150015,
			KEYWORDS: "1111,",
			LIBRARY_ID: 187943473859120640,
			LIBRARY_NAME: "1111",
			LIBRARY_SIZE: 0,
			LIBRARY_THEME: 0,
			LIBRARY_TYPE: 1,
			PERSON_ID: "admin",
			SOURCE_TYPE: 1,
			UPDATE_TIME: 170602150015,
			score: "0.00",
			text: "1111",
			value: "187943473859120640"
		}]

    });
	
	//导入库列表
	Mock.mock(/efacecloud\/mine\/libinfo\/getMineLibList$/, {
		data:[{
			CREATE_TIME: 170503115406,
			KEYWORDS: "5.4renliantst,",
			LIBRARY_ID: 177024991533583870,
			LIBRARY_NAME: "5.4renliantst",
			LIBRARY_SIZE: 0,
			LIBRARY_THEME: 0,
			LIBRARY_TYPE: 1,
			PERSON_ID: "admin",
			SOURCE_TYPE: 1,
			UPDATE_TIME: 170503145211,
			score: "0.00",
			text: "5.4renliantst",
			value: "177024991533583872"	
		},{
			CREATE_TIME: 170602150015,
			KEYWORDS: "1111,",
			LIBRARY_ID: 187943473859120640,
			LIBRARY_NAME: "1111",
			LIBRARY_SIZE: 0,
			LIBRARY_THEME: 0,
			LIBRARY_TYPE: 1,
			PERSON_ID: "admin",
			SOURCE_TYPE: 1,
			UPDATE_TIME: 170602150015,
			score: "0.00",
			text: "1111",
			value: "187943473859120640"
		}]

    });

	//按搜索后返回来的对象
	Mock.mock(/efacecloud\/face\/quality\/dsdetect$/, {
		AGE: "2",
		RLTZ: "cdievBJy27w2+vq86rEdvf/vLr0evOm80MQaPUr0NL1+lYo6mpNmvQKGDjsHqm88Y/6vu+Umi7xLxVe8oKbIvdu3l710lHq8C7E0vTXNVr2F8rY7TiO1vPOi+L2eoHu9q8p1vO8+QDz298K7zyQTPXv43T3vVYy936KBvimAHz24i8C9PPBiPAT0ADzmhKg9JP/fuy3KCjt257690xAXvSd63rsmoby8vn8IPt49DrvOzyG+xNKSvQOOlb3gmKo89F73u8vjjT3n2/y8yfEFPWCFljymRca8hotsvR7Y7T2+F+C9+HiWPax4Dj0Zcma9DABGPG4x6LxpJG89bgy1vXGUzDyccIK8HKnlPdCzyTyU3ge9r/hPvLQLgT0LWZI8X0hHPfvskbz3i6y7iDztPH/9kbx8es08PX1dvOazzr1TkEK9+LujPN23mr0jRd08SaoTPez1jb3orAQ+Z+UVvXMrLLylcOg8U4FfPKPgV70IEd+8/74pvdtKILuriK09R4HKvc2XEDyzlMa97HDzvWhItT0OPDs9MT6KvCG0Vz3QoK08Qqt3ulQMAT0cuJG9KOWpvbQE2r0ydxU9G7squmWFrTwS79w8SjWnuuZgmD22RTi9KGCluijisz1fGxo9j+7KvPtDJb30kR89pAAHvIyQrzueL588AfCIO7RlZ72Uuyq9f/mqPWUpJj2d6vG8DPxyPbukcrw8rza9K0AlvaXqcL0rI/07p57ku1NHg7zbh+a8qIpsvISVpkIAAIA/",
		SEX: "1",
		isValid: true
    });


	//文件夹列表
	Mock.mock(/efacecloud\/favorite\/getData$/, {
		'folderList':{
			'count':4,
			'records':[
				{CREATE_TIME: "2017-05-26 15:07:20",
					CREATOR: "admin",
					FAVORITE_ID: "46aa96b326084025a199c1bd3b49113a",
					FAVORITE_NAME: "sdjkfhjkasdhfjkas",
					LEVEL: 1,
					PARENT_ID: "",
					STATUS: 0,
					fileNum: 0,
					rowid: 1,
					_index: 0,},
				{CREATE_TIME: "2017-05-23 11:27:15",
					CREATOR: "admin",
						FAVORITE_ID: "85e68d251f5f4dc0aeb42ef46f8bc4db",
						FAVORITE_NAME: "20170522盗窃案",
						LEVEL: 1,
						PARENT_ID: "",
						STATUS: 0,
						fileNum: 0,
						rowid: 2,
						_index: 1,
				}
			],
			'usetime':0
		}
    });


//人脸抓拍列表
Mock.mock(/efacecloud\/es\/face\/collection\/query$/, {
	'faceCollectionList':{
		'count':50,
	    'records|50': [{
	    	    AGE: "",
	    		CJSJ: 170617132827,
	    		CREATETIME: 170617132829,
	    		DATA_SRC: "1",
	    		DEVICE_ADDR: "",
	    		DEVICE_ID: "44010000001320000002",
	    		'ORG_NAME|1': ["广州市","佛山市","深圳市"],
	    		'DEVICE_NAME|1': function(){
	    			return this.ORG_NAME + '芙蓉路225'
	    		},
	    		PIC: "@imgPersonCamera",
	    		FACE_ID: "@imgPersonCameraBranch",
	    		INFO_ID: "193356187855080960",
	    		JGRQ: 170617,
	    		JGSJ: 132824,
	    		JGSK: "2017-06-17 13:28:24",
	    		OBJ_PIC: "@imgPersonCameraBranch",
	    		ORG_CODE: "4401",
	    		ORIGINAL_DEVICE_ID: "44010000001320000002",
	    		PERSON_ID: "0",
	    		SEX: "",
	    		STARTTIME: "",
	    		WITH_GLASSES: "0",
	    		WITH_HAT: "0",
	    		score: "0",
	    		'_index|+1': 0,
	    		'Percentage|70-80':70
	    }]
	}

});

//不知道什么
Mock.mock(/case\/common\/getNginxIp$/, {
	'fdfsPort':"8088",
	'fdfsPrefix':"http://172.16.56.204:8088/",
	'ip':"http://172.16.56.203",
	'uscpAddress':"http://172.16.56.144:9080"
});


//地址树
Mock.mock(/efacecloud\/gate\/getCarDetect$/,[{
	"ChildNodes": [
    {
        "ChildNodes": [
            {
                "ChildNodes": [],
                "isParent": true,
                "hasChildren": true,
                "id": "440101",
                "text": "市辖区",
                "showtitles": true,
                "showcheck": true,
                "value": {
                    "ID": 16,
                    "TYPE": "STRUCTURE"
                },
                "checkstate": 0
            },
            {
                "ChildNodes": [
                    {
                        "ChildNodes": [
                            {
                                "ChildNodes": [],
                                "isParent": true,
                                "hasChildren": true,
                                "id": "4401060101",
                                "text": "佳都科技",
                                "showtitles": true,
                                "showcheck": true,
                                "value": {
                                    "ID": 1,
                                    "TYPE": "COMMUNITY"
                                },
                                "checkstate": 0
                            },
                            {
                                "ChildNodes": [],
                                "isParent": true,
                                "hasChildren": true,
                                "id": "4401060102",
                                "text": "test",
                                "showtitles": true,
                                "showcheck": true,
                                "value": {
                                    "ID": 3,
                                    "TYPE": "COMMUNITY"
                                },
                                "checkstate": 0
                            }
                        ],
                        "isParent": true,
                        "hasChildren": true,
                        "id": "44010601",
                        "text": "天园派出所",
                        "showtitles": true,
                        "showcheck": true,
                        "value": {
                            "ID": 4,
                            "TYPE": "STRUCTURE"
                        },
                        "checkstate": 0
                    }
                ],
                "isParent": true,
                "hasChildren": true,
                "id": "440106",
                "text": "天河区",
                "showtitles": true,
                "showcheck": true,
                "value": {
                    "ID": 3,
                    "TYPE": "STRUCTURE"
                },
                "checkstate": 0
            },
            {
                "ChildNodes": [
                    {
                        "ChildNodes": [
                            {
                                "ChildNodes": [
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000001",
                                        "text": "商业大道与凤凰路 东往西",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.262001",
                                            "Y": "23.461309"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000002",
                                        "text": "云山路与公元前 南往北",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.335243",
                                            "Y": "23.494978"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000003",
                                        "text": "宝华路与花城路 南往北",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.312714",
                                            "Y": "23.399464"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000004",
                                        "text": "宝华路与花城路 东往西",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.046944",
                                            "Y": "23.413948"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000005",
                                        "text": "宝华路与花城路 西往东",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.022408",
                                            "Y": "23.387194"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000006",
                                        "text": "桂花路与紫薇路 南往北",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.205757",
                                            "Y": "23.415895"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000007",
                                        "text": "桂花路与紫薇路 北往南",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.163712",
                                            "Y": "23.444267"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000008",
                                        "text": "桂花路与紫薇路 东往西",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.119583",
                                            "Y": "23.381460"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000009",
                                        "text": "天贵路与体育路 南往北",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.189529",
                                            "Y": "23.413923"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000010",
                                        "text": "三东大道与茶园路 西往东",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.292389",
                                            "Y": "23.381243"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000011",
                                        "text": "百寿路与紫薇路 西往东",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.096092",
                                            "Y": "23.393759"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000012",
                                        "text": "芙蓉大道与山前大道 南往北",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.184151",
                                            "Y": "23.497208"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000013",
                                        "text": "雅神路卡口",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.123268",
                                            "Y": "23.459648"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000014",
                                        "text": "狮城国际卡口",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.205078",
                                            "Y": "23.381611"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000015",
                                        "text": "喻丝园卡口",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.098259",
                                            "Y": "23.422743"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000016",
                                        "text": "梯面106国道旧收费站卡口",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.109085",
                                            "Y": "23.396147"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000017",
                                        "text": "狮岭宝峰路卡口",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.191490",
                                            "Y": "23.403036"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000018",
                                        "text": "花城路与商业大道 北往南",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.052704",
                                            "Y": "23.481121"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000019",
                                        "text": "花城路与商业大道 西往东",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.272285",
                                            "Y": "23.399628"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000020",
                                        "text": "茶园路与购书中心 南往北",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.130684",
                                            "Y": "23.431753"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000021",
                                        "text": "天贵路与平石路 南往北",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.351265",
                                            "Y": "23.416225"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000022",
                                        "text": "平步大道与天贵路 西往东",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.243370",
                                            "Y": "23.487804"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000023",
                                        "text": "宝华路与公益路 南往北",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.351578",
                                            "Y": "23.433279"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000024",
                                        "text": "宝华路与公益路 北往南",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.313362",
                                            "Y": "23.474970"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000025",
                                        "text": "凤凰南路桥",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.247025",
                                            "Y": "23.386883"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000026",
                                        "text": "迎宾大道清布桥",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.018791",
                                            "Y": "23.485962"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000027",
                                        "text": "建设北南菱汽车城",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.344460",
                                            "Y": "23.474890"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000028",
                                        "text": "金华路富丽花园",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.328850",
                                            "Y": "23.391256"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000029",
                                        "text": "机场高速花山收费站",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.031746",
                                            "Y": "23.482698"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000030",
                                        "text": "106国道梯面联民村",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.040886",
                                            "Y": "23.432575"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000031",
                                        "text": "广花路邮政中心",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.327309",
                                            "Y": "23.414589"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000032",
                                        "text": "赤坭国泰村",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.109703",
                                            "Y": "23.463310"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000033",
                                        "text": "山前大道赤坭珊瑚村",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.044289",
                                            "Y": "23.405588"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000034",
                                        "text": "山前大道原花城收费站",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.095802",
                                            "Y": "23.487255"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000035",
                                        "text": "新赤线黎村水库",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.210060",
                                            "Y": "23.402483"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000036",
                                        "text": "盘古北路喻丝园",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.234657",
                                            "Y": "23.487789"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000037",
                                        "text": "X266石角村",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.052475",
                                            "Y": "23.431028"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000038",
                                        "text": "106国道民安村",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.111710",
                                            "Y": "23.381096"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000039",
                                        "text": "紫薇路与凤凰路 西往东",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.039879",
                                            "Y": "23.417629"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000040",
                                        "text": "百寿路与紫薇路 南往北",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.068695",
                                            "Y": "23.461948"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000041",
                                        "text": "百寿路与紫薇路 北往南",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.219315",
                                            "Y": "23.478624"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000042",
                                        "text": "三东大道与106线 北往南",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.157410",
                                            "Y": "23.434025"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000043",
                                        "text": "碧桂园假日半岛卡口",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.033272",
                                            "Y": "23.475954"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000044",
                                        "text": "花城路与商业大道 南往北",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.301025",
                                            "Y": "23.429302"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000045",
                                        "text": "建设路与紫薇路 南往北",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.352898",
                                            "Y": "23.493425"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000046",
                                        "text": "宝华路与公益路 西往东",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.272339",
                                            "Y": "23.487473"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000047",
                                        "text": "农新旱桥西行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.004097",
                                            "Y": "23.385141"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000048",
                                        "text": "农新桥广清匝道",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.221619",
                                            "Y": "23.492418"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000049",
                                        "text": "商业大道龙口收费站",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.150307",
                                            "Y": "23.480907"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000050",
                                        "text": "新都大桥",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.126297",
                                            "Y": "23.398102"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000051",
                                        "text": "金钟路大布村",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.329544",
                                            "Y": "23.452662"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000052",
                                        "text": "宝华大道时代美居",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.187332",
                                            "Y": "23.413172"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000053",
                                        "text": "云山大道花果山",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.051788",
                                            "Y": "23.471512"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000054",
                                        "text": "北兴莘田村村道",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.130089",
                                            "Y": "23.464125"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000055",
                                        "text": "平步大道广清海布出入口",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.254807",
                                            "Y": "23.478914"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000056",
                                        "text": "禅炭公路环山村",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.227394",
                                            "Y": "23.427183"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000057",
                                        "text": "花都大道炭步大涡村",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.082870",
                                            "Y": "23.420864"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000058",
                                        "text": "山前大道花东联安村",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.164429",
                                            "Y": "23.445158"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000059",
                                        "text": "山前大道机场高速路段西行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.052017",
                                            "Y": "23.441519"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000060",
                                        "text": "山前大道花东九子村",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.165283",
                                            "Y": "23.473326"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000061",
                                        "text": "镜湖大道豪利花园",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.103577",
                                            "Y": "23.464178"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000062",
                                        "text": "茶园路与购书中心",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.123840",
                                            "Y": "23.462357"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000063",
                                        "text": "三东大道与茶园路",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.123131",
                                            "Y": "23.434450"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000064",
                                        "text": "工业大道华翠园",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.279930",
                                            "Y": "23.384064"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000065",
                                        "text": "花都大道洛场村",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.328957",
                                            "Y": "23.402918"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000066",
                                        "text": "杨赤线马岭路口",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.227257",
                                            "Y": "23.466097"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000067",
                                        "text": "芙蓉大道东边村",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.000465",
                                            "Y": "23.420134"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000068",
                                        "text": "迎宾大道东延线茶果塘路",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.237015",
                                            "Y": "23.384933"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000069",
                                        "text": "合和路狮城国际",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.335243",
                                            "Y": "23.394732"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000070",
                                        "text": "培正路军田隧道西侧",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.353767",
                                            "Y": "23.477879"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000071",
                                        "text": "东风大道东风大桥",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.181946",
                                            "Y": "23.476685"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000072",
                                        "text": "S118炭步大桥",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.079842",
                                            "Y": "23.497610"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000073",
                                        "text": "赤坭大道赤坭中学",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.119621",
                                            "Y": "23.421717"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000074",
                                        "text": "培正大道剑岭村",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.022903",
                                            "Y": "23.475410"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000075",
                                        "text": "赤坭大道轮胎厂",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.174522",
                                            "Y": "23.435797"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000076",
                                        "text": "X280雅神路",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.110497",
                                            "Y": "23.460243"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000077",
                                        "text": "田心路近桥路段",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.240837",
                                            "Y": "23.448313"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000078",
                                        "text": "狮岭宝峰路中段",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.175087",
                                            "Y": "23.449835"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000079",
                                        "text": "智慧枪抓拍测试",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.128288",
                                            "Y": "23.410505"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000080",
                                        "text": "商业大道与新华路",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.134735",
                                            "Y": "23.440811"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000081",
                                        "text": "广花一级与雅源路",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.278786",
                                            "Y": "23.470892"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000082",
                                        "text": "雅瑶中路与凤凰南路",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.320160",
                                            "Y": "23.394487"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000083",
                                        "text": "金狮大道与芙蓉专用道",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.317383",
                                            "Y": "23.471947"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000084",
                                        "text": "云山路与公园前",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.065033",
                                            "Y": "23.425020"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000085",
                                        "text": "宝华路与花城路",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.053802",
                                            "Y": "23.462488"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000086",
                                        "text": "桂花路与紫薇路",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.049461",
                                            "Y": "23.450499"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000087",
                                        "text": "花都大道与机场大道交界",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.118454",
                                            "Y": "23.398041"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000088",
                                        "text": "花都大道新华墓园",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.348000",
                                            "Y": "23.409864"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000089",
                                        "text": "杨赤线秀全水库海布桥",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.139359",
                                            "Y": "23.455114"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000090",
                                        "text": "北兴卡口",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.294983",
                                            "Y": "23.449366"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000091",
                                        "text": "S267珠江水泥厂",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.088081",
                                            "Y": "23.452497"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000092",
                                        "text": "花港大道与车城大道",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.219429",
                                            "Y": "23.447678"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000093",
                                        "text": "智慧枪",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.220406",
                                            "Y": "23.405519"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000094",
                                        "text": "迎宾大道与曙光路",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.229210",
                                            "Y": "23.494673"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000095",
                                        "text": "芙蓉大道与山前大道",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.084885",
                                            "Y": "23.454271"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000096",
                                        "text": "迎宾大道与皇帝路",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.309013",
                                            "Y": "23.419699"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000097",
                                        "text": "建设路与松园路",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.320816",
                                            "Y": "23.394957"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000098",
                                        "text": "建设路与龙珠路",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.325775",
                                            "Y": "23.385880"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000099",
                                        "text": "镜湖大道与雅瑶中路",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.368614",
                                            "Y": "23.480083"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000100",
                                        "text": "测试路口",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.139030",
                                            "Y": "23.490698"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000101",
                                        "text": "天贵路与体育路",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.065811",
                                            "Y": "23.487707"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000102",
                                        "text": "三东大道与茶园路",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.356155",
                                            "Y": "23.473391"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000103",
                                        "text": "公益路与三东大道",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.202240",
                                            "Y": "23.386652"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000104",
                                        "text": "天贵路与平石路",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.235115",
                                            "Y": "23.438662"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000105",
                                        "text": "平步大道与天贵路",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.297752",
                                            "Y": "23.491566"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000106",
                                        "text": "平步大道与凤凰北路",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.231308",
                                            "Y": "23.425913"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000107",
                                        "text": "106与山前大道北侧",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.045784",
                                            "Y": "23.482040"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000108",
                                        "text": "商业大道与凤凰路",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.012650",
                                            "Y": "23.424780"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000109",
                                        "text": "曙光路与龙珠路",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.269356",
                                            "Y": "23.380615"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000110",
                                        "text": "紫薇路与曙光路",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.216820",
                                            "Y": "23.431723"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000111",
                                        "text": "紫薇路与玫瑰路",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.122719",
                                            "Y": "23.397049"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000112",
                                        "text": "狮岭大道与合成市场",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.319298",
                                            "Y": "23.468912"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000113",
                                        "text": "凤凰路与龙珠路",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.029007",
                                            "Y": "23.456520"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000114",
                                        "text": "紫薇路与凤凰路",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.296974",
                                            "Y": "23.464792"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000115",
                                        "text": "百寿路与紫薇路",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.280663",
                                            "Y": "23.427891"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000116",
                                        "text": "狮岭大道与芙蓉专用道",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.242844",
                                            "Y": "23.484419"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000117",
                                        "text": "三东大道与百寿路",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.066856",
                                            "Y": "23.399193"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000118",
                                        "text": "三东大道与106线",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.056023",
                                            "Y": "23.424791"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000119",
                                        "text": "金狮大道与阳光路",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.368179",
                                            "Y": "23.420347"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000120",
                                        "text": "金狮大道与宝峰路",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.343597",
                                            "Y": "23.403730"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000121",
                                        "text": "车辆厂出口与紫薇路",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.228851",
                                            "Y": "23.471165"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000122",
                                        "text": "迎宾大道与大华一路 南往北",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.014702",
                                            "Y": "23.446836"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000123",
                                        "text": "迎宾大道与大华一路 北往南",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.118629",
                                            "Y": "23.443438"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000124",
                                        "text": "迎宾大道与大华一路 东往西",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.042229",
                                            "Y": "23.412210"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000125",
                                        "text": "龙珠路与茶园路 东往西",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.328094",
                                            "Y": "23.452017"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000126",
                                        "text": "迎宾大道与曙光路 北往南",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.316200",
                                            "Y": "23.392466"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000127",
                                        "text": "迎宾大道与曙光路 东往西",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.180122",
                                            "Y": "23.497118"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000128",
                                        "text": "紫薇路与曙光路 南往北",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.207291",
                                            "Y": "23.402832"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000129",
                                        "text": "紫薇路与曙光路 西往东",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.229637",
                                            "Y": "23.470253"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000130",
                                        "text": "三东大道与曙光路 南往北",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.018677",
                                            "Y": "23.477589"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000131",
                                        "text": "三东大道与曙光路 西往东",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.357811",
                                            "Y": "23.433817"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000132",
                                        "text": "百寿路与紫薇路 东往西",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.171364",
                                            "Y": "23.387943"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000133",
                                        "text": "三东大道与百寿路 东往西",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.035004",
                                            "Y": "23.489546"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000134",
                                        "text": "三东大道与106线 南往北",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.040642",
                                            "Y": "23.486317"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000135",
                                        "text": "芙蓉大道卡口",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.281349",
                                            "Y": "23.427647"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000136",
                                        "text": "炭步大桥卡口",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.261253",
                                            "Y": "23.396767"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000137",
                                        "text": "106国道白鳝塘",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.247620",
                                            "Y": "23.474751"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000138",
                                        "text": "三东大道与茶园路南往北",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.211441",
                                            "Y": "23.461384"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000139",
                                        "text": "花都大道推广圩联安村路口",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.125343",
                                            "Y": "23.417862"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000140",
                                        "text": "花东镇七星村公路",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.245544",
                                            "Y": "23.388596"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000141",
                                        "text": "107旧路狮岭前进村",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.056412",
                                            "Y": "23.419722"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000142",
                                        "text": "李溪堤坝",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.048706",
                                            "Y": "23.450190"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000143",
                                        "text": "三东大道小布村西岭",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.352150",
                                            "Y": "23.493061"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000144",
                                        "text": "芙蓉专用道横坑",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.301697",
                                            "Y": "23.392429"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000145",
                                        "text": "金狮大道新扬村",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.362839",
                                            "Y": "23.460983"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000146",
                                        "text": "山前大道瑞边村",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.300835",
                                            "Y": "23.411955"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000147",
                                        "text": "天贵路卡口",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.220276",
                                            "Y": "23.467087"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000148",
                                        "text": "狮岭芙蓉大道度假村",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.225197",
                                            "Y": "23.464724"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000149",
                                        "text": "碧桂园假日半岛",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.062347",
                                            "Y": "23.481529"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000150",
                                        "text": "红棉大道武警医院",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.156189",
                                            "Y": "23.408636"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000151",
                                        "text": "花城路与商业大道",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.117393",
                                            "Y": "23.402813"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000152",
                                        "text": "龙珠路与茶园路",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.304321",
                                            "Y": "23.406128"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000153",
                                        "text": "宝华路与公益路",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.001007",
                                            "Y": "23.415325"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000154",
                                        "text": "三东大道与天贵路",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.025627",
                                            "Y": "23.494053"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000155",
                                        "text": "狮岭大道与合和路",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.237030",
                                            "Y": "23.423660"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000156",
                                        "text": "迎宾大道与大华一路",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.081131",
                                            "Y": "23.392471"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000157",
                                        "text": "金狮大道与南航大道",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.174500",
                                            "Y": "23.394447"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000158",
                                        "text": "S118线与X281线",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.283257",
                                            "Y": "23.384554"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000159",
                                        "text": "建设路与紫薇路",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.193329",
                                            "Y": "23.380682"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000160",
                                        "text": "S118线与现代大道",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.295853",
                                            "Y": "23.484884"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000161",
                                        "text": "禅炭路与皮带廊",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.312988",
                                            "Y": "23.453524"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000162",
                                        "text": "禅炭路与皮带廊",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.335983",
                                            "Y": "23.424200"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000163",
                                        "text": "G106 禾雀花基地",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.009857",
                                            "Y": "23.464951"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000164",
                                        "text": "三东大道与曙光路",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.017838",
                                            "Y": "23.488611"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000165",
                                        "text": "106花山政府广场",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.265175",
                                            "Y": "23.492455"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000166",
                                        "text": "禅炭路与大涡路",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.222145",
                                            "Y": "23.433146"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000167",
                                        "text": "曙光路与田美路",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.327988",
                                            "Y": "23.433058"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000168",
                                        "text": "狮岭大道与南航大道",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.223984",
                                            "Y": "23.478472"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000169",
                                        "text": "雅瑶市场路段",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.221062",
                                            "Y": "23.382078"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000170",
                                        "text": "test",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.209984",
                                            "Y": "23.465279"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000171",
                                        "text": "金砖实验学校门口",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.311569",
                                            "Y": "23.445267"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000172",
                                        "text": "S118飞达音响路段",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.317329",
                                            "Y": "23.457476"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000173",
                                        "text": "S118港头小学路段",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.158882",
                                            "Y": "23.443825"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000174",
                                        "text": "对接测试",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.247627",
                                            "Y": "23.480930"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000175",
                                        "text": "新赤线",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.365303",
                                            "Y": "23.382011"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000176",
                                        "text": "41 山前大道花东七星村路段",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.063118",
                                            "Y": "23.392319"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000177",
                                        "text": "39 山前大道机场高速西行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.369232",
                                            "Y": "23.437880"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000178",
                                        "text": "33 赤坭国泰村路段",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.079796",
                                            "Y": "23.439346"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000179",
                                        "text": "38 山前大道机场高速东行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.327301",
                                            "Y": "23.399776"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000180",
                                        "text": "40 山前大道花东九子村路段",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.006294",
                                            "Y": "23.491133"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000181",
                                        "text": "30 禅炭公路环山村路段",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.200218",
                                            "Y": "23.474594"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000182",
                                        "text": "88",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.241493",
                                            "Y": "23.394499"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000183",
                                        "text": "11 建设北南菱汽车城路段",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.031425",
                                            "Y": "23.451540"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000184",
                                        "text": "34 山前大道赤坭珊瑚村路段",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.178352",
                                            "Y": "23.496632"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000185",
                                        "text": "53 金狮大道新扬村路段",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.210457",
                                            "Y": "23.469006"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000186",
                                        "text": "14 迎宾大道新都大桥",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.051178",
                                            "Y": "23.471697"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000187",
                                        "text": "13 建设北路杨屋路口路段",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.267784",
                                            "Y": "23.408749"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000188",
                                        "text": "18 宝华大道时代美居路段",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.047791",
                                            "Y": "23.469036"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000189",
                                        "text": "10 106国道坪山路段",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.350883",
                                            "Y": "23.417751"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000190",
                                        "text": "21 花都大道杨荷收费站路段",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.248131",
                                            "Y": "23.495859"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000191",
                                        "text": "24 机场高速花山收费站路段",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.232124",
                                            "Y": "23.441902"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000192",
                                        "text": "29 广花路邮政中心路段",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.077721",
                                            "Y": "23.433779"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000193",
                                        "text": "22 北兴莘田村村道路段",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.153366",
                                            "Y": "23.485952"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000194",
                                        "text": "36 106国道花山花城路口路段",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.092247",
                                            "Y": "23.386246"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000195",
                                        "text": "15 金华路富华花园路段",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.032593",
                                            "Y": "23.469051"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000196",
                                        "text": "17 旧107商贸城路段",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.180153",
                                            "Y": "23.389252"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000197",
                                        "text": "28 平步大道广清海布出入口路段",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.111038",
                                            "Y": "23.464718"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000198",
                                        "text": "旧雅瑶桥路段",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.292007",
                                            "Y": "23.400043"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000199",
                                        "text": "106与山前大道南侧",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.173958",
                                            "Y": "23.395193"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000200",
                                        "text": "军田隧道卡口",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.243538",
                                            "Y": "23.442911"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000201",
                                        "text": "迎宾大道与大华一路 西往东",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.348274",
                                            "Y": "23.439665"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000202",
                                        "text": "龙珠路与茶园路 南往北",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.303169",
                                            "Y": "23.461533"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000203",
                                        "text": "龙珠路与茶园路 西往东",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.104019",
                                            "Y": "23.485886"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000204",
                                        "text": "天贵路与体育路 北往南",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.075348",
                                            "Y": "23.466515"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000205",
                                        "text": "天贵路与体育路 东往西",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.213272",
                                            "Y": "23.431963"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000206",
                                        "text": "天贵路与体育路 西往东",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.350487",
                                            "Y": "23.424393"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000207",
                                        "text": "三东大道与茶园路 东往西",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.321518",
                                            "Y": "23.461227"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000208",
                                        "text": "紫薇路与曙光路 东往西",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.057198",
                                            "Y": "23.479101"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000209",
                                        "text": "三东大道与曙光路 北往南",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.193443",
                                            "Y": "23.463133"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000210",
                                        "text": "三东大道与106线 东往西",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.049988",
                                            "Y": "23.459499"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000211",
                                        "text": "军田隧道卡口",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.168625",
                                            "Y": "23.419718"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000212",
                                        "text": "赤坭中学卡口",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.245453",
                                            "Y": "23.444807"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000213",
                                        "text": "盈润厂路段卡口",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.311646",
                                            "Y": "23.462345"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000214",
                                        "text": "新赤线黎村水库卡口",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.293839",
                                            "Y": "23.476414"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000215",
                                        "text": "田心路卡口",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.310707",
                                            "Y": "23.438534"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000216",
                                        "text": "迎宾大道与皇帝路 北往南",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.339073",
                                            "Y": "23.485128"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000217",
                                        "text": "迎宾大道与皇帝路 西往东",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.274094",
                                            "Y": "23.395126"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000218",
                                        "text": "镜湖大道与雅瑶中路 南往北",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.151459",
                                            "Y": "23.458368"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000219",
                                        "text": "镜湖大道与雅瑶中路 东往西",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.086830",
                                            "Y": "23.438856"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000220",
                                        "text": "茶园路与购书中心 北往南",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.076431",
                                            "Y": "23.422909"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000221",
                                        "text": "公益路与三东大道 西往东",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.256630",
                                            "Y": "23.400398"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000222",
                                        "text": "三东大道与天贵路 南往北",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.063187",
                                            "Y": "23.485437"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000223",
                                        "text": "三东大道与天贵路 北往南",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.144333",
                                            "Y": "23.418753"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000224",
                                        "text": "三东大道与天贵路 东往西",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.259781",
                                            "Y": "23.484663"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000225",
                                        "text": "平步大道与天贵路 南往北",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.225708",
                                            "Y": "23.419834"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000226",
                                        "text": "平步大道与天贵路 东往西",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.319855",
                                            "Y": "23.453838"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000227",
                                        "text": "平步大道与凤凰北路 东往西",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.307434",
                                            "Y": "23.421055"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000228",
                                        "text": "平步大道与凤凰北路 西往东",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.118820",
                                            "Y": "23.389336"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000229",
                                        "text": "龙珠路与茶园路 北往南",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.215820",
                                            "Y": "23.471340"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000230",
                                        "text": "迎宾大道与曙光路 南往北",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.359413",
                                            "Y": "23.386810"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000231",
                                        "text": "迎宾大道与曙光路 西往东",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.245605",
                                            "Y": "23.447050"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000232",
                                        "text": "紫薇路与曙光路 北往南",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.261909",
                                            "Y": "23.468428"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000233",
                                        "text": "三东大道与曙光路 东往西",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.331749",
                                            "Y": "23.466246"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000234",
                                        "text": "紫薇路与凤凰路 南往北",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.240761",
                                            "Y": "23.408655"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000235",
                                        "text": "紫薇路与凤凰路 北往南",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.107475",
                                            "Y": "23.489000"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000236",
                                        "text": "紫薇路与凤凰路 东往西",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.157257",
                                            "Y": "23.467993"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000237",
                                        "text": "三东大道与百寿路 南往北",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.319695",
                                            "Y": "23.436256"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000238",
                                        "text": "三东大道与百寿路 西往东",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.015747",
                                            "Y": "23.438589"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000239",
                                        "text": "三东大道与106线 西往东",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.199738",
                                            "Y": "23.415352"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000240",
                                        "text": "芙蓉大道与山前大道 东往西",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.046631",
                                            "Y": "23.477367"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000241",
                                        "text": "芙蓉大道与山前大道 西往东",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.285866",
                                            "Y": "23.421579"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000242",
                                        "text": "豪利花园卡口",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.042763",
                                            "Y": "23.454643"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000243",
                                        "text": "珠江水泥厂卡口",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.068817",
                                            "Y": "23.402187"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000244",
                                        "text": "花城路与商业大道 东往西",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.240944",
                                            "Y": "23.412586"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000245",
                                        "text": "建设路与紫薇路 东往西",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.245277",
                                            "Y": "23.435572"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000246",
                                        "text": "公益路与三东大道 南往北",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.038895",
                                            "Y": "23.380442"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000247",
                                        "text": "三东大道与天贵路 西往东",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.204933",
                                            "Y": "23.402843"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000248",
                                        "text": "迎宾大道与皇帝路 南往北",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.260658",
                                            "Y": "23.494226"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000249",
                                        "text": "迎宾大道与皇帝路 东往西",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.345947",
                                            "Y": "23.424118"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000250",
                                        "text": "建设路与紫薇路 北往南",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.163498",
                                            "Y": "23.498766"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000251",
                                        "text": "建设路与紫薇路 西往东",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.344490",
                                            "Y": "23.424768"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000252",
                                        "text": "镜湖大道与雅瑶中路 北往南",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.003716",
                                            "Y": "23.480051"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000253",
                                        "text": "镜湖大道与雅瑶中路 西往东",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.296028",
                                            "Y": "23.499369"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000254",
                                        "text": "广花一级与雅源路 西往东",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.352577",
                                            "Y": "23.395889"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000255",
                                        "text": "广花一级与雅源路 南往北",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.296776",
                                            "Y": "23.498613"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000256",
                                        "text": "广花一级与雅源路 东往西",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.230339",
                                            "Y": "23.442179"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000257",
                                        "text": "雅瑶中路与凤凰南路 南往北",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.152039",
                                            "Y": "23.427849"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000258",
                                        "text": "新华收费站",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.129829",
                                            "Y": "23.479080"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000259",
                                        "text": "旧雅瑶桥",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.200661",
                                            "Y": "23.439264"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000260",
                                        "text": "新雅大桥",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.082840",
                                            "Y": "23.405310"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000261",
                                        "text": "三东大道新东所人行天桥",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.318802",
                                            "Y": "23.413143"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000262",
                                        "text": "平步大道南洲收费站",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.017097",
                                            "Y": "23.475531"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000263",
                                        "text": "106国道坪山",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.127731",
                                            "Y": "23.382498"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000264",
                                        "text": "三东大道石岗村",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.184021",
                                            "Y": "23.462467"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000265",
                                        "text": "建设北路杨屋路口",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.354294",
                                            "Y": "23.405626"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000266",
                                        "text": "旧107商贸城",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.138527",
                                            "Y": "23.493385"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000267",
                                        "text": "迎宾大道马鞍山",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.049965",
                                            "Y": "23.467976"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000268",
                                        "text": "花都大道杨荷收费站",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.012329",
                                            "Y": "23.469303"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000269",
                                        "text": "花都大道京珠段",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.185387",
                                            "Y": "23.499180"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000270",
                                        "text": "山前大道广清狮岭出入口",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.338280",
                                            "Y": "23.457001"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000271",
                                        "text": "西二环炭步茶塘村",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.137154",
                                            "Y": "23.456511"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000272",
                                        "text": "106国道花山花城路口",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.319679",
                                            "Y": "23.496950"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000273",
                                        "text": "山前大道机场高速路段东行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.011078",
                                            "Y": "23.462345"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000274",
                                        "text": "广花一级与雅源路",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.036629",
                                            "Y": "23.391899"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000275",
                                        "text": "培正大道卡口",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.160042",
                                            "Y": "23.388939"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000276",
                                        "text": "赤坭大道轮胎厂段卡口",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.272964",
                                            "Y": "23.491241"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000277",
                                        "text": "迎宾大道东延线卡口",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.092690",
                                            "Y": "23.499073"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000278",
                                        "text": "公益路与三东大道 东往西",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.193321",
                                            "Y": "23.421198"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000279",
                                        "text": "天贵路与平石路 北往南",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.102379",
                                            "Y": "23.428226"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000280",
                                        "text": "平步大道与凤凰北路 南往北",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.220337",
                                            "Y": "23.465429"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000281",
                                        "text": "山前大道花东七星村",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.056358",
                                            "Y": "23.435852"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000282",
                                        "text": "111",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.352531",
                                            "Y": "23.479450"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000283",
                                        "text": "武警医院卡口",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.253891",
                                            "Y": "23.407656"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000284",
                                        "text": "东风大桥",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.354355",
                                            "Y": "23.476234"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000285",
                                        "text": "云山路花果山西行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.007584",
                                            "Y": "23.440233"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000286",
                                        "text": "西二环炭步入口",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.225304",
                                            "Y": "23.405882"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000287",
                                        "text": "花都大道京珠西行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.271294",
                                            "Y": "23.432241"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000288",
                                        "text": "山前大道珊瑚西行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.206978",
                                            "Y": "23.405897"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000289",
                                        "text": "山前大道机场高速路段西行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.194992",
                                            "Y": "23.495865"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000290",
                                        "text": "花都大道推广东行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.099815",
                                            "Y": "23.489614"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000291",
                                        "text": "花都大道洛场东行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.047256",
                                            "Y": "23.406296"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000292",
                                        "text": "宝华时代美居西行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.208046",
                                            "Y": "23.465799"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000293",
                                        "text": "三东大道与天贵路东往西",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.306618",
                                            "Y": "23.414083"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000294",
                                        "text": "迎宾大道清布北行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.219749",
                                            "Y": "23.437986"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000295",
                                        "text": "三东大道石岗西行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.129189",
                                            "Y": "23.442713"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000296",
                                        "text": "金狮大道新扬东行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.248451",
                                            "Y": "23.444132"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000297",
                                        "text": "花东入口",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.137558",
                                            "Y": "23.465261"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000298",
                                        "text": "106国道坪山南行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.264725",
                                            "Y": "23.456295"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000299",
                                        "text": "广花邮政中心南行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.185204",
                                            "Y": "23.403822"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000300",
                                        "text": "旧雅瑶桥南行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.275940",
                                            "Y": "23.443483"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000301",
                                        "text": "山前大道南航西行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.109047",
                                            "Y": "23.469858"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000302",
                                        "text": "北兴莘田村北行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.105530",
                                            "Y": "23.497835"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000303",
                                        "text": "北兴 京珠高速出口东行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.109940",
                                            "Y": "23.483170"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000304",
                                        "text": "商业大道与新华路 北往南",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.359177",
                                            "Y": "23.403780"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000305",
                                        "text": "云山路与公元前 北往南",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.061943",
                                            "Y": "23.486103"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000306",
                                        "text": "桂花路与紫薇路 西往东",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.086998",
                                            "Y": "23.429546"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000307",
                                        "text": "建设路与松园路 南往北",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.275986",
                                            "Y": "23.427320"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000308",
                                        "text": "建设路与松园路 北往南",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.227745",
                                            "Y": "23.418175"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000309",
                                        "text": "建设路与松园路 东往西",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.360275",
                                            "Y": "23.419119"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000310",
                                        "text": "建设路与龙珠路 南往北",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.334145",
                                            "Y": "23.417625"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000311",
                                        "text": "建设路与龙珠路 北往南",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.167610",
                                            "Y": "23.491652"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000312",
                                        "text": "建设路与龙珠路 东往西",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.347839",
                                            "Y": "23.442881"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000313",
                                        "text": "建设路与龙珠路 西往东",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.071243",
                                            "Y": "23.428850"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000314",
                                        "text": "test0304",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.285782",
                                            "Y": "23.462950"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000315",
                                        "text": "花港大道卡口",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.334084",
                                            "Y": "23.490614"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000316",
                                        "text": "三东大道与天贵路东往西",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.029175",
                                            "Y": "23.486923"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000317",
                                        "text": "新都大桥西行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.187073",
                                            "Y": "23.395027"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000318",
                                        "text": "三东大道新东东行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.085381",
                                            "Y": "23.390560"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000319",
                                        "text": "平步大道南洲东行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.089622",
                                            "Y": "23.388166"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000320",
                                        "text": "建设北南菱南行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.005898",
                                            "Y": "23.461489"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000321",
                                        "text": "花都大道炭步大涡东行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.227135",
                                            "Y": "23.477112"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000322",
                                        "text": "山前大道机场高速路段东行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.160439",
                                            "Y": "23.480526"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000323",
                                        "text": "花都大道机场东行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.025749",
                                            "Y": "23.498186"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000324",
                                        "text": "工业大道 大凌村公路西行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.033249",
                                            "Y": "23.491003"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000325",
                                        "text": "杨赤线马岭西行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.325874",
                                            "Y": "23.385498"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000326",
                                        "text": "芙蓉专用道南行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.210365",
                                            "Y": "23.479303"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000327",
                                        "text": "广花邮政中心北行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.179771",
                                            "Y": "23.487370"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000328",
                                        "text": "旧雅瑶桥北行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.302109",
                                            "Y": "23.439280"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000329",
                                        "text": "凤凰南路桥北行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.013107",
                                            "Y": "23.477470"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000330",
                                        "text": "山前大道原花城收费站东行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.207596",
                                            "Y": "23.431372"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000331",
                                        "text": "平步大道广清入口",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.069984",
                                            "Y": "23.394693"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000332",
                                        "text": "七星村公路北行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.075546",
                                            "Y": "23.444069"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000333",
                                        "text": "李溪村堤坝北行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.358643",
                                            "Y": "23.407209"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000334",
                                        "text": "宝华时代美居东行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.198402",
                                            "Y": "23.460190"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000335",
                                        "text": "北兴 京珠高速出口西行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.264236",
                                            "Y": "23.481764"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000336",
                                        "text": "禅炭路环山村北行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.055153",
                                            "Y": "23.382011"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000337",
                                        "text": "工业大道往大岭",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.272171",
                                            "Y": "23.433905"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000338",
                                        "text": "雅瑶中路与凤凰南路 东往西",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.057739",
                                            "Y": "23.385620"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000339",
                                        "text": "雅瑶中路与凤凰南路 西往东",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.003418",
                                            "Y": "23.427429"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000340",
                                        "text": "商业大道与凤凰路 南往北",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.349930",
                                            "Y": "23.403471"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000341",
                                        "text": "商业大道与凤凰路 西往东",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.083084",
                                            "Y": "23.385347"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000342",
                                        "text": "云山路与公元前 东往西",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.107300",
                                            "Y": "23.451845"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000343",
                                        "text": "云山路与公元前 西往东",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.155685",
                                            "Y": "23.417763"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000344",
                                        "text": "建设路与松园路 西往东",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.157234",
                                            "Y": "23.422960"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000345",
                                        "text": "Test",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.231873",
                                            "Y": "23.446566"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000346",
                                        "text": "G106白鳝塘北行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.127190",
                                            "Y": "23.495327"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000347",
                                        "text": "农新旱桥西行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.300369",
                                            "Y": "23.459091"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000348",
                                        "text": "广花新雅桥南行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.273727",
                                            "Y": "23.405806"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000349",
                                        "text": "106国道坪山北行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.266464",
                                            "Y": "23.393919"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000350",
                                        "text": "迎宾大道马鞍山南行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.359108",
                                            "Y": "23.406736"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000351",
                                        "text": "三东大道石岗东行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.362656",
                                            "Y": "23.396980"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000352",
                                        "text": "花都大道炭步大涡西行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.133667",
                                            "Y": "23.455391"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000353",
                                        "text": "山前大道原花城收费站西行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.082344",
                                            "Y": "23.464813"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000354",
                                        "text": "山前大道七星村东行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.303795",
                                            "Y": "23.413862"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000355",
                                        "text": "三东大道西岭东行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.281601",
                                            "Y": "23.418158"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000356",
                                        "text": "赤坭国泰村北行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.153748",
                                            "Y": "23.397844"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000357",
                                        "text": "山前大道狮岭东行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.344765",
                                            "Y": "23.381451"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000358",
                                        "text": "山前大道南航东行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.165894",
                                            "Y": "23.414303"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000359",
                                        "text": "迎宾大道清布南行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.074226",
                                            "Y": "23.445057"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000360",
                                        "text": "商业大道龙口收费站东行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.036263",
                                            "Y": "23.382177"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000361",
                                        "text": "商业大道龙口收费站西行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.055161",
                                            "Y": "23.494322"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000362",
                                        "text": "金钟路大布村北行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.177139",
                                            "Y": "23.437416"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000363",
                                        "text": "旧107商贸城北行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.357979",
                                            "Y": "23.404268"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000364",
                                        "text": "106国道梯面南行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.197052",
                                            "Y": "23.483879"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000365",
                                        "text": "106国道梯面北行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.341438",
                                            "Y": "23.456957"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000366",
                                        "text": "106国道花城路口南行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.252747",
                                            "Y": "23.434231"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000367",
                                        "text": "山前大道九子东行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.272308",
                                            "Y": "23.460402"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000368",
                                        "text": "花都大道墓园西行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.040703",
                                            "Y": "23.418674"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000369",
                                        "text": "杨赤线马岭东行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.363686",
                                            "Y": "23.488110"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000370",
                                        "text": "广清山前入口匝道",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.236549",
                                            "Y": "23.422205"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000371",
                                        "text": "平步大道海布西行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.227608",
                                            "Y": "23.435905"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000372",
                                        "text": "七星村公路南行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.013069",
                                            "Y": "23.400621"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000373",
                                        "text": "新华收费站 广清北行新华出口",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.312584",
                                            "Y": "23.441004"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000374",
                                        "text": "农新旱桥东行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.097313",
                                            "Y": "23.388487"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000375",
                                        "text": "建设北路杨屋北行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.306458",
                                            "Y": "23.425173"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000376",
                                        "text": "G106白鳝塘南行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.200523",
                                            "Y": "23.434912"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000377",
                                        "text": "金华路大夫祠北行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.167847",
                                            "Y": "23.381338"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000378",
                                        "text": "花岗大道卡口",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.222832",
                                            "Y": "23.480967"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000379",
                                        "text": "农新旱桥西行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.277664",
                                            "Y": "23.457758"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000380",
                                        "text": "广花新雅桥北行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.365807",
                                            "Y": "23.400728"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000381",
                                        "text": "山前大道狮岭西行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.337708",
                                            "Y": "23.416706"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000382",
                                        "text": "天贵路南行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.348198",
                                            "Y": "23.490683"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000383",
                                        "text": "三东大道新东西行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.038544",
                                            "Y": "23.490845"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000384",
                                        "text": "杨荷收费站西行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.313004",
                                            "Y": "23.473213"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000385",
                                        "text": "山前大道珊瑚东行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.108833",
                                            "Y": "23.399717"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000386",
                                        "text": "山前大道花东联安东行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.161926",
                                            "Y": "23.412340"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000387",
                                        "text": "山前大道七星村西行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.214417",
                                            "Y": "23.415077"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000388",
                                        "text": "三东大道西岭西行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.147766",
                                            "Y": "23.476042"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000389",
                                        "text": "金狮大道新扬西行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.097847",
                                            "Y": "23.445498"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000390",
                                        "text": "芙蓉大道东边北行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.086662",
                                            "Y": "23.401373"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000391",
                                        "text": "金钟路大布村南行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.147293",
                                            "Y": "23.460703"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000392",
                                        "text": "杨荷收费站东行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.314545",
                                            "Y": "23.407349"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000393",
                                        "text": "106国道花城路口北行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.101807",
                                            "Y": "23.481379"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000394",
                                        "text": "花都大道机场西行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.081421",
                                            "Y": "23.486750"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000395",
                                        "text": "旧107国道前进村南行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.137764",
                                            "Y": "23.472408"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000396",
                                        "text": "旧107国道前进村北行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.139427",
                                            "Y": "23.401665"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000397",
                                        "text": "花都大道洛场西行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.135445",
                                            "Y": "23.402552"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000398",
                                        "text": "花山入口",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.148720",
                                            "Y": "23.387897"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000399",
                                        "text": "建设北路杨屋南行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.304848",
                                            "Y": "23.381624"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000400",
                                        "text": "西二环炭步出口",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.235878",
                                            "Y": "23.459290"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000401",
                                        "text": "广清山前出口匝道",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.076958",
                                            "Y": "23.442020"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000402",
                                        "text": "工业大道往新华",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.053108",
                                            "Y": "23.482334"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000403",
                                        "text": "李溪村堤坝南行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.118721",
                                            "Y": "23.403986"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000404",
                                        "text": "农新桥广清匝道 北行入口",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.050743",
                                            "Y": "23.471930"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000405",
                                        "text": "广花东镜北行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.322495",
                                            "Y": "23.436651"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000406",
                                        "text": "商业大道与新华路 西往东",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.137192",
                                            "Y": "23.497326"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000407",
                                        "text": "雅瑶中路与凤凰南路 北往南",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.210510",
                                            "Y": "23.387465"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000408",
                                        "text": "商业大道与凤凰路 北往南",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.319588",
                                            "Y": "23.479681"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000409",
                                        "text": "东风大桥卡口",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.352158",
                                            "Y": "23.383232"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000410",
                                        "text": "杨赤线海布桥南行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.077568",
                                            "Y": "23.494566"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000411",
                                        "text": "金华路大夫祠南行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.351128",
                                            "Y": "23.453213"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000412",
                                        "text": "天贵路北行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.223618",
                                            "Y": "23.429386"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000413",
                                        "text": "建设北南菱北行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.036400",
                                            "Y": "23.429382"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000414",
                                        "text": "旧107商贸城南行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.155815",
                                            "Y": "23.381134"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000415",
                                        "text": "禅炭路环山村南行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.048828",
                                            "Y": "23.486416"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000416",
                                        "text": "山前大道九子西行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.145409",
                                            "Y": "23.488108"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000417",
                                        "text": "花都大道推广西行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.262512",
                                            "Y": "23.393764"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000418",
                                        "text": "芙蓉专用道北行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.158966",
                                            "Y": "23.473129"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000419",
                                        "text": "广花东镜南行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.341110",
                                            "Y": "23.468481"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000420",
                                        "text": "新华收费站 广清新华入口",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.226837",
                                            "Y": "23.477886"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000421",
                                        "text": "凤凰南路桥南行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.195305",
                                            "Y": "23.458481"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000422",
                                        "text": "平步大道南洲西行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.259972",
                                            "Y": "23.400183"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000423",
                                        "text": "花都大道京珠东行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.362030",
                                            "Y": "23.414661"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000424",
                                        "text": "山前大道花东联安西行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.140755",
                                            "Y": "23.439262"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000425",
                                        "text": "花都大道墓园东行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.054901",
                                            "Y": "23.423662"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000426",
                                        "text": "赤坭国泰村南行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.270927",
                                            "Y": "23.389647"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000427",
                                        "text": "工业大道 大凌村公路东行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.130585",
                                            "Y": "23.392748"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000428",
                                        "text": "新都大桥东行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.357300",
                                            "Y": "23.380850"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000429",
                                        "text": "云山路花果山东行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.367012",
                                            "Y": "23.460184"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000430",
                                        "text": "杨赤线海布桥北行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.331055",
                                            "Y": "23.468601"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000431",
                                        "text": "迎宾大道马鞍山北行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.309105",
                                            "Y": "23.428699"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000432",
                                        "text": "北兴莘田村南行",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.066811",
                                            "Y": "23.451111"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000433",
                                        "text": "测试",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.048058",
                                            "Y": "23.401051"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000434",
                                        "text": "测试2",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.006844",
                                            "Y": "23.449877"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000435",
                                        "text": "花城054_广清大道-广清入口",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.353210",
                                            "Y": "23.414177"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000436",
                                        "text": "北兴046_山前大道-杨荷石场",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.314117",
                                            "Y": "23.475836"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000437",
                                        "text": "北兴070_北兴村-北兴小学",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.168350",
                                            "Y": "23.435429"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000438",
                                        "text": "花侨049_吉星村-保安室",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.214142",
                                            "Y": "23.445175"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000439",
                                        "text": "花山046_两龙路-市政学院后门1",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.036537",
                                            "Y": "23.458632"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000440",
                                        "text": "花山085_G106线-中石化加油站2",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.262833",
                                            "Y": "23.481113"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000441",
                                        "text": "花山111_花山大道-43号1",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.031067",
                                            "Y": "23.451445"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000442",
                                        "text": "梯面017_五联村-村口",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.020393",
                                            "Y": "23.433924"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000443",
                                        "text": "梯面024_西坑村-丹竹坝",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.234123",
                                            "Y": "23.435188"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000444",
                                        "text": "TM034_G106线-民安社区",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.134445",
                                            "Y": "23.426474"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000445",
                                        "text": "炭步078_S118-民主村警务室",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.204308",
                                            "Y": "23.414732"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000446",
                                        "text": "炭步098_大涡文二村-治安队",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.050934",
                                            "Y": "23.390812"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000447",
                                        "text": "炭步101_平领头村-牌坊",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.027916",
                                            "Y": "23.474813"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000448",
                                        "text": "赤坭057_赤坭大道-中心花坛2",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.053894",
                                            "Y": "23.386658"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000449",
                                        "text": "赤坭088_山前大道-石坑村",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.115952",
                                            "Y": "23.389423"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000450",
                                        "text": "雅瑶082_岑东路-伍华超市2",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.054573",
                                            "Y": "23.398119"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000451",
                                        "text": "新雅042_ G106线-白鳝塘市场对面",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.136986",
                                            "Y": "23.467274"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000452",
                                        "text": "城东106_天贵路-新华路",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.062531",
                                            "Y": "23.442890"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000453",
                                        "text": "新东067_三东工业园-二横路",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.108528",
                                            "Y": "23.386612"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000454",
                                        "text": "城东162_建侨路-美雅直街",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.092621",
                                            "Y": "23.480701"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000455",
                                        "text": "芙蓉106_芙蓉度假区-龙王庙",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.012451",
                                            "Y": "23.390179"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000456",
                                        "text": "芙蓉118_芙源路-芙蓉大道",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.029678",
                                            "Y": "23.495745"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000457",
                                        "text": "秀全076_平步大道-大布村牌坊",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.282227",
                                            "Y": "23.442505"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000458",
                                        "text": "雅瑶086_雅瑶镇-中心幼儿园",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.290131",
                                            "Y": "23.442118"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000459",
                                        "text": "芙蓉083_新民路-专用道十字路口2",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.184525",
                                            "Y": "23.468922"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000460",
                                        "text": "02 农新桥广清匝道路段",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.185867",
                                            "Y": "23.491686"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000461",
                                        "text": "37 山前大道南航碧花园",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.219521",
                                            "Y": "23.424376"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000462",
                                        "text": "47 李溪堤坝",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.109718",
                                            "Y": "23.389755"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000463",
                                        "text": "测试",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.104660",
                                            "Y": "23.490587"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000464",
                                        "text": "新街大道与农新路交界",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.194679",
                                            "Y": "23.444033"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000465",
                                        "text": "S114线与培正大道路口",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.013985",
                                            "Y": "23.397060"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000466",
                                        "text": "s114与赤坭巴江大桥路口",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.256676",
                                            "Y": "23.394815"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000467",
                                        "text": "芙蓉大道-旗岭大街",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.261108",
                                            "Y": "23.453968"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000468",
                                        "text": "两龙村",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.024986",
                                            "Y": "23.486584"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000469",
                                        "text": "联民村",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.199402",
                                            "Y": "23.436142"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000470",
                                        "text": "鲤塘村",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.088356",
                                            "Y": "23.399921"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000471",
                                        "text": "田美村1",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.280182",
                                            "Y": "23.415529"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000472",
                                        "text": "106国道白鳝塘路段",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.142281",
                                            "Y": "23.424356"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000473",
                                        "text": "50 雅瑶路-黄冈中学",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.262520",
                                            "Y": "23.386145"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000474",
                                        "text": "07 商业大道龙口收费站路段",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.166931",
                                            "Y": "23.475925"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000475",
                                        "text": "19 云山大道花果山路段",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.141029",
                                            "Y": "23.468521"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000476",
                                        "text": "09 广乐高速花城收费站出入口",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.150314",
                                            "Y": "23.381350"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000477",
                                        "text": "站前070_四和村-和兴小学门口1",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.002296",
                                            "Y": "23.422699"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000478",
                                        "text": "站前098_工业大道-新街隧道1",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.138649",
                                            "Y": "23.407763"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000479",
                                        "text": "站前099_工业大道-新街隧道2",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.205780",
                                            "Y": "23.400827"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000480",
                                        "text": "合益169_狮岭大道-侨宏山庄",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.204292",
                                            "Y": "23.432913"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000481",
                                        "text": "狮岭219_康政路-狮岭中学",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.295303",
                                            "Y": "23.387949"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000482",
                                        "text": "狮岭249_阳光路-阳光宾馆",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.305115",
                                            "Y": "23.381577"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000483",
                                        "text": "42 工业大道华翠园（收废站旁）",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.098152",
                                            "Y": "23.384792"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000484",
                                        "text": "花侨045_花都大道-港头小学1",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.069992",
                                            "Y": "23.449036"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000485",
                                        "text": "花东060_桑梓道－珠湖村",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.169960",
                                            "Y": "23.474203"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000486",
                                        "text": "花东094_花都大道－金田工业区",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.039307",
                                            "Y": "23.418455"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000487",
                                        "text": "花东119_山下-木厂路口",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.295761",
                                            "Y": "23.472435"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000488",
                                        "text": "梯面036_旧G106线-部队旧门",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.318199",
                                            "Y": "23.439560"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000489",
                                        "text": "炭步056_东风路-75号",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.366028",
                                            "Y": "23.442230"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000490",
                                        "text": "炭步094_S118-石湖山村",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.108681",
                                            "Y": "23.450844"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000491",
                                        "text": "赤坭101_赤坭大道-长寿路2",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.290443",
                                            "Y": "23.421362"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000492",
                                        "text": "赤坭104_赤坭大道-赤坭小学",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.262108",
                                            "Y": "23.462372"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000493",
                                        "text": "秀全099_旧107-永发大道",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.311615",
                                            "Y": "23.463669"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000494",
                                        "text": "秀全107_荔红路-迎宾大道",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.191223",
                                            "Y": "23.380758"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000495",
                                        "text": "秀全125_东秀路-越保水泥厂",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.298317",
                                            "Y": "23.383387"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000496",
                                        "text": "秀全142_岐山村-德润工业区",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.344673",
                                            "Y": "23.403563"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000497",
                                        "text": "站前169_秀全公园-花城路",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.123093",
                                            "Y": "23.407295"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000498",
                                        "text": "新东055_凤凰路-锦尚名苑",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.311646",
                                            "Y": "23.396893"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000499",
                                        "text": "城东172_龙珠路-实又多",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.267128",
                                            "Y": "23.481483"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000500",
                                        "text": "新东101_兰花路-新都花园南门",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.070404",
                                            "Y": "23.392700"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000501",
                                        "text": "CD154_昊星网吧",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.043228",
                                            "Y": "23.488516"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000502",
                                        "text": "新东133_大华一路-文苑小区",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.245895",
                                            "Y": "23.459539"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000503",
                                        "text": "芙蓉112_芙滨路-薇北路",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.071304",
                                            "Y": "23.403858"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000504",
                                        "text": "秀全084_九塘西路-九塘市场",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.292946",
                                            "Y": "23.486343"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000505",
                                        "text": "花山063 _二合线-和郁村",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.114319",
                                            "Y": "23.484539"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000506",
                                        "text": "测试2",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.125412",
                                            "Y": "23.470350"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000507",
                                        "text": "天贵路与龙珠路口",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.243111",
                                            "Y": "23.404255"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000508",
                                        "text": "云山路与茶园路口",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.017044",
                                            "Y": "23.490307"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000509",
                                        "text": "S114线与山前大道路口",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.336624",
                                            "Y": "23.403194"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000510",
                                        "text": "杨赤线-皮革城",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.258278",
                                            "Y": "23.410576"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000511",
                                        "text": "天贵路-紫薇路",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.278946",
                                            "Y": "23.442581"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000512",
                                        "text": "东莞村",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.137779",
                                            "Y": "23.472033"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000513",
                                        "text": "平西村",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.322861",
                                            "Y": "23.487812"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000514",
                                        "text": "06 迎宾大道清布桥路段",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.289093",
                                            "Y": "23.396624"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000515",
                                        "text": "35 山前大道原花城收费站路段",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.048271",
                                            "Y": "23.435678"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000516",
                                        "text": "20 迎宾大道马鞍山路段",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.195251",
                                            "Y": "23.390028"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000517",
                                        "text": "31 西二环炭步茶塘村路段",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.362282",
                                            "Y": "23.393667"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000518",
                                        "text": "26 106国道梯面联民村路口",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.067719",
                                            "Y": "23.474138"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000519",
                                        "text": "51 杨赤线马岭路口路段",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.116371",
                                            "Y": "23.383539"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000520",
                                        "text": "合益156_安达路-安达纸品厂",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.213318",
                                            "Y": "23.445818"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000521",
                                        "text": "狮岭141_振兴路-海鸥皮具厂",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.068497",
                                            "Y": "23.414421"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000522",
                                        "text": "04 新雅大桥路段",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.348366",
                                            "Y": "23.465931"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000523",
                                        "text": "23 机场高速北兴出入口",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.114906",
                                            "Y": "23.418530"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000524",
                                        "text": "建设路-宝华路",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.033691",
                                            "Y": "23.422424"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000525",
                                        "text": "云山大道-建设路",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.304527",
                                            "Y": "23.448055"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000526",
                                        "text": "杨三村",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.142311",
                                            "Y": "23.490833"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000527",
                                        "text": "民主村",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.280617",
                                            "Y": "23.387701"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000528",
                                        "text": "联安村",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.072708",
                                            "Y": "23.425089"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000529",
                                        "text": "43 花都大道推广圩联安村路口路段",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.355049",
                                            "Y": "23.480505"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000530",
                                        "text": "25 106国道白鳝塘路段",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.075676",
                                            "Y": "23.446287"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000531",
                                        "text": "44 花都大道花侨加油站路段",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.035645",
                                            "Y": "23.479773"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000532",
                                        "text": "站前071_四和村-和兴小学门口2",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.316147",
                                            "Y": "23.385677"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000533",
                                        "text": "芙蓉095_山前大道-新扬十三队路口",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.083649",
                                            "Y": "23.406195"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000534",
                                        "text": "花城067_杨赤线-杨屋中心市场1",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.041542",
                                            "Y": "23.422840"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000535",
                                        "text": "合益152_宝峰路-光明厂",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.092262",
                                            "Y": "23.401325"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000536",
                                        "text": "狮岭191_山前大道-盘古路",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.171959",
                                            "Y": "23.435736"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000537",
                                        "text": "54 山前大道瑞边村",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.163597",
                                            "Y": "23.469004"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000538",
                                        "text": "01 新华收费站路段",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.226768",
                                            "Y": "23.389477"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000539",
                                        "text": "测试",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.215164",
                                            "Y": "23.432438"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000540",
                                        "text": "天贵路-迎宾大道",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.291130",
                                            "Y": "23.465418"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000541",
                                        "text": "茶园路-迎宾大道",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.304596",
                                            "Y": "23.381113"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000542",
                                        "text": "公益路-龙珠路",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.338425",
                                            "Y": "23.433065"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000543",
                                        "text": "新街大道-望亭路口",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.185768",
                                            "Y": "23.463747"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000544",
                                        "text": "杨二村",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.141151",
                                            "Y": "23.381544"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000545",
                                        "text": "吉星村",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.311928",
                                            "Y": "23.479126"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000546",
                                        "text": "联丰村",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.343590",
                                            "Y": "23.450033"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000547",
                                        "text": "45 梯面王子山横坑村X404路段",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.305267",
                                            "Y": "23.400309"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000548",
                                        "text": "52 芙蓉专用道横坑路段",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.194763",
                                            "Y": "23.448750"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000549",
                                        "text": "四和村-和兴小学门口1",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.231659",
                                            "Y": "23.454224"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000550",
                                        "text": "花城061_建设北路-杨赤线",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.274918",
                                            "Y": "23.474216"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000551",
                                        "text": "花城062_长岗旧路-农校门口",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.324997",
                                            "Y": "23.495573"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000552",
                                        "text": "合益158_南航花园-侧门1",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.251022",
                                            "Y": "23.434813"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000553",
                                        "text": "狮岭137_山前大道-马岭路",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.206047",
                                            "Y": "23.423832"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000554",
                                        "text": "狮岭189_振兴路-振兴凉亭",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.150871",
                                            "Y": "23.458668"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000555",
                                        "text": "狮岭237_山前大道-广清桥底1",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.198097",
                                            "Y": "23.417917"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000556",
                                        "text": "狮岭250_雄狮路-杨赤线",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.302238",
                                            "Y": "23.414362"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000557",
                                        "text": "北兴048_山前大道-九龙湖门口2",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.141296",
                                            "Y": "23.456312"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000558",
                                        "text": "北兴049_山前大道-四联路口",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.357635",
                                            "Y": "23.458483"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000559",
                                        "text": "北兴051_花都大道-金色童年幼儿园2",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.253067",
                                            "Y": "23.482414"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000560",
                                        "text": "北兴055_北钟公路-莘田牌坊1",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.261200",
                                            "Y": "23.429749"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000561",
                                        "text": "花侨043_花都大道-美食山庄1",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.124550",
                                            "Y": "23.386213"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000562",
                                        "text": "花侨052_李溪河绿道-港头村",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.074783",
                                            "Y": "23.479033"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000563",
                                        "text": "花东101_花都大道－志力砖厂",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.249229",
                                            "Y": "23.483990"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000564",
                                        "text": "花东109_李溪拦河坝－办公楼1",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.245850",
                                            "Y": "23.433746"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000565",
                                        "text": "花山077_洛场村-医药学校北门",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.316124",
                                            "Y": "23.457006"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000566",
                                        "text": "炭步084_花都大道-皮带廊",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.230370",
                                            "Y": "23.384220"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000567",
                                        "text": "赤坭081_赤坭大道-古树大道2",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.165077",
                                            "Y": "23.386751"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000568",
                                        "text": "秀全128_平步大道-广杨庄路口",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.095047",
                                            "Y": "23.483391"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000569",
                                        "text": "仲华路-旧村门楼",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.358551",
                                            "Y": "23.456230"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000570",
                                        "text": "雅瑶084_旧广花-芙蓉百货超市",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.023468",
                                            "Y": "23.448481"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000571",
                                        "text": "新雅041_G106线-团结村路口",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.093346",
                                            "Y": "23.391842"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000572",
                                        "text": "新雅054_迎宾大道-青莲路",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.160370",
                                            "Y": "23.497675"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000573",
                                        "text": "城西161_公园前路—华润万家2",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.226120",
                                            "Y": "23.404871"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000574",
                                        "text": "新东060_凤凰北路-三东工业园",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.333992",
                                            "Y": "23.463905"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000575",
                                        "text": "城东118_新花街-技工学校",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.030548",
                                            "Y": "23.462263"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000576",
                                        "text": "新东074_三东村-三社九队9号",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.013260",
                                            "Y": "23.473953"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000577",
                                        "text": "CD097_商业大道106号",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.227356",
                                            "Y": "23.448395"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000578",
                                        "text": "新东085_迎宾大道-大华二路",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.110115",
                                            "Y": "23.460522"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000579",
                                        "text": "城东140_云山大道-百富雅苑西侧",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.074722",
                                            "Y": "23.428173"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000580",
                                        "text": "新东090_凤凰北路-团结村",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.096252",
                                            "Y": "23.478849"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000581",
                                        "text": "新东099_兰花路-紫薇花园南门",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.148270",
                                            "Y": "23.451086"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000582",
                                        "text": "新东100_桂花路-迎宾路",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.013527",
                                            "Y": "23.462919"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000583",
                                        "text": "新东114_梅花路-玫瑰路",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.172318",
                                            "Y": "23.489832"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000584",
                                        "text": "芙蓉105_芙滨路-车站丁字路口",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.229630",
                                            "Y": "23.389013"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000585",
                                        "text": "芙蓉115_芙蓉度假村-大门口",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.365738",
                                            "Y": "23.478605"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000586",
                                        "text": "ZQX12-ZG",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.211441",
                                            "Y": "23.450523"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000587",
                                        "text": "梯面034_G106线-民安社区",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.154015",
                                            "Y": "23.437805"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000588",
                                        "text": "城东170_公益路-伍华超市",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.072365",
                                            "Y": "23.455605"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000589",
                                        "text": "G106线两龙市场路口",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.069244",
                                            "Y": "23.425318"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000590",
                                        "text": "宝华路与茶园路口",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.202141",
                                            "Y": "23.411524"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000591",
                                        "text": "花城路与秀全大道交界",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.189774",
                                            "Y": "23.461315"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000592",
                                        "text": "G106线与迎宾路交叉口",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.166862",
                                            "Y": "23.383408"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000593",
                                        "text": "云山路与花城路口",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.213745",
                                            "Y": "23.463703"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000594",
                                        "text": "测试",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.247826",
                                            "Y": "23.442041"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000595",
                                        "text": "G106线-X283线",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.085396",
                                            "Y": "23.455507"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000596",
                                        "text": "建设路-迎宾大道",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.272629",
                                            "Y": "23.431461"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000597",
                                        "text": "27 山前大道广清出入口路段",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.242386",
                                            "Y": "23.415777"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000598",
                                        "text": "46 旧107狮岭前进村路段",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.058174",
                                            "Y": "23.442369"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000599",
                                        "text": "合益153_民容路-安王手袋厂新区",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.034500",
                                            "Y": "23.442360"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000600",
                                        "text": "合益167_雄狮东路-阳光路",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.066414",
                                            "Y": "23.467186"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000601",
                                        "text": "合益171_联合路-六群2队",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.233101",
                                            "Y": "23.496685"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000602",
                                        "text": "花侨021_S118线-现代大道2",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.122307",
                                            "Y": "23.477354"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000603",
                                        "text": "花侨030_侨南苑-西侧路",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.203613",
                                            "Y": "23.381073"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000604",
                                        "text": "花东082_花东镇-联安大道",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.310318",
                                            "Y": "23.495977"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000605",
                                        "text": "花山039_两龙南街-华辉路",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.243134",
                                            "Y": "23.435425"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000606",
                                        "text": "花山060_花山大道-43号2",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.099014",
                                            "Y": "23.448198"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000607",
                                        "text": "梯面043_沿河路-彩虹路",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.144363",
                                            "Y": "23.415804"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000608",
                                        "text": "赤坭075_赤坭大道-新工业园",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.364647",
                                            "Y": "23.454128"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000609",
                                        "text": "赤坭091_培正大道-人行天桥底",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.212120",
                                            "Y": "23.489944"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000610",
                                        "text": "城西183_三华村-隧道口",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.190498",
                                            "Y": "23.445860"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000611",
                                        "text": "新雅051_广塘村-高速桥底垃圾站",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.108795",
                                            "Y": "23.415613"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000612",
                                        "text": "新雅085_迎宾路-清布中学",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.147034",
                                            "Y": "23.483080"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000613",
                                        "text": "城西113_公园前路—宝华路",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.109238",
                                            "Y": "23.457830"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000614",
                                        "text": "芙蓉110_芙蓉度假区-漂流丁字路口",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.054733",
                                            "Y": "23.383909"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000615",
                                        "text": "公益路-紫薇路",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.333778",
                                            "Y": "23.385557"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000616",
                                        "text": "车城路-花港大道",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.352783",
                                            "Y": "23.428690"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000617",
                                        "text": "九潭村",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.292633",
                                            "Y": "23.411901"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000618",
                                        "text": "东镜村",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.364990",
                                            "Y": "23.414331"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000619",
                                        "text": "振兴村",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.252678",
                                            "Y": "23.457472"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000620",
                                        "text": "莲塘村",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.295715",
                                            "Y": "23.467842"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000621",
                                        "text": "47 李溪拦河坝",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.307114",
                                            "Y": "23.489429"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000622",
                                        "text": "田美村2",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.264168",
                                            "Y": "23.426605"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000623",
                                        "text": "32 花都大道炭步大涡村路段",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.157715",
                                            "Y": "23.396294"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000624",
                                        "text": "16 金钟路大布村路段",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.113747",
                                            "Y": "23.466770"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000625",
                                        "text": "55 杨赤线秀全水库海布桥路段",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.032158",
                                            "Y": "23.393076"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000626",
                                        "text": "56 广乐高速梯面收费站出入口",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.124794",
                                            "Y": "23.494059"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000627",
                                        "text": "芙蓉057_育才路-芙蓉专道1",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.346451",
                                            "Y": "23.468815"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000628",
                                        "text": "花城047_平步大道-罗仙村",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.116867",
                                            "Y": "23.496286"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000629",
                                        "text": "合益170_金狮大道-团结路",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.213135",
                                            "Y": "23.407419"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000630",
                                        "text": "狮岭151_盘古路-振兴第二小学",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.143501",
                                            "Y": "23.458776"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000631",
                                        "text": "狮岭168_培正路-利和路",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.293579",
                                            "Y": "23.433537"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000632",
                                        "text": "狮岭212_雄狮中路-74号",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.348869",
                                            "Y": "23.499077"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000633",
                                        "text": "狮岭216_东升中路-邮局",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.284439",
                                            "Y": "23.409180"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000634",
                                        "text": "狮岭232_利达路-金狮房地产",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.264381",
                                            "Y": "23.444763"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000635",
                                        "text": "狮岭234_盘古路-34号",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.344742",
                                            "Y": "23.382015"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000636",
                                        "text": "狮岭238_山前大道-广清桥底2",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.062462",
                                            "Y": "23.475317"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000637",
                                        "text": "狮岭257_金狮大道-前进村",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.293770",
                                            "Y": "23.482792"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000638",
                                        "text": "北兴085_红荔路-京珠高速",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.122322",
                                            "Y": "23.452078"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000639",
                                        "text": "花侨023_李溪河绿道-花侨水厂1",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.137901",
                                            "Y": "23.394661"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000640",
                                        "text": "花山054_布岗村-七队",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.260628",
                                            "Y": "23.406874"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000641",
                                        "text": "HS063_和郁村-二合线",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.261780",
                                            "Y": "23.496962"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000642",
                                        "text": "梯面016_G106线-五联村",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.097679",
                                            "Y": "23.402073"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000643",
                                        "text": "梯面025_X404线-清远交界",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.117737",
                                            "Y": "23.416121"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000644",
                                        "text": "梯面028_G106线-联民饭店",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.098877",
                                            "Y": "23.469290"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000645",
                                        "text": "炭步068_陆仕路-社岗村三岔路口",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.285362",
                                            "Y": "23.451820"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000646",
                                        "text": "炭步085_S267-劳教所",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.304192",
                                            "Y": "23.391497"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000647",
                                        "text": "雅瑶072_雅源路-雅神中路",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.077988",
                                            "Y": "23.471325"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000648",
                                        "text": "雅瑶083_广花路-岑镜油站",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.046875",
                                            "Y": "23.389187"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000649",
                                        "text": "雅瑶103_雅瑶中学-英才路",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.115143",
                                            "Y": "23.463232"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000650",
                                        "text": "城西094_大华路与迎宾大道",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.122513",
                                            "Y": "23.435192"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000651",
                                        "text": "城西101_大华二路—城市卫生所",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.203056",
                                            "Y": "23.406410"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000652",
                                        "text": "城东211_商业大道-红卫桥侧",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.091644",
                                            "Y": "23.488716"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000653",
                                        "text": "城西106_建设北路-真城地产",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.201416",
                                            "Y": "23.453251"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000654",
                                        "text": "城西160_云山路-33号2",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.053764",
                                            "Y": "23.495602"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000655",
                                        "text": "城东196_新花街-商业大道",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.354195",
                                            "Y": "23.390532"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000656",
                                        "text": "城西176_宝华路—宝华隧道",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.227386",
                                            "Y": "23.461466"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000657",
                                        "text": "城东113_红珠路-天贵路",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.228439",
                                            "Y": "23.386986"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000658",
                                        "text": "迎宾大道-红棉路口",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.273552",
                                            "Y": "23.434397"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000659",
                                        "text": "迎宾大道-凤凰路口",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.094994",
                                            "Y": "23.415174"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000660",
                                        "text": "三东大道-凤凰路口",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.129097",
                                            "Y": "23.445772"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000661",
                                        "text": "风神大道-花港大道",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.363853",
                                            "Y": "23.436022"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000662",
                                        "text": "建设路-秀全大道",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.367363",
                                            "Y": "23.477488"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000663",
                                        "text": "三东大道-建设北路",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.017883",
                                            "Y": "23.496904"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000664",
                                        "text": "公益路-迎宾大道",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.017746",
                                            "Y": "23.461647"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000665",
                                        "text": "G106线-X404线",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.058556",
                                            "Y": "23.477316"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000666",
                                        "text": "雄狮中路-阳光路",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.132240",
                                            "Y": "23.459236"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000667",
                                        "text": "测试",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.236130",
                                            "Y": "23.387598"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000668",
                                        "text": "广塘村",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.135300",
                                            "Y": "23.436518"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000669",
                                        "text": "旗新村",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.312607",
                                            "Y": "23.453917"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000670",
                                        "text": "瑞岭村",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.168098",
                                            "Y": "23.465216"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000671",
                                        "text": "大华村",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.355644",
                                            "Y": "23.443039"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011140021321000672",
                                        "text": "大华村",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.355644",
                                            "Y": "23.443039"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011400021321000001",
                                        "text": "三东大道小布村西岭路段",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.042549",
                                            "Y": "23.424534"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011400021321000002",
                                        "text": "三东大道石岗村",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.148232",
                                            "Y": "23.447233"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011400021321000003",
                                        "text": "花都大道新华墓园路段",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.049355",
                                            "Y": "23.462591"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011400021321000004",
                                        "text": "凤凰南路桥段",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.081863",
                                            "Y": "23.441271"
                                        },
                                        "checkstate": 0
                                    },
                                    {
                                        "isParent": true,
                                        "hasChildren": false,
                                        "id": "44011400021321000005",
                                        "text": "三东大道新东所天桥",
                                        "showtitles": true,
                                        "showcheck": true,
                                        "showpassport": true,
                                        "value": {
                                            "X": "113.061920",
                                            "Y": "23.485529"
                                        },
                                        "checkstate": 0
                                    }
                                ],
                                "isParent": true,
                                "hasChildren": true,
                                "id": "4401140101",
                                "text": "站前路21号",
                                "showtitles": true,
                                "showcheck": true,
                                "value": {
                                    "ID": 2,
                                    "TYPE": "COMMUNITY"
                                },
                                "checkstate": 0
                            }
                        ],
                        "isParent": true,
                        "hasChildren": true,
                        "id": "44011401",
                        "text": "站前路刑侦大队",
                        "showtitles": true,
                        "showcheck": true,
                        "value": {
                            "ID": 6,
                            "TYPE": "STRUCTURE"
                        },
                        "checkstate": 0
                    }
                ],
                "isParent": true,
                "hasChildren": true,
                "id": "440114",
                "text": "花都区",
                "showtitles": true,
                "showcheck": true,
                "value": {
                    "ID": 5,
                    "TYPE": "STRUCTURE"
                },
                "checkstate": 0
            }
        ],
        "isParent": true,
        "hasChildren": true,
        "id": "4401",
        "text": "广州市",
        "showtitles": true,
        "showcheck": true,
        "value": {
            "ID": 2,
            "TYPE": "STRUCTURE"
        },
        "checkstate": 0
    },
    {
        "ChildNodes": [],
        "isParent": true,
        "hasChildren": true,
        "id": "4403",
        "text": "深圳市",
        "showtitles": true,
        "showcheck": true,
        "value": {
            "ID": 15,
            "TYPE": "STRUCTURE"
        },
        "checkstate": 0
    },
    {
        "ChildNodes": [
            {
                "ChildNodes": [],
                "isParent": true,
                "hasChildren": true,
                "id": "441501",
                "text": "市辖区",
                "showtitles": true,
                "showcheck": true,
                "value": {
                    "ID": 8,
                    "TYPE": "STRUCTURE"
                },
                "checkstate": 0
            },
            {
                "ChildNodes": [],
                "isParent": true,
                "hasChildren": true,
                "id": "441502",
                "text": "城区",
                "showtitles": true,
                "showcheck": true,
                "value": {
                    "ID": 9,
                    "TYPE": "STRUCTURE"
                },
                "checkstate": 0
            },
            {
                "ChildNodes": [],
                "isParent": true,
                "hasChildren": true,
                "id": "441521",
                "text": "海丰县",
                "showtitles": true,
                "showcheck": true,
                "value": {
                    "ID": 10,
                    "TYPE": "STRUCTURE"
                },
                "checkstate": 0
            },
            {
                "ChildNodes": [],
                "isParent": true,
                "hasChildren": true,
                "id": "441523",
                "text": "陆河县",
                "showtitles": true,
                "showcheck": true,
                "value": {
                    "ID": 11,
                    "TYPE": "STRUCTURE"
                },
                "checkstate": 0
            },
            {
                "ChildNodes": [],
                "isParent": true,
                "hasChildren": true,
                "id": "441581",
                "text": "陆丰市",
                "showtitles": true,
                "showcheck": true,
                "value": {
                    "ID": 12,
                    "TYPE": "STRUCTURE"
                },
                "checkstate": 0
            }
        ],
        "isParent": true,
        "hasChildren": true,
        "id": "4415",
        "text": "汕尾市",
        "showtitles": true,
        "showcheck": true,
        "value": {
            "ID": 7,
            "TYPE": "STRUCTURE"
        },
        "checkstate": 0
    }
],
"isParent": true,
"hasChildren": true,
"id": "44",
"text": "广东省",
"showtitles": true,
"showcheck": true,
"value": {
    "ID": 1,
    "TYPE": "STRUCTURE"
},
"checkstate": 0
}]
);