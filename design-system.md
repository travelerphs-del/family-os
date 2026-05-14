# Family OS — Design System Guide

> 이 문서는 **서브 대시보드 재개발 세션에서 Claude가 참고할 가이드**다.
> 새 채팅 세션을 시작할 때 이 파일과 `design-tokens.css`, `backend-spec.md`를 함께 첨부하면 일관된 결과가 나온다.

---

## 1. 컨셉 한 줄

**다크 럭셔리 + 데이터 정직성.**
어두운 캔버스에 따뜻한 골드 액센트, 명료한 숫자 타이포그래피, 절제된 간격. "은행 명세서보다는 부드럽고, 가계부 앱보다는 격조있게."

---

## 2. 디자인 토큰 사용

모든 색·폰트·간격·라운드는 `design-tokens.css`의 CSS 변수만 사용한다.
서브 대시보드 HTML 상단에 다음 한 줄을 추가:

```html
<link rel="stylesheet" href="design-tokens.css">
```

**직접 hex/px 값을 박지 말 것.** 예외는 한 곳뿐 — 차트 라이브러리에 컬러를 넘길 때 `getComputedStyle(document.documentElement).getPropertyValue('--gain')` 식으로 읽어서 전달.

---

## 3. 대시보드별 악센트 컬러

각 서브 대시보드는 자신의 시그니처 컬러를 가진다. 토큰은 이미 정의됨:

| 대시보드 | 변수 | Hex | 톤 |
|---|---|---|---|
| Wealth | `--acc-wealth` | `#E5C158` | 골드 |
| Expense | `--acc-expense` | `#818CF8` | 인디고 |
| Health | `--acc-health` | `#34D399` | 민트 |
| Future | `--acc-future` | `#C084FC` | 라벤더 |

**사용 규칙**:
- 헤더 brand-dot, 강조 아이콘, 카드 상단 가는 라인 등 **국소적 식별 단서**에만.
- 본문 텍스트 컬러로 쓰지 말 것 (가독성 저하).
- 카드 전체 배경으로 쓰지 말 것. 배경은 항상 `--surface` / `--elevated`.

---

## 4. 타이포그래피 시스템

| 용도 | 폰트 | 예시 |
|---|---|---|
| 큰 숫자/총합 (영웅 숫자) | `--font-display` (Fraunces) | "₩1,234,567,890" |
| 본문 한국어/UI 라벨 | `--font-body` (Pretendard) | "총 순자산" |
| 표/숫자/코드/티커 | `--font-mono` (JetBrains Mono) | "AAPL +1.23%" |

**Fraunces는 큰 숫자 또는 디스플레이용으로만.** 본문에 절대 쓰지 말 것 — 너무 강해서 정보 위계가 무너진다.

**숫자엔 `.mono` 클래스를 붙여 등폭 정렬**. 표나 같은 열의 숫자가 흔들리지 않게.

---

## 5. 간격 / 라운드

8px 그리드. `--s2`(8) → `--s4`(16) → `--s6`(24) → `--s8`(48) 4단계가 가장 자주 쓰이는 리듬.

라운드는 `--r-md`(12)가 카드 표준. 큰 패널은 `--r-lg`(16). 칩/태그는 `--r-full`.

---

## 6. 컴포넌트 패턴 (서브 대시보드에서 재사용)

### 6-1. 카드 (기본 컨테이너)

```html
<section class="card">
  <header class="card-header">
    <h2 class="card-title">제목</h2>
    <span class="card-meta mono">2026-05-14</span>
  </header>
  <div class="card-body">...</div>
</section>
```

```css
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-md);
  padding: var(--s5);
}
.card-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
```

### 6-2. 영웅 숫자 (Hero Number)

대시보드 진입 첫 화면의 핵심 수치 1개.

```html
<div class="hero-num">
  <span class="hero-num-label">총 순자산</span>
  <span class="hero-num-value serif">₩1,234,567,890</span>
  <span class="hero-num-delta gain">+2.3% MoM</span>
</div>
```

### 6-3. 증감 표시 (Delta)

- 상승: `class="gain"` (색 `--gain`, 화살표 ▲ 또는 +)
- 하락: `class="loss"` (색 `--loss`, 화살표 ▼ 또는 -)
- 중립/경고: `class="neutral"`

