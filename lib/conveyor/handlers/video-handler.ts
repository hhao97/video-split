import { BrowserWindow, dialog } from 'electron'
import { ChildProcessWithoutNullStreams, spawn } from 'child_process'
import { mkdir, readdir, writeFile } from 'fs/promises'
import { basename, extname, join } from 'path'
import { tmpdir } from 'os'
import { handle } from '@/lib/main/shared'
import type { ChannelArgs, ChannelReturn } from '@/lib/conveyor/schemas'

type VideoSettings = ChannelArgs<'video-split'>[0]
type VideoTextSegment = VideoSettings['textSegments'][number]
type MergeSettings = ChannelArgs<'video-merge'>[0]

const VIDEO_EXTENSIONS = ['mp4', 'mov', 'mkv', 'avi', 'webm', 'm4v']

let activeSplitProcess: ChildProcessWithoutNullStreams | null = null
let stopSplitRequested = false

const runProcess = (command: string, args: string[], options?: { splitProcess?: boolean }) =>
  new Promise<string>((resolve, reject) => {
    const child = spawn(command, args, { windowsHide: true })
    if (options?.splitProcess) {
      activeSplitProcess = child
    }
    let stdout = ''
    let stderr = ''

    child.stdout.on('data', (data) => {
      stdout += data.toString()
    })
    child.stderr.on('data', (data) => {
      stderr += data.toString()
    })
    child.on('error', reject)
    child.on('close', (code) => {
      if (options?.splitProcess && activeSplitProcess === child) {
        activeSplitProcess = null
      }
      if (stopSplitRequested && options?.splitProcess) {
        resolve(stdout.trim())
        return
      }
      if (code === 0) {
        resolve(stdout.trim())
        return
      }
      reject(new Error(stderr.trim() || `${command} exited with code ${code}`))
    })
  })

const commandExists = async (command: string) => {
  try {
    await runProcess(command, ['-version'])
    return true
  } catch {
    return false
  }
}

const getVideoDuration = async (inputFile: string) => {
  const output = await runProcess('ffprobe', [
    '-v',
    'error',
    '-show_entries',
    'format=duration',
    '-of',
    'default=noprint_wrappers=1:nokey=1',
    inputFile,
  ])
  const duration = Number.parseFloat(output)
  if (!Number.isFinite(duration) || duration <= 0) {
    throw new Error('无法读取视频时长，请确认文件可被 ffprobe 识别。')
  }
  return duration
}

const VIDEO_FILTER = 'scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920'
const SUB_VIDEO_FILTER = 'scale=1000:520:force_original_aspect_ratio=increase,crop=1000:520'
const SUB_VIDEO_X = 40
const SUB_VIDEO_Y = 720

const outputBaseName = (inputFile: string) => basename(inputFile, extname(inputFile)).replace(/[^\w.-]+/g, '_')
const outputFileName = (name: string) => `${basename(name, extname(name)).replace(/[^\w.-]+/g, '_') || 'merged'}.mp4`
const isVideoFile = (name: string) => VIDEO_EXTENSIONS.includes(extname(name).slice(1).toLowerCase())
const randomNumber = (min: number, max: number) => min + Math.random() * (max - min)

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const renderTextOverlay = async (segments: VideoTextSegment[]) => {
  const activeSegments = segments.filter((segment) => segment.text.trim())
  if (activeSegments.length === 0) return null

  const overlayWindow = new BrowserWindow({
    show: false,
    width: 1080,
    height: 1920,
    transparent: true,
    frame: false,
    webPreferences: {
      backgroundThrottling: false,
    },
  })
  const overlayFile = join(tmpdir(), `video-split-overlay-${Date.now()}.png`)
  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      html,
      body {
        width: 1080px;
        height: 1920px;
        margin: 0;
        overflow: hidden;
        background: transparent;
      }
      .text {
        position: absolute;
        max-width: 80%;
        transform: translate(-50%, -50%);
        padding: 24px;
        box-sizing: border-box;
        border-radius: 8px;
        font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", Arial, sans-serif;
        font-weight: 800;
        line-height: 1.25;
        text-align: center;
        text-shadow: 0 2px 14px rgba(0, 0, 0, 0.65);
        overflow-wrap: anywhere;
        white-space: pre-wrap;
      }
    </style>
  </head>
  <body>
    ${activeSegments
      .map(
        (segment) =>
          `<div class="text" style="left: ${segment.textXPercent}%; top: ${segment.textYPercent}%; background: ${segment.backgroundColor}; color: ${segment.textColor}; font-size: ${segment.textSize}px;">${escapeHtml(segment.text)}</div>`
      )
      .join('')}
  </body>
</html>`

  try {
    await overlayWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`)
    await new Promise((resolve) => setTimeout(resolve, 100))
    const image = await overlayWindow.capturePage()
    await writeFile(overlayFile, image.resize({ width: 1080, height: 1920 }).toPNG())
    return overlayFile
  } finally {
    overlayWindow.destroy()
  }
}

