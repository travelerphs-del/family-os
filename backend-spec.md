# Family OS — Backend (Apps Script) Spec

> 4개 서브 대시보드의 Apps Script가 **반드시** 따라야 하는 응답 포맷.
> 메인 허브는 이 표준에 의존해 4개 카드를 동기화한다.
>
> **v0.2 (Session 5)** — Future 대시보드 추가에 따라 다음 변경:
> - Wealth `kpi`에 `retirement_value_krw` 추가
> - Future `kpi` 구조를 실제 운영에 맞게 재정의
> - 마일스톤 금액 컬럼 표준화

---

## 1. 큰 그림

- 대시보드별로 **별도 스프레드시트 1개 + 별도 Apps Script 1개 + 별도 Web App URL 1개** (총 4세트).
- 각 Apps Script는 `doGet(e)`에서 **두 가지 모드**를 지원:
  - `?mode=full` (또는 mode 생략) — 해당 대시보드 화면 그릴 전체 데이터. 형식 자유.
  - `?mode=summary` — 메인 허브용 가벼운 요약. **이 포맷은 엄격하게 표준화.**
- **대시보드는 본인 시트만 읽음.** 다른 대시보드 시트 직접 참조 금지.
  - 결합 표시는 메인 허브가 중재 (예: Future 진행률 = Wealth 노후 잔액 ÷ Future 목표).

---

## 2. `?mode=summary` 표준 응답

### 2-1. 응답 envelope (모든 대시보드 공통)

```json
{
  "ok": true,
  "data": {
    "dashboard": "wealth",
    "kpi": { /* 대시보드마다 다름. 아래 섹션 3 참고 */ },
    "tasks": [ /* TaskItem 배열. 섹션 4 참고. 없으면 빈 배열 */ ],
    "updated_at": "2026-05-14T08:00:00+09:00"
  }
}
```

에러 시:

```json
{
  "ok": false,
  "error": "에러 메시지 문자열",
  "stack": "(선택) 디버그용 스택"
}
```

### 2-2. envelope 규칙

- `ok: boolean` — 성공 여부. **항상 포함**.
- `data.dashboard: string` — `"wealth"` / `"expense"` / `"health"` / `"future"` 중 하나. 메인이 검증용으로 씀.
- `data.updated_at: ISO8601 string` — 데이터 기준 시각. 메인 카드 하단에 "X분 전 업데이트" 표시 위해 필수.
- `data.kpi: object` — 카드에 표시할 지표. **포맷은 대시보드별로 다름** (아래 섹션 3).
- `data.tasks: array` — 메인 Task 섹션에 표시할 항목. 없으면 빈 배열 `[]`.

### 2-3. CORS / 호출 형식

```js
ContentService
  .createTextOutput(JSON.stringify(payload))
  .setMimeType(ContentService.MimeType.JSON);
```

배포는 **웹 앱 / 액세스: 모든 사용자** 로. 인증은 URL 비밀성으로만.

---

## 3. 대시보드별 `kpi` 포맷

### 3-1. Wealth (`dashboard: "wealth"`)

메인 카드: "총 순자산" 1개 + 펼치기로 자산군별 상세 + Future 카드 결합용 노후 잔액.

```json
{
  "net_worth_krw": 1234567890,
  "mom_pct": 2.31,
  "yoy_pct": 12.45,
  "breakdown": {
    "domestic_stock": { "value_krw": 200000000, "weight_pct": 16.2, "mom_pct": 1.5, "yoy_pct": 8.2 },
    "foreign_stock":  { "value_krw": 400000000, "weight_pct": 32.4, "mom_pct": 3.1, "yoy_pct": 18.5 },
    "realestate":     { "value_krw": 500000000, "weight_pct": 40.5, "mom_pct": null, "yoy_pct": 5.0 },
    "cash":           { "value_krw": 134567890, "weight_pct": 10.9, "mom_pct": -0.5, "yoy_pct": 2.0 }
  },
  "retirement_value_krw": 263118200
}
```

- `mom_pct` / `yoy_pct`: 전월/전년 대비 % 변화. **소수점 둘째자리까지**. 부동산처럼 월간 데이터가 의미없으면 `null`.
- `value_krw`: KRW 환산 정수. 메인은 그대로 ₩ 포맷팅.
- `weight_pct`: 전체 자산 대비 비중 %. 합 100 근사.
- 일일 스냅샷 시트(`📅 일일스냅샷`)에서 MoM/YoY 계산.
- **`retirement_value_krw` (Session 5 추가)**: 노후 자금 계좌의 평가금액 합계 (KRW).
  - 보유종목 시트 `📊 보유종목`의 `계좌ID == 'acc_dad_jh'` 행들의 `평가금액` 합.
  - 메인 허브가 Future 카드의 진행률 계산에 사용.
  - 노후 계좌가 없거나 데이터 없으면 `0` (null 아님).

