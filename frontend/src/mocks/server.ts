/**
 * MSW Server Setup
 *
 * Node.js 환경 (테스트)에서 MSW 사용
 */

import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
