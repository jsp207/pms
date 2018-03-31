/**
 * Created by 박상만 on 2017-05-12.
 */

var express = require('express');
var router = express.Router();
var groupArray = require('group-array');

var openProjectDB = require("../service/openProjectDB");
var openProjectChart = require("../service/openProjectChart");
var mcache = require('memory-cache');

var Node = require("tree-node");
var Tree = require("node-tree-data");

var minCacheTime =3600;
var hourCacheTime =minCacheTime*60;
var dayCacheTime = hourCacheTime * 24;
var weekCacheTime = dayCacheTime * 7;


var cache = (duration) => {
    return (req, res, next) => {
        let key = '__express__' + req.originalUrl || req.url
        let cachedBody = mcache.get(key)
        if (cachedBody) {
            res.send(cachedBody)
            return
        } else {
            res.sendResponse = res.send
            res.send = (body) => {
                mcache.put(key, body, duration * 1000);
                res.sendResponse(body)
            }
            next()
        }
    }
}

/**
 * @api {get} /api/report/menu 프로젝트정보(Menu)
 * @apiGroup Util
 * @apiSuccess {Object[]} rootmenu 메뉴 리스트
 * @apiSuccess {Object[]} rootmenu.info 프로젝트정보
 * @apiSuccess {Number} rootmenu.info.id 프로젝트 ID
 * @apiSuccess {String} rootmenu.info.name 프로젝트 이름
 * @apiSuccess {Boolean} rootmenu.info.is_public 공개 프로젝트 여부
 * @apiSuccess {Date} rootmenu.info.created_on 프로젝트 생성날짜
 * @apiSuccess {Date} rootmenu.info.updated_on 프로젝트 종료날짜
 * @apiSuccess {Object[]} rootmenu.info.subMenuList 하위 프로젝트 리스트
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *    [{
 *          "rootmenu":[
 *              {"info":{
 *                  "id":2,
 *                  "name":"2 프로젝트",
 *                  "description":"인터파크투어 모든 프로젝트를 관리 합니다.\r\n※ 투어 내 모든 프로젝트를 타임라인에서 확인 하시기 바랍니다.\r\n",
 *                  "is_public":0,
 *                  "parent_id":null,
 *                  "created_on":"2016-11-06T23:16:14.000Z",
 *                  "updated_on":"2017-04-13T02:29:07.000Z",
 *                  "identifier":"project-all",
 *                  "status":1,
 *                  "lft":27,
 *                  "rgt":154,
 *                  "project_type_id":2,
 *                  "responsible_id":-1,
 *                  "work_packages_responsible_id":null},
 *                  "subMenuList":[{
 *                      "info":{"id":4,
 *                              "name":"2-3. 국내항공",
 *                              "description":"인터파크투어 프로젝트 > 국내항공 프로젝트 입니다.\r\n※ 국내항공 프로젝트 공지사항을 작성하시기 바랍니다.",
 *                              "is_public":0,"parent_id":2,
 *                              "created_on":"2016-11-07T21:26:12.000Z","updated_on":"2017-01-06T00:26:23.000Z","identifier":"project-flight-domestic","status":1,"lft":72,"rgt":77,"project_type_id":2,"responsible_id":-1,"work_packages_responsible_id":null},
 *                              "subMenuList":[{
 *                                  "info":{"id":121,
 *                                          "name":"중단기 프로젝트_국내항공",
 *                                          "description":"* 프로젝트 시작일 : \r\n* 프로젝트 종료일 : \r\n","is_public":0,"parent_id":4,"created_on":"2017-02-16T20:55:45.000Z","updated_on":"2017-04-13T03:06:57.000Z","identifier":"short2","status":1,
 *                   ///이하 생략
 *    }]
 * @apiErrorExample {json} List error
 *    HTTP/1.1 500 Internal Server Error
 */

router.get('/menu',function (req, res, next) {

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-type","application/json");


    openProjectChart.GetProjectInfoDB( null ,function (prjInfo) {
        var menuTreeModel = [];
        if(!prjInfo.errMsg){
            menuTreeModel = openProjectChart.GetMenuTree(prjInfo,0).menuTreeModel;
            console.log(menuTreeModel);
            //res.render("report/index",{ rootmenu : menuTreeModel,filterroot:0} );
            res.send({rootmenu : menuTreeModel,filterroot:0});

        }else{
            res.render('error',{message:resultData.errorMsg , error:{status:"",stack:""}});
        }
    });
});

/**
 * @api {get} /api/report/dep1/projectCount 프로젝트 등록 개수 변화량
 * @apiGroup ReportDepth1
 * @apiSuccess {Object[]} headercols 헤더정보
 * @apiSuccess {Object[]} items 아이템
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *    [{
 *          "headercols":[201701,201702,201703,201704,201705,201706,201707,201708,201709,201710,201711,201712],
 *          "items":
 *              [
 *                  {"name":"R플랫폼","data":[0,1,1,1,1,1,1,1,1,1,1,1],"totalCnt":2 },
 *                  {"name":"해외항공,홀세일","data":[1,1,3,0,0,0,0,0,0,0,0,0],"totalCnt":5 },
 *                  {"name":"해외항공, 홀세일","data":[2,3,3,5,6,6,6,6,6,6,6,6] ,"totalCnt":8 },
*                   .. 이하생략 ( 2-0. 와같은 프로젝트 넘버링 문자열을 API에서 자릅니다.
 *              ],
 *          "info":{"NewCountCurMonth":1,"TotalInprogressCount":46,"TotalClosecount":17}
 *    }]
 * @apiErrorExample {json} List error
 *    HTTP/1.1 500 Internal Server Error
 */

