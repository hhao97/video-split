import { BrowserWindow, shell, app } from 'electron';
import { join } from 'path';
import appIcon from '@/resources/build/icon.png?asset';
import { registerResourcesProtocol } from './protocols';
import { registerWindowHandlers } from '@/lib/conveyor/handlers/window-handler';
import { registerAppHandlers } from '@/lib/conveyor/handlers/app-handler';
import { registerVideoHandlers } from '@/lib/conveyor/handlers/video-handler';
export function createAppWindow() {
    // Register custom protocol for resources
    registerResourcesProtocol();
    // Create the main window.
    const mainWindow = new BrowserWindow({
        width: 900,
        height: 720,
        show: false,
        backgroundColor: '#f6f6f4',
        icon: appIcon,
        frame: false,
        titleBarStyle: 'hiddenInset',
        title: '视频混剪工具',
        maximizable: true,
        resizable: true,
        webPreferences: {
            preload: join(__dirname, '../preload/preload.js'),
            sandbox: false,
        },
    });
    // Register IPC events for the main window.
    registerWindowHandlers(mainWindow);
    registerAppHandlers(app);
    registerVideoHandlers(mainWindow);
    mainWindow.on('ready-to-show', () => {
        mainWindow.show();
    });
    mainWindow.webContents.setWindowOpenHandler((details) => {
        shell.openExternal(details.url);
        return { action: 'deny' };
    });
    // HMR for renderer base on electron-vite cli.
    // Load the remote URL for development or the local html file for production.
    if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
        mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
    }
    else {
        mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
    }
}
