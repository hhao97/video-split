import type { ElectronAPI, IpcRenderer } from '@electron-toolkit/preload';
import type { ChannelName, ChannelArgs, ChannelReturn } from '@/lib/conveyor/schemas';
export declare abstract class ConveyorApi {
    protected renderer: IpcRenderer;
    constructor(electronApi: ElectronAPI);
    invoke: <T extends ChannelName>(channel: T, ...args: ChannelArgs<T>) => Promise<ChannelReturn<T>>;
}