const buildSplitArgs = (
  settings: VideoSettings,
  start: number,
  length: number,
  clipPath: string,
  overlayFile: string | null,
  subVideoFile: string | null,
  subVideoSourceStart: number,
  subVideoInsertStart: number
) => {
  const args = ['-y', '-ss', String(start), '-i', settings.inputFile]
  const subVideoInputIndex = 1
  const overlayInputIndex = subVideoFile ? 2 : 1
  const shouldInsertSubVideo = Boolean(subVideoFile)

  if (subVideoFile) {
    args.push('-stream_loop', '-1', '-ss', String(subVideoSourceStart), '-i', subVideoFile)
  }
  if (overlayFile) {
    args.push('-loop', '1', '-i', overlayFile)
  }
  args.push('-t', String(length))

  if (shouldInsertSubVideo || overlayFile) {
    const filterParts = [`[0:v]${VIDEO_FILTER}[base]`]
    let currentLabel = 'base'

    if (shouldInsertSubVideo) {
      filterParts.push(
        `[${subVideoInputIndex}:v]${SUB_VIDEO_FILTER},setpts=PTS-STARTPTS+${subVideoInsertStart}/TB[sub]`,
        `[${currentLabel}][sub]overlay=${SUB_VIDEO_X}:${SUB_VIDEO_Y}:enable='between(t,${subVideoInsertStart},${subVideoInsertStart + settings.insertSubVideoSeconds})'[withSub]`
      )
      currentLabel = 'withSub'
    }

    if (overlayFile) {
      filterParts.push(`[${currentLabel}][${overlayInputIndex}:v]overlay=0:0:format=auto[v]`)
    } else {
      filterParts.push(`[${currentLabel}]null[v]`)
    }

    args.push('-filter_complex', filterParts.join(';'), '-map', '[v]', '-map', '0:a?')
  } else {
    args.push('-vf', VIDEO_FILTER)
  }

  args.push(
    '-c:v',
    'libx264',
    '-preset',
    'veryfast',
    '-crf',
    '23',
    '-pix_fmt',
    'yuv420p',
    '-c:a',
    'aac',
    '-b:a',
    '128k',
    '-movflags',
    '+faststart',
    clipPath
  )
  return args
}

const readSubVideoFiles = async (subVideoDir: string) => {
  const entries = await readdir(subVideoDir, { withFileTypes: true })
  return entries.filter((entry) => entry.isFile() && isVideoFile(entry.name)).map((entry) => join(subVideoDir, entry.name))
}

const pickRandomSubVideo = async (settings: VideoSettings, clipLength: number) => {
  if (!settings.insertSubVideoEnabled) return null
  if (!settings.subVideoDir) {
    throw new Error('已开启插入子视频，请先选择子视频目录。')
  }
  if (settings.insertSubVideoSeconds >= clipLength) {
    return null
  }

  const subVideoFiles = await readSubVideoFiles(settings.subVideoDir)
  if (subVideoFiles.length === 0) {
    throw new Error('子视频目录中没有可用的视频文件。')
  }

  const file = subVideoFiles[Math.floor(Math.random() * subVideoFiles.length)]
  const durationSeconds = await getVideoDuration(file)
  const sourceStart = durationSeconds > settings.insertSubVideoSeconds ? randomNumber(0, durationSeconds - settings.insertSubVideoSeconds) : 0
  const latestInsertStart = clipLength - settings.insertSubVideoSeconds
  const earliestInsertStart = Math.min(clipLength * 0.35, latestInsertStart)
  const insertStart = randomNumber(earliestInsertStart, latestInsertStart)

  return { file, sourceStart, insertStart }
}

const writeConcatFile = async (clips: string[]) => {
  const listFile = join(tmpdir(), `video-split-concat-${Date.now()}.txt`)
  const content = clips.map((clip) => `file '${clip.replace(/\\/g, '/').replace(/'/g, "'\\''")}'`).join('\n')
  await writeFile(listFile, content, 'utf8')
  return listFile
}

