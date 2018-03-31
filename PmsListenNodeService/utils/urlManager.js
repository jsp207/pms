/**
 * Created by 박상만 on 2017-02-22.
 */
var config = require('config-json');//('../appcfg.json');

var UrlManager = {
    pmsUrlList:{},
    gitLabUrlList:{},
    getWorkID:function (message) {
        var tmpRegex = message.match(/\[.*\]/gi);
        if(!tmpRegex){
            return "";
        }
        tmpRegex+= "";
        tmpRegex = tmpRegex.split("[").join("");
        tmpRegex = tmpRegex.split("]").join("");
        tmpRegex = tmpRegex.split(" ")[0];
        return tmpRegex;
    },

    loadConfig: function(){
        config.load('appcfg.json');
        var PMSUrl = config.get("PMSUrl");
        var PMSUrlFix = config.get("PMSUrlFix");
        var PMSAPIToken = config.get("PMSAPIToken");
        var GitUrl = config.get("GitUrl");
        var GitUrlFix = config.get("GitUrlFix");
        var GitAPIToken = config.get("GitAPIToken");
        var urlInfoPms = {Url:PMSUrl,UrlFix:PMSUrlFix,AccessToken:PMSAPIToken};
        var urlInfoGitLab = {Url:GitUrl,UrlFix:GitUrlFix,AccessToken:GitAPIToken};
        this.pmsUrlList["public"] = urlInfoPms;
        this.gitLabUrlList["public"] = urlInfoGitLab;
        console.log("Completed Load config:" + PMSUrl);
    },
    getUrlInfo:function (urlType,teamName) {
        teamName = typeof teamName !== 'undefined' ? teamName : "public";

        if(urlType == "PMSSITE" ){
            return this.pmsUrlList[teamName];
        }
        else if(urlType == "GITLABSITE" ){
            return this.gitLabUrlList[teamName];
        }
    }
};

module.exports = UrlManager;
