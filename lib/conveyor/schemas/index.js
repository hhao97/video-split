import { windowIpcSchema } from './window-schema';
import { appIpcSchema } from './app-schema';
import { videoIpcSchema } from './video-schema';
// Define all IPC channel schemas in one place
export const ipcSchemas = {
    ...windowIpcSchema,
    ...appIpcSchema,
    ...videoIpcSchema,
};
// Runtime validation helpers
export const validateArgs = (channel, args) => {
    return ipcSchemas[channel].args.parse(args);
};
export const validateReturn = (channel, data) => {
    return ipcSchemas[channel].return.parse(data);
};
