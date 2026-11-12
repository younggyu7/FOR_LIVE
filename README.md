# 회사1 업무 포털

회사1 개발 스펙 v3.1.1에서 코드로 만든 서비스다 (app-format v1). 업무 179개 · 화면 238개 · 자동 실행 7개.
구현 범위와 고객 답을 기다리는 규칙은 [IMPLEMENTATION.md](IMPLEMENTATION.md), 화면 목록은 [spec/SCREENS.md](spec/SCREENS.md), 스펙 문서는 [spec/](spec/)에 있다.

## 바로 실행 (Docker만 있으면 된다)

```bash
docker compose up --build
```

처음에는 이미지와 라이브러리를 내려받느라 몇 분 걸린다. 다 뜨면 브라우저에서 **http://localhost:8080** 을 연다 (포트가 겹치면 `APP_PORT=8081 docker compose up --build`처럼 바꾼다. DB 포트는 `DB_PORT`).
DB에는 스펙의 schema.sql과 예시 데이터(seed.sql)가 들어간다. 저장한 데이터는 다시 시작해도 남는다 (`docker compose down -v`로 처음 상태로 돌린다).

### 계정

처음 실행할 때 역할마다 시연 계정을 만들고 비밀번호를 **`local/accounts.txt`** 에 적는다 (로그에는 남기지 않는다). 모두 같은 비밀번호로 하려면 실행 전에 환경 변수 `DEMO_PASSWORD`를 정한다. 비밀번호를 새로 만들려면 `RESET_PASSWORDS=true`로 한 번 실행한다.

| 아이디 | 역할 | 처음 해 볼 업무 |
|---|---|---|
| admin | 관리자 (전체 권한) | 통합 사용 권한 관리, RFID 기반 자산 관리, e나라도움 연동 |
| user | 임직원 | 메뉴 관리, 품의서 입력 및 승인, 결의서 관리 |

## 화면만 보기 (서버·DB 없이 예시 데이터)

```bash
cd frontend
npm install
npm run dev
```

로그인 대신 역할을 골라 들어간다. 새로고침하면 처음 데이터로 돌아간다. 오른쪽 위 '검토 모드'를 켜면 화면마다 업무 규칙과 고객 확인이 필요한 항목이 보인다. LLM이 구현한 기능 화면은 서버가 있어야 동작한다.

## 고치면서 띄우기 (Node 20 · NestJS)

```bash
docker compose up -d db                 # PostgreSQL만 (포트 5433)
cd backend && npm install && npm run build
cd backend && DB_URL='postgresql://app:app@localhost:5433/app' npm start   # 서버 8080 (계정 파일은 backend/local/accounts.txt)
cd frontend && NEXT_PUBLIC_API=server npm run dev
```

## 어디를 고치나

| 위치 | 내용 | 고쳐도 되나 |
|---|---|---|
| `backend/src/feature/` · `frontend/ui/pages/` | LLM이 구현한 기능 (develop --build) | 예. 고친 파일은 다시 생성해도 그대로 둔다 |
| `backend/src/logic/` | 기능별 업무 로직 (`// <hole>` 안) | 예. 고친 파일은 다시 생성해도 그대로 둔다 |
| `backend/src/api/` | 스펙에서 만든 API | 아니오. 스펙을 고치고 다시 생성한다 |
| `frontend/ui/generated/` | 스펙에서 만든 화면 설계·예시 데이터 | 아니오. 스펙을 고치고 다시 생성한다 |
| `backend/test/acceptance/` | 수용 기준 테스트 틀 (`skip`, `npm test`) | 예. 채우면 그대로 둔다 |

## 다시 만들기

같은 스펙으로 `develop`을 다시 실행하면 LLM을 부르지 않고 같은 파일이 나온다 (LLM 결과는 `.req-agent/`에 저장). 스펙이 바뀐 기능만 다시 만든다. 이 폴더를 git에 커밋해 두면 확정본으로 고정된다.