router.get('/dep1/projectCount',cache(dayCacheTime) ,function(req, res, next) {
    var isSendError = false;
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-type","application/json");
    var nowData = new Date();
    var nowYear = nowData.getFullYear();
    var nowMonth = nowData.getMonth() + 1;

    var reportDataResult = { headercols:[],items:[],info:{} };
    var reportData ={};

    var NewCountCurMonth=0;
    var TotalClosecount=0;
    var TotalInprogressCount=0;



    //createHeader
    for(var month=0 ; month<nowMonth;month++){
        reportDataResult.headercols.push( nowYear*100 + (month+1) );
    }


    //기본 프로젝트 정보 생성...
    var createBaseProjectInfo = function (dataArray) {
        for (var key in dataArray) {
            if (dataArray.hasOwnProperty(key)) {
                for(var idx=0;idx<dataArray[key].length;idx++){
                    var curData = dataArray[key][idx];
                    var prjName = curData.Dep2_name;
                    reportData[prjName] = { nowYear:[],totalCnt:0 }
                    for(var month=0 ; month<nowMonth;month++){
                        reportData[prjName].nowYear.push(0);
                    }
                }
            }
        }

        for (var key in dataArray) {
            for(var idx=0;idx<dataArray[key].length;idx++){
                var curData = dataArray[key][idx];
                var prjName = curData.Dep2_name;
                updateProjectcount(prjName,curData.count,Number(curData.dateGroup),true );
            }
        }
    }

    var updateProjectcount = function (prjName,cnt,updateDateInt,isCreate) {

        if(isCreate){
            reportData[prjName].totalCnt = reportData[prjName].totalCnt + cnt;
        }

        if(updateDateInt< nowYear*100+1){
            return;
        }

        if( reportData.hasOwnProperty(prjName) ){
            for(var idx=0 ; idx<12 ; idx++  ){
                var month = idx+1;

                if(nowMonth < month)
                    continue;

                var dateInt = nowYear*100 + month;

                if(  Number(updateDateInt) == Number(dateInt) ){
                    console.log( prjName + " " + dateInt + "  , " + updateDateInt + ' ' , cnt);
                    //reportData[prjName].nowYear[idx] += cnt;

                    if(isCreate){
                        if(nowMonth==month)
                            NewCountCurMonth+=cnt;

                        TotalInprogressCount+=cnt;
                        reportData[prjName].nowYear[idx] = cnt;
                    }
                    else{
                        TotalClosecount+=cnt;
                    }

                }
            }
        }
    }


    openProjectChart.GetProjectTimeLine_Create_Dep1( function (resultDataA) {
        if(!resultDataA.errMsg){
            var prjCreate = groupArray(resultDataA.result, 'dateGroup');
            var baseInfo = createBaseProjectInfo(prjCreate);


            openProjectChart.GetProjectTimeLine_Close_Dep1(function (resultDataB) {
                var prjClose = groupArray(resultDataB.result, 'dateGroup');
                for (var key in prjClose) {
                    for(var idx=0;idx<prjClose[key].length;idx++){
                        var curData = prjClose[key][idx];
                        var prjName = curData.Dep2_name;

                        updateProjectcount(prjName, curData.count , Number(curData.dateGroup),false );

                    }
                }

                for (var key in reportData) {
                    var curData = reportData[key];
                    reportDataResult.items.push({ name:key,data:curData.nowYear,totalCnt:curData.totalCnt });

                    var deltaAmount = 0;
                    for(var idx =0 ; idx < curData.nowYear.length ; idx++ ){

                        if(idx == (curData.nowYear.length-2) ){

                        }else if(idx == (curData.nowYear.length-1) ){
                            //TotalInprogressCount+=curData.nowYear[idx];
                            deltaAmount = curData.nowYear[idx] - curData.nowYear[idx-1];
                            //if(deltaAmount>0)
                                //NewCountCurMonth = deltaAmount;
                        }
                    }
                }

                reportDataResult.info = {NewCountCurMonth:NewCountCurMonth,TotalInprogressCount:TotalInprogressCount,TotalClosecount:TotalClosecount};

                res.send( reportDataResult );
            });
        }else{
            res.render('error',{message:resultDataA.errorMsg , error:{status:"",stack:""}});
        }
    });
});



/**
 * @api {get} /api/report/dep1/operatorState/:id 프로젝트 운영 상태 현황
 * @apiGroup ReportDepth1
 * @apiParam {Number} id 상위 프로젝트 ID
 * @apiSuccess {Object[]} headercols 헤더정보
 * @apiSuccess {Object[]} items 아이템
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *    [{
 *            "headercols":["InprogressCount","CompletedCount","NewRequestCount","PendingCount"],
 *            "items":
 *            [
 *                  {"name":"2-3. 국내항공","InprogressCount":48,"CompletedCount":0,"TotalCount":49,"NewRequestCount":0,"PendingCount":1},
 *                  {"name":"2-4. 해외호텔","InprogressCount":123,"CompletedCount":0,"TotalCount":124,"NewRequestCount":0,"PendingCount":1},
 *                  {"name":"2-6. 해외여행","InprogressCount":28,"CompletedCount":0,"TotalCount":28,"NewRequestCount":0,"PendingCount":0},
 *                  {"name":"2-2. 해외항공, 홀세일","InprogressCount":185,"CompletedCount":0,"TotalCount":188,"NewRequestCount":1,"PendingCount":2},
 *                  ...생략
 *            }
 *    }]
 * @apiErrorExample {json} List error
 *    HTTP/1.1 500 Internal Server Error
 */

router.get('/dep1/operatorState/:prjID',cache(dayCacheTime) ,function(req, res, next) {
    var isSendError = false;
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-type","application/json");

    if(!req.params.prjID){
        res.render('error',{message:'Need Param ProjectID'});
    }else{
        var projectName = openProjectChart.projectInfoList[ req.params.prjID ].name;
        //Todo: Remove Hard Code ( 프로젝트인지 업무요청인지 구분... )
        if( !(projectName.indexOf("2 프로젝트") > -1) ){
            res.render('error',{message:"" , error:{status:"",stack:""}});
            return;
        }

        openProjectChart.GetProjectInfoDB(req.params.prjID ,function (prjInfo) {
            if(!prjInfo.errMsg){
                var menuTreeModel = [];
                openProjectChart.GetOperatorState(prjInfo.prjIDList , openProjectChart.GetMenuTree(prjInfo,0).detph3Trace ,function (resultData) {
                    if(!resultData.errorMsg){
                        res.send(resultData);
                        console.log(resultData);
                    }else{
                        res.render('error',{message:resultData.errorMsg , error:{status:"",stack:""}});
                    }
                });
            }else{
                res.render('error',{message:resultData.errorMsg , error:{status:"",stack:""}});
            }
        });

    };

});



/**
 * @api {get} /api/report/dep1/operatorType/:id 프로젝트 운영 유형 현황
 * @apiGroup ReportDepth1
 * @apiParam {id} id 상위 프로젝트 ID
 * @apiSuccess {Object[]} headercols 헤더정보
 * @apiSuccess {Object[]} items 아이템
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *    [{
 *              "headercols":["2-3. 국내항공","2-4. 해외호텔","2-6. 해외여행","2-2. 해외항공, 홀세일","2-1. 공통/전사","2-7. 국내여행","2-8. 국내숙박(체크인나우)","2-9. 모바일","2-0. R플랫폼","전문몰"],
 *              "items":[
 *                      {"name":"2-3. 국내항공","EpicCnt":13,"TaskCnt":28,"BugCnt":0,"MilesstoneCnt":8,"PhaseCnt":0,"FeatureCnt":0,"UserstoryCnt":0,"TotalCount":49},
 *                      {"name":"2-4. 해외호텔","EpicCnt":36,"TaskCnt":66,"BugCnt":3,"MilesstoneCnt":18,"PhaseCnt":0,"FeatureCnt":0,"UserstoryCnt":0,"TotalCount":123},
 *                      {"name":"2-6. 해외여행","EpicCnt":8,"TaskCnt":11,"BugCnt":9,"MilesstoneCnt":0,"PhaseCnt":0,"FeatureCnt":0,"UserstoryCnt":0,"TotalCount":28},
 *                      ...생략
 *                ]
 *    }]
 * @apiErrorExample {json} List error
 *    HTTP/1.1 500 Internal Server Error
 */

