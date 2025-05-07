/*
 * egjs-flicking
 * Copyright (c) 2023
 * MIT license
 */
import Component from "@egjs/component";
import { getElement } from "./utils";
import { Camera } from "./camera";
import { Control, SnapControl, SnapControlOptions } from "./control";
import { Viewport, FlickingError, Panel } from "./core";
import { EVENTS, ALIGN, MOVE_TYPE } from "./const/external";
import type { ReadyEvent, BeforeResizeEvent, AfterResizeEvent } from "./type/event";

// Export types
export * from "./type/event";
export * from "./type/external";
export * from "./const/external";

// Export utilities
export * from "./utils";

// Export core modules
export * from "./core";
export * from "./camera";
export * from "./control";

/**
 * Options for Flicking
 */
export interface FlickingOptions {
  align?: string | number;
  defaultIndex?: number;
  horizontal?: boolean;
  duration?: number;
  interruptable?: boolean;
}

/**
 * Event types for Flicking
 */
export interface FlickingEvents {
  [EVENTS.READY]: ReadyEvent;
  [EVENTS.BEFORE_RESIZE]: BeforeResizeEvent;
  [EVENTS.AFTER_RESIZE]: AfterResizeEvent;
}

/**
 * A module that lets you drag and move your elements around
 */
class Flicking extends Component<FlickingEvents> {
  /**
   * Version string
   */
  public static VERSION = "1.0.0";
  
  // Core components
  private _viewport: Viewport;
  private _camera: Camera;
  private _control: Control;
  
  // Options
  private _align: string | number;
  private _defaultIndex: number;
  private _horizontal: boolean;
  private _duration: number;
  private _interruptable: boolean;
  
  // State
  private _initialized: boolean = false;
  
  /**
   * Create a new instance of Flicking
   * @param element - The target element or selector
   * @param options - Options for Flicking instance
   */
  public constructor(
    element: HTMLElement | string,
    {
      align = ALIGN.CENTER,
      defaultIndex = 0,
      horizontal = true,
      duration = 300,
      interruptable = true
    }: Partial<FlickingOptions> = {}
  ) {
    // Get element
    const el = getElement(element);
    if (!el) {
      throw new FlickingError("Target element not found");
    }
    
    // Call super constructor with proper arguments
    super();
    
    // Store options
    this._align = align;
    this._defaultIndex = defaultIndex;
    this._horizontal = horizontal;
    this._duration = duration;
    this._interruptable = interruptable;
    
    // Set viewport & initialize the camera
    this._viewport = new Viewport(el as HTMLElement);
    this._camera = new Camera(this._viewport, this._horizontal);
    
    // Initialize control
    this._control = new SnapControl(this._camera, this._viewport, {
      duration: this._duration,
      interruptable: this._interruptable
    });
    
    // Initialize
    this.init();
  }
  
  /**
   * Initialize Flicking
   */
  public init(): void {
    if (this._initialized) return;
    
    // Update viewport size
    this._viewport.updateSize();
    
    // Initialize camera
    this._camera.init();
    
    // Move to default index
    if (this._defaultIndex > 0) {
      this.moveTo(this._defaultIndex);
    }
    
    // Initialize control
    this._control.init();
    
    this._initialized = true;
    
    // Emit ready event using trigger method from Component
    this.trigger(EVENTS.READY, {});
  }
  
  /**
   * Move to the previous panel
   * @param duration - Duration of the animation in ms
   */
  public prev(duration?: number): void {
    const currentIndex = this._camera.index;
    if (currentIndex > 0) {
      this.moveTo(currentIndex - 1, duration);
    }
  }
  
  /**
   * Move to the next panel
   * @param duration - Duration of the animation in ms
   */
  public next(duration?: number): void {
    const currentIndex = this._camera.index;
    if (currentIndex < this._camera.panels.length - 1) {
      this.moveTo(currentIndex + 1, duration);
    }
  }
  
  /**
   * Move to the panel at the given index
   * @param index - The index of the panel to move to
   * @param duration - Duration of the animation in ms
   */
  public moveTo(index: number, duration?: number): void {
    if (this._control instanceof SnapControl) {
      this._control.moveToPanel(index, duration);
    }
  }
  
  /**
   * Get the current index
   * @return The current panel index
   */
  public get index(): number {
    return this._camera.index;
  }
  
  /**
   * Get the current panel
   * @return The current panel
   */
  public get currentPanel(): Panel | null {
    return this._camera.currentPanel;
  }
  
  /**
   * Get all panels
   * @return The array of panels
   */
  public get panels(): Panel[] {
    return this._camera.panels;
  }
  
  /**
   * Get the viewport element
   * @return The viewport element
   */
  public get element(): HTMLElement {
    return this._viewport.element;
  }
  
  /**
   * Check if Flicking is initialized
   * @return Whether Flicking is initialized
   */
  public get initialized(): boolean {
    return this._initialized;
  }
}

export default Flicking; 