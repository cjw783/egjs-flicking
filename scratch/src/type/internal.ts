/**
 * Utility type to allow string literals or generic string type
 */
export type LiteralUnion<T extends U, U = string> = T | (U & {});

/**
 * Extracts the type of a value from an object
 */
export type ValueOf<T> = T[keyof T]; 