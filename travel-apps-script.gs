/**
 * =====================================================================
 * Family OS — Travel Apps Script
 * =====================================================================
 *
 * 5번째 서브 대시보드. trips 탭 + places 탭의 2-시트 구조.
 *
 * 응답 포맷: backend-spec.md v0.3 §3-6 / §3-7 준수.
 *
 * 배포:
 *   1. 새 Google Spreadsheet 만들고 시트 ID 메모
 *   2. 탭 2개 생성: 'trips', 'places' (둘 다 비어 있어도 됨)
 *   3. script.google.com → 새 프로젝트 → 이 파일 내용 전체 복사 → Code.gs
 *   4. 아래 SHEET_ID 상수에 1단계 ID 입력
 *   5. debug_summary 실행 → 권한 허용 → 응답 확인
 *   6. 배포 > 새 배포 > 웹앱 > 액세스: 모든 사용자
 *   7. 발급된 /exec URL을 메인 허브 설정 모달의 'Travel' 칸에 입력
 *
 * 시트 스키마는 첫 doGet 또는 첫 doPost 호출 시 자동 초기화 (헤더 자동 삽입).
 *
 * =====================================================================
 */

// ─────────────────────────────────────────────────────────────────────
// 1. 메타 설정 (필수 변경)
// ─────────────────────────────────────────────────────────────────────

const DASHBOARD_ID = 'travel';

// TODO: 새 스프레드시트 ID로 변경
const SHEET_ID = '';

const SHEET_NAMES = {
  trips:  'trips',
  places: 'places'
};

// 시트 헤더 정의 (없으면 자동 삽입)
const TRIPS_HEADERS = [
  'trip_id', 'display_name', 'status',
  'period_start', 'period_end', 'members',
  'country_code', 'city', 'city_key',
  'center_lat', 'center_lng', 'zoom',
  'created_at'
];

// 주의: stay_start/stay_end 는 v0.2.2 (Session 7.2) 추가. 기존 시트 마이그레이션
// 안전성을 위해 created_at 뒤(14, 15)에 append. 새로 만드는 시트도 같은 순서.
const PLACES_HEADERS = [
  'place_id', 'trip_id', 'category',
  'name', 'address', 'lat', 'lng',
  'mapbox_id',
  'visit_status', 'visited_date',
  'rating_star', 'rating_text',
  'created_at',
  'stay_start', 'stay_end'
];

const CATEGORIES = [
  'hotel', 'restaurant', 'cafe', 'mart', 'shop',
  'beach', 'park', 'themepark', 'sight', 'other'
];


// ─────────────────────────────────────────────────────────────────────
// 2. 진입점
// ─────────────────────────────────────────────────────────────────────

function doGet(e) {
  try {
    ensureSheets_();
    const mode = (e && e.parameter && e.parameter.mode) || 'full';
    let data;
    if (mode === 'summary')      data = buildSummaryPayload();
    else if (mode === 'full')    data = buildFullPayload();
    else throw new Error('Unknown mode: ' + mode);
    return jsonResponse({ ok: true, data: data });
  } catch (err) {
    return jsonResponse({ ok: false, error: err.toString(), stack: err.stack || null });
  }
}

function doPost(e) {
  try {
    ensureSheets_();
    const body = JSON.parse(e.postData.contents);
    const action = body.action;
    const payload = body.payload || {};
    let result;
    switch (action) {
      case 'addTrip':       result = addTrip_(payload);       break;
      case 'updateTrip':    result = updateTrip_(payload);    break;
      case 'deleteTrip':    result = deleteTrip_(payload);    break;
      case 'addPlace':      result = addPlace_(payload);      break;
      case 'updatePlace':   result = updatePlace_(payload);   break;
      case 'deletePlace':   result = deletePlace_(payload);   break;
      default: throw new Error('Unknown action: ' + action);
    }
    return jsonResponse({ ok: true, data: result });
  } catch (err) {
    return jsonResponse({ ok: false, error: err.toString(), stack: err.stack || null });
  }
}


// ─────────────────────────────────────────────────────────────────────
// 3. Summary — 메인 허브용
// ─────────────────────────────────────────────────────────────────────

