import { ConveyorApi } from '@/lib/preload/shared';
import type { ChannelArgs } from '@/lib/conveyor/schemas';
export declare class VideoApi extends ConveyorApi {
    selectFile: () => Promise<string | null>;
    selectFolder: () => Promise<string | null>;
    checkFfmpeg: () => Promise<{
        ffmpeg: boolean;
        ffprobe: boolean;
    }>;
    process: (settings: ChannelArgs<"video-process">[0]) => Promise<{
        clips: string[];
        mergedFile: string;
        durationSeconds: number;
    }>;
}