```css
.gain  { color: var(--gain); }
.loss  { color: var(--loss); }
.neutral { color: var(--neutral); }
```

### 6-4. 상태 점 (Status Dot)

가족 건강 상태 등 OK/주의/경고 표시.

```html
<span class="dot dot-ok"></span>   <!-- 녹 -->
<span class="dot dot-warn"></span> <!-- 노 -->
<span class="dot dot-bad"></span>  <!-- 적 -->
```

```css
.dot { width: 8px; height: 8px; border-radius: var(--r-full); display: inline-block; }
.dot-ok   { background: var(--gain); }
.dot-warn { background: var(--neutral); }
.dot-bad  { background: var(--loss); }
```

### 6-5. 설정 버튼 (Web App URL 연결)

각 서브 대시보드는 자기 Web App URL을 LocalStorage에 저장한다.
키 네이밍 컨벤션:

```
familyOS.webAppUrl.wealth
familyOS.webAppUrl.expense
familyOS.webAppUrl.health
familyOS.webAppUrl.future
```

메인 허브가 이 키들을 읽어 4개 카드를 동시에 동기화한다. 서브 대시보드는 자기 키만 읽고 쓰면 된다.

---

## 7. 반응형 규칙

| 너비 | 레이아웃 |
|---|---|
| `≥ 1024px` (데스크탑) | 다열 그리드, 사이드 영역 활용 |
| `768px ~ 1023px` (태블릿) | 2열 또는 적응형 |
| `< 768px` (모바일) | 1열 세로 스택, 풀폭 카드 |

**모바일 안전 영역**: `padding-top: var(--safe-top); padding-bottom: var(--safe-bottom);` 를 최상위 컨테이너에 적용 (iPhone notch / 홈 인디케이터 대응).

**터치 타깃**: 최소 44px × 44px. 작은 아이콘 버튼이라도 hit area를 패딩으로 확보.

**가로 스크롤 금지**: `overflow-x: hidden`을 body에. 모바일에서 가로 스크롤 생기면 디자인 실패.

---

## 8. 인터랙션 / 모션

- 호버/포커스 트랜지션은 `--t-fast`(150ms).
- 모달/시트 등 큰 변화는 `--t-sheet`(380ms, ease-out 커브).
- 페이지 로드 시 카드는 살짝 페이드인 (transform: translateY(4px) → 0). 과한 애니메이션 금지.

---

## 9. 데이터 상태 4가지

모든 데이터 영역은 다음 4가지 상태를 명시적으로 처리한다:

1. **URL 미설정** — 우측 상단 설정 톱니바퀴로 안내. 카드 본문은 흐릿한 placeholder
2. **로딩** — 스피너 또는 skeleton bar
3. **정상** — 데이터 표시
4. **에러** — 짧은 메시지 + 재시도 버튼. 자세한 에러는 console에만

---

## 10. 절대 하지 말 것

- ❌ 라이트 모드 토글 추가 (1단계 범위 밖)
- ❌ 다른 디자인 시스템 차용 (Material, Tailwind 기본 등)
- ❌ 폰트 새로 추가 (3개만 사용)
- ❌ 그라데이션 남용 (특히 보라색 그라데이션 — AI 클리셰)
- ❌ 카드 그림자 진하게 (다크 모드에선 그림자보다 border가 더 효과적)
- ❌ 이모지 아이콘 (SVG inline 권장)
- ❌ 직접 hex 값 박기 (토큰 변수 사용 강제)

---

## 11. 메인 허브가 서브 대시보드에 요구하는 것

다음 채팅 세션에서 서브 대시보드를 만들 때, **반드시 다음 두 가지를 만족해야 한다**:

1. **Web App URL을 표준 LocalStorage 키에 저장**:
   - `familyOS.webAppUrl.<dashboardId>` (`dashboardId` = wealth / expense / health / future)
2. **Apps Script가 `?mode=summary` 요청에 대해 표준 응답 포맷 반환** (자세한 건 `backend-spec.md` 참고)

이 둘만 지키면 메인 허브가 즉시 해당 카드를 살려준다.
