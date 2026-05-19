# Context: Travel 대시보드 작업

> Travel 작업 세션 시작 시 이 파일을 첨부할 것.
> Phase A (Session 6) + Phase B (Session 7) + Session 7.2 (가족 8명 / 호텔 stay_range / Google Places) + Session 7.3 (베이스맵 Mapbox→Google Maps 전체 교체 + v0.3.1 mapId hotfix) 완료.

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

### Session 7.5 — Travel 보강 ✅ 완료

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

### Session 7.6 — 베이스맵 Mapbox→Google Maps 전체 교체 ✅ 완료

**배경**: Session 7.2 후 사용자 대만여행 입력 → 핀-지도 mismatch 발견. 시트의 lat/lng 를 Google Maps 에 직접 입력하면 정확. → Mapbox dark-v11 베이스맵의 대만 지역 정확도 부족 확정. 베이스맵 전체 교체 결정.

✅ `travel-trip.html` (v0.2.2 → v0.3.0):
- **Mapbox GL JS 완전 제거**: lib import, CSS overrides, token 모달, `MAPBOX_TOKEN_KEY` 코드 참조 — 전부 제거. LocalStorage 키 (`familyOS.mapboxToken`) 자체는 롤백 대비 남겨둠 (코드는 안 봄)
- **Google Maps JavaScript API 도입**: 동적 lib 로드 (`maps.googleapis.com/maps/api/js?key=...&libraries=marker&v=weekly&callback=...`). key 있어야 로드 시작
- **AdvancedMarkerElement** 사용 (DOM 기반). 기존 `createPinElement()` 거의 그대로 재사용
- **InfoWindow**: 다른 trip 회색 핀의 정보 팝업 (Mapbox Popup 대체)
- **LatLngBounds + fitBounds**: 마커 자동 fit
- **다크 스타일**: JSON `styles` 배열로 design-tokens 색상 기반 단순 다크 톤. (Cloud-based mapId 는 추후)
- **API key 모달 통합**: 기존 "Google Places API Key" 모달이 이제 Maps + Places 공통. 라벨 갱신
- **픽킹 모드**: Google `addListener('click')` 패턴으로 변경. `e.latLng.lat()/lng()` 호출 (Google MapMouseEvent)
- **CSS 갱신**: `.mapboxgl-popup-*` → `.gm-style .gm-style-iw-*` InfoWindow override. `.map-picking` 셀렉터도 Google DOM 구조에 맞게 조정

✅ 사용자 사전 작업: Cloud Console 의 기존 프로젝트에 **Maps JavaScript API 추가 활성화**. 같은 API key 사용. Quota cap: Maps JavaScript API daily 100~300, Places API daily 100. HTTP referrer 제한.

✅ 비용: 가족 사용량 500/월 (초기) → 100/월. Maps JavaScript API 무료 한도 10,000/월. 실 청구 $0/월.

**부수 효과 (Session 7.5 hotfix)**:
- 모든 모달 button 에 `type="button"` 명시 (form 없는 환경에서도 표준 명시)
- 타일 클릭에 `setTimeout` navigate (가끔 첫 클릭 안 먹는 현상 안전망)
- `savePlace` 분리 (저장 성공 시에만 모달 닫고 loadAll. loadAll 실패해도 navigate 안 일어나게)
- 진단 로그 `[DIAG]` 박힘 (튕김 원인 별도 추적용)

### Session 7.6 v0.3.0 → v0.3.1 hotfix

**배경**: 배포 직후 사용자 보고:
1. "이 페이지에서 Google 지도를 제대로 로드할 수 없습니다" 알림창
2. 콘솔에 "유효한 지도 ID 없이 초기화되어 지도에서 고급 마커를 사용할 수 없습니다" 메시지 29회 (= 마커 개수)
3. 마커가 안 보임. 지도만 보임

**원인**: `AdvancedMarkerElement` 는 `mapId` 필수. v0.3.0 에서 `mapId` 누락 + `styles` 옵션만 줌. Google 이 마커 렌더링 실패하면서 알림창까지 띄움.

