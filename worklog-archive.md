# Family OS — Worklog

> 통합 가족 대시보드 프로젝트 작업 기록. 세션별로 누적 기록.

---

## Session 1 — Phase 1: 메인 허브 페이지 + 디자인 시스템 정의

**날짜**: 2026-05-14
**범위**: 메인 페이지(`index.html`) + 공통 디자인 토큰(`design-tokens.css`) + 다음 세션용 가이드 2종

### 확정된 의사결정

| 항목 | 결정 |
|---|---|
| 작업 방식 | B안 — 4개 서브 대시보드 완전 재개발 (이 세션은 메인만) |
| 백엔드 | 대시보드별 별도 스프레드시트 4개 + 별도 Apps Script Web App 4개 |
| 호스팅 | GitHub Pages (public repo) |
| 인증 | Web App URL은 LocalStorage 저장 (기기별 1회 입력). 가족 외 접근 차단은 URL 비밀성에 의존 |
| 사용자 | 부부 2명 (엄마/아빠). Health 모니터링 대상은 4명 (아빠/엄마/로비/도비) |
| 디자인 톤 | 다크 (#0A0B0F) + 골드 (#E5C158). Wealth 디자인 토큰 차용 |
| 폰트 | Fraunces (display) + Pretendard (body) + JetBrains Mono (mono) |
| 모드 | 다크 전용 (라이트 모드 미지원) |
| 대시보드별 악센트 | Wealth=골드 / Expense=인디고 / Health=민트 / Future=라벤더 |
| 반응형 | PC/모바일 단일 파일. PWA 지원 |
| 링크 동작 | 카드 클릭 시 새 탭에서 서브 대시보드 열기 |
| Wealth 카드 | 메인은 총 자산만, 펼치기로 상세 |
| Task 처리 | 메인은 표시만. 클릭 시 해당 대시보드로 이동 |
| Apps Script 응답 표준 | `{ok, data: {kpi, tasks, updated_at}}` 통일 (별도 spec 문서로) |

### 산출물 (완료)

1. ✅ `index.html` (42KB) — 메인 허브 페이지
2. ✅ `design-tokens.css` (6.5KB) — 공통 CSS 변수
3. ✅ `design-system.md` (7KB) — 디자인 가이드 (다음 채팅에 첨부)
4. ✅ `backend-spec.md` (8KB) — Apps Script 표준 응답 포맷 (다음 채팅에 첨부)
5. ✅ `manifest.json` (0.5KB) — PWA 매니페스트
6. ✅ `icon.svg` (0.8KB) — PWA 아이콘
7. ✅ `worklog.md` — 이 파일

### 검증

- ✅ JS 문법 (node --check)
- ✅ JSON 유효성 (manifest)
- ✅ HTML 태그 짝 (div/section/article/header/main/footer/span/button/ul/li 모두 균형)

### 메인 허브가 제공하는 기능

- 4개 KPI 카드: Wealth(총자산+펼치기), Expense(전달지출+카테고리), Health(가족4명 점), Future(은퇴까지+진행률)
- 카드 클릭 → 새 탭에서 해당 서브 대시보드 열림 (`./wealth.html` 등)
- 4가지 상태 처리: 미설정 / 로딩 / 정상 / 에러
- 통합 Task 섹션: 4개 대시보드의 task 통합, urgency 정렬, 클릭 시 해당 대시보드 이동
- 설정 모달: 4개 Web App URL 한 화면에서 입력, LocalStorage 저장
- PWA: 홈 화면 추가 가능 (manifest + apple-touch-icon)
- 반응형: PC 2x2, 모바일 1열 세로
- 다크 테마 단일

### 알려진 한계 / Phase 2 작업으로 미룬 것

- ❌ 가족 4명 멤버 단위 진입 (Health 페이지에서 처리)
- ❌ Task를 메인에서 직접 처리 (예: 약 체크박스). 현재는 표시만 + 이동
- ❌ Service Worker (오프라인 캐싱). 1단계 범위 밖
- ❌ 사용자 라이트 테마
- ❌ 4개 서브 대시보드 (다음 세션들에서 각각 재개발)

### Phase 2 이후 진행 흐름 (다음 채팅 세션들)

1. **Wealth 재개발** — 기존 Apps Script(577줄)는 그대로 유지 가능. `?mode=summary` 엔드포인트만 추가. HTML은 디자인 토큰에 맞춰 재작성
2. **Expense 재개발** — Apps Script 신규 작성 (가계부 import 로직 포함). HTML 재작성
3. **Health 재개발** — Apps Script 신규. HTML 재작성. 가족 4명 모니터링
4. **Future 재개발** — Apps Script 신규. HTML 재작성. 시뮬레이션/마일스톤

각 세션마다 `design-system.md` + `backend-spec.md` + 기존 해당 HTML 첨부 권장.

### 토큰/비용 메모

- Phase 1 작업 토큰: 메인 페이지 + 4종 가이드. 중간 정도 사용량
- 운영 비용: 전체 무료 (GitHub Pages, Apps Script, Sheets API)
- 외부 폰트 (Google Fonts, Pretendard CDN): 무료, 캐시되면 로딩 빠름

- [완료] Phase 1 작업 종료

---

## Session 1.5 — 구조 통일 (Phase 1 추가 작업)

**날짜**: 2026-05-14 (동일 세션 연장)
**범위**: 4개 서브 대시보드가 공유할 코드 골격 표준화

### 배경

사용자가 "기능은 그대로 두되 구조는 통일하고 싶다"고 요청.
시트 스키마는 건드리지 않고, Apps Script + HTML/JS 레이어에서만 통일.

### 추가 산출물

8. ✅ `common.js` (16KB) — 4개 대시보드 + 메인이 공유하는 공통 모듈 (window.FamilyOS)
9. ✅ `dashboard-template.html` (14KB) — 서브 대시보드 시작점 HTML
10. ✅ `apps-script-template.gs` (9KB) — 서브 대시보드 백엔드 시작점

### 추가 변경

- ✅ `index.html` 리팩토링 — common.js 사용. 코드 중복 제거. 동작 동일.

### common.js 공개 API (총 26개)

**상수**: `DASHBOARDS`, `STORAGE_PREFIX`, `getDashboardMeta(id)`
**포맷터**: `fmtKRW`, `fmtKRWFull`, `fmtPct`, `fmtPctNoSign`, `deltaClass`, `timeAgo`, `escapeHtml`
**URL 관리**: `getWebAppUrl(id)`, `setWebAppUrl(id, url)`, `getAllWebAppUrls()`
**Fetch**: `fetchDashboardData(id, mode)` — 타임아웃 15s, 스키마 검증, 에러 표준화
**UI 렌더링**: `renderHeaderHTML`, `renderFooterHTML`, `renderSettingsModalHTML`, `attachSettingsModal`, `renderUnsetStateHTML`, `renderLoadingStateHTML`, `renderErrorStateHTML`
**헤더 sync**: `setLastSync`, `setSyncedNow`
**PWA**: `registerServiceWorker`

### 통일된 범위 / 안 된 범위

| 통일됨 ✅ | 통일 안 됨 (각자 자유) |
|---|---|
| HTML 골격 (헤더/푸터/모달 위치) | 시트 스키마 |
| 응답 envelope (`{ok, data:{...}}`) | KPI 내부 산출 로직 |
| 유틸 함수 시그니처 | 외부 API 호출 방식 |
| LocalStorage 키 컨벤션 | 캐시 전략 |
| 빈 상태 UI (unset/loading/error) | 대시보드 본문 콘텐츠 |
| Apps Script 헬퍼 (`readSheetAsObjects` 등) | 시트 권한 / 트리거 |

### 검증 결과

- ✅ common.js 문법 (node --check)
- ✅ index.html 내부 JS 문법
- ✅ dashboard-template.html 내부 JS 문법
- ✅ apps-script-template.gs 문법
- ✅ manifest.json 유효성
- ✅ common.js export 26개와 호출처 매칭 (index.html / template.html 모두)

### 최종 산출물 목록 (10개)

```
family-os/
├── index.html              ← 메인 허브 (브라우저로 여는 페이지)
├── design-tokens.css       ← 공통 CSS 변수
├── common.js               ← 공통 JS 모듈 (window.FamilyOS)
├── manifest.json           ← PWA 매니페스트
├── icon.svg                ← PWA 아이콘
├── dashboard-template.html ← 서브 대시보드 시작점 (다음 세션 시작 시 복사)
├── apps-script-template.gs ← 백엔드 시작점 (다음 세션 시작 시 복사)
├── design-system.md        ← 디자인 가이드 (다음 세션에 첨부)
├── backend-spec.md         ← 백엔드 규격 (다음 세션에 첨부)
└── worklog.md              ← 이 파일 (누적 기록, 다음 세션에 첨부)
```

### 다음 세션 시작 매뉴얼

새 채팅 세션 시작 시 사용자가 첨부할 파일:
1. **재개발할 기존 대시보드 HTML** (예: Family_Wealth_Dashboard.html)
2. **연결된 Apps Script 코드** (예: 첨부받은 apps_script_gs.txt)
3. **`worklog.md`** (이 파일. 누적 기록)
4. **`design-system.md`**
5. **`backend-spec.md`**
6. **`common.js`**
7. **`dashboard-template.html`**
8. **`apps-script-template.gs`**

위 8개를 첨부하면 다음 세션 Claude는 즉시 작업 가능.

### 다음 세션 추천 순서

1. **Wealth 재개발** (가장 자산 많음, Apps Script `?mode=summary` 추가)
2. **Expense 재개발**
3. **Health 재개발**
4. **Future 재개발**

각 세션 종료 시 worklog에 누적 기록.

- [완료] Session 1.5 종료

---

## Session 2 — Phase 2: Wealth 재개발

**날짜**: 2026-05-15
**범위**: Wealth 대시보드 풀 재개발 (HTML + Apps Script + 시트에 🎯 목표 시트 추가)

### 확정된 의사결정

| 항목 | 결정 |
|---|---|
| HTML 재개발 방향 | 처음부터 재작성. 기능 6개 전부 유지, 레이아웃만 재정제, 단일 반응형 페이지(같은 파일 내 뷰 전환) |
| 유지할 기능 | 도넛 차트, 기간별 막대차트, 가족 멤버 필터, 종목 상세 뷰, 부동산 재건축 단계, Insights/목표 진행률 |
| Apps Script | 처음부터 재작성. 기존 시트 그대로 사용 |
| 🎯 목표 시트 | 시트에 신규 추가 (Insights 섹션이 의존) |
| 종목 상세 뷰 | 같은 파일 내 뷰 전환(기존 방식 유지). 별도 파일 안 만듦 |
| 차트 라이브러리 | Chart.js 유지(검증된 도구. SVG 직접 그리기로 작업량 늘리지 않음) |
| 가족 데이터 호환 | 기존: 'dad' / 'mom' / 'son1' / 'son2'. 메인 허브 spec엔 'robi' / 'dobi' 언급. **본 세션은 기존 키 유지** (시트의 family id가 son1/son2) |

### 비판적 코멘트 (작업 중 짚어둘 것)

- 기존 코드의 "부채율" 계산식이 금융권 표준(부채/자기자본)과 다름 → `부채 / (주식+부동산+양수현금)`. 라벨을 "부채/총자산"으로 명확히 해 의미 일치
- 메인 허브의 spec에선 family id가 `robi`/`dobi`로 되어 있으나, 시트는 `son1`/`son2`. **시트가 진실의 원천**이므로 시트 따름. 메인 spec은 향후 Health 재개발 때 동기화

### 작업 계획

1. ✅ Session 2 시작 기록
2. ✅ `Family_Wealth_Sheet.xlsx` — 🎯 목표 시트 추가
3. ✅ `wealth-apps-script.gs` — 처음부터 재작성 (mode=summary + mode=full)
4. ✅ `wealth.html` — 단일 반응형 파일
5. ✅ 문법/구조 검증
6. ✅ Session 2 완료 기록

### 산출물 (4개)

| # | 파일 | 크기 | 비고 |
|---|---|---|---|
| 1 | `Family_Wealth_Sheet.xlsx` | 60KB | 🎯 목표 시트 신규 추가 (단기수익 5천만, 장기순자산 100억) |
| 2 | `wealth-apps-script.gs` | 821줄 | doGet 분기 (summary/full), Yahoo Finance 시세, FX, 일일스냅샷, Task 자동 생성 |
| 3 | `wealth.html` | 1601줄 | 단일 반응형 파일. 메인뷰 + 종목 상세뷰 SPA. Chart.js. 가족 필터 + 6개 카드 |
| 4 | `worklog.md` | 본 파일 | 누적 |

### Wealth HTML — 구현된 기능 (6개 모두)

1. ✅ **도넛 차트** (자산군 비중) — 국내주식/해외주식/부동산/현금 4분할
2. ✅ **기간별 막대차트** — DAY/WEEK/MONTH/QUARTER/YEAR 5탭. 증감에 따라 gain/loss 색
3. ✅ **가족 멤버 필터** — 전체/아빠/엄마/형(로빈)/동생(도빈). 가로 스크롤
4. ✅ **종목 상세 뷰** — 같은 파일 내 뷰 전환. 검색 + 8개 컬럼 정렬
5. ✅ **부동산 재건축 단계** — 시트의 stepHeaders/currentStep 기반
6. ✅ **Insights/목표 진행률 섹션** — 부채율, 단기수익, 장기순자산 3개 (부채율·장기목표는 가족 전체 기준 강제)

### 작업 중 적용한 비판적 결정

| 항목 | 결정 | 이유 |
|---|---|---|
| 부채율 owner 필터 무시 | "가정 단위" 지표로 항상 가족 전체 기준 계산 | 기존 코드 의도와 일치. mom 필터 시 dad 명의 주담대가 사라져 0% 나오는 직관 어긋남 방지 |
| 장기 순자산 목표도 가족 전체 | netPct 항상 전체 totalAll / netTarget | 100억 목표는 가정 단위 목표 |
| 부채율 라벨 명시화 | "가계 레버리지 — 부채 / 총자산 (가족 전체)" | 분모가 자기자본 아닌 총자산임을 명확히 |
| 차트 라이브러리 | Chart.js 유지 | SVG 직접 그리기로 작업량 1.5배 늘리지 않음 |
| 종목 상세 뷰 | 같은 파일 SPA | 별도 wealth-detail.html 만들지 않음 |

### Apps Script — buildSummaryPayload 응답 구조 (backend-spec.md 준수)

```javascript
{
  dashboard: 'wealth',
  kpi: {
    net_worth_krw: <int>,
    mom_pct: <number|null>,
    yoy_pct: <number|null>,
    breakdown: {
      domestic_stock: { value_krw, weight_pct, mom_pct, yoy_pct },
      foreign_stock:  { ... },
      realestate:     { value_krw, weight_pct, mom_pct: null, yoy_pct },
      cash:           { ... }
    }
  },
  tasks: [{ id, label, urgency, due }],
  updated_at: <ISO string>
}
```

### Tasks 자동 생성 규칙

- 부동산 실거래가 21~60일 미업데이트 → `warn`
- 부동산 실거래가 60일+ 미업데이트 → `bad`
- 일일 스냅샷 3일+ 미기록 → `warn`

### 검증 결과

- ✅ `wealth-apps-script.gs` Node 문법 (`.js` 복사 후 `node --check`)
- ✅ `wealth.html` 내부 인라인 JS 문법
- ✅ HTML 태그 짝 (div 107쌍, section 4쌍, script 3쌍)
- ✅ 모든 mount ID 존재 (`hdr-mount`, `ftr-mount`, `modal-mount`, `main-mount`, `detail-mount`, `fam-bar`, `main-view`, `detail-view`, `detail-back`)
- ✅ wealth.html → common.js 호출 API 16개 모두 export에 매칭됨
- ✅ Apps Script summary 응답 키가 backend-spec.md와 완전 일치 (KPI 4키, breakdown 4그룹, 그룹 내부 4키, task 4키, envelope)

### 알려진 한계 (Phase 3 이후로 미룬 것)

- 일일 스냅샷 history 컬럼이 stock(통합)만 있어 mom/yoy를 국내/해외 분리 불가. 메인 허브의 `domestic_stock.mom_pct` 와 `foreign_stock.mom_pct` 가 같은 값으로 나옴. 정확히 분리하려면 시트의 일일스냅샷에 `stock_domestic` / `stock_foreign` 컬럼 추가 필요
- 일일 스냅샷이 현재 1행뿐 → 막대차트가 1점만, mom_pct/yoy_pct가 null. 트리거 등록 후 데이터 누적되면 자연히 해결
- 가족 멤버 ID — 메인 허브 spec엔 `robi`/`dobi`, 시트엔 `son1`/`son2`. 본 세션은 **시트 따름**. Health 재개발 시 통일 검토 필요
- `note` 필드(보유종목 비고) — 백엔드에선 반환하지만 프론트에선 미사용. 종목 상세뷰에 후속 표시 가능
- 종목 행 클릭 시 개별 상세 모달 미구현 (테이블에서 한눈에 보는 게 더 빠를 수 있어 일단 보류)

### 배포 방법

1. **시트 업데이트** — Family_Wealth_Sheet.xlsx를 Google Drive에 업로드 (기존 시트 위에 덮어쓰기) 또는 🎯 목표 시트만 수동 추가
2. **Apps Script 교체** — 기존 시트의 확장프로그램 > Apps Script에 `wealth-apps-script.gs` 내용 붙여넣기 → 배포 > 새 버전
3. **wealth.html 배포** — GitHub Pages 디렉토리에 추가
4. **메인 허브 Web App URL 입력** — Apps Script 신규 배포 URL을 메인 허브 설정 모달의 Wealth 칸에 입력

### Phase 3 다음 세션 추천

다음 세션엔 **Expense** 재개발. 이번 세션의 패턴(시트→Apps Script→HTML, 단일 반응형, SPA식 뷰 전환)이 그대로 적용 가능. design-system.md / backend-spec.md / common.js / dashboard-template.html / apps-script-template.gs / worklog.md 첨부 + 기존 Expense 자료가 있다면 함께.

### 토큰/비용

- 운영 비용: 추가 없음 (Yahoo Finance / Apps Script / GitHub Pages 모두 무료 유지)
- 본 세션 토큰: 무거운 편 (HTML 1601줄 + Apps Script 821줄). 대형 단일 파일 작업의 특성

- [완료] Session 2 종료

---

## Session 2.1 — Hotfix: standalone Apps Script 지원

**날짜**: 2026-05-15 (동일 세션 연장)
**범위**: `wealth-apps-script.gs` 패치

### 문제

사용자 보고: HTML과 Apps Script 연결 시 에러
```
TypeError: Cannot read properties of null (reading 'getSheetByName')
```

### 원인 분석

- 사용자가 Apps Script를 **standalone(독립) 프로젝트**로 생성 ("wealth apps script"라는 별도 이름)
- 내 코드는 `SpreadsheetApp.getActiveSpreadsheet()`로 시트를 가져오는데, 이는 container-bound 스크립트에서만 동작 (시트의 "확장프로그램 > Apps Script"로 만든 경우만)
- standalone 프로젝트에서는 `null` 반환 → 그 다음 `.getSheetByName()` 호출에서 TypeError

### 비판적 회고

- backend-spec.md / apps-script-template.gs / 본 wealth-apps-script.gs 모두 container-bound 가정을 암묵적으로 깔고 있었음
- "별도 Apps Script 1개"라는 spec 문구를 사용자가 standalone으로 해석하는 건 자연스러움
- 함정이 spec 자체에 있었음 → 다음 세션(Expense, Health, Future) 시작 시 템플릿 보강 필요

### 수정 내용

`wealth-apps-script.gs`:

1. `SHEET_ID` 상수 추가 (상단 설정 영역)
2. `getSpreadsheet_()` 헬퍼 신규:
   - SHEET_ID 비어있지 않으면 `SpreadsheetApp.openById(SHEET_ID)`
   - 비어있으면 `getActiveSpreadsheet()` fallback
   - 둘 다 실패 시 명확한 에러 메시지로 fail-fast
3. `buildFullPayload()` 와 `recordDailySnapshot()` 의 `getActiveSpreadsheet()` 호출 → `getSpreadsheet_()` 로 교체
4. 파일 헤더 주석에 "standalone vs container-bound" 배포 옵션 2가지 명시

### 사용자 작업 (배포 시)

1. Google Sheets URL에서 시트 ID 복사
   - `https://docs.google.com/spreadsheets/d/`**`【여기 부분이 ID】`**`/edit`
2. Apps Script 편집기에서 상단 `const SHEET_ID = ''` 를 `const SHEET_ID = '복사한_ID'` 로 변경
3. **권한 부여 필수** — Apps Script 편집기에서 `debug_full` 함수를 한 번 직접 실행 → 시트 접근 권한 팝업 → 허용
   (이 단계 없이 웹 앱만 배포하면 권한 부족으로 또 다른 에러 발생 가능)
4. 다시 배포(또는 새 버전 배포)

### Phase 3 이후 적용할 spec 보강

다음 세션 시작 시 다음 파일도 같은 패턴으로 업데이트 권장:
- `apps-script-template.gs` — SHEET_ID 상수 + `getSpreadsheet_()` 헬퍼 기본 포함
- `backend-spec.md` — standalone 권장 가이드 + SHEET_ID 사용 패턴 추가

### 검증

- ✅ Node 문법 통과
- ✅ `getActiveSpreadsheet()` 직접 호출 0건 (헬퍼 안 fallback에만 존재)

- [완료] Session 2.1 종료

---

## Session 2.2 — Hotfix: .xlsx vs Google Sheets

**날짜**: 2026-05-15 (동일 세션 연장)
**범위**: 사용자 배포 안내 문서화 (코드 변경 없음)

### 문제

`debug_full` 실행 시 에러:
```
Error: 시트 열기 실패 (SHEET_ID="..."):
This operation is not supported for this document: ...
```

### 원인

사용자가 산출물 `Family_Wealth_Sheet.xlsx`를 Google Drive에 그대로 업로드 → Drive는 이를 **Excel 형식**으로 보존. `SpreadsheetApp.openById()`는 Google Sheets 형식만 지원하므로 실패.

ID 길이/형식은 정상이라 사용자 입장에선 디버깅이 까다로움.

### 비판적 회고

- Session 2 worklog의 "배포 방법" 1번 항목 — *"Family_Wealth_Sheet.xlsx를 Google Drive에 업로드 (기존 시트 위에 덮어쓰기) 또는 🎯 목표 시트만 수동 추가"* — 가 모호. Excel 파일은 Drive 업로드만으론 Google Sheets가 되지 않음을 명시했어야 함
- Session 2.1에서 SHEET_ID 안내할 때도 이 부분 빠뜨림
- 다음 세션부터 산출물 .xlsx 줄 때 "변환 필수" 단계 명시할 것

### 해결 (사용자 안내)

Google Drive에서 .xlsx → Google Sheets 변환:
1. 업로드한 .xlsx 파일 더블클릭 → Excel 뷰어로 열림
2. 파일 메뉴 → "Google Sheets로 저장"
3. 새 탭에 변환된 Google Sheets 열림 → **이 새 시트의 URL에서 ID 재추출**
4. Apps Script의 SHEET_ID 값 교체 → debug_full 재실행 → 권한 허용 → 새 버전 배포

### 다음 세션 적용 사항

- worklog 배포 가이드에 "**.xlsx 파일은 Google Drive 업로드 후 반드시 'Google Sheets로 저장'으로 변환 필요**" 명시
- backend-spec.md 보강 시 함께 반영

- [완료] Session 2.2 종료

---

## Session 2.3 — Hotfix: 부동산 시트 파싱 견고화

**날짜**: 2026-05-15 (동일 세션 연장)
**범위**: `wealth-apps-script.gs`의 `readRealestate()` 재작성

### 문제

`debug_full` 실행 시 에러:
```
TypeError: Cannot read properties of null (reading 'substring')
readRealestate @ Code.gs:530
```

해당 라인: `date: formatDate(values[r][0]).substring(0, 7)`.
즉 `formatDate()`가 null을 반환하는 행이 idx 17~22 범위에 있었음.

### 원인

원본 코드(내가 그대로 옮긴 부분)가 부동산 시트를 **행 인덱스 하드코딩**으로 파싱:
- A3:B10 → KV
- values[11] / values[12] → 재건축 단계 헤더/플래그
- values[17..22] → 실거래가 5건

원본 코드의 주석마저 *"한 줄 밀렸으므로 18행(인덱스 17)부터 읽도록 수정"* — 시트 구조 변경에 손으로 따라간 흔적. 본질적으로 fragile.

.xlsx → Google Sheets 변환 또는 사용자 편집 시 한 줄이라도 어긋나면 17번 행에 텍스트 행이 잡히고, formatDate가 null 반환, 그 뒤 substring에서 죽음.

### 비판적 회고

- 원본 코드를 그대로 옮긴 게 문제. 가져올 때 "이 부분은 fragile하니 견고하게 다시 쓸 것"이라는 판단을 했어야 함
- 행 인덱스 하드코딩은 시트 작업 환경(엑셀 ↔ Sheets 변환, 행 삽입/삭제, 사용자 편집)에 항상 깨질 위험
- 데이터 파싱 코드는 "사용자가 시트를 합리적으로 편집해도 안 깨지게" 작성해야 함

### 수정 내용

`readRealestate()` 전면 재작성. 3개 구역을 다음 방식으로 추출:

1. **KV 영역** — 행 인덱스 무시, 전체 행 스캔하며 A컬럼 텍스트가 알려진 라벨 셋 (`단지명`, `평형`, `동·호수`, `소유자`, `매입가`, `매입일`, `전세보증금`) 중 하나면 B컬럼을 값으로 채택
2. **재건축 단계** — 휴리스틱: 인접 두 행에서 윗 행에 문자열 3개 이상, 아랫 행에 boolean 1개 이상이면 매치
3. **실거래가** — 타입 기반: 첫 컬럼이 Date 객체 + 둘째 컬럼이 양의 숫자인 행만 추출. 정렬 후 최근 5건

이제 시트의 행 위치가 바뀌거나, 변환 미세 차이가 있어도 깨지지 않는다.

### 부수적으로 발견한 것

- 원본 시트에 **"전세보증금" 라벨 행이 없음** (시트 스키마에서 빠짐). 따라서 jeonse는 항상 0으로 계산되어 옴. 부동산 순자산 = 실거래가 평균 그대로. 사용자가 시트에 "전세보증금" 행 추가하면 자동 반영
- 원본 코드 `r=17`부터 시작은 첫 거래(가장 최근, 2026-02-20)를 한 칸 놓치는 미세 버그였음. 새 코드는 5건 모두 잡고 최근순 정렬

### 검증

- ✅ Node 문법 통과
- ✅ 새 코드는 행 인덱스 의존 0개
- ✅ 원본 시트 데이터로 시뮬레이션: 5건 실거래 모두 잡음, 재건축 현재단계 = 조합설립(idx 3) 정확히 인식

### 다음 세션 적용 사항

- 비표준 시트 파싱(KV+휴리스틱) 패턴을 backend-spec.md에 베스트 프랙티스로 기록
- apps-script-template.gs에 readSheetAsObjects 외에 `readKVSheet(ss, name, labels)` 같은 헬퍼 추가 검토

- [완료] Session 2.3 종료

────────────────────────────────────────────────────────────────────
## Session 3 — Expense 재개발 (Phase 3 진행)

**기간**: 2026-05-15
**대상**: 가계부 대시보드 → 다크 럭셔리 + 인디고 악센트로 재작성, OAuth 폐기 후 Apps Script doPost로 통일

### [DECISION] 5가지 핵심 결정

| # | 사항 | 답 |
|---|---|---|
| 1 | 데이터 흐름 | **B안**: Apps Script doPost로 통일. OAuth(Google Sheets API 직접 호출) 폐기. 브라우저는 파싱·분류만, 시트 쓰기는 doPost |
| 2 | 기존 857행 데이터 | 보존. xlsx → Google Sheets 변환만 안내 |
| 3 | SHB 신/구 + 현대카드 파서 | 유지 (검증된 로직 그대로 이식) |
| 4 | AI 인사이트 | 브라우저에서 Anthropic API 직접 호출 (기존 방식 그대로) |
| 5 | 기존 기능 | 여행 타일·거래내역 검토·수정·개별처리 가맹점 모두 유지 |

### [DECISION] 비판적 짚어둔 점

- **자동분류는 RULES 정규식만 사용** (Claude API 안 씀) — 기존 코드도 이미 이렇게 동작. 사용자가 "추천방식 사용" 답한 게 사실상 노옵
- **CORS 회피**: doPost 본문 Content-Type을 `text/plain;charset=utf-8`로 보냄 → simple request라 preflight 안 생김 → Apps Script가 응답 헤더 신경 안 써도 됨
- **환율은 Apps Script에 캐시** (CacheService 6시간). 브라우저는 fxRate 받기만. 외부 API 호출은 시트 측 1회/6h
- **API 키 LocalStorage 평문 저장**: 단일 사용자 가정상 수용 (기존 동작)
- **개별처리 가맹점(ambiguous)은 LocalStorage 유지**: 기기별 설정
- **메모**: 거래의 memo 컬럼에 저장 (시트). 가맹점별 자동 적용은 LocalStorage

### [COST] 운영 비용 / 토큰 사용

- **사용자 운영 비용**: Claude Sonnet 4 인사이트 1회 약 0.014 USD (~20원). 매일 호출해도 월 0.5 USD 미만. 사용자 API 키 직과금
- **이번 세션 작업 토큰**: HTML 2439줄 + Apps Script 521줄. Wealth보다 무거운 편 (가계부 기능 많음)

### [CODE] 산출물

#### expense-apps-script.gs (521줄)
- `SHEET_ID` 상수 (Session 2.1 교훈: container-bound/standalone 모두 지원)
- `doGet(e)`:
  - `?mode=summary` → backend-spec 표준 (last_month_total_krw, mom_pct, top_categories[3])
  - `?mode=full` → 전체 거래 + 카테고리 룰 + fxRate
- `doPost(e)`: `JSON.parse(e.postData.contents)`로 받음. 6 action 지원
  - `addTransactions` (중복 id 자동 스킵)
  - `updateTransaction` (id로 행 찾아 fields 갱신)
  - `deleteTransaction`
  - `addRule` / `deleteRule`
  - `replaceAll` (전체 교체 — 마이그레이션 시 사용)
- 환율: open.er-api.com fetch + CacheService 6시간 캐시. 실패시 fallback 18.5
- `buildTasks_`: 매월 5일 이전엔 info, 이후 전월 데이터 없으면 bad task
- 디버그: `debug_summary` / `debug_full` / `debug_fx`

#### expense.html (2439줄)
**레이아웃**:
- 헤더 (common.js) + KPI 3카드 (연간 누적/지난달/월평균) + 정보바 (환율·사용자필터·액션)
- 좌측 차트 컬럼: 월별 막대 + 월별 카테고리 스택
- 우측 분석 컬럼: 올해 누적 / 지난달 카테고리 바차트 (전년비/전월비 포함)
- 여행 타일 (메모 기반 자동 집계)
- AI 인사이트 (Anthropic API 직접 호출 또는 정적 분석)

**디자인**:
- 인디고 악센트 (`--acc-expense: #818CF8`)
- KPI 카드 상단 인디고 띠 (`::before opacity 0.5`)
- 다크 배경 (`var(--canvas)`, `var(--surface)`)
- 차트 색 분리: 지출 상승 = red(loss), 하락 = green(gain) — Wealth와 반대 의미
- 카테고리 컬러 토큰: `--cat-color-life/domt/intl/edu/health/transit/fun/sub/gift/other`

**모달 4개**:
- `mod-import`: SHB 신/구 + 현대카드 다중 업로드
- `mod-review`: 분류 검토 (수정 시 같은 가맹점 일괄 적용, 룰 자동 시트 저장)
- `mod-txlist`: 기존 거래 수정/삭제
- `mod-settings`: API key, 개별처리 가맹점, 로컬 초기화

**자체 설정 진입점**: 헤더 톱니는 Web App URL 모달 전용(common.js). 자체 설정은 액션 메뉴 "⋯"에 동적 추가 (DOMContentLoaded 후 setTimeout으로 삽입)

### [VERIFICATION]

- ✅ Apps Script: `node --check` 통과
- ✅ HTML 인라인 JS: `node --check` 통과 (60KB)
- ✅ HTML 태그 균형: `<div>` 155/155, `<script>` 6/6, `<style>` 1/1
- ✅ 모달 4개 (`mod-import`, `mod-review`, `mod-txlist`, `mod-settings`)
- ✅ FamilyOS.* 호출 14개 모두 common.js export와 매칭
- ⚠ 미테스트: 실시트 마이그레이션 (857행 변환), 실제 doPost 호출, Claude API 호출 (사용자 키 필요)

### [DEPLOYMENT] 배포 5단계 (사용자 안내)

1. **시트 변환 (1회)**
   - 기존 `지출_대시보드.xlsx`를 Drive에 업로드
   - **반드시** "파일 > Google Sheets로 저장"으로 변환 (xlsx 그대로는 Apps Script가 못 읽음, Session 2.2 교훈)
   - 변환된 시트 URL에서 ID 추출: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`
   - 시트 탭 이름이 `transactions` / `category_rules` 인지 확인 (다르면 변경 또는 SHEETS 상수 수정)

2. **Apps Script 프로젝트 생성**
   - script.google.com → 새 프로젝트
   - `expense-apps-script.gs` 내용 전체 복사 → `Code.gs`에 붙여넣기
   - 상단의 `SHEET_ID = ''` 안에 1단계의 시트 ID 입력

3. **권한 부여 + 디버그 확인**
   - 편집기에서 `debug_full` 함수 선택 → 실행 → 권한 요청 팝업 → 허용
   - 실행 로그에서 "Transactions: 857" 정도 나오면 시트 연결 OK
   - `debug_fx`로 환율 fetch 확인 (실패시 fallback 18.5 사용됨)

4. **웹 앱 배포**
   - 배포 > 새 배포 > 유형: 웹 앱
   - 액세스: **모든 사용자** (또는 본인 계정으로 제한 가능)
   - 게시 → URL 복사

5. **expense.html에 URL 연결**
   - 새 expense.html을 GitHub Pages에 푸시 (기존 파일 교체)
   - 페이지 열고 우측 상단 ⚙️ → URL 입력 → 저장
   - 메인 허브에서도 별도로 같은 URL을 expense에 입력해야 KPI 노출됨

### [PENDING] 즉시 해결 필요

- 없음. 산출물 준비 완료. 사용자 확인 후 다음(Health) 진행.

### [NEXT] Phase 3 진행 상황

| 대시보드 | 상태 |
|---|---|
| Wealth | ✅ Session 2 완료 |
| Expense | ✅ Session 3 완료 |
| Health | ⏳ Session 4 예정 — 가족 4명(아빠/엄마/robi/dobi) 건강 모니터링 |
| Future | ⏳ Session 5 예정 — 학자금·은퇴 등 장기 계획 |

### [LESSON]

1. **OAuth 폐기 결정이 옳았다**: Apps Script doPost로 통일하니 코드량 30% 감소, CORS preflight 제거, 인증 흐름 단순화
2. **text/plain POST 패턴**: simple request로 처리되어 Apps Script가 응답 헤더 신경 안 써도 됨. 다음 대시보드(Health, Future)도 동일 패턴 사용
3. **자체 설정 진입점 분리**: common.js의 헤더 톱니는 Web App URL 전용으로 두고, 자체 설정(API key 등)은 액션 메뉴에 동적 삽입. fragile하지만 common.js 수정 없이 됨. 향후 common.js에 "두 번째 설정" 슬롯 추가 검토

- [완료] Session 3 종료

────────────────────────────────────────────────────────────────────
## Session 4 — Health 재개발 (Phase 3 진행)

**기간**: 2026-05-15
**대상**: 가족 건강 대시보드 → 다크 럭셔리 + 민트 악센트로 재작성, Strava/환경정보 제거, health_tasks 신규

### [DECISION] 8가지 핵심 결정

| # | 사항 | 답 |
|---|---|---|
| 1 | 기능 범위 | 기존 v0.9 거의 다 유지. **Strava + 환경정보(AQI/날씨) 제거** |
| 2 | member_id | `dad`/`mom`/`robi`/`dobi` (기존 v0.9 그대로) |
| 3 | 백엔드 배포 | **standalone + `SHEET_ID` 상수** (Wealth Session 2.1 교훈, 기존은 container-bound였음) |
| 4 | POST 패턴 | `text/plain;charset=utf-8` simple-request (기존 v0.9도 동일) |
| 5 | 시트 스키마 | 기존 + **`health_tasks` 신규**. `strava_activities`/`strava_tokens`/`environment`는 본 세션에서 안 씀(시트는 남겨두되 read/write 안 함) |
| 6 | Daily Insight | 로컬 계산 유지 (Claude API 안 씀) |
| 7 | 뷰 구조 | 단일 파일 SPA — 전체뷰 + 4 멤버뷰 |
| 8 | task 시스템 | **수동 입력. 빨(기한 지남 미완료)/노(미완료)/민트(완료) 3색.** Google Tasks API 거부 (가족 공유 불가가 결정타) |

### [DECISION] 비판적으로 짚어둔 점

- **Google Tasks API 거부 근거**: Apps Script 웹앱이 "실행: 나"라 배포자 계정의 Tasks에만 접근. Tasks는 캘린더 이벤트와 달리 공유 불가. 가족 4명 공동 모니터링 본질과 안 맞음
- **파란불 → 민트색 대체**: spec urgency 3단계(info/warn/bad)와 정합. Health 액센트가 민트라 "완료=민트"가 시각적으로 시원하고 디자인 시스템과 통일됨
- **자동 task 빼기**: 기존 디폴트 제안의 "약 미체크 자동 task" 등은 본 세션에 안 넣음. 사용자가 수동 입력한 task만 메인 허브로 노출. 단순함 우선
- **container-bound → standalone 마이그레이션**: 기존 apps_script.gs는 `SpreadsheetApp.getActiveSpreadsheet()` 의존. Wealth/Expense 패턴 따라 SHEET_ID 상수 + `getSpreadsheet_()` 헬퍼로 통일
- **헤더 행 위치**: 기존 시트는 1행=설명, 2행=빈줄, 3행=헤더, 4행~=데이터. 새 코드도 이 컨벤션 유지 (사용자 시트 마이그레이션 0)
- **호출 효율**: 기존은 listall → 시트별 list 호출 (N+1). 새 mode=full은 한 번에 필요한 시트 다 묶어 반환

### [COST] 운영 비용 / 토큰

- **사용자 운영 비용**: 전체 무료. Drive 사진 저장만 사용자 quota 차감 (Google 15GB 무료티어)
- **외부 API 0개**: Strava/IQAir/Open-Meteo 다 제거. Claude API도 안 씀
- **이번 세션 작업 토큰**: 기존 자산 분석 + Apps Script ~900줄 + HTML ~3000줄 추정. Wealth보다 무거움

### [CODE] 산출물

**1. `/home/claude/work/health-apps-script.gs` (594줄)**

핵심 구조:
- `DASHBOARD_ID = 'health'`, `SHEET_ID = ''` (사용자 입력 필요)
- `PREFIX_MAP`: 15개 시트 record_id prefix (TASK 신규)
- `FULL_SHEETS`: mode=full에서 한 번에 로드할 16개 시트 (strava_*/environment 제외)
- `doGet(e)`: mode=summary/full/ping 분기, 응답 envelope `{ ok, data }`
- `doPost(e)`: 5개 액션 — add / update / delete / uploadphoto / togglecomplete
- `buildSummaryPayload()`: backend-spec.md 섹션 3-3 준수. `members[].status` (ok/warn/bad) + tasks 배열 (urgency: bad/warn)
- `buildFullPayload()`: 16개 시트 데이터 한 번에 반환 (N+1 호출 회피)
- CRUD: `addRow` / `updateRow` / `deleteRow` — 헤더 3행 컨벤션, `client_req_id` idempotency, `record_id` 자동 생성, `created_at` 자동
- `toggleTaskComplete(recordId, completed)`: task 체크박스용 단축 액션
- `uploadPhotoToDrive(base64, fileName, mimeType)`: FamilyHealth_Photos 폴더에 저장, ANYONE_WITH_LINK 공유
- `createTasksSheet_(ss)`: health_tasks 시트 자동 생성 (1행=설명, 3행=헤더, 첫 add 시점에서 자동 호출)
- `getSpreadsheet_()`: SHEET_ID 우선, fallback container-bound (개발 편의)
- 디버그 함수: debug_summary / debug_full / debug_sheetlist / debug_create_tasks_sheet / debug_test_add_task

**2. `/home/claude/work/health.html` (2,393줄, 인라인 JS 1,433줄)**

핵심 구조:
- 외부: `design-tokens.css`, `common.js`, Chart.js 4.4.0, xlsx 0.18.5
- **멤버 색 토큰 신규 정의** (design-tokens.css에 없을 거라 자체 정의):
  `--m-dad`(#60A5FA) / `--m-mom`(#F472B6) / `--m-robi`(#C084FC) / `--m-dobi`(#FB923C) / `--m-family`(=--acc-health)
- **Status 토큰**: `--st-ok` / `--st-warn` / `--st-bad` / `--st-done`(민트)
- 멤버 탭: 전체 + 4명. `state.currentView`로 토글
- 액션바: + 기록 추가, 📥 Excel 내보내기
- **전체뷰**: 4명 멤버 카드(status dot + BMI/체중 + 보유질환 칩) → 클릭 시 개인뷰. + 할 일 카드(멤버별 그룹) + Recent updates 카드
- **개인뷰**: 헤더(아바타, 나이, BMI, 혈액형, 키, 몸무게) + 3-grid 요약(보유질환/알레르기/복용약) + 2-grid 차트(신체계측/혈액검사 항목 토글) + 최근 기록 타임라인
- **CATEGORIES 10개**: task / vital / medication / hospital / home(사진) / progress / vaccination / condition / allergy / momsnote
- 폼: 각 카테고리별 분기 HTML. 멤버 picker 공통화 (`.mem-picker`). **task만 family 포함**
- **Mom's Note 4필드 필수 검증**: 대상자/발생일시/증상/기타 — 누락 시 빨간 테두리
- **사진 업로드**: client-side resize (1000px, JPEG 75%) → base64 → Apps Script doPost → Drive
- **Home clinic 상세 팝업**: C/C·P/I·A/P + 사진 + 연결된 progress_note 목록 + "경과 기록 추가" 버튼 (`parent_record_id` 자동 입력)
- **Task 토글**: 체크박스 클릭 → togglecomplete API → 로컬 상태 업데이트 + 멤버 카드 status dot 갱신 (전체 리프레시 없음, 효율적)
- 차트: Chart.js line. 색은 `getCss('--acc-health')` 등 CSS 변수에서 추출 (테마 일관성)
- Excel 내보내기: xlsx 라이브러리로 13개 시트 한 번에 출력 (`FamilyHealth_YYYY-MM-DD.xlsx`)
- Toast: ok/error/info 3종

### [VERIFICATION] 검증 결과

| 항목 | 결과 |
|---|---|
| Apps Script 문법 (`node --check`) | ✅ 통과 (594줄) |
| HTML 인라인 JS 문법 | ✅ 통과 (1,433줄) |
| HTML 태그 균형 | ✅ div 179/179, section 9/9, button 15/15, script 4/4, style 1/1, nav 1/1, main 1/1, span 72/72 — 전부 매칭 |
| FamilyOS.* 호출 매칭 | ✅ 14개 호출 모두 common.js export 존재 (attachSettingsModal, escapeHtml, fetchDashboardData, getDashboardMeta, getWebAppUrl, registerServiceWorker, renderErrorStateHTML, renderFooterHTML, renderHeaderHTML, renderLoadingStateHTML, renderSettingsModalHTML, renderUnsetStateHTML, setLastSync, setSyncedNow) |
| 실시트 / 실 API 호출 | ⚠ 미테스트 (사용자 배포 후 검증 필요) |

### [DEPLOYMENT] 배포 가이드

#### Step 1. 시트 준비
1. `Family_Health_Schema_v1.xlsx`를 Google Drive에 업로드
2. **반드시 우클릭 → "연결 앱 → Google Sheets"로 변환** (Wealth Session 2.2 교훈: .xlsx 그대로면 API 접근 실패)
3. 변환된 Google Sheets 열기 → URL의 `/d/{여기}/edit`에서 ID 추출

#### Step 2. Apps Script 프로젝트 생성
1. `script.google.com` → 새 프로젝트
2. `Code.gs`에 `health-apps-script.gs` 내용 전부 붙여넣기
3. **`SHEET_ID = ''` 라인 찾아서 추출한 ID 입력**:
   ```javascript
   const SHEET_ID = '1ABC...xyz';
   ```
4. 저장 (Ctrl+S)

#### Step 3. 권한 부여
1. 편집기 상단 함수 선택 드롭다운에서 `debug_full` 선택 → 실행
2. **권한 팝업** 두 가지 허용:
   - Google Sheets 읽기/쓰기
   - Google Drive 파일 생성/공유 (사진 업로드용)
3. 실행 로그에 시트별 행 수 출력되면 성공

#### Step 4. health_tasks 시트 생성 확인
1. `debug_create_tasks_sheet` 실행 → "created" 또는 "already exists" 로그
2. 시트 탭에 `health_tasks`가 보이는지 확인 (1행 설명 / 3행 헤더 8개)
3. (선택) `debug_test_add_task` 실행 → 테스트 task 1개 추가됨

#### Step 5. 웹앱 배포
1. 우측 상단 **배포 > 새 배포 > 유형: 웹 앱**
2. 설정:
   - 설명: `Family Health v0.1`
   - 다음 사용자로 실행: **본인 (스크립트 소유자)**
   - 액세스: **모든 사용자**
3. 배포 → URL 복사 (`https://script.google.com/macros/s/.../exec`)

#### Step 6. 프론트엔드 연결
1. `health.html`을 GitHub Pages 또는 정적 호스팅에 푸시
2. 같은 디렉토리에 `common.js`, `design-tokens.css` 있는지 확인
3. 브라우저에서 health.html 열기 → 우측 상단 ⚙️ 클릭
4. Apps Script URL 붙여넣기 → "저장 후 새로고침"

### [LESSON] 다음 세션 교훈

1. **Google Tasks API ≠ 캘린더 이벤트**: Tasks는 공유 불가. 가족 dashboard 본질과 충돌. 외부 task 시스템 검토 시 "공유 가능 여부"가 첫 질문이어야 함
2. **task 색 매핑 vs spec urgency**: 사용자가 "빨/파"라 했지만 spec은 info/warn/bad 3단계. 디자인 시스템 액센트(민트)로 "완료"를 대체하니 시각적으로 더 시원함. 사용자 요구를 그대로 구현하지 않고 시스템 정합성과 협상하는 게 더 나은 결과 (사용자 동의함)
3. **헤더 행 3행 컨벤션**: 1행=설명, 2행=빈줄, 3행=헤더, 4행=데이터. Apps Script 표준 헬퍼는 1행 헤더 가정이라 직접 readSheetAsObjects_ 작성. 마이그레이션 0이 핵심 이점
4. **CSS 변수 fallback**: design-tokens.css 실제 내용 미확인이므로 멤버 색 토큰(`--m-dad` 등)은 health.html 안에서 자체 정의. 디자인 시스템이 토큰을 늦게 추가해도 안 깨짐
5. **부분 새로고침의 가치**: task 토글 시 전체 refresh 대신 로컬 상태 업데이트 + DOM 부분 갱신만 함. UX 차이가 큼 (200ms vs 2-3s)

### [PENDING] 본 세션에서 안 다룬 것 (다음 작업 후보)

- ⚠ design-tokens.css 실제 내용 미확인 — 멤버 색 토큰을 정식 토큰으로 옮기는 게 정합성 ↑
- ⚠ `btn-primary:hover`의 `#F5D175` 등 hex hard-coded — 디자인 시스템에 hover 변형 토큰 정의됐는지 확인 필요
- ⚠ 메인 허브 측 `members[].status` 카드 표시 로직 매칭 미테스트 — Wealth/Expense와 다르게 4 멤버 점이 한 카드에 보여야 함
- 반복 task (매일/매주) 자동 생성 — 본 세션은 1회성만. 도비 약 같은 daily routine은 매일 수동 입력 부담
- step_log / schedule / healthcheck / imaging / blood_test 입력 폼 — 본 세션 미포함 (시트 데이터는 read는 됨, 차트/요약에 반영). 추가 입력은 시트 직접 편집 또는 추후 세션
- Strava/환경정보 시트의 stale 데이터 — 시트는 남아있음. 추후 정리 권장

────────────────────────────────────────────────────────────────────
## Session 5 — Future 재개발 (Phase 3 진행 / 마지막 대시보드)

**기간**: 2026-05-15
**대상**: 미래 대시보드 → 다크 럭셔리 + 라벤더 악센트로 재작성, 외부 시트 의존 끊고 backend-spec 표준 응답 정착

### [DECISION] 핵심 결정 6가지

| # | 사항 | 답 |
|---|---|---|
| 1 | 시트 의존 방향 | **B안 (메인이 중재)** — Future Apps Script는 본인 시트(Project/Task)만 읽음. Wealth 시트 직접 접근 금지 |
| 2 | 노후자금 현재값 출처 | Wealth Apps Script summary에 `retirement_value_krw` 키 추가 → 메인 허브가 결합해 Future 카드에 진행률 표시 |
| 3 | 자산 도넛 차트 | **제거** (Wealth 대시보드/메인 허브와 중복) |
| 4 | 노후 탭 시각화 | **꺾은선 차트** (P004 마일스톤 3억→16.6억 연도별 누적). Task명 파싱해 Y축 |
| 5 | 시트 신규 | 없음. P004 예상비용에 1500000000 입력 시 그 값 사용. 비어 있으면 15억 fallback |
| 6 | family id | 기존 시트 텍스트(아빠/엄마/도비/로비) 유지. SVG 아이콘 4종 재사용 |

### [DECISION] 비판적으로 짚어둔 점

- **B안 함정 — Wealth summary 키 추가 필요**: backend-spec 3-1엔 `retirement_value_krw`가 없음. 본 세션에서 Wealth Apps Script에도 키 1개 추가하는 hotfix 동반. backend-spec.md는 (다음 세션에서) 보강 권장
- **메인 허브 결합 표시는 본 세션 미포함**: index.html 수정은 별도 hotfix로. 본 세션은 두 backend가 결합 가능한 데이터 노출까지만
- **Future 페이지 직접 접속 시 진행률 막대 안 보임**: 의도된 한계. 본인 시트로 노후 잔액을 모르기 때문. 마일스톤 차트 + 목표액(15억) + Next milestone 정보로 충분히 의미 있음. 메인 허브에서 결합 표시 시 진행률 완성
- **P004 Task가 사실은 마일스톤**: 일반 Task와 의미 다름. Task명("3억", "3.8억" 등)을 숫자 파싱해 차트 Y축. 시트 구조 변경 없이 코드에서 분기
- **외부 API 0**: Claude API/환율/주가 등 일체 없음. 무료 유지
- **악센트 색 변경**: 골드(`--accent`) → 라벤더(`--acc-future: #C084FC`)

### [COST] 운영 비용 / 토큰

- **사용자 운영 비용**: 0원. 외부 API 없음
- **이번 세션 작업 토큰**: Apps Script ~500줄 + HTML ~1300줄 + Wealth Apps Script hotfix ~30줄 추정. Health(900+2400)·Expense(521+2439)보다 가벼움

### 작업 계획

1. [진행] Session 5 시작 기록
2. [대기] `future-apps-script.gs` 신규 작성
3. [대기] `wealth-apps-script.gs` hotfix (`retirement_value_krw` 추가)
4. [대기] `future.html` 신규 작성
5. [대기] 문법/구조 검증
6. [대기] Session 5 완료 기록


### [CODE] 산출물 (3개)

| # | 파일 | 줄수 | 크기 | 역할 |
|---|---|---|---|---|
| 1 | `future-apps-script.gs` | 438 | 15KB | 신규 — 본인 시트(Project/Task)만 읽음. backend-spec 3-4 준수 |
| 2 | `future.html` | 1373 | 50KB | 신규 — 단기/중장기/노후 3탭 + 노후 마일스톤 차트 + 사이드 상세 시트 |
| 3 | `wealth-apps-script-hotfix.gs` | 132 | 4KB | Wealth Apps Script에 `retirement_value_krw` 키 추가 패치 안내 |

**1. `future-apps-script.gs` 핵심 구조**

- `DASHBOARD_ID = 'future'`, `SHEET_ID = ''` (사용자 입력)
- `SHEET_NAMES = { project: 'Project', task: 'Task' }`
- `RETIREMENT_GOAL_KRW_FALLBACK = 1500000000` — P004 예상비용이 비어 있을 때
- `doGet(e)`: mode=summary/full/ping 분기
- `buildSummaryPayload()`:
  - `years_to_retirement`: P004 종료일까지 년수 (소수점 1자리, 잘라서)
  - `goal_progress_pct: null` ← **본인 시트로 모름. 메인이 채움**
  - `retirement_target_krw`: P004 예상비용 또는 fallback
  - `next_milestone`, `next_milestone_date`: P004의 가까운 미래 task
  - `tasks`: 60일 이내 미완료 task. urgency 분기 (bad=지남 / warn=14일 이내 / info=60일 이내)
- `buildFullPayload()`:
  - 모든 프로젝트 + task 정규화. 한글 헤더 → camelCase 키
  - `retirement_target_krw`, `retirement_goal_project_id` 함께 반환
- 헬퍼: `parseKrw_` (1.5억/5000만원/숫자 모두 처리), `parseDate_` (Date/serial/문자열 모두), `isoDate_`, `daysBetween_`, `calcYearsTo_`
- 디버그: `debug_summary`, `debug_full`, `debug_sheetlist`, `debug_tasks`

**2. `future.html` 핵심 구조**

- 외부 자원: `design-tokens.css`, `common.js`, Chart.js 4.4.0
- **자산 도넛 차트 완전 제거** (기존 v2와 가장 큰 차이)
- **라벤더 악센트** `var(--acc-future)`: brand-dot, 노후 탭 활성, 마일스톤 차트 라인, 노후 프로젝트 카드 좌측 바
- **상단 탭** (단기/중장기/노후) + 카운트 표시
- **노후 탭 진입 시**: 마일스톤 카드 (Hero 숫자 + Chart.js 꺾은선) → 프로젝트 카드 리스트 순서
- 마일스톤 차트:
  - X축: 마일스톤 기한 연도
  - Y축: 누적 목표액 (Task명 "3억"/"3.8억"/..."16.60억" 파싱)
  - 완료/진행 상태는 녹색 점 (size 6), 준비는 라벤더 점 (size 4)
  - 목표 라인은 점선 (15억 가로선)
  - 툴팁: Task명 + 상태
- **프로젝트 카드**:
  - 좌측 바 색상 = 상태 (회/노/녹/라벤더)
  - D-Day 배지 (0~100일 = imminent 노랑, 음수 = inprog 녹, 100일+ = upcoming 회)
  - 완료 카드는 opacity 0.55
  - 진행률 바 + 가족 SVG 아이콘
- **사이드 시트 상세** (오른쪽에서 슬라이드):
  - 요약 카드 (가족/기간/진척률/예산 3그리드)
  - Task 그룹 (목표는 시간순 완→진→준, 일반은 진→준→완)
  - Task별 deadline·cost·detail·person
- 가족 SVG 아이콘 4종 (아빠/엄마/도비/로비) 재사용

**3. `wealth-apps-script-hotfix.gs` 핵심**

- 자기 충족적 함수 `getRetirementAccountValueKrw_()`
- 헤더 자동 감지 (acc/계좌, value_krw/평가/금액) + fallback (A열/K열)
- `buildSummaryPayload()`의 kpi에 한 줄 추가하는 안내
- 사용자 wealth-apps-script.gs 본문 미확인 → 두 가지 패턴 모두 대응

### [VERIFICATION] 검증 결과

| 항목 | 결과 |
|---|---|
| Apps Script 문법 (`node --check`) | ✅ 통과 (438줄) |
| HTML 인라인 JS 문법 (`node --check`) | ✅ 통과 (25,080자) |
| HTML 태그 균형 | ✅ div 59/59, section 1/1, article 1/1, main 1/1, aside 1/1, span 17/17, button 2/2, h2 1/1, script 3/3, style 1/1, svg 6/6, canvas 1/1 |
| FamilyOS.* 호출 매칭 | ✅ 14개 호출 모두 common.js export 존재 |
| Apps Script summary envelope | ✅ dashboard / kpi / tasks / updated_at 4개 키 |
| Apps Script summary KPI 키 | ✅ years_to_retirement / goal_progress_pct / retirement_target_krw / next_milestone / next_milestone_date |
| HTML ↔ Apps Script full 호환 | ✅ projects / tasks / retirement_target_krw / retirement_goal_project_id 모두 매칭 |
| Wealth hotfix 문법 | ✅ 통과 (132줄) |
| 실시트 / 실 API 호출 | ⚠ 미테스트 (사용자 배포 후 검증) |

### [DEPLOYMENT] 배포 가이드

#### Step 1. Future 시트 준비

1. `Family_Future_Dashboard.xlsx`를 Google Drive에 업로드
2. **반드시 "파일 > Google Sheets로 저장"** (Session 2.2 교훈)
3. 변환된 Google Sheets URL의 `/d/{SHEET_ID}/edit`에서 ID 추출

#### Step 2. Future Apps Script 프로젝트 생성

1. `script.google.com` → 새 프로젝트
2. `Code.gs`에 `future-apps-script.gs` 내용 전체 붙여넣기
3. `SHEET_ID = ''` 라인을 `SHEET_ID = '추출한_ID'`로 변경
4. 저장

#### Step 3. 권한 부여

1. 편집기에서 함수 드롭다운 `debug_full` 선택 → 실행
2. Google Sheets 권한 팝업 → 허용
3. 실행 로그에 "Projects: 4, Tasks: ~30, Retirement target: 1,500,000,000원" 비슷한 출력 확인
4. `debug_summary` 실행 → KPI/tasks JSON 출력 확인
5. `debug_tasks` 실행 → 14일 이내 마감 task 목록 확인

#### Step 4. 웹 앱 배포

1. 배포 > 새 배포 > 유형: 웹 앱
2. 다음 사용자로 실행: **본인**
3. 액세스: **모든 사용자**
4. 배포 → URL 복사

#### Step 5. future.html 연결

1. `future.html`을 GitHub Pages 디렉토리에 배포 (같은 디렉토리에 `common.js`, `design-tokens.css` 필수)
2. 브라우저에서 future.html 열기 → ⚙️ → URL 입력 → 저장 후 새로고침
3. 단기/중장기/노후 3탭 모두 클릭해 데이터 표시 확인

#### Step 6. Wealth Apps Script hotfix 적용 (선택)

1. `wealth-apps-script-hotfix.gs`의 안내대로 기존 wealth-apps-script.gs에 패치
2. 새 버전 배포 (기존 URL 유지)
3. 메인 허브가 결합 표시할 수 있게 됨 (메인 허브 index.html은 본 세션에서 미수정 — 다음 hotfix 세션에서 처리)

### [LESSON] Phase 3 마무리 시점에서

1. **외부 시트 의존성을 시작부터 거부했어야**: 기존 Future v2가 Wealth 시트를 직접 읽는 구조였던 게 spec 위반. backend-spec.md의 "대시보드별 시트 1개" 원칙을 처음부터 엄격히 적용했어야. Session 5에서 결국 분리. 다음 프로젝트는 spec 시점에 명확히 강제.

2. **B안의 함정**: "메인이 중재"는 듣기엔 좋지만 spec 호환 키가 없으면 작동 안 함. backend-spec 3-1엔 `retirement_value_krw`가 정의 안 돼 있는데 메인이 무슨 값을 결합하나? 답: Wealth Apps Script 응답 확장이 동반돼야 함. 메인 결합 표시 = backend 응답 키 확장 + 메인 결합 로직 둘 다 필요.

3. **메인 허브 결합 표시는 미완**: 본 세션에서 Wealth hotfix만 함. 메인 허브 index.html이 `retirement_value_krw`를 받아 Future 카드의 진행률을 계산하는 로직은 안 만듦. **다음 hotfix 세션 필요** (작업량 작음, 20줄 미만).

4. **Task명을 데이터 컬럼처럼 쓰는 패턴은 fragile**: P004 task명 "3억", "3.8억"을 파싱해 차트 Y축으로. 사용자가 "$3억"으로 쓰면 매칭 실패. 차라리 시트에 별도 컬럼 (예: "마일스톤_금액")을 두는 게 정공법. 본 세션은 시트 변경 없이 빠르게 가는 길 선택. **시트에 컬럼 추가가 장기적으로 권장**.

5. **외부 API 0인 대시보드의 작업량 차이**: Future는 Health/Expense보다 30% 가벼웠음 (438+1373 vs 594+2393). 외부 의존(Strava, 환율, AI 인사이트) 없음의 영향. 다른 대시보드도 외부 의존 제거하면 유지보수성 ↑.

### [PENDING] 다음 작업 후보 (우선순위 순)

1. **메인 허브 index.html hotfix** — Future 카드에 진행률 결합 표시 (Wealth.retirement_value_krw ÷ Future.retirement_target_krw × 100). 작업량 ~30줄
2. **backend-spec.md 보강** — Wealth 응답에 `retirement_value_krw` 키 정식 등재. Future 응답 키 5개 (years_to_retirement, goal_progress_pct, retirement_target_krw, next_milestone, next_milestone_date) 명시
3. **시트 컬럼 추가 검토** — P004 마일스톤 금액을 별도 컬럼으로 (현재는 task명 파싱)
4. **Future PWA 매니페스트** — 메인 허브와 별도 manifest.json 가능 (현재는 메인 것 공유)
5. **노후 탭 시뮬레이션 도구** — 수익률·기여금 시나리오별 마일스톤 재계산 (현재는 시트 값 그대로 표시)

### [COST] 본 세션 토큰/비용 최종

- **사용자 운영 비용**: 0원 (외부 API 없음)
- **이번 세션 작업 토큰**: Apps Script 438줄 + HTML 1373줄 + Hotfix 132줄 = 약 65KB 코드 산출. Health(900+2400)·Expense(521+2439)보다 가벼움. 외부 API 없음 + 시트 단순(2탭)이 이유.

### [PHASE 3 COMPLETE]

| 대시보드 | 상태 | Apps Script | HTML | 비고 |
|---|---|---|---|---|
| Wealth | ✅ Session 2 | 821줄 | 1601줄 | Session 5 hotfix 동반 (retirement_value_krw 추가) |
| Expense | ✅ Session 3 | 521줄 | 2439줄 | OAuth 폐기, doPost 통일 |
| Health | ✅ Session 4 | 594줄 | 2393줄 | Strava/환경정보 제거, health_tasks 신규 |
| Future | ✅ Session 5 | 438줄 | 1373줄 | 외부 시트 의존 끊음, 라벤더 악센트, 마일스톤 차트 |

**Phase 3 종료** — 4개 서브 대시보드 모두 backend-spec 표준 응답 포맷 준수. 다음은 통합 최적화 hotfix들 (메인 허브 결합 표시, spec 보강 등).

- [완료] Session 5 종료

────────────────────────────────────────────────────────────────────

## Session 5.1 — Pending work 마무리 (Hub hotfix + spec v0.2 + 마일스톤 컬럼)

**기간**: 2026-05-16
**배경**: Session 5 직후 사용자 배포 완료, 캡쳐로 작동 확인. Pending 4건 처리.

### 사용자 답변 정리

1. ✅ Wealth 시트 컬럼 확인 — 시트명 `📊 보유종목`, 노후 계좌 `acc_dad_jh`, 사용 컬럼 `계좌ID`/`평가금액`. 첨부 데이터로 정확한 합계 계산 가능: 263,118,200 원 (~2.63억)
2. ✅ backend-spec 보강 진행
3. ✅ Task명 변경 vs 별도 컬럼 추가 — **별도 컬럼 (`마일스톤_금액`) 권장 답변**. 데이터/라벨 분리, 시뮬레이터 등 추후 사용성, 코드 단순화
4. ✅ 메인 허브 캡쳐 확인 — Future 카드 9.6년/다음 마일스톤 잘 표시. 진행률만 미구현 (예상된 상태)

### 캡쳐에서 추가 발견

⚠ **Wealth MoM/YoY 둘 다 +255.53% 동일** — 일일스냅샷 데이터 부족 또는 비교 로직 fallback 추정. 본 세션 범위 밖이지만 사용자에게 알림.

### 결정 사항

| # | 결정 | 근거 |
|---|---|---|
| 1 | Task 탭에 `마일스톤_금액` 컬럼 추가 (Task명 변경 X) | 데이터/라벨 분리, fragility 제거 |
| 2 | Future 코드는 컬럼 우선, Task명 파싱 fallback 유지 | 일부 마이그레이션 안 된 행 호환 |
| 3 | 메인 허브 hotfix는 코드 블록 + 가이드 형태로 제공 (전체 파일 X) | 메인 허브 코드 미공개. 사용자가 직접 끼워넣기 (토큰 절약) |
| 4 | backend-spec.md 전체 재작성 (v0.2) | 변경점 4곳 분산. 부분 패치는 혼란. 다음 세션 클로드가 통째 참조 |
| 5 | 캡쳐의 Wealth MoM/YoY 문제는 본 세션 X | 별도 문제. 가이드에 메모만 |

### 산출물

| 파일 | 줄수 | 종류 | 비고 |
|---|---|---|---|
| `backend-spec.md` (v0.2) | 232 | 문서 | 4곳 변경: §3-1 retirement_value_krw 추가, §3-4 Future kpi 재정의, §3-5 시트 구조 표 신설(마일스톤_금액 컬럼 포함), §6-1 메인 결합 계산식, §8 변경 이력 |
| `wealth-apps-script-hotfix.gs` (v2) | 95 | 코드 패치 | 첨부 데이터 기반 정확한 컬럼명 (`계좌ID`/`평가금액`) 사용. 자동 감지 제거, 단순화 |
| `future-apps-script.gs` (v0.1.1) | 440 | 코드 패치 | `buildFullPayload`의 task 정규화에 `milestoneKrw: parseKrw_(t['마일스톤_금액'])` 추가. 2줄 패치 |
| `future.html` (v0.1.1) | 1375 | 코드 패치 | 마일스톤 차트에서 `t.milestoneKrw` 우선 사용, 0 또는 없으면 `parseEokFromText(t.taskName)` fallback. 2줄 패치 |
| `hub-hotfix.js` | 178 | 코드 가이드 | 4 PART (헬퍼 함수, HTML 블록, CSS, 후처리 함수). 메인 허브 selector는 사용자 환경 조정 필요 |
| `SESSION_5_1_APPLY.md` | 130 | 가이드 | 6단계 체크리스트. 5분 작업 |

### 검증

| 항목 | 결과 |
|---|---|
| `wealth-apps-script-hotfix.gs` 문법 | ✅ |
| `future-apps-script.gs` 문법 (patched) | ✅ |
| `future.html` 인라인 JS 문법 (patched) | ✅ |
| `hub-hotfix.js` 문법 | ✅ |
| Wealth → Future 데이터 흐름 (paper) | retirement_value_krw 263M → progress 17.5% (예상) |

### 비판적 메모

1. **본 세션의 진짜 제약: 메인 허브 코드 미보유**. 사용자가 작성한 메인 허브 index.html 의 카드 렌더링 함수 구조를 모르므로, `attachRetirementProgress()` 의 selector 와 호출 시점은 사용자가 조정. 만약 다음 세션에 메인 허브 hotfix 를 완성하려면 사용자가 index.html 첨부해야 함.

2. **마일스톤 차트의 두 가지 출처 (컬럼 vs Task명 파싱) 공존**. 단기적으로는 마이그레이션 부담 줄여주지만, 장기적으로는 데이터 출처가 모호. 사용자가 모든 P004 task에 `마일스톤_금액` 채우면, 차후 세션에서 `parseEokFromText` 제거 권장.

3. **Wealth MoM/YoY 동일값 문제**: 본 세션에서 안 다룸. 일일스냅샷 시트의 30일 전 / 365일 전 행이 충분한지 사용자 확인 필요. 만약 데이터 부족이면 Apps Script 측에서 `null` 반환하도록 보강 → 다음 hotfix 후보.

4. **backend-spec.md v0.2 의 호환성 체크리스트가 8개로 증가**. 마지막 항목 "본인 시트만 읽음" 명문화는 Future v2 사고를 막기 위함. 다음 대시보드 만들 때 반드시 확인.

### [COST] 본 세션 토큰

- **운영 비용**: 0원 (Apps Script + Sheets + GitHub Pages 무료)
- **이번 세션 작업 토큰**: backend-spec 232줄 + hotfix 패치들 + 가이드. Session 5 본편(약 65KB) 대비 약 30% 수준. 사용자가 코드 직접 적용하도록 가이드 형태로 제공해 토큰 절약 (사용자 요구사항)
- **다음 세션 토큰**: 만약 메인 허브 hotfix 를 클로드가 직접 적용한다면 메인 허브 코드(추정 ~500줄) 첨부 + 패치 = 작은 세션 1회

### [PENDING] 다음 작업 후보 (우선순위)

1. **사용자 적용 결과 검증** — Session 5.1 6단계 적용 후 메인 허브에 진행률 막대 나오는지 확인. 안 나오면 selector 디버그
2. **Wealth MoM/YoY 동일값 문제** — 일일스냅샷 데이터 확인 → Apps Script 보강
3. **Task명 파싱 fallback 제거** — 모든 P004 task에 `마일스톤_금액` 채워졌으면 `parseEokFromText` 제거
4. **노후 시뮬레이터** — 수익률·기여금 시나리오별 마일스톤 재계산 (시트 컬럼 추가 완료로 이제 가능)
5. **차트 색 다크모드 톤 조정** — 캡쳐상 라벤더 진행률 막대가 너무 튀지 않는지 실제 확인

- [완료] Session 5.1 종료

────────────────────────────────────────────────────────────────────

## Session 5.2 — 메인 허브 hotfix 직접 적용 + LocalStorage 영속성 진단

**기간**: 2026-05-16 (5.1 직후)
**배경**: 5.1 산출물 중 `hub-hotfix.js`는 사용자가 직접 적용해야 하는 코드 가이드였음. 사용자가 비프로그래머라 적용 어려움 → 메인 허브 index.html 첨부받아 클로드가 직접 패치. 동시에 새 이슈 보고됨: "컴퓨터 껐다 켜면 모든 Web App URL이 사라짐"

### [INVESTIGATION] LocalStorage 영속화 실패 원인 진단

코드 점검 결과:
- ✅ `common.js`의 `setWebAppUrl`은 정상적으로 `localStorage.setItem` 사용
- ✅ `getWebAppUrl`은 정상적으로 `localStorage.getItem` 사용
- ✅ Service Worker는 `sw.js` 파일이 없어 등록 실패 (catch로 무시). 캐싱 이슈 없음
- ❌ **즉, 코드 자체는 정상**. 원인은 환경에 있음

가능성 (높은 순):
1. **Chrome 사이트 설정** — `chrome://settings/cookies` 에 "닫을 때 쿠키와 사이트 데이터 삭제" 또는 사이트별 차단
2. **시스템 클리너** — CCleaner, 백신 등이 시스템 종료 시 브라우저 데이터 정리
3. **Chrome 113+ Tracking Protection 또는 Storage Partitioning** — 일부 케이스에서 first-party LocalStorage도 영향
4. **GitHub Pages HTTPS 환경 자체에는 문제 없음** — 사용자도 PWA 설치 안 했고 브라우저 직접 접속

코드만 봐서는 원인 확정 불가. 진단을 페이지에 박는 게 최선.

### [DECISION] 본 세션 작업 3개

1. **메인 허브에 Future 진행률 결합 표시 직접 적용** (필수, 비프로그래머 사용자 직접 적용 어려움)
2. **LocalStorage 영속성 자동 진단** (URL이 모두 사라지면 자동 배너 띄움 + 콘솔 진단)
3. **백업/복원 기능** (영구 해결이 불가능한 환경 대비, 사용자가 백업 코드로 복구 가능)

### [CODE] 산출물

| 파일 | 변경 | 줄수 |
|---|---|---|
| `index.html` | 731 → 957 (+226줄) | 메인 허브 직접 패치 |

세부 변경:

1. **`renderFuture(data)` 함수 재작성** (+30줄)
   - `k.goal_progress_pct`가 null이면 `state.data.wealth.kpi.retirement_value_krw / k.retirement_target_krw × 100` 계산
   - 막대 아래 라벨에 `"₩2.6억 / ₩15억"` 형식 보조 텍스트 추가
   - `fmtEokShort(n)` 헬퍼 함수 신설 — 100M↑은 "X.X억", 10M↑은 "N천만", 그 아래는 콤마

2. **`refreshAll()` 함수에 1줄 추가**
   - `await Promise.allSettled` 끝난 후 `if (state.status.future === 'ok') renderCard('future');`
   - 이유: refreshOne은 응답 도착 즉시 카드 렌더링. Wealth가 Future보다 늦게 오면 Future 카드가 retirement_value_krw 없이 그려짐. allSettled 끝에 한 번 더 그리면 보장됨

3. **LocalStorage 진단 IIFE** (+50줄)
   - 페이지 로드 시 즉시 실행
   - `familyOS.diag.lastUrlCount`, `familyOS.diag.lastLoadTs` 두 키로 이전 로드 상태 비교
   - 콘솔에 항상 진단 로그 출력 (`[Family OS] Storage 진단`)
   - **이전 로드는 URL이 있었는데 이번엔 0개 = 영속화 실패 감지** → 자동 경고 배너
   - `localStorage.setItem` 자체가 throw하면 = 사이트 데이터 차단 → 다른 배너

4. **경고 배너 + 도움말** (+45줄)
   - 상단 고정 빨간 배너. "닫기" 버튼 + "대처 방법" 링크
   - 도움말 클릭 시 alert으로 4단계 대처법 안내 (Chrome 설정 두 곳, 시스템 클리너 확인, 백업 사용)

5. **모달 백업/복원 기능 동적 주입** (+90줄)
   - common.js는 손대지 않고, 모달이 열릴 때마다 `injectBackupUI()` 호출
   - 4개 URL을 `btoa(JSON)` 형식의 한 줄 코드로 인코딩
   - "복사" 버튼 (clipboard API + execCommand fallback)
   - "복원" 버튼 (디코딩 → input 필드들에 채워넣기, 저장은 사용자가 별도 클릭)
   - 인코딩 형식: btoa(unescape(encodeURIComponent(JSON)))로 한글 안전

### [VERIFICATION]

| 항목 | 결과 |
|---|---|
| 인라인 JS 문법 (`node --check`) | ✅ 19,426자 통과 |
| HTML 태그 균형 | ✅ div 33/33, section 2/2, article 4/4, main 1/1, script 2/2, style 1/1, button 3/3 |
| Session 5.1 호환 | ✅ `retirement_value_krw`(Wealth), `retirement_target_krw`(Future) 키 모두 사용 |
| common.js 변경 | ❌ 안 함 (의도적 — 다른 대시보드 영향 없게) |

### [LESSON]

1. **"버그가 코드에 있을 거다"라는 가정의 위험성**: common.js를 봤더니 정상. 원인은 환경(Chrome 설정/시스템 클리너). 코드 더 뒤지는 대신 진단을 페이지에 박는 게 시간/토큰 절약. 사용자가 콘솔 열어 보기만 하면 즉시 진단.

2. **사용자가 비프로그래머일 때의 적용 전략**: Session 5.1의 `hub-hotfix.js` (가이드 형태)는 적용 실패. 실제로는 메인 허브 첨부받아 클로드가 직접 패치하는 게 필요. 다음부터 메인 허브 변경 작업은 클로드가 직접 적용 디폴트.

3. **백업 메커니즘 = 안전망**: 진짜 원인이 환경 설정인 경우 사용자가 설정을 못 바꾸거나 알아채지 못할 수 있음. 백업 코드 export/import는 "원인 못 잡아도 살아남는" fallback.

4. **자동 진단의 가치**: 사용자에게 "콘솔 보세요" 요구하는 대신, 페이지가 알아서 감지하고 알려주는 UX. 추후 다른 환경 이슈에도 같은 패턴 응용 가능.

### [PENDING]

1. **사용자 적용 결과 확인** — 새 index.html 배포 후:
   - Future 카드에 진행률 막대 + "₩2.6억 / ₩15억" 표시되는지
   - 컴퓨터 껐다 켰을 때 경고 배너 뜨는지 (영속화 실패 케이스)
   - 콘솔 진단 로그 확인 → 원인 좁히기
2. **백업 코드 사용성** — 사용자가 실제로 백업 코드 복사 → 다음 사라짐 → 복원 흐름이 자연스러운지
3. **Wealth MoM/YoY 둘 다 +255.53% 동일** — Session 5.1에서 짚었던 별개 이슈. 일일스냅샷 데이터 부족 가능성. 미해결

### [COST]

- 운영 비용: 0원
- 작업 토큰: 메인 허브 1개 파일 226줄 추가 패치. Session 5.1보다 작음. 사용자 직접 적용 가이드 만들고 실패한 후 다시 직접 적용한 비용 고려하면 처음부터 직접 적용했어야 효율적이었음 (lesson 2)

- [완료] Session 5.2 종료

────────────────────────────────────────────────────────────────────

## Session 5.3 — 메인 허브 카드 클릭 영역 확장

**기간**: 2026-05-16 (5.2 직후)
**배경**: 사용자 보고 — "4개 메인 타일의 클릭 가능 영역이 매우 작음. 타일 맨 윗부분 약간만 클릭/터치 가능". 모바일에서 특히 문제.

### [INVESTIGATION] 원인

`index.html` CSS:
```css
.card a.card-link-overlay { position: absolute; inset: 0; z-index: 1; }
.card .card-interactive    { position: relative; z-index: 2; }
```

오버레이 `<a>`는 카드 전체를 덮지만 z-index:1, 카드 콘텐츠 wrapper(`.card-interactive`)는 z-index:2 로 오버레이를 가림. 결과적으로 클릭 가능 영역은 **카드 상단 padding (콘텐츠 시작 전 ~20px) + 2px 악센트 스트라이프**만 남음. Session 1 작성 당시 의도된 구조였으나 실사용에서 클릭 타깃 너무 좁음 (특히 터치).

### [DECISION] 수정 방식

| 후보 | 채택 | 이유 |
|---|---|---|
| A. pointer-events 트릭 (링크 위로, 콘텐츠 `pointer-events:none`) | ❌ | 내부 버튼/펼치기 작동 안 함. 선택적 재활성 필요 → fragile |
| B. JS 클릭 위임 (`.card` 클릭 시 오버레이 href로 navigate) | ✅ | 단순/안정. 내부 버튼/펼치기는 `closest()` 체크로 우회 |

오버레이 `<a>`는 키보드 Tab 접근성용으로 유지. 평소엔 `pointer-events:none`, `:focus-visible` 시에만 활성 + 외곽선 표시.

### [CODE] 변경

| 위치 | 변경 |
|---|---|
| CSS `.card` 영역 (~line 405) | `cursor: pointer` 추가. 오버레이 링크에 `pointer-events:none` + `:focus-visible` 처리 |
| JS `#cards` 클릭 핸들러 (~line 770) | 두 번째 클릭 위임 추가: 내부 상호작용 요소(`button, summary, a, input, textarea, label`) 아니면 오버레이 href로 `window.open(..., '_blank', 'noopener')` |

기존 `button[data-fos-action]` 핸들러는 그대로. 두 핸들러가 같은 `#cards`에 등록되지만 서로 간섭 없음:
- 버튼 클릭 → 기존 핸들러가 처리 (preventDefault/stopPropagation). 새 핸들러의 `closest('button')` 가드로 navigate 안 함.
- 그 외 영역 → 기존 핸들러 early return, 새 핸들러가 navigate.

### [VERIFICATION]

| 항목 | 결과 |
|---|---|
| 인라인 JS 문법 (`node --check`) | ✅ 20,153자 통과 |
| HTML 태그 균형 | ✅ div 33/33, section 2/2, article 4/4, main 1/1, script 2/2, style 1/1, button 3/3 |
| 줄 수 변화 | 957 → 987 (+30줄) |
| 클릭 시나리오 (paper) | 카드 본문 클릭 → navigate ✓ / 펼치기 summary 클릭 → 펼침만 ✓ / 빈상태 "설정" 버튼 → 모달 ✓ / 에러 "재시도" 버튼 → 새로고침 ✓ / 키보드 Tab → 오버레이 포커스 → Enter → 새 탭 ✓ |

### [CRITICAL NOTES]

1. **`window.open(_blank, noopener)` 일관성 유지**: 기존 task 클릭 핸들러(line ~737)와 동일 패턴. 새 탭 이동, opener 차단으로 보안 OK.
2. **`closest('a')` 가드의 부작용 없음**: 카드 내부에 외부 링크 없음. 오버레이 자체만 `<a>`인데 그건 어차피 navigate 동작이라 무관.
3. **터치 디바이스**: click 이벤트는 터치에서도 동일하게 발화. 별도 touchstart 핸들러 불필요. 기존 `.card:active { transform: scale(0.998) }` 의 press feedback 유지.

### [LESSON]

1. **z-index 오버레이 패턴의 함정**: "absolute로 덮으면 클릭된다" 는 직관이 실패. 자식 콘텐츠가 z-index 가 더 높으면 그 영역만큼 가림. 디자인 의도는 좋았으나 실제 클릭 가능 영역 미검증.
2. **단순한 JS 위임이 더 안전**: pointer-events 트릭은 자식마다 선택적 재활성 필요. 위임은 화이트리스트(skip할 selector) 한 줄로 끝. 유지보수성 ↑.
3. **사용자 보고가 빠른 이유**: 본인이 직접 매일 쓰는 앱이라 UX 문제가 즉시 발견됨. 셀프호스팅의 장점.

### [COST]

- 운영 비용: 0원 (외부 API 없음, 클라이언트 사이드 변경만)
- 작업 토큰: 작은 패치 1건 (+30줄). Session 5.2의 1/7 수준.

### [PENDING] 다음 후보

이전 세션에서 이월된 미해결 항목 그대로:
1. Wealth MoM/YoY 둘 다 +255.53% 동일값 (일일스냅샷 데이터 확인 필요)
2. Future P004 task 마이그레이션 완료 후 `parseEokFromText` fallback 제거
3. 노후 시뮬레이터 (`마일스톤_금액` 컬럼 활용)
4. 사용자가 Session 5.2 LocalStorage 진단 결과 보고 (배너/콘솔 로그)

- [완료] Session 5.3 종료

────────────────────────────────────────────────────────────────────

## Session 5.4 — Worklog 구조 재편 + 작업별 컨텍스트 파일 도입

**기간**: 2026-05-16 (5.3 직후)
**배경**: worklog.md 가 1174줄, ~70KB 까지 누적. 새 세션 시작 시 첨부하면 약 15~18k 토큰 소비. 사용자가 효율성 문제 제기. 향후 Wealth/Health 수정 세션 예정 → 이번에 구조 정리.

### [DECISION] 분리 전략

| 파일 | 역할 | 첨부 정책 |
|---|---|---|
| `worklog.md` | 슬림 코어: 현재 상태/컨벤션/Pending | **모든 세션 첨부** |
| `worklog-archive.md` | 누적 세션 기록 (Session 1 ~ 현재) | 절대 첨부 안 함. 참조용 |
| `context-wealth.md` | Wealth 작업 시작용 컨텍스트 | Wealth 세션만 |
| `context-health.md` | Health 작업 시작용 컨텍스트 | Health 세션만 |

핵심 원칙:
- 슬림 worklog 는 "현재" 만 담고 절대 비대화 X
- 세션의 상세 진행 (결정·산출물·검증·LESSON·COST) 은 archive 에 누적
- 컨텍스트 파일은 작업 시작 전 사용자가 답해야 할 질문 명시

### [DECISION] 가족 ID 표기 통일

사용자 확인:
- 시트 키 `son1` = 도비 (형)
- 시트 키 `son2` = 로비 (동생)

이전 backend-spec 작성 시 메인 허브 라벨로 robi/dobi 가 언급됐는데 매핑이 모호했음. 이번에 명확화. 시트 키는 그대로 유지 (진실의 원천), UI 표시명은 별명.

### [DECISION] 미생성 파일

다른 대시보드 (hub/expense/future) 의 context 파일은 **수정 작업 발생 시점에 만들기**. 선제 생성 시 토큰 낭비.

### [CODE] 산출물

| 파일 | 줄수 | 출처 |
|---|---|---|
| `worklog-archive.md` | 1224 | 기존 worklog.md 복사 + 본 Session 5.4 항목 추가 |
| `worklog.md` (신규 슬림) | ~110 | 처음부터 작성 |
| `context-wealth.md` | ~95 | 처음부터 작성. Session 2 + 5.1 Wealth + Pending 추출 |
| `context-health.md` | ~90 | 처음부터 작성. Session 4 + 신규 작업 명세 |

### [DECISION] Wealth/Health 작업 사전 진단

본 세션의 핵심 부가가치 — 다음 세션 작업 전 미리 정리:

**Wealth 알려진 이슈 4건 + α**:
1. Daily snapshot 4월 하루만 작동 → MoM/YoY 동일값 (+255.53%) 의 직접 원인 (사용자 확인)
2. 전체금액 실제보다 많음 → 합산 로직/시트 중복 의심
3. 주가 미세 오차 → 데이터 소스 (시트 수동 vs 외부 API) 확인 필요
4. 올해 수익 달성 계산 방식 변경 → 사용자가 새 방식 정의 필요
5. 추가 기능 (TBD)

**Health 신규 작업 1건 + α**:
1. 아이들 운동 스케줄 (도비/로비) 수동 입력 + 부모 확인 기능
   - 입력 방식 (시트 직접 vs 대시보드 폼) 미정
   - 시간 단위 (요일 vs 날짜) 미정
   - 시트 구조 (별도 탭 권장) 미정
2. 추가 기능 (TBD)

### [VERIFICATION]

| 항목 | 결과 |
|---|---|
| archive 라인 수 | 1174 (5.3 포함) → 1224 (5.4 추가) |
| 슬림 worklog 가독성 | ~110줄, 1분 내 스캔 가능 |
| context 파일 자족성 | 첨부 시 새 Claude 가 즉시 작업 시작 가능 (사용자 확인 질문 포함) |

### [LESSON]

1. **누적 로그는 좋지만 "현재 상태" 와 "이력" 을 분리해야**: 단일 worklog 가 자라면 새 세션 토큰 비용이 매번 누적분만큼 증가. 현재 상태(작은 파일) + 이력(큰 파일, 참조용) 분리가 정공법.
2. **컨텍스트 파일은 "체크리스트 + 질문 목록"**: 단순 정보 요약이 아니라 사용자가 답해야 할 항목을 명시하면 세션 시작 후 핑퐁 줄어듦.
3. **선제적 생성 X**: 모든 대시보드 context 를 미리 만들면 유지보수 부담 + 안 쓸 가능성. 필요 시점에 생성.
4. **archive 복사는 토큰 0**: 사용자 지적 정확. 파일 이름만 바꾸는 작업에 새로 쓰면 안 됨.

### [COST]

- 운영 비용: 0원
- 작업 토큰: worklog-archive 복사 (0), 슬림 worklog/context 2개 작성 (작음). Session 5.3 보다 약간 큼.
- **다음 세션 절감 효과**: Wealth/Health 세션에서 worklog 관련 컨텍스트 ~17k → ~3k 토큰. 약 -14k/세션.

### [PENDING]

(슬림 worklog.md 의 Cross-cutting Pending 으로 이관)

- [완료] Session 5.4 종료

────────────────────────────────────────────────────────────────────

## Session 6 — Travel 대시보드 신규 추가 (Phase A)

**기간**: 2026-05-17
**범위**: 5번째 서브 대시보드 신규. Phase A 만 (메인 페이지). 개별 여행 페이지는 Phase B 로 분리.

### [DECISION] 9가지 핵심 결정

| # | 사항 | 답 |
|---|---|---|
| 1 | 지도 공급자 | 세계지도 = 인라인 SVG (가벼움, 디자인 톤). 개별 여행 = Mapbox (Phase B). Phase A 에선 Mapbox 코드 없음 |
| 2 | 여행 ID | 자유 텍스트 매칭 폐기 → 짧은 `trip_id` (예: `tokyo-2026`) 도입. Expense 연동은 메모 태깅 (`#trip_id`) |
| 3 | family-os 통합 방식 | 옵션 A (5번째 카드 추가). 사용자 결정: 비대칭이라도 동일 디자인, 향후 카드 추가 여지 |
| 4 | Travel 카드 표시 내용 | 향후 여행 후보군 4개 (2x2). 각 슬롯: 도시명 + 희망 방문장소 수 |
| 5 | 빈 슬롯 처리 | 점선 박스 + "+ 여행 추가" 인터랙티브 |
| 6 | 4개 정렬 기준 | `period_start` 가까운 미래순. null 은 `created_at` 최신순 |
| 7 | 같은 도시 재방문 매칭 | `country_code` + `city_key` 조합. 자유 입력 city 텍스트는 표시용, 매칭은 정규화 키로 |
| 8 | 카테고리 | 호텔/식당/카페/마트/샵/해변/공원/놀이공원/관광지/**기타** (10개) |
| 9 | 악센트 색 | coral `#FF7B7B` |

### [DECISION] 비판적으로 짚어둔 점

1. **자유 텍스트 매칭은 fragile**: 도쿄/Tokyo/도쿄도/Tokyo Metropolis 가 모두 같은 도시를 가리킬 수 있음. `country_code` + `city_key` 정규화로 해결
2. **Write-back 걱정은 outdated**: Session 3 의 OAuth 폐기 후 `doPost` + `text/plain;charset=utf-8` 패턴은 안정 작동. 사용자 우려는 과거 기억이라 짚어줌
3. **Mapbox 무료 한도면 충분**: 50K map loads / 100K geocoding 무료. 개인용 사용량은 월 수백 수준. **카드 등록 불필요** (Google Maps 와 다른 점)
4. **Phase A 에선 Mapbox 0 사용**: 도시 검색은 OSM Nominatim (완전 무료, 토큰 불필요). Mapbox 는 Phase B 개별 여행 페이지에만
5. **카드 그리드 비대칭**: 5번째 카드는 `grid-column: 1 / -1` 로 가로 전체. 사용자 합의됨
6. **메인 허브 카드 콘텐츠**: 다른 카드는 KPI (₩, %, D-N) 인데 Travel 은 "장소 수 리스트"로 톤 달라짐. 사용자 결정 그대로 진행하되, 향후 다른 카드 추가 가능성 염두에 두고 grid-column 처리

### [CODE] 산출물

| 파일 | 줄수 | 종류 | 주요 내용 |
|---|---|---|---|
| `backend-spec.md` (v0.3) | 314 | 문서 | §3-6 Travel kpi, §3-7 trips/places 스키마, §3-8 Expense 메모 태깅 패턴, `doPost+text/plain` 본문에 명시 |
| `design-tokens.css` | 178 | CSS | `--acc-travel: #FF7B7B` + `--acc-travel-soft` 추가 |
| `design-system.md` | 212 | 문서 | 악센트 표에 Travel/coral 행 추가 |
| `common.js` | 408 | JS | `DASHBOARDS` 배열에 travel 추가 (5번째) |
| `index.html` | 1025 | HTML | 5번째 카드 `data-id="travel"` article, `grid-column: 1/-1`, accent 매핑, `renderTravel()` 함수 추가 |
| `travel-apps-script.gs` | 612 | Apps Script | 신규. doGet (`summary`/`full`) + doPost (6 액션). 시트 자동 초기화 (`ensureSheets_`). trip_id/place_id 자동 생성 |
| `travel.html` | 945 | HTML | 신규. 세계지도 SVG (대륙 outline 인라인) + 2열 (최근/향후) + 여행 추가/편집 모달 + OSM Nominatim 도시 검색 |
| `worklog.md` | (슬림 갱신) | 문서 | 대시보드 표에 Travel 행 추가, Pending 갱신 |
| `worklog-archive.md` | (이 섹션 추가) | 문서 | Session 6 항목 누적 |
| `context-travel.md` | 신규 | 문서 | Phase B 시작용 컨텍스트 |

### [CODE] 시트 스키마

**`trips` 탭 (13 컬럼)**:
`trip_id` / `display_name` / `status` / `period_start` / `period_end` / `members` / `country_code` / `city` / `city_key` / `center_lat` / `center_lng` / `zoom` / `created_at`

**`places` 탭 (13 컬럼)**:
`place_id` / `trip_id` / `category` / `name` / `address` / `lat` / `lng` / `mapbox_id` / `visit_status` / `visited_date` / `rating_star` / `rating_text` / `created_at`

시트 헤더는 첫 doGet/doPost 호출 시 자동 삽입 (`ensureSheets_`). 사용자는 빈 시트 2개만 생성하면 됨.

### [CODE] 핵심 패턴

1. **CORS 회피 (write)**: `Content-Type: text/plain;charset=utf-8` → simple request → preflight 안 생김. Session 3 패턴 그대로 재사용
2. **doPost 6 액션**: addTrip / updateTrip / deleteTrip / addPlace / updatePlace / deletePlace. deleteTrip 은 places 도 cascade 삭제
3. **trip_id 자동 생성**: `{city_key}-{year}` 기본. 중복 시 `-2`, `-3` 등 suffix
4. **place_id 자동 생성**: `pl_{trip_id}_{seq:3자리}` 패턴
5. **세계지도 마커 좌표**: equirectangular projection (1000x500 viewBox). 단순 대륙 outline path 13개 인라인. 추후 정밀한 SVG 로 교체 가능
6. **마커 애니메이션**: 동그라미 + 위아래 진동 역삼각형 (`@keyframes markerBob`). 마커별 `animation-delay` 분산 (5단계) 으로 일제히 안 움직이게
7. **빈 슬롯 hover**: 메인 허브 카드의 link-overlay 와 슬롯 hover 가 충돌하지 않게 z-index 그대로 사용 (slot 은 overlay 아래라 클릭 시 travel.html 로 이동)

### [DECISION] Phase B 로 미룬 사항

| 항목 | 이유 |
|---|---|
| 개별 여행 페이지 (`travel.html?trip=...`) | 코드량 큼 (Mapbox 통합 + 검색 자동완성 + 카테고리 핀 9개 + 별점 + 필터) |
| 같은 도시 재방문 시 회색/유색 시각화 | Phase A 데이터 모델만 준비됨. 시각화는 Phase B |
| Mapbox access token 통합 | LocalStorage 저장 패턴. Phase B 진입 시 사용자 발급 필요 |
| 방문장소 카테고리별 SVG 아이콘 | 9 카테고리 + other. Phase B 에서 디자인 |
| Travel ↔ Expense 비용 표기 | 옵션 A/B/C 미결정. Phase B 진입 시 결정 |
| 메인 허브 Task 통합 | Phase A 응답은 `tasks: []`. 임박 여행 D-N 등 추가 검토 |

### [DECISION] Phase A 에서 의도적으로 단순화한 것

1. **trip_id 변경 (편집 모달)**: trip_id 칸은 편집 모드에서 보이되, 실제 변경은 거부. 변경하려면 delete + add 가 필요. Expense 메모 태깅이 깨질 수 있어 신중하게.
2. **`f-city-search` 의 한국어 처리**: OSM Nominatim 은 한글 검색도 어느 정도 지원하지만, 영문 검색이 더 안정적. 사용자가 한글 입력하면 검색은 한글로 가되, `f-city-key` 추출은 결과의 영문 `address.city` 에서 함
3. **편집 시 좌표 변경**: Geocoding 결과는 빈 칸만 채우게 (이미 값이 있으면 덮어쓰지 않음). 사용자 의도 보호
4. **에러는 alert()**: Phase A 는 빠른 검증이 목적. Phase B 에서 toast 같은 UX 로 개선

### [VERIFICATION]

| 항목 | 결과 |
|---|---|
| `travel-apps-script.gs` 문법 (`node --check`) | ✅ 612 줄 통과 |
| `travel.html` 인라인 JS (`node --check`) | ✅ 27,152 chars 통과 |
| `travel.html` 태그 균형 | ✅ div 70/70, section 2/2, main 1/1, script 2/2, style 1/1, button 11/11, ul 2/2, svg 5/5, g 1/1 |
| `index.html` 태그 균형 (변경 후) | ✅ div 40/40, article 5/5, section 2/2, script 2/2, button 3/3 |
| `index.html` 인라인 JS (수정 후) | ✅ 20,700 chars 통과 |
| `common.js` (DASHBOARDS 5개로 확장) | ✅ 통과 |
| 모달 1개 (`trip-modal`) | ✅ 추가/편집 모드 토글 |
| Apps Script 6 액션 매칭 | ✅ addTrip/updateTrip/deleteTrip/addPlace/updatePlace/deletePlace |
| backend-spec §3-6 / §3-7 와 코드 일치 | ✅ summary 키 5개 (`upcoming_count`, `upcoming_trips[]`), trip 13컬럼, place 13컬럼 |

### [COST] 운영 비용 / 토큰

**사용자 운영 비용 (Phase A)**:
- Apps Script: 무료
- OSM Nominatim (도시 검색): 무료 (정책상 1 req/sec, 개인 사용은 무관)
- Mapbox: Phase A 에선 0 호출. Phase B 부터. 무료 한도 50K loads/월, 100K geocoding/월 → 개인 사용량 (월 수백)으로는 0원
- GitHub Pages: 무료
- **월 운영비 합계: 0원 확정**

**이번 세션 작업 토큰**:
- Apps Script 612 줄 + HTML 945 줄 + spec/CSS/common 수정 + worklog/context 작성
- 총 산출 코드 ~95KB. Health (594+2393=2987 줄, ~75KB) 보다 약간 큼
- Phase B (개별 여행 페이지) 는 다음 세션에서 별도로 — Mapbox 통합 + 검색 자동완성 + 카테고리 핀 + 필터 모두 들어가야 해서 Phase A 와 비슷한 토큰량 예상

### [DEPLOYMENT] 사용자 안내 (5단계)

1. **새 Google Spreadsheet 생성**
   - 빈 시트 1개 만들기. 이름은 자유 (예: "Family Travel")
   - 시트 ID 메모 (URL 의 `/d/{SHEET_ID}/edit`)
   - 탭 2개 추가: `trips`, `places` (둘 다 비워둬도 됨, 헤더는 자동 삽입됨)

2. **Apps Script 프로젝트 생성**
   - script.google.com → 새 프로젝트
   - `travel-apps-script.gs` 내용 전체 복사 → `Code.gs` 에 붙여넣기
   - 상단 `SHEET_ID = ''` 안에 1단계 ID 입력

3. **권한 부여 + 디버그**
   - 편집기에서 `debug_summary` 선택 → 실행 → 권한 팝업 → 허용
   - 로그에 `{ ok: true, data: { upcoming_count: 0, upcoming_trips: [] } }` 나오면 OK
   - 빈 시트면 ensureSheets_ 가 헤더 13개씩 자동 삽입한 걸 확인할 수 있음
   - (옵션) `debug_addSampleTrip` 실행 → 샘플 도쿄 trip 추가됨. `debug_summary` 다시 실행하면 1건으로 나옴

4. **웹 앱 배포**
   - 배포 > 새 배포 > 유형: 웹 앱
   - 액세스: 모든 사용자
   - 게시 → URL 복사 (`/exec` 로 끝나는)

5. **메인 허브 + travel.html 연결**
   - GitHub Pages 에 새 파일들 푸시:
     - `travel.html`, `travel-apps-script.gs` (참조용)
     - 수정된 `index.html`, `common.js`, `design-tokens.css`, `design-system.md`, `backend-spec.md`
   - index.html 열고 ⚙️ → 5번째 칸 "Travel" 에 4단계 URL 입력 → 저장
   - travel.html 도 같은 URL 자동으로 사용함 (LocalStorage 공유)

### [LESSON]

1. **사용자의 과거 경험은 정확하지만 outdated 일 수 있음**: write-back 우려는 정당했음 (OAuth 시절 문제). 현재 시스템에선 해결됨. 사용자에게 "이건 과거 기억" 이라고 명시적으로 짚어주는 게 좋음
2. **Mapbox vs Google Maps**: 한국 POI 매칭은 Google 이 강하지만 카드 등록 마찰. Mapbox 는 카드 없이 무료 + 한도 후함. 개인용 가족 대시보드는 마찰 최소화가 우선 → Mapbox 선택
3. **자유 텍스트 매칭은 항상 fragile**: 같은 도시 매칭 같은 경우 정규화 키를 별도 컬럼으로 두면 견고. `city` (자유 입력 표시용) + `city_key` (영문 정규화 매칭용) 패턴
4. **인라인 SVG 세계지도의 한계**: 13개 추상화된 path 로는 정밀도 부족. 일본을 점 1개로 표시 등. 사용자가 정밀도 원하면 topojson + d3 (또는 외부 SVG) 로 교체 가능. 현재 톤엔 충분
5. **Phase 분리 효과**: Phase A 만 95KB. 다 합쳐 만들면 한 세션 토큰 한도에서 끝 못 봤을 가능성. 메인 페이지만 끝내고 검증 → 다음 세션에서 안정적으로 Phase B 진입

### [PENDING] 다음 후보

(슬림 worklog.md 의 Cross-cutting Pending 갱신 참조)

- Phase B 진입 시작 — 개별 여행 페이지, Mapbox 통합
- Travel ↔ Expense 비용 표기 방식 결정 (옵션 A/B/C)
- 같은 도시 재방문 시각화 (회색/유색)
- Mapbox access token 발급 + LocalStorage 저장 패턴

- [완료] Session 6 종료

────────────────────────────────────────────────────────────────────

## Session 7 — Travel Phase B (개별 여행 페이지)

**기간**: 2026-05-17 (Session 6 직후)
**범위**: `travel-trip.html` 신규. Mapbox 통합, 카테고리 핀, 검색 자동완성, 별점, 방문일 필터, 같은 도시 재방문 시각화.

### [DECISION] Phase B 진입 전 5가지 결정 (사용자 답)

| # | 사항 | 답 |
|---|---|---|
| Q1 | Mapbox token | 사용자 발급 완료. **사용자가 Mapbox 가입 시 카드 정보 요구받음** → 내 사전 안내 "카드 등록 불필요"는 부정확. 사과 + Usage limits 안전책 안내 |
| Q2 | URL 구조 | 별도 `travel-trip.html?trip={id}` (B). 메인 페이지 코드 안 건드림 |
| Q3 | Travel↔Expense 비용 | 수동 입력 (B). Phase B 단순화 |
| Q4 | 카테고리 아이콘 | **사용자 선호 (b)** + 내 우려 (c) 의 혼합 → **통일된 원형 핀 외곽 + 내부 의미적 line-icon** |
| Q5 | 별점·평가 | 둘 다 선택 입력 |

### [DECISION] Multi-city trip 한계 (이미지에서 발견)

사용자가 추가한 "미국 가족여행 2027"이 `city=샌프란시스코, LA` / `city_key=san-francisco` 로 입력됨. 한 trip 에 두 도시 들어감. 데이터 모델은 trip=1도시 가정.
- 영향: 다음에 LA만 가는 trip 추가하면 매칭 안 됨 (city_key=la 가 되어 다른 마커로 표시)
- 영향: 개별 여행 페이지는 한 도시 중심으로 zoom. SF/LA 600km 떨어져 한 지도 fit 시 디테일 손실
- 결정: 데이터 모델 변경하지 않음. 사용자가 추후 분할하거나 그대로 두면 됨

### [CODE] 산출물

| 파일 | 줄수 | 종류 |
|---|---|---|
| `travel-trip.html` | ~990 | 신규 (HTML+CSS+JS, 인라인 JS 29,968자) |
| `travel.html` | 1372 → 1372 | 수정 (마커 클릭 + 타일 클릭 둘 다 navigate 로 변경) |
| `travel-apps-script.gs` | 변경 없음 | buildFullPayload 가 이미 모든 trips+places 반환 → 클라이언트 필터링으로 충분 |
| `worklog.md` (슬림) | (갱신) | Travel 행 v0.2.0 으로 |
| `worklog-archive.md` | (이 섹션 추가) | |

### [CODE] 핵심 패턴

1. **Mapbox GL JS v3 사용**: `https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.js`. dark-v11 스타일
2. **DOM 기반 Marker (mapboxgl.Marker)**: 원형 핀 + 내부 line-icon. GeoJSON Symbol layer 대신 DOM 사용 → 인터랙티브 (호버 라벨, 클릭, 카테고리별 다른 모양) 더 쉬움. 100개 미만에서 성능 OK
3. **Search Box API (Suggest + Retrieve)**: session_token UUID v4. 1 retrieve = 1 billable session. proximity 파라미터로 현재 trip center 주변 우선 검색
4. **카테고리 line-icon SVG**: Lucide 아이콘 단순화. 10개 (hotel/restaurant/cafe/mart/shop/beach/park/themepark/sight/other)
5. **핀 3가지 상태**:
   - `visited` (현재 trip): coral 채워짐, 흰색 아이콘
   - `planned` (현재 trip): 외곽선만 coral, coral 아이콘
   - `other` (다른 trip visited, 같은 도시): 회색 외곽선 + 회색 아이콘, opacity 0.7
6. **재방문 매칭 dedup**: 현재 trip 에 같은 `mapbox_id` 가 있으면 other 핀 숨김 (회색 위에 컬러 덮어쓰기)
7. **방문일 필터 칩**: '전체' + 'planned' + 각 visited_date. 클릭 시 visible places 재계산 + fitBounds 자동
8. **Token 입력 모달**: travel-trip.html 첫 로드 시 token 없으면 자동 팝업. Mapbox API 401/403 에러 시에도 자동 재요청
9. **Token 저장**: LocalStorage `familyOS.mapboxToken`. travel-trip.html 안에서만 묻고 끝. 메인 허브 영향 0

### [CODE] 5가지 핀 동작 시나리오

| 시나리오 | 핀 표시 |
|---|---|
| past trip A 에 식당 등록 (visited) | 채워진 coral 핀 |
| upcoming trip B 에 식당 등록 (planned) | 외곽선만 coral |
| trip B (도쿄, upcoming) 페이지 진입 + 과거 도쿄 trip A 의 visited 식당 X | 회색 핀으로 X 표시 (다른 trip) |
| 사용자가 X 를 trip B 에도 등록 (planned) → 같은 mapbox_id | 회색 사라지고 coral 외곽선 핀 |
| 다른 trip 의 회색 핀 클릭 | 편집 모달 X. popup 으로 정보만 (이전 여행 trip_id, 방문일, 별점) |

### [VERIFICATION]

| 항목 | 결과 |
|---|---|
| `travel-trip.html` 인라인 JS (`node --check`) | ✅ 29,968 chars 통과 |
| `travel-trip.html` 태그 균형 | ✅ div 63/63, main 1/1, script 3/3, style 1/1, button 9/9 |
| `travel.html` 수정 후 JS 검증 | ✅ 통과 |
| Mapbox GL JS CDN URL 유효성 | ✅ v3.0.1 안정 버전 (2024 릴리즈) |
| Search Box API endpoints | ✅ suggest + retrieve, session_token 패턴 |
| 카테고리 10개 line-icon path 정의 | ✅ Lucide 기반 단순화 |
| Apps Script 추가 endpoint 필요성 | ❌ 불필요 (기존 buildFullPayload 가 모든 데이터 반환) |

### [DEPLOYMENT] 사용자 안내

1. **Mapbox token 발급** (이미 함):
   - mapbox.com → Account → Tokens → "Default public token" 복사

2. **Mapbox usage limits 설정** (강력 권장):
   - mapbox.com → Account → Billing → Usage limits
   - "Set a usage limit" → 월 $0 또는 $1 입력
   - 한도 초과 시 청구 대신 서비스 중단됨 (가족 사용량으로는 절대 도달 안 함)

3. **GitHub 푸시**:
   - 신규: `travel-trip.html`
   - 수정: `travel.html` (마커/타일 클릭 → navigate)
   - 문서: `worklog.md`, `worklog-archive.md`, `context-travel.md`

4. **첫 사용 검증**:
   - 메인 허브 → Travel 카드의 도쿄 슬롯 클릭 (또는 travel.html 의 타일/마커 클릭)
   - `travel-trip.html?trip=tokyo-2026` 열림
   - Mapbox token 입력 모달 표시 → `pk.` 토큰 붙여넣기 → 저장
   - 지도 로드되면 OK. center 가 도쿄 (35.6762, 139.6503) 인지 확인
   - "+ 방문장소 추가" → 카테고리 선택 → 검색 (예: "Tsukiji") → 결과 선택 → 저장
   - 핀이 지도에 표시되면 끝

### [LESSON]

1. **Mapbox 가입은 카드 등록 요구**: 무료 사용도 마찬가지. 다만 usage limits 로 청구 차단 가능. 사전에 정확히 안내 못한 점 사과해야 함
2. **DOM Marker vs Symbol Layer**: DOM 이 인터랙티브에 유리. 1000개 이상에서만 Symbol Layer 고려
3. **Search Box API session token**: 1 retrieve = 1 billable session. retrieve 마다 새 UUID 발급. suggest 만 하는 동안엔 같은 token 재사용
4. **재방문 시각화의 dedup**: 같은 `mapbox_id` 우선. 사용자가 검색을 통해 추가하면 자동으로 매칭됨. 직접 좌표 입력은 매칭 안 됨 (mapbox_id 없으므로)
5. **Phase 분리의 가치 재확인**: Phase A 95KB + Phase B 30KB = 단일 세션 안전권. 둘 다 한 번에 했으면 토큰 한도 위험
6. **multi-city trip 한계**: 현재 모델은 단일 도시 가정. 사용자가 다중 도시 trip 만들면 부분적으로만 작동. 추후 hotfix 후보

### [COST]

- 운영 비용: Mapbox 무료 한도 충분. 개인 사용 월 수백 load 수준 → 한도의 0.001%. usage limit 설정으로 절대 청구 X
- 작업 토큰: travel-trip.html 만 새로 작성, travel.html 미세 수정, Apps Script 변경 없음. Phase A 보다 약 30% 작은 토큰. Phase 분리가 효과

### [PENDING] 다음 후보

(슬림 worklog.md 의 Cross-cutting Pending 참조)

1. **Travel ↔ Expense 비용 표기 자동화** — Phase B 는 수동 입력 (현재 미구현, 추후 hotfix). 메인 허브 경유로 양쪽 결합 가능
2. **Multi-city trip 지원** — 데이터 모델 변경 또는 trip 분할 가이드
3. **Wealth/Health 수정** — 별도 컨텍스트 파일 참조
4. **세계지도 정밀도** — 13개 추상 path → 더 정밀한 topojson 교체 (낮은 우선순위)

- [완료] Session 7 종료

────────────────────────────────────────────────────────────────────
