using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace PmsListenService.Models
{


    public class PMSComment
    {
        public string raw { get; set; }
    }

    public class PMSAddActivities
    {
        public PMSComment comment { get; set; }
    }

    public class GitComment
    {
        public string body { get; set; }
    }


}