### 3-2. Expense (`dashboard: "expense"`)

```json
{
  "last_month_total_krw": 4250000,
  "mom_pct": 5.3,
  "top_categories": [
    { "name": "식비", "amount_krw": 1100000, "weight_pct": 25.9 },
    { "name": "교육", "amount_krw": 850000,  "weight_pct": 20.0 },
    { "name": "주거", "amount_krw": 700000,  "weight_pct": 16.5 }
  ]
}
```

- `last_month_total_krw`: 직전 완료된 월(=전달)의 총 지출.
- `mom_pct`: 전전달 대비 변화율.
- `top_categories`: 상위 3개. 비중 큰 순서. `name` 한국어.

### 3-3. Health (`dashboard: "health"`)

```json
{
  "members": [
    { "id": "dad",  "name": "아빠 실명", "status": "ok"   },
    { "id": "mom",  "name": "엄마 실명", "status": "warn" },
    { "id": "robi", "name": "로비 실명", "status": "ok"   },
    { "id": "dobi", "name": "도비 실명", "status": "ok"   }
  ]
}
```

- `status`: `"ok"` / `"warn"` / `"bad"` 셋 중 하나. 다른 값 금지.
- 판정 로직은 Health 대시보드 내부에서. 메인은 그냥 표시만.
- 멤버 순서는 응답 그대로 사용.

### 3-4. Future (`dashboard: "future"`) — Session 5 재정의

```json
{
  "years_to_retirement": 9.6,
  "goal_progress_pct": null,
  "retirement_target_krw": 1500000000,
  "next_milestone": "3억",
  "next_milestone_date": "2026-12-31"
}
```

- `years_to_retirement`: 노후 목표 프로젝트(시트 `Project` 탭에서 `유형='목표'`)의 종료일까지 년수.
  - **소수점 1자리, 반올림하지 말고 잘라서.**
  - 과거면 음수. 목표 없으면 `null`.
- `goal_progress_pct`: **항상 `null`을 반환.**
  - Future Apps Script는 본인 시트로 노후 잔액을 모름.
  - 메인 허브가 Wealth `retirement_value_krw` ÷ `retirement_target_krw` × 100으로 계산.
- `retirement_target_krw`: 노후 목표 프로젝트의 `예상비용` 또는 fallback `1500000000`.
- `next_milestone`, `next_milestone_date`: 노후 목표 프로젝트의 미완료 Task 중 가장 가까운 미래의 것.
  - Task 없으면 둘 다 `null`.

### 3-5. Future 시트 구조 — Session 5

**Project 탭** (메타 9 컬럼):

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `ID` | string | 프로젝트 고유 ID (예: `P001`, `P004`) |
| `구분` | enum | `단기` / `중장기` / `노후` |
| `제목` | string | 프로젝트명 |
| `시작일` | date | |
| `종료일` | date | 노후 목표는 이 날짜 기준 `years_to_retirement` 계산 |
| `예상비용` | KRW | `1.5억`, `5000만원`, `1500000` 모두 파싱 가능 |
| `요약내용` | string | 본문 설명 |
| `관련인` | string | 가족 멤버명 (아빠/엄마/도비/로비) 콤마/스페이스 구분 |
| `유형` | enum | `일반` (기본) 또는 `목표` (노후 자금 같은 마일스톤형) |

**Task 탭** (8 컬럼, Session 5에서 `마일스톤_금액` 추가):

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `프로젝트ID` | string | Project 탭의 `ID` 참조 |
| `Task명` | string | Task 제목 |
| `상태` | enum | `준비` / `진행` / `완료` |
| `기한` | date | |
| `비용` | KRW | Task 단위 비용 |
| `상세내용` | string | 본문 |
| `관련인` | string | 가족 멤버명 |
| **`마일스톤_금액`** | **KRW** | **(Session 5 신규) 노후 목표 마일스톤일 때만 사용. 누적 목표액 (원).** |
|  |  | **일반 Task는 비워둠. 노후 마일스톤 차트의 Y축으로 사용.** |
|  |  | **예: 300000000 (3억), 380000000 (3.8억)** |

---

## 4. `tasks` 표준 포맷 (모든 대시보드 공통)

메인의 "할 일" 섹션에 그대로 표시된다.

```json
{
  "id": "wealth.realestate.stale",
  "label": "잠실우성 부동산 가격 21일 미업데이트",
  "urgency": "warn",
  "due": "2026-05-15"
}
```

| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | string | 고유 ID. `<dashboard>.<topic>.<detail>` 형식 권장 |
| `label` | string | 사용자에게 보일 한 줄. 50자 이내 권장 |
| `urgency` | `"info"` / `"warn"` / `"bad"` | 색 매핑: info=text-secondary, warn=neutral(노란색), bad=loss(빨강) |
| `due` | ISO 날짜 또는 `null` | 마감일. 메인이 "D-N" 등 표시에 사용 |

