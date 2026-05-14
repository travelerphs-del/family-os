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
