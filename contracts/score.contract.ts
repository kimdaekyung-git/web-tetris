/**
 * Classic Tetris - Score API Contract
 *
 * API 엔드포인트 정의 및 계약
 * Base URL: /api/v1
 */

import type {
  PlayerCreate,
  PlayerResponse,
  ScoreCreate,
  ScoreResponse,
  RankingResponse,
  ApiError,
} from './types';

// ============================================================
// API Configuration
// ============================================================

export const API_BASE_URL = '/api/v1';

export const API_ENDPOINTS = {
  /** POST /api/v1/players - Create or update player */
  PLAYERS: `${API_BASE_URL}/players`,

  /** POST /api/v1/scores - Save game score */
  SCORES: `${API_BASE_URL}/scores`,

  /** GET /api/v1/scores - Get ranking list */
  RANKINGS: `${API_BASE_URL}/scores`,

  /** GET /api/v1/scores/:playerId - Get player's score history */
  PLAYER_SCORES: (playerId: string) => `${API_BASE_URL}/scores/${playerId}`,
} as const;

// ============================================================
// API Contract Definitions
// ============================================================

/**
 * POST /api/v1/players
 * Create or update a player
 */
export interface CreatePlayerContract {
  request: PlayerCreate;
  response: PlayerResponse;
  errors: {
    400: ApiError; // Invalid request
  };
}

/**
 * POST /api/v1/scores
 * Save a game score
 */
export interface CreateScoreContract {
  request: ScoreCreate;
  response: ScoreResponse;
  errors: {
    400: ApiError; // Invalid request
    404: ApiError; // Player not found
  };
}

/**
 * GET /api/v1/scores?limit=10
 * Get top scores ranking
 */
export interface GetRankingsContract {
  queryParams: {
    limit?: number; // Default: 10
  };
  response: RankingResponse;
}

/**
 * GET /api/v1/scores/:playerId?limit=10
 * Get player's score history
 */
export interface GetPlayerScoresContract {
  pathParams: {
    playerId: string;
  };
  queryParams: {
    limit?: number; // Default: 10
  };
  response: ScoreResponse[];
}

// ============================================================
// Type Guards
// ============================================================

export function isApiError(obj: unknown): obj is ApiError {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'detail' in obj &&
    typeof (obj as ApiError).detail === 'string'
  );
}

// ============================================================
// Request/Response Examples (for testing)
// ============================================================

export const MOCK_DATA = {
  player: {
    request: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      nickname: 'PLAYER1',
    } satisfies PlayerCreate,
    response: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      nickname: 'PLAYER1',
      created_at: '2026-02-02T10:00:00Z',
      last_played_at: '2026-02-02T10:00:00Z',
    } satisfies PlayerResponse,
  },
  score: {
    request: {
      player_id: '550e8400-e29b-41d4-a716-446655440000',
      score: 12500,
      level: 5,
      lines: 42,
      play_time_seconds: 300,
    } satisfies ScoreCreate,
    response: {
      id: '660e8400-e29b-41d4-a716-446655440001',
      player_id: '550e8400-e29b-41d4-a716-446655440000',
      score: 12500,
      level: 5,
      lines: 42,
      play_time_seconds: 300,
      created_at: '2026-02-02T10:05:00Z',
    } satisfies ScoreResponse,
  },
  ranking: {
    response: {
      data: [
        {
          rank: 1,
          player_nickname: 'ACE',
          score: 999999,
          level: 10,
          lines: 200,
          created_at: '2026-02-01T12:00:00Z',
        },
        {
          rank: 2,
          player_nickname: 'PLAYER1',
          score: 12500,
          level: 5,
          lines: 42,
          created_at: '2026-02-02T10:05:00Z',
        },
      ],
      total: 2,
    } satisfies RankingResponse,
  },
} as const;
