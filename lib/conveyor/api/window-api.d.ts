import { ConveyorApi } from '@/lib/preload/shared';
export declare class WindowApi extends ConveyorApi {
    windowInit: () => Promise<{
        width: number;
        height: number;
        minimizable: boolean;
        maximizable: boolean;
        platform: string;
    }>;
    windowIsMinimizable: () => Promise<boolean>;
    windowIsMaximizable: () => Promise<boolean>;
    windowMinimize: () => Promise<void>;
    windowMaximize: () => Promise<void>;
    windowClose: () => Promise<void>;
    windowMaximizeToggle: () => Promise<void>;
    webUndo: () => Promise<void>;
    webRedo: () => Promise<void>;
    webCut: () => Promise<void>;
    webCopy: () => Promise<void>;
    webPaste: () => Promise<void>;
    webDelete: () => Promise<void>;
    webSelectAll: () => Promise<void>;
    webReload: () => Promise<void>;
    webForceReload: () => Promise<void>;
    webToggleDevtools: () => Promise<void>;
    webActualSize: () => Promise<void>;
    webZoomIn: () => Promise<void>;
    webZoomOut: () => Promise<void>;
    webToggleFullscreen: () => Promise<void>;
    webOpenUrl: (url: string) => Promise<void>;
}
