# Coding Convention & AI Collaboration Guide

> 고품질/유지보수/보안을 위한 인간-AI 협업 운영 지침서입니다.

---

## MVP 캡슐

| # | 항목 | 내용 |
|---|------|------|
| 1 | 목표 | 설치 없이 브라우저에서 바로 즐기는 추억의 고전 테트리스 |
| 2 | 페르소나 | 전 연령 가족 단위 (점심시간/짧은 휴식 시간에 플레이) |
| 3 | 핵심 기능 | FEAT-1: 테트리스 기본 플레이 |
| 4 | 성공 지표 (노스스타) | 평균 세션 지속 시간 10분 이상 |
| 5 | 입력 지표 | 일일 활성 사용자(DAU), 스테이지 10 클리어 비율 |
| 6 | 비기능 요구 | 60fps 유지, 반응형(PC+모바일), 정확한 조작감 |
| 7 | Out-of-scope | 소셜 로그인, 리더보드 공유, 멀티플레이 |
| 8 | Top 리스크 | 조작감이 기대에 미치지 못함 |
| 9 | 완화/실험 | NES 테트리스 프레임 테이블 참조하여 정확한 속도 구현 |
| 10 | 다음 단계 | API 계약 정의 및 테스트 케이스 작성 |

---

## 1. 핵심 원칙

### 1.1 신뢰하되, 검증하라 (Don't Trust, Verify)

AI가 생성한 코드는 반드시 검증해야 합니다:

- [ ] 코드 리뷰: 생성된 코드 직접 확인
- [ ] 테스트 실행: 자동화 테스트 통과 확인
- [ ] 게임 동작: 실제로 플레이하여 조작감 확인
- [ ] 60fps 확인: 브라우저 devtools로 프레임률 체크

### 1.2 최종 책임은 인간에게

- AI는 도구이고, 최종 결정과 책임은 개발자에게 있습니다
- 이해하지 못하는 코드는 사용하지 않습니다
- 게임 로직은 직접 테스트로 검증합니다

---

## 2. 프로젝트 구조

### 2.1 디렉토리 구조

```
classic-tetris/
├── frontend/
│   ├── src/
│   │   ├── game/                # Phaser 게임 코드
│   │   │   ├── scenes/          # 게임 씬
│   │   │   │   ├── BootScene.ts
│   │   │   │   ├── TitleScene.ts
│   │   │   │   ├── GameScene.ts
│   │   │   │   └── GameOverScene.ts
│   │   │   ├── objects/         # 게임 오브젝트
│   │   │   │   ├── Tetromino.ts
│   │   │   │   ├── Board.ts
│   │   │   │   └── ScoreManager.ts
│   │   │   ├── systems/         # 게임 시스템
│   │   │   │   ├── InputManager.ts
│   │   │   │   └── AudioManager.ts
│   │   │   └── config/          # 게임 설정
│   │   │       ├── game.config.ts
│   │   │       ├── tetrominos.ts
│   │   │       └── levels.ts
│   │   ├── services/            # API 호출
│   │   │   └── scoreApi.ts
│   │   ├── types/               # TypeScript 타입
│   │   │   └── game.types.ts
│   │   ├── mocks/               # MSW Mock
│   │   │   └── handlers/
│   │   └── main.ts              # 진입점
│   ├── public/
│   │   └── assets/              # 게임 에셋
│   │       ├── audio/
│   │       └── sprites/
│   └── tests/
│       ├── unit/
│       └── e2e/
│
├── backend/
│   ├── app/
│   │   ├── models/              # SQLAlchemy 모델
│   │   │   ├── __init__.py
│   │   │   └── score.py
│   │   ├── routes/              # API 라우트
│   │   │   ├── __init__.py
│   │   │   └── score.py
│   │   ├── schemas/             # Pydantic 스키마
│   │   │   └── score.py
│   │   ├── services/            # 비즈니스 로직
│   │   │   └── score.py
│   │   ├── database.py          # DB 연결
│   │   └── main.py              # FastAPI 앱
│   └── tests/
│       ├── unit/
│       └── api/
│
├── contracts/                   # API 계약 (BE/FE 공유)
│   ├── types.ts
│   └── score.contract.ts
│
├── docs/
│   └── planning/                # 기획 문서
│
├── docker-compose.yml
└── README.md
```

### 2.2 네이밍 규칙

| 대상 | 규칙 | 예시 |
|------|------|------|
| 파일 (씬/클래스) | PascalCase | `GameScene.ts` |
| 파일 (설정/유틸) | camelCase | `game.config.ts` |
| 파일 (Python) | snake_case | `score_service.py` |
| 클래스 | PascalCase | `Tetromino` |
| 함수/변수 | camelCase | `clearLines()` |
| 상수 | UPPER_SNAKE | `BOARD_WIDTH` |
| 타입/인터페이스 | PascalCase + I prefix(선택) | `TetrominoType` |

