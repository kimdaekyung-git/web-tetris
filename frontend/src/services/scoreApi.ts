/**
 * Score API Client
 *
 * 백엔드 API 호출을 위한 클라이언트
 * 오프라인 폴백 및 에러 핸들링 포함
 */

import { API_ENDPOINTS } from '@contracts/score.contract';
import type {
  PlayerCreate,
  PlayerResponse,
  ScoreCreate,
  ScoreResponse,
  RankingResponse,
} from '@contracts/types';
import { logger } from '../utils/logger';

// ============================================================
// Configuration
// ============================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const STORAGE_KEY_PLAYER_ID = 'tetris_player_id';
const STORAGE_KEY_NICKNAME = 'tetris_nickname';
const STORAGE_KEY_PENDING_SCORES = 'tetris_pending_scores';

// ============================================================
// Player Management
// ============================================================

/**
 * Get or create player ID from localStorage
 */
export function getPlayerId(): string {
  let playerId = localStorage.getItem(STORAGE_KEY_PLAYER_ID);
  if (!playerId) {
    playerId = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY_PLAYER_ID, playerId);
  }
  return playerId;
}

/**
 * Get player nickname from localStorage
 */
export function getNickname(): string {
  return localStorage.getItem(STORAGE_KEY_NICKNAME) || 'PLAYER';
}

/**
 * Set player nickname
 */
export function setNickname(nickname: string): void {
  const sanitized = nickname.slice(0, 10).toUpperCase();
  localStorage.setItem(STORAGE_KEY_NICKNAME, sanitized);
}

// ============================================================
// API Functions
// ============================================================

/**
 * Create or update player on the server
 */
export async function createPlayer(): Promise<PlayerResponse | null> {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PLAYERS}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: getPlayerId(),
        nickname: getNickname(),
      } satisfies PlayerCreate),
    });

    if (!response.ok) {
      logger.error('Failed to create player:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    logger.error('Network error creating player:', error);
    return null;
  }
}

/**
 * Save game score to the server
 * Falls back to localStorage if offline
 */
export async function saveScore(
  score: number,
  level: number,
  lines: number,
  playTimeSeconds: number
): Promise<ScoreResponse | null> {
  const scoreData: ScoreCreate = {
    player_id: getPlayerId(),
    score,
    level,
    lines,
    play_time_seconds: playTimeSeconds,
  };

  try {
    // Ensure player exists first
    await createPlayer();

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.SCORES}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scoreData),
    });

    if (!response.ok) {
      logger.error('Failed to save score:', response.status);
      savePendingScore(scoreData);
      return null;
    }

    // Try to submit any pending scores
    await submitPendingScores();

    return await response.json();
  } catch (error) {
    logger.error('Network error saving score:', error);
    savePendingScore(scoreData);
    return null;
  }
}

/**
 * Get top scores ranking
 */
export async function getRankings(limit: number = 10): Promise<RankingResponse | null> {
  try {
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.RANKINGS}?limit=${limit}`
    );

    if (!response.ok) {
      logger.error('Failed to get rankings:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    logger.error('Network error getting rankings:', error);
    return null;
  }
}

/**
 * Get player's score history
 */
export async function getPlayerScores(limit: number = 10): Promise<ScoreResponse[] | null> {
  try {
    const playerId = getPlayerId();
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.PLAYER_SCORES(playerId)}?limit=${limit}`
    );

    if (!response.ok) {
      logger.error('Failed to get player scores:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    logger.error('Network error getting player scores:', error);
    return null;
  }
}

// ============================================================
// Offline Fallback
// ============================================================

/**
 * Save score to localStorage for later submission
 */
function savePendingScore(scoreData: ScoreCreate): void {
  const pending = getPendingScores();
  pending.push({
    ...scoreData,
    timestamp: Date.now(),
  });
  localStorage.setItem(STORAGE_KEY_PENDING_SCORES, JSON.stringify(pending));
  logger.log('Score saved to pending queue:', pending.length, 'scores pending');
}

/**
 * Get pending scores from localStorage
 */
function getPendingScores(): (ScoreCreate & { timestamp: number })[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_PENDING_SCORES);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Try to submit pending scores
 */
async function submitPendingScores(): Promise<void> {
  const pending = getPendingScores();
  if (pending.length === 0) return;

  const stillPending: (ScoreCreate & { timestamp: number })[] = [];

  for (const scoreData of pending) {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.SCORES}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scoreData),
      });

      if (!response.ok) {
        stillPending.push(scoreData);
      }
    } catch {
      stillPending.push(scoreData);
    }
  }

  localStorage.setItem(STORAGE_KEY_PENDING_SCORES, JSON.stringify(stillPending));

  if (stillPending.length < pending.length) {
    logger.log('Submitted pending scores:', pending.length - stillPending.length);
  }
}

// ============================================================
// High Score (Local)
// ============================================================

const STORAGE_KEY_HIGH_SCORE = 'tetris_high_score';

/**
 * Get local high score
 */
export function getLocalHighScore(): number {
  const stored = localStorage.getItem(STORAGE_KEY_HIGH_SCORE);
  return stored ? parseInt(stored, 10) : 0;
}

/**
 * Update local high score if new score is higher
 */
export function updateLocalHighScore(score: number): boolean {
  const current = getLocalHighScore();
  if (score > current) {
    localStorage.setItem(STORAGE_KEY_HIGH_SCORE, score.toString());
    return true;
  }
  return false;
}
