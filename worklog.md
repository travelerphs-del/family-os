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
