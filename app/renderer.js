import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import ReactDOM from 'react-dom/client';
import icon from '@/resources/build/icon.png?asset';
import { WindowContextProvider, menuItems } from '@/app/components/window';
import { ErrorBoundary } from './components/ErrorBoundary';
import App from './app';
ReactDOM.createRoot(document.getElementById('app')).render(_jsx(React.StrictMode, { children: _jsx(ErrorBoundary, { children: _jsx(WindowContextProvider, { titlebar: { title: '视频混剪工具', icon, menuItems }, children: _jsx(App, {}) }) }) }));
