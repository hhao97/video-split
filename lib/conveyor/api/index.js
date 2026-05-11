import { electronAPI } from '@electron-toolkit/preload';
import { AppApi } from './app-api';
import { WindowApi } from './window-api';
import { VideoApi } from './video-api';
export const conveyor = {
    app: new AppApi(electronAPI),
    window: new WindowApi(electronAPI),
    video: new VideoApi(electronAPI),
};
