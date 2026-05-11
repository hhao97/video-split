import { ipcMain } from 'electron';
import { validateArgs, validateReturn } from '@/lib/conveyor/schemas';
/**
 * Helper to register IPC handlers
 * @param channel - The IPC channel to register the handler for
 * @param handler - The handler function to register
 * @returns void
 */
export const handle = (channel, handler) => {
    ipcMain.handle(channel, async (_, ...args) => {
        try {
            const validatedArgs = validateArgs(channel, args);
            const result = await handler(...validatedArgs);
            return validateReturn(channel, result);
        }
        catch (error) {
            console.error(`IPC Error in ${channel}:`, error);
            throw error;
        }
    });
};
