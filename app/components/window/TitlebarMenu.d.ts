declare const TitlebarMenu: () => import("react/jsx-runtime").JSX.Element | null;
declare const TitlebarMenuItem: ({ menu, index }: {
    menu: TitlebarMenu;
    index: number;
}) => import("react/jsx-runtime").JSX.Element;
declare const TitlebarMenuPopup: ({ menu }: {
    menu: TitlebarMenu;
}) => import("react/jsx-runtime").JSX.Element;
declare const TitlebarMenuPopupItem: ({ item }: {
    item: TitlebarMenuItem;
}) => import("react/jsx-runtime").JSX.Element;
interface TitlebarMenuItem {
    name: string;
    action?: string;
    actionParams?: (string | number | object)[];
    shortcut?: string;
    items?: TitlebarMenuItem[];
    actionCallback?: () => void;
}
interface TitlebarMenu {
    name: string;
    items: TitlebarMenuItem[];
}
export { TitlebarMenu, TitlebarMenuItem, TitlebarMenuPopup, TitlebarMenuPopupItem };
