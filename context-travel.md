# Context: Travel 대시보드 작업

> Travel 작업 세션 시작 시 이 파일을 첨부할 것.
> Phase A (Session 6) + Phase B (Session 7) + Session 7.2 (보강) 완료.

---

## 0. 첨부할 파일 (필수)

1. `worklog.md` (슬림 현재 상태)
2. `backend-spec.md`
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
- 타일/마커 클릭 → `travel-trip.html?trip={id}`

✅ Apps Script `travel-apps-script.gs`
- 시트 자동 초기화 (`ensureSheets_`) — v0.2.2 에서 자동 마이그레이션 (누락 컬럼 자동 추가)
- doGet (summary/full) + doPost (addTrip/updateTrip/deleteTrip/addPlace/updatePlace/deletePlace)
- summary: `upcoming_count` + `upcoming_trips[]` 4개
- full: 전체 trips + 전체 places (클라이언트 필터링)

✅ 메인 허브 `index.html` — 5번째 카드 (가로 전체 span)

### Phase B (Session 7) — 개별 여행 페이지

✅ `travel-trip.html?trip={trip_id}`
- Mapbox GL JS v3 통합 (dark-v11 style)
- Token 입력 모달 (LocalStorage `familyOS.mapboxToken`)
- DOM 기반 Marker (원형 핀 + 카테고리별 line-icon)
- 카테고리 10개: hotel/restaurant/cafe/mart/shop/beach/park/themepark/sight/other
- 핀 3가지 상태: visited (coral 채워짐) / planned (외곽선) / other-trip (회색)
- 같은 mapbox_id 재방문 dedup
- 방문일 필터 칩 — fitBounds 자동

### Session 7.2 — Travel 보강 ✅ 완료

✅ **가족 멤버 8명** (`travel.html`)
- `FAMILY_MEMBERS = ['아빠', '엄마', '도비', '로비', '할머니', '할아버지', '외할머니', '외할아버지']`
- Travel 에서만 사용. Health 시스템 (`dad/mom/son1/son2`) 은 변경 X

✅ **호텔 stay_range**
- `places` 시트 15컬럼 (`stay_start`, `stay_end` 가 `created_at` 뒤에 14·15번째)
- `ensureSheetWithHeader_` 가 기존 13컬럼 시트에 자동으로 컬럼 2개 추가 (마이그레이션 무중단)
- 호텔이면 모달에 `stay_start ~ stay_end` 2개 입력, 다른 카테고리는 `visited_date` 1개
- 필터 칩: 호텔 stay 기간 모든 날짜에 핀 노출
- 호텔의 visited_date 는 stay_start 와 동일하게 자동 저장 (이전 코드 호환)
- 최대 60박 제한 (오타 폭주 방지)

✅ **Google Places (New) 통합 + 지도 클릭 폴백**
- 검색 backend: Mapbox Search Box → **Google Places (New) Autocomplete + Place Details**
- 이유: Mapbox 동아시아 POI 부족 (대만/한국/일본). Google 강함
- API key 저장: `localStorage.familyOS.googlePlacesKey` (Mapbox 토큰과 별도 모달)
- fieldMask 로 Essentials SKU 만 사용 (가장 저렴)
- sessionToken 공유 → Autocomplete + Details = 1 session billing
- 검색 결과 0개일 때: "결과 없음. 지도에서 직접 선택해 보세요." 안내
- 401/403 인증 실패 시: "API key 재설정" 버튼 노출
- **지도 클릭 폴백**: "지도에서 직접 선택" 버튼 → 모달 임시 닫고 crosshair 커서 + sticky 안내 배너 → 클릭 시 좌표 캡쳐 → 모달 재오픈 (좌표 채워진 상태). 이름은 사용자 직접 입력. mapbox_id 빈 값
- ESC 로 픽킹 모드 취소

### 시트 스키마 (v0.2.2)

**`trips`** (13컬럼, 변경 없음):
`trip_id, display_name, status, period_start, period_end, members, country_code, city, city_key, center_lat, center_lng, zoom, created_at`

