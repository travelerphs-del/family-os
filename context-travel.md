# Context: Travel 대시보드 작업

> Travel 작업 세션 시작 시 이 파일을 첨부할 것.
> Phase A 는 Session 6 에서 완료. 다음은 Phase B (개별 여행 페이지).

---

## 0. 첨부할 파일 (필수)

1. `worklog.md` (슬림 현재 상태)
2. `backend-spec.md` (v0.3, Travel kpi/스키마 포함)
3. `design-system.md`
4. `design-tokens.css`
5. `common.js`
6. **현재 사용 중인 `travel.html`** (Phase A 산출물. 사용자 GitHub 에서 가져오기)
7. **현재 사용 중인 `travel-apps-script.gs`**
8. 이 파일 (`context-travel.md`)

선택: 사용자가 수정/조정한 부분이 있다면 그 변경 사항 메모

---

## 1. Phase A 정리 (이미 된 것)

✅ 메인 페이지 (`travel.html`)
- 세계지도 SVG (equirectangular projection, 단순 대륙 outline 인라인)
- 동그라미 + 위아래 진동 역삼각형 마커 (`@keyframes markerBob`)
- 2열 그리드: 최근 여행 / 향후 여행 (각 컬럼에 PAGE_LIMIT=5 + 더 보기)
- 여행 추가/편집/삭제 모달 (status 토글, 멤버 multi-select, OSM Nominatim 도시 검색)

✅ Apps Script
- 시트 자동 초기화 (`ensureSheets_`)
- 6 액션: addTrip / updateTrip / deleteTrip / addPlace / updatePlace / deletePlace
- summary 페이로드: `upcoming_count` + `upcoming_trips[]` 최대 4개
- full 페이로드: 전체 trips + 전체 places (Phase B 에서 클라이언트가 필터링)

✅ 메인 허브 (`index.html`) — 5번째 카드 추가
- `data-id="travel"` article
- 가로 전체 span (`grid-column: 1 / -1`) — 비대칭
- 4슬롯 2x2 (도시명 + planned 수 칩)
- 빈 슬롯은 점선 + "+ 여행 추가"
- 정렬: period_start 가까운 미래순 → null → created_at 최신순

✅ 시트 스키마
- `trips` (13컬럼): trip_id / display_name / status / period_start / period_end / members / country_code / city / city_key / center_lat / center_lng / zoom / created_at
- `places` (13컬럼): place_id / trip_id / category / name / address / lat / lng / mapbox_id / visit_status / visited_date / rating_star / rating_text / created_at

---

## 2. Phase B 작업 범위 (이번 세션 목표)

### 핵심: 개별 여행 페이지

URL: `travel.html?trip={trip_id}` (Phase A travel.html 과 같은 파일이지만 query 가 있으면 다른 뷰)

또는: 별도 파일 `travel-trip.html`? — 결정 필요

**페이지 구조 (사용자 명세)**:
1. 메인 영역: Mapbox 지도 (선택 trip 의 center_lat/lng, zoom 으로 초기화)
2. 처음엔 도시 또는 지방 레벨로 보임 (Phase A 에서 사용자가 zoom 선택)
3. 방문장소 추가 버튼 → 팝업 모달
4. 모달 안: 카테고리 선택 → Mapbox 검색 (해당 도시 안에서) → 결과 선택 → 방문일/평가 입력 → 저장
5. 저장된 장소는 카테고리별 아이콘 핀으로 지도에 표시
6. 페이지 상단: 전체/입력된 각 방문일 선택 가능. 선택 시 지도 자동 fit-to-bounds

### 카테고리 10개

`hotel` / `restaurant` / `cafe` / `mart` / `shop` / `beach` / `park` / `themepark` / `sight` / `other`

각 카테고리에 SVG 아이콘 디자인 필요. coral 톤 (`--acc-travel`) 사용. 회색 톤 (`--text-quiet`) 도 같은 모양으로.

### 별점·평가

- 별점: 1~5 정수만 (0.5 단위 X)
- 평가 텍스트: textarea
- 둘 다 visited 일 때만. planned 은 없음

