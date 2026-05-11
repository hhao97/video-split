import { useEffect, useRef } from 'react';
import { useWindowContext } from '@/app/components/window';
import { useTitlebarContext } from './TitlebarContext';
import { useConveyor } from '@/app/hooks/use-conveyor';
const TitlebarMenu = () => {
    const { menuItems } = useWindowContext().titlebar;
    if (!menuItems)
        return null;
    return (<div className="window-titlebar-menu">
      {menuItems.map((menu, index) => (<TitlebarMenuItem key={index} menu={menu} index={index}/>))}
    </div>);
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
    return (<div className="titlebar-menuItem" ref={menuItemRef}>
      <div className="menuItem-label" onClick={togglePopup} onMouseOver={handleMouseOver} onMouseDown={(e) => e.preventDefault()}>
        {menu.name}
      </div>
      {activeMenuIndex === index && <TitlebarMenuPopup menu={menu}/>}
    </div>);
};
const TitlebarMenuPopup = ({ menu }) => (<div className="menuItem-popup">
    {menu.items.map((item, index) => (<TitlebarMenuPopupItem key={index} item={item}/>))}
  </div>);
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
        return <div className="menuItem-popupItem menuItem-separator"/>;
    }
    return (<div className="menuItem-popupItem" onClick={handleAction}>
      <div>{item.name}</div>
      {item.shortcut && <div className="menuItem-shortcut">{item.shortcut}</div>}
    </div>);
};
export { TitlebarMenu, TitlebarMenuItem, TitlebarMenuPopup, TitlebarMenuPopupItem };
