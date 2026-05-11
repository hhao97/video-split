import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import ContentStep from '../ContentStep';
import CodeWindowIcon from '../icons/CodeWindowIcon';
import FanIcon from '../icons/FanIcon';
import ColorSchemeIcon from '../icons/ColorSchemeIcon';
import AsterikIcon from '../icons/AsterikIcon';
import { useConveyor } from '@/app/hooks/use-conveyor';
import { useEffect, useState } from 'react';
const EraContent = () => {
    const { version } = useConveyor('app');
    const [appVersion, setAppVersion] = useState('');
    useEffect(() => {
        const fetchVersion = async () => {
            const appVersion = await version();
            setAppVersion(appVersion);
        };
        fetchVersion();
    }, [version]);
    return (_jsxs("div", { children: [_jsx("h2", { className: "flex items-center gap-4", children: "Electron React App" }), _jsxs("p", { children: ["Welcome to the Electron React App \"v", appVersion, "\". A starter kit that provides a solid foundation for developing desktop applications."] }), _jsx("p", { children: "This project utilizes Electron, React, Vite, TypeScript, and Tailwind CSS to provide a modern development environment with the latest features and tools." }), _jsxs("div", { className: "welcome-content-steps", children: [_jsx(ContentStep, { title: "Custom Window Titlebar & Menus", description: "Customize the look and feel of the application window", icon: CodeWindowIcon }), _jsx(ContentStep, { title: "Lightning Fast HMR", description: "Hot Module Replacement that stays fast regardless of app size", icon: FanIcon }), _jsx(ContentStep, { title: "Dark & Light Mode", description: "Switch between dark and light mode with a click of a button", icon: ColorSchemeIcon }), _jsx(ContentStep, { title: "Conveyor - IPC Communication", description: "Type-safe inter-process communication system", icon: AsterikIcon })] }), _jsxs("p", { className: "learn-more", children: ["Learn more about Electron React App at", ' ', _jsx("a", { href: "https://github.com/guasam/electron-react-app", target: "_blank", rel: "noreferrer", children: "Github" })] })] }));
};
export default EraContent;