router.get('/dep1/operatorType/:prjID',cache(dayCacheTime) ,function(req, res, next) {
    var isSendError = false;
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-type","application/json");

    if(!req.params.prjID){
        res.render('error',{message:'Need Param ProjectID'});
    }else{
        var projectName = openProjectChart.projectInfoList[ req.params.prjID ].name;
        //Todo: Remove Hard Code ( 프로젝트인지 업무요청인지 구분... )
        if( !(projectName.indexOf("2 프로젝트") > -1) ){
            res.render('error',{message:"" , error:{status:"",stack:""}});
            return;
        }

        openProjectChart.GetProjectInfoDB(req.params.prjID ,function (prjInfo) {
            if(!prjInfo.errMsg){
                var menuTreeModel = [];
                openProjectChart.GetOperatorType(prjInfo.prjIDList , openProjectChart.GetMenuTree(prjInfo,0).detph3Trace ,function (resultData) {
                    if(!resultData.errorMsg){
                        res.send(resultData);
                        console.log(resultData);
                    }else{
                        res.render('error',{message:resultData.errorMsg , error:{status:"",stack:""}});
                    }
                });
            }else{
                res.render('error',{message:resultData.errorMsg , error:{status:"",stack:""}});
            }
        });

    };
});


/**
 * @api {get} /api/report/dep1/humanResource/:id 프로젝트 인력 투입 현황
 * @apiGroup ReportDepth1
 * @apiParam {id} id 상위 프로젝트 ID
 * @apiSuccess {Object[]} headercols 헤더정보
 * @apiSuccess {Object[]} items 아이템
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *    [{
 *       "headercols":["2-3. 국내항공","2-4. 해외호텔","2-6. 해외여행","2-2. 해외항공, 홀세일","2-1. 공통/전사"],
 *       "items":[
 *                  {"name":"2-3. 국내항공","DevCnt":2,"DegisnCnt":0,"PlannerCnt":2,"TotalCount":4},
 *                  {"name":"2-4. 해외호텔","DevCnt":0,"DegisnCnt":0,"PlannerCnt":7,"TotalCount":7},
 *                  {"name":"2-6. 해외여행","DevCnt":3,"DegisnCnt":0,"PlannerCnt":0,"TotalCount":3},
 *                  ....생략
 *                 ]
 *
 *    }]
 * @apiErrorExample {json} List error
 *    HTTP/1.1 500 Internal Server Error
 */

router.get('/dep1/humanResource/:prjID',cache(dayCacheTime) ,function(req, res, next) {
    var isSendError = false;
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-type","application/json");

    if(!req.params.prjID){
        res.render('error',{message:'Need Param ProjectID'});
    }else{
        var projectName = openProjectChart.projectInfoList[ req.params.prjID ].name;
        //Todo: Remove Hard Code ( 프로젝트인지 업무요청인지 구분... )
        if( !(projectName.indexOf("2 프로젝트") > -1) ){
            res.render('error',{message:"" , error:{status:"",stack:""}});
            return;
        }

        openProjectChart.GetProjectInfoDB(req.params.prjID ,function (prjInfo) {
            if(!prjInfo.errMsg){
                var menuTreeModel = [];
                openProjectChart.GetHmanResource(prjInfo.prjIDList , openProjectChart.GetMenuTree(prjInfo,0).detph3Trace ,function (resultData) {
                    if(!resultData.errorMsg){
                        res.send(resultData);
                        console.log(resultData);
                    }else{
                        res.render('error',{message:resultData.errorMsg , error:{status:"",stack:""}});
                    }
                });
            }else{
                res.render('error',{message:resultData.errorMsg , error:{status:"",stack:""}});
            }
        });

    };
});


/**
 * @api {get} /api/report/dep2/projectCount/:id 카테고리 별 프로젝트 등록 변화 개수
 * @apiGroup ReportDepth2
 * @apiParam {id} id 상위 프로젝트 ID
 * @apiSuccess {Object[]} headercols 헤더정보
 * @apiSuccess {Object[]} items 아이템
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *    [{
 *          "headercols":[201701,201702,201703,201704,201705],
 *          "items":[{"name":"국내항공","data":[2,3,5,2,2]}],
 *          "info":{"NewCountCurMonth":0,"TotalInprogressCount":2,"TotalClosecount":8}
 *    }]
 * @apiErrorExample {json} List error
 *    HTTP/1.1 500 Internal Server Error
 */

router.get('/dep2/projectCount/:prjID',cache(dayCacheTime) ,function(req, res, next) {
    var isSendError = false;
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-type","application/json");

    if(!req.params.prjID) {
        res.render('error', {message: 'Need Param ProjectID'});
        return;
    }

    var nowData = new Date();
    var nowYear = nowData.getFullYear();
    var nowMonth = nowData.getMonth() + 1;

    var reportDataResult = { headercols:[],items:[],info:{} };
    var reportData ={};

    var NewCountCurMonth=0;
    var TotalInprogressCount=0;
    var TotalClosecount=0;


    //createHeader
    for(var month=0 ; month<nowMonth;month++){
        reportDataResult.headercols.push( nowYear*100 + (month+1) );
    }

    var filterName = "";


    //기본 프로젝트 정보 생성...
    var createBaseProjectInfo = function (dataArray) {
        for (var key in dataArray) {
            if (dataArray.hasOwnProperty(key)) {
                for(var idx=0;idx<dataArray[key].length;idx++){
                    var curData = dataArray[key][idx];
                    var prjName = curData.Dep2_name;

                    if(filterName == ""){
                        if( Number(req.params.prjID) == Number(curData.Dep2_id) ){
                            filterName = prjName;
                            console.log("Setfilter:" + filterName);
                        }
                    }

                    if(filterName!=prjName)
                        continue;

                    reportData[prjName] = { nowYear:[] }
                    for(var month=0 ; month<nowMonth;month++){
                        reportData[prjName].nowYear.push(0);
                    }
                }
            }
        }

        for (var key in dataArray) {
            for(var idx=0;idx<dataArray[key].length;idx++){
                var curData = dataArray[key][idx];
                var prjName = curData.Dep2_name;

                if(filterName!=prjName)
                    continue;

                updateProjectcount(prjName,curData.count,Number(curData.dateGroup),true );
            }
        }
    }

    var updateProjectcount = function (prjName,cnt,updateDateInt,isCreate) {
        if(updateDateInt< nowYear*100+1){
            return;
        }

        if( reportData.hasOwnProperty(prjName) ){
            for(var idx=0 ; idx<12 ; idx++  ){
                var month = idx+1;

                if(nowMonth < month)
                    continue;

                var dateInt = nowYear*100 + month;
                if(  Number(updateDateInt) == Number(dateInt) ){
                    console.log( prjName + " " + dateInt + "  , " + updateDateInt + ' ' , cnt);
                    if(isCreate){
                        if(nowMonth==month)
                            NewCountCurMonth+=cnt;

                        TotalInprogressCount+=cnt;
                        reportData[prjName].nowYear[idx] = cnt;
                        console.log("===>"+prjName)
                    }
                    else{
                        TotalClosecount+=cnt;
                    }
                }
            }
        }
    }


    openProjectChart.GetProjectTimeLine_Create_Dep1( function (resultDataA) {
        if(!resultDataA.errMsg){
            var prjCreate = groupArray(resultDataA.result, 'dateGroup');
            var baseInfo = createBaseProjectInfo(prjCreate);


            openProjectChart.GetProjectTimeLine_Close_Dep1(function (resultDataB) {
                var prjClose = groupArray(resultDataB.result, 'dateGroup');
                for (var key in prjClose) {
                    for(var idx=0;idx<prjClose[key].length;idx++){
                        var curData = prjClose[key][idx];
                        var prjName = curData.Dep2_name;
                        updateProjectcount(prjName, curData.count , Number(curData.dateGroup), false );
                    }
                }

                for (var key in reportData) {
                    var curData = reportData[key];
                    reportDataResult.items.push({ name:key,data:curData.nowYear  });

                    var deltaAmount = 0;
                    for(var idx =0 ; idx < curData.nowYear.length ; idx++ ){

                        if(idx == (curData.nowYear.length-2) ){

                        }else if(idx == (curData.nowYear.length-1) ){
                            //TotalInprogressCount+=curData.nowYear[idx];
                            deltaAmount = curData.nowYear[idx] - curData.nowYear[idx-1];
                            //if(deltaAmount>0)
                                //NewCountCurMonth = deltaAmount;
                        }
                    }
                }

                reportDataResult.info = {NewCountCurMonth:NewCountCurMonth,TotalInprogressCount:TotalInprogressCount,TotalClosecount:TotalClosecount};

                res.send( reportDataResult );
            });
        }else{
            res.render('error',{message:resultDataA.errorMsg , error:{status:"",stack:""}});
        }
    });
});



