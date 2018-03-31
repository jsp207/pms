/**
 * Created by 박상만 on 2017-02-21.
 */
var util = require('util');
var urlManager = require('../utils/urlManager');
var request = require('request');
var gitLab = require("./gitLab");

var OpenProject = {
    test: function () {
        console.log("test");
    },
    GetProjectNameByPackID : function (url,apiToken,workID,refObj,funSucced) {
        console.log("GetProjectNameByPackID",workID);
        var requestUrl = util.format("%s/api/v3/work_packages/%s", url,workID);
        var userNameKey = "apikey";
        var passWord = apiToken;
        var auth = "Basic " + new Buffer(userNameKey + ":" + passWord).toString("base64");

        console.log("try work_packages:"+requestUrl);
        console.log("auth:"+auth);
        //pmsUrlFix,workID,commitUrl

        request({
            headers:{"Authorization" : auth},
            method:"GET",
            url:requestUrl
        },function (error,reponse,body) {
            if(!error){
                var data = JSON.parse(body);
                if(data._embedded==undefined){
                    console.log("authError:" +requestUrl );
                    return;
                }
                funSucced(data._embedded.project.identifier,refObj);
            }else {
                console.log(error);
            }
        });

    },
    CommentAdd_MergeMsg : function (payload,fCompleted) {
        var url = urlManager.getUrlInfo("PMSSITE").Url;
        var apiToken = urlManager.getUrlInfo("PMSSITE").AccessToken;
        var user = payload.user;
        var object_attributes = payload.object_attributes;
        var assignee = payload.assignee;
        var action = object_attributes.action;
        var userName = user.name;
        var assigneeName = "UnKnown";

        if(assignee){
            assigneeName = assignee.name;
        }

        var addMessage = "";
        if(action == "open"){
            addMessage = util.format("%s opened merge request to %s", userName,assigneeName);
        }else if(action == "merge"){
            addMessage = util.format("%s accepted merge request %s", assigneeName,userName);
        }else if(action == "close"){
            addMessage = util.format("%s closed merge request", userName);
        }else{
            return;
        }

        var mergeUrl = object_attributes.url;
        var gitUrlPreFix = urlManager.getUrlInfo("GITLABSITE").UrlFix;
        mergeUrl = mergeUrl.replace("http://localhost",gitUrlPreFix);

        var title = object_attributes.title;

        var userNameKey = "apikey";
        var passWord = apiToken;
        var auth = "Basic " + new Buffer(userNameKey + ":" + passWord).toString("base64");


        var workID = urlManager.getWorkID(title);
        if (workID == "")
            return;

        addMessage += "\r\n" + mergeUrl;
        var requestUrl = util.format("%s/api/v3/work_packages/%s/activities", url, workID);
        var requestData={
            comment:{
                raw: addMessage
            }
        };

        request({
            headers:{"Authorization" : auth},
            url:requestUrl,
            method:'POST',
            json:requestData
        },function (error,reponse,body) {
            if(!error){
                console.log("OpenProject POST OK");
                fCompleted(body);
            }else {
                console.log(error);
            }
        });
    },
    CommentAdd_PushMsg : function (payload,gitAPIToken,fCompleted) {
        var url = urlManager.getUrlInfo("PMSSITE").Url;
        var apiToken = urlManager.getUrlInfo("PMSSITE").AccessToken;
        var commits = payload.commits;
        var project_id = payload.project_id;
        var GitUrl = urlManager.getUrlInfo("GITLABSITE").Url;
        var GitUrlFix = urlManager.getUrlInfo("GITLABSITE").UrlFix;
        var pmsUrlFix = urlManager.getUrlInfo("PMSSITE").UrlFix;
        var userName = payload.user_name;
        var me = this;

        var pmsWokrList = {};

        console.log("Commit Len:"+commits.length);

        for(idx=commits.length-1; idx>-1 ; idx--){
            var commitContent = commits[idx];
            //var author = commitContent.author;
            var commitUrl = commitContent.url;
            commitUrl = commitUrl.replace("http://localhost",GitUrlFix);
            var message = commitContent.message;
            var commitID = commitContent.id;

            var workID = urlManager.getWorkID(message);
            if (workID == ""){
                console.log("Empty Work ID");
                continue;
            }


            //중복 workID 걸러냄...
            if(pmsWokrList.hasOwnProperty(workID)){
                console.log("Same WorkId ..Continue");
                continue;
            }


            pmsWokrList[workID] = true;

            var refObj={
                _workID: workID,
                _commitUrl:commitUrl,
                _commitID:commitID
            };

            me.GetProjectNameByPackID(url,apiToken,workID,refObj,function (result,_refObj) {
                var projectName = result;
                var refUrl = util.format("%s/projects/%s/work_packages/%s/activity",pmsUrlFix,projectName,_refObj._workID);
                var note = util.format("Related PMS Link:\r\n%s",refUrl);
                var userNameKey = "apikey";
                var passWord = apiToken;
                var auth = "Basic " + new Buffer(userNameKey + ":" + passWord).toString("base64");

                var requestUrl = util.format("%s/api/v3/work_packages/%s/activities",url,_refObj._workID);
                var addMessage = util.format("%s Commit\r\n%s",userName,_refObj._commitUrl);

                var requestData={
                    comment:{
                        raw: addMessage
                    }
                };

                request({
                    headers:{"Authorization" : auth},
                    url:requestUrl,
                    method:'POST',
                    json:requestData
                },function (error,reponse,body) {
                    if(!error){
                        console.log("OpenProject POST OK");
                    }else {
                        console.log(error);
                    }
                });

                fCompleted(GitUrl, gitAPIToken, project_id, _refObj._commitID, note );
            })
        }
    }
}

module.exports = OpenProject;
