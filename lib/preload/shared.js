export class ConveyorApi {
    renderer;
    constructor(electronApi) {
        this.renderer = electronApi.ipcRenderer;
    }
    invoke = async (channel, ...args) => {
        // Call the IPC method without runtime validation in preload
        // Validation happens on the main process side
        return this.renderer.invoke(channel, ...args);
    };
}
