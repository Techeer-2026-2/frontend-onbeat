# 통근길 플레이리스트 - Frontend

통근 정보(노선/소요시간)에 맞춰 음악을 추천하고, 홈 화면에 연령대 기반 배너 광고를 노출하는 플랫폼입니다.

Spotify의 UI/UX를 참고하여 음악 스트리밍 서비스의 주요 기능을 구현하고,
통근이라는 서비스 컨셉에 맞춰 음악 탐색 및 추천 경험을 제공합니다.

- 조직: [Techeer-2026-2](https://github.com/Techeer-2026-2) · 팀 D (5명)
- 일정: **P1 ~ 10/7** · **P2 ~ 10/16** · P3(고도화) 이후
- 팀 Notion: [2026-하반기-팀프로젝트-d](https://app.notion.com/p/2026-d-3c8dc21d58f080eb89e6c34d9651f266)
  (기능 명세서 / API 명세서 / ERD 는 Notion 이 기준)

---

## 기술 스택

| 구분 | 스택 |
|---|---|
| 언어 | JavaScript |
| 프레임워크 | React |
| 빌드 | Vite |
| CSS | Tailwind CSS |
| 상태 관리 | Zustand |
| 서버 상태 관리 | TanStack Query |
| 코드 품질 관리 | ESLint |
| 배포 | AWS S3 + CloudFront |

---

## 빠른 시작

### 1. 저장소 클론

```bash
git clone https://github.com/Techeer-2026-2/frontend-onbeat.git
cd onbeat
```

### 2. 패키지 설치

```bash
npm install
```

### 3. 환경 변수 설정

`.env.example` 파일을 참고하여 `.env` 파일을 생성합니다.

```bash
cp .env.example .env
```

필요한 환경 변수를 설정합니다.

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 아래 주소로 접속합니다.

```text
http://localhost:5173
```

### 5. 프로덕션 빌드

```bash
npm run build
```

### 6. 빌드 결과 확인

```bash
npm run preview
```

---

## 프로젝트 구조

```text
src/
├── assets/
│
├── components/
│   ├── common/
│   ├── layout/
│   ├── music/
│   └── player/
│
├── pages/
│   ├── Create/
│   ├── Home/
│   ├── Library/
│   ├── Map/
│   └── Search/
│
├── store/
├── api/
├── hooks/
├── utils/
├── constants/
│
├── App.jsx
├── index.css
└── main.jsx
```

---

## 관련 저장소

### 백엔드

https://github.com/Techeer-2026-2/backend

### 광고 성과 분석

광고 성과 분석 및 캠페인 관리 기능은 별도의 프론트엔드 프로젝트로 관리합니다.

- Repository: `frontend-adlytic`
```