**Task 생성 예시 (대시보드별)**:

- **Wealth**: 부동산 마지막 업데이트가 N일 전이면 `urgency: warn` 생성. N > 60 이면 `bad`.
- **Expense**: 매달 1~5일 사이, 전월 import 안 됐으면 `bad`. import 완료되면 task 사라짐.
- **Health**: 오늘 약 복용 체크 안 된 멤버 있으면 멤버당 1개 task. 우선순위 `warn`.
- **Future**: Task `상태 ≠ 완료` 중에서, 기한 지남 = `bad`, 14일 이내 = `warn`, 60일 이내 = `info`. 그 이상은 task 생성 안 함. 최대 10개.

---

## 5. Apps Script 코드 골격 (4개 대시보드 공통 보일러플레이트)

```javascript
function doGet(e) {
  try {
    const mode = (e && e.parameter && e.parameter.mode) || 'full';
    const payload = mode === 'summary'
      ? buildSummaryPayload()
      : buildFullPayload();
    return jsonResponse({ ok: true, data: payload });
  } catch (err) {
    return jsonResponse({ ok: false, error: err.toString(), stack: err.stack });
  }
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function buildSummaryPayload() {
  // 대시보드별로 구현. 반드시 다음 5개 키 반환:
  return {
    dashboard: 'wealth',  // ← 대시보드 ID로 변경
    kpi: { /* 섹션 3 참고 */ },
    tasks: [ /* 섹션 4 참고 */ ],
    updated_at: new Date().toISOString()
  };
}

function buildFullPayload() {
  // 해당 대시보드 화면을 그리는 전체 데이터. 형식 자유.
  // (기존 Wealth Apps Script의 buildDashboardPayload() 와 동일 컨셉)
}
```

---

## 6. 메인 허브가 호출하는 방식 (참고)

메인이 4개 Web App URL을 LocalStorage에서 읽어와 병렬로 호출:

```js
const url = localStorage.getItem('familyOS.webAppUrl.wealth');
const res = await fetch(`${url}?mode=summary&_=${Date.now()}`, {
  method: 'GET',
  redirect: 'follow'
});
const json = await res.json();
if (!json.ok) throw new Error(json.error);
// json.data.kpi, json.data.tasks, json.data.updated_at 사용
```

캐시 무효화를 위해 `_=${Date.now()}` 같은 cachebust 파라미터를 항상 붙임.

### 6-1. 메인 허브의 데이터 결합 (Session 5 추가)

Future 카드의 진행률은 두 응답을 결합해 계산:

```js
// Wealth summary 와 Future summary 둘 다 받은 후
const retireValue = wealth.kpi.retirement_value_krw || 0;
const retireTarget = future.kpi.retirement_target_krw || 1500000000;
const progressPct = retireTarget > 0
  ? Math.min(100, (retireValue / retireTarget) * 100)
  : null;
// progressPct 를 Future 카드 진행률 표시에 사용
```

둘 중 하나라도 로드 실패하면 진행률은 표시하지 않음. `years_to_retirement` 와 `next_milestone` 은 Future 단독으로 표시 가능.

---

## 7. 호환성 체크리스트 (새 대시보드 만들 때 확인)

- [ ] `?mode=summary` 응답이 위 envelope 포맷 (`{ok, data:{dashboard, kpi, tasks, updated_at}}`)
- [ ] `data.dashboard` 가 정확히 `"wealth"` / `"expense"` / `"health"` / `"future"` 중 하나
- [ ] `kpi` 필드명이 섹션 3 정의와 정확히 일치
- [ ] `tasks` 배열의 각 항목이 `{id, label, urgency, due}` 4개 키 보유
- [ ] `updated_at` 이 ISO 8601 문자열
- [ ] 에러 시에도 `{ok: false, error: "..."}` 형태로 반환 (HTTP 200으로)
- [ ] CORS 헤더 신경 안 써도 OK (Apps Script 웹앱은 자동)
- [ ] Web App URL이 LocalStorage 키 `familyOS.webAppUrl.<dashboardId>` 에 저장됨
- [ ] **본인 시트만 읽음.** 다른 대시보드 시트 직접 접근 금지. 결합은 메인 허브가 처리

이 8개만 충족하면 메인 허브가 자동으로 해당 카드를 채운다.

---

## 8. 변경 이력

| 버전 | 시기 | 변경 |
|---|---|---|
| v0.1 | Session 1 | 최초 작성. 4개 대시보드 기본 envelope/kpi/tasks |
| v0.2 | Session 5 | Wealth `retirement_value_krw` 추가. Future `kpi` 5키로 재정의 (`goal_progress_pct`는 항상 `null`, 메인 허브가 결합 계산). Task 탭에 `마일스톤_금액` 컬럼 표준화. "본인 시트만 읽음" 원칙 명문화 |
