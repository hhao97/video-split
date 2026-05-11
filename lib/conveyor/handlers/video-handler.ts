import { BrowserWindow, dialog } from 'electron'
import { spawn } from 'child_process'
import { mkdir, writeFile } from 'fs/promises'
import { existsSync } from 'fs'
import { basename, extname, join } from 'path'
import { tmpdir } from 'os'
import { handle } from '@/lib/main/shared'
import type { ChannelArgs, ChannelReturn } from '@/lib/conveyor/schemas'

type VideoSettings = ChannelArgs<'video-process'>[0]

const VIDEO_EXTENSIONS = ['mp4', 'mov', 'mkv', 'avi', 'webm', 'm4v']

const runProcess = (command: string, args: string[]) =>
  new Promise<string>((resolve, reject) => {
    const child = spawn(command, args, { windowsHide: true })
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

const getFontFile = () => {
  if (process.platform === 'win32') {
    const candidates = [
      'C:\\Windows\\Fonts\\msyh.ttc',
      'C:\\Windows\\Fonts\\simhei.ttf',
      'C:\\Windows\\Fonts\\arial.ttf',
    ]
    return candidates.find((file) => existsSync(file))
  }
  if (process.platform === 'darwin') {
    return '/System/Library/Fonts/PingFang.ttc'
  }
  return '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
}

const ffmpegPath = (filePath: string) => filePath.replace(/\\/g, '/').replace(/:/g, '\\:')

const textPositionExpr = (position: VideoSettings['textPosition']) => {
  if (position === 'top') return 'h*0.12'
  if (position === 'center') return '(h-text_h)/2'
  return 'h-h*0.16-text_h'
}

const buildFilter = (settings: VideoSettings, textFile: string) => {
  const base = 'scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080'
  const text = settings.overlayText.trim()
  if (!text) return base

  const fontFile = getFontFile()
  const fontPart = fontFile ? `:fontfile='${ffmpegPath(fontFile)}'` : ''
  return [
    base,
    `drawtext=textfile='${ffmpegPath(textFile)}'${fontPart}:fontcolor=${settings.textColor}:fontsize=58:x=(w-text_w)/2:y=${textPositionExpr(settings.textPosition)}:box=1:boxcolor=black@0.35:boxborderw=24`,
  ].join(',')
}

const outputBaseName = (inputFile: string) => basename(inputFile, extname(inputFile)).replace(/[^\w.-]+/g, '_')

const writeConcatFile = async (clips: string[]) => {
  const listFile = join(tmpdir(), `video-split-concat-${Date.now()}.txt`)
  const content = clips.map((clip) => `file '${clip.replace(/\\/g, '/').replace(/'/g, "'\\''")}'`).join('\n')
  await writeFile(listFile, content, 'utf8')
  return listFile
}

const processVideo = async (settings: VideoSettings): Promise<ChannelReturn<'video-process'>> => {
  const ffmpegReady = await commandExists('ffmpeg')
  const ffprobeReady = await commandExists('ffprobe')
  if (!ffmpegReady || !ffprobeReady) {
    throw new Error('未检测到 ffmpeg 或 ffprobe，请先安装 FFmpeg 并加入系统 PATH。')
  }

  await mkdir(settings.clipsOutputDir, { recursive: true })
  await mkdir(settings.mergedOutputDir, { recursive: true })

  const durationSeconds = await getVideoDuration(settings.inputFile)
  const textFile = join(tmpdir(), `video-split-text-${Date.now()}.txt`)
  await writeFile(textFile, settings.overlayText, 'utf8')

  const clips: string[] = []
  const baseName = outputBaseName(settings.inputFile)
  const segmentCount = Math.ceil(durationSeconds / settings.segmentSeconds)

  for (let index = 0; index < segmentCount; index += 1) {
    const start = index * settings.segmentSeconds
    const length = Math.min(settings.segmentSeconds, durationSeconds - start)
    if (length < 0.5) continue

    const clipPath = join(settings.clipsOutputDir, `${baseName}_${String(index + 1).padStart(3, '0')}.mp4`)
    await runProcess('ffmpeg', [
      '-y',
      '-ss',
      String(start),
      '-i',
      settings.inputFile,
      '-t',
      String(length),
      '-vf',
      buildFilter(settings, textFile),
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
      clipPath,
    ])
    clips.push(clipPath)
  }

  if (clips.length === 0) {
    throw new Error('没有生成任何视频片段。')
  }

  const listFile = await writeConcatFile(clips)
  const mergedFile = join(settings.mergedOutputDir, `${baseName}_mixed.mp4`)
  await runProcess('ffmpeg', ['-y', '-f', 'concat', '-safe', '0', '-i', listFile, '-c', 'copy', mergedFile])

  return { clips, mergedFile, durationSeconds }
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

  handle('video-process', processVideo)
}
