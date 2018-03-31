using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Configuration;


namespace PmsListenService.Util
{
    public class UrlInfo
    {
        public string Url { get; set; }     //access for Server

        public string UrlFix { get; set; }  //access for user

        public string AccessToken { get; set; }  //access for user

        public UrlInfo(string url,string urlFix,string accessToken)
        {
            Url = url;
            UrlFix = urlFix;
            AccessToken = accessToken;
        }
    }

    public enum e_URLTYPE : int{
        PMSSITE = 0,
        GITLABSITE = 1
    };

    static public class URLManager
    {
        static Dictionary<string, UrlInfo> PMSUrlList = new Dictionary<string, UrlInfo>();
        static Dictionary<string, UrlInfo> GitLabUrlList = new Dictionary<string, UrlInfo>();
        static URLManager()
        {
            string PMSUrl = ConfigurationManager.AppSettings["PMSUrl"];
            string PMSUrlFix = ConfigurationManager.AppSettings["PMSUrlFix"];
            string PMSAPIToken = ConfigurationManager.AppSettings["PMSAPIToken"];

            UrlInfo pmsUrlInfo = new UrlInfo(PMSUrl, PMSUrlFix, PMSAPIToken);
            AddUrlInfo("public", e_URLTYPE.PMSSITE, pmsUrlInfo);

            string GitUrl = ConfigurationManager.AppSettings["GitUrl"];
            string GitUrlFix = ConfigurationManager.AppSettings["GitUrlFix"];

            UrlInfo gitUrlInfo = new UrlInfo(GitUrl, GitUrlFix, string.Empty);
            AddUrlInfo("public", e_URLTYPE.GITLABSITE, gitUrlInfo);

        }

        public static void AddUrlInfo(string teamName , e_URLTYPE urlType, UrlInfo urlInfo)
        {
            if(urlType == e_URLTYPE.PMSSITE)
            {
                PMSUrlList[teamName] = urlInfo;
            }
            else if (urlType == e_URLTYPE.GITLABSITE)
            {
                GitLabUrlList[teamName] = urlInfo;
            }
        }

        public static UrlInfo GetUrlInfo(e_URLTYPE urlType,string teamName = "public")
        {
            if (urlType == e_URLTYPE.PMSSITE)
            {
                return PMSUrlList[teamName];
            }
            else if (urlType == e_URLTYPE.GITLABSITE)
            {
                return GitLabUrlList[teamName];
            }
            return null;
        }

    }
}