### 같은 도시 재방문 시각화

1. 현재 trip 의 places + 같은 `country_code + city_key` 의 **다른 trip 들의 `visit_status='visited'` places** 함께 표시
2. 다른 trip 의 places = **회색 아이콘**
3. 현재 trip 의 places = **카테고리 컬러 (coral 톤 변형)**
4. 같은 `mapbox_id` 가 양쪽에 있으면 = **회색 위에 컬러 덮어쓰기** (재방문 등록됨)

### planned vs visited (upcoming vs past trip)

- **past trip** 페이지: 새 장소 추가 시 자동 `visit_status='visited'`. visited_date / 평가 입력
- **upcoming trip** 페이지: 새 장소 추가 시 자동 `visit_status='planned'`. visited_date / 평가 입력 X
- 둘 다 같은 페이지 컴포넌트 재사용. 모달이 status 에 따라 필드 표시/숨김

### 방문일 필터

- 페이지 상단에 칩 row: "전체" / "8/1" / "8/2" / "8/3" ...
- 칩 클릭 시 해당 날짜에 visited_date 가 일치하는 places 만 보임
- planned places 는 "전체" 에서만 보임
- 지도 자동 zoom 조정 (`fitBounds(visible_places)`)

---

## 3. Phase B 진입 전 결정 필요 (사용자에게 물어볼 것)

### Q1. Mapbox access token 발급 받았는지?

- mapbox.com 가입 → Account → Tokens → "Default public token" 복사
- 무료 한도: 50K map loads, 100K geocoding/월
- 카드 등록 불필요
- LocalStorage 키: `familyOS.mapboxToken` (제안)

### Q2. URL 구조

옵션 A: 같은 `travel.html?trip={id}` (SPA. 페이지 로드 1번, JS 로 뷰 전환)
옵션 B: 별도 `travel-trip.html?trip={id}` (페이지 분리. 더 단순. 메인 페이지 영향 X)

**추천: 옵션 B** — Phase A 의 메인 페이지 코드를 안 건드림. 두 페이지 각자 독립적으로 진화 가능. 단점: 브라우저 캐시 분리.

### Q3. Travel ↔ Expense 비용 표기

**옵션 A**: 여행 페이지 안에서 Expense API 호출 → `?mode=full` 에 `#{trip_id}` 메모 매칭으로 합산 → 표기
- 장점: 자동. 사용자가 별도 입력 안 해도 됨
- 단점: spec 의 "본인 시트만 읽음" 원칙 위반 → 메인 허브 경유로 우회 가능
- 단점: Expense URL 도 입력해야 작동

**옵션 B**: 여행 페이지에 사용자가 수동 입력 (총 비용 칸)
- 장점: 단순, spec 위반 X
- 단점: 이중 입력

**옵션 C**: 표기 안 함. Expense 의 여행 타일에서만 보기
- 장점: 가장 단순
- 단점: 여행 회상 페이지에 비용 정보 없음

**추천: A**. 사용자 본인 의도와 일치 (Phase 0 대화에서 "expense 와 연동" 명시함). spec 원칙은 "메인 허브가 결합" 으로 우회 — 메인 허브가 양쪽 데이터 합쳐 LocalStorage 캐싱하고 travel 페이지가 그걸 읽는 방식.
**대안**: B 로 시작하고, 나중에 자동화. Phase B 토큰 비용 우려.

### Q4. 카테고리 아이콘 — 디자인 통일 방향

- 옵션 (a) Lucide / Feather 류의 line-icon 통일 (단순, 깔끔)
- 옵션 (b) 카테고리마다 의미적 모양 (호텔=침대, 식당=포크나이프, 카페=커피잔...)
- 옵션 (c) 통일된 핀 모양 + 안에 카테고리 글자/이니셜

**추천: (a) + (c) 혼합** — 핀 외곽은 통일, 내부에 line-icon 1개. coral 톤 + 카테고리별 미세한 색조 변화.

