import { ConveyorApi } from '@/lib/preload/shared';
export class VideoApi extends ConveyorApi {
    selectFile = () => this.invoke('video-select-file');
    selectFolder = () => this.invoke('video-select-folder');
    checkFfmpeg = () => this.invoke('video-check-ffmpeg');
    process = (settings) => this.invoke('video-process', settings);
}
