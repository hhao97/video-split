import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Component } from 'react';
import { ScrollArea, ScrollBar } from './ui/scroll-area';
export class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(_error, _errorInfo) {
        // Error is already captured in state and displayed to user
    }
    render() {
        if (this.state.hasError) {
            return (this.props.fallback || (_jsx("div", { className: "min-h-screen bg-background flex items-center justify-center p-4", children: _jsxs("div", { className: "max-w-lg w-full space-y-6", children: [_jsx("div", { className: "flex justify-center", children: _jsx("div", { className: "w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center", children: _jsx("svg", { className: "w-8 h-8 text-destructive", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" }) }) }) }), _jsxs("div", { className: "text-center space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("h1", { className: "text-2xl font-semibold text-foreground", children: "Something went wrong" }), _jsx("p", { className: "text-muted-foreground text-sm leading-relaxed", children: "An unexpected error occurred in the application" })] }), this.state.error?.stack && (_jsxs(ScrollArea, { className: "mt-3 h-32 p-4 rounded-lg border border-border/50 bg-muted/50", children: [_jsx("pre", { className: "text-sm text-foreground select-text text-left", children: this.state.error.stack }), _jsx(ScrollBar, { orientation: "horizontal" })] }))] })] }) })));
        }
        return this.props.children;
    }
}
