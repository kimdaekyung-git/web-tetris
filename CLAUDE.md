# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Classic Tetris - 고전 NES 테트리스 스타일을 재현한 웹 게임  
Phaser 3 프레임워크 기반의 프론트엔드와 FastAPI 백엔드로 구성된 풀스택 프로젝트

## Tech Stack

### Frontend
- **Framework**: Phaser 3.70.0 (HTML5 게임 엔진)
- **Language**: TypeScript 5.9.3
- **Build Tool**: Vite 5.0+
- **Testing**: Vitest (unit) + Playwright (E2E)
- **Audio**: Web Audio API (외부 파일 없이 음악/효과음 생성)

### Backend
- **Framework**: FastAPI 0.109+
- **Language**: Python 3.11+
- **ORM**: SQLAlchemy 2.0+
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **Security**: SlowAPI (rate limiting)
- **Testing**: pytest + httpx

### Deployment
- **Frontend**: Cloudflare Pages
- **Backend**: Railway
- **CI/CD**: GitHub Actions (planned)

## Development Commands

```bash
# Frontend
cd frontend
npm install
npm run dev              # Dev server (http://localhost:5173)
npm run build            # Production build
npm run test             # Unit tests
npm run test:e2e         # E2E tests
npm run lint             # ESLint

# Backend
cd backend
python -m venv .venv
source .venv/bin/activate  # or .venv\\Scripts\\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload  # Dev server (http://localhost:8000)
pytest tests/ -v         # Run tests
ruff check .             # Linting
```

## Architecture

```
classic-tetris/
├── frontend/
│   ├── src/
│   │   ├── game/               # Phaser 3 게임 코드
│   │   │   ├── scenes/         # Phaser scenes (Title, Game)
│   │   │   ├── objects/        # Game objects (Board, Tetromino)
│   │   │   ├── systems/        # Game systems (Audio, Collision, Scoring)
│   │   │   └── config/         # Game configuration
│   │   ├── services/           # API clients
│   │   │   └── scoreApi.ts     # Score API client (with offline fallback)
│   │   ├── utils/              # Utilities
│   │   │   └── logger.ts       # Production-safe logger
│   │   └── main.ts             # Entry point
│   ├── tests/
│   │   ├── unit/               # Vitest unit tests
│   │   └── e2e/                # Playwright E2E tests
│   └── vite.config.ts
│
├── backend/
│   ├── app/
│   │   ├── routes/             # API routes
│   │   │   └── score.py        # Score endpoints (with rate limiting)
│   │   ├── models/             # SQLAlchemy models
│   │   │   └── score.py        # Player & Score models
│   │   ├── schemas/            # Pydantic schemas
│   │   │   └── score.py        # Request/Response schemas (with validation)
│   │   ├── config.py           # Settings (Pydantic V2)
│   │   ├── database.py         # DB connection
│   │   └── main.py             # FastAPI app (with SlowAPI limiter)
│   ├── tests/
│   │   └── api/                # pytest integration tests
│   └── requirements.txt
│
├── contracts/                   # Shared TypeScript types
│   ├── score.contract.ts       # API endpoints
│   └── types.ts                # Shared types
│
└── docs/
    └── planning/               # Project planning documents
```

## Game Specifications

### Core Mechanics
- **7 Tetrominoes**: I, O, T, S, Z, J, L (클래식 색상)
- **10 Levels**: NES 테트리스 프레임 테이블 기반 속도
- **Scoring**: 1줄=40, 2줄=100, 3줄=300, 4줄(Tetris)=1200 (레벨 곱수)
- **Board Size**: 10x20

### Controls
- **PC**: Arrow keys (move/rotate), Space (hard drop), P (pause)
- **Mobile**: Touch controls (swipe, tap, buttons)

### Audio
- **BGM**: 코로베이니키 (Korobeiniki) - Web Audio API로 재현
- **SFX**: Move, Rotate, Drop, Clear, Tetris, Level Up, Game Over

## Key Implementation Notes

### Frontend
- **Phaser 3 Scene Structure**: TitleScene → GameScene
- **60fps Game Loop**: Phaser의 update() 메서드 활용
- **State Management**: GameScene 내부에서 관리
- **Offline Support**: scoreApi.ts에서 localStorage 폴백
- **Logger Utility**: 프로덕션 환경에서 console 출력 제어

### Backend
- **Rate Limiting**: SlowAPI (10-30 req/min per endpoint)
- **Input Validation**: 
  - UUID 형식 검증 (정규식)
  - 닉네임 정제 (영숫자, `-`, `_`만 허용)
  - 점수/시간 상한값 체크
- **CORS**: 환경변수로 동적 설정
- **Datetime**: Python 3.12+ 호환 (datetime.now(UTC))

### Testing Strategy
- **TDD Approach**: RED → GREEN → REFACTOR
- **Frontend**: Vitest (unit) + Playwright (E2E)
- **Backend**: pytest (integration tests)
- **Coverage**: 핵심 로직 위주

## Code Quality Standards

### Frontend
- **Linting**: ESLint + @typescript-eslint
- **Formatting**: Prettier
- **Type Safety**: TypeScript strict mode
- **Console Usage**: logger 유틸리티 사용 (console 직접 사용 금지)

### Backend
- **Linting**: Ruff
- **Type Hints**: 모든 함수에 타입 힌트 추가
- **Pydantic**: V2 SettingsConfigDict 사용
- **Import Sorting**: Ruff auto-fix

## Recent Improvements (2026-02)

### Phase 1: Code Quality
- ✅ Pydantic V2 migration (ConfigDict)
- ✅ datetime.utcnow() → datetime.now(UTC)
- ✅ Ruff linting (11 errors → 0)
- ✅ Logger utility (production-safe console)

### Phase 3: Security & Performance
- ✅ SlowAPI rate limiting
- ✅ Enhanced input validation (UUID, sanitization)
- ✅ Audio manager optimization

## API Documentation

FastAPI 자동 문서:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- OpenAPI JSON: `http://localhost:8000/openapi.json`

## Environment Variables

### Frontend (.env)
```bash
VITE_API_URL=http://localhost:8000  # Backend API URL
```

### Backend (.env)
```bash
DATABASE_URL=sqlite:///./tetris.db          # DB connection
CORS_ORIGINS=http://localhost:5173          # Frontend URLs (comma-separated)
ENVIRONMENT=development                      # development | production
PORT=8000                                    # Server port
PYTHONUNBUFFERED=1                          # Python output buffering
```

## Deployment

See `README.md` for detailed deployment guide:
- Frontend: Cloudflare Pages
- Backend: Railway
- Database: PostgreSQL (Railway managed)
