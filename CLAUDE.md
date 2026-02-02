# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

클래식 테트리스 웹 게임 - 고전 게임 포맷과 음악을 재현한 10스테이지 테트리스

## Tech Stack

- **Frontend**: HTML5 Canvas + Vanilla JavaScript (또는 TypeScript)
- **Audio**: Web Audio API for classic tetris music and sound effects
- **Build**: Vite (빠른 개발 서버 및 빌드)
- **Styling**: CSS3 with retro pixel-art aesthetic

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Architecture

```
src/
├── game/           # Game core logic
│   ├── Tetromino.js    # Tetromino shapes and rotation
│   ├── Board.js        # Game board state management
│   ├── GameLoop.js     # Main game loop and timing
│   └── Score.js        # Scoring and level progression
├── audio/          # Sound management
│   └── AudioManager.js # BGM and SFX handling
├── ui/             # UI components
│   ├── Renderer.js     # Canvas rendering
│   └── Menu.js         # Start/pause/game over screens
├── assets/         # Static assets
│   ├── audio/          # Music and sound effects
│   └── sprites/        # Pixel art sprites (if needed)
└── main.js         # Entry point
```

## Game Specifications

- **Stages**: 1-10, each with increasing speed
- **Controls**: Arrow keys (move/rotate), Space (hard drop), P (pause)
- **Scoring**: Classic NES Tetris scoring system
- **Music**: Korobeiniki (Type A) and other classic themes
- **Features**: Ghost piece, next piece preview, hold piece, line clear animations

## Key Implementation Notes

- Canvas 기반 렌더링으로 60fps 유지
- requestAnimationFrame으로 게임 루프 구현
- 레벨별 낙하 속도는 NES 테트리스 프레임 테이블 참조
- SRS(Super Rotation System) 또는 클래식 회전 시스템 적용
- localStorage로 하이스코어 저장
