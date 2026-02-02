/**
 * MSW Browser Setup
 *
 * 브라우저 환경에서 MSW 시작
 * 개발 모드에서만 사용
 */

import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);