function buildSummaryPayload() {
  const trips = readSheetAsObjects_(SHEET_NAMES.trips);
  const places = readSheetAsObjects_(SHEET_NAMES.places);

  // upcoming 만 필터
  const upcoming = trips.filter(t => String(t.status || '').toLowerCase() === 'upcoming');

  // 각 trip 의 planned places 개수 집계
  const plannedCountByTrip = {};
  for (const p of places) {
    if (String(p.visit_status || '').toLowerCase() !== 'planned') continue;
    const tid = String(p.trip_id || '');
    if (!tid) continue;
    plannedCountByTrip[tid] = (plannedCountByTrip[tid] || 0) + 1;
  }

  // 정렬: period_start 가까운 미래순, null 은 뒤로 (그 안에선 created_at 최신순)
  const now = Date.now();
  const sorted = upcoming.slice().sort((a, b) => {
    const at = parseDateMs_(a.period_start);
    const bt = parseDateMs_(b.period_start);
    const aFuture = (at != null && at >= now) ? at : null;
    const bFuture = (bt != null && bt >= now) ? bt : null;

    // 미래 날짜 있는 trip 이 앞으로
    if (aFuture != null && bFuture != null) return aFuture - bFuture;
    if (aFuture != null) return -1;
    if (bFuture != null) return 1;

    // 둘 다 미래 날짜 없음 (null 또는 과거) → created_at 최신순
    const ac = parseDateMs_(a.created_at) || 0;
    const bc = parseDateMs_(b.created_at) || 0;
    return bc - ac;
  });

  const top4 = sorted.slice(0, 4).map(t => ({
    trip_id:      String(t.trip_id || ''),
    display_name: String(t.display_name || t.trip_id || ''),
    city:         String(t.city || ''),
    country_code: String(t.country_code || ''),
    planned_count: plannedCountByTrip[String(t.trip_id || '')] || 0,
    period_start: formatDate_(t.period_start)
  }));

  return {
    dashboard: DASHBOARD_ID,
    kpi: {
      upcoming_count: upcoming.length,
      upcoming_trips: top4
    },
    tasks: [],
    updated_at: new Date().toISOString()
  };
}


// ─────────────────────────────────────────────────────────────────────
// 4. Full — travel.html 본문용
//   - 전체 trips 목록 (past + upcoming)
//   - 모든 trips 의 places (Phase B 에서 같은 도시 재방문 매칭에 사용)
// ─────────────────────────────────────────────────────────────────────

function buildFullPayload() {
  const trips = readSheetAsObjects_(SHEET_NAMES.trips).map(normalizeTrip_);
  const places = readSheetAsObjects_(SHEET_NAMES.places).map(normalizePlace_);

  // 각 trip 별 planned / visited 개수 집계
  const counts = {};
  for (const p of places) {
    const tid = p.trip_id;
    if (!tid) continue;
    if (!counts[tid]) counts[tid] = { planned: 0, visited: 0 };
    if (p.visit_status === 'planned')  counts[tid].planned++;
    if (p.visit_status === 'visited')  counts[tid].visited++;
  }
  for (const t of trips) {
    t.planned_count = (counts[t.trip_id] && counts[t.trip_id].planned)  || 0;
    t.visited_count = (counts[t.trip_id] && counts[t.trip_id].visited)  || 0;
  }

  return {
    trips: trips,
    places: places,
    categories: CATEGORIES,
    updated_at: new Date().toISOString()
  };
}


// ─────────────────────────────────────────────────────────────────────
// 5. Write 액션
// ─────────────────────────────────────────────────────────────────────

/**
 * 새 trip 추가.
 * 필수: display_name, status, city, country_code, city_key, center_lat, center_lng
 * 선택: trip_id (없으면 자동 생성), period_start, period_end, members, zoom
 */
