# Family OS — Backend (Apps Script) Spec

> 4개 서브 대시보드의 Apps Script가 **반드시** 따라야 하는 응답 포맷.
> 메인 허브는 이 표준에 의존해 4개 카드를 동기화한다.

---

## 1. 큰 그림

- 대시보드별로 **별도 스프레드시트 1개 + 별도 Apps Script 1개 + 별도 Web App URL 1개** (총 4세트).
- 각 Apps Script는 `doGet(e)`에서 **두 가지 모드**를 지원:
  - `?mode=full` (또는 mode 생략) — 해당 대시보드 화면 그릴 전체 데이터. 형식 자유.
  - `?mode=summary` — 메인 허브용 가벼운 요약. **이 포맷은 엄격하게 표준화.**

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

메인 카드: "총 순자산" 1개 + 펼치기로 자산군별 상세.

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
  }
}
```

- `mom_pct` / `yoy_pct`: 전월/전년 대비 % 변화. **소수점 둘째자리까지**. 부동산처럼 월간 데이터가 의미없으면 `null`.
- `value_krw`: KRW 환산 정수. 메인은 그대로 ₩ 포맷팅.
- `weight_pct`: 전체 자산 대비 비중 %. 합 100 근사.
- 일일 스냅샷 시트(`📅 일일스냅샷`)에서 MoM/YoY 계산.

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

### 3-4. Future (`dashboard: "future"`)

```json
{
  "years_to_retirement": 14.5,
  "goal_progress_pct": 67.3,
  "next_milestone": "주택대출 완납",
  "next_milestone_date": "2026-12-31"
}
```

- `years_to_retirement`: 소수점 1자리. 반올림하지 말고 잘라서.
- `goal_progress_pct`: 0~100. 100 초과면 `100`으로 clamp.
- `next_milestone_*`: 없으면 `null`.

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
- **Future**: 30일 이내 마일스톤 있으면 `info`, 7일 이내면 `warn`.

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

이 7개만 충족하면 메인 허브가 자동으로 해당 카드를 채운다.
