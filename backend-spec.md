# Family OS — Backend (Apps Script) Spec

> 5개 서브 대시보드의 Apps Script가 **반드시** 따라야 하는 응답 포맷.
> 메인 허브는 이 표준에 의존해 5개 카드를 동기화한다.
>
> **v0.4 (Session 8)** — Expense ↔ Travel 비용 연동:
> - Expense Apps Script 에 `?mode=trip_summary&trip_id=X` 엔드포인트 추가 (§3-9)
> - 메모 매칭은 단어 경계 정규식. `#tokyo-2026` 도 `tokyo-2026` 도 매칭, `tokyo-2026-extended` 는 매칭 안 됨
> - subcategory 단위 집계. category 필터는 X — trip_id 충돌 회피는 사용자 책임
> - travel-trip.html 이 직접 Expense URL 을 LocalStorage 에서 읽어 호출 (cross-dashboard 호출 첫 사례)
>
> **v0.3 (Session 6)** — Travel 대시보드 추가:
> - 5번째 대시보드 `travel` 정식 추가
> - `trips` / `places` 시트 스키마 표준화
> - 같은 도시 재방문 매칭 키 (`country_code` + `city_key`) 명문화
>
> **v0.2 (Session 5)** — Future 대시보드 추가에 따라:
> - Wealth `kpi`에 `retirement_value_krw` 추가
> - Future `kpi` 구조를 실제 운영에 맞게 재정의
> - 마일스톤 금액 컬럼 표준화

---

## 1. 큰 그림

- 대시보드별로 **별도 스프레드시트 1개 + 별도 Apps Script 1개 + 별도 Web App URL 1개** (총 **5세트**).
- 각 Apps Script는 `doGet(e)`에서 **두 가지 모드**를 지원:
  - `?mode=full` (또는 mode 생략) — 해당 대시보드 화면 그릴 전체 데이터. 형식 자유.
  - `?mode=summary` — 메인 허브용 가벼운 요약. **이 포맷은 엄격하게 표준화.**
  - 일부 대시보드는 추가 cross-dashboard 엔드포인트 보유. 현재: Expense 의 `?mode=trip_summary&trip_id=X` (§3-9).
- **대시보드는 본인 시트만 읽음.** 다른 대시보드 시트 직접 참조 금지.
  - 결합 표시는 메인 허브가 중재 (예: Future 진행률 = Wealth 노후 잔액 ÷ Future 목표).
  - Travel↔Expense 연동은 **메모 태깅 (`#trip_id`)** 방식 — 양쪽 시트가 서로를 직접 안 봄. Travel은 trip_id를 Expense 메모에 노출, Expense는 메모 텍스트 매칭으로 자동 집계.
- **Write 작업**은 모두 `doPost` + `text/plain;charset=utf-8` (CORS preflight 회피 패턴, Session 3에서 확립).

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
- `data.dashboard: string` — `"wealth"` / `"expense"` / `"health"` / `"future"` / `"travel"` 중 하나.
- `data.updated_at: ISO8601 string` — 데이터 기준 시각.
- `data.kpi: object` — 카드에 표시할 지표. **포맷은 대시보드별로 다름** (아래 섹션 3).
- `data.tasks: array` — 메인 Task 섹션에 표시할 항목. 없으면 빈 배열 `[]`.

### 2-3. CORS / 호출 형식

**GET (read)**:
```js
ContentService
  .createTextOutput(JSON.stringify(payload))
  .setMimeType(ContentService.MimeType.JSON);
```

