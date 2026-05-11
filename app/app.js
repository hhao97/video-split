import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clapperboard, FolderOpen, Loader2, Play, Video, WandSparkles } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { useConveyor } from '@/app/hooks/use-conveyor';
import './styles/app.css';
export default function App() {
    const video = useConveyor('video');
    const [inputFile, setInputFile] = useState('');
    const [clipsOutputDir, setClipsOutputDir] = useState('');
    const [mergedOutputDir, setMergedOutputDir] = useState('');
    const [segmentSeconds, setSegmentSeconds] = useState(10);
    const [overlayText, setOverlayText] = useState('精彩片段');
    const [textColor, setTextColor] = useState('#ffffff');
    const [textPosition, setTextPosition] = useState('bottom');
    const [ffmpegReady, setFfmpegReady] = useState(null);
    const [running, setRunning] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);
    useEffect(() => {
        video.checkFfmpeg().then((status) => setFfmpegReady(status.ffmpeg && status.ffprobe));
    }, [video]);
    const canRun = useMemo(() => Boolean(inputFile && clipsOutputDir && mergedOutputDir && segmentSeconds >= 1 && !running), [clipsOutputDir, inputFile, mergedOutputDir, running, segmentSeconds]);
    const chooseFile = async () => {
        const file = await video.selectFile();
        if (file)
            setInputFile(file);
    };
    const chooseFolder = async (setter) => {
        const folder = await video.selectFolder();
        if (folder)
            setter(folder);
    };
    const start = async () => {
        setRunning(true);
        setError('');
        setResult(null);
        try {
            const data = await video.process({
                inputFile,
                clipsOutputDir,
                mergedOutputDir,
                segmentSeconds,
                overlayText,
                textColor,
                textPosition,
            });
            setResult(data);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        }
        finally {
            setRunning(false);
        }
    };
    return (_jsxs("main", { className: "video-tool", children: [_jsxs("section", { className: "tool-header", children: [_jsxs("div", { children: [_jsxs("div", { className: "eyebrow", children: [_jsx(Clapperboard, {}), "\u89C6\u9891\u6DF7\u526A"] }), _jsx("h1", { children: "\u957F\u89C6\u9891\u5206\u6BB5\u3001\u53E0\u5B57\u5E76\u5408\u5E76\u8F93\u51FA" })] }), _jsxs("div", { className: ffmpegReady ? 'status-pill ready' : 'status-pill', children: [ffmpegReady ? _jsx(CheckCircle2, {}) : _jsx(WandSparkles, {}), ffmpegReady === null ? '检测 FFmpeg' : ffmpegReady ? 'FFmpeg 可用' : '需要安装 FFmpeg'] })] }), _jsxs("section", { className: "workspace", children: [_jsxs("div", { className: "panel inputs-panel", children: [_jsx(Field, { label: "\u957F\u89C6\u9891\u6587\u4EF6", value: inputFile, action: chooseFile, buttonText: "\u9009\u62E9\u6587\u4EF6" }), _jsx(Field, { label: "\u7247\u6BB5\u8F93\u51FA\u76EE\u5F55", value: clipsOutputDir, action: () => chooseFolder(setClipsOutputDir), buttonText: "\u9009\u62E9\u76EE\u5F55" }), _jsx(Field, { label: "\u5408\u5E76\u8F93\u51FA\u76EE\u5F55", value: mergedOutputDir, action: () => chooseFolder(setMergedOutputDir), buttonText: "\u9009\u62E9\u76EE\u5F55" })] }), _jsxs("div", { className: "panel settings-panel", children: [_jsxs("label", { className: "control", children: [_jsx("span", { children: "\u6BCF\u6BB5\u65F6\u957F\uFF08\u79D2\uFF09" }), _jsx("input", { type: "number", min: "1", max: "3600", value: segmentSeconds, onChange: (event) => setSegmentSeconds(Number(event.target.value)) })] }), _jsxs("label", { className: "control", children: [_jsx("span", { children: "\u89C6\u9891\u6587\u5B57" }), _jsx("textarea", { value: overlayText, onChange: (event) => setOverlayText(event.target.value) })] }), _jsxs("label", { className: "control", children: [_jsx("span", { children: "\u6587\u5B57\u989C\u8272" }), _jsxs("div", { className: "color-row", children: [_jsx("input", { type: "color", value: textColor, onChange: (event) => setTextColor(event.target.value) }), _jsx("input", { value: textColor, onChange: (event) => setTextColor(event.target.value) })] })] }), _jsxs("div", { className: "control", children: [_jsx("span", { children: "\u6587\u5B57\u4F4D\u7F6E" }), _jsx("div", { className: "segments", children: [
                                            ['top', '顶部'],
                                            ['center', '居中'],
                                            ['bottom', '底部'],
                                        ].map(([value, label]) => (_jsx("button", { className: textPosition === value ? 'active' : '', type: "button", onClick: () => setTextPosition(value), children: label }, value))) })] })] }), _jsxs("aside", { className: "run-panel", children: [_jsxs("div", { className: "preview-frame", children: [_jsx(Video, {}), _jsx("span", { className: `preview-text ${textPosition}`, style: { color: textColor }, children: overlayText || '预览文字' })] }), _jsxs(Button, { className: "run-button", disabled: !canRun, onClick: start, children: [running ? _jsx(Loader2, { className: "spin" }) : _jsx(Play, {}), running ? '处理中' : '开始生成'] }), _jsx("p", { children: "\u8F93\u51FA\u89C4\u683C\uFF1A1920 x 1080\uFF0CMP4\uFF0C16:9\u3002" })] })] }), (error || result) && (_jsx("section", { className: error ? 'message error' : 'message success', children: error ? (error) : (_jsxs(_Fragment, { children: ["\u5DF2\u751F\u6210 ", result?.clips.length, " \u4E2A\u7247\u6BB5\uFF0C\u5408\u5E76\u6587\u4EF6\uFF1A", _jsx("span", { children: result?.mergedFile })] })) }))] }));
}
function Field({ label, value, action, buttonText, }) {
    return (_jsxs("label", { className: "control file-field", children: [_jsx("span", { children: label }), _jsxs("div", { children: [_jsx("input", { readOnly: true, value: value, placeholder: "\u672A\u9009\u62E9" }), _jsxs(Button, { type: "button", variant: "outline", onClick: action, children: [_jsx(FolderOpen, {}), buttonText] })] })] }));
}
