# 구현 계획 - 정교한 검증 및 상호작용 개선

## 목표
1. **엄격한 오답 처리**: 수식 자체가 틀리면, 그 수식에 포함된 모든 사용자 입력 숫자를 '오답'으로 처리 (부분 점수 없음).
2. **상호작용 개선**:
   - 오답이 표시된 숫자를 **Number Pool로 드래그하여 제거** 가능.
   - 오답이 표시된 셀을 선택한 후 빈 셀을 선택하여 **이동** 가능 (이미 선택 기능은 구현됨, 이동 로직 확인).

## 구현 상세

### 1. 상호작용 (Interaction)
#### [수정] [NumberPool.tsx](file:///d:/SynologyDrive/dev_projects/arithmetic-puzzle/src/components/game/NumberPool.tsx)
- `onDrop` 핸들러 추가: 그리드에서 숫자를 드래그하여 Pool에 놓으면 `removeNumber` 호출.
- `onDragOver` 핸들러 추가: 드롭 허용 (`e.preventDefault()`).

#### [수정] [gameStore.ts](file:///d:/SynologyDrive/dev_projects/arithmetic-puzzle/src/store/gameStore.ts)
- `selectCell` 로직 개선:
  - 현재 선택된 셀(A)이 있고, 새로운 빈 셀(B)을 클릭하면 -> A에서 B로 **이동** (`moveNumber`).
  - 현재는 `NumberPool`에서 선택된 숫자가 있으면 배치, 아니면 선택 변경만 함. 이를 확장.

### 2. 검증 로직 (Validation)
#### [수정] [gameStore.ts](file:///d:/SynologyDrive/dev_projects/arithmetic-puzzle/src/store/gameStore.ts)
- `placeNumber` 내부 검증 로직 변경:
  - `filledEquationIndices`로 찾은 수식 그룹에 대해:
  - 해당 그룹의 모든 셀이 `isCorrect` (정답 일치)인지 확인.
  - **하나라도 틀리면**, 그 그룹의 **모든 사용자 입력 셀**을 `isWrong: true`, `isCorrect: false`로 설정.
  - (기존: 개별 셀마다 정답 여부 체크 -> 변경: 그룹 전체가 정답이어야만 `Correct`, 아니면 전원 `Wrong`).

## 검증 시나리오
1. `2 + 3 = 1`을 만듦.
   - 기존: `2`(정답 2)는 초록색, `1`(정답 5)은 빨간색.
   - 변경: `2`도 빨간색, `1`도 빨간색. (수식 불일치).
2. 빨간색으로 표시된 `2`를 드래그해서 Number Pool에 놓음 -> 사라짐.
3. 빨간색으로 표시된 `1`을 클릭(선택) 후, 빈칸 클릭 -> 이동함.
