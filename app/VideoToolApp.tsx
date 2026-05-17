import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import {
  CheckCircle2,
  Clapperboard,
  FolderOpen,
  Loader2,
  Plus,
  Play,
  Scissors,
  Square,
  Trash2,
  Video,
  WandSparkles,
} from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { Switch } from '@/app/components/ui/switch'
import { useConveyor } from '@/app/hooks/use-conveyor'
import './styles/app.css'

type SplitResult = Awaited<ReturnType<Window['conveyor']['video']['split']>>
type MergeResult = Awaited<ReturnType<Window['conveyor']['video']['merge']>>
type ActiveSection = 'split' | 'merge'
type TextSegment = {
  text: string
  textColor: string
  backgroundColor: string
  textSize: number
  textXPercent: number
  textYPercent: number
}
type StoredVideoToolConfig = {
  inputFile: string
  clipsOutputDir: string
  subVideoDir: string
  mergedOutputDir: string
  segmentSeconds: number
  maxSegments: string
  textSegments: TextSegment[]
  activeTextIndex: number
  activeSection: ActiveSection
  insertSubVideoEnabled: boolean
  insertSubVideoSeconds: number
}

const createTextSegment = (index: number): TextSegment => ({
  text: index === 0 ? '精彩片段' : '',
  textColor: '#ffffff',
  backgroundColor: '#000000',
  textSize: 58,
  textXPercent: 50,
  textYPercent: 78,
})

const STORAGE_KEY = 'video-tool:last-config'
const DEFAULT_CONFIG: StoredVideoToolConfig = {
  inputFile: '',
  clipsOutputDir: '',
  subVideoDir: '',
  mergedOutputDir: '',
  segmentSeconds: 10,
  maxSegments: '',
  textSegments: [createTextSegment(0)],
  activeTextIndex: 0,
  activeSection: 'split',
  insertSubVideoEnabled: false,
  insertSubVideoSeconds: 3,
}
const isColor = (value: unknown) => typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value)
const isTextSegment = (value: unknown): value is TextSegment => {
  if (!value || typeof value !== 'object') return false

  const segment = value as Partial<TextSegment>
  return (
    typeof segment.text === 'string' &&
    isColor(segment.textColor) &&
    isColor(segment.backgroundColor) &&
    Number.isInteger(segment.textSize) &&
    segment.textSize >= 16 &&
    segment.textSize <= 160 &&
    typeof segment.textXPercent === 'number' &&
    segment.textXPercent >= 0 &&
    segment.textXPercent <= 100 &&
    typeof segment.textYPercent === 'number' &&
    segment.textYPercent >= 0 &&
    segment.textYPercent <= 100
  )
}
const loadStoredConfig = (): StoredVideoToolConfig => {
  if (typeof window === 'undefined') return DEFAULT_CONFIG

  try {
    const rawConfig = window.localStorage.getItem(STORAGE_KEY)
    if (!rawConfig) return DEFAULT_CONFIG

    const config = JSON.parse(rawConfig) as Partial<StoredVideoToolConfig>
    const textSegments =
      Array.isArray(config.textSegments) && config.textSegments.every(isTextSegment) && config.textSegments.length > 0
        ? config.textSegments
        : DEFAULT_CONFIG.textSegments
    const activeTextIndex =
      Number.isInteger(config.activeTextIndex) && config.activeTextIndex >= 0
        ? Math.min(config.activeTextIndex, textSegments.length - 1)
        : DEFAULT_CONFIG.activeTextIndex

    return {
      inputFile: typeof config.inputFile === 'string' ? config.inputFile : DEFAULT_CONFIG.inputFile,
      clipsOutputDir:
        typeof config.clipsOutputDir === 'string' ? config.clipsOutputDir : DEFAULT_CONFIG.clipsOutputDir,
      subVideoDir: typeof config.subVideoDir === 'string' ? config.subVideoDir : DEFAULT_CONFIG.subVideoDir,
      mergedOutputDir:
        typeof config.mergedOutputDir === 'string' ? config.mergedOutputDir : DEFAULT_CONFIG.mergedOutputDir,
      segmentSeconds:
        typeof config.segmentSeconds === 'number' && config.segmentSeconds >= 1 && config.segmentSeconds <= 3600
          ? config.segmentSeconds
          : DEFAULT_CONFIG.segmentSeconds,
      maxSegments: typeof config.maxSegments === 'string' ? config.maxSegments : DEFAULT_CONFIG.maxSegments,
      textSegments,
      activeTextIndex,
      activeSection: config.activeSection === 'merge' ? 'merge' : DEFAULT_CONFIG.activeSection,
      insertSubVideoEnabled:
        typeof config.insertSubVideoEnabled === 'boolean'
          ? config.insertSubVideoEnabled
          : DEFAULT_CONFIG.insertSubVideoEnabled,
      insertSubVideoSeconds:
        typeof config.insertSubVideoSeconds === 'number' &&
        config.insertSubVideoSeconds >= 1 &&
        config.insertSubVideoSeconds <= 3600
          ? config.insertSubVideoSeconds
          : DEFAULT_CONFIG.insertSubVideoSeconds,
    }
  } catch {
    return DEFAULT_CONFIG
  }
}

