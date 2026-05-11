import { z } from 'zod';
export declare const ipcSchemas: {
    readonly 'video-select-file': {
        args: z.ZodTuple<[], null>;
        return: z.ZodNullable<z.ZodString>;
    };
    readonly 'video-select-folder': {
        args: z.ZodTuple<[], null>;
        return: z.ZodNullable<z.ZodString>;
    };
    readonly 'video-check-ffmpeg': {
        args: z.ZodTuple<[], null>;
        return: z.ZodObject<{
            ffmpeg: z.ZodBoolean;
            ffprobe: z.ZodBoolean;
        }, z.core.$strip>;
    };
    readonly 'video-process': {
        args: z.ZodTuple<[z.ZodObject<{
            inputFile: z.ZodString;
            clipsOutputDir: z.ZodString;
            mergedOutputDir: z.ZodString;
            segmentSeconds: z.ZodNumber;
            overlayText: z.ZodDefault<z.ZodString>;
            textColor: z.ZodString;
            textPosition: z.ZodEnum<{
                center: "center";
                top: "top";
                bottom: "bottom";
            }>;
        }, z.core.$strip>], null>;
        return: z.ZodObject<{
            clips: z.ZodArray<z.ZodString>;
            mergedFile: z.ZodString;
            durationSeconds: z.ZodNumber;
        }, z.core.$strip>;
    };
    readonly version: {
        args: z.ZodTuple<[], null>;
        return: z.ZodString;
    };
    readonly 'window-init': {
        args: z.ZodTuple<[], null>;
        return: z.ZodObject<{
            width: z.ZodNumber;
            height: z.ZodNumber;
            minimizable: z.ZodBoolean;
            maximizable: z.ZodBoolean;
            platform: z.ZodString;
        }, z.core.$strip>;
    };
    readonly 'window-is-minimizable': {
        args: z.ZodTuple<[], null>;
        return: z.ZodBoolean;
    };
    readonly 'window-is-maximizable': {
        args: z.ZodTuple<[], null>;
        return: z.ZodBoolean;
    };
    readonly 'window-minimize': {
        args: z.ZodTuple<[], null>;
        return: z.ZodVoid;
    };
    readonly 'window-maximize': {
        args: z.ZodTuple<[], null>;
        return: z.ZodVoid;
    };
    readonly 'window-close': {
        args: z.ZodTuple<[], null>;
        return: z.ZodVoid;
    };
    readonly 'window-maximize-toggle': {
        args: z.ZodTuple<[], null>;
        return: z.ZodVoid;
    };
    readonly 'web-undo': {
        args: z.ZodTuple<[], null>;
        return: z.ZodVoid;
    };
    readonly 'web-redo': {
        args: z.ZodTuple<[], null>;
        return: z.ZodVoid;
    };
    readonly 'web-cut': {
        args: z.ZodTuple<[], null>;
        return: z.ZodVoid;
    };
    readonly 'web-copy': {
        args: z.ZodTuple<[], null>;
        return: z.ZodVoid;
    };
    readonly 'web-paste': {
        args: z.ZodTuple<[], null>;
        return: z.ZodVoid;
    };
    readonly 'web-delete': {
        args: z.ZodTuple<[], null>;
        return: z.ZodVoid;
    };
    readonly 'web-select-all': {
        args: z.ZodTuple<[], null>;
        return: z.ZodVoid;
    };
    readonly 'web-reload': {
        args: z.ZodTuple<[], null>;
        return: z.ZodVoid;
    };
    readonly 'web-force-reload': {
        args: z.ZodTuple<[], null>;
        return: z.ZodVoid;
    };
    readonly 'web-toggle-devtools': {
        args: z.ZodTuple<[], null>;
        return: z.ZodVoid;
    };
    readonly 'web-actual-size': {
        args: z.ZodTuple<[], null>;
        return: z.ZodVoid;
    };
    readonly 'web-zoom-in': {
        args: z.ZodTuple<[], null>;
        return: z.ZodVoid;
    };
    readonly 'web-zoom-out': {
        args: z.ZodTuple<[], null>;
        return: z.ZodVoid;
    };
    readonly 'web-toggle-fullscreen': {
        args: z.ZodTuple<[], null>;
        return: z.ZodVoid;
    };
    readonly 'web-open-url': {
        args: z.ZodTuple<[z.ZodString], null>;
        return: z.ZodVoid;
    };
};
export type IPCChannels = {
    [K in keyof typeof ipcSchemas]: {
        args: z.infer<(typeof ipcSchemas)[K]['args']>;
        return: z.infer<(typeof ipcSchemas)[K]['return']>;
    };
};
export type ChannelName = keyof typeof ipcSchemas;
export type ChannelArgs<T extends ChannelName> = IPCChannels[T]['args'];
export type ChannelReturn<T extends ChannelName> = IPCChannels[T]['return'];
export declare const validateArgs: <T extends ChannelName>(channel: T, args: unknown[]) => ChannelArgs<T>;
export declare const validateReturn: <T extends ChannelName>(channel: T, data: unknown) => ChannelReturn<T>;
