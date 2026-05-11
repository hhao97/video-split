import { ipcSchemas, type ChannelArgs, type ChannelReturn } from '@/lib/conveyor/schemas';
/**
 * Helper to register IPC handlers
 * @param channel - The IPC channel to register the handler for
 * @param handler - The handler function to register
 * @returns void
 */
export declare const handle: <T extends keyof typeof ipcSchemas>(channel: T, handler: (...args: ChannelArgs<T>) => ChannelReturn<T>) => void;