**해결 (v0.3.1)**:
- `initMap()` 에 `mapId: 'DEMO_MAP_ID'` 추가 (Google 공식 testing 용. production 권장 X 지만 가족 사용 범위에선 OK)
- 사용자 자체 mapId 가 LocalStorage `familyOS.googleMapId` 에 있으면 그것을 우선 사용
- `loadGoogleMaps()` 의 URL 에 `loading=async` 추가 (suboptimal performance 경고 해결)
- `styles` 옵션은 코드에 남아있지만 `mapId` 가 있으면 무시됨 (Google 사양)

**트레이드오프**: DEMO_MAP_ID 는 디폴트 라이트 스타일. 다크 톤 복구하려면 사용자가 Cloud Console 에서 자체 mapId 발급 + Map Style 다크 정의 → LocalStorage 저장. → Pending #9 로 등록

**검증**: 핀-지도 매칭 정확. 알림창 사라짐. 콘솔 경고 사라짐.

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

Session 7.5 로 이전 우선순위 3가지 작업 모두 완료. 새 작업은 사용자 사용 후 보고에 따라 결정.

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
| 지도 안 뜨고 API key 모달 반복 | LocalStorage `familyOS.googlePlacesKey` 미설정 또는 빈 값. AIza... 키 입력 |
| 지도 init 시 "Google Maps 로드 실패" | 1) API key 에 **Maps JavaScript API** 활성화 누락 (Places 만 있음) → Cloud Console 에서 활성화 / 2) HTTP referrer 제한이 현재 도메인 차단 / 3) 네트워크 차단 |
| 지도 회색 배경 + RefererNotAllowedMapError | referrer 제한 잘못. Cloud Console 의 API key 설정에서 GitHub Pages 도메인 추가 |
| 첫 검색에서 "API key" 입력 모달 | 정상. AIza... 키 입력. Maps + Places 같은 key 사용 |
| 검색 결과 빈 채로 옴 | 1) key 인증 실패 → "재설정" / 2) 도시 30km 반경 밖 → 큰 검색어 / 3) Places API daily quota 초과 → 다음날 복구 또는 지도 클릭 폴백 |
| 결과 클릭해도 좌표 안 채워짐 | Place Details 호출 실패. console 확인. 보통 fieldMask 잘못 또는 key 권한 |
| 회색 핀 안 보임 | 1) 같은 country_code+city_key 다른 trip 없음 / 2) 다른 trip places 가 모두 planned (visited 만 회색) / 3) Mapbox 시절 mapbox_id 와 Google place_id 불일치 |
| 호텔 핀이 일자 칩에 안 보임 | stay_start/stay_end 누락. 모달 편집으로 채우거나 시트 직접 수정 |
| 핀 추가 후 메인 허브 카드 안 갱신 | 메인 허브 새로고침 또는 ⟳ 버튼 |
| 지도 클릭 폴백 안 됨 | crosshair 커서 안 뜸 → CSS 적용 확인. ESC 로 취소 후 재시도 |
| 시트에 stay_start/stay_end 컬럼 없음 | 첫 doGet/doPost 호출 시 `ensureSheets_` 가 자동 추가. 안 되면 수동으로 14·15번 컬럼에 헤더만 입력 |
| 페이지 튕김 (드물게) | F12 Console 의 `[DIAG]` 로그 캡쳐. 진단용 로그가 v0.2.2 hotfix 로 박혀있음 |
| 콘솔에 share-modal.js 또는 다른 외부 .js 의 TypeError | 사용자가 설치한 브라우저 확장 프로그램의 content script. 우리 페이지 코드와 무관. Sources → "Content scripts" 그룹에 확인. 무시하거나 해당 확장 비활성화 |
| 콘솔에 "Tracking Prevention blocked access to storage..." | Edge 브라우저의 추적 차단. 단순 경고. 무시 가능 |
| 라이트(밝은) 지도 톤 | v0.3.1 의 DEMO_MAP_ID 가 디폴트 라이트. 다크 톤 원하면 Cloud Console 에서 자체 Map ID + Map Style 만든 후 LocalStorage `familyOS.googleMapId` 에 저장 |
| "이 페이지에서 Google 지도를 제대로 로드할 수 없습니다" 알림창 | v0.3.1 부터 mapId 추가로 해결. 만약 다시 발생하면 빨간 콘솔 에러 (Google Maps JavaScript API error: ...) 확인 — BillingNotEnabled / InvalidKey / RefererNotAllowed / ApiNotActivated 중 하나 |