function addTrip_(p) {
  if (!p.display_name) throw new Error('display_name 필수');
  if (!p.status || ['upcoming', 'past'].indexOf(p.status) < 0) {
    throw new Error('status 는 upcoming 또는 past');
  }
  if (!p.city) throw new Error('city 필수');
  if (!p.city_key) throw new Error('city_key 필수');
  if (!p.country_code) throw new Error('country_code 필수');

  const sheet = getSheet_(SHEET_NAMES.trips);
  const existing = readSheetAsObjects_(SHEET_NAMES.trips);

  let trip_id = (p.trip_id || '').trim();
  if (!trip_id) {
    trip_id = generateTripId_(p.city_key, p.period_start, existing);
  } else {
    // 중복 체크
    if (existing.some(t => String(t.trip_id) === trip_id)) {
      throw new Error('trip_id 중복: ' + trip_id);
    }
  }

  const row = [
    trip_id,
    String(p.display_name),
    String(p.status),
    p.period_start ? formatDate_(p.period_start) : '',
    p.period_end   ? formatDate_(p.period_end)   : '',
    String(p.members || ''),
    String(p.country_code).toUpperCase(),
    String(p.city),
    String(p.city_key).toLowerCase(),
    Number(p.center_lat) || 0,
    Number(p.center_lng) || 0,
    Number(p.zoom) || 11,
    new Date().toISOString()
  ];
  sheet.appendRow(row);

  return { trip_id: trip_id };
}

/**
 * 기존 trip 수정.
 * 필수: trip_id
 * 그 외 필드는 있는 것만 갱신.
 */
function updateTrip_(p) {
  if (!p.trip_id) throw new Error('trip_id 필수');
  const sheet = getSheet_(SHEET_NAMES.trips);
  const rowIdx = findRowByKey_(sheet, 'trip_id', p.trip_id);
  if (rowIdx < 0) throw new Error('trip_id 없음: ' + p.trip_id);

  const updates = {};
  if (p.display_name !== undefined)  updates.display_name  = String(p.display_name);
  if (p.status !== undefined)        updates.status        = String(p.status);
  if (p.period_start !== undefined)  updates.period_start  = p.period_start ? formatDate_(p.period_start) : '';
  if (p.period_end !== undefined)    updates.period_end    = p.period_end   ? formatDate_(p.period_end)   : '';
  if (p.members !== undefined)       updates.members       = String(p.members);
  if (p.country_code !== undefined)  updates.country_code  = String(p.country_code).toUpperCase();
  if (p.city !== undefined)          updates.city          = String(p.city);
  if (p.city_key !== undefined)      updates.city_key      = String(p.city_key).toLowerCase();
  if (p.center_lat !== undefined)    updates.center_lat    = Number(p.center_lat);
  if (p.center_lng !== undefined)    updates.center_lng    = Number(p.center_lng);
  if (p.zoom !== undefined)          updates.zoom          = Number(p.zoom);

  applyUpdates_(sheet, rowIdx, TRIPS_HEADERS, updates);
  return { trip_id: p.trip_id };
}

/**
 * trip 삭제 + 해당 trip 의 모든 places 도 같이 삭제.
 */
function deleteTrip_(p) {
  if (!p.trip_id) throw new Error('trip_id 필수');
  const tripSheet = getSheet_(SHEET_NAMES.trips);
  const placeSheet = getSheet_(SHEET_NAMES.places);

  // trips 행 삭제
  const tripRowIdx = findRowByKey_(tripSheet, 'trip_id', p.trip_id);
  if (tripRowIdx < 0) throw new Error('trip_id 없음: ' + p.trip_id);
  tripSheet.deleteRow(tripRowIdx);

  // places 에서 같은 trip_id 행 모두 삭제 (역순으로)
  const placeRows = findAllRowsByKey_(placeSheet, 'trip_id', p.trip_id);
  for (let i = placeRows.length - 1; i >= 0; i--) {
    placeSheet.deleteRow(placeRows[i]);
  }

  return { trip_id: p.trip_id, places_deleted: placeRows.length };
}

/**
 * 방문장소 추가.
 * 필수: trip_id, category, name, lat, lng, visit_status
 * 선택: address, mapbox_id, visited_date, rating_star, rating_text, stay_start, stay_end
 *
 * 호텔(category='hotel') 처리:
 *   - stay_start, stay_end 가 진실의 원천 (visited_date 는 무시 또는 stay_start 와 동일)
 *   - 다른 카테고리는 stay_start/stay_end 무시, visited_date 사용
 */