**POST (write)** — 클라이언트 측:
```js
fetch(WEBAPP_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'text/plain;charset=utf-8' },  // ← 이게 핵심
  body: JSON.stringify({ action: 'addTrip', payload: { ... } })
});
```
- `text/plain;charset=utf-8`로 보내야 simple request로 분류되어 CORS preflight가 안 생김.
- Apps Script `doPost(e)`에서 `JSON.parse(e.postData.contents)`로 읽음.

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
- **`retirement_value_krw`**: 노후 자금 계좌의 평가금액 합계 (KRW).
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
    { "id": "son1", "name": "도비",     "status": "ok"   },
    { "id": "son2", "name": "로비",     "status": "ok"   }
  ]
}
```

- `status`: `"ok"` / `"warn"` / `"bad"` 셋 중 하나. 다른 값 금지.
- 판정 로직은 Health 대시보드 내부에서. 메인은 그냥 표시만.
- 멤버 순서는 응답 그대로 사용.

### 3-4. Future (`dashboard: "future"`)

```json
{
  "years_to_retirement": 9.6,
  "goal_progress_pct": null,
  "retirement_target_krw": 1500000000,
  "next_milestone": "3억",
  "next_milestone_date": "2026-12-31"
}
```

- `years_to_retirement`: 노후 목표 프로젝트의 종료일까지 년수. **소수점 1자리, 잘라서**. 과거면 음수. 없으면 `null`.
- `goal_progress_pct`: **항상 `null`을 반환.** 메인 허브가 Wealth `retirement_value_krw` ÷ `retirement_target_krw` × 100으로 계산.
- `retirement_target_krw`: 노후 목표 프로젝트의 `예상비용` 또는 fallback `1500000000`.
- `next_milestone`, `next_milestone_date`: 가장 가까운 미래의 미완료 Task. 없으면 `null`.

### 3-5. Future 시트 구조

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
| `관련인` | string | 가족 멤버명 |
| `유형` | enum | `일반` (기본) 또는 `목표` |

**Task 탭** (8 컬럼):

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `프로젝트ID` | string | Project 탭의 `ID` 참조 |
| `Task명` | string | Task 제목 |
| `상태` | enum | `준비` / `진행` / `완료` |
| `기한` | date | |
| `비용` | KRW | Task 단위 비용 |
| `상세내용` | string | 본문 |
| `관련인` | string | 가족 멤버명 |
| `마일스톤_금액` | KRW | 노후 목표 마일스톤일 때만. 누적 목표액 (원). |

### 3-6. Travel (`dashboard: "travel"`) — Session 6 신규

메인 카드: 향후 여행 후보군 최대 4개. 각 항목에 도시명 + 희망 방문장소 수.

```json
{
  "upcoming_count": 6,
  "upcoming_trips": [
    {
      "trip_id": "tokyo-2026",
      "display_name": "도쿄 가족여행 2026",
      "city": "도쿄",
      "country_code": "JP",
      "planned_count": 12,
      "period_start": "2026-08-01"
    },
    {
      "trip_id": "seoul-2026",
      "display_name": "서울",
      "city": "서울",
      "country_code": "KR",
      "planned_count": 50,
      "period_start": null
    }
  ]
}
```

- `upcoming_count`: 전체 향후 여행 개수 (잘라내기 전).
- `upcoming_trips`: 최대 4개. **정렬: `period_start` 가까운 미래순, null은 뒤로 (그 안에선 `created_at` 최신순).**
  - 메인 카드에 4개 슬롯으로 표시. 4개 미만이면 빈 슬롯에 "여행 추가 +" 점선 박스.
- `planned_count`: 해당 trip의 places 중 `visit_status='planned'` 개수.
- `period_start`: ISO 날짜 또는 `null`.

**Tasks (Phase A)**: 빈 배열 `[]`. Phase B에서 임박 여행 D-N 알림 추가 검토.

### 3-7. Travel 시트 구조 — Session 6

**`trips` 탭** (13 컬럼):

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `trip_id` | string | 고유 ID. 영문 소문자+숫자+하이픈 (예: `tokyo-2026`, `barcelona-2024`). 추가 시 자동 생성하되 사용자 편집 가능 |
| `display_name` | string | 표시명. 자유 입력 (예: "도쿄 가족여행 2026") |
| `status` | enum | `upcoming` / `past` |
| `period_start` | date | 시작일 (선택). 빈 값 허용 |
| `period_end` | date | 종료일 (선택) |
| `members` | string | 콤마 구분 (예: "아빠,엄마,도비,로비") |
| `country_code` | string | ISO 2글자 대문자 (예: `JP`, `KR`, `ES`, `HR`). 도시명 geocoding 결과에서 자동 |
| `city` | string | 도시 표시명 (예: "도쿄") |
| `city_key` | string | 정규화 키 (영문 소문자, 공백 제거). 같은 도시 재방문 매칭용 |
| `center_lat` | number | 도시 중심 위도 |
| `center_lng` | number | 도시 중심 경도 |
| `zoom` | number | 초기 줌 레벨 (11=도시, 9=지방) |
| `created_at` | ISO string | |

**`places` 탭** (15 컬럼, v0.2.2 부터):

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `place_id` | string | 고유 ID (예: `pl_tokyo-2026_001`). 자동 생성 |
| `trip_id` | string | `trips.trip_id` 참조 |
| `category` | enum | `hotel` / `restaurant` / `cafe` / `mart` / `shop` / `beach` / `park` / `themepark` / `sight` / `other` |
| `name` | string | 장소명 |
| `address` | string | 주소 (선택) |
| `lat` | number | |
| `lng` | number | |
| `mapbox_id` | string | 외부 place provider ID (v0.2.2 부터 Google Places `id` 저장. 같은 장소 재매칭용. 이름은 호환성 위해 유지) |
| `visit_status` | enum | `planned` / `visited` |
| `visited_date` | date | `visited` 일 때만. 호텔의 경우 stay_start 와 동일하게 저장 (호환성). `planned` 은 빈 값 |
| `rating_star` | integer | 1~5 정수. `visited` && 평가 있을 때만 |
| `rating_text` | string | 평가 서술 |
| `created_at` | ISO string | |
| `stay_start` | date | **v0.2.2 신규**. 호텔(`category='hotel'`) 의 체크인 날짜. 다른 카테고리는 빈 값 |
| `stay_end` | date | **v0.2.2 신규**. 호텔의 체크아웃 날짜. 빈 값이면 stay_start 1일만 |

**v0.2.2 마이그레이션**: 기존 13컬럼 시트는 Apps Script `ensureSheetWithHeader_` 가 자동으로 `stay_start`, `stay_end` 를 14, 15번 컬럼에 append. 기존 데이터는 깨지지 않음. 기존 호텔 행은 `visited_date` 만 있고 `stay_start/stay_end` 비어 있으므로 1일짜리로 동작 — 필요 시 시트에서 직접 채워주거나 편집 모달로 입력.

**호텔 필터 동작**: `visiblePlaces` 의 날짜 필터에서, 호텔은 `stay_start <= filter_date <= stay_end` 면 핀 표시. 다른 카테고리는 기존 `visited_date === filter_date` 로직 그대로.

**같은 도시 재방문 매칭** (Phase B에서 사용):
- 현재 trip 페이지를 열 때, 같은 `country_code` + `city_key`를 가진 **다른 trip들**의 `visit_status='visited'` places를 함께 가져와 회색 아이콘으로 지도에 표시.
- 같은 `mapbox_id`가 현재 trip의 places에도 있으면 (재방문 등록) → 회색 대신 유색 표시.
- **v0.2.2**: 검색 backend를 Google Places (New) 로 교체. `mapbox_id` 컬럼에는 Google `id` (예: `ChIJ...`) 가 저장됨. 컬럼 이름은 호환성 위해 유지.
- **마이그레이션 트레이드오프**: Mapbox 시절에 저장된 mapbox_id 와 새 Google place_id 는 매칭 안 됨. 따라서 같은 장소를 Mapbox 시절 다른 trip 에서 등록했고 이번에 Google 로 다시 등록하면, dedup 실패해 회색 핀 + 컬러 핀이 함께 표시될 수 있음. 사용자 시트의 기존 mapbox_id 데이터가 적다면 무시 가능.
- Mapbox id가 없는 케이스의 보조 매칭: 같은 도시 내에서 `lat`/`lng` 거리 < 50m + 이름 매칭. (미구현)

### 3-8. Travel ↔ Expense 연동 (메모 태깅)

Travel은 Expense 시트를 직접 보지 않는다. 대신:
- Travel에서 trip 추가 시 `trip_id`가 표시됨 (예: `tokyo-2026`)
- 사용자는 Expense에서 해당 여행 관련 거래의 메모에 `#tokyo-2026` 식으로 태그를 직접 입력
- Expense의 기존 "여행 타일 자동 집계" 기능이 이 태그를 인식해 합산

