using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using System.Web.Http.ModelBinding;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin.Security;
using Microsoft.Owin.Security.Cookies;
using Microsoft.Owin.Security.OAuth;
using PmsListenService.Models;
using PmsListenService.Providers;
using PmsListenService.Results;
using Newtonsoft.Json;
using System.Web.Script.Serialization;
using System.Net;
using System.Text;
using System.Text.RegularExpressions;
using System.Configuration;
using PmsListenService.Service;
using System.Collections.Generic;
using System.Linq;

namespace PmsListenService.Controllers
{
    [RoutePrefix("api/GitLab")]
    public class GitController : ApiController
    {
        // POST api/GitLab/PushEvent
        [Route("PushEvent")]
        public IHttpActionResult PushEvent()
        {
            string jsonStr = this.Request.Content.ReadAsStringAsync().Result;
            IEnumerable<string> headerValues;
            var GitAPIToken = string.Empty;
            if (Request.Headers.TryGetValues("X-Gitlab-Token", out headerValues))
            {
                GitAPIToken = headerValues.FirstOrDefault();
            }

            object jsonObj = new JavaScriptSerializer().DeserializeObject(jsonStr);
            IDictionary<string, object> payload = (IDictionary<string, object>)jsonObj;            

            if (payload.ContainsKey("object_kind"))
            {
                string object_kind = payload["object_kind"] as string;
                switch (object_kind)
                {
                    case "push":
                        SvcOpenProject.CommentAdd_PushMsg( payload , GitAPIToken);
                        //SvcGitLab.CommentAdd_MergeMsg(GitUrl, GitAPIToken, payload, PMSUrl, PMSAPIToken);
                        break;
                }
            }

#if DEBUG
            System.Diagnostics.Debug.WriteLine(string.Format("PushEvent(Git->PMS) : {0}", jsonStr));
#endif

            return Ok();
        }

        // POST api/GitLab/MergeEvent
        [Route("MergeEvent")]
        public IHttpActionResult MergeEvent()
        {
            string jsonStr = this.Request.Content.ReadAsStringAsync().Result;
            IEnumerable<string> headerValues;
            var GitAPIToken = string.Empty;
            if (Request.Headers.TryGetValues("X-Gitlab-Token", out headerValues))
            {
                GitAPIToken = headerValues.FirstOrDefault();
            }
            
            object jsonObj = new JavaScriptSerializer().DeserializeObject(jsonStr);
            IDictionary<string, object> payload = (IDictionary<string, object>)jsonObj;

            
            if (payload.ContainsKey("object_kind"))
            {
                string object_kind = payload["object_kind"] as string;
                switch (object_kind)
                {
                    case "merge_request":
                        SvcOpenProject.CommentAdd_MergeMsg( payload );
                        SvcGitLab.CommentAdd_MergeMsg( payload , GitAPIToken);
                        break;
                }
            }
            
#if DEBUG
            System.Diagnostics.Debug.WriteLine(string.Format("MergeEvent(Git->PMS) : {0}", jsonStr));
#endif
            return Ok();
        }

    }
}