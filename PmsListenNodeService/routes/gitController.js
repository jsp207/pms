/**
 * Created by 박상만 on 2017-02-21.
 */
var express = require('express');
var router = express.Router();
var config = require('config.json')('../app.config');
var urlManager = require('../utils/urlManager');

var gitLab = require("../service/gitLab");
var openProject = require("../service/openProject");

/**
 * @api {post} /api/GitLab/MergeEvent GitLab 머지 이벤트
 * @apiDescription GitLab에 등록가능하며, GitLab의 머지 이벤트 트리거에 등록하여 PMS와 상호연동이됩니다..
 * @apiGroup GitLab
 * @apiParam {String} user 사용자 닉
 * @apiParam {Object} object_attributes GitLab 속성
 * @apiParam {String} assignee 할당자
 * @apiSuccess {Boolean} Ok 성공여부
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *    [{
 *      작성중
 *    }]
 * @apiErrorExample {json} List error
 *    HTTP/1.1 500 Internal Server Error
 */

/* POST MergeEvent */
router.post('/MergeEvent', function(req, res, next) {
    var payload = req.body;
    //var gitAPIToken = req.header("X-Gitlab-Token");
    var gitAPIToken =urlManager.getUrlInfo("GITLABSITE").AccessToken;
    if(payload.object_kind){
        var object_kind = payload.object_kind;
        switch (object_kind){
            case "merge_request":
                openProject.CommentAdd_MergeMsg(payload,function (result) {
                    gitLab.CommentAdd_MergeMsg(payload,gitAPIToken);
                });
                break;
        }
    }
    res.send("OK");
});

/**
 * @api {post} /api/GitLab/PushEvent GitLab Push Event
 * @apiDescription GitLab에 등록가능하며, GitLab의 푸쉬 이벤트 트리거에 등록하여 PMS와 상호연동이됩니다..
 * @apiGroup GitLab
 * @apiParam {String} user_name 사용자 닉
 * @apiParam {Number} project_id 프로젝트 ID
 * @apiParam {Object[]} commits 커밋정보
 * @apiSuccess {Boolean} Ok 성공여부
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *    [{
 *      작성중
 *    }]
 * @apiErrorExample {json} List error
 *    HTTP/1.1 500 Internal Server Error
 */

/* POST PushEvent */
router.post('/PushEvent', function(req, res, next) {
    var payload = req.body;
    //var gitAPIToken = req.header("X-Gitlab-Token");
    var gitAPIToken =urlManager.getUrlInfo("GITLABSITE").AccessToken;
    console.log("gitapitoken:"+gitAPIToken);
    console.log("Type:"+payload.object_kind);
    if(payload.object_kind){
        var object_kind = payload.object_kind;
        switch (object_kind){
            case "push":
                openProject.CommentAdd_PushMsg(payload,gitAPIToken,function (GitUrl, gitAPIToken, project_id, commitID, note) {
                    gitLab.CommentAdd_CommitMsg(GitUrl,gitAPIToken,project_id,commitID,note);
                });
                break;
        }
    }
    res.send("OK");
});


module.exports = router;
