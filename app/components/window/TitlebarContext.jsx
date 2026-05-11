import { createContext, useContext, useState } from 'react';
const TitlebarContext = createContext(undefined);
export const TitlebarContextProvider = ({ children }) => {
    const [activeMenuIndex, setActiveMenuIndex] = useState(null);
    const [menusVisible, setMenusVisible] = useState(false);
    const closeActiveMenu = () => setActiveMenuIndex(null);
    return (<TitlebarContext.Provider value={{ activeMenuIndex, menusVisible, setActiveMenuIndex, setMenusVisible, closeActiveMenu }}>
      {children}
    </TitlebarContext.Provider>);
};
export const useTitlebarContext = () => {
    const context = useContext(TitlebarContext);
    if (!context) {
        throw new Error('useTitlebarContext must be used within a TitlebarContextProvider');
    }
    return context;
};
