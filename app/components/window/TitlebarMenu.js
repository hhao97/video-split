import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from 'react';
import { useWindowContext } from '@/app/components/window';
import { useTitlebarContext } from './TitlebarContext';
import { useConveyor } from '@/app/hooks/use-conveyor';
const TitlebarMenu = () => {
    const { menuItems } = useWindowContext().titlebar;
    if (!menuItems)
        return null;
    return (_jsx("div", { className: "window-titlebar-menu", children: menuItems.map((menu, index) => (_jsx(TitlebarMenuItem, { menu: menu, index: index }, index))) }));
};
const TitlebarMenuItem = ({ menu, index }) => {
    const { activeMenuIndex, setActiveMenuIndex } = useTitlebarContext();
    const menuItemRef = useRef(null);
    const togglePopup = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (activeMenuIndex === index) {
            menuItemRef.current?.classList.remove('active');
            setActiveMenuIndex(null);
        }
        else if (!menuItemRef.current?.classList.contains('active')) {
            setActiveMenuIndex(index);
            menuItemRef.current?.classList.add('active');
        }
    };
    const handleMouseOver = () => {
        if (activeMenuIndex != null)
            setActiveMenuIndex(index);
    };
    useEffect(() => {
        const handleClickOutside = (event) => {
            const target = event.target;
            if (menuItemRef.current &&
                !menuItemRef.current.contains(target) &&
                menuItemRef.current.classList.contains('active')) {
                setActiveMenuIndex(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [setActiveMenuIndex]);
    useEffect(() => {
        menuItemRef.current?.classList.toggle('active', activeMenuIndex === index);
    }, [activeMenuIndex, index]);
    return (_jsxs("div", { className: "titlebar-menuItem", ref: menuItemRef, children: [_jsx("div", { className: "menuItem-label", onClick: togglePopup, onMouseOver: handleMouseOver, onMouseDown: (e) => e.preventDefault(), children: menu.name }), activeMenuIndex === index && _jsx(TitlebarMenuPopup, { menu: menu })] }));
};
const TitlebarMenuPopup = ({ menu }) => (_jsx("div", { className: "menuItem-popup", children: menu.items.map((item, index) => (_jsx(TitlebarMenuPopupItem, { item: item }, index))) }));
const TitlebarMenuPopupItem = ({ item }) => {
    const { setActiveMenuIndex } = useTitlebarContext();
    const { invoke } = useConveyor('window');
    const handleAction = () => {
        if (typeof item.actionCallback === 'function') {
            item.actionCallback();
        }
        else if (item.action) {
            invoke(item.action, ...(item.actionParams || []));
        }
        setActiveMenuIndex(null);
    };
    if (item.name === '---') {
        return _jsx("div", { className: "menuItem-popupItem menuItem-separator" });
    }
    return (_jsxs("div", { className: "menuItem-popupItem", onClick: handleAction, children: [_jsx("div", { children: item.name }), item.shortcut && _jsx("div", { className: "menuItem-shortcut", children: item.shortcut })] }));
};
export { TitlebarMenu, TitlebarMenuItem, TitlebarMenuPopup, TitlebarMenuPopupItem };
