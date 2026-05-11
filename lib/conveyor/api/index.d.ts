import { AppApi } from './app-api';
import { WindowApi } from './window-api';
import { VideoApi } from './video-api';
export declare const conveyor: {
    app: AppApi;
    window: WindowApi;
    video: VideoApi;
};
export type ConveyorApi = typeof conveyor;
