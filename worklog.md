# Family OS — Worklog (Live)

> 가족 통합 대시보드. 메인 허브 + 4개 서브 대시보드 (Wealth / Expense / Health / Future).
> 본 파일은 **현재 상태 / 컨벤션 / Pending** 만 유지. 절대 비대화 X.
> 상세 세션 기록 (결정·산출물·LESSON·COST) 은 `worklog-archive.md` 에 누적.

---

## 파일맵

```
family-os/
├── index.html              ← 메인 허브 (Session 5.3 카드 클릭 영역 확장 적용)
├── design-tokens.css       ← 공통 CSS 변수
├── design-system.md        ← 디자인 가이드
├── common.js               ← 공통 JS (window.FamilyOS, 26 public API)
├── manifest.json + icon.svg ← PWA
├── backend-spec.md         ← Apps Script 응답 표준 (v0.2)
├── dashboard-template.html ← 새 대시보드 시작점
├── apps-script-template.gs ← 백엔드 시작점
├── wealth.html  + wealth-apps-script.gs   ← Phase 2 완료
├── expense.html + expense-apps-script.gs  ← Phase 2 완료
├── health.html  + health-apps-script.gs   ← Phase 2 완료
├── future.html  + future-apps-script.gs   ← Phase 2 완료 (v0.1.1)
├── worklog.md              ← 이 파일 (슬림 현재 상태)
├── worklog-archive.md      ← Session 1 ~ 5.4 누적 (참조용, 첨부 X)
└── context-{dashboard}.md  ← 대시보드별 작업 시작용 컨텍스트
                              (현재: wealth, health. 나머지는 필요 시 생성)
```

## 컨벤션

| 항목 | 값 |
|---|---|
| Apps Script 응답 envelope | `{ok: true, data: {kpi, tasks, updated_at}}` |
| LocalStorage 키 prefix | `familyOS.webAppUrl.{id}` |
| 대시보드 id | `wealth`, `expense`, `health`, `future` |
| 가족 id (시트 진실의 원천) | `dad`, `mom`, `son1`(=도비, 형), `son2`(=로비, 동생) |
| 호스팅 | GitHub Pages (public repo) |
| 백엔드 | 대시보드별 독립 Apps Script + 독립 스프레드시트 |
| 인증 | Web App URL 기기별 LocalStorage 저장 (백업 코드 export/import 지원) |
| 시트 격리 원칙 | 각 대시보드 Apps Script 는 자기 시트만 읽음 |
| 테마 | 다크 전용 (`#0A0B0F` + 골드 `#E5C158`) |
| 폰트 | Fraunces (display), Pretendard (body), JetBrains Mono (mono) |
| 악센트 | Wealth=골드, Expense=인디고, Health=민트, Future=라벤더 |

## 대시보드 현재 상태

| 대시보드 | 버전 | 상태 / 비고 |
|---|---|---|
| 메인 허브 `index.html` | v0.1.0 + 5.2 + 5.3 | LocalStorage 영속성 진단·백업 포함. 카드 전체 클릭 가능 |
| Wealth | Session 6.x 완료 | 거래내역 시트 (`📥 거래내역`) 도입. 일일 `dailySyncJob` 트리거로 시세/보유/스냅샷 통합 동기화. `ensureRecentSync` 안전망 + 다수 fix |
| Expense | 배포됨 | OAuth 폐기 (doPost 통일). 안정 |
| Health | Session 7 완료 | 운동 스케줄 (도비/로비) 추가 — weekly+oneoff 하이브리드. PN 클릭 → 부모 HC 팝업 연동 |
| Future | v0.1.1 | 외부 시트 의존 끊음, `마일스톤_금액` 컬럼 활용 |

## Cross-cutting Pending

1. ~~**Wealth 대수정**~~ → Session 6.x 완료
2. ~~**Health 기능 추가** — 아이들 운동 스케줄~~ → Session 7 완료
3. **LocalStorage 영속성 진단 결과** — Session 5.2 의 자동 배너/콘솔 로그 사용자 보고 미수령
4. **Future P004 마이그레이션 완료 후** — `parseEokFromText` fallback 제거 가능
5. **노후 시뮬레이터** — `마일스톤_금액` 컬럼 활용 (Future 추가 작업 후보)
6. **Wealth — 일일스냅샷 부동산 평가 검증** (Session 6.x 미해결) — 전세보증금 차감이 일일스냅샷에 정상 반영되는지 다음 dailySyncJob 결과로 확인 필요 (목표: 부동산 평가 = 5건 평균 - 전세보증금)
7. **Wealth — 새 종목 추가 워크플로 정립** (Session 6.x) — 보유종목 시트에 종목 마스터 행 추가 + 거래내역에 매수 거래 추가, 두 곳 동시 입력 필요. 향후 폼/UI 검토
8. **Health — 개인 뷰에도 스케줄 표시 검토** (Session 7 후속) — 현재 메인 전체에만 표시. 사용자 피드백 후 결정
9. **Health — vital 시트 1만 행 도달 시 성능 점검** (Session 7 발견) — 현재 매번 전체 로드. 체중 매일 측정 시 가족 4명 / 5종목 / 10년 = ~5만 행. 그 시점에 시트 분기 또는 서버 페이징 필요
10. **worklog 일관성**: Session 6.x (Wealth 대수정) 가 worklog.md 에는 "완료" 로 적혀있지만 worklog-archive.md 엔 미반영. 이관 필요
11. **컨벤션 표 불일치**: 컨벤션 표의 가족 id 가 `son1`/`son2` 로 적혀있지만 실제 코드는 `robi`/`dobi` 사용. 한쪽 정정 필요 (`context-health.md` 도 동일 불일치)

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
