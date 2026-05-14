/**
 * =====================================================================
 * Family OS — Apps Script Template
 * =====================================================================
 *
 * 다음 세션의 Claude가 서브 대시보드 백엔드를 만들 때 시작점.
 * 이 파일을 그대로 복사한 뒤 다음을 수행:
 *
 *   1. DASHBOARD_ID 설정 ('wealth' | 'expense' | 'health' | 'future')
 *   2. SHEET_NAMES에 실제 시트 이름 채우기
 *   3. buildSummaryPayload() 안에 KPI/Tasks 산출 로직 작성
 *      → 반환 포맷은 반드시 backend-spec.md 섹션 3 기준 준수
 *   4. buildFullPayload() 안에 대시보드 본문 데이터 조립 로직
 *      → 포맷은 자유. 단 HTML의 renderDashboard(data)와 짝 맞추기
 *
 * 사용 헬퍼 (수정하지 말고 호출만):
 *   - jsonResponse(obj)            : JSON 응답 변환
 *   - readSheetAsObjects(ss, name) : 시트를 객체 배열로
 *   - formatDate(d)                : Date → YYYY-MM-DD 문자열
 *   - numberOr0(v)                 : null/undefined/문자 → 0 안전 변환
 *   - getCached(key, ttl, fn)      : 외부 API 결과 캐시
 *
 * 배포:
 *   확장 프로그램 > Apps Script 에 이 코드 붙여넣기 →
 *   배포 > 새 배포 > 유형: 웹 앱
 *     - 실행: 본인 계정
 *     - 액세스: 모든 사용자
 *   → 발급된 /exec URL을 대시보드 설정 모달에 입력
 *
 * 자세한 가이드: backend-spec.md
 * =====================================================================
 */

// ─────────────────────────────────────────────────────────────────────
// 1. 메타 설정 (필수 변경)
// ─────────────────────────────────────────────────────────────────────

// TODO: 'wealth' | 'expense' | 'health' | 'future' 중 하나
const DASHBOARD_ID = 'XXX';

// TODO: 시트 이름들. 실제 시트와 정확히 일치해야 함 (이모지/공백 포함)
const SHEET_NAMES = {
  // 예시 - 실제로는 대시보드별로 다름
  // main:     '메인',
  // history:  '이력',
};

// 외부 API 캐시 TTL (외부 fetch 안 쓰면 무시)
const CACHE_TTL_SEC = 3600;


// ─────────────────────────────────────────────────────────────────────
// 2. 메인 진입점 (수정 거의 불필요)
// ─────────────────────────────────────────────────────────────────────

function doGet(e) {
  try {
    const mode = (e && e.parameter && e.parameter.mode) || 'full';
    let data;
    if (mode === 'summary') {
      data = buildSummaryPayload();
    } else if (mode === 'full') {
      data = buildFullPayload();
    } else {
      throw new Error('Unknown mode: ' + mode);
    }
    return jsonResponse({ ok: true, data: data });
  } catch (err) {
    return jsonResponse({
      ok: false,
      error: err.toString(),
      stack: err.stack || null
    });
  }
}


// ─────────────────────────────────────────────────────────────────────
// 3. Summary 페이로드 — 메인 허브가 호출 (필수 구현)
//    포맷은 backend-spec.md 섹션 3 참고. 대시보드별 kpi 키 정확히 일치.
// ─────────────────────────────────────────────────────────────────────

function buildSummaryPayload() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // TODO: 시트에서 데이터 읽고 KPI 산출
  // const rows = readSheetAsObjects(ss, SHEET_NAMES.main);
  // const kpi  = { ... };

  // TODO: tasks 생성 (메인의 '할 일' 섹션에 표시)
  // const tasks = [
  //   {
  //     id: DASHBOARD_ID + '.something.stale',
  //     label: '메시지',
  //     urgency: 'warn',          // 'info' | 'warn' | 'bad'
  //     due: '2026-05-20'         // ISO 날짜 또는 null
  //   }
  // ];

  return {
    dashboard: DASHBOARD_ID,
    kpi: {
      // TODO: 대시보드별 KPI 채우기
      // backend-spec.md 섹션 3-1 ~ 3-4 참고
    },
    tasks: [
      // TODO
    ],
    updated_at: new Date().toISOString()
  };
}


