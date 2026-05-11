import { handle } from '@/lib/main/shared';
export const registerAppHandlers = (app) => {
    // App operations
    handle('version', () => app.getVersion());
};
