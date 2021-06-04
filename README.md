# WM3 Tower (관제서버 프로그램)

---

## 촬영 프로젝트를 생성하고 관리하는 일련의 과정을 처리하는 프로그램

### Stacks

---

javascript, react, redux, redux-thunk, redux-promise, ol, antd, eslint, toast-ui

## 1. USER

---

- Sign up
  - 회원가입시 게스트 권한 부여, 관리자가 권한 변경 가능

* Sign in
  - guest/worker/admin 권한에 따라 로그인 및 페이지 이동 됨

![user.gif](./image/user.gif)

## 2. PROJECT

---

- 촬영 프로젝트 관리
  - 프로젝트 생성 및 정보 수정, 프로젝트 삭제

* Draft 경로 입력
  - 멀티파일 업로드 가능, 등록 후 수정은 불가하며 기존 경로 다운로드 후 새경로 덮어쓰기 가능

- User 할당
  - 프로젝트를 관리하는 유저 목록 관리

![project.gif](./image/project.gif)

## 3. VEHICLE

---

- 장비 관리
  - Vehicle 등록 및 수정, 삭제

![vehicle.gif](./image/vehicle.gif)

## 4. JOURNEY

---

- 촬영계획 CRUD
  - 경로계획 - Mission 경로 입력
  - LOG 업로드 - Recorded 경로 입력, 장비 선택
  - 보고 - 데이터 업로드 / IE 처리

* 촬영물 추가
  - LOG 업로드 - Recorded 경로 입력, 장비 선택
  - 보고 - 데이터 업로드 / IE 처리

- 촬영계획 한번에 보기 - 보고
  - 촬영계획명, 경로계획 목록, 장비명, 업로드로그 파일명, 업로그 nas 경로, ins 파일명
  - 각 스텝 description 표시
  - 로그데이터 표시
    - 처리결과 및 지도 표시
      - 경로계획, 촬영경로, 프로젝트 Draft 경로

![journey.gif](./image/journey.gif)

## 설치방법

---

### How to use this project

1. .env 파일을 만든다.
2. 환경 변수를 저장한다.
3. /src/config.js 파일에 저장한 환경변수를 연결한다.
4. .gitignore에 추가한다.
5. package.json를 아래 코드를 추가한다. (set PORT=3002는 삭제 가능)
6. 서버와 프록시 설정 (서버 api 포트를 확인)

```
"scripts": {
    "start:dev": "copy .env.dev .env && react-scripts start",
    "start": "copy .env.prod .env && set PORT=3002 && react-scripts start",
    ...
}
```

###Installation

```
npm install
yarn install
```

###Running

```
// 로컬 개발 시
npm run start:dev
yarn start:dev

// 배포시
npm run start
yarn start
```