**`places`** (15컬럼):
`place_id, trip_id, category, name, address, lat, lng, mapbox_id, visit_status, visited_date, rating_star, rating_text, created_at, stay_start, stay_end`

> `mapbox_id` 컬럼명은 호환성 위해 유지하지만 v0.2.2 부터는 Google `id` 값 저장.

---

## 2. 알려진 한계 / 추후 hotfix 후보

| 항목 | 영향 | 우선순위 |
|---|---|---|
| **mapbox_id 에 Google place_id 저장 (컬럼명 호환)** | Mapbox 시절 등록 데이터와 Google 신규 데이터 사이엔 dedup 매칭 안 됨. 기존 데이터 적으면 무시 가능 | 낮음 |
| **호텔이 아닌 카테고리의 다중-일자 처리** | "관광지를 2일에 걸쳐 둘러봤다" 같은 케이스. 동일 장소 2번 등록으로 우회 | 낮음 |
| Travel↔Expense 비용 표기 | 수동 입력 | 중. 사용자 요청 시 hotfix |
| Multi-city trip | 모델은 trip=1도시 가정. fit-to-bounds 로 부분 동작 | 낮음 |
| 에러는 `alert()` | UX 거칢 | 중. toast 패턴 후보 |
| trip_id 변경 거부 | typo 시 delete+add 필요 | 낮음 |
| 지도 클릭 폴백 시 mapbox_id 없음 | 재방문 매칭 안 됨 | 낮음. 의도된 동작 |
| Google Places key 노출 위험 | LocalStorage 평문. referrer 제한 + daily quota cap (100/일) 으로 보호. 청구 절대 안 발생 | 낮음. 클라이언트 사이드 한계 |

---

## 3. 다음 세션 작업 — 사용자 결정 필요

Session 7.2 로 이전 우선순위 3가지 작업 모두 완료. 새 작업은 사용자 사용 후 보고에 따라 결정.

후보 (위 §2 표 우선순위 순):
- Travel↔Expense 비용 표기 자동화 (메인 허브 결합 캐싱)
- alert() → toast 패턴
- Multi-city trip 정식 지원 (데이터 모델 보강)

각 작업은 별도 세션이 적절.

---

## 4. 자주 막힐 만한 트러블

| 증상 | 원인 / 해결 |
|---|---|
| travel-trip 페이지 빈 화면 | URL 에 `?trip=` 빠짐. travel.html 타일 클릭으로 진입 |
| 지도 안 뜨고 token 모달 반복 | LocalStorage `familyOS.mapboxToken` 확인 |
| 지도 init 시 401/403 | Mapbox token 잘못됨. 자동 token 모달 재오픈 |
| 첫 검색에서 "API key" 입력 모달 | 정상. LocalStorage `familyOS.googlePlacesKey` 미설정. AIza... 키 입력 |
| 검색 결과 빈 채로 옴 | 1) key 인증 실패 → "재설정" 버튼 / 2) 도시 30km 반경 밖 → 좀더 큰 검색어 / 3) 한도 100/일 초과 → 청구 안 됨, 다음날 복구 또는 지도 클릭 폴백 사용 |
| 결과 클릭해도 좌표 안 채워짐 | Place Details 호출 실패. console 확인. 보통 fieldMask 잘못 또는 key 권한 |
| 회색 핀 안 보임 | 1) 같은 country_code+city_key 다른 trip 없음 / 2) 다른 trip places 가 모두 planned (visited 만 회색) / 3) Mapbox 시절 mapbox_id 와 Google place_id 불일치 |
| 호텔 핀이 일자 칩에 안 보임 | stay_start/stay_end 누락. 모달 편집으로 채우거나 시트 직접 수정 |
| 핀 추가 후 메인 허브 카드 안 갱신 | 메인 허브 새로고침 또는 ⟳ 버튼 |
| 지도 클릭 폴백 안 됨 | crosshair 커서 안 뜸 → CSS 적용 확인. ESC 로 취소 후 재시도 |
| 시트에 stay_start/stay_end 컬럼 없음 | 첫 doGet/doPost 호출 시 `ensureSheets_` 가 자동 추가. 안 되면 수동으로 14·15번 컬럼에 헤더만 입력 |