Travel 측은 합산 결과를 알 필요 없음. **여행 페이지 안에서 비용 표기는 Phase B에서 별도 결정** (옵션 A: Expense API 호출 / 옵션 B: 사용자가 수동 입력 / 옵션 C: 표기 안 함).

### 3-9. Expense `?mode=trip_summary&trip_id=X` — Session 8 신규

travel-trip 페이지가 trip-head 영역에 "여행 전체 비용 + 서브카테고리별 비중" 을 표시하기 위해 호출하는 엔드포인트. Travel ↔ Expense 메모 태깅 (§3-8) 의 집계 결과를 제공.

**호출 주체**: travel-trip.html (가족 OS 안에서 **다른 대시보드의 Apps Script 를 직접 호출하는 첫 사례**). LocalStorage `familyOS.webAppUrl.expense` 에서 URL 을 읽어 GET. URL 미설정 시 호출 자체 skip — UI 에 빈 row 가 사라지는 식.

**요청**:
```
GET {ExpenseWebAppUrl}?mode=trip_summary&trip_id=tokyo-2026&_=<cachebust>
```

**응답**:
```json
{
  "ok": true,
  "data": {
    "dashboard": "expense",
    "trip_id": "tokyo-2026",
    "total_krw": 4523000,
    "transaction_count": 47,
    "unsupported_currency_count": 0,
    "by_subcategory": [
      { "name": "항공", "amount_krw": 1800000, "pct": 39.8 },
      { "name": "숙박", "amount_krw": 1500000, "pct": 33.2 },
      { "name": "식비", "amount_krw": 850000,  "pct": 18.8 },
      { "name": "교통", "amount_krw": 200000,  "pct": 4.4 },
      { "name": "기타", "amount_krw": 173000,  "pct": 3.8 }
    ],
    "transactions": [
      { "date": "2026-08-01", "amount_krw": 350000, "subcategory": "항공" },
      { "date": "2026-08-01", "amount_krw": 120000, "subcategory": "식비" }
    ],
    "updated_at": "2026-05-20T08:00:00+09:00"
  }
}
```

