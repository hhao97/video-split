import { TitlebarMenu } from './TitlebarMenu';
export declare const Titlebar: () => import("react/jsx-runtime").JSX.Element;
export interface TitlebarProps {
    title: string;
    titleCentered?: boolean;
    icon?: string;
    menuItems?: TitlebarMenu[];
}
