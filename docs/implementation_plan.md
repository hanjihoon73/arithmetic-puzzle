# 구현 계획 - Dev Mode 추가

## 목표
테스트 편의를 위해 생명력(Lives) 제한 없이 플레이할 수 있는 'Dev Mode' 토글 추가.

## 구현 상세

### 1. 상태 관리 (`src/store/gameStore.ts`)
- **State 추가**: `devMode: boolean` (기본값 `false`)
- **Action 추가**: `toggleDevMode: () => void`
- **로직 수정**:
  - `placeNumber` 함수에서 오답 처리 시:
    - `devMode`가 `true`이면 `lives`를 감소시키지 않음 (`Math.max(0, lives - 1)` 로직 우회).
    - 오답 표시는 그대로 유지 (빨간색).

### 2. UI (`src/components/game/Header.tsx`)
- 헤더 우측(설정 버튼 옆)에 **Dev Mode 토글 버튼** 추가.
- 활성화 시 시각적 표시 (예: "DEV ON" 배지 또는 버튼 색상 변경).
- 아이콘: `Code` or `Bug` icon from `lucide-react`.

## 검증 시나리오
1. 토글 클릭 -> Dev Mode ON/OFF 전환 확인.
2. Dev Mode ON 상태에서 오답 입력 -> 하트 감소 안 함.
3. Dev Mode OFF 상태에서 오답 입력 -> 하트 감소.