/**
 * @api {get} /api/report/dep2/operatorState/:id 카테고리 별 프로젝트 운영현황
 * @apiGroup ReportDepth2
 * @apiParam {id} id 상위 프로젝트 ID
 * @apiSuccess {Object[]} headercols 헤더정보
 * @apiSuccess {Object[]} items 아이템
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *    [{
 *
 *                  "headercols":["16.10 부킹닷컴","16.06 호텔 쿠폰 개선 (카드사 적용외)","17.01 (M) 상세페이지 개편","17.02 해외호텔 검색고도화/PC메인개편","중단기 프로젝트_해외호텔","17.05. 예약정보간소화 및 예약페이지 개편"],
 *                  "items":[
 *                      {name":"16.10 부킹닷컴","InprogressCount":63,"CompletedCount":0,"TotalCount":64,"NewRequestCount":0,"PendingCount":1},
 *                      {"name":"16.06 호텔 쿠폰 개선 (카드사 적용외)","InprogressCount":22,"CompletedCount":0,"TotalCount":22,"NewRequestCount":0,"PendingCount":0},
 *                      {"name":"17.01 (M) 상세페이지 개편","InprogressCount":14,"CompletedCount":0,"TotalCount":14,"NewRequestCount":0,"PendingCount":0},{"name":"17.02 해외호텔 검색고도화/PC메인개편","InprogressCount":7,"CompletedCount":0,
 *                      ....생략
 *                   ]
 *
 *    }]
 * @apiErrorExample {json} List error
 *    HTTP/1.1 500 Internal Server Error
 */

router.get('/dep2/operatorState/:prjID',cache(dayCacheTime) ,function(req, res, next) {
    var isSendError = false;
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-type","application/json");

    if(!req.params.prjID){
        res.render('error',{message:'Need Param ProjectID'});
    }else{
        var projectName = openProjectChart.projectInfoList[ req.params.prjID ].name;

        openProjectChart.GetProjectInfoDB(req.params.prjID ,function (prjInfo) {
            if(!prjInfo.errMsg){
                var menuTreeModel = [];
                openProjectChart.GetOperatorStateDep2(prjInfo.prjIDList , openProjectChart.GetMenuTree(prjInfo,0).detph2Trace ,function (resultData) {
                    if(!resultData.errorMsg){
                        res.send(resultData);
                        console.log(resultData);
                    }else{
                        res.render('error',{message:resultData.errorMsg , error:{status:"",stack:""}});
                    }
                });
            }else{
                res.render('error',{message:resultData.errorMsg , error:{status:"",stack:""}});
            }
        });

    };

});


/**
 * @api {get} /api/report/dep2/humanResource/:id 카테고리 별 프로젝트 인력 투입 현황
 * @apiGroup ReportDepth2
 * @apiParam {id} id 상위 프로젝트 ID
 * @apiSuccess {Object[]} headercols 헤더정보
 * @apiSuccess {Object[]} items 아이템
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *    [{
 *              "headercols":["17.03 통합검색","17.03 통번역 서비스",......생략],
 *              "items":[
 *                      {"name":"17.03 통합검색","DevCnt":1,"DegisnCnt":1,"PlannerCnt":1,"TotalCount":3},
 *                      {"name":"17.03 통번역 서비스","DevCnt":1,"DegisnCnt":0,"PlannerCnt":1,"TotalCount":2},
 *                      {"name":"17.03 통합메인 개편","DevCnt":1,"DegisnCnt":1,"PlannerCnt":1,"TotalCount":3},
 *                      {"name":"17.03 컨시어지","DevCnt":1,"DegisnCnt":0,"PlannerCnt":1,"TotalCount":2},
 *                      ....생략
 *                   ]
 *
 *    }]
 * @apiErrorExample {json} List error
 *    HTTP/1.1 500 Internal Server Error
 */

router.get('/dep2/humanResource/:prjID',cache(dayCacheTime) ,function(req, res, next) {
    var isSendError = false;
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-type","application/json");

    if(!req.params.prjID){
        res.render('error',{message:'Need Param ProjectID'});
    }else{
        var projectName = openProjectChart.projectInfoList[ req.params.prjID ].name;

        openProjectChart.GetProjectInfoDB(req.params.prjID ,function (prjInfo) {
            if(!prjInfo.errMsg){
                var menuTreeModel = [];
                openProjectChart.GetHmanResourceDep2(prjInfo.prjIDList , openProjectChart.GetMenuTree(prjInfo,0).detph2Trace ,function (resultData) {
                    if(!resultData.errorMsg){
                        res.send(resultData);
                        console.log(resultData);
                    }else{
                        res.render('error',{message:resultData.errorMsg , error:{status:"",stack:""}});
                    }
                });
            }else{
                res.render('error',{message:resultData.errorMsg , error:{status:"",stack:""}});
            }
        });

    };
});

