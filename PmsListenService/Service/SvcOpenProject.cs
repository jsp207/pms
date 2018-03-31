using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

using Newtonsoft.Json;
using System.Web.Script.Serialization;
using System.Net;
using System.Text;
using System.Text.RegularExpressions;
using System.Configuration;
using PmsListenService.Models;
using PmsListenService.Util;

namespace PmsListenService.Service
{
    public class SvcOpenProject
    {
        static public string GetProjectNameByPackID(string url, string apiToken, string workID)
        {
            string result = string.Empty;
            string requestUrl = string.Format("{0}/api/v3/work_packages/{1}", url, workID);
            WebClient restClient = new WebClient();
            restClient.Headers.Add("Content-Type", "application/json");

            string userNameKey = "apikey";
            string passWord = apiToken;
            string credentials = Convert.ToBase64String(Encoding.ASCII.GetBytes(userNameKey + ":" + passWord));
            restClient.Headers[HttpRequestHeader.Authorization] = "Basic " + credentials;

            byte[] jsonData = restClient.DownloadData(requestUrl);

            string jsonStr = Encoding.UTF8.GetString(jsonData);

            object jsonObj = new JavaScriptSerializer().DeserializeObject(jsonStr);
            IDictionary<string, object> payload = (IDictionary<string, object>)jsonObj;

            IDictionary<string, object> _embedded = (IDictionary<string, object>)payload["_embedded"];
            IDictionary<string, object> projectObj = (IDictionary<string, object>)_embedded["project"];

            result = projectObj["identifier"] as string;
            return result;

        }

        static public void CommentAdd_MergeMsg( IDictionary<string, object> payload)
        {            
            string url = URLManager.GetUrlInfo(e_URLTYPE.PMSSITE).Url;
            string apiToken = URLManager.GetUrlInfo(e_URLTYPE.PMSSITE).AccessToken;            

            IDictionary<string, object> user = (IDictionary<string, object>)payload["user"];
            IDictionary<string, object> object_attributes = (IDictionary<string, object>)payload["object_attributes"];
            IDictionary<string, object> assignee = null;
            string action = object_attributes["action"] as string;
            string userName = user["name"] as string;
            string assigneeName = "UnKnown";

            //Check...assignee
            if (true == payload.ContainsKey("assignee"))
            {
                assignee = (IDictionary<string, object>)payload["assignee"];
                if (assignee != null)
                {
                    assigneeName = assignee["name"] as string;
                }
            }

            string addMessage = "";
            bool isWrite = false;
            if (action.Equals("open"))          //머지요청
            {
                addMessage = string.Format("{0} opened merge request to {1}", userName, assigneeName);
                isWrite = true;
            }
            else if (action.Equals("merge"))    //머지수락
            {
                addMessage = string.Format("{1} accepted merge request {0}", userName, assigneeName);
                isWrite = true;
            }
            else if (action.Equals("close"))    //머지거부
            {
                addMessage = string.Format("{0} closed merge request", userName );
                isWrite = true;
            }
            else
            {
                return;
            }

            string mergeUrl = object_attributes["url"] as string;

            string gitUrlPreFix = URLManager.GetUrlInfo(e_URLTYPE.GITLABSITE).UrlFix;
            mergeUrl = mergeUrl.Replace("http://localhost", gitUrlPreFix);
            

            string title = object_attributes["title"] as string;

            WebClient restClient = new WebClient();
            restClient.Headers.Add("Content-Type", "application/json");

            string userNameKey = "apikey";
            string passWord = apiToken;
            string credentials = Convert.ToBase64String(Encoding.ASCII.GetBytes(userNameKey + ":" + passWord));
            restClient.Headers[HttpRequestHeader.Authorization] = "Basic " + credentials;

            string workID = "0";
            string pattern;
            char beginComment = '[', endComment = ']';
            pattern = Regex.Escape(beginComment.ToString()) + @"(.*?)";
            string endPattern = Regex.Escape(endComment.ToString());
            if (endComment == ']' || endComment == '}') endPattern = @"\" + endPattern;
            pattern += endPattern;
            MatchCollection matches = Regex.Matches(title, pattern);
            foreach (Match match in matches)
            {
                workID = match.Groups[1].Value;
                break;
            }

            if (workID.Equals("0"))
                return;

            string requestUrl = string.Format("{0}/api/v3/work_packages/{1}/activities", url, workID);
            if (isWrite)
            {
                addMessage = addMessage + "\r\n" + mergeUrl;
                PMSAddActivities addComent = new PMSAddActivities()
                {
                    comment = new PMSComment()
                    {
                        raw = addMessage
                    }
                };
                var jsonValue = JsonConvert.SerializeObject(addComent);
                byte[] requestData = Encoding.UTF8.GetBytes(jsonValue);
                restClient.UploadData(requestUrl, "POST", requestData);
            }

        }