---

## 3. 게임 코드 원칙

### 3.1 Phaser 씬 구조

```typescript
// 씬 기본 구조
export class GameScene extends Phaser.Scene {
  // 타입 정의
  private board!: Board;
  private currentTetromino!: Tetromino;
  private scoreManager!: ScoreManager;

  constructor() {
    super({ key: 'GameScene' });
  }

  // 라이프사이클 메서드
  init(data: GameInitData): void { }
  preload(): void { }
  create(): void { }
  update(time: number, delta: number): void { }
}
```

### 3.2 게임 로직 분리

| 레이어 | 역할 | 파일 |
|--------|------|------|
| Scene | 씬 관리, 렌더링 | `scenes/*.ts` |
| Object | 게임 엔티티 로직 | `objects/*.ts` |
| System | 공통 시스템 (입력, 오디오) | `systems/*.ts` |
| Config | 상수, 설정 | `config/*.ts` |

### 3.3 게임 루프 최적화

```typescript
// Good: 게임 루프에서 가벼운 연산만
update(time: number, delta: number): void {
  this.dropTimer += delta;
  if (this.dropTimer >= this.dropInterval) {
    this.dropTetromino();
    this.dropTimer = 0;
  }
}

// Bad: 매 프레임 무거운 연산
update(): void {
  const allCells = this.board.getAllCells(); // 매번 새 배열 생성
  this.renderAllCells(allCells);
}
```

---

## 4. TypeScript 규칙

### 4.1 타입 정의

```typescript
// types/game.types.ts

// 테트로미노 타입
export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

// 좌표
export interface Position {
  x: number;
  y: number;
}

// 테트로미노 상태
export interface TetrominoState {
  type: TetrominoType;
  position: Position;
  rotation: 0 | 1 | 2 | 3;
  shape: number[][];
}

// 게임 상태
export interface GameState {
  score: number;
  level: number;
  lines: number;
  isGameOver: boolean;
  isPaused: boolean;
}
```

### 4.2 Null 처리

```typescript
// Good: Optional chaining + nullish coalescing
const score = gameState?.score ?? 0;

// Good: 명시적 체크
if (!currentTetromino) {
  this.spawnTetromino();
  return;
}

// Bad: 암묵적 any
const data = response.data;  // any 타입
```

---

## 5. Python (FastAPI) 규칙

### 5.1 라우트 구조

```python
# routes/score.py
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.score import ScoreCreate, ScoreResponse
from app.services.score import ScoreService

router = APIRouter(prefix="/api/v1/scores", tags=["scores"])

@router.post("/", response_model=ScoreResponse)
async def create_score(
    score_data: ScoreCreate,
    db: Session = Depends(get_db)
):
    """점수 저장"""
    service = ScoreService(db)
    return service.create_score(score_data)

@router.get("/", response_model=list[ScoreResponse])
async def get_rankings(
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """랭킹 조회"""
    service = ScoreService(db)
    return service.get_top_scores(limit)
```

### 5.2 서비스 레이어

```python
# services/score.py
from sqlalchemy.orm import Session
from app.models.score import Score
from app.schemas.score import ScoreCreate

class ScoreService:
    def __init__(self, db: Session):
        self.db = db

    def create_score(self, data: ScoreCreate) -> Score:
        score = Score(**data.model_dump())
        self.db.add(score)
        self.db.commit()
        self.db.refresh(score)
        return score

    def get_top_scores(self, limit: int = 10) -> list[Score]:
        return (
            self.db.query(Score)
            .order_by(Score.score.desc())
            .limit(limit)
            .all()
        )
```

---

## 6. AI 소통 원칙

### 6.1 하나의 채팅 = 하나의 작업

- 한 번에 하나의 명확한 작업만 요청
- 작업 완료 후 다음 작업 진행
- 컨텍스트가 길어지면 새 대화 시작

### 6.2 프롬프트 템플릿

```
## 작업
TASKS 문서의 T1.2 구현: Tetromino 클래스 구현

## 참조 문서
- TRD 섹션 9: 게임 로직 상세
- Design System 섹션 2.2: 테트로미노 컬러
- types/game.types.ts: TetrominoState 인터페이스

## 제약 조건
- Phaser 3 사용
- NES 회전 시스템 적용
- 60fps 유지

## 예상 결과
- frontend/src/game/objects/Tetromino.ts 생성
- 7가지 테트로미노 타입 지원
- 회전 로직 포함
```

### 6.3 게임 개발 특화 지침