/**
 * @api {get} /api/report/dep3/taskreview/:id 최근 프로젝트 진행 요약
 * @apiGroup ReportDepth3
 * @apiParam {id} id 상위 프로젝트 ID
 * @apiSuccess {Object[]} headercols 헤더정보
 * @apiSuccess {Object[]} items 아이템
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *    [{
 *      더미 데이터
 *       headercols:["최근 프로젝트 진행 요약"],
 *       items:[
 *           {issuename:"Resolved",description:"여행 검색 도입시 추가 색인이 필요한 항목 정리 각 항목 색인시 필요작업 검토",update:"2017-03-14 오전 7:36:36" },
 *           {issuename:"Resolved",description:"Geo 기반의 키워드 분류내용 추가",update:"2017-03-14 오전 7:36:36" },
 *           {issuename:"Resolved",description:"검색시 여정 필수입력 상품의 임의의 날짜를 지정하여 검색 결과를 보여줌",update:"2017-03-14 오전 7:36:36" }
 *       ]
 *    }]
 * @apiErrorExample {json} List error
 *    HTTP/1.1 500 Internal Server Error
 */

router.get('/dep3/taskreview/:prjID',cache(dayCacheTime) ,function(req, res, next) {
    var isSendError = false;
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-type","application/json");

    if(!req.params.prjID) {
        res.render('error', {message: 'Need Param ProjectID'});
        return;
    }
    //Todo: 더미 데이터
    res.send({
           headercols:["최근 프로젝트 진행 요약"],
           items:[
               {issuename:"Resolved",description:"여행 검색 도입시 추가 색인이 필요한 항목 정리 각 항목 색인시 필요작업 검토",update:"2017-03-14 오전 7:36:36" },
               {issuename:"Resolved",description:"Geo 기반의 키워드 분류내용 추가",update:"2017-03-14 오전 7:36:36" },
               {issuename:"Resolved",description:"검색시 여정 필수입력 상품의 임의의 날짜를 지정하여 검색 결과를 보여줌",update:"2017-03-14 오전 7:36:36" }
           ]
    });
    return;
});


/**
 * @api {get} /api/report/dep3/updateState/:id 프로젝트 업데이트 현황
 * @apiGroup ReportDepth3
 * @apiParam {id} id 상위 프로젝트 ID
 * @apiSuccess {Object[]} headercols 헤더정보
 * @apiSuccess {Object[]} items 아이템
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *    [{
 *      더미 데이터
 *       headercols:[20170501,20170502,20170503,20170504,20170505,20170506,20170507,20170508,20170509],
 *       items:[
 *           {name:"00. 분석회의","data":[0,3,5,5,3,4,2,1,0]},
 *           {name:"01. 기획","data":[1,2,3,4,5,6,7,4,3]},
 *           {name:"02. 디자인","data":[5,4,4,3,2,2,1,1,1]},
 *           {name:"03. 개발","data":[0,0,0,1,2,3,4,5,4]}
 *    }]
 * @apiErrorExample {json} List error
 *    HTTP/1.1 500 Internal Server Error
 */

router.get('/dep3/updateState/:prjID',cache(dayCacheTime) ,function(req, res, next) {
    var isSendError = false;
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-type","application/json");

    if(!req.params.prjID) {
        res.render('error', {message: 'Need Param ProjectID'});
        return;
    }

    //Todo: 더미 데이터
    /*
    res.send({
        headercols:[20170501,20170502,20170503,20170504,20170505,20170506,20170507,20170508,20170509],
        items:[
            {name:"00. 분석회의","data":[0,3,5,5,3,4,2,1,0]},
            {name:"01. 기획","data":[1,2,3,4,5,6,7,4,3]},
            {name:"02. 디자인","data":[5,4,4,3,2,2,1,1,1]},
            {name:"03. 개발","data":[0,0,0,1,2,3,4,5,4]}
        ]
    });*/

    openProjectChart.GetProjectInfoByID( req.params.prjID ,function (prjInfo) {
        var menuTreeModel = [];
        if(!prjInfo.errMsg){
            console.log(prjInfo);
            var prjName=prjInfo.result[0].name;
            openProjectChart.GetProjectTimeLine_Info_Dep3(req.params.prjID,prjName,function (data) {
                if(!data.errMsg){
                    res.send(data);
                }
            })

        }else{
            res.render('error',{message:resultData.errorMsg , error:{status:"",stack:""}});
        }
    });




    return;

 });


/**
 * @api {get} /api/report/dep3/operatorState/:id 카테고리 별 진행 현황
 * @apiGroup ReportDepth3
 * @apiParam {id} id 상위 프로젝트 ID
 * @apiSuccess {Object[]} headercols 헤더정보
 * @apiSuccess {Object[]} items 아이템
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *    [{
 *
 *      "headercols":["00 준비","01 기획","02 디자인/HTML","04 QA","03 개발"],
 *      "items":[
 *              {"name":"00 준비","InprogressCount":8,"CompletedCount":0,"TotalCount":8,"NewRequestCount":0,"PendingCount":0},
 *              {"name":"01 기획","InprogressCount":22,"CompletedCount":0,"TotalCount":22,"NewRequestCount":0,"PendingCount":0},
 *              {"name":"02 디자인/HTML","InprogressCount":6,"CompletedCount":0,"TotalCount":6,"NewRequestCount":0,"PendingCount":0},
 *              ...
 *              ]
 *    }]
 * @apiErrorExample {json} List error
 *    HTTP/1.1 500 Internal Server Error
 */

router.get('/dep3/operatorState/:prjID',cache(dayCacheTime) ,function(req, res, next) {
    var isSendError = false;
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-type","application/json");

    if(!req.params.prjID){
        res.render('error',{message:'Need Param ProjectID'});
    }else{
        var projectName = openProjectChart.projectInfoList[ req.params.prjID ].name;

        openProjectChart.GetProjectInfoDB(req.params.prjID ,function (prjInfo) {
            if(!prjInfo.errMsg){
                var menuTreeModel = [];
                openProjectChart.GetOperatorStateDep3(prjInfo.prjIDList , openProjectChart.GetMenuTree(prjInfo,0).detph3Trace ,function (resultData) {
                    if(!resultData.errorMsg){
                        res.send(resultData);
                        console.log(resultData);
                    }else{
                        res.render('error',{message:resultData.errorMsg , error:{status:"",stack:""}});
                    }
                });
            }else{
                res.render('error',{message:resultData.errorMsg , error:{status:"",stack:""}});
            }
        });

    };

});


