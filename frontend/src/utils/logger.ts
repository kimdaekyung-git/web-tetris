/**
 * Logger Utility
 *
 * 프로덕션 환경에서 console 출력 제어
 */

const isDev = import.meta.env.DEV;

export const logger = {
    /**
     * 개발 환경에서만 출력
     */
    log: (...args: unknown[]) => {
        if (isDev) {
            console.log(...args);
        }
    },

    /**
     * 개발 환경에서만 경고 출력
     */
    warn: (...args: unknown[]) => {
        if (isDev) {
            console.warn(...args);
        }
    },

    /**
     * 모든 환경에서 에러 출력 (중요한 에러는 항상 기록)
     */
    error: (...args: unknown[]) => {
        console.error(...args);
    },

    /**
     * 개발 환경에서만 디버그 출력
     */
    debug: (...args: unknown[]) => {
        if (isDev) {
            console.debug(...args);
        }
    },
};