const ensureFfmpegReady = async () => {
  const ffmpegReady = await commandExists('ffmpeg')
  const ffprobeReady = await commandExists('ffprobe')
  if (!ffmpegReady || !ffprobeReady) {
    throw new Error('未检测到 ffmpeg 或 ffprobe，请先安装 FFmpeg 并加入系统 PATH。')
  }
}

const inspectVideo = async (settings: ChannelArgs<'video-inspect'>[0]): Promise<ChannelReturn<'video-inspect'>> => {
  await ensureFfmpegReady()
  return { durationSeconds: await getVideoDuration(settings.inputFile) }
}

const getPreviewUrl = (settings: ChannelArgs<'video-preview-url'>[0]): ChannelReturn<'video-preview-url'> => {
  return `local-video://${encodeURIComponent(settings.inputFile)}`
}

const splitVideo = async (settings: VideoSettings): Promise<ChannelReturn<'video-split'>> => {
  await ensureFfmpegReady()
  await mkdir(settings.clipsOutputDir, { recursive: true })
  stopSplitRequested = false

  const durationSeconds = await getVideoDuration(settings.inputFile)
  const overlayFile = await renderTextOverlay(settings.textSegments)

  const clips: string[] = []
  const baseName = outputBaseName(settings.inputFile)
  const fullSegmentCount = Math.ceil(durationSeconds / settings.segmentSeconds)
  const segmentCount = settings.maxSegments ? Math.min(fullSegmentCount, settings.maxSegments) : fullSegmentCount

  for (let index = 0; index < segmentCount; index += 1) {
    if (stopSplitRequested) break

    const start = index * settings.segmentSeconds
    const length = Math.min(settings.segmentSeconds, durationSeconds - start)
    if (length < 0.5) continue

    const clipPath = join(settings.clipsOutputDir, `${baseName}_${String(index + 1).padStart(3, '0')}.mp4`)
    const subVideo = await pickRandomSubVideo(settings, length)
    await runProcess(
      'ffmpeg',
      buildSplitArgs(
        settings,
        start,
        length,
        clipPath,
        overlayFile,
        subVideo?.file ?? null,
        subVideo?.sourceStart ?? 0,
        subVideo?.insertStart ?? 0
      ),
      { splitProcess: true }
    )
    if (!stopSplitRequested) {
      clips.push(clipPath)
    }
  }

  if (clips.length === 0) {
    if (stopSplitRequested) {
      stopSplitRequested = false
      return { clips, durationSeconds, plannedSegmentCount: segmentCount }
    }
    throw new Error('没有生成任何视频片段。')
  }

  stopSplitRequested = false
  return { clips, durationSeconds, plannedSegmentCount: segmentCount }
}

const stopSplit = (): ChannelReturn<'video-stop-split'> => {
  stopSplitRequested = true
  if (activeSplitProcess && !activeSplitProcess.killed) {
    activeSplitProcess.kill('SIGTERM')
  }
  return { stopped: true }
}

const mergeClips = async (settings: MergeSettings): Promise<ChannelReturn<'video-merge'>> => {
  await ensureFfmpegReady()
  await mkdir(settings.mergedOutputDir, { recursive: true })

  const listFile = await writeConcatFile(settings.clips)
  const mergedFile = join(settings.mergedOutputDir, outputFileName(settings.outputName))
  await runProcess('ffmpeg', ['-y', '-f', 'concat', '-safe', '0', '-i', listFile, '-c', 'copy', mergedFile])

  return { mergedFile }
}

export const registerVideoHandlers = (window: BrowserWindow) => {
  handle('video-select-file', async () => {
    const result = await dialog.showOpenDialog(window, {
      title: '选择长视频文件',
      properties: ['openFile'],
      filters: [{ name: 'Video', extensions: VIDEO_EXTENSIONS }],
    })
    return result.canceled ? null : result.filePaths[0]
  })

  handle('video-select-folder', async () => {
    const result = await dialog.showOpenDialog(window, {
      title: '选择输出目录',
      properties: ['openDirectory', 'createDirectory'],
    })
    return result.canceled ? null : result.filePaths[0]
  })

  handle('video-check-ffmpeg', async () => ({
    ffmpeg: await commandExists('ffmpeg'),
    ffprobe: await commandExists('ffprobe'),
  }))

  handle('video-inspect', inspectVideo)
  handle('video-preview-url', getPreviewUrl)
  handle('video-split', splitVideo)
  handle('video-stop-split', stopSplit)
  handle('video-merge', mergeClips)
}