/**
 * @api {get} /api/report/dep3/operatorType/:id 유형 별 진행 현황
 * @apiGroup ReportDepth3
 * @apiParam {id} id 상위 프로젝트 ID
 * @apiParam {id} id 상위 프로젝트 ID
 * @apiSuccess {Object[]} headercols 헤더정보
 * @apiSuccess {Object[]} items 아이템
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *    [{
 *          "headercols":["Task","Epic"],
 *          "items":[
 *                  {"name":"Task","InprogressCount":22,"CompletedCount":0,"TotalCount":22,"NewRequestCount":0,"PendingCount":0},
 *                  {"name":"Epic","InprogressCount":40,"CompletedCount":0,"TotalCount":41,"NewRequestCount":0,"PendingCount":1}
 *           ]
 *    }]
 * @apiErrorExample {json} List error
 *    HTTP/1.1 500 Internal Server Error
 */

router.get('/dep3/operatorType/:prjID',cache(dayCacheTime) ,function(req, res, next) {
    var isSendError = false;
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-type","application/json");

    if(!req.params.prjID){
        res.render('error',{message:'Need Param ProjectID'});
    }else{
        var projectName = openProjectChart.projectInfoList[ req.params.prjID ].name;

        openProjectChart.GetProjectInfoDB(req.params.prjID ,function (prjInfo) {
            if(!prjInfo.errMsg){
                var menuTreeModel = [];
                openProjectChart.GetOperatorTypeDep3(prjInfo.prjIDList , openProjectChart.GetMenuTree(prjInfo,0).detph2Trace ,function (resultData) {
                    if(!resultData.errorMsg){
                        res.send(resultData);
                        console.log(resultData);
                    }else{
                        res.render('error',{message:resultData.errorMsg , error:{status:"",stack:""}});
                    }
                });
            }else{
                res.render('error',{message:resultData.errorMsg , error:{status:"",stack:""}});
            }
        });

    };
});

/**
 * @api {get} /api/report/dep3/humanResource/:id 프로젝트 담당자 별 진행현황
 * @apiGroup ReportDepth3
 * @apiParam {id} id 상위 프로젝트 ID
 * @apiSuccess {Object[]} headercols 헤더정보
 * @apiSuccess {Object[]} items 아이템
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *    [{
 *          "headercols":["최정옥","박이슬","최상일","김준영","강승엽","홍석현","서아령"],
 *          "items":[
 *                  {"name":"최정옥","InprogressCount":6,"CompletedCount":0,"TotalCount":6,"NewRequestCount":0,"PendingCount":0},
 *                  {"name":"박이슬","InprogressCount":6,"CompletedCount":0,"TotalCount":6,"NewRequestCount":0,"PendingCount":0},
 *                  {"name":"최상일","InprogressCount":22,"CompletedCount":0,"TotalCount":22,"NewRequestCount":0,"PendingCount":0},
 *                  {"name":"김준영","InprogressCount":16,"CompletedCount":0,"TotalCount":17,"NewRequestCount":0,"PendingCount":1},
 *                  ....생략
 *                  ]
 *    }]
 * @apiErrorExample {json} List error
 *    HTTP/1.1 500 Internal Server Error
 */

router.get('/dep3/humanResource/:prjID',cache(dayCacheTime) ,function(req, res, next) {
    var isSendError = false;
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-type","application/json");

    if(!req.params.prjID){
        res.render('error',{message:'Need Param ProjectID'});
    }else{
        var projectName = openProjectChart.projectInfoList[ req.params.prjID ].name;

        openProjectChart.GetProjectInfoDB(req.params.prjID ,function (prjInfo) {
            if(!prjInfo.errMsg){
                var menuTreeModel = [];
                openProjectChart.GetHmanResourceDep3(prjInfo.prjIDList , openProjectChart.GetMenuTree(prjInfo,0).detph2Trace ,function (resultData) {
                    if(!resultData.errorMsg){
                        res.send(resultData);
                        console.log(resultData);
                    }else{
                        res.render('error',{message:resultData.errorMsg , error:{status:"",stack:""}});
                    }
                });
            }else{
                res.render('error',{message:resultData.errorMsg , error:{status:"",stack:""}});
            }
        });

    };
});


/**
 * @api {get} /api/report/operator/operatortimeline/:id 운영현황
 * @apiGroup ReportOperator
 * @apiParam {id} id 상위 프로젝트 ID
 * @apiParam {id} id 상위 프로젝트 ID
 * @apiSuccess {Object[]} headercols 헤더정보
 * @apiSuccess {Object[]} items 아이템

 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *    [{
 *      더미데이터
 *      headercols: [201701,201702,201703,201704,201705],
 *      items: [
 *          {name: "IT 업무요청", "data": [1,1,2,1,1]}
 *       ],
 *      info:{NewCountCurMonth:0,TotalInprogressCount:2,TotalClosecount:8,TotalCount:10 }
 *    }]
 * @apiErrorExample {json} List error
 *    HTTP/1.1 500 Internal Server Error
 */


router.get('/operator/operatortimeline/:prjID',cache(dayCacheTime) ,function(req, res, next) {
    var isSendError = false;
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-type", "application/json");

    if (!req.params.prjID) {
        res.render('error', {message: 'Need Param ProjectID'});
        return;
    }

    /*
    //Todo: 더미 데이터
    res.send({
        headercols: [201701,201702,201703,201704,201705],
        items: [
            {name: "IT 업무요청", "data": [1,1,2,1,1]}
        ],
        info:{NewCountCurMonth:0,TotalInprogressCount:2,TotalClosecount:8,TotalCount:10 }
    });*/

    var cacheKey = "operatortimeline-" +req.params.prjID;
    var wcacheKey = "Woperatortimeline-" +req.params.prjID;
    var wCacheMode = false;

    if(null!=mcache.get(cacheKey)){
        res.send( mcache.get(cacheKey ) );
        console.log("CacheMode");
        return;
    }

    if(null!=mcache.get(wcacheKey)){
        wCacheMode=true;
        res.send( mcache.get(wcacheKey ) );
        console.log("WCacheMode");
    }

    openProjectChart.GetProjectInfoByID( req.params.prjID ,function (prjInfo) {
        var menuTreeModel = [];
        if(!prjInfo.errMsg){
            console.log(prjInfo);
            var prjName=prjInfo.result[0].name;
            openProjectChart.GetProjectTimeLine_Info_Dep2(req.params.prjID, prjName ,function (data) {
                if(!data.errMsg){
                    mcache.put(cacheKey,data,dayCacheTime);
                    mcache.put(wcacheKey,data,weekCacheTime);
                    if(!wCacheMode)
                        res.send(data);
                }
            })

        }else{
            res.render('error',{message:resultData.errorMsg , error:{status:"",stack:""}});
        }
    });
    return;


});


