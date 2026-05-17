# Context: Travel 대시보드 작업

> Travel 작업 세션 시작 시 이 파일을 첨부할 것.
> Phase A (Session 6) + Phase B (Session 7) 완료. 추가 작업이 필요할 때 참조.

---

## 0. 첨부할 파일 (필수)

1. `worklog.md` (슬림 현재 상태)
2. `backend-spec.md` (v0.3)
3. `design-system.md`
4. `design-tokens.css`
5. `common.js`
6. **사용 중인 `travel.html`** (사용자 GitHub 에서)
7. **사용 중인 `travel-trip.html`**
8. **사용 중인 `travel-apps-script.gs`**
9. 이 파일 (`context-travel.md`)

---

## 1. 완료된 기능 정리 (참조용)

### Phase A (Session 6) — 메인 페이지

✅ `travel.html`
- 세계지도 SVG (equirectangular, 단순 대륙 outline 인라인)
- 동그라미 + 위아래 진동 역삼각형 마커
- 2열 그리드: 최근 / 향후 (각 PAGE_LIMIT=5)
- 여행 추가/편집/삭제 모달, OSM Nominatim 도시 검색
- 타일/마커 클릭 → `travel-trip.html?trip={id}` 로 navigate (Session 7 에서 변경)

✅ Apps Script `travel-apps-script.gs`
- 시트 자동 초기화 (`ensureSheets_`)
- doGet (summary/full) + doPost (addTrip/updateTrip/deleteTrip/addPlace/updatePlace/deletePlace)
- summary: `upcoming_count` + `upcoming_trips[]` 4개
- full: 전체 trips + 전체 places (클라이언트 필터링)

✅ 메인 허브 `index.html` — 5번째 카드 (가로 전체 span)

### Phase B (Session 7) — 개별 여행 페이지

✅ `travel-trip.html?trip={trip_id}`
- Mapbox GL JS v3 통합 (dark-v11 style)
- Token 입력 모달 (LocalStorage `familyOS.mapboxToken`)
- DOM 기반 Marker (원형 핀 + 카테고리별 내부 line-icon)
- 카테고리 10개: hotel/restaurant/cafe/mart/shop/beach/park/themepark/sight/other
- 방문장소 추가 모달:
  - Mapbox Search Box API (suggest + retrieve, session token 패턴)
  - 카테고리 선택 → 검색 → 좌표 자동
  - visited 일 때만: 방문일 / 별점(1~5) / 평가 텍스트 (별점·평가 둘 다 선택)
- 핀 3가지 상태:
  - `visited` (현재 trip): coral 채워짐
  - `planned` (현재 trip): coral 외곽선만
  - `other` (다른 trip 의 visited, 같은 도시): 회색 (재방문 단서)
- 같은 `mapbox_id` 재방문 등록 시 dedup (회색 위에 컬러 덮어쓰기)
- 다른 trip 회색 핀 클릭 → 정보 팝업만 (편집 불가)
- 방문일 필터: '전체' + 'planned' + 각 visited_date 칩
- 필터 변경 시 fitBounds 자동

### 시트 스키마

**`trips`** (13컬럼): `trip_id, display_name, status, period_start, period_end, members, country_code, city, city_key, center_lat, center_lng, zoom, created_at`

**`places`** (13컬럼): `place_id, trip_id, category, name, address, lat, lng, mapbox_id, visit_status, visited_date, rating_star, rating_text, created_at`

---

## 2. 알려진 한계 / 추후 hotfix 후보