// ─────────────────────────────────────────────────────────────────────
// 4. Full 페이로드 — 서브 대시보드 본문이 호출 (필수 구현)
//    포맷 자유. HTML의 renderDashboard(data)와 짝 맞추기.
// ─────────────────────────────────────────────────────────────────────

function buildFullPayload() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // TODO: 본문에 필요한 모든 데이터 조립
  // 예시:
  // return {
  //   summary: { ... },
  //   items: [ ... ],
  //   chart_series: [ ... ],
  //   updated_at: new Date().toISOString()
  // };

  return {
    placeholder: true,
    note: 'buildFullPayload()가 아직 구현되지 않았습니다',
    updated_at: new Date().toISOString()
  };
}


// =====================================================================
// 공통 헬퍼 함수 (수정 불필요. 호출만)
// =====================================================================

/** JSON 응답 생성 (CORS 자동 처리) */
function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * 시트를 객체 배열로 변환. 첫 행을 헤더로 간주.
 * 예: 시트
 *   id  | 이름  | 금액
 *   ----+-----+------
 *   a1  | 사과  | 1000
 *   a2  | 배   | 2000
 * → [
 *     { id: 'a1', '이름': '사과', '금액': 1000 },
 *     { id: 'a2', '이름': '배',   '금액': 2000 }
 *   ]
 *
 * @param {Spreadsheet} ss
 * @param {string} sheetName
 * @returns {object[]}
 */
function readSheetAsObjects(ss, sheetName) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    throw new Error('시트를 찾을 수 없음: ' + sheetName);
  }
  const range = sheet.getDataRange();
  const values = range.getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(h => String(h).trim());
  const out = [];
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    // 모든 셀이 빈 행은 스킵
    if (row.every(v => v === '' || v == null)) continue;
    const obj = {};
    for (let j = 0; j < headers.length; j++) {
      if (headers[j]) obj[headers[j]] = row[j];
    }
    out.push(obj);
  }
  return out;
}

/** Date → 'YYYY-MM-DD' 문자열. 잘못된 값은 null. */
function formatDate(d) {
  if (!d) return null;
  const dt = (d instanceof Date) ? d : new Date(d);
  if (isNaN(dt.getTime())) return null;
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const da = String(dt.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + da;
}

/** null/undefined/문자 등을 0으로 안전 변환 */
function numberOr0(v) {
  if (v == null || v === '') return 0;
  const n = (typeof v === 'number') ? v : parseFloat(String(v).replace(/,/g, ''));
  return isNaN(n) ? 0 : n;
}

/**
 * 외부 API 결과 캐시. fn() 결과를 ttl 동안 CacheService에 저장.
 *
 * @param {string} key - 캐시 키 (대시보드별 prefix 권장)
 * @param {number} ttl - 초 단위
 * @param {function} fn - 캐시 미스 시 실행할 함수
 */
function getCached(key, ttl, fn) {
  const cache = CacheService.getScriptCache();
  const cached = cache.get(key);
  if (cached) {
    try { return JSON.parse(cached); }
    catch (e) { /* 캐시 깨졌으면 무시하고 새로 fetch */ }
  }
  const fresh = fn();
  try {
    cache.put(key, JSON.stringify(fresh), Math.min(ttl, 21600));  // Apps Script 최대 6시간
  } catch (e) {
    // 캐시 크기 초과 등은 무시 (데이터는 정상 반환)
  }
  return fresh;
}

/**
 * 며칠 전인지 계산. 시트의 '마지막 업데이트' 같은 컬럼 검증용.
 *
 * @param {Date|string} d
 * @returns {number} 일수 (음수면 미래)
 */
function daysSince(d) {
  if (!d) return Infinity;
  const dt = (d instanceof Date) ? d : new Date(d);
  if (isNaN(dt.getTime())) return Infinity;
  const ms = Date.now() - dt.getTime();
  return Math.floor(ms / 86400000);
}


// =====================================================================
// 디버그 헬퍼 (Apps Script 편집기에서 직접 실행해 응답 확인)
// =====================================================================

function debug_summary() {
  const result = buildSummaryPayload();
  Logger.log(JSON.stringify(result, null, 2));
  return result;
}

function debug_full() {
  const result = buildFullPayload();
  Logger.log(JSON.stringify(result, null, 2));
  return result;
}
