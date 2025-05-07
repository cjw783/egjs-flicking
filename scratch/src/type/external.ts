/**
 * @interface
 * Element-like objects that can be used in place of actual HTMLElements
 */
export interface ElementLike {
  element?: HTMLElement;
  html?: string;
}

/**
 * Plugin interface
 * @interface
 */
export interface Plugin {
  /**
   * Plugin name
   */
  readonly name: string;
  
  /**
   * Version info string
   */
  readonly version: string;
  
  /**
   * Plugin initialization
   */
  init(): void;
  
  /**
   * Plugin destruction
   */
  destroy(): void;
}

/**
 * Status object saved/restored by Flicking
 * @interface
 */
export interface Status {
  /**
   * Index of the active panel
   */
  index: number;
  
  /**
   * Camera position
   */
  position: number;
  
  /**
   * Panel information
   */
  panels: Record<string, any>[];
}

/**
 * @typedef
 * Align options for flicking
 */
export type AlignOption = string | number | { panel: number | string; camera: number | string }; 