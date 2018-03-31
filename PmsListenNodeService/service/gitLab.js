/**
 * Created by 박상만 on 2017-02-21.
 */
var util = require('util');
var urlManager = require('../utils/urlManager');
var request = require('request');
var openProject = require("./openProject");

var GitLab = {
    CommentAdd_MergeMsg : function (payload,apiToken) {
        var url = urlManager.getUrlInfo("GITLABSITE").Url;
        var pmsUrl = urlManager.getUrlInfo("PMSSITE").Url;
        var pmsApiToken = urlManager.getUrlInfo("PMSSITE").AccessToken;

        var user = payload.user;
        var object_attributes = payload.object_attributes;
        var assignee = payload.assignee;
        var action = object_attributes.action;
        var userName = user.name;
        var assigneeName = assignee ? assignee.name : "UnKnown";
        var mergeUrl = object_attributes.url;
        var title = object_attributes.title;
        var prjID = object_attributes.target_project_id;
        var mergedID = object_attributes.id;

        var workID = urlManager.getWorkID(title);
        var pmsUrlFix = urlManager.getUrlInfo("PMSSITE").UrlFix;

        var addMessage ="";
        if(action == "open"){
            addMessage = util.format("Related PMS Link:\r\n");
        }else{
            console.log("only pregress at open");
            return;
        }

        openProject.GetProjectNameByPackID(pmsUrl,pmsApiToken,workID,null, function (result,_refObj) {
            var projectName = result;
            var refUrl = util.format("%s/projects/%s/work_packages/%s/activity",pmsUrlFix,projectName,workID);
            var requestUrl = util.format("%s/api/v3/projects/%s/merge_requests/%s/notes",url,prjID,mergedID);
            addMessage += refUrl;

            console.log("try:" + projectName + " refUrl:"+refUrl + " requestUrl:" + requestUrl);

            var requestData = {
                body : addMessage
            };

            request({
                headers:{"PRIVATE-TOKEN" : apiToken},
                url:requestUrl,
                method:'POST',
                json:requestData
            },function (error,reponse,body) {
                if(!error){
                    console.log("GitLab POST OK");
                }else {
                    console.log(error);
                }
            });
        })

    },
    CommentAdd_CommitMsg: function (url,apiToken,prjID,commitSha,txtnote) {
        var requestData = {
            note : txtnote
        };
        var requestUrl = util.format("%s/api/v3/projects/%s/repository/commits/%s/comments",url,prjID,commitSha);

        console.log("=====",requestUrl , " ",apiToken , " ",prjID , " ",commitSha , " " , txtnote);
        request.post({
            headers:{"PRIVATE-TOKEN" : apiToken},
            url:requestUrl,
            form:requestData
        },function (error,reponse,body) {
            if(!error){
                console.log("GitLab POST OK");
            }else {
                console.log(error);
            }
        });
    }
}

module.exports = GitLab;
