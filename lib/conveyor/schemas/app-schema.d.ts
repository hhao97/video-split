import { z } from 'zod';
export declare const appIpcSchema: {
    version: {
        args: z.ZodTuple<[], null>;
        return: z.ZodString;
    };
};
