import { z } from 'zod';
export declare const windowIpcSchema: {
    'window-init': {
        args: z.ZodTuple<[], null>;
        return: z.ZodObject<{
            width: z.ZodNumber;
            height: z.ZodNumber;
            minimizable: z.ZodBoolean;
            maximizable: z.ZodBoolean;
            platform: z.ZodString;
        }, z.core.$strip>;
    };
    'window-is-minimizable': {
        args: z.ZodTuple<[], null>;
        return: z.ZodBoolean;
    };
    'window-is-maximizable': {
        args: z.ZodTuple<[], null>;
        return: z.ZodBoolean;
    };
    'window-minimize': {
        args: z.ZodTuple<[], null>;
        return: z.ZodVoid;
    };
    'window-maximize': {
        args: z.ZodTuple<[], null>;
        return: z.ZodVoid;
    };
    'window-close': {
        args: z.ZodTuple<[], null>;
        return: z.ZodVoid;
    };
    'window-maximize-toggle': {
        args: z.ZodTuple<[], null>;
        return: z.ZodVoid;
    };
    'web-undo': {
        args: z.ZodTuple<[], null>;
        return: z.ZodVoid;
    };
    'web-redo': {
        args: z.ZodTuple<[], null>;
        return: z.ZodVoid;
    };
    'web-cut': {
        args: z.ZodTuple<[], null>;
        return: z.ZodVoid;
    };
    'web-copy': {
        args: z.ZodTuple<[], null>;
        return: z.ZodVoid;
    };
    'web-paste': {
        args: z.ZodTuple<[], null>;
        return: z.ZodVoid;
    };
    'web-delete': {
        args: z.ZodTuple<[], null>;
        return: z.ZodVoid;
    };
    'web-select-all': {
        args: z.ZodTuple<[], null>;
        return: z.ZodVoid;
    };
    'web-reload': {
        args: z.ZodTuple<[], null>;
        return: z.ZodVoid;
    };
    'web-force-reload': {
        args: z.ZodTuple<[], null>;
        return: z.ZodVoid;
    };
    'web-toggle-devtools': {
        args: z.ZodTuple<[], null>;
        return: z.ZodVoid;
    };
    'web-actual-size': {
        args: z.ZodTuple<[], null>;
        return: z.ZodVoid;
    };
    'web-zoom-in': {
        args: z.ZodTuple<[], null>;
        return: z.ZodVoid;
    };
    'web-zoom-out': {
        args: z.ZodTuple<[], null>;
        return: z.ZodVoid;
    };
    'web-toggle-fullscreen': {
        args: z.ZodTuple<[], null>;
        return: z.ZodVoid;
    };
    'web-open-url': {
        args: z.ZodTuple<[z.ZodString], null>;
        return: z.ZodVoid;
    };
};
