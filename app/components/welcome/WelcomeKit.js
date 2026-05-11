import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import EraShape from './EraShape';
import EraContent from './contents/EraContent';
import ElectronContent from './contents/ElectronContent';
import ReactContent from './contents/ReactContent';
import ViteContent from './contents/ViteContent';
import ShadContent from './contents/ShadContent';
import TailwindContent from './contents/TailwindContent';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '../ui/badge';
import './styles.css';
export default function WelcomeKit() {
    const [activePath, setActivePath] = useState(5);
    const handlePathHover = (index) => {
        setActivePath(index);
    };
    const handlePathReset = () => {
        setActivePath(5);
    };
    const content = () => {
        switch (activePath) {
            case 0:
                return _jsx(ElectronContent, {});
            case 1:
                return _jsx(ReactContent, {});
            case 2:
                return _jsx(ViteContent, {});
            case 3:
                return _jsx(ShadContent, {});
            case 4:
                return _jsx(TailwindContent, {});
            case 5:
                return _jsx(EraContent, {});
            default:
                return _jsx(EraContent, {});
        }
    };
    return (_jsxs("div", { className: "welcome-content flex flex-col gap-5", children: [_jsxs("div", { className: "flex gap-5 items-center", children: [_jsx(AnimatePresence, { mode: "wait", children: _jsx(motion.div, { style: { zIndex: 2, flex: 1 }, initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: {
                                duration: 0.2,
                                ease: 'easeInOut',
                            }, children: content() }, 'content-' + activePath) }), _jsx(EraShape, { onPathHover: handlePathHover, onPathReset: handlePathReset })] }), _jsx("div", { className: "flex justify-center items-center gap-4 opacity-50 hover:opacity-80 transition-opacity", children: _jsx(DarkModeToggle, {}) })] }));
}
const DarkModeToggle = () => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    useEffect(() => {
        setIsDarkMode(document.documentElement.classList.contains('dark'));
    }, []);
    const toggleDarkMode = () => {
        document.documentElement.classList.toggle('dark');
        setIsDarkMode(!isDarkMode);
    };
    return (_jsx("div", { className: "flex justify-center items-center gap-2 text-sm cursor-pointer", children: _jsx(Badge, { variant: "secondary", onClick: toggleDarkMode, children: isDarkMode ? 'Dark Mode' : 'Light Mode' }) }));
};
