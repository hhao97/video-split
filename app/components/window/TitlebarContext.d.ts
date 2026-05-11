interface TitlebarContextProps {
    activeMenuIndex: number | null;
    menusVisible: boolean;
    setActiveMenuIndex: (index: number | null) => void;
    setMenusVisible: (visible: boolean) => void;
    closeActiveMenu: () => void;
}
export declare const TitlebarContextProvider: ({ children }: {
    children: React.ReactNode;
}) => import("react/jsx-runtime").JSX.Element;
export declare const useTitlebarContext: () => TitlebarContextProps;
export {};
