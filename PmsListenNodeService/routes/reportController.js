/**
 * Created by 박상만 on 2017-02-27.
 */
var express = require('express');
var router = express.Router();
var groupArray = require('group-array');

var openProjectDB = require("../service/openProjectDB");
var openProjectChart = require("../service/openProjectChart");
var mcache = require('memory-cache');

var Node = require("tree-node");
var Tree = require("node-tree-data");

var minCacheTime=3600;
var hourCacheTime=minCacheTime*60;
var dayCacheTime= hourCacheTime * 24;

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



router.get('/',function (req, res, next) {
    openProjectChart.GetProjectInfoDB( null ,function (prjInfo) {
        var menuTreeModel = [];
        if(!prjInfo.errMsg){
            menuTreeModel = openProjectChart.GetMenuTree(prjInfo,0).menuTreeModel;
            console.log(menuTreeModel);
            res.render("report/index",{ rootmenu : menuTreeModel,filterroot:0} );
        }else{
            res.render('error',{message:resultData.errorMsg , error:{status:"",stack:""}});
        }
    });
});

router.get('/:prjID',cache(dayCacheTime) ,function(req, res, next) {
    if(!req.params.prjID){
        res.render('error',{message:'Need Param ProjectID'});
    }else{
        openProjectChart.GetProjectInfoDB( req.params.prjID ,function (prjInfo) {
            var menuTreeModel = [];
            if(!prjInfo.errMsg){
                menuTreeModel = openProjectChart.GetMenuTree(prjInfo,req.params.prjID).menuTreeModel;
                console.log(menuTreeModel);
                res.render("report/index",{ rootmenu : menuTreeModel,filterroot:req.params.prjID } );
            }else{
                res.render('error',{message:resultData.errorMsg , error:{status:"",stack:""}});
            }
        });
    }
});



router.get('/allproject/:prjID',cache(dayCacheTime) ,function(req, res, next) {
    var isSendError = false;
    res.setHeader("Content-Type", "text/html");

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
                openProjectChart.GetAllProjectReport(prjInfo.prjIDList , openProjectChart.GetMenuTree(prjInfo,0).detph3Trace ,function (resultData) {
                    if(!resultData.errorMsg){
                        res.render('report/allproject', resultData );
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

router.get('/subproject/:prjID',cache(dayCacheTime) ,function(req, res, next) {
    var isSendError = false;
    res.setHeader("Content-Type", "text/html");

    if(!req.params.prjID){
        res.render('error',{message:'Need Param ProjectID'});
    }else{

        openProjectChart.GetProjectInfoDB(req.params.prjID ,function (prjInfo) {
            if(!prjInfo.errMsg){
                var menuTreeModel = [];
                openProjectChart.GetSubProjectReport(req.params.prjID,prjInfo.prjIDList , function (resultData) {
                    if(!resultData.errorMsg){
                        res.render('report/subproject', {
                            title:"",
                            viewData:resultData.viewData,colInfo :resultData.colInfo,
                            viewData2:resultData.viewData2, colInfo2 :resultData.colInfo2 ,
                            viewData3:resultData.viewData3, colInfo3 :resultData.colInfo3 ,
                            prjID:req.params.prjID,
                            reportSubType:resultData.reportSubType,
                            projectName:resultData.projectName
                        } );
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

router.get('/project/:prjID', cache(hourCacheTime),function(req, res, next) {
    var isSendError = false;
    res.setHeader("Content-Type", "text/html");

    if(!req.params.prjID){
        res.render('error',{message:'Need Param ProjectID'});
    }else{

        openProjectChart.GetProjectInfoDB(req.params.prjID ,function (prjInfo) {
            if(!prjInfo.errMsg){
                openProjectChart.GetProjectReport(req.params.prjID , prjInfo.prjIDList , function (resultData) {
                    if(!resultData.errorMsg){
                        res.render('report/project', resultData );
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