export default function App() {
  const video = useConveyor('video')
  const storedConfig = useMemo(loadStoredConfig, [])
  const [inputFile, setInputFile] = useState(storedConfig.inputFile)
  const [clipsOutputDir, setClipsOutputDir] = useState(storedConfig.clipsOutputDir)
  const [subVideoDir, setSubVideoDir] = useState(storedConfig.subVideoDir)
  const [mergedOutputDir, setMergedOutputDir] = useState(storedConfig.mergedOutputDir)
  const [segmentSeconds, setSegmentSeconds] = useState(storedConfig.segmentSeconds)
  const [maxSegments, setMaxSegments] = useState(storedConfig.maxSegments)
  const [textSegments, setTextSegments] = useState<TextSegment[]>(storedConfig.textSegments)
  const [activeTextIndex, setActiveTextIndex] = useState(storedConfig.activeTextIndex)
  const [activeSection, setActiveSection] = useState<ActiveSection>(storedConfig.activeSection)
  const [insertSubVideoEnabled, setInsertSubVideoEnabled] = useState(storedConfig.insertSubVideoEnabled)
  const [insertSubVideoSeconds, setInsertSubVideoSeconds] = useState(storedConfig.insertSubVideoSeconds)
  const [ffmpegReady, setFfmpegReady] = useState<boolean | null>(null)
  const [durationSeconds, setDurationSeconds] = useState<number | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [splitRunning, setSplitRunning] = useState(false)
  const [mergeRunning, setMergeRunning] = useState(false)
  const [error, setError] = useState('')
  const [splitResult, setSplitResult] = useState<SplitResult | null>(null)
  const [mergeResult, setMergeResult] = useState<MergeResult | null>(null)
  const [previewScale, setPreviewScale] = useState(420 / 1080)
  const previewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    video.checkFfmpeg().then((status) => setFfmpegReady(status.ffmpeg && status.ffprobe))
  }, [video])

  useEffect(() => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        inputFile,
        clipsOutputDir,
        subVideoDir,
        mergedOutputDir,
        segmentSeconds,
        maxSegments,
        textSegments,
        activeTextIndex,
        activeSection,
        insertSubVideoEnabled,
        insertSubVideoSeconds,
      } satisfies StoredVideoToolConfig)
    )
  }, [
    activeSection,
    activeTextIndex,
    clipsOutputDir,
    inputFile,
    insertSubVideoEnabled,
    insertSubVideoSeconds,
    maxSegments,
    mergedOutputDir,
    segmentSeconds,
    subVideoDir,
    textSegments,
  ])

  useEffect(() => {
    const preview = previewRef.current
    if (!preview) return

    const resizeObserver = new ResizeObserver(([entry]) => {
      setPreviewScale(entry.contentRect.width / 1080)
    })
    resizeObserver.observe(preview)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  useEffect(() => {
    setDurationSeconds(null)
    setSplitResult(null)
    setMergeResult(null)
    setPreviewUrl('')
    setError('')

    if (!inputFile) return

    let canceled = false
    video
      .inspect({ inputFile })
      .then((data) => {
        if (!canceled) setDurationSeconds(data.durationSeconds)
      })
      .catch((err) => {
        if (!canceled) setError(err instanceof Error ? err.message : String(err))
      })

    video
      .previewUrl({ inputFile })
      .then((url) => {
        if (!canceled) setPreviewUrl(url)
      })
      .catch(() => {
        if (!canceled) setPreviewUrl('')
      })

    return () => {
      canceled = true
    }
  }, [inputFile, video])

  const maxSegmentsValue = Number(maxSegments)
  const maxSegmentsValid = maxSegments === '' || (Number.isInteger(maxSegmentsValue) && maxSegmentsValue >= 1)
  const optionalMaxSegments = maxSegmentsValid && maxSegments !== '' ? maxSegmentsValue : undefined
  const activeTextSegment = textSegments[activeTextIndex] ?? textSegments[0]
  const textSegmentsValid = textSegments.every(
    (segment) => Number.isInteger(segment.textSize) && segment.textSize >= 16 && segment.textSize <= 160
  )
  const plannedSegments = useMemo(() => {
    if (!durationSeconds || segmentSeconds < 1) return 0
    const count = Math.ceil(durationSeconds / segmentSeconds)
    return optionalMaxSegments ? Math.min(count, optionalMaxSegments) : count
  }, [durationSeconds, optionalMaxSegments, segmentSeconds])

  const canSplit = useMemo(
    () =>
      Boolean(
        inputFile &&
        clipsOutputDir &&
        (!insertSubVideoEnabled || subVideoDir) &&
        segmentSeconds >= 1 &&
        insertSubVideoSeconds >= 1 &&
        insertSubVideoSeconds < segmentSeconds &&
        maxSegmentsValid &&
        textSegmentsValid &&
        !splitRunning &&
        !mergeRunning
      ),
    [
      clipsOutputDir,
      inputFile,
      insertSubVideoEnabled,
      insertSubVideoSeconds,
      maxSegmentsValid,
      mergeRunning,
      segmentSeconds,
      splitRunning,
      subVideoDir,
      textSegmentsValid,
    ]
  )
  const canMerge = useMemo(
    () => Boolean(splitResult?.clips.length && mergedOutputDir && !splitRunning && !mergeRunning),
    [mergedOutputDir, mergeRunning, splitResult?.clips.length, splitRunning]
  )

  const chooseFile = async () => {
    const file = await video.selectFile()
    if (file) setInputFile(file)
  }

  const chooseFolder = async (setter: (value: string) => void) => {
    const folder = await video.selectFolder()
    if (folder) setter(folder)
  }

  const updateTextSegment = (index: number, values: Partial<TextSegment>) => {
    setTextSegments((segments) =>
      segments.map((segment, segmentIndex) => (segmentIndex === index ? { ...segment, ...values } : segment))
    )
  }

  const addTextSegment = () => {
    setTextSegments((segments) => {
      const next = [...segments, createTextSegment(segments.length)]
      setActiveTextIndex(next.length - 1)
      return next
    })
  }

  const removeActiveTextSegment = () => {
    setTextSegments((segments) => {
      if (segments.length <= 1) return segments

      const next = segments.filter((_, index) => index !== activeTextIndex)
      setActiveTextIndex(Math.min(activeTextIndex, next.length - 1))
      return next
    })
  }

  const split = async () => {
    setSplitRunning(true)
    setError('')
    setSplitResult(null)
    setMergeResult(null)
    try {
      const data = await video.split({
        inputFile,
        clipsOutputDir,
        subVideoDir,
        segmentSeconds,
        maxSegments: optionalMaxSegments,
        textSegments,
        insertSubVideoEnabled,
        insertSubVideoSeconds,
      })
      setSplitResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setSplitRunning(false)
    }
  }

  const stopSplit = async () => {
    setError('')
    try {
      await video.stopSplit()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  const movePreviewText = (event: ReactPointerEvent<HTMLSpanElement>) => {
    const preview = previewRef.current
    if (!preview) return

    const rect = preview.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100
    updateTextSegment(activeTextIndex, {
      textXPercent: Math.min(Math.max(x, 0), 100),
      textYPercent: Math.min(Math.max(y, 0), 100),
    })
  }

  const startTextDrag = (event: ReactPointerEvent<HTMLSpanElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    movePreviewText(event)
  }

  const merge = async () => {
    if (!splitResult) return

    setMergeRunning(true)
    setError('')
    setMergeResult(null)
    try {
      const data = await video.merge({
        clips: splitResult.clips,
        mergedOutputDir,
        outputName: `${
          inputFile
            .split(/[\\/]/)
            .pop()
            ?.replace(/\.[^.]+$/, '') || 'video'
        }_mixed.mp4`,
      })
      setMergeResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setMergeRunning(false)
    }
  }

  return (
    <main className="video-tool">
      <section className="tool-header">
        <div>
          <div className="eyebrow">
            <Clapperboard />
            视频混剪
          </div>
          <h1>长视频分段和片段合并</h1>
        </div>
        <div className={ffmpegReady ? 'status-pill ready' : 'status-pill'}>
          {ffmpegReady ? <CheckCircle2 /> : <WandSparkles />}
          {ffmpegReady === null ? '检测 FFmpeg' : ffmpegReady ? 'FFmpeg 可用' : '需要安装 FFmpeg'}
        </div>
      </section>

      <nav className="section-tabs" aria-label="操作菜单">
        <button
          className={activeSection === 'split' ? 'active' : ''}
          type="button"
          onClick={() => setActiveSection('split')}
        >
          <Scissors />
          拆分
        </button>
        <button
          className={activeSection === 'merge' ? 'active' : ''}
          type="button"
          onClick={() => setActiveSection('merge')}
        >
          <Play />
          合并
        </button>
      </nav>

      <section className={activeSection === 'split' ? 'workspace' : 'workspace merge-workspace'}>
        {activeSection === 'split' ? (
          <>
            <div className="panel inputs-panel">
              <Field label="长视频文件" value={inputFile} action={chooseFile} buttonText="选择文件" />
              <Field
                label="片段输出目录"
                value={clipsOutputDir}
                action={() => chooseFolder(setClipsOutputDir)}
                buttonText="选择目录"
              />
              <Field
                label="子视频目录"
                value={subVideoDir}
                action={() => chooseFolder(setSubVideoDir)}
                buttonText="选择目录"
              />
            </div>

            <div className="panel settings-panel">
              <label className="control">
                <span>每段时长（秒）</span>
                <input
                  type="number"
                  min="1"
                  max="3600"
                  value={segmentSeconds}
                  onChange={(event) => setSegmentSeconds(Number(event.target.value))}
                />
              </label>

              <label className="control">
                <span>最大输出片段数（可选）</span>
                <input
                  type="number"
                  min="1"
                  value={maxSegments}
                  placeholder="不限制"
                  onChange={(event) => setMaxSegments(event.target.value)}
                />
              </label>

              <div className="text-segment-header">
                <span>悬浮文案</span>
                <div className="text-segment-actions">
                  <Button type="button" size="sm" onClick={addTextSegment}>
                    <Plus />
                    新增
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="delete-segment-button"
                    disabled={textSegments.length <= 1}
                    onClick={removeActiveTextSegment}
                  >
                    <Trash2 />
                    删除
                  </Button>
                </div>
              </div>

              <div className="text-segment-tabs">
                {textSegments.map((_, index) => (
                  <button
                    key={index}
                    className={activeTextIndex === index ? 'active' : ''}
                    type="button"
                    onClick={() => setActiveTextIndex(index)}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              <label className="control">
                <span>第 {activeTextIndex + 1} 条文案</span>
                <textarea
                  value={activeTextSegment.text}
                  onChange={(event) => updateTextSegment(activeTextIndex, { text: event.target.value })}
                />
              </label>

              <label className="control">
                <span>文字大小</span>
                <input
                  type="number"
                  min="16"
                  max="160"
                  value={activeTextSegment.textSize}
                  onChange={(event) => updateTextSegment(activeTextIndex, { textSize: Number(event.target.value) })}
                />
              </label>

              <label className="control">
                <span>文字颜色</span>
                <div className="color-row">
                  <input
                    type="color"
                    value={activeTextSegment.textColor}
                    onChange={(event) => updateTextSegment(activeTextIndex, { textColor: event.target.value })}
                  />
                  <input
                    value={activeTextSegment.textColor}
                    onChange={(event) => updateTextSegment(activeTextIndex, { textColor: event.target.value })}
                  />
                </div>
              </label>

              <label className="control">
                <span>背景颜色</span>
                <div className="color-row">
                  <input
                    type="color"
                    value={activeTextSegment.backgroundColor}
                    onChange={(event) => updateTextSegment(activeTextIndex, { backgroundColor: event.target.value })}
                  />
                  <input
                    value={activeTextSegment.backgroundColor}
                    onChange={(event) => updateTextSegment(activeTextIndex, { backgroundColor: event.target.value })}
                  />
                </div>
              </label>

              <div className="control">
                <span>文字位置</span>
                <div className="xy-row">
                  <label>
                    X
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={Math.round(activeTextSegment.textXPercent)}
                      onChange={(event) =>
                        updateTextSegment(activeTextIndex, {
                          textXPercent: Math.min(Math.max(Number(event.target.value), 0), 100),
                        })
                      }
                    />
                  </label>
                  <label>
                    Y
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={Math.round(activeTextSegment.textYPercent)}
                      onChange={(event) =>
                        updateTextSegment(activeTextIndex, {
                          textYPercent: Math.min(Math.max(Number(event.target.value), 0), 100),
                        })
                      }
                    />
                  </label>
                </div>
              </div>

              <label className="switch-control">
                <span>是否开启插入子视频</span>
                <Switch checked={insertSubVideoEnabled} onCheckedChange={setInsertSubVideoEnabled} />
              </label>

              <label className="control">
                <span>子视频插入时长（秒）</span>
                <input
                  type="number"
                  min="1"
                  max="3600"
                  disabled={!insertSubVideoEnabled}
                  value={insertSubVideoSeconds}
                  onChange={(event) => setInsertSubVideoSeconds(Number(event.target.value))}
                />
              </label>
            </div>

            <aside className="run-panel">
              <div
                className="preview-frame"
                ref={previewRef}
                style={{ '--preview-scale': previewScale } as CSSProperties}
              >
                {previewUrl ? (
                  <video className="preview-video" src={previewUrl} muted loop playsInline controls />
                ) : (
                  <Video />
                )}
                {textSegments.map((segment, index) => (
                  <span
                    key={index}
                    className={activeTextIndex === index ? 'preview-text active' : 'preview-text'}
                    style={{
                      backgroundColor: segment.backgroundColor,
                      color: segment.textColor,
                      fontSize: `calc(${segment.textSize}px * var(--preview-scale))`,
                      left: `${segment.textXPercent}%`,
                      top: `${segment.textYPercent}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    onPointerDown={(event) => {
                      setActiveTextIndex(index)
                      startTextDrag(event)
                    }}
                    onPointerMove={(event) => {
                      if (activeTextIndex === index && event.buttons === 1) movePreviewText(event)
                    }}
                  >
                    {segment.text || '预览文字'}
                  </span>
                ))}
              </div>
              <div className="segment-summary">
                <span>预计输出片段</span>
                <strong>{durationSeconds ? plannedSegments : '--'}</strong>
              </div>
              {splitRunning ? (
                <Button className="run-button stop-button" onClick={stopSplit}>
                  <Square />
                  停止拆分
                </Button>
              ) : (
                <Button className="run-button" disabled={!canSplit} onClick={split}>
                  <Scissors />
                  拆分片段
                </Button>
              )}
              <p>输出规格：1080 x 1920，MP4，9:16。</p>
            </aside>
          </>
        ) : (
          <>
            <div className="panel inputs-panel">
              <Field
                label="合并输出目录"
                value={mergedOutputDir}
                action={() => chooseFolder(setMergedOutputDir)}
                buttonText="选择目录"
              />
            </div>

            <aside className="run-panel merge-panel">
              <div className="segment-summary">
                <span>待合并片段</span>
                <strong>{splitResult?.clips.length || 0}</strong>
              </div>
              <Button className="run-button" disabled={!canMerge} onClick={merge}>
                {mergeRunning ? <Loader2 className="spin" /> : <Play />}
                {mergeRunning ? '合并中' : '合并片段'}
              </Button>
              <p>合并使用当前已拆分出的片段。需要先在“拆分”中生成片段。</p>
            </aside>
          </>
        )}
      </section>

      {(error || splitResult || mergeResult) && (
        <section className={error ? 'message error' : 'message success'}>
          {error ? (
            error
          ) : (
            <>
              {splitResult && <>已拆分 {splitResult.clips.length} 个片段。</>}
              {mergeResult && (
                <>
                  合并文件：<span>{mergeResult.mergedFile}</span>
                </>
              )}
            </>
          )}
        </section>
      )}
    </main>
  )
}

function Field({
  label,
  value,
  action,
  buttonText,
}: {
  label: string
  value: string
  action: () => void
  buttonText: string
}) {
  return (
    <label className="control file-field">
      <span>{label}</span>
      <div>
        <input readOnly value={value} placeholder="未选择" />
        <Button type="button" variant="outline" className="file-action-button" onClick={action}>
          <FolderOpen />
          {buttonText}
        </Button>
      </div>
    </label>
  )
}
