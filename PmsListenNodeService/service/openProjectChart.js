/**
 * Created by 박상만 on 2017-03-03.
 */

var config = require('config-json');//('../appcfg.json');
var mysql   = require('mysql');
var groupArray = require('group-array');
var openProjectDB = require("../service/openProjectDB");
var Tree = require("node-tree-data");

var OpenProjectChart = {
    Init: function () {
        var me=this;
        var query_project ="select * from projects";
        var bSucced = false;
        var me = this;
        me.projectInfoList={};
        openProjectDB.runQuery(0,query_project,function (data) {
            if( data.erroemsg == null) {
                if (data.rows != undefined) {
                    if (data.rows.length > 0) {
                        bSucced = true;
                        for(rowIdx in data.rows) {
                            var projectInfo = data.rows[rowIdx];
                            me.projectInfoList[projectInfo.id ] = projectInfo;
                        }
                    }
                }
            }
            if(bSucced)
                console.log("Load Project Info");
            else
                console.log("Failed Load Project Info");
        });
    },

    //myPrjID -1 : all

    GetProjectInfo : function (data,myPrjID) {
        var treeItem = new Tree();
        var rootTree = treeItem.createNode("root");
        var treeIdMap = {};
        var treeDeepInfo={};
        var prjList = [];
        var prjIDList =" ";
        var myDeepLevel = 0;

        //collect all data
        var limitMaxDeep = 3;
        for(idx=0;idx<limitMaxDeep;idx++){
            var isAdd = false;
            for(rowIdx in data.rows){
                var projectInfo =  data.rows[rowIdx];
                if(projectInfo.parent_id == null && treeItem.getNode(  treeIdMap[projectInfo.id]  ) == null ){
                    var node = treeItem.createNode( projectInfo.id.toString() ,rootTree.id );
                    treeItem.setNodeData(projectInfo, node.id);
                    treeIdMap[projectInfo.id] = node.id;

                    if(myPrjID==projectInfo.id){
                        isAdd=true;
                        myDeepLevel = 1;
                    }

                    if(myPrjID == null)
                        isAdd = true;

                }else{
                    var parentNode = treeItem.getNode(treeIdMap[projectInfo.parent_id] );
                    var currentNode = treeItem.getNode(treeIdMap[projectInfo.id]) ;
                    if(  parentNode!=null && currentNode == null  ){
                        var node = treeItem.createNode( projectInfo.id.toString() , parentNode.id);
                        treeItem.setNodeData(projectInfo, node.id);
                        treeIdMap[projectInfo.id] = node.id;
                        var deepLevel = 0;
                        var iterParentNode = node;
                        while (true){
                            iterParentNode = treeItem.getNode(iterParentNode.parent);
                            if(iterParentNode==null || iterParentNode==undefined)
                                break;
                            deepLevel++;
                        }
                        if(myPrjID==projectInfo.id || myPrjID==null){
                            myDeepLevel = deepLevel;
                            isAdd = true;
                        }
                        //Up Check
                        if(myPrjID == projectInfo.parent_id || myPrjID == parentNode.data.parent_id || myPrjID==null ){
                            isAdd = true;
                        }
                    }
                }

                if(isAdd){
                    prjIDList = prjIDList + projectInfo .id+ ",";
                    prjList.push(projectInfo);
                    isAdd =false;
                }
            }
        }

        if(prjIDList[prjIDList.length-1]==","){
            prjIDList = prjIDList.substr(0,prjIDList.length-1);
        }
        var resultValue = {myDeepLevel:myDeepLevel, prjIDList:prjIDList,treeInfo : treeItem.json()  };

        return resultValue;
    },

    GetMenuTree : function (prjInfo,rootIDFilter) {
        var menuTreeModel = [];
        var detph3Trace = {};
        var detph2Trace = {};
        var projectTree = Tree.json2obj(prjInfo.treeInfo);
        var rootID = prjInfo.treeInfo.rootIds[0];

        /*
        if(rootIDFilter>0){
            if( Number(rootIDFilter) != Number(deep1Idx) ){
                rootID = prjInfo.treeInfo.rootIds[0].;
            }
        }*/


        for( var deep1Idx in projectTree.getChildIds(rootID) ){
            var hashKey1 = projectTree.getChildIds(rootID)[deep1Idx];
            var node1 = projectTree.getNode(hashKey1);
            menuTreeModel.push({ info:node1.data , subMenuList:[] });
            for( var deep2Idx in  projectTree.getChildIds(hashKey1)){
                var hashKey2 = projectTree.getChildIds(hashKey1)[deep2Idx];
                var node2 = projectTree.getNode(hashKey2);
                menuTreeModel[deep1Idx].subMenuList.push({ info:node2.data , subMenuList:[] });
                for( var deep3Idx in  projectTree.getChildIds(hashKey2)){
                    var hashKey3 = projectTree.getChildIds(hashKey2)[deep3Idx];
                    var node3 = projectTree.getNode(hashKey3);
                    detph3Trace[node3.data.id] = {parentInfo : node2.data};
                    detph2Trace[node3.data.id] = {myInfo : node3.data};
                    menuTreeModel[deep1Idx].subMenuList[deep2Idx].subMenuList.push( { info:node3.data} );
                }
            }
        }
        return {menuTreeModel:menuTreeModel,detph3Trace:detph3Trace,detph2Trace:detph2Trace};
    },

    GetProjectInfoByID : function (prjID,callBack) {
        var me=this;
        var query_project ="select * from projects where id =" + prjID;
        openProjectDB.runQuery(0,query_project,function (data) {
            if( data.erroemsg == null) {
                if (data.rows == undefined) {
                    callBack({errorMsg: "GetProjectInfoDB::Row Undefined"});
                    return;
                } else {
                    if (data.rows.length == 0) {
                        callBack({errorMsg: "GetProjectInfoDB::Row Zoro"});
                        return;
                    }
                    var result = data.rows;
                    callBack({
                        result:result,
                        errorMsg:null
                    });
                }
            }else{
                callBack({errorMsg: "GetProjectInfoDB::ot Exist Project"});
            }
        });
    },

    GetProjectInfoDB : function (prjID,callBack) {
        var me=this;
        var query_project ="select * from projects";
        openProjectDB.runQuery(0,query_project,function (data) {
            if( data.erroemsg == null) {
                if (data.rows == undefined) {
                    callBack({errorMsg: "GetProjectInfoDB::Row Undefined"});
                    return;
                } else {
                    if (data.rows.length == 0) {
                        callBack({errorMsg: "GetProjectInfoDB::Row Zoro"});
                        return;
                    }
                    var treeResult = me.GetProjectInfo(data,prjID);
                    callBack(treeResult);
                }
            }else{
                callBack({errorMsg: "GetProjectInfoDB::ot Exist Project"});
            }
        });
    },

    GetProjectTimeLine_Create_Dep1 : function (callBack) {
        var me=this;
        var query = "SELECT Dep1.id as Dep1_id, Dep1.name as Dep1_name " +
            ", Dep2.id as Dep2_id, SUBSTRING_INDEX(SUBSTRING_INDEX(Dep2.name, ' ', 2), ' ', -1) as Dep2_name " +
            ", ifnull(Dep3.id, 0) as Dep3_id, ifnull(Dep3.name, '') as Dep3_name " +
            ", Dep3.created_on as created_on , Dep3.updated_on " +
            ", DATE_FORMAT(Dep3.created_on, '%Y%m') as dateGroup " +
            ", count(1) as count " +
            "FROM ( " +
            "SELECT * FROM projects "  +
            "WHERE parent_id is null " +
            ") Dep1 " +
            "left join ( " +
            "SELECT * FROM projects " +
            ") Dep2 on Dep1.id = Dep2.parent_id " +
            "left join ( " +
            "SELECT * FROM projects " +
            ") Dep3 on Dep2.id = Dep3.parent_id " +
            "where Length(Dep3.name)>0 and (Dep1.id = 2  ) " +
            "group by Dep2_name, DATE_FORMAT(Dep3.created_on, '%Y%m') " +
            "order by Dep3.created_on";

        openProjectDB.runQuery(0, query, function (data2) {
            if ((data2.erroemsg == null ) ) {
                if (data2.rows == undefined) {
                    callBack({errorMsg: "GetHumanResourceReport::Row2 is undefined"});
                    return;
                }
                var result = data2.rows;
                callBack({
                    result:result,
                    errorMsg:null
                });
            }
            else {
                callBack({errorMsg: data2.erroemsg});
            }
        });

    },

    GetProjectTimeLine_Close_Dep1 : function (callBack) {
        var me=this;
        var query = "SELECT Dep1.id as Dep1_id, Dep1.name as Dep1_name " +
            ", Dep2.id as Dep2_id,  SUBSTRING_INDEX(SUBSTRING_INDEX(Dep2.name, ' ', 2), ' ', -1) as Dep2_name " +
            ", ifnull(Dep3.id, 0) as Dep3_id, ifnull(Dep3.name, '') as Dep3_name " +
            ", Dep3.created_on as created_on , Dep3.updated_on " +
            ", DATE_FORMAT(Dep3.updated_on, '%Y%m') as dateGroup " +
            ", count(1) as count " +
            "FROM ( " +
            "SELECT * FROM projects "  +
            "WHERE parent_id is null " +
            ") Dep1 " +
            "left join ( " +
            "SELECT * FROM projects " +
            ") Dep2 on Dep1.id = Dep2.parent_id " +
            "left join ( " +
            "SELECT * FROM projects " +
            ") Dep3 on Dep2.id = Dep3.parent_id " +
            "where Length(Dep3.name)>0 and (Dep1.id = 161 ) " +
            "group by Dep2_name, DATE_FORMAT(Dep3.updated_on, '%Y%m') " +
            "order by Dep3.updated_on";

        openProjectDB.runQuery(0, query, function (data2) {
            if ((data2.erroemsg == null ) ) {
                if (data2.rows == undefined) {
                    callBack({errorMsg: "GetHumanResourceReport::Row2 is undefined"});
                    return;
                }
                var result = data2.rows;
                callBack({
                    result:result,
                    errorMsg:null
                });
            }
            else {
                callBack({errorMsg: data2.erroemsg});
            }
        });

    },

    GetProjectTimeLine_Info_Dep3 : function (prjID ,prjName, callBack) {
        var me=this;
        var query2 = "select (select REPLACE(REPLACE(name,'.',''),'/','') as cname  from categories where id = category_id ) as cname ,work_packages.subject,statuses.id, statuses.name as name, category_id,DATE_FORMAT( work_packages.updated_at , '%Y%m%d') as dateGroup, "+
        "(select COUNT(1) " +
        "from work_packages i " +
        "where i.project_id in ( " + prjID +" ) " +
        "and i.status_id = statuses.id and i.category_id = work_packages.category_id  and DATE_FORMAT( work_packages.updated_at , '%Y%m') = DATE_FORMAT( i.updated_at , '%Y%m')  ) as totalIssueCount " +
        "from work_packages, statuses " +
        "where work_packages.project_id in ( " + prjID +" ) " +
        "group by work_packages.category_id ,dateGroup, statuses.id " +
        "order by dateGroup; "

        var query = "select (select REPLACE(name,'.','')  from versions where id = fixed_version_id ) as vname , " +
            "(select REPLACE(REPLACE(name,'.',''),'/','') from categories where id = category_id ) as cname , " +
            "work_packages.category_id as category_id, " +
            "work_packages.project_id, " +
            "work_packages.subject, " +
            "(select name from statuses where statuses.id = work_packages.status_id) as name, " +
            "DATE_FORMAT( work_packages.updated_at , '%Y%m') as dateGroup, " +
            "count(*) as totalIssueCount " +
            "from work_packages " +
            "where work_packages.project_id in ( " + prjID +" ) " +
            "group by cname,dateGroup,name; ";

        openProjectDB.runQuery(0, query, function (data2) {
            if ((data2.erroemsg == null ) ) {
                if (data2.rows == undefined) {
                    callBack({errorMsg: "GetHumanResourceReport::Row2 is undefined"});
                    return;
                }
                var result = data2.rows;
                var dataArray = data2.rows;
                var groupA = groupArray(dataArray, 'dateGroup');
                var groupB = groupArray(dataArray, 'cname');

                var headercolsInfo = {};
                var headercols = [];
                var items = [];
                var itemsInfo ={};

                var tmpIdx=0;
                for(var key in groupA){
                    console.log(key);
                    headercols.push(key);
                    headercolsInfo[key] = tmpIdx;
                    tmpIdx++;
                }

                tmpIdx=0;
                for(var key in groupB){
                    console.log(key);
                    items.push({name:key,data: Array.apply(null, new Array( headercols.length )).map(Number.prototype.valueOf,0) })
                    itemsInfo[key] = tmpIdx;
                    tmpIdx++;
                }

                for(var key in groupB){
                    for (idx = 0; idx < groupB[key].length; idx++) {
                        var cname = key;
                        var totalIssueCount = groupB[key][idx].totalIssueCount;
                        var dateGroup = groupB[key][idx].dateGroup;
                        console.log(cname);
                        if(totalIssueCount>0)
                            items[ itemsInfo[cname]  ].data[ headercolsInfo[dateGroup]   ] = totalIssueCount;
                    }
                }

                callBack({
                    result:{ headercols:headercols , items:items  },
                    errorMsg:null
                });
            }
            else {
                callBack({errorMsg: data2.erroemsg});
            }
        });

    },

    GetProjectTimeLine_Info_Dep2 : function (prjID,prjName , callBack) {
        var me=this;
        /*var query2 = "select (select REPLACE(REPLACE(name,'.',''),'/','') as cname  from categories where id = category_id ) as cname ,work_packages.subject,statuses.id, statuses.name as name, category_id,DATE_FORMAT( work_packages.updated_at , '%Y%m') as dateGroup, "+
            "(select COUNT(1) " +
            "from work_packages i " +
            "where i.project_id in ( " + prjID +" ) " +
            "and i.status_id = statuses.id and i.category_id = work_packages.category_id  and DATE_FORMAT( work_packages.updated_at , '%Y%m') = DATE_FORMAT( i.updated_at , '%Y%m')  ) as totalIssueCount " +
            "from work_packages, statuses " +
            "where work_packages.project_id in ( " + prjID +" ) " +
            "group by dateGroup, statuses.id " +
            "order by dateGroup; "*/

        var query = "select (select REPLACE(name,'.','')  from versions where id = fixed_version_id ) as vname , " +
                    "(select REPLACE(REPLACE(name,'.',''),'/','') from categories where id = category_id ) as cname , " +
                    "(select name from statuses where statuses.id = work_packages.status_id) as name, " +
                    "DATE_FORMAT( work_packages.updated_at , '%Y%m') as dateGroup, " +
                    "count(*) as totalIssueCount " +
                    "from work_packages " +
                    "where work_packages.project_id in ( " + prjID +" ) " +
                    "group by dateGroup,name; ";

        openProjectDB.runQuery(0, query, function (data2) {
            if ((data2.erroemsg == null ) ) {
                if (data2.rows == undefined) {
                    callBack({errorMsg: "GetHumanResourceReport::Row2 is undefined"});
                    return;
                }
                var result = data2.rows;
                var dataArray = data2.rows;
                var groupA = groupArray(dataArray, 'dateGroup');
                var groupB = groupArray(dataArray, 'cname');

                var headercolsInfo = {};
                var headercols = [];
                var items = [];
                var itemsInfo ={};
                var info = { NewCountCurMonth:0, TotalInprogressCount:0, TotalClosecount:0, TotalCount: 0  }

                var tmpIdx=0;
                for(var key in groupA){
                    console.log(key);
                    headercols.push(key);
                    headercolsInfo[key] = tmpIdx;
                    tmpIdx++;
                }

                items.push({name:prjName,data: Array.apply(null, new Array( headercols.length )).map(Number.prototype.valueOf,0) });
                itemsInfo[prjName] = 0;

                var NewCountCurMonth = 0;
                var TotalInprogressCount = 0;
                var TotalClosecount = 0;
                var TotalCount = 0;


                for(var key in groupB){
                    for (idx = 0; idx < groupB[key].length; idx++) {
                        var cname = key;
                        var totalIssueCount = groupB[key][idx].totalIssueCount;
                        var dateGroup = groupB[key][idx].dateGroup;
                        console.log(cname);
                        if(totalIssueCount>0)
                            items[ itemsInfo[prjName]  ].data[ headercolsInfo[dateGroup]   ] +=totalIssueCount;

                        var issueName = groupB[key][idx].name;
                        var issueCount = groupB[key][idx].totalIssueCount;

                        console.log(issueName + "==>" + issueCount);



                        if( issueName == "New/Request" || issueName == "New / Request" ){
                            NewCountCurMonth+= Number(issueCount);
                        }else if( issueName == "Closed" || issueName == "Resolved" ){
                            TotalClosecount += Number(issueCount);
                        }else if( issueName == "On hold" || issueName == "Pending" || issueName == "Verified" || issueName == "Opinion" ){
                            continue;
                        }else{
                            TotalInprogressCount += Number(issueCount);
                        }

                        TotalCount+=Number(issueCount);

                        info = { NewCountCurMonth:NewCountCurMonth, TotalInprogressCount:TotalInprogressCount, TotalClosecount:TotalClosecount, TotalCount: TotalCount  }
                    }
                }

                callBack(
                    { headercols:headercols , items:items,info:info  }
                );
            }
            else {
                callBack({errorMsg: data2.erroemsg});
            }
        });

    },



    GetProjectReport: function (prjID , subPrjIds ,callBack) {
        var me=this;
        var stringSqlProjectsSubProjects = subPrjIds;

        var projectName = "";
        var issueByCategoryQuery = "select (select REPLACE(name,'.','') as cname  from categories where id = category_id ) as cname ,work_packages.subject,statuses.id, statuses.name as statusname, " +
            "(select COUNT(1) " +
            "from work_packages i " +
            "where i.project_id in ( "+stringSqlProjectsSubProjects+" ) " +
            "and i.status_id = statuses.id and i.category_id = work_packages.category_id   ) as totalIssueCount " +
            "from work_packages, statuses " +
            "where work_packages.project_id in ( "+stringSqlProjectsSubProjects+" ) " +
            "group by work_packages.category_id ,statuses.id " +
            "order by 1,3;";

        var query = "select assigned_to_id, (select firstname from users where id = assigned_to_id) as assigned_first_name, (select lastname from users where id = assigned_to_id) as assigned_last_name,"
            + " work_packages.id, statuses.name,"
            + " (select COUNT(1)"
            + " from work_packages i"
            + " where i.project_id in (" + stringSqlProjectsSubProjects + ")"
            + " and ((i.assigned_to_id = work_packages.assigned_to_id and i.assigned_to_id is not null)or(i.assigned_to_id is null and work_packages.assigned_to_id is null)) and i.status_id = statuses.id) as totalassignedbystatuses"
            + " from work_packages, statuses"
            + " where project_id in (" + stringSqlProjectsSubProjects + ")"
            + " group by assigned_to_id, assigned_first_name, assigned_last_name, statuses.id, statuses.name"
            + " order by 2,3;";


        var preProcess = function (completed) {
            openProjectDB.runQuery(0, issueByCategoryQuery, function (data2) {
                if ((data2.erroemsg == null ) ) {
                    if (data2.rows == undefined) {
                        callBack({errorMsg: "GetHumanResourceReport::Row2 is undefined"});
                        return;
                    }

                    var issueCnt = stringSqlProjectsSubProjects = data2.rows.length;
                    var dataArray = data2.rows;
                    var groupA = groupArray(dataArray, 'cname');

                    var viewData = {};
                    var issueReport2=[];
                    //var colInfo = ["New / Request","In Progress","Resolved","Reopen","Closed"];
                    var colInfo = [];
                    try{
                        for (groupIdx in groupA) {
                            var project_id = groupA[groupIdx][0].project_id;
                            var name = groupA[groupIdx][0].cname;
                            var totalIssueCount = 0;

                            for (idx = 0; idx < groupA[groupIdx].length; idx++) {
                                var issueName = groupA[groupIdx][idx].statusname;
                                var issueCount = groupA[groupIdx][idx].totalIssueCount;
                                totalIssueCount=+issueCount;

                                if(issueCount>0){
                                    if( colInfo.indexOf(issueName) == -1 )
                                        colInfo.push(issueName);

                                    if(issueCount>0)
                                        issueReport2.push({name:name,totalIssueCount:totalIssueCount});
                                }

                                if( name in viewData){
                                    viewData[name].issueCountInfo[issueName] =  issueCount;
                                }else{
                                    viewData[name] = {
                                        name:name,
                                        issueCountInfo :{}
                                    }
                                    viewData[name].issueCountInfo[issueName] = issueCount;
                                }
                            }

                        }

                        for (groupIdx in groupA) {
                            var name = groupA[groupIdx][0].cname;

                            colInfo.forEach( function (issueName) {
                                if( (issueName in viewData[name].issueCountInfo) == false ){
                                    viewData[name].issueCountInfo[issueName] = 0;
                                }
                            });
                        }

                    }catch (e){
                        callBack({errorMsg: e.message});
                        return;
                    }

                    completed({
                        viewData: viewData,
                        colInfo:colInfo,
                        issueReport2:issueReport2
                    });
                }
                else {
                    callBack({errorMsg: data2.erroemsg});
                    return;
                }
            });
        };

        preProcess(function (viewData2) {
            openProjectDB.runQuery(0, query, function (data2) {
                if ((data2.erroemsg == null ) ) {
                    if (data2.rows == undefined) {
                        callBack({errorMsg: "GetHumanResourceReport::Row2 is undefined"});
                        return;
                    }

                    var issueCnt = stringSqlProjectsSubProjects = data2.rows.length;
                    var dataArray = data2.rows;
                    var groupA = groupArray(dataArray, 'assigned_to_id');
                    var groupB = groupArray(dataArray, 'name');

                    var reportA = [];

                    for (userID in groupA) {
                        var assigned_first_name = groupA[userID][0].assigned_first_name;
                        var assigned_last_name = groupA[userID][0].assigned_last_name;
                        var id = groupA[userID][0].id;
                        var totalassignedbystatuses = 0;
                        for (idx = 0; idx < groupA[userID].length; idx++) {
                            totalassignedbystatuses += groupA[userID][idx].totalassignedbystatuses;
                        }
                        if (totalassignedbystatuses > 0)
                            reportA.push({
                                assigned_first_name: assigned_last_name+assigned_first_name,
                                assigned_last_name: assigned_last_name,
                                totalassignedbystatuses: totalassignedbystatuses,
                                id: id
                            });
                    }

                    var reportB = [];
                    var issueIsExist = {};

                    var viewData = {};
                    var colInfo = [];

                    //담당자별 진행현황
                    for (issueID in groupB) {

                        var name = groupB[issueID][0].name; //이슈네임
                        var issueName = name;

                        var groupC = groupArray(dataArray, 'assigned_to_id');
                        var reportC = [];
                        for (userID in groupC) {
                            var assigned_first_name = groupC[userID][0].assigned_first_name;
                            var assigned_last_name = groupC[userID][0].assigned_last_name;
                            var assigned_to_id = groupC[userID][0].assigned_to_id;
                            var id = groupC[userID][0].id;
                            var totalassignedbystatuses = 0;

                            for (idx = 0; idx < groupC[userID].length; idx++) {
                                if (name == groupC[userID][idx].name)
                                    totalassignedbystatuses += groupC[userID][idx].totalassignedbystatuses;
                            }

                            if(totalassignedbystatuses > 0){
                                issueIsExist[name] = true;

                                if( colInfo.indexOf(issueName) == -1 )
                                    colInfo.push(issueName);
                            }

                            var userName = assigned_last_name+assigned_first_name;

                            if( userName in viewData){
                                viewData[userName].issueCountInfo[issueName] =  totalassignedbystatuses;
                            }else{
                                viewData[userName] = {
                                    name:userName,
                                    issueCountInfo :{}
                                }
                                viewData[userName].issueCountInfo[issueName] = totalassignedbystatuses;
                            }


                            reportC.push({
                                assigned_first_name: assigned_last_name+assigned_first_name,
                                assigned_last_name: assigned_last_name,
                                totalassignedbystatuses: totalassignedbystatuses,
                                assigned_to_id: assigned_to_id,
                                id: id
                            });
                        }

                        if(issueIsExist[name] == true)
                            reportB.push({name: name, peoples: reportC});
                    }

                    var groupD = groupArray(dataArray, 'name');
                    //담당자별 진행 현황
                    var reportD = [];
                    for (issueID in groupD) {
                        var name = groupD[issueID][0].name;
                        var totalassignedbystatuses = 0;
                        for (idx = 0; idx < groupD[issueID].length; idx++) {
                            totalassignedbystatuses += groupD[issueID][idx].totalassignedbystatuses;
                        }

                        if (totalassignedbystatuses > 0){
                            reportD.push({name: name, totalassignedbystatuses: totalassignedbystatuses});
                        }
                    }

                    var projectName = me.projectInfoList[ prjID ].name;

                    callBack({
                        title: "Resource chart",
                        projectName:projectName,
                        statusesByAssigneds: dataArray,
                        totalIssues: issueCnt,
                        groupA: reportA,
                        groupB: reportB,
                        issueReport: reportD,
                        viewData : viewData2.viewData,
                        colInfo : viewData2.colInfo,
                        issueReport2:viewData2.issueReport2,
                        viewData2 : viewData,
                        colInfo2 : colInfo
                    });
                }
                else {
                    callBack({errorMsg: data2.erroemsg});
                    return;
                }
            });
        })
    },

    GetSubProjectReport: function (prjID , subPrjIds,callBack) {
        var stringSqlProjectsSubProjects = subPrjIds;
        var projectName = "";
        var query = "select (select REPLACE(name,'.','') as cname  from categories where id = category_id ) as cname ,work_packages.subject,statuses.id, statuses.name as statusname, " +
            "(select COUNT(1) " +
            "from work_packages i " +
            "where i.project_id in ( "+stringSqlProjectsSubProjects+" ) " +
            "and i.status_id = statuses.id and i.category_id = work_packages.category_id   ) as totalIssueCount " +
            "from work_packages, statuses " +
            "where work_packages.project_id in ( "+stringSqlProjectsSubProjects+" ) " +
            "group by work_packages.category_id ,statuses.id " +
            "order by 1,3;";

        var query2 = "select (select REPLACE(name,'.','') as cname  from projects where id = project_id ) as cname ,work_packages.project_id as project_id, work_packages.subject,statuses.id, statuses.name as statusname," +
            "(select COUNT(1) " +
            "from work_packages i " +
            "where i.project_id in ( "+stringSqlProjectsSubProjects+" ) " +
            "and i.status_id = statuses.id and i.project_id = work_packages.project_id   ) as totalIssueCount " +
            "from work_packages, statuses " +
            "where work_packages.project_id in ( "+stringSqlProjectsSubProjects+" ) " +
            "group by work_packages.project_id ,statuses.id " +
            "order by 1,3;"

        var query3 = "select (select name from versions where versions.id = fixed_version_id) as vname,  statuses.name as statusname,statuses.id,work_packages.project_id as project_id , " +
                "(select COUNT(1) " +
                "from work_packages i " +
                "where i.project_id in ( "+stringSqlProjectsSubProjects+" )  " +
                "and  i.status_id = statuses.id and i.fixed_version_id = work_packages.fixed_version_id  ) as totalIssueCount  " +
                "from work_packages, statuses " +
                "where work_packages.project_id in ( "+stringSqlProjectsSubProjects+" ) " +
                "group by work_packages.fixed_version_id , statuses.id " +
                "order by 1,3;"

        var me = this;

        var preProcess = function (completed) {
            openProjectDB.runQuery(0, query2, function (data) {
                if ((data.erroemsg == null ) ) {
                    if (data.rows == undefined) {
                        callBack({errorMsg: "GetHumanResourceReport::Row2 is undefined"});
                        return;
                    }

                    var issueCnt = stringSqlProjectsSubProjects = data.rows.length;
                    var dataArray = data.rows;
                    var groupA = groupArray(dataArray, 'cname');

                    var viewData = {};
                    //var colInfo = ["New / Request","In Progress","Resolved","Reopen","Closed"];
                    var colInfo = [];
                    var issueReport2=[];
                    try{
                        for (groupIdx in groupA) {
                            var project_id = groupA[groupIdx][0].project_id;
                            var name = groupA[groupIdx][0].cname;
                            var totalIssueCount = 0;

                            for (idx = 0; idx < groupA[groupIdx].length; idx++) {
                                var issueName = groupA[groupIdx][idx].statusname;
                                var issueCount = groupA[groupIdx][idx].totalIssueCount;
                                totalIssueCount+=issueCount;

                                if(issueCount>0){
                                    if( colInfo.indexOf(issueName) == -1 )
                                        colInfo.push(issueName);
                                }

                                if( name in viewData){
                                    viewData[name].issueCountInfo[issueName] =  issueCount;
                                }else{
                                    viewData[name] = {
                                        name:name,
                                        issueCountInfo :{}
                                    }
                                    viewData[name].issueCountInfo[issueName] = issueCount;
                                }
                            }

                            //
                            if(totalIssueCount>0){
                                issueReport2.push({name:name,totalIssueCount:totalIssueCount});
                            }


                        }

                        for (groupIdx in groupA) {
                            var name = groupA[groupIdx][0].cname;

                            colInfo.forEach( function (issueName) {
                                if( (issueName in viewData[name].issueCountInfo) == false ){
                                    viewData[name].issueCountInfo[issueName] = 0;
                                }
                            });
                        }

                    }catch (e){
                        callBack({errorMsg: e.message});
                        return;
                    }

                    completed({
                        viewData2: viewData,
                        colInfo2:colInfo,
                        issueReport2:issueReport2
                    });
                }
                else {
                    callBack({errorMsg: data2.erroemsg});
                    return;
                }
            });
        };

        var preProcess2 = function (completed) {
            openProjectDB.runQuery(0, query3, function (data3) {
                if ((data3.erroemsg == null ) ) {
                    if (data3.rows == undefined) {
                        callBack({errorMsg: "GetHumanResourceReport::data3 is undefined"});
                        return;
                    }

                    var issueCnt = stringSqlProjectsSubProjects = data3.rows.length;
                    var dataArray = data3.rows;
                    var groupA = groupArray(dataArray, 'vname');
                    var viewData = {};
                    var colInfo = [];

                    try{
                        for (groupIdx in groupA) {
                            var name = groupA[groupIdx][0].vname;
                            var totalIssueCount = 0;

                            for (idx = 0; idx < groupA[groupIdx].length; idx++) {
                                var issueName = groupA[groupIdx][idx].statusname;
                                var issueCount = groupA[groupIdx][idx].totalIssueCount;
                                totalIssueCount=issueCount;

                                if(totalIssueCount>0){
                                    if( colInfo.indexOf(issueName) == -1 )
                                        colInfo.push(issueName);
                                }

                                if( name in viewData){
                                    viewData[name].issueCountInfo[issueName] =  totalIssueCount;
                                }else{
                                    viewData[name] = {
                                        name:name,
                                        issueCountInfo :{}
                                    }
                                    viewData[name].issueCountInfo[issueName] = totalIssueCount;
                                }
                            }
                        }

                        for (groupIdx in groupA) {
                            var name = groupA[groupIdx][0].vname;

                            colInfo.forEach( function (issueName) {
                                if( (issueName in viewData[name].issueCountInfo) == false ){
                                    viewData[name].issueCountInfo[issueName] = 0;
                                }
                            });
                        }
                        completed({
                            viewData2: viewData,
                            colInfo2:colInfo
                        });
                    }catch (e){
                        completed({
                            viewData2: null,
                            colInfo2:null
                        });
                    }

                }
                else {
                    callBack({errorMsg: data3.erroemsg});
                    return;
                }
            });

        }

        preProcess(function (chart2data) {
            preProcess2(function (chart3data) {
                openProjectDB.runQuery(0, query, function (data2) {
                    if ((data2.erroemsg == null ) ) {
                        if (data2.rows == undefined) {
                            callBack({errorMsg: "GetHumanResourceReport::Row2 is undefined"});
                            return;
                        }

                        var issueCnt = stringSqlProjectsSubProjects = data2.rows.length;
                        var dataArray = data2.rows;
                        var groupA = groupArray(dataArray, 'cname');

                        var viewData = {};
                        //var colInfo = ["New / Request","In Progress","Resolved","Reopen","Closed"];
                        var colInfo = [];
                        try{
                            for (groupIdx in groupA) {
                                var project_id = groupA[groupIdx][0].project_id;
                                var name = groupA[groupIdx][0].cname;
                                var totalIssueCount = 0;

                                for (idx = 0; idx < groupA[groupIdx].length; idx++) {
                                    var issueName = groupA[groupIdx][idx].statusname;
                                    var issueCount = groupA[groupIdx][idx].totalIssueCount;
                                    totalIssueCount=issueCount;

                                    if(totalIssueCount>0){
                                        if( colInfo.indexOf(issueName) == -1 )
                                            colInfo.push(issueName);
                                    }

                                    if( name in viewData){
                                        viewData[name].issueCountInfo[issueName] =  totalIssueCount;
                                    }else{
                                        viewData[name] = {
                                            name:name,
                                            issueCountInfo :{}
                                        }
                                        viewData[name].issueCountInfo[issueName] = totalIssueCount;
                                    }

                                }

                            }

                            for (groupIdx in groupA) {
                                var name = groupA[groupIdx][0].cname;

                                colInfo.forEach( function (issueName) {
                                    if( (issueName in viewData[name].issueCountInfo) == false ){
                                        viewData[name].issueCountInfo[issueName] = 0;
                                    }
                                });
                            }

                        }catch (e){
                            callBack({errorMsg: e.message});
                            return;
                        }

                        var projectName = me.projectInfoList[ prjID ].name;

                        //Todo: Remove Hard Code ( 프로젝트인지 업무요청인지 구분... )
                        var reportSubType = 0; // 0:프로젝트  1: 업무요청
                        if(projectName.indexOf("1-") > -1){
                            reportSubType = 1;
                            console.log("업무요청");
                        }

                        callBack({
                            projectName:projectName,
                            reportSubType:reportSubType,
                            title: "Resource chart",
                            viewData: viewData,
                            colInfo:colInfo,
                            viewData2:chart2data.viewData2,
                            colInfo2:chart2data.colInfo2,
                            viewData3:chart3data.viewData2,
                            colInfo3:chart3data.colInfo2,
                            issueReport2:chart2data.issueReport2
                        });

                        console.log("completed data");
                        console.log(chart2data);
                        console.log(chart3data);
                    }
                    else {
                        callBack({errorMsg: data2.erroemsg});
                        return;
                    }
                });
                
            })

        })

    },

    GetAllProjectReport: function (prjID,treeInfo,callBack) {
        var stringSqlProjectsSubProjects = prjID;
        var projectName = "";
        var query = "select project_id, work_packages.subject,statuses.id, statuses.name, "+
        "(select COUNT(1) "+
        "from work_packages i "+
        "where i.project_id in (" + stringSqlProjectsSubProjects +") "+
        "and i.status_id = statuses.id and i.project_id = work_packages.project_id ) as totalIssueCount " +
        "from work_packages, statuses "+
        "where project_id in (" + stringSqlProjectsSubProjects + ") "+
        "group by project_id, statuses.name " +
        "order by 1,3;";

        var query2 = "select id,name,parent_id from projects as pr " +
        "where pr.parent_id IS NOT NULL and  pr.id in(" + stringSqlProjectsSubProjects + ")";

        var preProcess = function (completed) {
            openProjectDB.runQuery(0, query2, function (data) {
                if ((data.erroemsg == null ) ) {
                    if (data.rows == undefined) {
                        callBack({errorMsg: "GetHumanResourceReport::Row2 is undefined"});
                        return;
                    }

                    var dataArray = data.rows;
                    var groupB = groupArray(dataArray, 'id');
                    var viewData2 = {}; //Project Count

                    try{
                        for (groupIdx in groupB) {
                            var project_id = String( groupB[groupIdx][0].id );
                            var project_name = groupB[groupIdx][0].name;
                            if(treeInfo[project_id]==undefined)
                                continue;

                            var parent_ID = treeInfo[ project_id ].parentInfo.id;
                            var parent_Name = treeInfo[ project_id ].parentInfo.name;

                            if(viewData2[parent_Name] ){
                                viewData2[parent_Name].count++;

                            }else{
                                viewData2[parent_Name] = { name:parent_Name, count:1};
                            }
                        }
                        //console.log(viewData2);
                        completed(viewData2);
                    }catch (e){
                        callBack({errorMsg: e.message});
                        return;
                    }
                }
                else {
                    callBack({errorMsg: data.erroemsg});
                    return;
                }
            });

        }

        preProcess( function (viewData2 ) {

            openProjectDB.runQuery(0, query, function (data2) {

                console.log(viewData2);
                if ((data2.erroemsg == null ) ) {
                    if (data2.rows == undefined) {
                        callBack({errorMsg: "GetHumanResourceReport::Row2 is undefined"});
                        return;
                    }

                    var issueCnt = stringSqlProjectsSubProjects = data2.rows.length;
                    var dataArray = data2.rows;
                    var groupA = groupArray(dataArray, 'project_id');
                    var viewData = {};

                    try{
                        for (groupIdx in groupA) {
                            var project_id = groupA[groupIdx][0].project_id;
                            var project_name = groupA[groupIdx][0].subject;
                            var parent_ID = treeInfo[ project_id ].parentInfo.id;
                            var parent_Name = treeInfo[ project_id ].parentInfo.name;

                            for (idx = 0; idx < groupA[groupIdx].length; idx++) {
                                var issueName = groupA[groupIdx][idx].name;
                                var issueCount = groupA[groupIdx][idx].totalIssueCount;

                                var CompletedCount = 0;
                                var InprogressCount = 0;
                                var NewRequest = 0;
                                var PendingCount = 0;
                                /*
                                if(issueName == "New/Request" ||  issueName == "Checking" || issueName ==  "Scheduled" ){
                                    NewRequest = Number(issueCount);
                                }else if(issueName == "Close"){
                                }*/

                                if(issueName == "Closed" || issueName == "Resolved"){
                                    CompletedCount = Number(issueCount);
                                }else{
                                    InprogressCount = Number(issueCount);
                                }

                                if( Number(issueCount) > 0 ){
                                    if( parent_ID in viewData){
                                        var EInprogressCount = Number(viewData[parent_ID].InprogressCount) +  Number(InprogressCount);
                                        var ECompletedCount = Number(viewData[parent_ID].CompletedCount)  +  Number(CompletedCount);


                                        var ETotalCount = Number( viewData[parent_ID].TotalCount )  +  Number(issueCount);


                                        viewData[parent_ID] = { name:parent_Name , InprogressCount: EInprogressCount,CompletedCount: ECompletedCount, TotalCount: ETotalCount };
                                    }else{
                                        viewData[parent_ID] = { name:parent_Name, InprogressCount:InprogressCount, CompletedCount:CompletedCount, TotalCount: issueCount };
                                    }
                                }
                            }
                        }
                    }catch (e){
                        callBack({errorMsg: e.message});
                        return;
                    }

                    callBack({
                        title: "Resource chart",
                        viewData: viewData,
                        viewData2:viewData2
                    });
                }
                else {
                    callBack({errorMsg: data2.erroemsg});
                    return;
                }
            });

        });


    },

    GetOperatorType: function (prjID,treeInfo,callBack) {
        var stringSqlProjectsSubProjects = prjID;
        var projectName = "";
        var query = "select project_id, work_packages.subject,types.id, types.name, "+
            "(select COUNT(1) "+
            "from work_packages i "+
            "where i.project_id in (" + stringSqlProjectsSubProjects +") "+
            "and i.type_id = types.id and i.project_id = work_packages.project_id ) as totalIssueCount " +
            "from work_packages, types "+
            "where project_id in (" + stringSqlProjectsSubProjects + ") "+
            "group by project_id, types.name " +
            "order by 1,3;";

        var query = "select (select REPLACE(name,'.','')  from versions where id = fixed_version_id ) as cname , " +
            "(select REPLACE(REPLACE(name,'.',''),'/','') from categories where id = category_id ) as vname , " +
            "work_packages.fixed_version_id as category_id, " +
            "work_packages.project_id, " +
            "work_packages.subject, " +
            "(select name from types where types.id = work_packages.type_id) as name, " +
            "DATE_FORMAT( work_packages.updated_at , '%Y%m') as dateGroup, " +
            "count(*) as totalIssueCount " +
            "from work_packages " +
            "where work_packages.project_id in ( " + prjID +" ) " +
            "group by project_id,name; ";


        openProjectDB.runQuery(0, query, function (data2) {
            if ((data2.erroemsg == null ) ) {
                if (data2.rows == undefined) {
                    callBack({errorMsg: "GetHumanResourceReport::Row2 is undefined"});
                    return;
                }
                var headercols = [];

                var issueCnt = stringSqlProjectsSubProjects = data2.rows.length;
                var dataArray = data2.rows;
                var groupA = groupArray(dataArray, 'project_id');
                var viewData = {};

                try{
                    for (groupIdx in groupA) {
                        var project_id = groupA[groupIdx][0].project_id;
                        var project_name = groupA[groupIdx][0].subject;
                        var parent_ID = treeInfo[ project_id ].parentInfo.id;
                        var parent_Name = treeInfo[ project_id ].parentInfo.name;

                        for (idx = 0; idx < groupA[groupIdx].length; idx++) {
                            var issueName = groupA[groupIdx][idx].name;
                            var issueCount = groupA[groupIdx][idx].totalIssueCount;

                            var EpicCnt = 0;
                            var TaskCnt = 0;
                            var BugCnt = 0;
                            var MilesstoneCnt = 0;
                            var PhaseCnt = 0;
                            var FeatureCnt = 0;
                            var UserstoryCnt = 0;

                             if(issueName == "Epic" ){
                                 EpicCnt = Number(issueCount);
                             }else if(issueName == "Task"){
                                 TaskCnt = Number(issueCount);
                             }else if( issueName == "Bug" ){
                                 BugCnt = Number(issueCount);
                             }else if( issueName == "Milestone" ){
                                 MilesstoneCnt = Number(issueCount);
                             }else if( issueName == "Phase" ){
                                 PhaseCnt = Number(issueCount);
                             }else if( issueName == "Feature" ){
                                 FeatureCnt = Number(issueCount);
                             }else if( issueName == "Userstory" ){
                                 UserstoryCnt = Number(issueCount);
                             }else{
                                 continue;
                             }

                            if( Number(issueCount) > 0 ){
                                if( parent_ID in viewData){
                                    var EEpicCnt = Number(viewData[parent_ID].EpicCnt) +  Number(EpicCnt);
                                    var ETaskCnt = Number(viewData[parent_ID].TaskCnt) +  Number(TaskCnt);
                                    var EBugCnt = Number(viewData[parent_ID].BugCnt) +  Number(BugCnt);
                                    var EMilesstoneCnt = Number(viewData[parent_ID].MilesstoneCnt) +  Number(MilesstoneCnt);
                                    var EPhaseCnt = Number(viewData[parent_ID].PhaseCnt) +  Number(PhaseCnt);
                                    var EFeatureCnt = Number(viewData[parent_ID].FeatureCnt) +  Number(FeatureCnt);
                                    var EUserstoryCnt = Number(viewData[parent_ID].UserstoryCnt) +  Number(UserstoryCnt);
                                    var ETotalCount = Number( viewData[parent_ID].TotalCount )  +  Number(issueCount);
                                    viewData[parent_ID] = { name:parent_Name ,
                                        EpicCnt: EEpicCnt,TaskCnt: ETaskCnt,BugCnt: EBugCnt,MilesstoneCnt: EMilesstoneCnt,
                                        PhaseCnt: EPhaseCnt,FeatureCnt: EFeatureCnt,UserstoryCnt: EUserstoryCnt,
                                        TotalCount: ETotalCount };
                                }else{
                                    viewData[parent_ID] = { name:parent_Name,
                                        EpicCnt: EpicCnt,TaskCnt: TaskCnt,BugCnt: BugCnt,MilesstoneCnt: MilesstoneCnt,
                                        PhaseCnt: PhaseCnt,FeatureCnt: FeatureCnt,UserstoryCnt: UserstoryCnt,
                                        TotalCount: issueCount };
                                }
                            }
                        }
                    }
                }catch (e){
                    callBack({errorMsg: e.message});
                    return;
                }

                var items = [];

                for (var key in viewData) {
                    var curData = viewData[key];
                    headercols.push(curData.name);
                    items.push( curData );
                }

                callBack({
                    headercols: headercols,
                    items: items
                });
            }
            else {
                callBack({errorMsg: data2.erroemsg});
                return;
            }
        });
    },

    GetOperatorTypeDep3: function (prjID,treeInfo,callBack) {
        console.log(treeInfo);
        var stringSqlProjectsSubProjects = prjID;
        var projectName = "";
        var query2 = "select (select REPLACE(name,'.','') as cname  from types where id = type_id ) as cname ,work_packages.subject,statuses.id, statuses.name as name, type_id," +
            "(select COUNT(1) " +
            "from work_packages i " +
            "where i.project_id in ( "+stringSqlProjectsSubProjects+" ) " +
            "and i.status_id = statuses.id and i.category_id = work_packages.category_id   ) as totalIssueCount " +
            "from work_packages, statuses " +
            "where work_packages.project_id in ( "+stringSqlProjectsSubProjects+" ) " +
            "group by work_packages.category_id ,statuses.id " +
            "order by 1,3;";


        var query = "select (select REPLACE(name,'.','')  from versions where id = fixed_version_id ) as vname , " +
            "(select REPLACE(name,'.','') as cname  from types where id = type_id ) as cname , " +
            "work_packages.type_id as category_id, " +
            "work_packages.project_id, " +
            "work_packages.subject, " +
            "(select name from statuses where statuses.id = work_packages.status_id) as name, " +
            "DATE_FORMAT( work_packages.updated_at , '%Y%m') as dateGroup, " +
            "count(*) as totalIssueCount " +
            "from work_packages " +
            "where work_packages.project_id in ( " + prjID +" ) " +
            "group by cname,name; ";


        openProjectDB.runQuery(0, query, function (data2) {
            if ((data2.erroemsg == null ) ) {
                if (data2.rows == undefined) {
                    callBack({errorMsg: "GetHumanResourceReport::Row2 is undefined"});
                    return;
                }
                var headercols = [];

                var issueCnt = stringSqlProjectsSubProjects = data2.rows.length;
                var dataArray = data2.rows;
                var groupA = groupArray(dataArray, 'cname');
                var viewData = {};

                try{
                    for (groupIdx in groupA) {
                        //var project_id = groupA[groupIdx][0].project_id;
                        //var project_name = groupA[groupIdx][0].subject;

                        var parent_ID = groupA[groupIdx][0].type_id;
                        var parent_Name = groupA[groupIdx][0].cname;


                        for (idx = 0; idx < groupA[groupIdx].length; idx++) {
                            var issueName = groupA[groupIdx][idx].name;
                            var issueCount = groupA[groupIdx][idx].totalIssueCount;

                            var CompletedCount = 0;
                            var InprogressCount = 0;
                            var NewRequestCount = 0;
                            var PendingCount = 0;

                            if(issueName == "New/Request" || issueName == "New / Request" ||  issueName == "Checking" || issueName ==  "Scheduled" ){
                                NewRequestCount = Number(issueCount);
                            }else if( issueName == "Closed" || issueName == "Resolved" ){
                                CompletedCount = Number(issueCount);
                            }else if( issueName == "On hold" || issueName == "Pending" || issueName == "Verified" || issueName == "Opinion" ){
                                PendingCount = Number(issueCount);
                            }else{
                                InprogressCount = Number(issueCount);
                            }

                            if( Number(issueCount) > 0 ){
                                if( parent_ID in viewData){
                                    var EInprogressCount = Number(viewData[parent_ID].InprogressCount) +  Number(InprogressCount);
                                    var ECompletedCount = Number(viewData[parent_ID].CompletedCount)  +  Number(CompletedCount);
                                    var ENewRequestCount = Number(viewData[parent_ID].NewRequestCount)  +  Number(NewRequestCount);
                                    var EPendingCount = Number(viewData[parent_ID].PendingCount)  +  Number(PendingCount);
                                    var ETotalCount = Number( viewData[parent_ID].TotalCount )  +  Number(issueCount);
                                    viewData[parent_ID] = { name:parent_Name , InprogressCount: EInprogressCount,CompletedCount: ECompletedCount, TotalCount: ETotalCount ,NewRequestCount:ENewRequestCount,PendingCount:EPendingCount };
                                }else{
                                    viewData[parent_ID] = { name:parent_Name, InprogressCount:InprogressCount, CompletedCount:CompletedCount, TotalCount: issueCount ,NewRequestCount:NewRequestCount,PendingCount:PendingCount };
                                }
                            }
                        }
                    }
                }catch (e){
                    callBack({errorMsg: e.message});
                    return;
                }

                var items = [];

                for (var key in viewData) {
                    var curData = viewData[key];
                    headercols.push(curData.name);
                    items.push( curData );
                }

                callBack({
                    headercols: headercols,
                    items: items
                });
            }
            else {
                callBack({errorMsg: data2.erroemsg});
                return;
            }
        });
    },

    GetOperatorState: function (prjID,treeInfo,callBack) {
        console.log(prjID);
        var stringSqlProjectsSubProjects = prjID;
        var projectName = "";
        var query2 = "select project_id, work_packages.subject,statuses.id, statuses.name, "+
            "(select COUNT(1) "+
            "from work_packages i "+
            "where i.project_id in (" + stringSqlProjectsSubProjects +") "+
            "and i.status_id = statuses.id and i.project_id = work_packages.project_id ) as totalIssueCount " +
            "from work_packages, statuses "+
            "where project_id in (" + stringSqlProjectsSubProjects + ") "+
            "group by project_id, statuses.name " +
            "order by 1,3;";

        var query = "select (select REPLACE(name,'.','')  from versions where id = fixed_version_id ) as cname , " +
            "(select REPLACE(REPLACE(name,'.',''),'/','') from categories where id = category_id ) as vname , " +
            "work_packages.fixed_version_id as category_id, " +
            "work_packages.project_id, " +
            "work_packages.subject, " +
            "(select name from statuses where statuses.id = work_packages.status_id) as name, " +
            "DATE_FORMAT( work_packages.updated_at , '%Y%m') as dateGroup, " +
            "count(*) as totalIssueCount " +
            "from work_packages " +
            "where work_packages.project_id in ( " + prjID +" ) " +
            "group by project_id,name; ";


        openProjectDB.runQuery(0, query, function (data2) {
            if ((data2.erroemsg == null ) ) {
                if (data2.rows == undefined) {
                    callBack({errorMsg: "GetHumanResourceReport::Row2 is undefined"});
                    return;
                }
                var headercols = [];

                var issueCnt = stringSqlProjectsSubProjects = data2.rows.length;
                var dataArray = data2.rows;
                var groupA = groupArray(dataArray, 'project_id');
                var viewData = {};

                try{
                    for (groupIdx in groupA) {
                        var project_id = groupA[groupIdx][0].project_id;
                        var project_name = groupA[groupIdx][0].subject;
                        var parent_ID = treeInfo[ project_id ].parentInfo.id;
                        var parent_Name = treeInfo[ project_id ].parentInfo.name;

                        for (idx = 0; idx < groupA[groupIdx].length; idx++) {
                            var issueName = groupA[groupIdx][idx].name;
                            var issueCount = groupA[groupIdx][idx].totalIssueCount;

                            var CompletedCount = 0;
                            var InprogressCount = 0;
                            var NewRequestCount = 0;
                            var PendingCount = 0;

                            if(issueName == "New/Request" || issueName == "New / Request" ||  issueName == "Checking" || issueName ==  "Scheduled" ){
                                NewRequestCount = Number(issueCount);
                            }else if( issueName == "Closed" || issueName == "Resolved" ){
                                CompletedCount = Number(issueCount);
                            }else if( issueName == "On hold" || issueName == "Pending" || issueName == "Verified" || issueName == "Opinion" ){
                                PendingCount = Number(issueCount);
                            }else{
                                InprogressCount = Number(issueCount);
                            }

                            if( Number(issueCount) > 0 ){
                                if( parent_ID in viewData){
                                    var EInprogressCount = Number(viewData[parent_ID].InprogressCount) +  Number(InprogressCount);
                                    var ECompletedCount = Number(viewData[parent_ID].CompletedCount)  +  Number(CompletedCount);
                                    var ENewRequestCount = Number(viewData[parent_ID].NewRequestCount)  +  Number(NewRequestCount);
                                    var EPendingCount = Number(viewData[parent_ID].PendingCount)  +  Number(PendingCount);
                                    var ETotalCount = Number( viewData[parent_ID].TotalCount )  +  Number(issueCount);
                                    viewData[parent_ID] = { name:parent_Name , InprogressCount: EInprogressCount,CompletedCount: ECompletedCount, TotalCount: ETotalCount ,NewRequestCount:ENewRequestCount,PendingCount:EPendingCount };
                                }else{
                                    viewData[parent_ID] = { name:parent_Name, InprogressCount:InprogressCount, CompletedCount:CompletedCount, TotalCount: issueCount ,NewRequestCount:NewRequestCount,PendingCount:PendingCount };
                                }
                            }
                        }
                    }
                }catch (e){
                    callBack({errorMsg: e.message});
                    return;
                }

                var items = [];

                for (var key in viewData) {
                    var curData = viewData[key];
                    headercols.push(curData.name);
                    items.push( curData );
                }

                callBack({
                    headercols: headercols,
                    items: items
                });
            }
            else {
                callBack({errorMsg: data2.erroemsg});
                return;
            }
        });
    },

    GetOperatorStateDep2: function (prjID,treeInfo,callBack) {
        console.log(treeInfo);
        var stringSqlProjectsSubProjects = prjID;
        var projectName = "";
        var query2 = "select project_id, work_packages.subject,statuses.id, statuses.name, "+
            "(select COUNT(1) "+
            "from work_packages i "+
            "where i.project_id in (" + stringSqlProjectsSubProjects +") "+
            "and i.status_id = statuses.id and i.project_id = work_packages.project_id ) as totalIssueCount " +
            "from work_packages, statuses "+
            "where project_id in (" + stringSqlProjectsSubProjects + ") "+
            "group by project_id, statuses.name " +
            "order by 1,3;";

        var query = "select (select REPLACE(name,'.','')  from versions where id = fixed_version_id ) as cname , " +
            "(select REPLACE(REPLACE(name,'.',''),'/','') from categories where id = category_id ) as vname , " +
            "work_packages.fixed_version_id as category_id, " +
            "work_packages.project_id, " +
            "work_packages.subject, " +
            "(select name from statuses where statuses.id = work_packages.status_id) as name, " +
            "DATE_FORMAT( work_packages.updated_at , '%Y%m') as dateGroup, " +
            "count(*) as totalIssueCount " +
            "from work_packages " +
            "where work_packages.project_id in ( " + prjID +" ) " +
            "group by project_id,name; ";


        openProjectDB.runQuery(0, query, function (data2) {
            if ((data2.erroemsg == null ) ) {
                if (data2.rows == undefined) {
                    callBack({errorMsg: "GetHumanResourceReport::Row2 is undefined"});
                    return;
                }
                var headercols = [];

                var issueCnt = stringSqlProjectsSubProjects = data2.rows.length;
                var dataArray = data2.rows;
                var groupA = groupArray(dataArray, 'project_id');
                var viewData = {};

                try{
                    for (groupIdx in groupA) {
                        var project_id = groupA[groupIdx][0].project_id;
                        var project_name = groupA[groupIdx][0].subject;

                        var parent_ID = treeInfo[ project_id ].myInfo.id;
                        var parent_Name = treeInfo[ project_id ].myInfo.name;


                        for (idx = 0; idx < groupA[groupIdx].length; idx++) {
                            var issueName = groupA[groupIdx][idx].name;
                            var issueCount = groupA[groupIdx][idx].totalIssueCount;

                            var CompletedCount = 0;
                            var InprogressCount = 0;
                            var NewRequestCount = 0;
                            var PendingCount = 0;

                            if(issueName == "New/Request" || issueName == "New / Request" ||  issueName == "Checking" || issueName ==  "Scheduled" ){
                                NewRequestCount = Number(issueCount);
                            }else if( issueName == "Closed" || issueName == "Resolved" ){
                                CompletedCount = Number(issueCount);
                            }else if( issueName == "On hold" || issueName == "Pending" || issueName == "Verified" || issueName == "Opinion" ){
                                PendingCount = Number(issueCount);
                            }else{
                                InprogressCount = Number(issueCount);
                            }

                            if( Number(issueCount) > 0 ){
                                if( parent_ID in viewData){
                                    var EInprogressCount = Number(viewData[parent_ID].InprogressCount) +  Number(InprogressCount);
                                    var ECompletedCount = Number(viewData[parent_ID].CompletedCount)  +  Number(CompletedCount);
                                    var ENewRequestCount = Number(viewData[parent_ID].NewRequestCount)  +  Number(NewRequestCount);
                                    var EPendingCount = Number(viewData[parent_ID].PendingCount)  +  Number(PendingCount);
                                    var ETotalCount = Number( viewData[parent_ID].TotalCount )  +  Number(issueCount);
                                    viewData[parent_ID] = { name:parent_Name , InprogressCount: EInprogressCount,CompletedCount: ECompletedCount, TotalCount: ETotalCount ,NewRequestCount:ENewRequestCount,PendingCount:EPendingCount };
                                }else{
                                    viewData[parent_ID] = { name:parent_Name, InprogressCount:InprogressCount, CompletedCount:CompletedCount, TotalCount: issueCount ,NewRequestCount:NewRequestCount,PendingCount:PendingCount };
                                }
                            }
                        }
                    }
                }catch (e){
                    callBack({errorMsg: e.message});
                    return;
                }

                var items = [];

                for (var key in viewData) {
                    var curData = viewData[key];
                    headercols.push(curData.name);
                    items.push( curData );
                }

                callBack({
                    headercols: headercols,
                    items: items
                });
            }
            else {
                callBack({errorMsg: data2.erroemsg});
                return;
            }
        });
    },

    GetOperatorStateDep3: function (prjID,treeInfo,callBack) {
        console.log(treeInfo);
        var stringSqlProjectsSubProjects = prjID;
        var projectName = "";
        var query2 = "select (select REPLACE(name,'.','') as cname  from categories where id = category_id ) as cname ,work_packages.subject,statuses.id, statuses.name as name, category_id," +
            "(select COUNT(1) " +
            "from work_packages i " +
            "where i.project_id in ( "+stringSqlProjectsSubProjects+" ) " +
            "and i.status_id = statuses.id and i.category_id = work_packages.category_id   ) as totalIssueCount " +
            "from work_packages, statuses " +
            "where work_packages.project_id in ( "+stringSqlProjectsSubProjects+" ) " +
            "group by work_packages.category_id ,statuses.id " +
            "order by 1,3;";

        var query = "select (select REPLACE(name,'.','')  from versions where id = fixed_version_id ) as vname , " +
            "(select REPLACE(REPLACE(name,'.',''),'/','') from categories where id = category_id ) as cname , " +
            "work_packages.category_id as category_id, " +
            "work_packages.project_id, " +
            "work_packages.subject, " +
            "(select name from statuses where statuses.id = work_packages.status_id) as name, " +
            "DATE_FORMAT( work_packages.updated_at , '%Y%m') as dateGroup, " +
            "count(*) as totalIssueCount " +
            "from work_packages " +
            "where work_packages.project_id in ( " + prjID +" ) " +
            "group by cname,name; ";


        openProjectDB.runQuery(0, query, function (data2) {
            if ((data2.erroemsg == null ) ) {
                if (data2.rows == undefined) {
                    callBack({errorMsg: "GetHumanResourceReport::Row2 is undefined"});
                    return;
                }
                var headercols = [];

                var issueCnt = stringSqlProjectsSubProjects = data2.rows.length;
                var dataArray = data2.rows;
                var groupA = groupArray(dataArray, 'cname');
                var viewData = {};

                try{
                    for (groupIdx in groupA) {
                        //var project_id = groupA[groupIdx][0].project_id;
                        //var project_name = groupA[groupIdx][0].subject;

                        var parent_ID = groupA[groupIdx][0].category_id;
                        var parent_Name = groupA[groupIdx][0].cname;


                        for (idx = 0; idx < groupA[groupIdx].length; idx++) {
                            var issueName = groupA[groupIdx][idx].name;
                            var issueCount = groupA[groupIdx][idx].totalIssueCount;

                            var CompletedCount = 0;
                            var InprogressCount = 0;
                            var NewRequestCount = 0;
                            var PendingCount = 0;

                            if(issueName == "New/Request" || issueName == "New / Request" ||  issueName == "Checking" || issueName ==  "Scheduled" ){
                                NewRequestCount = Number(issueCount);
                            }else if( issueName == "Closed" || issueName == "Resolved" ){
                                CompletedCount = Number(issueCount);
                            }else if( issueName == "On hold" || issueName == "Pending" || issueName == "Verified" || issueName == "Opinion" ){
                                PendingCount = Number(issueCount);
                            }else{
                                InprogressCount = Number(issueCount);
                            }

                            if( Number(issueCount) > 0 ){
                                if( parent_ID in viewData){
                                    var EInprogressCount = Number(viewData[parent_ID].InprogressCount) +  Number(InprogressCount);
                                    var ECompletedCount = Number(viewData[parent_ID].CompletedCount)  +  Number(CompletedCount);
                                    var ENewRequestCount = Number(viewData[parent_ID].NewRequestCount)  +  Number(NewRequestCount);
                                    var EPendingCount = Number(viewData[parent_ID].PendingCount)  +  Number(PendingCount);
                                    var ETotalCount = Number( viewData[parent_ID].TotalCount )  +  Number(issueCount);
                                    viewData[parent_ID] = { name:parent_Name , InprogressCount: EInprogressCount,CompletedCount: ECompletedCount, TotalCount: ETotalCount ,NewRequestCount:ENewRequestCount,PendingCount:EPendingCount };
                                }else{
                                    viewData[parent_ID] = { name:parent_Name, InprogressCount:InprogressCount, CompletedCount:CompletedCount, TotalCount: issueCount ,NewRequestCount:NewRequestCount,PendingCount:PendingCount };
                                }
                            }
                        }
                    }
                }catch (e){
                    callBack({errorMsg: e.message});
                    return;
                }

                var items = [];

                for (var key in viewData) {
                    var curData = viewData[key];
                    headercols.push(curData.name);
                    items.push( curData );
                }

                callBack({
                    headercols: headercols,
                    items: items
                });
            }
            else {
                callBack({errorMsg: data2.erroemsg});
                return;
            }
        });
    },

    GetOperatorStateDep2Ex: function (prjID,treeInfo,callBack) {
        console.log(treeInfo);
        var stringSqlProjectsSubProjects = prjID;
        var projectName = "";
        var query2 = "select project_id, work_packages.subject,statuses.id, statuses.name, "+
            "(select COUNT(1) "+
            "from work_packages i "+
            "where i.project_id in (" + stringSqlProjectsSubProjects +") "+
            "and i.status_id = statuses.id and i.project_id = work_packages.project_id ) as totalIssueCount " +
            "from work_packages, statuses "+
            "where project_id in (" + stringSqlProjectsSubProjects + ") "+
            "group by project_id, statuses.name " +
            "order by 1,3;";

        var query = "select (select REPLACE(name,'.','')  from versions where id = fixed_version_id ) as vname , " +
            "(select REPLACE(REPLACE(name,'.',''),'/','') from categories where id = category_id ) as cname , " +
            "work_packages.category_id as category_id, " +
            "(select name from statuses where statuses.id = work_packages.status_id) as name, " +
            "work_packages.project_id, " +
            "work_packages.subject, " +
            "DATE_FORMAT( work_packages.updated_at , '%Y%m') as dateGroup, " +
            "count(*) as totalIssueCount " +
            "from work_packages " +
            "where work_packages.project_id in ( " + prjID +" ) " +
            "group by name; ";


        openProjectDB.runQuery(0, query, function (data2) {
            if ((data2.erroemsg == null ) ) {
                if (data2.rows == undefined) {
                    callBack({errorMsg: "GetHumanResourceReport::Row2 is undefined"});
                    return;
                }
                var headercols = [];

                var issueCnt = stringSqlProjectsSubProjects = data2.rows.length;
                var dataArray = data2.rows;
                var groupA = groupArray(dataArray, 'name');
                var viewData = {};

                try{
                    for (groupIdx in groupA) {
                        var project_id = groupA[groupIdx][0].project_id;
                        var project_name = groupA[groupIdx][0].subject;

                        //var parent_ID = treeInfo[ project_id ].myInfo.id;
                        //var parent_Name = treeInfo[ project_id ].myInfo.name;


                        for (idx = 0; idx < groupA[groupIdx].length; idx++) {
                            var issueName = groupA[groupIdx][idx].name;
                            var issueCount = groupA[groupIdx][idx].totalIssueCount;

                            if( Number(issueCount) > 0 ){
                                viewData[issueName] = {name:issueName,data:issueCount}

                            }
                        }
                    }
                }catch (e){
                    callBack({errorMsg: e.message});
                    return;
                }

                var items = [];

                for (var key in viewData) {
                    var curData = viewData[key];
                    headercols.push(curData.name);
                    items.push( curData );
                }

                callBack({
                    headercols: headercols,
                    items: items
                });
            }
            else {
                callBack({errorMsg: data2.erroemsg});
                return;
            }
        });
    },

    GetCategoriStateDep2: function (prjID,treeInfo,callBack) {
        console.log(treeInfo);
        var stringSqlProjectsSubProjects = prjID;
        var projectName = "";
        var query2 = "select (select REPLACE(name,'.','') as cname  from categories where id = category_id ) as cname ,work_packages.subject,statuses.id, statuses.name as name, category_id," +
            "(select COUNT(1) " +
            "from work_packages i " +
            "where i.project_id in ( "+stringSqlProjectsSubProjects+" ) " +
            "and i.status_id = statuses.id and i.category_id = work_packages.category_id   ) as totalIssueCount " +
            "from work_packages, statuses " +
            "where work_packages.project_id in ( "+stringSqlProjectsSubProjects+" ) " +
            "group by work_packages.category_id ,statuses.id " +
            "order by 1,3;";

        var query = "select (select REPLACE(name,'.','')  from versions where id = fixed_version_id ) as vname , " +
            "(select REPLACE(REPLACE(name,'.',''),'/','') from categories where id = category_id ) as cname , " +
            "work_packages.category_id as category_id, " +
            "(select name from statuses where statuses.id = work_packages.status_id) as name, " +
            "DATE_FORMAT( work_packages.updated_at , '%Y%m') as dateGroup, " +
            "count(*) as totalIssueCount " +
            "from work_packages " +
            "where work_packages.project_id in ( " + prjID +" ) " +
            "group by cname,name; ";


        openProjectDB.runQuery(0, query, function (data2) {
            if ((data2.erroemsg == null ) ) {
                if (data2.rows == undefined) {
                    callBack({errorMsg: "GetHumanResourceReport::Row2 is undefined"});
                    return;
                }
                var headercols = [];

                var issueCnt = stringSqlProjectsSubProjects = data2.rows.length;
                var dataArray = data2.rows;
                var groupA = groupArray(dataArray, 'cname');
                var viewData = {};

                try{
                    for (groupIdx in groupA) {
                        //var project_id = groupA[groupIdx][0].project_id;
                        //var project_name = groupA[groupIdx][0].subject;

                        var parent_ID = groupA[groupIdx][0].category_id;
                        var parent_Name = groupA[groupIdx][0].cname;


                        for (idx = 0; idx < groupA[groupIdx].length; idx++) {
                            var issueName = groupA[groupIdx][idx].name;
                            var issueCount = groupA[groupIdx][idx].totalIssueCount;

                            var CompletedCount = 0;
                            var InprogressCount = 0;
                            var NewRequestCount = 0;
                            var PendingCount = 0;

                            if(issueName == "New/Request" || issueName == "New / Request" ||  issueName == "Checking" || issueName ==  "Scheduled" ){
                                NewRequestCount = Number(issueCount);
                            }else if( issueName == "Closed" || issueName == "Resolved" ){
                                CompletedCount = Number(issueCount);
                            }else if( issueName == "On hold" || issueName == "Pending" || issueName == "Verified" || issueName == "Opinion" ){
                                PendingCount = Number(issueCount);
                            }else{
                                InprogressCount = Number(issueCount);
                            }

                            if( Number(issueCount) > 0 ){
                                if( parent_ID in viewData){
                                    var EInprogressCount = Number(viewData[parent_ID].InprogressCount) +  Number(InprogressCount);
                                    var ECompletedCount = Number(viewData[parent_ID].CompletedCount)  +  Number(CompletedCount);
                                    var ENewRequestCount = Number(viewData[parent_ID].NewRequestCount)  +  Number(NewRequestCount);
                                    var EPendingCount = Number(viewData[parent_ID].PendingCount)  +  Number(PendingCount);
                                    var ETotalCount = Number( viewData[parent_ID].TotalCount )  +  Number(issueCount);
                                    viewData[parent_ID] = { name:parent_Name , InprogressCount: EInprogressCount,CompletedCount: ECompletedCount, TotalCount: ETotalCount ,NewRequestCount:ENewRequestCount,PendingCount:EPendingCount };
                                }else{
                                    viewData[parent_ID] = { name:parent_Name, InprogressCount:InprogressCount, CompletedCount:CompletedCount, TotalCount: issueCount ,NewRequestCount:NewRequestCount,PendingCount:PendingCount };
                                }
                            }
                        }
                    }
                }catch (e){
                    callBack({errorMsg: e.message});
                    return;
                }

                var items = [];
                var items2= [];

                for (var key in viewData) {
                    var curData = viewData[key];
                    headercols.push(curData.name);
                    items.push( curData );
                    items2.push( {name:curData.name , data:curData.TotalCount } );
                }

                callBack({
                    lineData:{
                        headercols: headercols,
                        items: items
                    },
                    pieData:{
                        headercols: headercols,
                        items: items2
                    }

                });
            }
            else {
                callBack({errorMsg: data2.erroemsg});
                return;
            }
        });
    },

    GetConsumptionStateDep2: function (prjID,treeInfo,callBack) {
        console.log(treeInfo);
        var stringSqlProjectsSubProjects = prjID;
        var projectName = "";
        var query2 = "select (select REPLACE(name,'.','') as cname  from versions where id = fixed_version_id ) as cname ,work_packages.subject,statuses.id, statuses.name as name, category_id," +
            "(select COUNT(1) " +
            "from work_packages i " +
            "where i.project_id in ( "+stringSqlProjectsSubProjects+" ) " +
            "and i.status_id = statuses.id and i.fixed_version_id = work_packages.fixed_version_id   ) as totalIssueCount " +
            "from work_packages, statuses " +
            "where work_packages.project_id in ( "+stringSqlProjectsSubProjects+" ) " +
            "group by cname,statuses.id " +
            "order by 1,3;";

        var query = "select (select REPLACE(name,'.','')  from versions where id = fixed_version_id ) as cname , " +
            "work_packages.fixed_version_id as category_id, " +
            "(select REPLACE(REPLACE(name,'.',''),'/','') from categories where id = category_id ) as vname , " +
            "(select name from statuses where statuses.id = work_packages.status_id) as name, " +
            "DATE_FORMAT( work_packages.updated_at , '%Y%m') as dateGroup, " +
            "count(*) as totalIssueCount " +
            "from work_packages " +
            "where work_packages.project_id in ( " + prjID +" ) " +
            "group by cname,name; ";


        openProjectDB.runQuery(0, query, function (data2) {
            if ((data2.erroemsg == null ) ) {
                if (data2.rows == undefined) {
                    callBack({errorMsg: "GetHumanResourceReport::Row2 is undefined"});
                    return;
                }
                var headercols = [];

                var issueCnt = stringSqlProjectsSubProjects = data2.rows.length;
                var dataArray = data2.rows;
                var groupA = groupArray(dataArray, 'cname');
                var viewData = {};

                try{
                    for (groupIdx in groupA) {
                        //var project_id = groupA[groupIdx][0].project_id;
                        //var project_name = groupA[groupIdx][0].subject;

                        var parent_ID = groupA[groupIdx][0].category_id;
                        var parent_Name = groupA[groupIdx][0].cname;


                        for (idx = 0; idx < groupA[groupIdx].length; idx++) {
                            var issueName = groupA[groupIdx][idx].name;
                            var issueCount = groupA[groupIdx][idx].totalIssueCount;

                            var CompletedCount = 0;
                            var InprogressCount = 0;
                            var NewRequestCount = 0;
                            var PendingCount = 0;

                            if(issueName == "New/Request"  || issueName == "New / Request"||  issueName == "Checking" || issueName ==  "Scheduled" ){
                                NewRequestCount = Number(issueCount);
                            }else if( issueName == "Closed" || issueName == "Resolved" ){
                                CompletedCount = Number(issueCount);
                            }else if( issueName == "On hold" || issueName == "Pending" || issueName == "Verified" || issueName == "Opinion" ){
                                PendingCount = Number(issueCount);
                            }else{
                                InprogressCount = Number(issueCount);
                            }

                            if( Number(issueCount) > 0 ){
                                if( parent_ID in viewData){
                                    var EInprogressCount = Number(viewData[parent_ID].InprogressCount) +  Number(InprogressCount);
                                    var ECompletedCount = Number(viewData[parent_ID].CompletedCount)  +  Number(CompletedCount);
                                    var ENewRequestCount = Number(viewData[parent_ID].NewRequestCount)  +  Number(NewRequestCount);
                                    var EPendingCount = Number(viewData[parent_ID].PendingCount)  +  Number(PendingCount);
                                    var ETotalCount = Number( viewData[parent_ID].TotalCount )  +  Number(issueCount);
                                    viewData[parent_ID] = { name:parent_Name , InprogressCount: EInprogressCount,CompletedCount: ECompletedCount, TotalCount: ETotalCount ,NewRequestCount:ENewRequestCount,PendingCount:EPendingCount };
                                }else{
                                    viewData[parent_ID] = { name:parent_Name, InprogressCount:InprogressCount, CompletedCount:CompletedCount, TotalCount: issueCount ,NewRequestCount:NewRequestCount,PendingCount:PendingCount };
                                }
                            }
                        }
                    }
                }catch (e){
                    callBack({errorMsg: e.message});
                    return;
                }

                var items = [];
                var items2= [];

                for (var key in viewData) {
                    var curData = viewData[key];
                    headercols.push(curData.name);
                    items.push( curData );
                    items2.push( {name:curData.name , data:curData.TotalCount } );
                }

                callBack({
                    lineData:{
                        headercols: headercols,
                        items: items
                    },
                    pieData:{
                        headercols: headercols,
                        items: items2
                    }

                });
            }
            else {
                callBack({errorMsg: data2.erroemsg});
                return;
            }
        });
    },

    GetJoborderStateDep2: function (prjID,treeInfo,callBack) {
        console.log(treeInfo);
        var stringSqlProjectsSubProjects = prjID;
        var projectName = "";
        var query2 = "select (select REPLACE(name,'.','') as cname  from enumerations where id = priority_id ) as cname ,work_packages.subject,statuses.id, statuses.name as name, category_id," +
            "(select COUNT(1) " +
            "from work_packages i " +
            "where i.project_id in ( "+stringSqlProjectsSubProjects+" ) " +
            "and i.status_id = statuses.id and i.category_id = work_packages.category_id   ) as totalIssueCount " +
            "from work_packages, statuses " +
            "where work_packages.project_id in ( "+stringSqlProjectsSubProjects+" ) " +
            "group by work_packages.category_id ,statuses.id " +
            "order by 1,3;";

        var query = "select (select REPLACE(name,'.','')  from enumerations where id = priority_id ) as cname , " +
            "(select REPLACE(REPLACE(name,'.',''),'/','') from categories where id = category_id ) as vname , " +
            "work_packages.priority_id as category_id, " +
            "work_packages.project_id, " +
            "work_packages.subject, " +
            "(select name from statuses where statuses.id = work_packages.status_id) as name, " +
            "DATE_FORMAT( work_packages.updated_at , '%Y%m') as dateGroup, " +
            "count(*) as totalIssueCount " +
            "from work_packages " +
            "where work_packages.project_id in ( " + prjID +" ) " +
            "group by cname,name; ";


        openProjectDB.runQuery(0, query, function (data2) {
            if ((data2.erroemsg == null ) ) {
                if (data2.rows == undefined) {
                    callBack({errorMsg: "GetHumanResourceReport::Row2 is undefined"});
                    return;
                }
                var headercols = [];

                var issueCnt = stringSqlProjectsSubProjects = data2.rows.length;
                var dataArray = data2.rows;
                var groupA = groupArray(dataArray, 'cname');
                var viewData = {};

                try{
                    for (groupIdx in groupA) {
                        //var project_id = groupA[groupIdx][0].project_id;
                        //var project_name = groupA[groupIdx][0].subject;

                        var parent_ID = groupA[groupIdx][0].category_id;
                        var parent_Name = groupA[groupIdx][0].cname;


                        for (idx = 0; idx < groupA[groupIdx].length; idx++) {
                            var issueName = groupA[groupIdx][idx].name;
                            var issueCount = groupA[groupIdx][idx].totalIssueCount;

                            var CompletedCount = 0;
                            var InprogressCount = 0;
                            var NewRequestCount = 0;
                            var PendingCount = 0;

                            if(issueName == "New/Request" || issueName == "New / Request" ||  issueName == "Checking" || issueName ==  "Scheduled" ){
                                NewRequestCount = Number(issueCount);
                            }else if( issueName == "Closed" || issueName == "Resolved" ){
                                CompletedCount = Number(issueCount);
                            }else if( issueName == "On hold" || issueName == "Pending" || issueName == "Verified" || issueName == "Opinion" ){
                                PendingCount = Number(issueCount);
                            }else{
                                InprogressCount = Number(issueCount);
                            }

                            if( Number(issueCount) > 0 ){
                                if( parent_ID in viewData){
                                    var EInprogressCount = Number(viewData[parent_ID].InprogressCount) +  Number(InprogressCount);
                                    var ECompletedCount = Number(viewData[parent_ID].CompletedCount)  +  Number(CompletedCount);
                                    var ENewRequestCount = Number(viewData[parent_ID].NewRequestCount)  +  Number(NewRequestCount);
                                    var EPendingCount = Number(viewData[parent_ID].PendingCount)  +  Number(PendingCount);
                                    var ETotalCount = Number( viewData[parent_ID].TotalCount )  +  Number(issueCount);
                                    viewData[parent_ID] = { name:parent_Name , InprogressCount: EInprogressCount,CompletedCount: ECompletedCount, TotalCount: ETotalCount ,NewRequestCount:ENewRequestCount,PendingCount:EPendingCount };
                                }else{
                                    viewData[parent_ID] = { name:parent_Name, InprogressCount:InprogressCount, CompletedCount:CompletedCount, TotalCount: issueCount ,NewRequestCount:NewRequestCount,PendingCount:PendingCount };
                                }
                            }
                        }
                    }
                }catch (e){
                    callBack({errorMsg: e.message});
                    return;
                }

                var items = [];
                var items2= [];

                for (var key in viewData) {
                    var curData = viewData[key];
                    headercols.push(curData.name);
                    items.push( curData );
                    items2.push( {name:curData.name , data:curData.TotalCount } );
                }

                callBack({
                    lineData:{
                        headercols: headercols,
                        items: items
                    },
                    pieData:{
                        headercols: headercols,
                        items: items2
                    }

                });
            }
            else {
                callBack({errorMsg: data2.erroemsg});
                return;
            }
        });
    },


    GetHmanResource: function (prjID,treeInfo,callBack) {
        var stringSqlProjectsSubProjects = prjID;
        var projectName = "";
        var query = "select projects.id as project_id , projects.name as subject , group_users.group_id , parent_id, " +
            "(select COUNT(1) " +
            "from members i " +
            "where i.user_id = group_users.user_id and i.project_id = projects.id ) as totalIssueCount " +
            "from projects ,group_users "+
            "where id in (" + stringSqlProjectsSubProjects + ") "+
            "group by projects.id , group_users.group_id "+
            "order by 1,3;";


        openProjectDB.runQuery(0, query, function (data2) {
            if ((data2.erroemsg == null ) ) {
                if (data2.rows == undefined) {
                    callBack({errorMsg: "GetHumanResourceReport::Row2 is undefined"});
                    return;
                }
                var headercols = [];

                var issueCnt = stringSqlProjectsSubProjects = data2.rows.length;
                var dataArray = data2.rows;
                var groupA = groupArray(dataArray, 'project_id');
                var viewData = {};

                try{
                    for (groupIdx in groupA) {

                        var project_id = groupA[groupIdx][0].project_id;
                        var project_name = groupA[groupIdx][0].subject;

                        //if(treeInfo[ project_id ].parentInfo === undefined )
                          //  continue;

                        if( treeInfo[ project_id ] ===undefined )
                            continue;

                        var parent_ID = treeInfo[ project_id ].parentInfo.id;
                        var parent_Name = treeInfo[ project_id ].parentInfo.name;

                        for (idx = 0; idx < groupA[groupIdx].length; idx++) {
                            var groupID = groupA[groupIdx][idx].group_id;
                            var issueCount = groupA[groupIdx][idx].totalIssueCount;

                            var DevCnt = 0;
                            var DegisnCnt = 0;
                            var PlannerCnt = 0;

                            if( groupID == 8 || groupID == 9 || groupID == 10 ||groupID == 11 ||groupID == 233 ){
                                DevCnt = Number(issueCount);
                            }else if( groupID == 60  ){
                                DegisnCnt = Number(issueCount);
                            }else if( groupID == 26 || groupID == 49 || groupID == 51 ){
                                PlannerCnt = Number(issueCount);
                            }else{
                                continue;
                            }

                            if( Number(issueCount) > 0 ){
                                if( parent_ID in viewData){
                                    var EDevCnt = Number(viewData[parent_ID].DevCnt) +  Number(DevCnt);
                                    var EDegisnCnt = Number(viewData[parent_ID].DegisnCnt)  +  Number(DegisnCnt);
                                    var EPlannerCnt = Number(viewData[parent_ID].PlannerCnt)  +  Number(PlannerCnt);
                                    var ETotalCount = Number( viewData[parent_ID].TotalCount )  +  Number(issueCount);
                                    viewData[parent_ID] = { name:parent_Name ,
                                        DevCnt: EDevCnt,DegisnCnt: EDegisnCnt, PlannerCnt:EPlannerCnt,
                                        TotalCount: ETotalCount };
                                }else{
                                    viewData[parent_ID] = { name:parent_Name,
                                        DevCnt: DevCnt,DegisnCnt: DegisnCnt, PlannerCnt:PlannerCnt,
                                        TotalCount: issueCount };
                                }
                            }
                        }
                    }
                }catch (e){
                    callBack({errorMsg: e.message});
                    return;
                }

                var items = [];

                for (var key in viewData) {
                    var curData = viewData[key];
                    headercols.push(curData.name);
                    items.push( curData );
                }

                callBack({
                    headercols: headercols,
                    items: items
                });
            }
            else {
                callBack({errorMsg: data2.erroemsg});
                return;
            }
        });
    },

    GetHmanResourceDep2: function (prjID,treeInfo,callBack) {
        var stringSqlProjectsSubProjects = prjID;
        var projectName = "";
        var query2 = "select projects.id as project_id , projects.name as subject , group_users.group_id , parent_id, " +
            "(select COUNT(1) " +
            "from members i " +
            "where i.user_id = group_users.user_id and i.project_id = projects.id ) as totalIssueCount " +
            "from projects ,group_users "+
            "where id in (" + stringSqlProjectsSubProjects + ") "+
            "group by projects.id , group_users.group_id "+
            "order by 1,3;";

        var query = "select * from " +
        "( " +
            "select projects.id as project_id , projects.name as subject ,  group_id , parent_id as parent_id , group_users.user_id as user_id , projects.id + group_id*1000 as uid , " +
            "(select COUNT(1) " +
            "from members i " +
            "where i.user_id = group_users.user_id and i.project_id = projects.id ) as totalIssueCount " +
            "from projects ,group_users " +
            "where id in (" + stringSqlProjectsSubProjects + ") "+
            "group by projects.id ,group_id , user_id " +
            "order by 1,3 " +
            ") ts " +
            "where totalIssueCount > 0; ";


        console.log("GetHmanResourceDep2:"+stringSqlProjectsSubProjects);


        openProjectDB.runQuery(0, query, function (data2) {
            if ((data2.erroemsg == null ) ) {
                if (data2.rows == undefined) {
                    callBack({errorMsg: "GetHumanResourceReport::Row2 is undefined"});
                    return;
                }
                var headercols = [];

                var issueCnt = stringSqlProjectsSubProjects = data2.rows.length;
                var dataArray = data2.rows;
                var groupA = groupArray(dataArray, 'uid');
                var viewData = {};

                try{
                    for (groupIdx in groupA) {

                        var project_id = groupA[groupIdx][0].project_id;
                        var project_name = groupA[groupIdx][0].subject;

                        console.log(project_name);

                        //if(treeInfo[ project_id ].parentInfo === undefined )
                        //  continue;

                        if( treeInfo[ project_id ] ===undefined )
                            continue;

                        var parent_ID = treeInfo[ project_id ].myInfo.id;
                        var parent_Name = treeInfo[ project_id ].myInfo.name;

                        console.log(parent_Name);

                        for (idx = 0; idx < groupA[groupIdx].length; idx++) {
                            var groupID = groupA[groupIdx][idx].group_id;
                            var issueCount = groupA[groupIdx][idx].totalIssueCount;

                            var DevCnt = 0;
                            var DegisnCnt = 0;
                            var PlannerCnt = 0;

                            if( groupID == 8 || groupID == 9 || groupID == 10  ||groupID == 11 ||groupID == 233  ){
                                DevCnt = Number(issueCount);
                            }else if( groupID == 60  ){
                                DegisnCnt = Number(issueCount);
                            }else if( groupID == 26 || groupID == 49 || groupID == 51 ){
                                PlannerCnt = Number(issueCount);
                            }else{
                                continue;
                            }

                            if( Number(issueCount) > 0 ){
                                if( parent_ID in viewData){
                                    var EDevCnt = Number(viewData[parent_ID].DevCnt) +  Number(DevCnt);
                                    var EDegisnCnt = Number(viewData[parent_ID].DegisnCnt)  +  Number(DegisnCnt);
                                    var EPlannerCnt = Number(viewData[parent_ID].PlannerCnt)  +  Number(PlannerCnt);
                                    var ETotalCount = Number( viewData[parent_ID].TotalCount )  +  Number(issueCount);
                                    viewData[parent_ID] = { name:parent_Name ,
                                        DevCnt: EDevCnt,DegisnCnt: EDegisnCnt, PlannerCnt:EPlannerCnt,
                                        TotalCount: ETotalCount };
                                }else{
                                    viewData[parent_ID] = { name:parent_Name,
                                        DevCnt: DevCnt,DegisnCnt: DegisnCnt, PlannerCnt:PlannerCnt,
                                        TotalCount: issueCount };
                                }
                            }
                        }
                    }
                }catch (e){
                    callBack({errorMsg: e.message});
                    return;
                }

                var items = [];

                for (var key in viewData) {
                    var curData = viewData[key];
                    headercols.push(curData.name);
                    items.push( curData );
                }

                callBack({
                    headercols: headercols,
                    items: items
                });
            }
            else {
                callBack({errorMsg: data2.erroemsg});
                return;
            }
        });
    },

    GetHmanResourceDep3: function (prjID,treeInfo,callBack) {
        console.log(treeInfo);
        var stringSqlProjectsSubProjects = prjID;
        var projectName = "";
        var query = "select assigned_to_id, (select firstname from users where users.id = assigned_to_id) as assigned_first_name, (select lastname from users where users.id = assigned_to_id) as assigned_last_name, " +
            "work_packages.subject,statuses.id, statuses.name as name, type_id, " +
            "(select COUNT(1) " +
            "from work_packages i " +
            "where i.project_id in (" + stringSqlProjectsSubProjects + ") "+
            "and i.status_id = statuses.id and i.assigned_to_id = work_packages.assigned_to_id   ) as totalIssueCount " +
            "from work_packages, statuses " +
            "where work_packages.project_id in (" + stringSqlProjectsSubProjects + ") "+
            "and (work_packages.assigned_to_id is not null) " +
            "group by assigned_to_id , assigned_first_name, statuses.id , statuses.name " +
            "order by 1,3;";


        openProjectDB.runQuery(0, query, function (data2) {
            if ((data2.erroemsg == null ) ) {
                if (data2.rows == undefined) {
                    callBack({errorMsg: "GetHumanResourceReport::Row2 is undefined"});
                    return;
                }
                var headercols = [];

                var issueCnt = stringSqlProjectsSubProjects = data2.rows.length;
                var dataArray = data2.rows;
                var groupA = groupArray(dataArray, 'assigned_to_id');
                var viewData = {};

                try{
                    for (groupIdx in groupA) {
                        //var project_id = groupA[groupIdx][0].project_id;
                        //var project_name = groupA[groupIdx][0].subject;

                        var parent_ID = groupA[groupIdx][0].assigned_to_id;
                        var parent_Name = groupA[groupIdx][0].assigned_last_name + groupA[groupIdx][0].assigned_first_name;


                        for (idx = 0; idx < groupA[groupIdx].length; idx++) {
                            var issueName = groupA[groupIdx][idx].name;
                            var issueCount = groupA[groupIdx][idx].totalIssueCount;

                            var CompletedCount = 0;
                            var InprogressCount = 0;
                            var NewRequestCount = 0;
                            var PendingCount = 0;

                            if(issueName == "New/Request" || issueName == "New / Request" ||  issueName == "Checking" || issueName ==  "Scheduled" ){
                                NewRequestCount = Number(issueCount);
                            }else if( issueName == "Closed" || issueName == "Resolved" ){
                                CompletedCount = Number(issueCount);
                            }else if( issueName == "On hold" || issueName == "Pending" || issueName == "Verified" || issueName == "Opinion" ){
                                PendingCount = Number(issueCount);
                            }else{
                                InprogressCount = Number(issueCount);
                            }

                            if( Number(issueCount) > 0 ){
                                if( parent_ID in viewData){
                                    var EInprogressCount = Number(viewData[parent_ID].InprogressCount) +  Number(InprogressCount);
                                    var ECompletedCount = Number(viewData[parent_ID].CompletedCount)  +  Number(CompletedCount);
                                    var ENewRequestCount = Number(viewData[parent_ID].NewRequestCount)  +  Number(NewRequestCount);
                                    var EPendingCount = Number(viewData[parent_ID].PendingCount)  +  Number(PendingCount);
                                    var ETotalCount = Number( viewData[parent_ID].TotalCount )  +  Number(issueCount);
                                    viewData[parent_ID] = { name:parent_Name , InprogressCount: EInprogressCount,CompletedCount: ECompletedCount, TotalCount: ETotalCount ,NewRequestCount:ENewRequestCount,PendingCount:EPendingCount };
                                }else{
                                    viewData[parent_ID] = { name:parent_Name, InprogressCount:InprogressCount, CompletedCount:CompletedCount, TotalCount: issueCount ,NewRequestCount:NewRequestCount,PendingCount:PendingCount };
                                }
                            }
                        }
                    }
                }catch (e){
                    callBack({errorMsg: e.message});
                    return;
                }

                var items = [];

                for (var key in viewData) {
                    var curData = viewData[key];
                    headercols.push(curData.name);
                    items.push( curData );
                }

                callBack({
                    headercols: headercols,
                    items: items
                });
            }
            else {
                callBack({errorMsg: data2.erroemsg});
                return;
            }
        });
    }


}

module.exports = OpenProjectChart;