/**
 * @api {get} /api/report/operator/state/:id 상태  현황
 * @apiGroup ReportOperator
 * @apiParam {id} id 상위 프로젝트 ID
 * @apiParam {id} id 상위 프로젝트 ID
 * @apiSuccess {Object[]} headercols 헤더정보
 * @apiSuccess {Object[]} items 아이템
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *    [{
 *      더미데이터
 *      headercols: ["New/Request","CHECKING","PLANNING","DESIGN","PUBLISHING","DEVELOPMENT","QA","RELEASE-TEST","RELEASE-STAGING","RELEASE-REAL","RESOLVED","CLOSED"],
 *      items: [
 *           {name: "New/Request", "data": 1 },
 *           {name: "CHECKING", "data": 1 },
 *           {name: "PLANNING", "data": 1 },
 *           {name: "DESIGN", "data": 1 },
 *           {name: "PUBLISHING", "data": 1 },
 *           {name: "DEVELOPMENT", "data": 1 },
 *           {name: "QA", "data": 1 },
 *           {name: "RELEASE-TEST", "data": 1 },
 *           {name: "RELEASE-STAGING", "data": 1 },
 *           {name: "RELEASE", "data": 1 },
 *           {name: "RESOLVED", "data": 1 },
 *           {name: "CLOSED", "data": 1 }
 *       ]
 *    }]
 * @apiErrorExample {json} List error
 *    HTTP/1.1 500 Internal Server Error
 */

router.get('/operator/state/:prjID',cache(dayCacheTime) ,function(req, res, next) {
    var isSendError = false;
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-type","application/json");

    if(!req.params.prjID){
        res.render('error',{message:'Need Param ProjectID'});
    }else{
        //var projectName = openProjectChart.projectInfoList[ req.params.prjID ].name;

        var cacheKey = "operatorstate-" +req.params.prjID;
        var wcacheKey = "Woperatorstate-" +req.params.prjID;
        var wCacheMode = false;

        if(null!=mcache.get(cacheKey)){
            res.send( mcache.get(cacheKey ) );
            console.log("CacheMode");
            return;
        }

        if(null!=mcache.get(wcacheKey)){
            wCacheMode=true;
            res.send( mcache.get(wcacheKey ) );
            console.log("WCacheMode");
        }

        openProjectChart.GetProjectInfoDB(req.params.prjID ,function (prjInfo) {
            if(!prjInfo.errMsg){
                var menuTreeModel = [];
                openProjectChart.GetOperatorStateDep2Ex(prjInfo.prjIDList , openProjectChart.GetMenuTree(prjInfo,0).detph2Trace ,function (resultData) {
                    if(!resultData.errorMsg){
                        mcache.put(cacheKey,resultData,dayCacheTime);
                        mcache.put(wcacheKey,resultData,weekCacheTime);

                        if(!wCacheMode)
                            res.send(resultData);

                        console.log(resultData);
                    }else{
                        res.render('error',{message:resultData.errorMsg , error:{status:"",stack:""}});
                    }
                });
            }else{
                res.render('error',{message:resultData.errorMsg , error:{status:"",stack:""}});
            }
        });

    };

});


/**
 * @api {get} /api/report/operator/categori/:id 카테고리 별 진행 현황
 * @apiGroup ReportOperator
 * @apiParam {id} id 상위 프로젝트 ID
 * @apiParam {id} id 상위 프로젝트 ID
 * @apiSuccess {Object[]} headercols 헤더정보
 * @apiSuccess {Object[]} items 아이템

 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *    [{
 *      더미데이터
 *       lineData:{
 *          headercols: ["NewRequestCount","InprogressCount","CompletedCount","PendingCount"],
 *          items: [
 *               {"name":"공통/전사","InprogressCount":10,"CompletedCount":20,"NewRequestCount":20,"PendingCount":1 },
 *               {"name":"해외여행","InprogressCount":5,"CompletedCount":0,"NewRequestCount":5,"PendingCount":1 },
 *               {"name":"국내여행","InprogressCount":10,"CompletedCount":20,"NewRequestCount":20,"PendingCount":1 },
 *               {"name":"해외항공","InprogressCount":20,"CompletedCount":50,"NewRequestCount":30,"PendingCount":1 },
 *               {"name":"국내항공","InprogressCount":10,"CompletedCount":40,"NewRequestCount":10,"PendingCount":1 },
 *               {"name":"해외호텔","InprogressCount":10,"CompletedCount":30,"NewRequestCount":10,"PendingCount":1 },
 *               {"name":"국내호텔","InprogressCount":30,"CompletedCount":10,"NewRequestCount":20,"PendingCount":1 },
 *               {"name":"모바일","InprogressCount":20,"CompletedCount":60,"NewRequestCount":10,"PendingCount":1 }
 *           ]
 *       },
 *       pieData:{
 *           headercols: ["모바일","국내호텔","해외호텔","국내항공","해외항공","국내여행","해외여행","공통전사" ],
 *           items: [
 *               {name: "모바일", "data": 78},
 *               {name: "국내호텔", "data": 37},
 *               {name: "해외호텔", "data": 21},
 *               {name: "국내항공", "data": 43},
 *               {name: "해외항공", "data": 87},
 *               {name: "국내여행", "data": 100},
 *               {name: "해외여행", "data": 25},
 *               {name: "공통전사", "data": 23}
 *           ]
 *       }
 *    }]
 * @apiErrorExample {json} List error
 *    HTTP/1.1 500 Internal Server Error
 */


router.get('/operator/categori/:prjID',cache(dayCacheTime) ,function(req, res, next) {
    var isSendError = false;
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-type","application/json");

    if(!req.params.prjID){
        res.render('error',{message:'Need Param ProjectID'});
    }else{

        var cacheKey = "operatorcategori-" +req.params.prjID;
        var wcacheKey = "Woperatorcategori-" +req.params.prjID;
        var wCacheMode = false;

        if(null!=mcache.get(cacheKey)){
            res.send( mcache.get(cacheKey ) );
            console.log("CacheMode");
            return;
        }

        if(null!=mcache.get(wcacheKey)){
            wCacheMode=true;
            res.send( mcache.get(wcacheKey ) );
            console.log("WCacheMode");
        }


        var projectName = openProjectChart.projectInfoList[ req.params.prjID ].name;
        openProjectChart.GetProjectInfoDB(req.params.prjID ,function (prjInfo) {
            if(!prjInfo.errMsg){
                var menuTreeModel = [];
                openProjectChart.GetCategoriStateDep2(prjInfo.prjIDList , openProjectChart.GetMenuTree(prjInfo,0).detph3Trace ,function (resultData) {
                    if(!resultData.errorMsg){
                        mcache.put(cacheKey,resultData,dayCacheTime);
                        mcache.put(wcacheKey,resultData,weekCacheTime);

                        if(!wCacheMode)
                            res.send(resultData);

                        console.log(resultData);
                    }else{
                        res.render('error',{message:resultData.errorMsg , error:{status:"",stack:""}});
                    }
                });
            }else{
                res.render('error',{message:resultData.errorMsg , error:{status:"",stack:""}});
            }
        });

    };

});

