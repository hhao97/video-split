import { z } from 'zod'

const videoTextPosition = z.enum(['top', 'center', 'bottom'])

export const videoJobSettingsSchema = z.object({
  inputFile: z.string().min(1),
  clipsOutputDir: z.string().min(1),
  mergedOutputDir: z.string().min(1),
  segmentSeconds: z.number().min(1).max(3600),
  overlayText: z.string().default(''),
  textColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  textPosition: videoTextPosition,
})

export const videoJobResultSchema = z.object({
  clips: z.array(z.string()),
  mergedFile: z.string(),
  durationSeconds: z.number(),
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
  'video-process': {
    args: z.tuple([videoJobSettingsSchema]),
    return: videoJobResultSchema,
  },
}