### Q5. visited 의 별점·평가 입력은 필수인가?

- visited 로 저장은 되지만 별점·평가는 선택? 또는 visited = 필수 별점?
- **추천**: 둘 다 선택. 사용자가 나중에 채울 수 있게

### Q6. 방문일 입력 — 모달에서 어떻게?

- date input 1개 (간단)
- date input + "오늘로 채우기" 버튼
- 여행 기간 (period_start ~ period_end) 안의 날짜만 선택 가능하게 제약?

**추천**: 자유 date input + period 안내 텍스트. 제약은 사용자가 답답할 수 있음.

---

## 4. 알려진 Phase A 한계 / 개선 후보 (Phase B 와 별개로)

| 항목 | 영향 | 우선순위 |
|---|---|---|
| 세계지도 SVG 정밀도 부족 (일본=점 1개 등) | 시각적 디테일 떨어짐 | 낮음. 톤엔 충분 |
| OSM Nominatim 한국어 검색 정확도 | "도쿄" 보다 "Tokyo" 가 안정적 | 낮음 |
| 에러는 `alert()` 사용 | UX 거칢 | 중. toast 패턴 적용 검토 |
| trip_id 변경 거부 (편집 시) | 사용자가 typo 하면 delete+add 해야 | 낮음. 사용자 합의 |
| OSM API rate limit (1 req/sec) | 가족 한 명이 동시 검색 안 함 → 무관 | 낮음 |
| 마커 그룹화 단순 (city 단위) | 같은 도시 N번 방문도 마커 하나 | 의도된 동작 |

---

## 5. 작업 시작 시 Claude 가 사용자에게 던질 첫 메시지 예시

```
Phase B 시작 전에 5가지 확인할게:

1. Mapbox access token 발급받았어? (mapbox.com → Account → Tokens)
2. 개별 여행 페이지 URL 구조: 같은 travel.html?trip=... (A) vs 별도 travel-trip.html (B)?
   → 내 추천은 B (메인 페이지 안 건드림)
3. Travel ↔ Expense 비용 표기: 자동 (A) vs 수동 (B) vs 표기 안 함 (C)?
   → 내 추천은 B 로 시작 (Phase B 토큰 절약), 나중에 자동화
4. 카테고리 아이콘: 통일된 핀 + line-icon (a), 의미적 모양 (b), 핀+이니셜 (c)?
   → 내 추천은 (a)+(c) 혼합
5. visited 의 별점·평가는 둘 다 선택 입력? → 그렇다고 가정해도 OK?

답 주면 바로 시작.
```

---

## 6. 산출물 예상 (Phase B)

| 파일 | 줄수 예상 | 종류 |
|---|---|---|
| `travel-trip.html` 또는 `travel.html` 확장 | 1500~2200 줄 | HTML+CSS+JS (Mapbox 통합) |
| `travel-apps-script.gs` 수정 (`?mode=trip&trip_id=...` endpoint 추가?) | ~50 줄 추가 | Apps Script |
| `worklog.md` 업데이트 | (슬림) | 문서 |
| `worklog-archive.md` Session 7 추가 | (누적) | 문서 |
| `context-travel.md` 갱신 | (이 파일 일부 정리) | 문서 |

토큰 비용: Phase A 와 비슷~약간 더 (Mapbox 코드, 검색 자동완성, 9+1 카테고리 아이콘 SVG, 별점 컴포넌트, 필터 칩 모두 합쳐서).

---

## 7. 관련 컨벤션 재확인

- 시트 격리: Travel Apps Script 는 본인 시트만. Expense 시트 안 본다. 비용 연동은 메인 허브 또는 사용자 수동
- POST 패턴: `text/plain;charset=utf-8` 필수
- Travel 도 `?mode=summary` 응답은 backend-spec §3-6 그대로 (변경 없음). full 응답은 자유 형식 — Phase A 이미 정의 (trips + places)
- 새 액션 추가 시 doPost switch 에 case 추가. 액션 명명: `add*` / `update*` / `delete*` 패턴
