/**
 * Checks whether the given parameter is an instance of HTMLElement
 * @param val - Value to check
 * @return Whether the given parameter is an instance of HTMLElement
 */
export const isString = (val: any): val is string => typeof val === "string";

/**
 * Checks whether the given parameter is an instance of Element
 * @param val - Value to check
 * @return Whether the given parameter is an instance of Element
 */
export const isElement = (val: any): val is Element => {
  try {
    return val instanceof Element;
  } catch (e) {
    return false;
  }
};

/**
 * Checks whether the given parameter is an instance of Array
 * @param val - Value to check
 * @return Whether the given parameter is an instance of Array
 */
export const isArray = <T>(val: any): val is Array<T> => Array.isArray(val);

/**
 * Checks whether a value is a number type and not a NaN
 * @param val - Value to check
 * @return Whether the given parameter is a valid number
 */
export const isNumber = (val: any): val is number => typeof val === "number" && !isNaN(val);

/**
 * Find the index of an element in the array
 * @param arr - Array to search
 * @param callback - Function to check if the element is found
 * @return Found index, -1 if not found
 */
export const findIndex = <T>(arr: Array<T>, callback: (val: T, index: number, array: Array<T>) => boolean): number => {
  const length = arr.length;
  for (let i = 0; i < length; i++) {
    if (callback(arr[i], i, arr)) {
      return i;
    }
  }
  return -1;
};

/**
 * Checks whether a value exists in an array
 * @param arr - Array to check
 * @param val - Value to check
 * @return Whether value exists in the array
 */
export const includes = <T>(arr: Array<T>, val: T): boolean => {
  return findIndex(arr, (element) => element === val) >= 0;
};

/**
 * Converts a value from array-like elements to a real Array
 * @param val - Array-like elements
 * @return A converted Array
 */
export const toArray = <T>(val: ArrayLike<T>): Array<T> => [].slice.call(val);

/**
 * Get element(s) from a string selector
 * @param selector - CSS selector
 * @param root - Root element to find from
 * @return Found elements
 */
export const $q = (selector: string, root?: ParentNode): Array<Element> => 
  toArray((root || document).querySelectorAll(selector));

/**
 * Returns the first item if array, or the item itself
 * @param val - Item or array of items
 * @return The first item or the item itself
 */
export const getFirstItem = <T>(val: T | Array<T>): T => isArray(val) ? val[0] : val;

/**
 * Get element from a HTML selector, element or element itself
 * @param selector - HTML Selector, HTMLElement, or element
 * @return Found element
 */
export const getElement = <T>(selector: string | Element, root?: ParentNode): Element | null => {
  if (isString(selector)) {
    const elements = $q(selector, root);
    return elements.length > 0 ? elements[0] : null;
  } else if (isElement(selector)) {
    return selector;
  } else {
    return null;
  }
};

/**
 * Create an element from a HTMLElement or a HTML string
 * @param element - Element to create from
 * @return Created element
 */
export const parseElement = (element: string | HTMLElement): HTMLElement => {
  if (isString(element)) {
    const container = document.createElement("div");
    container.innerHTML = element;
    return container.firstElementChild as HTMLElement;
  } else {
    return element;
  }
};

/**
 * Clamps the value to the given range
 * @param val - Value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @return Clamped value
 */
export const clamp = (val: number, min: number, max: number): number => Math.max(Math.min(val, max), min); 