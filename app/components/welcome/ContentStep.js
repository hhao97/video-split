import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const ContentStep = ({ title, description, icon: Icon, }) => {
    return (_jsxs("div", { className: "welcome-content-step", children: [_jsx(Icon, {}), _jsxs("div", { children: [_jsx("h3", { children: title }), _jsx("p", { children: description })] })] }));
};
export default ContentStep;
