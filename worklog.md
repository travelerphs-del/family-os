# Family OS — Worklog (Live)

> 가족 통합 대시보드. 메인 허브 + 5개 서브 대시보드 (Wealth / Expense / Health / Future / Travel).
> 본 파일은 **현재 상태 / 컨벤션 / Pending** 만 유지. 절대 비대화 X.
> 상세 세션 기록 (결정·산출물·LESSON·COST) 은 `worklog-archive.md` 에 누적.

---

## 파일맵

```
family-os/
├── index.html              ← 메인 허브 (5번째 카드 Travel 추가, Session 6)
├── design-tokens.css       ← 공통 CSS 변수 (--acc-travel coral 추가)
├── design-system.md        ← 디자인 가이드 (Travel 행 추가)
├── common.js               ← 공통 JS (window.FamilyOS, 26 public API, DASHBOARDS 5개)
├── manifest.json + icon.svg ← PWA
├── backend-spec.md         ← Apps Script 응답 표준 (v0.3, Travel kpi/스키마 추가)
├── dashboard-template.html ← 새 대시보드 시작점
├── apps-script-template.gs ← 백엔드 시작점
├── wealth.html  + wealth-apps-script.gs   ← Phase 2 완료
├── expense.html + expense-apps-script.gs  ← Phase 2 완료
├── health.html  + health-apps-script.gs   ← Phase 2 완료
├── future.html  + future-apps-script.gs   ← Phase 2 완료 (v0.1.1)
├── travel.html  + travel-apps-script.gs   ← Session 6 Phase A 완료 (메인만)
├── worklog.md              ← 이 파일 (슬림 현재 상태)
├── worklog-archive.md      ← Session 1 ~ 6 누적 (참조용, 첨부 X)
└── context-{dashboard}.md  ← 대시보드별 작업 시작용 컨텍스트
                              (현재: wealth, health, travel)
```

## 컨벤션

| 항목 | 값 |
|---|---|
| Apps Script 응답 envelope | `{ok: true, data: {kpi, tasks, updated_at}}` |
| Write 패턴 (필수) | `doPost` + `Content-Type: text/plain;charset=utf-8` (CORS preflight 회피) |
| LocalStorage 키 prefix | `familyOS.webAppUrl.{id}` |
| 대시보드 id | `wealth`, `expense`, `health`, `future`, `travel` |
| 가족 id (시트 진실의 원천) | `dad`, `mom`, `son1`(=도비, 형), `son2`(=로비, 동생) |
| 호스팅 | GitHub Pages (public repo) |
| 백엔드 | 대시보드별 독립 Apps Script + 독립 스프레드시트 |
| 인증 | Web App URL 기기별 LocalStorage 저장 (백업 코드 export/import 지원) |
| 시트 격리 원칙 | 각 대시보드 Apps Script 는 자기 시트만 읽음. 결합은 메인 허브 |
| Travel ↔ Expense 연동 | 메모 태깅 (`#trip_id`). Travel 측은 비용 모름 |
| 테마 | 다크 전용 (`#0A0B0F` + 골드 `#E5C158`) |
| 폰트 | Fraunces (display), Pretendard (body), JetBrains Mono (mono) |
| 악센트 | Wealth=골드, Expense=인디고, Health=민트, Future=라벤더, Travel=코랄 |

## 대시보드 현재 상태

| 대시보드 | 버전 | 상태 / 비고 |
|---|---|---|
| 메인 허브 `index.html` | v0.1.0 + 5.2 + 5.3 + 6 | 5번째 카드 Travel 추가 (가로 전체 span, 비대칭) |
| Wealth | 배포됨 | **수정 예정**: daily snapshot 미작동, MoM/YoY 동일값, 전체금액 오차, 주가 미세 오차, 올해 수익 계산 변경, 추가 기능 |
| Expense | 배포됨 | OAuth 폐기 (doPost 통일). 안정 |
| Health | 배포됨 | **기능 추가 예정**: 아이들(도비/로비) 1주일 운동 스케줄 |
| Future | v0.1.1 | 외부 시트 의존 끊음, `마일스톤_금액` 컬럼 활용 |
| Travel | **v0.1.0 Phase A** | 메인 페이지만 완성 (세계지도 SVG + 2열 + 여행 추가/편집). 개별 여행 페이지는 Phase B |

## Cross-cutting Pending

1. **Travel Phase B** — 개별 여행 페이지 (`travel.html?trip=...`). Mapbox 통합 + 검색 자동완성 + 카테고리 핀 9개+other + 별점 + 필터. **다음 세션 후보** (`context-travel.md` 참조)
2. **Travel ↔ Expense 비용 표기 방식 결정** — Phase B 진입 시 옵션 A(Expense API 호출) / B(수동 입력) / C(표기 안 함) 결정 필요
3. **같은 도시 재방문 시각화** — Phase A 데이터 모델 (`country_code`+`city_key`) 준비됨. Phase B 에서 회색/유색 구현
4. **Wealth 대수정** — daily snapshot 복구 + 전체금액/주가 오차 + 올해 수익 계산 + 추가 기능 → 다음 Wealth 세션 (`context-wealth.md` 참조)
5. **Health 기능 추가** — 아이들 운동 스케줄 입출력 → 다음 Health 세션 (`context-health.md` 참조)
6. **LocalStorage 영속성 진단 결과** — Session 5.2 의 자동 배너/콘솔 로그 사용자 보고 미수령
7. **Future P004 마이그레이션 완료 후** — `parseEokFromText` fallback 제거 가능

## 세션 종료 시 worklog 업데이트 규칙

본 파일에 직접 작성하지 말 것. 다음 순서로 처리:

1. 세션 상세 진행을 `worklog-archive.md` 에 새 섹션으로 추가 (Session N.M 형식)
   - 포함: 배경 / 결정 / CODE / VERIFICATION / LESSON / COST / PENDING
2. 본 파일에서 변경:
   - "대시보드 현재 상태" 표의 해당 행
   - "Cross-cutting Pending" 갱신 (완료 항목 제거, 신규 추가)
   - "파일맵" (신규 파일 생긴 경우)
   - "컨벤션" (규칙 변경된 경우)
3. 컨벤션 변경 시: `backend-spec.md` 도 같이 보강 필요한지 점검
