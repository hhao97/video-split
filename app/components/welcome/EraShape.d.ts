interface EraShapeIconProps {
    onPathHover?: (index: number, name: string) => void;
    onPathReset?: () => void;
    [key: string]: any;
}
declare const EraShape: ({ onPathHover, onPathReset, ...props }: EraShapeIconProps) => import("react/jsx-runtime").JSX.Element;
export default EraShape;
