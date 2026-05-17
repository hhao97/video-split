import { z } from 'zod'

const colorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/)

export const videoTextSegmentSchema = z.object({
  text: z.string().default(''),
  textColor: colorSchema,
  backgroundColor: colorSchema,
  textSize: z.number().int().min(16).max(160),
  textXPercent: z.number().min(0).max(100),
  textYPercent: z.number().min(0).max(100),
})

export const videoJobSettingsSchema = z.object({
  inputFile: z.string().min(1),
  clipsOutputDir: z.string().min(1),
  subVideoDir: z.string().optional(),
  segmentSeconds: z.number().min(1).max(3600),
  maxSegments: z.number().int().min(1).optional(),
  textSegments: z.array(videoTextSegmentSchema),
  insertSubVideoEnabled: z.boolean(),
  insertSubVideoSeconds: z.number().min(1).max(3600),
})

export const videoInspectResultSchema = z.object({
  durationSeconds: z.number(),
})

export const videoSplitResultSchema = z.object({
  clips: z.array(z.string()),
  durationSeconds: z.number(),
  plannedSegmentCount: z.number(),
})

export const videoMergeSettingsSchema = z.object({
  clips: z.array(z.string()).min(1),
  mergedOutputDir: z.string().min(1),
  outputName: z.string().min(1),
})

export const videoMergeResultSchema = z.object({
  mergedFile: z.string(),
})

export const videoStopSplitResultSchema = z.object({
  stopped: z.boolean(),
})

export const videoIpcSchema = {
  'video-select-file': {
    args: z.tuple([]),
    return: z.string().nullable(),
  },
  'video-select-folder': {
    args: z.tuple([]),
    return: z.string().nullable(),
  },
  'video-check-ffmpeg': {
    args: z.tuple([]),
    return: z.object({
      ffmpeg: z.boolean(),
      ffprobe: z.boolean(),
    }),
  },
  'video-inspect': {
    args: z.tuple([z.object({ inputFile: z.string().min(1) })]),
    return: videoInspectResultSchema,
  },
  'video-preview-url': {
    args: z.tuple([z.object({ inputFile: z.string().min(1) })]),
    return: z.string(),
  },
  'video-split': {
    args: z.tuple([videoJobSettingsSchema]),
    return: videoSplitResultSchema,
  },
  'video-stop-split': {
    args: z.tuple([]),
    return: videoStopSplitResultSchema,
  },
  'video-merge': {
    args: z.tuple([videoMergeSettingsSchema]),
    return: videoMergeResultSchema,
  },
}
