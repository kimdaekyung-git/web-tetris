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
| Backend | FastAPI + Python 3.11+ |
| Database | SQLite |
| Testing | Vitest + pytest + Playwright |

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

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
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

## License

MIT
