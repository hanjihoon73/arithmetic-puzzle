# 구현 계획 - 실시간 수식 피드백

사용자는 두 가지를 요청했습니다:
1. 퍼즐 수식을 `숫자` `연산자` `숫자` `=` `답` 형태로 제한 (현재 레벨 데이터는 이를 준수함).
2. 수식이 완성될 때마다 실시간으로 계산하여 피드백 제공.

## 목표
- 수식 완성 시 시각적 피드백(초록색 깜빡임 등)을 제공하여 사용자가 성취감을 느끼게 함.
- 올바른 수식이 완성되었을 때만 피드백을 제공.

## 사용자 검토 필요 사항
없음.

## 제안된 변경 사항

### [Helper] 게임 로직
#### [수정] [gameLogic.ts](file:///d:/SynologyDrive/dev_projects/arithmetic-puzzle/src/lib/gameLogic.ts)
- `detectCompletedEquations(grid: Cell[])`: 그리드 내에서 완성된(모든 칸이 채워지고 올바른) 수식들의 셀 인덱스 목록을 반환하는 함수 추가.
  - 가로(Row) 및 세로(Col) 탐색.
  - `Number` `Operator` `Number` `=` `Number` 패턴 인식.
  - 해당 수식이 수학적으로 참인지 검증 (또는 단순히 모든 셀이 `isCorrect`인지 확인).

### [Store] 게임 상태 관리
#### [수정] [gameStore.ts](file:///d:/SynologyDrive/dev_projects/arithmetic-puzzle/src/store/gameStore.ts)
- 상태 추가: `solvedEquations: number[][]` (완성된 수식에 포함된 셀 인덱스들의 배열 목록).
- `placeNumber` 액션 수정:
  - 숫자를 배치한 후 `detectCompletedEquations`를 호출.
  - 새로운 완성 수식이 발견되면 `solvedEquations` 상태 업데이트.
  - (옵션) 일시적인 효과를 위해 `lastSolvedEquation` 상태를 두어 애니메이션 트리거 가능.

### [Components] UI 피드백
#### [수정] [Cell.tsx](file:///d:/SynologyDrive/dev_projects/arithmetic-puzzle/src/components/game/Cell.tsx)
- `solvedEquations`에 포함된 셀인지 확인.
- 포함된 경우 특별한 스타일(예: 초록색 테두리 또는 배경 강조) 적용.
- 막 완성된 수식에 대한 애니메이션 효과 추가.

## 검증 계획
1. 레벨 1에서 첫 번째 수식(`2 + 3 = 5`)의 빈칸을 채움.
2. 마지막 숫자를 넣는 순간, 해당 수식을 구성하는 5개의 셀이 동시에 강조되는지 확인.
3. 세로 수식도 동일하게 작동하는지 확인.
4. 오답을 입력했을 때는 피드백이 발생하지 않는지 확인.
