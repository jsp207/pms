# PMS LISTEN(Bridge) SERVICE API


apidocument :  http://pms.interparktour.com:8080/apidoc/

pmsreport : http://pms.interparktour.com:8080/report


## 소개

	 OPEN PROJECT(PMS)와 외부 저장소(GIT LAB)및 기타툴들과 
	 
	연동을 위한 API SERVICE 입니다.

	Asp.net 버젼(프로타잎)과 리눅스에서 실행 가능한 Node.js 두가지 버젼으로 개발되었으며

	이 페이지에서는 리눅스용 서비스 설치및 실행방법을 설명을 합니다.

	* PmsListenService : Asp.net으로 구동되는 버젼

	* PmsListenNodeService : 리눅스 계열에 구동을 위한 Node.js  버젼

	==> 형상관리 이슈관리등의 툴들이 모두 리눅스계열에 구동중이기때문에, Asp.net으로 구동되는 버젼은 폐기예정입니다.
	

## 제공 API

	* /api/GitLab/PushEvent : GitLab에서 발생하는 PushEvent를 처리합니다.
	* /api/GitLab/MergeEvent : GitLab에서 발생하는 MergeEvent를 처리합니다.
	* /api/report : PMS의 각종 리포팅을 데이터로 제공


## 설치: CENT OS 기준
	su 명령어로 관리자 권한으로 전환

### 디펜던시:
#### NODE.JS 설치: https://nodejs.org/en/download/package-manager/

	curl -k --silent --location https://rpm.nodesource.com/setup_7.x | bash -

	yum -y install nodejs


#### PM2 설치: http://pm2.keymetrics.io/

	npm config set strict-ssl false

	npm install pm2 -g



#### PMS LISTEN SERVICE 설치및 서비스 등록:
	
	cd /opt

	git clone http://git.interparktour.com/N17042/PMS_LISTEN_SERVICE.git

	cd PMS_LISTEN_SERVICE

	cd PmsListenNodeService
	
## 환경 설정 :	

	// appcfg.json 을 수정, 서비스 재시작 적용 
	{
        "PMSUrl" : "http://180.70.96.191",
        "PMSUrlFix" : "http://git.interparktour.com",
        "PMSAPIToken" : "XXXXXXXXXXXXXXXXXXXXXXXXXXXXX",	//PMS에서 생성한 API Token입력
        "GitUrl" : "http://180.70.96.227",
        "GitUrlFix" : "http://pms.interparktour.com",
        "ServicePort" : 3000,
        "DB" :{
            "HOST" : "127.0.0.1",
            "PORT" : 3306,
            "USER" : "root",
            "PW" : "XXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
            "DB" : "openproject"
        }
	}
	//XXXUrl :서버간 접속되는 Url
	//XXXUrlFix:사용자에게 노출되는 Url
	//PMSAPIToken: PMS에서 글 쓰기 가능한 권한의 APIToken
	//ServicePort : 서비스 포트

## 서비스 등록 : 최초 한번만 필요	

	pm2 start listenapi.js --name "listenapi"

## 서비스 제어: 업데이트시 사용
	* pm2 log "listenapi"
	* pm2 stop "listenapi"   - 서비스정지
	* pm2 restart "listenapi" - 서비스 재시작
	* pm2 delete "listenapi" - 서비스 삭제
	
## Update Process :
	* cd /opt
	* cd PMS_LISTEN_SERVICE
	* cd PmsListenNodeService
	* git pull
	* pm2 restart "listenapi" - 서비스 재시작

	
## 보안 허용 사항
	
	PMSListen ServicePort 3000번이라고 가정


	1.GitLab에서의 Push 이벤트

	GitLab(OutBound) -> PMS(Inbound)  : 3000번 Port 허용


	2.PMS에서 GitLab의 API를 호출

	PMS(OutBound ) -> GitLab(InBound) : 80번 Port 허용



