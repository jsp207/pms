define({ "api": [
  {
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "optional": false,
            "field": "varname1",
            "description": "<p>No type.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "varname2",
            "description": "<p>With type.</p>"
          }
        ]
      }
    },
    "type": "",
    "url": "",
    "version": "0.0.0",
    "filename": "./doc/main.js",
    "group": "D__work_service_pmslisten_PMS_LISTEN_SERVICE_PmsListenNodeService_doc_main_js",
    "groupTitle": "D__work_service_pmslisten_PMS_LISTEN_SERVICE_PmsListenNodeService_doc_main_js",
    "name": ""
  },
  {
    "type": "post",
    "url": "/api/GitLab/MergeEvent",
    "title": "GitLab 머지 이벤트",
    "description": "<p>GitLab에 등록가능하며, GitLab의 머지 이벤트 트리거에 등록하여 PMS와 상호연동이됩니다..</p>",
    "group": "GitLab",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "user",
            "description": "<p>사용자 닉</p>"
          },
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "object_attributes",
            "description": "<p>GitLab 속성</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "assignee",
            "description": "<p>할당자</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "Ok",
            "description": "<p>성공여부</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n[{\n  작성중\n}]",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "List error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./routes/gitController.js",
    "groupTitle": "GitLab",
    "name": "PostApiGitlabMergeevent"
  },
  {
    "type": "post",
    "url": "/api/GitLab/PushEvent",
    "title": "GitLab Push Event",
    "description": "<p>GitLab에 등록가능하며, GitLab의 푸쉬 이벤트 트리거에 등록하여 PMS와 상호연동이됩니다..</p>",
    "group": "GitLab",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "user_name",
            "description": "<p>사용자 닉</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "project_id",
            "description": "<p>프로젝트 ID</p>"
          },
          {
            "group": "Parameter",
            "type": "Object[]",
            "optional": false,
            "field": "commits",
            "description": "<p>커밋정보</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "Ok",
            "description": "<p>성공여부</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n[{\n  작성중\n}]",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "List error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./routes/gitController.js",
    "groupTitle": "GitLab",
    "name": "PostApiGitlabPushevent"
  },
  {
    "type": "get",
    "url": "/api/report/dep1/humanResource/:id",
    "title": "프로젝트 인력 투입 현황",
    "group": "ReportDepth1",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "id",
            "optional": false,
            "field": "id",
            "description": "<p>상위 프로젝트 ID</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "headercols",
            "description": "<p>헤더정보</p>"
          },
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "items",
            "description": "<p>아이템</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n[{\n   \"headercols\":[\"2-3. 국내항공\",\"2-4. 해외호텔\",\"2-6. 해외여행\",\"2-2. 해외항공, 홀세일\",\"2-1. 공통/전사\"],\n   \"items\":[\n              {\"name\":\"2-3. 국내항공\",\"DevCnt\":2,\"DegisnCnt\":0,\"PlannerCnt\":2,\"TotalCount\":4},\n              {\"name\":\"2-4. 해외호텔\",\"DevCnt\":0,\"DegisnCnt\":0,\"PlannerCnt\":7,\"TotalCount\":7},\n              {\"name\":\"2-6. 해외여행\",\"DevCnt\":3,\"DegisnCnt\":0,\"PlannerCnt\":0,\"TotalCount\":3},\n              ....생략\n             ]\n\n}]",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "List error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./routes/reportAPI.js",
    "groupTitle": "ReportDepth1",
    "name": "GetApiReportDep1HumanresourceId"
  },
  {
    "type": "get",
    "url": "/api/report/dep1/operatorState/:id",
    "title": "프로젝트 운영 상태 현황",
    "group": "ReportDepth1",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "id",
            "description": "<p>상위 프로젝트 ID</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "headercols",
            "description": "<p>헤더정보</p>"
          },
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "items",
            "description": "<p>아이템</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n[{\n        \"headercols\":[\"InprogressCount\",\"CompletedCount\",\"NewRequestCount\",\"PendingCount\"],\n        \"items\":\n        [\n              {\"name\":\"2-3. 국내항공\",\"InprogressCount\":48,\"CompletedCount\":0,\"TotalCount\":49,\"NewRequestCount\":0,\"PendingCount\":1},\n              {\"name\":\"2-4. 해외호텔\",\"InprogressCount\":123,\"CompletedCount\":0,\"TotalCount\":124,\"NewRequestCount\":0,\"PendingCount\":1},\n              {\"name\":\"2-6. 해외여행\",\"InprogressCount\":28,\"CompletedCount\":0,\"TotalCount\":28,\"NewRequestCount\":0,\"PendingCount\":0},\n              {\"name\":\"2-2. 해외항공, 홀세일\",\"InprogressCount\":185,\"CompletedCount\":0,\"TotalCount\":188,\"NewRequestCount\":1,\"PendingCount\":2},\n              ...생략\n        }\n}]",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "List error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./routes/reportAPI.js",
    "groupTitle": "ReportDepth1",
    "name": "GetApiReportDep1OperatorstateId"
  },
  {
    "type": "get",
    "url": "/api/report/dep1/operatorType/:id",
    "title": "프로젝트 운영 유형 현황",
    "group": "ReportDepth1",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "id",
            "optional": false,
            "field": "id",
            "description": "<p>상위 프로젝트 ID</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "headercols",
            "description": "<p>헤더정보</p>"
          },
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "items",
            "description": "<p>아이템</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n[{\n          \"headercols\":[\"2-3. 국내항공\",\"2-4. 해외호텔\",\"2-6. 해외여행\",\"2-2. 해외항공, 홀세일\",\"2-1. 공통/전사\",\"2-7. 국내여행\",\"2-8. 국내숙박(체크인나우)\",\"2-9. 모바일\",\"2-0. R플랫폼\",\"전문몰\"],\n          \"items\":[\n                  {\"name\":\"2-3. 국내항공\",\"EpicCnt\":13,\"TaskCnt\":28,\"BugCnt\":0,\"MilesstoneCnt\":8,\"PhaseCnt\":0,\"FeatureCnt\":0,\"UserstoryCnt\":0,\"TotalCount\":49},\n                  {\"name\":\"2-4. 해외호텔\",\"EpicCnt\":36,\"TaskCnt\":66,\"BugCnt\":3,\"MilesstoneCnt\":18,\"PhaseCnt\":0,\"FeatureCnt\":0,\"UserstoryCnt\":0,\"TotalCount\":123},\n                  {\"name\":\"2-6. 해외여행\",\"EpicCnt\":8,\"TaskCnt\":11,\"BugCnt\":9,\"MilesstoneCnt\":0,\"PhaseCnt\":0,\"FeatureCnt\":0,\"UserstoryCnt\":0,\"TotalCount\":28},\n                  ...생략\n            ]\n}]",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "List error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./routes/reportAPI.js",
    "groupTitle": "ReportDepth1",
    "name": "GetApiReportDep1OperatortypeId"
  },
  {
    "type": "get",
    "url": "/api/report/dep1/projectCount",
    "title": "프로젝트 등록 개수 변화량",
    "group": "ReportDepth1",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "headercols",
            "description": "<p>헤더정보</p>"
          },
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "items",
            "description": "<p>아이템</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n[{\n      \"headercols\":[201701,201702,201703,201704,201705,201706,201707,201708,201709,201710,201711,201712],\n      \"items\":\n          [\n              {\"name\":\"R플랫폼\",\"data\":[0,1,1,1,1,1,1,1,1,1,1,1],\"totalCnt\":2 },\n              {\"name\":\"해외항공,홀세일\",\"data\":[1,1,3,0,0,0,0,0,0,0,0,0],\"totalCnt\":5 },\n              {\"name\":\"해외항공, 홀세일\",\"data\":[2,3,3,5,6,6,6,6,6,6,6,6] ,\"totalCnt\":8 },\n               .. 이하생략 ( 2-0. 와같은 프로젝트 넘버링 문자열을 API에서 자릅니다.\n          ],\n      \"info\":{\"NewCountCurMonth\":1,\"TotalInprogressCount\":46,\"TotalClosecount\":17}\n}]",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "List error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./routes/reportAPI.js",
    "groupTitle": "ReportDepth1",
    "name": "GetApiReportDep1Projectcount"
  },
  {
    "type": "get",
    "url": "/api/report/dep2/humanResource/:id",
    "title": "카테고리 별 프로젝트 인력 투입 현황",
    "group": "ReportDepth2",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "id",
            "optional": false,
            "field": "id",
            "description": "<p>상위 프로젝트 ID</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "headercols",
            "description": "<p>헤더정보</p>"
          },
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "items",
            "description": "<p>아이템</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n[{\n          \"headercols\":[\"17.03 통합검색\",\"17.03 통번역 서비스\",......생략],\n          \"items\":[\n                  {\"name\":\"17.03 통합검색\",\"DevCnt\":1,\"DegisnCnt\":1,\"PlannerCnt\":1,\"TotalCount\":3},\n                  {\"name\":\"17.03 통번역 서비스\",\"DevCnt\":1,\"DegisnCnt\":0,\"PlannerCnt\":1,\"TotalCount\":2},\n                  {\"name\":\"17.03 통합메인 개편\",\"DevCnt\":1,\"DegisnCnt\":1,\"PlannerCnt\":1,\"TotalCount\":3},\n                  {\"name\":\"17.03 컨시어지\",\"DevCnt\":1,\"DegisnCnt\":0,\"PlannerCnt\":1,\"TotalCount\":2},\n                  ....생략\n               ]\n\n}]",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "List error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./routes/reportAPI.js",
    "groupTitle": "ReportDepth2",
    "name": "GetApiReportDep2HumanresourceId"
  },
  {
    "type": "get",
    "url": "/api/report/dep2/operatorState/:id",
    "title": "카테고리 별 프로젝트 운영현황",
    "group": "ReportDepth2",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "id",
            "optional": false,
            "field": "id",
            "description": "<p>상위 프로젝트 ID</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "headercols",
            "description": "<p>헤더정보</p>"
          },
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "items",
            "description": "<p>아이템</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n[{\n\n              \"headercols\":[\"16.10 부킹닷컴\",\"16.06 호텔 쿠폰 개선 (카드사 적용외)\",\"17.01 (M) 상세페이지 개편\",\"17.02 해외호텔 검색고도화/PC메인개편\",\"중단기 프로젝트_해외호텔\",\"17.05. 예약정보간소화 및 예약페이지 개편\"],\n              \"items\":[\n                  {name\":\"16.10 부킹닷컴\",\"InprogressCount\":63,\"CompletedCount\":0,\"TotalCount\":64,\"NewRequestCount\":0,\"PendingCount\":1},\n                  {\"name\":\"16.06 호텔 쿠폰 개선 (카드사 적용외)\",\"InprogressCount\":22,\"CompletedCount\":0,\"TotalCount\":22,\"NewRequestCount\":0,\"PendingCount\":0},\n                  {\"name\":\"17.01 (M) 상세페이지 개편\",\"InprogressCount\":14,\"CompletedCount\":0,\"TotalCount\":14,\"NewRequestCount\":0,\"PendingCount\":0},{\"name\":\"17.02 해외호텔 검색고도화/PC메인개편\",\"InprogressCount\":7,\"CompletedCount\":0,\n                  ....생략\n               ]\n\n}]",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "List error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./routes/reportAPI.js",
    "groupTitle": "ReportDepth2",
    "name": "GetApiReportDep2OperatorstateId"
  },
  {
    "type": "get",
    "url": "/api/report/dep2/projectCount/:id",
    "title": "카테고리 별 프로젝트 등록 변화 개수",
    "group": "ReportDepth2",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "id",
            "optional": false,
            "field": "id",
            "description": "<p>상위 프로젝트 ID</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "headercols",
            "description": "<p>헤더정보</p>"
          },
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "items",
            "description": "<p>아이템</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n[{\n      \"headercols\":[201701,201702,201703,201704,201705],\n      \"items\":[{\"name\":\"국내항공\",\"data\":[2,3,5,2,2]}],\n      \"info\":{\"NewCountCurMonth\":0,\"TotalInprogressCount\":2,\"TotalClosecount\":8}\n}]",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "List error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./routes/reportAPI.js",
    "groupTitle": "ReportDepth2",
    "name": "GetApiReportDep2ProjectcountId"
  },
  {
    "type": "get",
    "url": "/api/report/dep3/humanResource/:id",
    "title": "프로젝트 담당자 별 진행현황",
    "group": "ReportDepth3",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "id",
            "optional": false,
            "field": "id",
            "description": "<p>상위 프로젝트 ID</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "headercols",
            "description": "<p>헤더정보</p>"
          },
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "items",
            "description": "<p>아이템</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n[{\n      \"headercols\":[\"최정옥\",\"박이슬\",\"최상일\",\"김준영\",\"강승엽\",\"홍석현\",\"서아령\"],\n      \"items\":[\n              {\"name\":\"최정옥\",\"InprogressCount\":6,\"CompletedCount\":0,\"TotalCount\":6,\"NewRequestCount\":0,\"PendingCount\":0},\n              {\"name\":\"박이슬\",\"InprogressCount\":6,\"CompletedCount\":0,\"TotalCount\":6,\"NewRequestCount\":0,\"PendingCount\":0},\n              {\"name\":\"최상일\",\"InprogressCount\":22,\"CompletedCount\":0,\"TotalCount\":22,\"NewRequestCount\":0,\"PendingCount\":0},\n              {\"name\":\"김준영\",\"InprogressCount\":16,\"CompletedCount\":0,\"TotalCount\":17,\"NewRequestCount\":0,\"PendingCount\":1},\n              ....생략\n              ]\n}]",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "List error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./routes/reportAPI.js",
    "groupTitle": "ReportDepth3",
    "name": "GetApiReportDep3HumanresourceId"
  },
  {
    "type": "get",
    "url": "/api/report/dep3/operatorState/:id",
    "title": "카테고리 별 진행 현황",
    "group": "ReportDepth3",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "id",
            "optional": false,
            "field": "id",
            "description": "<p>상위 프로젝트 ID</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "headercols",
            "description": "<p>헤더정보</p>"
          },
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "items",
            "description": "<p>아이템</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n[{\n\n  \"headercols\":[\"00 준비\",\"01 기획\",\"02 디자인/HTML\",\"04 QA\",\"03 개발\"],\n  \"items\":[\n          {\"name\":\"00 준비\",\"InprogressCount\":8,\"CompletedCount\":0,\"TotalCount\":8,\"NewRequestCount\":0,\"PendingCount\":0},\n          {\"name\":\"01 기획\",\"InprogressCount\":22,\"CompletedCount\":0,\"TotalCount\":22,\"NewRequestCount\":0,\"PendingCount\":0},\n          {\"name\":\"02 디자인/HTML\",\"InprogressCount\":6,\"CompletedCount\":0,\"TotalCount\":6,\"NewRequestCount\":0,\"PendingCount\":0},\n          ...\n          ]\n}]",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "List error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./routes/reportAPI.js",
    "groupTitle": "ReportDepth3",
    "name": "GetApiReportDep3OperatorstateId"
  },
  {
    "type": "get",
    "url": "/api/report/dep3/operatorType/:id",
    "title": "유형 별 진행 현황",
    "group": "ReportDepth3",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "id",
            "optional": false,
            "field": "id",
            "description": "<p>상위 프로젝트 ID</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "headercols",
            "description": "<p>헤더정보</p>"
          },
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "items",
            "description": "<p>아이템</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n[{\n      \"headercols\":[\"Task\",\"Epic\"],\n      \"items\":[\n              {\"name\":\"Task\",\"InprogressCount\":22,\"CompletedCount\":0,\"TotalCount\":22,\"NewRequestCount\":0,\"PendingCount\":0},\n              {\"name\":\"Epic\",\"InprogressCount\":40,\"CompletedCount\":0,\"TotalCount\":41,\"NewRequestCount\":0,\"PendingCount\":1}\n       ]\n}]",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "List error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./routes/reportAPI.js",
    "groupTitle": "ReportDepth3",
    "name": "GetApiReportDep3OperatortypeId"
  },
  {
    "type": "get",
    "url": "/api/report/dep3/taskreview/:id",
    "title": "최근 프로젝트 진행 요약",
    "group": "ReportDepth3",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "id",
            "optional": false,
            "field": "id",
            "description": "<p>상위 프로젝트 ID</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "headercols",
            "description": "<p>헤더정보</p>"
          },
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "items",
            "description": "<p>아이템</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n[{\n  더미 데이터\n   headercols:[\"최근 프로젝트 진행 요약\"],\n   items:[\n       {issuename:\"Resolved\",description:\"여행 검색 도입시 추가 색인이 필요한 항목 정리 각 항목 색인시 필요작업 검토\",update:\"2017-03-14 오전 7:36:36\" },\n       {issuename:\"Resolved\",description:\"Geo 기반의 키워드 분류내용 추가\",update:\"2017-03-14 오전 7:36:36\" },\n       {issuename:\"Resolved\",description:\"검색시 여정 필수입력 상품의 임의의 날짜를 지정하여 검색 결과를 보여줌\",update:\"2017-03-14 오전 7:36:36\" }\n   ]\n}]",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "List error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./routes/reportAPI.js",
    "groupTitle": "ReportDepth3",
    "name": "GetApiReportDep3TaskreviewId"
  },
  {
    "type": "get",
    "url": "/api/report/dep3/updateState/:id",
    "title": "프로젝트 업데이트 현황",
    "group": "ReportDepth3",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "id",
            "optional": false,
            "field": "id",
            "description": "<p>상위 프로젝트 ID</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "headercols",
            "description": "<p>헤더정보</p>"
          },
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "items",
            "description": "<p>아이템</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n[{\n  더미 데이터\n   headercols:[20170501,20170502,20170503,20170504,20170505,20170506,20170507,20170508,20170509],\n   items:[\n       {name:\"00. 분석회의\",\"data\":[0,3,5,5,3,4,2,1,0]},\n       {name:\"01. 기획\",\"data\":[1,2,3,4,5,6,7,4,3]},\n       {name:\"02. 디자인\",\"data\":[5,4,4,3,2,2,1,1,1]},\n       {name:\"03. 개발\",\"data\":[0,0,0,1,2,3,4,5,4]}\n}]",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "List error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./routes/reportAPI.js",
    "groupTitle": "ReportDepth3",
    "name": "GetApiReportDep3UpdatestateId"
  },
  {
    "type": "get",
    "url": "/api/report/operator/categori/:id",
    "title": "카테고리 별 진행 현황",
    "group": "ReportOperator",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "id",
            "optional": false,
            "field": "id",
            "description": "<p>상위 프로젝트 ID</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "headercols",
            "description": "<p>헤더정보</p>"
          },
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "items",
            "description": "<p>아이템</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n[{\n  더미데이터\n   lineData:{\n      headercols: [\"NewRequestCount\",\"InprogressCount\",\"CompletedCount\",\"PendingCount\"],\n      items: [\n           {\"name\":\"공통/전사\",\"InprogressCount\":10,\"CompletedCount\":20,\"NewRequestCount\":20,\"PendingCount\":1 },\n           {\"name\":\"해외여행\",\"InprogressCount\":5,\"CompletedCount\":0,\"NewRequestCount\":5,\"PendingCount\":1 },\n           {\"name\":\"국내여행\",\"InprogressCount\":10,\"CompletedCount\":20,\"NewRequestCount\":20,\"PendingCount\":1 },\n           {\"name\":\"해외항공\",\"InprogressCount\":20,\"CompletedCount\":50,\"NewRequestCount\":30,\"PendingCount\":1 },\n           {\"name\":\"국내항공\",\"InprogressCount\":10,\"CompletedCount\":40,\"NewRequestCount\":10,\"PendingCount\":1 },\n           {\"name\":\"해외호텔\",\"InprogressCount\":10,\"CompletedCount\":30,\"NewRequestCount\":10,\"PendingCount\":1 },\n           {\"name\":\"국내호텔\",\"InprogressCount\":30,\"CompletedCount\":10,\"NewRequestCount\":20,\"PendingCount\":1 },\n           {\"name\":\"모바일\",\"InprogressCount\":20,\"CompletedCount\":60,\"NewRequestCount\":10,\"PendingCount\":1 }\n       ]\n   },\n   pieData:{\n       headercols: [\"모바일\",\"국내호텔\",\"해외호텔\",\"국내항공\",\"해외항공\",\"국내여행\",\"해외여행\",\"공통전사\" ],\n       items: [\n           {name: \"모바일\", \"data\": 78},\n           {name: \"국내호텔\", \"data\": 37},\n           {name: \"해외호텔\", \"data\": 21},\n           {name: \"국내항공\", \"data\": 43},\n           {name: \"해외항공\", \"data\": 87},\n           {name: \"국내여행\", \"data\": 100},\n           {name: \"해외여행\", \"data\": 25},\n           {name: \"공통전사\", \"data\": 23}\n       ]\n   }\n}]",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "List error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./routes/reportAPI.js",
    "groupTitle": "ReportOperator",
    "name": "GetApiReportOperatorCategoriId"
  },
  {
    "type": "get",
    "url": "/api/report/operator/consumption/:id",
    "title": "소모성 업무 현황",
    "group": "ReportOperator",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "id",
            "optional": false,
            "field": "id",
            "description": "<p>상위 프로젝트 ID</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "headercols",
            "description": "<p>헤더정보</p>"
          },
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "items",
            "description": "<p>아이템</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n[{\n  더미데이터\n  lineData:{\n       headercols: [\"NewRequestCount\",\"InprogressCount\",\"CompletedCount\",\"PendingCount\",\n       items: [\n           {\"name\":\"Type A\",\"InprogressCount\":10,\"CompletedCount\":20,\"NewRequestCount\":20,\"PendingCount\":1 },\n           {\"name\":\"Type B\",\"InprogressCount\":5,\"CompletedCount\":0,\"NewRequestCount\":5,\"PendingCount\":1 },\n           {\"name\":\"Type C\",\"InprogressCount\":10,\"CompletedCount\":20,\"NewRequestCount\":20,\"PendingCount\":1 },\n           {\"name\":\"Type D\",\"InprogressCount\":20,\"CompletedCount\":50,\"NewRequestCount\":30,\"PendingCount\":1 },\n           {\"name\":\"Type E\",\"InprogressCount\":10,\"CompletedCount\":40,\"NewRequestCount\":10,\"PendingCount\":1 },\n           {\"name\":\"Type F\",\"InprogressCount\":10,\"CompletedCount\":30,\"NewRequestCount\":10,\"PendingCount\":1 },\n           {\"name\":\"Type G\",\"InprogressCount\":30,\"CompletedCount\":10,\"NewRequestCount\":20,\"PendingCount\":1 }\n       ]\n   },\n   pieData:{\n       headercols: [\"Type A\",\"Type B\",\"Type C\",\"Type D\",\"Type E\",\"Type F\",\"Type G\"],\n       items: [\n           {name: \"Type A\", \"data\": 78},\n           {name: \"Type B\", \"data\": 37},\n           {name: \"Type C\", \"data\": 21},\n           {name: \"Type D\", \"data\": 43},\n           {name: \"Type E\", \"data\": 87},\n           {name: \"Type F\", \"data\": 100},\n           {name: \"Type G\", \"data\": 25}\n       ]\n   }\n}]",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "List error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./routes/reportAPI.js",
    "groupTitle": "ReportOperator",
    "name": "GetApiReportOperatorConsumptionId"
  },
  {
    "type": "get",
    "url": "/api/report/operator/joborder/:id",
    "title": "우선 순위 업무 현황",
    "group": "ReportOperator",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "id",
            "optional": false,
            "field": "id",
            "description": "<p>상위 프로젝트 ID</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "headercols",
            "description": "<p>헤더정보</p>"
          },
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "items",
            "description": "<p>아이템</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n[{\n  더미데이터\n  lineData:{\n       headercols: [\"NewRequestCount\",\"InprogressCount\",\"CompletedCount\",\"PendingCount\"],\n       items: [\n           {\"name\":\"Very High\",\"InprogressCount\":10,\"CompletedCount\":20,\"NewRequestCount\":20,\"PendingCount\":1},\n           {\"name\":\"High\",\"InprogressCount\":5,\"CompletedCount\":0,\"NewRequestCount\":5 ,\"PendingCount\":1},\n           {\"name\":\"Normal\",\"InprogressCount\":10,\"CompletedCount\":20,\"NewRequestCount\":20,\"PendingCount\":1},\n           {\"name\":\"Low\",\"InprogressCount\":20,\"CompletedCount\":50,\"NewRequestCount\":30,\"PendingCount\":1}\n       ]\n   },\n   pieData:{\n       headercols: [\"Low\",\"Normal\",\"High\",\"Very High\"],\n       items: [\n           {name: \"Low\", \"data\": 78},\n           {name: \"Normal\", \"data\": 37},\n           {name: \"High\", \"data\": 21},\n           {name: \"Very\", \"data\": 43}\n       ]\n   }\n}]",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "List error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./routes/reportAPI.js",
    "groupTitle": "ReportOperator",
    "name": "GetApiReportOperatorJoborderId"
  },
  {
    "type": "get",
    "url": "/api/report/operator/operatortimeline/:id",
    "title": "운영현황",
    "group": "ReportOperator",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "id",
            "optional": false,
            "field": "id",
            "description": "<p>상위 프로젝트 ID</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "headercols",
            "description": "<p>헤더정보</p>"
          },
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "items",
            "description": "<p>아이템</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n[{\n  더미데이터\n  headercols: [201701,201702,201703,201704,201705],\n  items: [\n      {name: \"IT 업무요청\", \"data\": [1,1,2,1,1]}\n   ],\n  info:{NewCountCurMonth:0,TotalInprogressCount:2,TotalClosecount:8,TotalCount:10 }\n}]",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "List error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./routes/reportAPI.js",
    "groupTitle": "ReportOperator",
    "name": "GetApiReportOperatorOperatortimelineId"
  },
  {
    "type": "get",
    "url": "/api/report/operator/state/:id",
    "title": "상태  현황",
    "group": "ReportOperator",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "id",
            "optional": false,
            "field": "id",
            "description": "<p>상위 프로젝트 ID</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "headercols",
            "description": "<p>헤더정보</p>"
          },
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "items",
            "description": "<p>아이템</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n[{\n  더미데이터\n  headercols: [\"New/Request\",\"CHECKING\",\"PLANNING\",\"DESIGN\",\"PUBLISHING\",\"DEVELOPMENT\",\"QA\",\"RELEASE-TEST\",\"RELEASE-STAGING\",\"RELEASE-REAL\",\"RESOLVED\",\"CLOSED\"],\n  items: [\n       {name: \"New/Request\", \"data\": 1 },\n       {name: \"CHECKING\", \"data\": 1 },\n       {name: \"PLANNING\", \"data\": 1 },\n       {name: \"DESIGN\", \"data\": 1 },\n       {name: \"PUBLISHING\", \"data\": 1 },\n       {name: \"DEVELOPMENT\", \"data\": 1 },\n       {name: \"QA\", \"data\": 1 },\n       {name: \"RELEASE-TEST\", \"data\": 1 },\n       {name: \"RELEASE-STAGING\", \"data\": 1 },\n       {name: \"RELEASE\", \"data\": 1 },\n       {name: \"RESOLVED\", \"data\": 1 },\n       {name: \"CLOSED\", \"data\": 1 }\n   ]\n}]",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "List error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./routes/reportAPI.js",
    "groupTitle": "ReportOperator",
    "name": "GetApiReportOperatorStateId"
  },
  {
    "type": "get",
    "url": "/api/report/menu",
    "title": "프로젝트정보(Menu)",
    "group": "Util",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "rootmenu",
            "description": "<p>메뉴 리스트</p>"
          },
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "rootmenu.info",
            "description": "<p>프로젝트정보</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "rootmenu.info.id",
            "description": "<p>프로젝트 ID</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "rootmenu.info.name",
            "description": "<p>프로젝트 이름</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "rootmenu.info.is_public",
            "description": "<p>공개 프로젝트 여부</p>"
          },
          {
            "group": "Success 200",
            "type": "Date",
            "optional": false,
            "field": "rootmenu.info.created_on",
            "description": "<p>프로젝트 생성날짜</p>"
          },
          {
            "group": "Success 200",
            "type": "Date",
            "optional": false,
            "field": "rootmenu.info.updated_on",
            "description": "<p>프로젝트 종료날짜</p>"
          },
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "rootmenu.info.subMenuList",
            "description": "<p>하위 프로젝트 리스트</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n[{\n      \"rootmenu\":[\n          {\"info\":{\n              \"id\":2,\n              \"name\":\"2 프로젝트\",\n              \"description\":\"인터파크투어 모든 프로젝트를 관리 합니다.\\r\\n※ 투어 내 모든 프로젝트를 타임라인에서 확인 하시기 바랍니다.\\r\\n\",\n              \"is_public\":0,\n              \"parent_id\":null,\n              \"created_on\":\"2016-11-06T23:16:14.000Z\",\n              \"updated_on\":\"2017-04-13T02:29:07.000Z\",\n              \"identifier\":\"project-all\",\n              \"status\":1,\n              \"lft\":27,\n              \"rgt\":154,\n              \"project_type_id\":2,\n              \"responsible_id\":-1,\n              \"work_packages_responsible_id\":null},\n              \"subMenuList\":[{\n                  \"info\":{\"id\":4,\n                          \"name\":\"2-3. 국내항공\",\n                          \"description\":\"인터파크투어 프로젝트 > 국내항공 프로젝트 입니다.\\r\\n※ 국내항공 프로젝트 공지사항을 작성하시기 바랍니다.\",\n                          \"is_public\":0,\"parent_id\":2,\n                          \"created_on\":\"2016-11-07T21:26:12.000Z\",\"updated_on\":\"2017-01-06T00:26:23.000Z\",\"identifier\":\"project-flight-domestic\",\"status\":1,\"lft\":72,\"rgt\":77,\"project_type_id\":2,\"responsible_id\":-1,\"work_packages_responsible_id\":null},\n                          \"subMenuList\":[{\n                              \"info\":{\"id\":121,\n                                      \"name\":\"중단기 프로젝트_국내항공\",\n                                      \"description\":\"* 프로젝트 시작일 : \\r\\n* 프로젝트 종료일 : \\r\\n\",\"is_public\":0,\"parent_id\":4,\"created_on\":\"2017-02-16T20:55:45.000Z\",\"updated_on\":\"2017-04-13T03:06:57.000Z\",\"identifier\":\"short2\",\"status\":1,\n               ///이하 생략\n}]",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "List error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./routes/reportAPI.js",
    "groupTitle": "Util",
    "name": "GetApiReportMenu"
  }
] });