/**
 * @api {get} /api/report/operator/consumption/:id 소모성 업무 현황
 * @apiGroup ReportOperator
 * @apiParam {id} id 상위 프로젝트 ID
 * @apiParam {id} id 상위 프로젝트 ID
 * @apiSuccess {Object[]} headercols 헤더정보
 * @apiSuccess {Object[]} items 아이템

 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *    [{
 *      더미데이터
 *      lineData:{
 *           headercols: ["NewRequestCount","InprogressCount","CompletedCount","PendingCount",
 *           items: [
 *               {"name":"Type A","InprogressCount":10,"CompletedCount":20,"NewRequestCount":20,"PendingCount":1 },
 *               {"name":"Type B","InprogressCount":5,"CompletedCount":0,"NewRequestCount":5,"PendingCount":1 },
 *               {"name":"Type C","InprogressCount":10,"CompletedCount":20,"NewRequestCount":20,"PendingCount":1 },
 *               {"name":"Type D","InprogressCount":20,"CompletedCount":50,"NewRequestCount":30,"PendingCount":1 },
 *               {"name":"Type E","InprogressCount":10,"CompletedCount":40,"NewRequestCount":10,"PendingCount":1 },
 *               {"name":"Type F","InprogressCount":10,"CompletedCount":30,"NewRequestCount":10,"PendingCount":1 },
 *               {"name":"Type G","InprogressCount":30,"CompletedCount":10,"NewRequestCount":20,"PendingCount":1 }
 *           ]
 *       },
 *       pieData:{
 *           headercols: ["Type A","Type B","Type C","Type D","Type E","Type F","Type G"],
 *           items: [
 *               {name: "Type A", "data": 78},
 *               {name: "Type B", "data": 37},
 *               {name: "Type C", "data": 21},
 *               {name: "Type D", "data": 43},
 *               {name: "Type E", "data": 87},
 *               {name: "Type F", "data": 100},
 *               {name: "Type G", "data": 25}
 *           ]
 *       }
 *    }]
 * @apiErrorExample {json} List error
 *    HTTP/1.1 500 Internal Server Error
 */



router.get('/operator/consumption/:prjID',cache(dayCacheTime) ,function(req, res, next) {
    var isSendError = false;
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-type","application/json");

    if(!req.params.prjID){
        res.render('error',{message:'Need Param ProjectID'});
    }else{

        var cacheKey = "operatorconsumption-" +req.params.prjID;
        var wcacheKey = "Woperatorconsumption-" +req.params.prjID;
        var wCacheMode = false;

        if(null!=mcache.get(cacheKey)){
            res.send( mcache.get(cacheKey ) );
            console.log("CacheMode");
            return;
        }

        if(null!=mcache.get(wcacheKey)){
            wCacheMode=true;
            res.send( mcache.get(wcacheKey ) );
            console.log("WCacheMode");
        }

        var projectName = openProjectChart.projectInfoList[ req.params.prjID ].name;
        openProjectChart.GetProjectInfoDB(req.params.prjID ,function (prjInfo) {
            if(!prjInfo.errMsg){
                var menuTreeModel = [];
                openProjectChart.GetConsumptionStateDep2(prjInfo.prjIDList , openProjectChart.GetMenuTree(prjInfo,0).detph3Trace ,function (resultData) {
                    if(!resultData.errorMsg){
                        mcache.put(cacheKey,resultData,dayCacheTime);
                        mcache.put(wcacheKey,resultData,weekCacheTime);
                        if(!wCacheMode)
                            res.send(resultData);
                        console.log(resultData);
                    }else{
                        res.render('error',{message:resultData.errorMsg , error:{status:"",stack:""}});
                    }
                });
            }else{
                res.render('error',{message:resultData.errorMsg , error:{status:"",stack:""}});
            }
        });

    };

});


/**
 * @api {get} /api/report/operator/joborder/:id 우선 순위 업무 현황
 * @apiGroup ReportOperator
 * @apiParam {id} id 상위 프로젝트 ID
 * @apiParam {id} id 상위 프로젝트 ID
 * @apiSuccess {Object[]} headercols 헤더정보
 * @apiSuccess {Object[]} items 아이템

 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *    [{
 *      더미데이터
 *      lineData:{
 *           headercols: ["NewRequestCount","InprogressCount","CompletedCount","PendingCount"],
 *           items: [
 *               {"name":"Very High","InprogressCount":10,"CompletedCount":20,"NewRequestCount":20,"PendingCount":1},
 *               {"name":"High","InprogressCount":5,"CompletedCount":0,"NewRequestCount":5 ,"PendingCount":1},
 *               {"name":"Normal","InprogressCount":10,"CompletedCount":20,"NewRequestCount":20,"PendingCount":1},
 *               {"name":"Low","InprogressCount":20,"CompletedCount":50,"NewRequestCount":30,"PendingCount":1}
 *           ]
 *       },
 *       pieData:{
 *           headercols: ["Low","Normal","High","Very High"],
 *           items: [
 *               {name: "Low", "data": 78},
 *               {name: "Normal", "data": 37},
 *               {name: "High", "data": 21},
 *               {name: "Very", "data": 43}
 *           ]
 *       }
 *    }]
 * @apiErrorExample {json} List error
 *    HTTP/1.1 500 Internal Server Error
 */


router.get('/operator/joborder/:prjID',cache(dayCacheTime) ,function(req, res, next) {
    var isSendError = false;
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-type","application/json");

    if(!req.params.prjID){
        res.render('error',{message:'Need Param ProjectID'});
    }else{
        var cacheKey = "operatorjoborder-" +req.params.prjID;
        var wcacheKey = "Woperatorjoborder-" +req.params.prjID;
        var wCacheMode = false;

        if(null!=mcache.get(cacheKey)){
            res.send( mcache.get(cacheKey ) );
            console.log("CacheMode");
            return;
        }

        if(null!=mcache.get(wcacheKey)){
            wCacheMode=true;
            res.send( mcache.get(wcacheKey ) );
            console.log("WCacheMode");
        }

        var projectName = openProjectChart.projectInfoList[ req.params.prjID ].name;
        openProjectChart.GetProjectInfoDB(req.params.prjID ,function (prjInfo) {
            if(!prjInfo.errMsg){
                var menuTreeModel = [];
                openProjectChart.GetJoborderStateDep2(prjInfo.prjIDList , openProjectChart.GetMenuTree(prjInfo,0).detph3Trace ,function (resultData) {
                    if(!resultData.errorMsg){
                        mcache.put(cacheKey,resultData,dayCacheTime);
                        mcache.put(wcacheKey,resultData,weekCacheTime);

                        if(!wCacheMode)
                            res.send(resultData);

                        console.log(resultData);
                    }else{
                        res.render('error',{message:resultData.errorMsg , error:{status:"",stack:""}});
                    }
                });
            }else{
                res.render('error',{message:resultData.errorMsg , error:{status:"",stack:""}});
            }
        });

    };

});

module.exports = router;