| 항목 | 영향 | 우선순위 |
|---|---|---|
| **Travel↔Expense 비용 표기** | Phase B 는 수동. 자동화 미구현 | 중. 사용자 요청 시 hotfix |
| **Multi-city trip** | 모델은 trip=1도시 가정. 사용자가 "샌프란시스코, LA" 식 입력 시 부분 동작 | 중. 사용자 사용 패턴 봐가며 결정 |
| 세계지도 SVG 정밀도 부족 | 일본=점1개 등. 톤엔 충분 | 낮음 |
| OSM Nominatim 한국어 검색 | 영문이 더 안정적. 사용자 인식 필요 | 낮음 |
| 에러는 `alert()` | UX 거칢 | 중. toast 패턴 적용 후보 |
| trip_id 변경 거부 | 사용자가 typo 시 delete+add 필요 | 낮음 |
| 직접 좌표 입력 시 `mapbox_id` 없음 | 재방문 매칭 안 됨 (검색 통해 추가해야 매칭) | 낮음. 의도된 동작 |
| Marker 100개 이상 시 성능 | DOM marker 한계 | 낮음. 한 trip 이 100 장소 넘기 어려움 |
| Mapbox 한도 초과 청구 위험 | 사용자가 usage limit 설정 안 했으면 위험 | 사용자 작업 필요 |

---

## 3. 작업 시작 시 사용자에게 물어볼 만한 것 (작업별)

### 비용 자동화 작업 시

- 메인 허브 경유 결합 (Wealth↔Future 패턴) 으로 가도 OK 인지?
- Expense 측에 `#trip_id` 태깅이 실제로 잘 되어 있는지?
- 결합 결과를 어디에 표시? 여행 페이지 상단 메타? trip head?

### Multi-city 지원 작업 시

- 옵션 (a) 한 trip 에 cities 배열 (시트 컬럼 추가)
- 옵션 (b) trip 분할 가이드 (사용자가 직접 분할)
- 옵션 (c) trip 간 그룹 ID (`group_id` 컬럼 추가) — 묶음 표시
- 어느 쪽?

### 카테고리 확장 작업 시

현재 10개 외에 추가 후보:
- museum (박물관)
- spa (온천/스파)
- bar (바)
- airport (공항)
- station (역)

추가하려면 `CATEGORIES` 배열 + `catIconPath()` switch + spec §3-7 의 `category` enum 모두 갱신.

---

## 4. 자주 막힐 만한 트러블

| 증상 | 원인 / 해결 |
|---|---|
| travel-trip 페이지 열었는데 빈 화면 | URL 에 `?trip=` 빠짐. travel.html 에서 타일 클릭으로 진입 |
| 지도가 안 뜨고 token 모달 계속 | LocalStorage `familyOS.mapboxToken` 확인. F12 → Application → Local Storage |
| 지도 init 시 401/403 | token 잘못됨. travel-trip.html 안 코드가 자동 token 모달 재오픈 |
| 검색 결과 빈 채로 옴 | Mapbox 한도 초과 또는 token 권한 부족. dashboard.mapbox.com 에서 usage 확인 |
| 회색 핀이 안 보임 | 같은 country_code+city_key trip 이 없거나, 그 trip 의 places 가 모두 planned (visited 만 회색 표시) |
| 핀 추가 후 메인 허브 카드 안 갱신 | 메인 허브 새로고침 필요. 또는 ⟳ 버튼 |

---

## 5. 코드 위치 (수정 시)

| 작업 | 파일 / 위치 |
|---|---|
| 카테고리 추가 | `travel-trip.html` `CATEGORIES` 배열 + `catIconPath()` switch / Apps Script `CATEGORIES` 배열 / spec §3-7 |
| 핀 디자인 변경 | `travel-trip.html` `.pin`, `.pin-circle` CSS |
| 지도 style 변경 | `initMap()` 의 `style: 'mapbox://styles/mapbox/dark-v11'` |
| 검색 결과 개수 | `mapboxSuggest()` 의 `limit: '6'` |
| 필터 칩 정렬 | `renderFilterChips()` |
| 별점 단위 변경 (1~5 → 0.5) | `renderStars()` + `readPlaceModalPayload()` |
| 같은 도시 매칭 키 | `isSameCity()` (현재 country_code + city_key) |

---

## 6. 관련 컨벤션

- 시트 격리: Travel Apps Script 는 본인 시트만. Expense 는 사용자 수동 또는 메인 허브 결합
- POST 패턴: `text/plain;charset=utf-8` 필수
- Travel 의 `?mode=summary` 응답 = backend-spec §3-6 (변경 없음). full 응답은 자유 — 현재는 trips + places + categories
- 새 액션 추가 시 doPost switch 에 case 추가. 명명: `add*` / `update*` / `delete*`