**필드 규칙**:
- `total_krw`: 매칭된 거래의 KRW 환산 합계. 정수. 데이터 없으면 `0`.
- `transaction_count`: 매칭된 거래 수. 데이터 없으면 `0` (UI 측이 row 자체를 숨김).
- `unsupported_currency_count`: KRW/VND 외 통화로 0 처리된 거래 수. 사용자 카드사가 KRW 변환을 해주므로 정상이면 0. 0 이 아니면 UI 에 ⚠ 표시.
- `by_subcategory`: subcategory 단위 합산. **금액 내림차순 정렬.** `pct` 는 `total_krw` 대비, 소수점 1자리. 합 100 근사 (반올림 오차 허용). 데이터 없으면 빈 배열.
  - `name` 은 Expense 시트 `subcategory` 컬럼 값. 빈 값은 `"기타"` 로 대체.
  - 카테고리(`category`) 단위 합산이 아님 — UI 가 표시할 단위가 서브카테고리.
- `transactions`: **raw 거래 배열 (Session 8 부분 확장).** 프론트가 날짜별 필터/집계용으로 사용. `{date, amount_krw, subcategory}` 3필드만. `memo`/`merchant`/`person` 등은 사이즈/프라이버시 이유로 제외. `amount_krw` 는 이미 환산된 정수. 100건 미만 trip 가정. 매우 큰 trip 이면 응답 사이즈 부담 검토 필요 (현재 한계 미정).

**매칭 정책** (§3-8 의 메모 태깅 표준 준수):
- Expense 시트 `memo` 컬럼에 trip_id 가 **단어 경계** 안에 포함된 거래만 집계.
- 단어 경계 정규식: `(?:^|[^A-Za-z0-9_-])<tripId>(?:$|[^A-Za-z0-9_-])`
- 매칭 예:
  - `#tokyo-2026` ✅
  - `tokyo-2026` (단독) ✅
  - `도쿄여행 #tokyo-2026 점심값` ✅
  - `사케 #tokyo-2026,선물` ✅ (쉼표도 경계)
- 비매칭 예:
  - `tokyo-2026-extended` ❌ (뒤에 `-extended` 붙음)
  - `tokyo-20261` ❌ (뒤에 `1` 붙음)
- `category` 필터 X. 사용자가 trip_id 를 여행 거래에만 박는다는 전제 (§3-8 사용자 책임).

