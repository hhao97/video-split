import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState } from 'react';
import { Titlebar } from './Titlebar';
import { TitlebarContextProvider } from './TitlebarContext';
import { useConveyor } from '@/app/hooks/use-conveyor';
const WindowContext = createContext(undefined);
export const WindowContextProvider = ({ children, titlebar = {
    title: 'Electron React App',
    icon: 'appIcon.png',
    titleCentered: false,
    menuItems: [],
}, }) => {
    const [initProps, setInitProps] = useState();
    const { windowInit } = useConveyor('window');
    useEffect(() => {
        windowInit().then(setInitProps);
        // Add class to parent element
        const parent = document.querySelector('.window-content')?.parentElement;
        parent?.classList.add('window-frame');
    }, [windowInit]);
    return (_jsxs(WindowContext.Provider, { value: { titlebar, window: initProps }, children: [_jsx(TitlebarContextProvider, { children: _jsx(Titlebar, {}) }), _jsx("div", { className: "window-content", children: children })] }));
};
export const useWindowContext = () => {
    const context = useContext(WindowContext);
    if (!context) {
        throw new Error('useWindowContext must be used within a WindowContextProvider');
    }
    return context;
};
