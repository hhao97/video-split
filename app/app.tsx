import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Clapperboard, FolderOpen, Loader2, Play, Video, WandSparkles } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { useConveyor } from '@/app/hooks/use-conveyor'
import './styles/app.css'

type TextPosition = 'top' | 'center' | 'bottom'

type JobResult = Awaited<ReturnType<Window['conveyor']['video']['process']>>

export default function App() {
  const video = useConveyor('video')
  const [inputFile, setInputFile] = useState('')
  const [clipsOutputDir, setClipsOutputDir] = useState('')
  const [mergedOutputDir, setMergedOutputDir] = useState('')
  const [segmentSeconds, setSegmentSeconds] = useState(10)
  const [overlayText, setOverlayText] = useState('精彩片段')
  const [textColor, setTextColor] = useState('#ffffff')
  const [textPosition, setTextPosition] = useState<TextPosition>('bottom')
  const [ffmpegReady, setFfmpegReady] = useState<boolean | null>(null)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<JobResult | null>(null)

  useEffect(() => {
    video.checkFfmpeg().then((status) => setFfmpegReady(status.ffmpeg && status.ffprobe))
  }, [video])

  const canRun = useMemo(
    () => Boolean(inputFile && clipsOutputDir && mergedOutputDir && segmentSeconds >= 1 && !running),
    [clipsOutputDir, inputFile, mergedOutputDir, running, segmentSeconds]
  )

  const chooseFile = async () => {
    const file = await video.selectFile()
    if (file) setInputFile(file)
  }

  const chooseFolder = async (setter: (value: string) => void) => {
    const folder = await video.selectFolder()
    if (folder) setter(folder)
  }

  const start = async () => {
    setRunning(true)
    setError('')
    setResult(null)
    try {
      const data = await video.process({
        inputFile,
        clipsOutputDir,
        mergedOutputDir,
        segmentSeconds,
        overlayText,
        textColor,
        textPosition,
      })
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setRunning(false)
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
          <h1>长视频分段、叠字并合并输出</h1>
        </div>
        <div className={ffmpegReady ? 'status-pill ready' : 'status-pill'}>
          {ffmpegReady ? <CheckCircle2 /> : <WandSparkles />}
          {ffmpegReady === null ? '检测 FFmpeg' : ffmpegReady ? 'FFmpeg 可用' : '需要安装 FFmpeg'}
        </div>
      </section>

      <section className="workspace">
        <div className="panel inputs-panel">
          <Field label="长视频文件" value={inputFile} action={chooseFile} buttonText="选择文件" />
          <Field
            label="片段输出目录"
            value={clipsOutputDir}
            action={() => chooseFolder(setClipsOutputDir)}
            buttonText="选择目录"
          />
          <Field
            label="合并输出目录"
            value={mergedOutputDir}
            action={() => chooseFolder(setMergedOutputDir)}
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
            <span>视频文字</span>
            <textarea value={overlayText} onChange={(event) => setOverlayText(event.target.value)} />
          </label>

          <label className="control">
            <span>文字颜色</span>
            <div className="color-row">
              <input type="color" value={textColor} onChange={(event) => setTextColor(event.target.value)} />
              <input value={textColor} onChange={(event) => setTextColor(event.target.value)} />
            </div>
          </label>

          <div className="control">
            <span>文字位置</span>
            <div className="segments">
              {[
                ['top', '顶部'],
                ['center', '居中'],
                ['bottom', '底部'],
              ].map(([value, label]) => (
                <button
                  key={value}
                  className={textPosition === value ? 'active' : ''}
                  type="button"
                  onClick={() => setTextPosition(value as TextPosition)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <aside className="run-panel">
          <div className="preview-frame">
            <Video />
            <span className={`preview-text ${textPosition}`} style={{ color: textColor }}>
              {overlayText || '预览文字'}
            </span>
          </div>
          <Button className="run-button" disabled={!canRun} onClick={start}>
            {running ? <Loader2 className="spin" /> : <Play />}
            {running ? '处理中' : '开始生成'}
          </Button>
          <p>输出规格：1920 x 1080，MP4，16:9。</p>
        </aside>
      </section>

      {(error || result) && (
        <section className={error ? 'message error' : 'message success'}>
          {error ? (
            error
          ) : (
            <>
              已生成 {result?.clips.length} 个片段，合并文件：<span>{result?.mergedFile}</span>
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
        <Button type="button" variant="outline" onClick={action}>
          <FolderOpen />
          {buttonText}
        </Button>
      </div>
    </label>
  )
}
