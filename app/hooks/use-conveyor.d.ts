type ConveyorKey = keyof Window['conveyor'];
/**
 * Use the conveyor for inter-process communication
 *
 * @param key - The key of the conveyor object to use
 * @returns The conveyor object or the keyed object
 */
export declare const useConveyor: <T extends ConveyorKey | undefined = undefined>(key?: T) => T extends ConveyorKey ? Window["conveyor"][T] : Window["conveyor"];
export {};