---

## 5. 코드 위치 (수정 시)

| 작업 | 파일 / 위치 |
|---|---|
| 가족 멤버 변경 | `travel.html` `FAMILY_MEMBERS` 배열 |
| 카테고리 추가 | `travel-trip.html` `CATEGORIES` + `catIconPath()` / Apps Script `CATEGORIES` / spec §3-7 |
| 핀 디자인 | `travel-trip.html` `.pin`, `.pin-circle` CSS |
| 지도 style | `initMap()` 의 `mapbox://styles/mapbox/dark-v11` |
| 검색 반경 | `googleSuggest()` 의 `radius: 30000.0` (30km) |
| 검색 결과 개수 | Google Autocomplete 기본 응답 (최대 5개, 사용자 변경 불가) |
| Google Places 필드 | `googleSuggest`/`googleDetails` 의 `X-Goog-FieldMask` |
| 필터 칩 정렬 | `renderFilterChips()` |
| 호텔 최대 박수 | `expandStayRange()` 의 `maxDays = 60` |
| 별점 단위 변경 | `renderStars()` + `readPlaceModalPayload()` |
| 같은 도시 매칭 키 | `isSameCity()` (country_code + city_key) |

---

## 6. 관련 컨벤션

- 시트 격리: Travel Apps Script 는 본인 시트만. Expense 는 메인 허브 결합
- POST 패턴: `text/plain;charset=utf-8` 필수
- `?mode=summary` 응답 = backend-spec §3-6 (변경 없음). full 응답은 자유
- doPost 액션 명명: `add*` / `update*` / `delete*`
- 시트 스키마 컬럼 추가: PLACES_HEADERS 끝에 append. `ensureSheetWithHeader_` 가 자동 마이그레이션. 기존 컬럼 위치 절대 안 바꿈
- 외부 API key 패턴: LocalStorage `familyOS.{name}` (mapboxToken, googlePlacesKey)

---

## 7. v0.2.2 배포 가이드 (사용자용)

이 버전을 GitHub Pages 에 올린 직후 다음 순서로 점검:

1. **Apps Script 재배포** — travel-apps-script.gs 새 버전. 새 배포 발급 → Web App URL 메인 허브 설정 모달에 갱신. 첫 doGet 호출 시 `places` 시트에 `stay_start`, `stay_end` 자동 추가됨
2. **Google Places API key 발급 + 설정**:
   - console.cloud.google.com → 새 프로젝트 → 결제 정보 등록
   - APIs & Services → Library → "Places API (New)" 활성화
   - APIs & Services → Quotas → "Places API" daily limit **100** 설정 (청구 방지)
   - APIs & Services → Credentials → API key 생성 → HTTP referrer 제한 (GitHub Pages 도메인만)
3. **travel-trip.html 첫 접속**:
   - 기존 Mapbox token 모달 (지도용) → 이미 저장된 토큰 그대로
   - 첫 검색 시 Google Places API key 모달 → AIza... 입력
   - 이후엔 키 재입력 불필요
4. **기존 호텔 데이터 마이그레이션**:
   - 기존에 호텔로 등록한 행이 있다면 places 시트 14·15번 컬럼 (`stay_start`, `stay_end`) 가 비어 있음
   - 그대로 두면 stay_start 가 비어서 필터 칩에 안 나옴
   - 모달 편집 열어서 stay_start/stay_end 입력하거나 시트 직접 수정
5. **재방문 dedup 트레이드오프 인지**:
   - Mapbox 시절 등록된 mapbox_id 값과 Google place_id 값은 매칭 안 됨
   - 같은 장소를 Google 로 다시 등록하면 회색 + 컬러 핀 둘 다 보일 수 있음
   - 이전 데이터가 적다면 무시
