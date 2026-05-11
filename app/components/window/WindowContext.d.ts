import { TitlebarProps } from './Titlebar';
import type { ChannelReturn } from '@/lib/conveyor/schemas';
type WindowInitProps = ChannelReturn<'window-init'>;
interface WindowContextProps {
    titlebar: TitlebarProps;
    readonly window: WindowInitProps | undefined;
}
export declare const WindowContextProvider: ({ children, titlebar, }: {
    children: React.ReactNode;
    titlebar?: TitlebarProps;
}) => import("react/jsx-runtime").JSX.Element;
export declare const useWindowContext: () => WindowContextProps;
export {};
