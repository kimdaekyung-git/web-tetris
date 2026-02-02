/**
 * Classic Tetris - Shared Types (API Contract)
 *
 * 이 파일은 프론트엔드와 백엔드 간의 공유 타입을 정의합니다.
 * Pydantic 스키마 (backend/app/schemas/score.py)와 동기화 필요
 */

// ============================================================
// Player Types
// ============================================================

/** Player creation request */
export interface PlayerCreate {
  /** Client-generated UUID */
  id: string;
  /** Player nickname (max 10 chars) */
  nickname?: string;
}

/** Player response */
export interface PlayerResponse {
  id: string;
  nickname: string;
  created_at: string; // ISO 8601
  last_played_at: string; // ISO 8601
}

// ============================================================
// Score Types
// ============================================================

/** Score creation request */
export interface ScoreCreate {
  /** Player UUID */
  player_id: string;
  /** Final score (>= 0) */
  score: number;
  /** Reached level (1-10) */
  level: number;
  /** Lines cleared (>= 0) */
  lines: number;
  /** Play time in seconds (>= 0) */
  play_time_seconds: number;
}

/** Score response */
export interface ScoreResponse {
  id: string;
  player_id: string;
  score: number;
  level: number;
  lines: number;
  play_time_seconds: number;
  created_at: string; // ISO 8601
}

// ============================================================
// Ranking Types
// ============================================================

/** Single ranking entry */
export interface RankingEntry {
  rank: number;
  player_nickname: string;
  score: number;
  level: number;
  lines: number;
  created_at: string; // ISO 8601
}

/** Ranking list response */
export interface RankingResponse {
  data: RankingEntry[];
  total: number;
}

// ============================================================
// API Error Response
// ============================================================

/** Standard error response */
export interface ApiError {
  detail: string;
}