function addPlace_(p) {
  if (!p.trip_id) throw new Error('trip_id 필수');
  if (!p.category || CATEGORIES.indexOf(p.category) < 0) {
    throw new Error('category 는 ' + CATEGORIES.join('/'));
  }
  if (!p.name) throw new Error('name 필수');
  if (p.lat == null || p.lng == null) throw new Error('lat/lng 필수');
  if (!p.visit_status || ['planned', 'visited'].indexOf(p.visit_status) < 0) {
    throw new Error('visit_status 는 planned 또는 visited');
  }
  // visit_status='planned' 인 경우 rating/visited_date/stay_* 는 무시
  const isVisited = p.visit_status === 'visited';
  const isHotel = p.category === 'hotel';

  const sheet = getSheet_(SHEET_NAMES.places);
  const existing = readSheetAsObjects_(SHEET_NAMES.places);
  const place_id = generatePlaceId_(p.trip_id, existing);

  // 헤더 순서대로 row 작성. ensureSheets_ 가 컬럼 자동 추가하므로 실제 시트의
  // 컬럼 순서와 PLACES_HEADERS 가 일치한다는 가정.
  // 만약 사용자가 수동으로 헤더 순서를 바꿨다면 헤더 매핑 기반으로 작성해야 안전.
  const rowMap = {
    place_id:     place_id,
    trip_id:      String(p.trip_id),
    category:     String(p.category),
    name:         String(p.name),
    address:      String(p.address || ''),
    lat:          Number(p.lat),
    lng:          Number(p.lng),
    mapbox_id:    String(p.mapbox_id || ''),
    visit_status: String(p.visit_status),
    visited_date: (isVisited && !isHotel && p.visited_date) ? formatDate_(p.visited_date) : '',
    rating_star:  (isVisited && p.rating_star != null && p.rating_star !== '') ? Number(p.rating_star) : '',
    rating_text:  (isVisited && p.rating_text) ? String(p.rating_text) : '',
    created_at:   new Date().toISOString(),
    stay_start:   (isVisited && isHotel && p.stay_start) ? formatDate_(p.stay_start) : '',
    stay_end:     (isVisited && isHotel && p.stay_end)   ? formatDate_(p.stay_end)   : ''
  };

  // 시트 실제 헤더 순서대로 row 작성 (안전)
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(h => String(h).trim());
  const row = headers.map(h => rowMap[h] !== undefined ? rowMap[h] : '');
  sheet.appendRow(row);

  return { place_id: place_id };
}

function updatePlace_(p) {
  if (!p.place_id) throw new Error('place_id 필수');
  const sheet = getSheet_(SHEET_NAMES.places);
  const rowIdx = findRowByKey_(sheet, 'place_id', p.place_id);
  if (rowIdx < 0) throw new Error('place_id 없음: ' + p.place_id);

  const updates = {};
  if (p.category !== undefined)      updates.category      = String(p.category);
  if (p.name !== undefined)          updates.name          = String(p.name);
  if (p.address !== undefined)       updates.address       = String(p.address);
  if (p.lat !== undefined)           updates.lat           = Number(p.lat);
  if (p.lng !== undefined)           updates.lng           = Number(p.lng);
  if (p.mapbox_id !== undefined)     updates.mapbox_id     = String(p.mapbox_id);
  if (p.visit_status !== undefined)  updates.visit_status  = String(p.visit_status);
  if (p.visited_date !== undefined)  updates.visited_date  = p.visited_date ? formatDate_(p.visited_date) : '';
  if (p.rating_star !== undefined)   updates.rating_star   = (p.rating_star === '' || p.rating_star == null) ? '' : Number(p.rating_star);
  if (p.rating_text !== undefined)   updates.rating_text   = String(p.rating_text);
  if (p.stay_start !== undefined)    updates.stay_start    = p.stay_start ? formatDate_(p.stay_start) : '';
  if (p.stay_end !== undefined)      updates.stay_end      = p.stay_end   ? formatDate_(p.stay_end)   : '';

  // 시트 실제 헤더 기반 매핑 (자동 마이그레이션 후 컬럼 위치가 시트마다 다를 수 있으므로)
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(h => String(h).trim());
  applyUpdates_(sheet, rowIdx, headers, updates);
  return { place_id: p.place_id };
}

function deletePlace_(p) {
  if (!p.place_id) throw new Error('place_id 필수');
  const sheet = getSheet_(SHEET_NAMES.places);
  const rowIdx = findRowByKey_(sheet, 'place_id', p.place_id);
  if (rowIdx < 0) throw new Error('place_id 없음: ' + p.place_id);
  sheet.deleteRow(rowIdx);
  return { place_id: p.place_id };
}