**환산 정책**:
- `toKRW()` 함수 재사용. KRW 는 그대로, VND 는 `amount / fxRate` (KRW→VND 환율, 외부 API + 6시간 캐시).
- **KRW/VND 외 통화는 0 으로 처리** (현재 한계). 사용자 카드사가 모든 외화를 KRW 로 변환해 제공하는 환경 가정. 다통화 확장 필요 시 별도 작업.

**에러**:
- `trip_id` 파라미터 누락 → `{ok: false, error: "trip_id 파라미터 필수"}`
- 그 외 에러는 envelope 의 `error` 필드에. HTTP 200 유지.

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
| `urgency` | `"info"` / `"warn"` / `"bad"` | 색 매핑 |
| `due` | ISO 날짜 또는 `null` | 마감일 |

---

## 5. Apps Script 코드 골격 (보일러플레이트)

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

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;
    const payload = body.payload || {};
    let result;
    switch (action) {
      case 'addTrip':    result = addTrip(payload); break;
      case 'updateTrip': result = updateTrip(payload); break;
      // ...
      default: throw new Error('Unknown action: ' + action);
    }
    return jsonResponse({ ok: true, data: result });
  } catch (err) {
    return jsonResponse({ ok: false, error: err.toString(), stack: err.stack });
  }
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
```

---

## 6. 메인 허브 호출 방식

```js
const url = localStorage.getItem('familyOS.webAppUrl.wealth');
const res = await fetch(`${url}?mode=summary&_=${Date.now()}`, { method: 'GET', redirect: 'follow' });
const json = await res.json();
if (!json.ok) throw new Error(json.error);
```

캐시 무효화를 위해 `_=${Date.now()}` 같은 cachebust 파라미터를 항상 붙임.

### 6-1. 메인 허브의 데이터 결합

Future 카드의 진행률은 두 응답을 결합해 계산:

```js
const retireValue = wealth.kpi.retirement_value_krw || 0;
const retireTarget = future.kpi.retirement_target_krw || 1500000000;
const progressPct = retireTarget > 0
  ? Math.min(100, (retireValue / retireTarget) * 100)
  : null;
```

Travel 카드는 단독 응답으로 충분 (결합 계산 없음).

---

## 7. 호환성 체크리스트 (새 대시보드 만들 때)

- [ ] `?mode=summary` 응답이 envelope 포맷 (`{ok, data:{dashboard, kpi, tasks, updated_at}}`)
- [ ] `data.dashboard`가 `"wealth"` / `"expense"` / `"health"` / `"future"` / `"travel"` 중 하나
- [ ] `kpi` 필드명이 섹션 3 정의와 정확히 일치
- [ ] `tasks` 배열의 각 항목이 `{id, label, urgency, due}` 4개 키 보유
- [ ] `updated_at`이 ISO 8601 문자열
- [ ] 에러 시에도 `{ok: false, error: "..."}` (HTTP 200으로)
- [ ] Write 작업은 `doPost` + `text/plain;charset=utf-8` 패턴
- [ ] **본인 시트만 읽음.** 결합은 메인 허브가 처리

---

## 8. 변경 이력

| 버전 | 시기 | 변경 |
|---|---|---|
| v0.1 | Session 1 | 최초 작성. 4개 대시보드 기본 envelope/kpi/tasks |
| v0.2 | Session 5 | Wealth `retirement_value_krw` 추가. Future `kpi` 5키로 재정의. Task 탭에 `마일스톤_금액` 컬럼 표준화. "본인 시트만 읽음" 원칙 명문화 |
| v0.3 | Session 6 | Travel 대시보드 정식 추가 (kpi/trips/places). 같은 도시 재방문 매칭 키(`country_code`+`city_key`) 명문화. Travel↔Expense 메모 태깅 패턴. `doPost`+`text/plain` 패턴을 spec 본문에 명시 |
| v0.4 | Session 8 | Expense `?mode=trip_summary&trip_id=X` 엔드포인트 추가 (§3-9). 단어 경계 매칭 정규식. cross-dashboard 호출 첫 사례 (travel-trip 이 Expense URL 호출). "본인 시트만 읽음" 원칙은 유지 — Travel 은 Expense 시트를 안 보고 Expense 의 API 만 호출. **부분 확장**: 응답에 raw `transactions[]` 배열 포함 (date/amount_krw/subcategory 3필드). travel-trip 사이드바의 날짜별 비용 표시용. |
