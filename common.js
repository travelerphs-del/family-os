/* ════════════════════════════════════════════════════════════════════
 * Family OS — common.js
 * ════════════════════════════════════════════════════════════════════
 *
 * 메인 허브(index.html)와 4개 서브 대시보드가 공유하는 공통 모듈.
 *
 * 사용:
 *   <link rel="stylesheet" href="./design-tokens.css">
 *   <script src="./common.js"></script>
 *   <script>
 *     // FamilyOS.fmtKRW(...), FamilyOS.fetchDashboardData(...) 등 사용
 *   </script>
 *
 * 글로벌: window.FamilyOS
 * ════════════════════════════════════════════════════════════════════ */

window.FamilyOS = (function () {
  'use strict';

  /* ─── 메타 상수 ──────────────────────────────────────────────── */
  const STORAGE_PREFIX = 'familyOS.webAppUrl.';
  const FETCH_TIMEOUT_MS = 15000;

  const DASHBOARDS = [
    { id: 'wealth',  label: 'Wealth',  kr: '자산', href: './wealth.html',  accent: 'var(--acc-wealth)'  },
    { id: 'expense', label: 'Expense', kr: '지출', href: './expense.html', accent: 'var(--acc-expense)' },
    { id: 'health',  label: 'Health',  kr: '건강', href: './health.html',  accent: 'var(--acc-health)'  },
    { id: 'future',  label: 'Future',  kr: '미래', href: './future.html',  accent: 'var(--acc-future)'  }
  ];

  function getDashboardMeta(id) {
    return DASHBOARDS.find(d => d.id === id) || null;
  }

  /* ─── 포맷터 ─────────────────────────────────────────────────── */
  function fmtKRW(n) {
    // 짧은 한국식 표기 (1.23억, 450만 등). 카드 안 좁은 곳용.
    if (n == null || isNaN(n)) return '—';
    if (Math.abs(n) >= 100000000) {
      return (n / 100000000).toFixed(2).replace(/\.?0+$/, '') + '억';
    }
    if (Math.abs(n) >= 10000) {
      return (n / 10000).toFixed(0) + '만';
    }
    return n.toLocaleString('ko-KR');
  }

  function fmtKRWFull(n) {
    // 풀 표기 (₩1,234,567,890). 영웅 숫자용.
    if (n == null || isNaN(n)) return '—';
    return '₩' + n.toLocaleString('ko-KR');
  }

  function fmtPct(n, withSign) {
    if (n == null || isNaN(n)) return '—';
    if (withSign === undefined) withSign = true;
    const sign = withSign && n > 0 ? '+' : '';
    return sign + n.toFixed(2) + '%';
  }

  function fmtPctNoSign(n) {
    if (n == null || isNaN(n)) return '—';
    return n.toFixed(1) + '%';
  }

  function deltaClass(n) {
    if (n == null || isNaN(n)) return 'muted';
    if (n > 0) return 'gain';
    if (n < 0) return 'loss';
    return 'muted';
  }

  function timeAgo(isoStr) {
    if (!isoStr) return '—';
    const t = new Date(isoStr).getTime();
    if (isNaN(t)) return '—';
    const diff = Date.now() - t;
    if (diff < 0) return '방금';
    const m = Math.floor(diff / 60000);
    if (m < 1) return '방금';
    if (m < 60) return m + '분 전';
    const h = Math.floor(m / 60);
    if (h < 24) return h + '시간 전';
    const d = Math.floor(h / 24);
    return d + '일 전';
  }

  function escapeHtml(s) {
    if (s == null) return '';
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* ─── Web App URL (LocalStorage) ─────────────────────────────── */
  function getWebAppUrl(id) {
    return localStorage.getItem(STORAGE_PREFIX + id) || '';
  }

  function setWebAppUrl(id, url) {
    const v = (url || '').trim();
    if (v) localStorage.setItem(STORAGE_PREFIX + id, v);
    else   localStorage.removeItem(STORAGE_PREFIX + id);
  }

  function getAllWebAppUrls() {
    const out = {};
    DASHBOARDS.forEach(d => { out[d.id] = getWebAppUrl(d.id); });
    return out;
  }

  /* ─── Fetch (표준화) ─────────────────────────────────────────── */
  /**
   * Apps Script Web App을 호출해 표준 응답을 받는다.
   *
   * @param {string} id - 'wealth' / 'expense' / 'health' / 'future'
   * @param {string} mode - 'summary' (기본) 또는 'full'
   * @returns {Promise<object>} - 응답의 data 필드. 에러 시 throw.
   */
  async function fetchDashboardData(id, mode) {
    if (mode === undefined) mode = 'summary';
    const url = getWebAppUrl(id);
    if (!url) throw new Error('UNSET');  // 호출자가 catch해서 unset 상태로 처리

    const cachebust = '_=' + Date.now();
    const sep = url.includes('?') ? '&' : '?';
    const fullUrl = url + sep + 'mode=' + encodeURIComponent(mode) + '&' + cachebust;

    // AbortController로 타임아웃 처리
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), FETCH_TIMEOUT_MS);

    let res;
    try {
      res = await fetch(fullUrl, { method: 'GET', redirect: 'follow', signal: ctl.signal });
    } catch (err) {
      clearTimeout(timer);
      if (err.name === 'AbortError') throw new Error('TIMEOUT (' + (FETCH_TIMEOUT_MS / 1000) + 's)');
      throw err;
    }
    clearTimeout(timer);

    if (!res.ok) throw new Error('HTTP ' + res.status);

    let json;
    try {
      json = await res.json();
    } catch (err) {
      throw new Error('응답이 JSON이 아닙니다');
    }

    if (!json.ok) throw new Error(json.error || 'Backend error');
    if (!json.data) throw new Error('data 필드 누락');

    // summary 모드는 dashboard 필드 검증
    if (mode === 'summary' && json.data.dashboard !== id) {
      throw new Error('응답 dashboard 필드 불일치 (기대: ' + id + ', 실제: ' + json.data.dashboard + ')');
    }

    return json.data;
  }

  /* ─── 헤더/푸터 HTML 생성 ────────────────────────────────────── */
  /**
   * @param {object} opts
   *   - title: 브랜드 제목 (예: 'Family OS' 또는 'Wealth')
   *   - sub:   부제 (예: '통합 대시보드' 또는 '자산')
   *   - showRefresh: 새로고침 버튼 표시 (기본 true)
   *   - showSettings: 설정 버튼 표시 (기본 true)
   */
  function renderHeaderHTML(opts) {
    opts = opts || {};
    const title = opts.title || 'Family OS';
    const sub   = opts.sub   || '';
    const showRefresh = opts.showRefresh !== false;
    const showSettings = opts.showSettings !== false;

    return `
      <header class="hdr">
        <div class="brand">
          <span class="brand-title serif">${escapeHtml(title)}</span>
          ${sub ? `<span class="brand-sub">${escapeHtml(sub)}</span>` : ''}
        </div>
        <div class="hdr-actions">
          <span class="last-sync" id="fos-last-sync">—</span>
          ${showRefresh ? `
            <button class="icon-btn" id="fos-btn-refresh" title="새로고침" aria-label="새로고침">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="23 4 23 10 17 10"></polyline>
                <polyline points="1 20 1 14 7 14"></polyline>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
              </svg>
            </button>` : ''}
          ${showSettings ? `
            <button class="icon-btn" id="fos-btn-settings" title="설정" aria-label="설정">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </button>` : ''}
        </div>
      </header>
    `;
  }

  function renderFooterHTML(opts) {
    opts = opts || {};
    const left = opts.left || 'Family OS';
    const right = opts.right || 'v0.1.0';
    return `
      <footer class="ftr">
        <span>${escapeHtml(left)}</span>
        <span class="ftr-r">${escapeHtml(right)}</span>
      </footer>
    `;
  }

  function setLastSync(text) {
    const el = document.getElementById('fos-last-sync');
    if (el) el.textContent = text || '';
  }

  function setSyncedNow() {
    setLastSync('동기화: ' + new Date().toLocaleTimeString('ko-KR',
      { hour: '2-digit', minute: '2-digit' }));
  }

  /* ─── 설정 모달 HTML + 동작 ──────────────────────────────────── */
  /**
   * @param {object} opts
   *   - fields: [{ id, label }, ...] - 입력 받을 URL 목록
   *             (예: 메인=4개, 서브=1개)
   *   - title:  모달 제목
   *   - desc:   설명 문구
   */
  function renderSettingsModalHTML(opts) {
    opts = opts || {};
    const fields = opts.fields || DASHBOARDS.map(d => ({ id: d.id, label: d.label + ' (' + d.kr + ')' }));
    const title = opts.title || 'Web App URL 설정';
    const desc  = opts.desc  || '각 대시보드의 Apps Script Web App URL을 입력하세요. 이 정보는 이 기기 브라우저에만 저장됩니다 (LocalStorage). 기기마다 한 번씩 입력해야 합니다.';

    const fieldsHtml = fields.map(f => {
      const meta = getDashboardMeta(f.id);
      const accent = (meta && meta.accent) || 'var(--accent)';
      return `
        <div class="modal-field">
          <label class="modal-label">
            <span class="dot" style="background: ${accent};"></span>
            ${escapeHtml(f.label)}
          </label>
          <input class="modal-input" type="url" id="fos-url-${escapeHtml(f.id)}"
                 placeholder="https://script.google.com/macros/s/.../exec" autocomplete="off">
        </div>
      `;
    }).join('');

    return `
      <div class="modal-backdrop" id="fos-modal-backdrop">
        <div class="modal">
          <div class="modal-title serif">${escapeHtml(title)}</div>
          <div class="modal-desc">${escapeHtml(desc)}</div>
          ${fieldsHtml}
          <div class="modal-actions">
            <button class="btn btn-ghost" id="fos-btn-modal-close">취소</button>
            <button class="btn btn-primary" id="fos-btn-modal-save">저장 후 새로고침</button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 설정 모달의 이벤트를 바인딩한다.
   * 호출 시점: renderSettingsModalHTML() 결과를 DOM에 삽입한 후.
   *
   * @param {object} opts
   *   - fieldIds: 모달에 표시한 필드 id 배열 (예: ['wealth'] 또는 4개)
   *   - onSave: 저장 후 콜백 (보통 refresh 호출). async 가능
   */
  function attachSettingsModal(opts) {
    opts = opts || {};
    const fieldIds = opts.fieldIds || DASHBOARDS.map(d => d.id);
    const onSave = opts.onSave || function () {};

    const bg = document.getElementById('fos-modal-backdrop');
    if (!bg) return;

    function open() {
      fieldIds.forEach(id => {
        const el = document.getElementById('fos-url-' + id);
        if (el) el.value = getWebAppUrl(id);
      });
      bg.classList.add('open');
    }
    function close() {
      bg.classList.remove('open');
    }
    function save() {
      fieldIds.forEach(id => {
        const el = document.getElementById('fos-url-' + id);
        if (el) setWebAppUrl(id, el.value);
      });
      close();
      onSave();
    }

    const btnOpen  = document.getElementById('fos-btn-settings');
    const btnClose = document.getElementById('fos-btn-modal-close');
    const btnSave  = document.getElementById('fos-btn-modal-save');

    if (btnOpen)  btnOpen.addEventListener('click', open);
    if (btnClose) btnClose.addEventListener('click', close);
    if (btnSave)  btnSave.addEventListener('click', save);

    bg.addEventListener('click', (e) => { if (e.target === bg) close(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && bg.classList.contains('open')) close();
    });

    // 외부에서 프로그램적으로 열 수 있게 노출
    return { open, close };
  }

  /* ─── PWA Service Worker (선택, 있으면 등록) ─────────────────── */
  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(() => {
          /* sw.js 없으면 무시 */
        });
      });
    }
  }

  /* ─── 공통 빈 상태 컴포넌트 HTML ─────────────────────────────── */
  function renderUnsetStateHTML(opts) {
    opts = opts || {};
    const buttonText = opts.buttonText || 'URL 설정하기';
    return `
      <div class="state-empty">
        <div class="ico">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <div class="msg">Web App URL이 아직 설정되지 않았어요.</div>
        <button data-fos-action="open-settings">${escapeHtml(buttonText)}</button>
      </div>
    `;
  }

  function renderLoadingStateHTML() {
    return `
      <div class="state-empty">
        <div class="spinner"></div>
        <div class="msg">불러오는 중…</div>
      </div>
    `;
  }

  function renderErrorStateHTML(errorMsg, opts) {
    opts = opts || {};
    const retryId = opts.retryId || '';
    return `
      <div class="state-empty">
        <div class="ico" style="color: var(--loss);">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>
        <div class="msg">데이터 불러오기 실패</div>
        <div class="msg" style="font-family: var(--font-mono); font-size: 10px; color: var(--text-quiet);">${escapeHtml(errorMsg || 'unknown')}</div>
        <button data-fos-action="retry" data-id="${escapeHtml(retryId)}">재시도</button>
      </div>
    `;
  }

  /* ─── 공개 API ───────────────────────────────────────────────── */
  return {
    // 상수
    DASHBOARDS,
    STORAGE_PREFIX,
    getDashboardMeta,

    // 포맷터
    fmtKRW, fmtKRWFull, fmtPct, fmtPctNoSign, deltaClass, timeAgo, escapeHtml,

    // URL 관리
    getWebAppUrl, setWebAppUrl, getAllWebAppUrls,

    // Fetch
    fetchDashboardData,

    // UI 렌더링 헬퍼
    renderHeaderHTML, renderFooterHTML,
    renderSettingsModalHTML, attachSettingsModal,
    renderUnsetStateHTML, renderLoadingStateHTML, renderErrorStateHTML,

    // 헤더 동기화 시간 표시
    setLastSync, setSyncedNow,

    // PWA
    registerServiceWorker
  };
})();
