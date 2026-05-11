/**
 * Use the conveyor for inter-process communication
 *
 * @param key - The key of the conveyor object to use
 * @returns The conveyor object or the keyed object
 */
export const useConveyor = (key) => {
    const conveyor = window.conveyor;
    if (key) {
        return conveyor[key];
    }
    return conveyor;
};
