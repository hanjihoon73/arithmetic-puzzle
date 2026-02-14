# 구현 계획 - 셈셈퍼즐 (Arithmetic Puzzle)

이 문서는 업데이트된 PRD를 기반으로 셈셈퍼즐 게임을 구축하기 위한 단계를 설명합니다.

## 사용자 검토 필요
> [!IMPORTANT]
> - **게임 로직**: 크로스워드 검증 로직은 별도의 명시가 없는 한 표준 사칙연산 우선순위를 따르지만, 시각적 레이아웃은 왼쪽에서 오른쪽/위에서 아래로의 순차적 계산을 암시할 수 있습니다. 우리는 각 방정식 세그먼트의 `target` 값을 기반으로 엄격한 검증을 구현할 것입니다.
> - **레벨 데이터**: 테스트 목적으로 처음 몇 개의 레벨(예: 이미지의 레벨 62)을 모의 데이터로 생성할 예정입니다.

## 제안된 변경 사항

### 프로젝트 설정
#### [NEW] [프로젝트 초기화]
- Next.js 14 프로젝트를 Tailwind CSS 및 TypeScript로 초기화합니다.
- 의존성 설치: `zustand`, `framer-motion`, `lucide-react`, `clsx`, `tailwind-merge`.
- 폴더 구조 설정:
    - `src/components/game`: Board, Cell, NumberPool, Controls, Header
    - `src/store`: gameStore.ts
    - `src/lib`: gameLogic.ts, levelData.ts, utils.ts

### 핵심 로직 및 상태 관리
#### [NEW] [src/store/gameStore.ts](file:///d:/SynologyDrive/dev_projects/arithmetic-puzzle/src/store/gameStore.ts)
- 다음 상태를 위한 Zustand 스토어 정의:
    - `level`: 현재 레벨 데이터.
    - `grid`: 2D 배열의 셀 상태 (값, 타입, 상태).
    - `pool`: 사용 가능한 숫자 배열.
    - `lives`: 현재 생명 (기본 3).
    - `history`: 실행 취소(Undo) 기능을 위한 스택.
    - `status`: 'playing', 'won', 'lost'.
- 액션: `placeNumber(cell, value)`, `removeNumber(cell)`, `undo()`, `useHint()`, `useSmartFill()`.

#### [NEW] [src/lib/gameLogic.ts](file:///d:/SynologyDrive/dev_projects/arithmetic-puzzle/src/lib/gameLogic.ts)
- `validatePlacement(grid, row, col, value)`: 정답 맵을 기반으로 배치된 숫자가 올바른지 확인합니다.
- `checkWinCondition(grid)`: 모든 셀이 올바르게 채워졌는지 확인합니다.
- `getHint(grid, solution)`: 무작위 빈 셀의 좌표와 값을 반환합니다.
- `getSmartFill(grid, pool, solution)`: 풀(Pool)에서 가장 큰 값이 들어갈 셀을 반환합니다.

### UI 컴포넌트
#### [NEW] [src/components/game/Board.tsx](file:///d:/SynologyDrive/dev_projects/arithmetic-puzzle/src/components/game/Board.tsx)
- 레벨 데이터를 기반으로 게임 그리드를 동적으로 렌더링합니다.
- 숫자에 대한 드롭 이벤트를 처리합니다.

#### [NEW] [src/components/game/Cell.tsx](file:///d:/SynologyDrive/dev_projects/arithmetic-puzzle/src/components/game/Cell.tsx)
- 개별 셀 렌더링:
    - `Empty`: 드롭 대상.
    - `Number`: 드래그 가능(풀에서 가져온 경우) 또는 고정됨.
    - `Operator`: 표시 전용.
- 올바른/잘못된 배치에 대한 시각적 피드백 제공.

#### [NEW] [src/components/game/NumberPool.tsx](file:///d:/SynologyDrive/dev_projects/arithmetic-puzzle/src/components/game/NumberPool.tsx)
- 사용 가능한 숫자 카드를 렌더링합니다.
- `framer-motion` 또는 HTML5 Drag and Drop API를 사용하여 드래그 가능한 아이템 구현.

#### [NEW] [src/components/game/GameControls.tsx](file:///d:/SynologyDrive/dev_projects/arithmetic-puzzle/src/components/game/GameControls.tsx)
- 실행 취소(Undo), 힌트(Hint), 스마트 채우기(Smart Fill) 버튼.
- 아이템의 남은 횟수 표시.

#### [NEW] [src/components/game/Header.tsx](file:///d:/SynologyDrive/dev_projects/arithmetic-puzzle/src/components/game/Header.tsx)
- 레벨, 생명(하트), 코인 표시.

### 페이지
#### [NEW] [src/app/page.tsx](file:///d:/SynologyDrive/dev_projects/arithmetic-puzzle/src/app/page.tsx)
- 메인 게임 컨테이너.
- 시작 화면 / 게임 보드 / 결과 모달의 조건부 렌더링.

## 검증 계획

### 자동화 테스트
- `npm run dev`를 실행하여 개발 서버를 시작합니다.
- `npm run lint`로 린트 오류가 없는지 확인합니다.

### 수동 검증
1.  **게임 흐름**:
    - 게임을 시작하고 보드가 올바르게 로드되는지 확인합니다 (레벨 62 레이아웃).
    - 풀에서 올바른 빈칸으로 숫자를 드래그 -> 스냅되어 고정되어야 함.
    - 잘못된 빈칸으로 숫자를 드래그 -> 풀로 돌아가고 생명이 감소해야 함.
    - 모든 빈칸 채우기 -> "레벨 완료" 모달 표시.
    - 모든 생명 소진 -> "게임 오버" 모달 표시.
2.  **아이템**:
    - '실행 취소' 클릭 -> 마지막 이동이 되돌려져야 함.
    - '힌트' 클릭 -> 빈 셀 하나가 채워져야 함.
    - '스마트 채우기' 클릭 -> 남은 숫자 중 가장 큰 숫자가 채워져야 함.
3.  **반응형**:
    - 모바일 뷰(Chrome DevTools)에서 테스트 및 확인.
