import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { useWindowContext } from './WindowContext';
import { useTitlebarContext } from './TitlebarContext';
import { TitlebarMenu } from './TitlebarMenu';
import { useConveyor } from '@/app/hooks/use-conveyor';
const SVG_PATHS = {
    close: 'M 0,0 0,0.7 4.3,5 0,9.3 0,10 0.7,10 5,5.7 9.3,10 10,10 10,9.3 5.7,5 10,0.7 10,0 9.3,0 5,4.3 0.7,0 Z',
    maximize: 'M 0,0 0,10 10,10 10,0 Z M 1,1 9,1 9,9 1,9 Z',
    minimize: 'M 0,5 10,5 10,6 0,6 Z',
};
export const Titlebar = () => {
    const { title, icon, titleCentered, menuItems } = useWindowContext().titlebar;
    const { menusVisible, setMenusVisible, closeActiveMenu } = useTitlebarContext();
    const { window: wcontext } = useWindowContext();
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.altKey && menuItems?.length && !e.repeat) {
                if (menusVisible)
                    closeActiveMenu();
                setMenusVisible(!menusVisible);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [menusVisible, closeActiveMenu, setMenusVisible, menuItems]);
    return (_jsxs("div", { className: `window-titlebar ${wcontext?.platform ? `platform-${wcontext.platform}` : ''}`, children: [wcontext?.platform !== 'darwin' && (_jsx("div", { className: "window-titlebar-icon", children: _jsx("img", { src: icon }) })), _jsx("div", { className: "window-titlebar-title", ...(titleCentered && { 'data-centered': true }), style: { visibility: menusVisible ? 'hidden' : 'visible' }, children: title }), menusVisible && _jsx(TitlebarMenu, {}), wcontext?.platform === 'win32' && _jsx(TitlebarControls, {})] }));
};
const TitlebarControls = () => {
    const { window: wcontext } = useWindowContext();
    return (_jsxs("div", { className: "window-titlebar-controls", children: [wcontext?.minimizable && _jsx(TitlebarControlButton, { label: "minimize", svgPath: SVG_PATHS.minimize }), wcontext?.maximizable && _jsx(TitlebarControlButton, { label: "maximize", svgPath: SVG_PATHS.maximize }), _jsx(TitlebarControlButton, { label: "close", svgPath: SVG_PATHS.close })] }));
};
const TitlebarControlButton = ({ svgPath, label }) => {
    const { windowMinimize, windowMaximizeToggle, windowClose } = useConveyor('window');
    const handleAction = () => {
        const actions = {
            minimize: windowMinimize,
            maximize: windowMaximizeToggle,
            close: windowClose,
        };
        actions[label]?.();
    };
    return (_jsx("div", { "aria-label": label, className: "titlebar-controlButton", onClick: handleAction, children: _jsx("svg", { width: "10", height: "10", children: _jsx("path", { fill: "currentColor", d: svgPath }) }) }));
};