        static public void CommentAdd_PushMsg(IDictionary<string, object> payload, string gitAPIToken)
        {            
            string url = URLManager.GetUrlInfo(e_URLTYPE.PMSSITE).Url;
            string apiToken = URLManager.GetUrlInfo(e_URLTYPE.PMSSITE).AccessToken;

            object[] commits = (object[])payload["commits"];
            int project_id = (int)payload["project_id"];
            string userName = payload["user_name"] as string;

            string GitUrl = URLManager.GetUrlInfo(e_URLTYPE.GITLABSITE).Url;
            string GitUrlFix = URLManager.GetUrlInfo(e_URLTYPE.GITLABSITE).UrlFix;

            string pmsUrlFix = URLManager.GetUrlInfo(e_URLTYPE.PMSSITE).UrlFix;
            
            Dictionary<string, bool> pmsWokrList = new Dictionary<string, bool>();

            

            foreach ( object commit in commits.Reverse<object>())
            {
                IDictionary<string, object> commitContent = (IDictionary<string, object>)commit;
                IDictionary<string, object> author = (IDictionary<string, object>)commitContent["author"];

                //string userName = author["name"] as string;
                string commitUrl = commitContent["url"] as string;
                commitUrl = commitUrl.Replace("http://localhost", GitUrlFix);                

                string message = commitContent["message"] as string;
                string commitID = commitContent["id"] as string;

                string workID = "0";
                string pattern;
                char beginComment = '[', endComment = ']';
                pattern = Regex.Escape(beginComment.ToString()) + @"(.*?)";
                string endPattern = Regex.Escape(endComment.ToString());
                if (endComment == ']' || endComment == '}') endPattern = @"\" + endPattern;
                pattern += endPattern;
                MatchCollection matches = Regex.Matches(message, pattern);
                foreach (Match match in matches)
                {
                    workID = match.Groups[1].Value;
                    break;
                }
                if (workID.Equals("0"))
                    continue;

                //중복 workID 걸러냄...
                if (pmsWokrList.ContainsKey(workID))
                    continue;                

                pmsWokrList[workID] = true;

                string projectName = SvcOpenProject.GetProjectNameByPackID(url, apiToken, workID);
                
                string refUrl = string.Format("{0}/projects/{1}/work_packages/{2}/activity", pmsUrlFix, projectName, workID);
                string note = string.Format("Related PMS Link:\r\n{0}", refUrl);
                
                using (WebClient restClient = new WebClient())
                {
                    restClient.Headers.Add("Content-Type", "application/json");
                    string userNameKey = "apikey";
                    string passWord = apiToken;
                    string credentials = Convert.ToBase64String(Encoding.ASCII.GetBytes(userNameKey + ":" + passWord));
                    restClient.Headers[HttpRequestHeader.Authorization] = "Basic " + credentials;
                    string requestUrl = string.Format("{0}/api/v3/work_packages/{1}/activities", url, workID);
                    string addMessage = string.Format("{0} Commit\r\n{1}", userName, commitUrl);                    

                    PMSAddActivities addComent = new PMSAddActivities()
                    {
                        comment = new PMSComment()
                        {
                            raw = addMessage
                        }
                    };
                    var jsonValue = JsonConvert.SerializeObject(addComent);
                    byte[] requestData = Encoding.UTF8.GetBytes(jsonValue);
                    restClient.UploadData(requestUrl, "POST", requestData);                    
                }

                SvcGitLab.CommentAdd_CommitMsg(GitUrl, gitAPIToken, project_id, commitID, note);

            }
        }        
    }
}