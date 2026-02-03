# Classic Tetris

추억의 고전 테트리스를 웹에서 즐기세요! NES 테트리스 스타일의 8bit 감성과 코로베이니키 BGM을 그대로 재현했습니다.

## Features

- 클래식 테트리스 게임플레이 (7가지 테트로미노)
- 10단계 스테이지 시스템 (NES 프레임 테이블 기반)
- 고전 BGM 및 효과음 (코로베이니키)
- 점수/하이스코어 시스템
- PC + 모바일 반응형 지원

## Tech Stack

| 영역 | 기술 |
|------|------|
| Frontend | Phaser 3 + TypeScript + Vite |
| Backend | FastAPI + Python 3.11+ + SQLAlchemy |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Testing | Vitest + pytest + Playwright |
| Security | SlowAPI Rate Limiting |
| Deployment | Cloudflare Pages + Railway |

## Project Structure

```
classic-tetris/
├── frontend/          # Phaser 3 게임 클라이언트
├── backend/           # FastAPI 점수 API
├── contracts/         # API 계약 (공유 타입)
└── docs/planning/     # 기획 문서
```

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

#### Windows PowerShell

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

#### Windows CMD

```cmd
cd backend
python -m venv .venv
.venv\Scripts\activate.bat
pip install -r requirements.txt
uvicorn app.main:app --reload
```

#### WSL / Linux / Mac

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Controls

| Action | PC | Mobile |
|--------|-----|--------|
| Move Left | ← / A | Left Touch |
| Move Right | → / D | Right Touch |
| Soft Drop | ↓ / S | Swipe Down |
| Hard Drop | Space | Swipe Up |
| Rotate CW | ↑ / W / X | Rotate Button |
| Rotate CCW | Z | - |
| Pause | P / ESC | Pause Button |

## API Documentation

### Endpoints

Backend API는 FastAPI로 구현되어 있으며, 자동 생성된 문서를 제공합니다:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
- **OpenAPI JSON**: `http://localhost:8000/openapi.json`

### Rate Limiting

모든 API 엔드포인트는 남용 방지를 위한 Rate Limiting이 적용되어 있습니다:

| 엔드포인트 | Limit |
|-----------|-------|
| `POST /api/v1/players` | 10 req/min |
| `POST /api/v1/scores` | 20 req/min |
| `GET /api/v1/scores` | 30 req/min |
| `GET /api/v1/scores/{player_id}` | 30 req/min |

### Input Validation

- **UUID 형식 검증**: 플레이어 ID는 표준 UUID v4 형식 필수
- **닉네임 정제**: 영숫자, 공백, `-`, `_`만 허용 (최대 10자)
- **점수 제한**: 0 ~ 9,999,999점
- **플레이 시간**: 최대 24시간

## Deployment

### Frontend (Cloudflare Pages)

1. Cloudflare Pages에서 GitHub 저장소 연결
2. 빌드 설정:
   ```
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   ```
3. 환경 변수:
   ```
   VITE_API_URL=https://your-api-domain.railway.app
   NODE_VERSION=18
   ```

### Backend (Railway)

1. Railway에서 새 프로젝트 생성
2. GitHub 연결 후 Root Directory: `backend` 설정
3. 환경 변수 설정:
   ```
   DATABASE_URL=postgresql://...
   CORS_ORIGINS=https://your-frontend.pages.dev
   ENVIRONMENT=production
   PORT=8000
   PYTHONUNBUFFERED=1
   ```
4. 자동 배포 완료

자세한 배포 가이드는 `docs/deployment-guide.md`를 참조하세요.

## Testing

### Frontend Tests
```bash
cd frontend
npm run test              # Unit tests
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
npm run test:e2e          # E2E tests (Playwright)
```

### Backend Tests
```bash
cd backend
pytest tests/ -v          # All tests
pytest tests/ --cov       # With coverage
```

### Code Quality
```bash
# Frontend
cd frontend
npm run lint              # ESLint
npm run format:check      # Prettier
npm run type-check        # TypeScript

# Backend
cd backend
ruff check .              # Linting
ruff check . --fix        # Auto-fix
```

## Recent Improvements

### Phase 1: Code Quality (2026-02)
- ✅ Pydantic V2 migration
- ✅ Python 3.12+ datetime compatibility
- ✅ Logger utility for production-safe logging
- ✅ All linting errors fixed

### Phase 3: Security & Performance (2026-02)
- ✅ SlowAPI rate limiting
- ✅ Enhanced input validation (UUID, sanitization, limits)
- ✅ Audio manager optimizations

## License

MIT
