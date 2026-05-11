import { ConveyorApi } from '@/lib/preload/shared';
export declare class AppApi extends ConveyorApi {
    version: () => Promise<string>;
}