// ─────────────────────────────────────────────────────────────────────
// 6. 헬퍼
// ─────────────────────────────────────────────────────────────────────

function getSpreadsheet_() {
  if (!SHEET_ID) {
    throw new Error('SHEET_ID 가 비어있음. Apps Script 코드 상단의 SHEET_ID 상수를 새 스프레드시트 ID 로 채워 주세요.');
  }
  return SpreadsheetApp.openById(SHEET_ID);
}

function getSheet_(name) {
  const ss = getSpreadsheet_();
  const s = ss.getSheetByName(name);
  if (!s) throw new Error('시트 없음: ' + name);
  return s;
}

/**
 * 시트 2개가 없으면 만들고, 헤더 비어있으면 채워 넣는다. (idempotent)
 */
function ensureSheets_() {
  const ss = getSpreadsheet_();
  ensureSheetWithHeader_(ss, SHEET_NAMES.trips,  TRIPS_HEADERS);
  ensureSheetWithHeader_(ss, SHEET_NAMES.places, PLACES_HEADERS);
}

function ensureSheetWithHeader_(ss, name, headers) {
  let s = ss.getSheetByName(name);
  if (!s) s = ss.insertSheet(name);
  // 헤더 1행이 비어있으면 채움
  const lastCol = Math.max(1, s.getLastColumn());
  const range = s.getRange(1, 1, 1, Math.max(headers.length, lastCol));
  const cur = range.getValues()[0];
  const allEmpty = cur.slice(0, headers.length).every(v => v === '' || v == null);
  if (allEmpty) {
    s.getRange(1, 1, 1, headers.length).setValues([headers]);
    s.setFrozenRows(1);
    return;
  }

  // 기존 헤더 → 누락된 컬럼을 끝에 자동 추가 (idempotent 마이그레이션)
  // 단, 기존 컬럼 순서/위치는 절대 바꾸지 않음 (데이터 시프트 방지)
  const existing = cur.map(v => String(v || '').trim()).filter(Boolean);
  const missing = headers.filter(h => existing.indexOf(h) < 0);
  if (missing.length === 0) {
    s.setFrozenRows(1);
    return;
  }
  // 끝에 추가 (현재 lastCol 다음 컬럼부터)
  const startCol = existing.length + 1;
  s.getRange(1, startCol, 1, missing.length).setValues([missing]);
  s.setFrozenRows(1);
  Logger.log('시트 ' + name + ' 에 컬럼 자동 추가: ' + missing.join(', '));
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function readSheetAsObjects_(sheetName) {
  const sheet = getSheet_(sheetName);
  const range = sheet.getDataRange();
  const values = range.getValues();
  if (values.length < 2) return [];
  const headers = values[0].map(h => String(h).trim());
  const out = [];
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    if (row.every(v => v === '' || v == null)) continue;
    const obj = {};
    for (let j = 0; j < headers.length; j++) {
      if (headers[j]) obj[headers[j]] = row[j];
    }
    out.push(obj);
  }
  return out;
}

/**
 * 정규화: 시트의 raw value 를 클라이언트가 쓰기 좋게 변환.
 * - Date 객체 → 'YYYY-MM-DD'
 * - 숫자 컬럼은 Number 보장
 * - 빈 문자열 → null (날짜·평점 같이 nullable 필드)
 */
function normalizeTrip_(t) {
  return {
    trip_id:      String(t.trip_id || ''),
    display_name: String(t.display_name || ''),
    status:       String(t.status || '').toLowerCase(),
    period_start: formatDate_(t.period_start),
    period_end:   formatDate_(t.period_end),
    members:      String(t.members || ''),
    country_code: String(t.country_code || '').toUpperCase(),
    city:         String(t.city || ''),
    city_key:     String(t.city_key || '').toLowerCase(),
    center_lat:   numberOrNull_(t.center_lat),
    center_lng:   numberOrNull_(t.center_lng),
    zoom:         numberOrNull_(t.zoom),
    created_at:   formatIso_(t.created_at)
  };
}