| 작업 유형 | AI에게 요청 시 포함할 정보 |
|----------|---------------------------|
| 게임 로직 | 프레임 테이블, 속도 값, 충돌 규칙 |
| 입력 처리 | 키 매핑, DAS/ARR 설정 |
| 애니메이션 | 프레임 수, 타이밍, 이징 |
| 오디오 | 재생 타이밍, 볼륨, 루프 여부 |

---

## 7. 보안 체크리스트

### 7.1 절대 금지

- [ ] 비밀정보 하드코딩 금지
- [ ] .env 파일 커밋 금지
- [ ] 점수 조작 가능한 클라이언트 로직 금지

### 7.2 필수 적용

- [ ] 서버 측 점수 검증
- [ ] CORS 설정 (허용 도메인 제한)
- [ ] Rate limiting (점수 저장 API)

### 7.3 환경 변수

```bash
# .env.example (커밋 O)
DATABASE_URL=sqlite:///./tetris.db
CORS_ORIGINS=http://localhost:5173

# .env (커밋 X)
DATABASE_URL=sqlite:///./prod.db
CORS_ORIGINS=https://tetris.example.com
```

---

## 8. 테스트 워크플로우

### 8.1 게임 로직 테스트

```typescript
// tests/unit/tetromino.test.ts
import { describe, it, expect } from 'vitest';
import { Tetromino } from '../../src/game/objects/Tetromino';

describe('Tetromino', () => {
  describe('rotation', () => {
    it('should rotate clockwise', () => {
      const tetromino = new Tetromino('T', { x: 5, y: 0 });
      tetromino.rotateClockwise();
      expect(tetromino.rotation).toBe(1);
    });

    it('should wrap rotation after 4', () => {
      const tetromino = new Tetromino('T', { x: 5, y: 0 });
      for (let i = 0; i < 4; i++) {
        tetromino.rotateClockwise();
      }
      expect(tetromino.rotation).toBe(0);
    });
  });
});
```

### 8.2 API 테스트

```python
# tests/api/test_score.py
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_create_score():
    response = client.post(
        "/api/v1/scores/",
        json={
            "player_id": "test-uuid",
            "score": 12500,
            "level": 5,
            "lines": 45,
            "play_time_seconds": 300
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["score"] == 12500

def test_get_rankings():
    response = client.get("/api/v1/scores/?limit=10")
    assert response.status_code == 200
    data = response.json()
    assert len(data) <= 10
```

### 8.3 실행 명령어

```bash
# 프론트엔드 테스트
npm run test              # 단위 테스트
npm run test:coverage     # 커버리지
npx playwright test       # E2E

# 백엔드 테스트
pytest                    # 전체 테스트
pytest --cov=app          # 커버리지
pytest tests/api/         # API 테스트만
```

---

## 9. Git 워크플로우

### 9.1 브랜치 전략

```
main          # 프로덕션
├── develop   # 개발 통합
│   ├── feature/game-core        # 게임 핵심 로직
│   ├── feature/game-ui          # UI/UX
│   ├── feature/score-api        # 점수 API
│   ├── feature/audio            # 오디오 시스템
│   └── fix/drop-speed           # 버그 수정
```

### 9.2 커밋 메시지

```
feat(game): 테트로미노 회전 시스템 구현

- 시계방향/반시계방향 회전
- 월 킥 처리
- TRD 섹션 9.1 구현 완료
```

**타입:**
- `feat`: 새 기능
- `fix`: 버그 수정
- `perf`: 성능 개선
- `refactor`: 리팩토링
- `test`: 테스트
- `docs`: 문서

---

## 10. 코드 품질 도구

### 10.1 설정

**프론트엔드:**
```json
// package.json scripts
{
  "lint": "eslint src --ext .ts,.tsx",
  "format": "prettier --write src",
  "type-check": "tsc --noEmit"
}
```

**백엔드:**
```toml
# pyproject.toml
[tool.ruff]
line-length = 88
select = ["E", "F", "I"]

[tool.black]
line-length = 88
```

### 10.2 Pre-commit

```yaml
# .pre-commit-config.yaml
repos:
  - repo: local
    hooks:
      - id: frontend-lint
        name: Frontend Lint
        entry: npm run lint
        language: system
        files: ^frontend/
      - id: backend-lint
        name: Backend Lint
        entry: ruff check
        language: system
        files: ^backend/
```

---

## Decision Log 참조

| ID | 항목 | 선택 | 근거 |
|----|------|------|------|
| D-18 | 게임 코드 구조 | Scene/Object/System 분리 | 관심사 분리, 테스트 용이 |
| D-19 | 타입 시스템 | TypeScript strict 모드 | 런타임 에러 방지 |
| D-20 | API 구조 | Service 레이어 분리 | 비즈니스 로직 재사용 |
