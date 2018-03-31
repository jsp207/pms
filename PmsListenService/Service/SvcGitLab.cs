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
    public class SvcGitLab
    {
        static public void CommentAdd_MergeMsg( IDictionary<string, object> payload, string apiToken )
        {
            string url = URLManager.GetUrlInfo(e_URLTYPE.GITLABSITE).Url;
            string pmsUrl = URLManager.GetUrlInfo(e_URLTYPE.PMSSITE).Url;
            string pmsApiToken = URLManager.GetUrlInfo(e_URLTYPE.PMSSITE).AccessToken;

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
            if (action.Equals("open"))
            {
                addMessage = string.Format("Related PMS Link:\r\n" );
                isWrite = true;
            }            
            else
            {
                return;
            }

            string mergeUrl = object_attributes["url"] as string;
            string title = object_attributes["title"] as string;

            WebClient restClient = new WebClient();
            restClient.Headers.Add("Content-Type", "application/json");
            restClient.Headers.Add("PRIVATE-TOKEN", apiToken);


            int prjID = (int)object_attributes["target_project_id"];
            int mergedID = (int)object_attributes["id"];
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


            string projectName = SvcOpenProject.GetProjectNameByPackID(pmsUrl, pmsApiToken, workID);

            string pmsUrlFix = URLManager.GetUrlInfo(e_URLTYPE.PMSSITE).UrlFix;
            string refUrl = string.Format("{0}/projects/{1}/work_packages/{2}/activity", pmsUrlFix, projectName, workID);

            string requestUrl = string.Format("{0}/api/v3/projects/{1}/merge_requests/{2}/notes", url,prjID, mergedID);

            addMessage += refUrl;

            if (isWrite)
            {
                addMessage = addMessage + "\r\n" + mergeUrl;
                GitComment addComent = new GitComment()
                {
                    body = addMessage
                };
                var jsonValue = JsonConvert.SerializeObject(addComent);
                byte[] requestData = Encoding.UTF8.GetBytes(jsonValue);
                restClient.UploadData(requestUrl, "POST", requestData);
            }
        }


        static public void CommentAdd_CommitMsg(string url, string apiToken,int prjID,string commitSha, string note)
        {
            System.Collections.Specialized.NameValueCollection postData =
                new System.Collections.Specialized.NameValueCollection()
               {
                      { "note", note }
               };

            //byte[] requestData = Encoding.UTF8.GetBytes(postData);
            
            using (WebClient restClient = new WebClient())
            {
                restClient.Headers.Add("PRIVATE-TOKEN", apiToken);
                string requestUrl = string.Format("{0}/api/v3/projects/{1}/repository/commits/{2}/comments", url, prjID, commitSha);
                //restClient.UploadData(requestUrl, "POST", postData);
                restClient.UploadValues(requestUrl, "POST", postData);
            }
                        
        }

    }
}