function normalizePlace_(p) {
  return {
    place_id:     String(p.place_id || ''),
    trip_id:      String(p.trip_id || ''),
    category:     String(p.category || '').toLowerCase(),
    name:         String(p.name || ''),
    address:      String(p.address || ''),
    lat:          numberOrNull_(p.lat),
    lng:          numberOrNull_(p.lng),
    mapbox_id:    String(p.mapbox_id || ''),
    visit_status: String(p.visit_status || '').toLowerCase(),
    visited_date: formatDate_(p.visited_date),
    rating_star:  numberOrNull_(p.rating_star),
    rating_text:  String(p.rating_text || ''),
    stay_start:   formatDate_(p.stay_start),
    stay_end:     formatDate_(p.stay_end),
    created_at:   formatIso_(p.created_at)
  };
}

function findRowByKey_(sheet, keyCol, keyVal) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return -1;
  const headers = values[0].map(h => String(h).trim());
  const colIdx = headers.indexOf(keyCol);
  if (colIdx < 0) return -1;
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][colIdx]) === String(keyVal)) {
      return i + 1; // 1-indexed
    }
  }
  return -1;
}

function findAllRowsByKey_(sheet, keyCol, keyVal) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values[0].map(h => String(h).trim());
  const colIdx = headers.indexOf(keyCol);
  if (colIdx < 0) return [];
  const out = [];
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][colIdx]) === String(keyVal)) {
      out.push(i + 1); // 1-indexed
    }
  }
  return out;
}

function applyUpdates_(sheet, rowIdx, headers, updates) {
  for (const key in updates) {
    const colIdx = headers.indexOf(key);
    if (colIdx < 0) continue;
    sheet.getRange(rowIdx, colIdx + 1).setValue(updates[key]);
  }
}

function generateTripId_(cityKey, periodStart, existing) {
  const year = periodStart
    ? new Date(periodStart).getFullYear() || new Date().getFullYear()
    : new Date().getFullYear();
  let base = (cityKey + '-' + year).toLowerCase().replace(/[^a-z0-9-]/g, '');
  if (!existing.some(t => String(t.trip_id) === base)) return base;
  // 충돌 시 -2, -3 ... 추가
  let n = 2;
  while (existing.some(t => String(t.trip_id) === base + '-' + n)) n++;
  return base + '-' + n;
}

function generatePlaceId_(tripId, existing) {
  let n = existing.filter(p => String(p.trip_id) === String(tripId)).length + 1;
  let id = 'pl_' + tripId + '_' + String(n).padStart(3, '0');
  while (existing.some(p => String(p.place_id) === id)) {
    n++;
    id = 'pl_' + tripId + '_' + String(n).padStart(3, '0');
  }
  return id;
}

function formatDate_(d) {
  if (!d) return null;
  const dt = (d instanceof Date) ? d : new Date(d);
  if (isNaN(dt.getTime())) return null;
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const da = String(dt.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + da;
}

function formatIso_(d) {
  if (!d) return null;
  const dt = (d instanceof Date) ? d : new Date(d);
  if (isNaN(dt.getTime())) return null;
  return dt.toISOString();
}

function parseDateMs_(d) {
  if (!d) return null;
  const dt = (d instanceof Date) ? d : new Date(d);
  if (isNaN(dt.getTime())) return null;
  return dt.getTime();
}

function numberOrNull_(v) {
  if (v == null || v === '') return null;
  const n = (typeof v === 'number') ? v : parseFloat(String(v).replace(/,/g, ''));
  return isNaN(n) ? null : n;
}


// ─────────────────────────────────────────────────────────────────────
// 7. 디버그
// ─────────────────────────────────────────────────────────────────────

function debug_summary() {
  ensureSheets_();
  const result = buildSummaryPayload();
  Logger.log(JSON.stringify(result, null, 2));
  return result;
}

function debug_full() {
  ensureSheets_();
  const result = buildFullPayload();
  Logger.log(JSON.stringify(result, null, 2));
  return result;
}

function debug_addSampleTrip() {
  ensureSheets_();
  const r = addTrip_({
    display_name: '도쿄 가족여행 2026',
    status: 'upcoming',
    period_start: '2026-08-01',
    period_end: '2026-08-07',
    members: '아빠,엄마,도비,로비',
    country_code: 'JP',
    city: '도쿄',
    city_key: 'tokyo',
    center_lat: 35.6762,
    center_lng: 139.6503,
    zoom: 11
  });
  Logger.log('생성: ' + r.trip_id);
  return r;
}