---

## 5. 코드 위치 (수정 시)

| 작업 | 파일 / 위치 |
|---|---|
| 가족 멤버 변경 | `travel.html` `FAMILY_MEMBERS` 배열 |
| 카테고리 추가 | `travel-trip.html` `CATEGORIES` + `catIconPath()` / Apps Script `CATEGORIES` / spec §3-7 |
| 핀 디자인 | `travel-trip.html` `.pin`, `.pin-circle` CSS |
| 지도 다크 스타일 | `travel-trip.html` `DARK_MAP_STYLES` 배열 (Google Maps JSON styles) |
| 지도 lib 로드 옵션 | `loadGoogleMaps()` 의 `libraries=marker&v=weekly` |
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
- 외부 API key 패턴: LocalStorage `familyOS.{name}`. 현재는 `googlePlacesKey` 만 활성 사용 (Maps + Places 공통). `mapboxToken` 은 deprecated

---

## 7. v0.3.1 배포 가이드 (사용자용)

### 적용 완료 사항 (v0.3.1 기준)

이 버전을 GitHub Pages 에 올린 직후 다음 순서로 점검:

1. **Google Cloud Console**:
   - 기존 프로젝트에 **Maps JavaScript API** 활성화 (Places API 와 같은 프로젝트)
   - Quotas → "Maps JavaScript API" daily limit **100~300** 설정
   - API key 의 HTTP referrer 제한 GitHub Pages 도메인 포함
   - API key 는 같은 것 재사용 (LocalStorage `familyOS.googlePlacesKey`)
2. **Apps Script 재배포** — 변경 없음. Session 7.2 와 동일이면 skip
3. **travel-trip.html 첫 접속 검증**:
   - 지도 로드. Mapbox token 모달 더 이상 안 뜸
   - 핀이 정확한 위치에 박힘 (대만 정확도 OK)
   - 알림창 안 뜸
   - 콘솔에 "유효한 지도 ID 없이..." 메시지 안 보임
4. **무시 가능한 경고**:
   - "Tracking Prevention blocked access to storage" — Edge 추적 차단
   - 외부 확장 프로그램(share-modal.js 등) 의 TypeError — 우리 코드 무관

### 다크 톤 복구 (선택 사항, Pending #9)

v0.3.1 은 `DEMO_MAP_ID` 사용 → Google 디폴트 라이트 스타일. 다크 톤 복구하려면:

1. **Cloud Console** → "Map Management" (또는 검색: "Map Styles")
2. "Create Map ID" → Map Type: **JavaScript**, Vector 선택 → ID 발급 받음 (`abc123def...`)
3. "Map Styles" → "Create new style" → 다크 톤 직접 디자인 (또는 import) → 위 mapId 에 연결
4. 발급된 mapId 를 LocalStorage 에 저장:
   - travel-trip.html 열고 F12 → Console:
     ```js
     localStorage.setItem('familyOS.googleMapId', '발급받은_mapId')
     ```
5. 새로고침 → 다크 톤 적용

### Mapbox 정리 (선택)

- LocalStorage `familyOS.mapboxToken` 자동 안 지워짐. 더 이상 사용 안 함
- Mapbox 계정 자체는 무료라 그대로 둬도 청구 안 됨
- 깔끔 정리: F12 → Application → Local Storage → `familyOS.mapboxToken` 삭제
