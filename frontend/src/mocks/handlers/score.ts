/**
 * MSW Handlers for Score API
 *
 * Mock Service Worker 핸들러 - 백엔드 없이 프론트엔드 개발 가능
 */

import { http, HttpResponse, delay } from 'msw';
import type {
  PlayerCreate,
  PlayerResponse,
  ScoreCreate,
  ScoreResponse,
  RankingResponse,
} from '@contracts/types';
import { API_ENDPOINTS } from '@contracts/score.contract';

// In-memory storage for mocking
const players = new Map<string, PlayerResponse>();
const scores: ScoreResponse[] = [];

// Simulated network delay (ms)
const NETWORK_DELAY = 100;

export const scoreHandlers = [
  /**
   * POST /api/v1/players
   * Create or update a player
   */
  http.post(API_ENDPOINTS.PLAYERS, async ({ request }) => {
    await delay(NETWORK_DELAY);

    const body = (await request.json()) as PlayerCreate;

    // Validate request
    if (!body.id) {
      return HttpResponse.json({ detail: 'id is required' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const existingPlayer = players.get(body.id);

    if (existingPlayer) {
      // Update last_played_at
      const updatedPlayer: PlayerResponse = {
        ...existingPlayer,
        last_played_at: now,
      };
      players.set(body.id, updatedPlayer);
      return HttpResponse.json(updatedPlayer);
    }

    // Create new player
    const newPlayer: PlayerResponse = {
      id: body.id,
      nickname: body.nickname || 'PLAYER',
      created_at: now,
      last_played_at: now,
    };
    players.set(body.id, newPlayer);
    return HttpResponse.json(newPlayer, { status: 200 });
  }),

  /**
   * POST /api/v1/scores
   * Save a game score
   */
  http.post(API_ENDPOINTS.SCORES, async ({ request }) => {
    await delay(NETWORK_DELAY);

    const body = (await request.json()) as ScoreCreate;

    // Validate request
    if (!body.player_id) {
      return HttpResponse.json({ detail: 'player_id is required' }, { status: 400 });
    }

    // Check player exists
    if (!players.has(body.player_id)) {
      return HttpResponse.json({ detail: 'Player not found' }, { status: 404 });
    }

    // Validate score data
    if (body.score < 0) {
      return HttpResponse.json({ detail: 'score must be >= 0' }, { status: 400 });
    }
    if (body.level < 1 || body.level > 10) {
      return HttpResponse.json({ detail: 'level must be 1-10' }, { status: 400 });
    }

    // Create score
    const newScore: ScoreResponse = {
      id: crypto.randomUUID(),
      player_id: body.player_id,
      score: body.score,
      level: body.level,
      lines: body.lines,
      play_time_seconds: body.play_time_seconds,
      created_at: new Date().toISOString(),
    };
    scores.push(newScore);

    // Update player's last_played_at
    const player = players.get(body.player_id)!;
    players.set(body.player_id, {
      ...player,
      last_played_at: newScore.created_at,
    });

    return HttpResponse.json(newScore);
  }),

  /**
   * GET /api/v1/scores
   * Get top scores ranking
   */
  http.get(API_ENDPOINTS.RANKINGS, async ({ request }) => {
    await delay(NETWORK_DELAY);

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);

    // Sort by score descending
    const sortedScores = [...scores].sort((a, b) => b.score - a.score);

    // Build ranking response
    const data = sortedScores.slice(0, limit).map((score, index) => ({
      rank: index + 1,
      player_nickname: players.get(score.player_id)?.nickname || 'UNKNOWN',
      score: score.score,
      level: score.level,
      lines: score.lines,
      created_at: score.created_at,
    }));

    const response: RankingResponse = {
      data,
      total: scores.length,
    };

    return HttpResponse.json(response);
  }),

  /**
   * GET /api/v1/scores/:playerId
   * Get player's score history
   */
  http.get(`${API_ENDPOINTS.RANKINGS}/:playerId`, async ({ request, params }) => {
    await delay(NETWORK_DELAY);

    const { playerId } = params;
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);

    // Filter by player_id and sort by created_at descending
    const playerScores = scores
      .filter((s) => s.player_id === playerId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);

    return HttpResponse.json(playerScores);
  }),
];

// Helper functions for testing
export const mockHelpers = {
  /** Reset all mock data */
  reset: () => {
    players.clear();
    scores.length = 0;
  },

  /** Add a mock player directly */
  addPlayer: (player: PlayerResponse) => {
    players.set(player.id, player);
  },

  /** Add a mock score directly */
  addScore: (score: ScoreResponse) => {
    scores.push(score);
  },

  /** Get current mock state */
  getState: () => ({
    players: Array.from(players.values()),
    scores: [...scores],
  }),
};
