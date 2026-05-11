import { z } from 'zod';
export declare const videoJobSettingsSchema: z.ZodObject<{
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
}, z.core.$strip>;
export declare const videoJobResultSchema: z.ZodObject<{
    clips: z.ZodArray<z.ZodString>;
    mergedFile: z.ZodString;
    durationSeconds: z.ZodNumber;
}, z.core.$strip>;
export declare const videoIpcSchema: {
    'video-select-file': {
        args: z.ZodTuple<[], null>;
        return: z.ZodNullable<z.ZodString>;
    };
    'video-select-folder': {
        args: z.ZodTuple<[], null>;
        return: z.ZodNullable<z.ZodString>;
    };
    'video-check-ffmpeg': {
        args: z.ZodTuple<[], null>;
        return: z.ZodObject<{
            ffmpeg: z.ZodBoolean;
            ffprobe: z.ZodBoolean;
        }, z.core.$strip>;
    };
    'video-process': {
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
};
