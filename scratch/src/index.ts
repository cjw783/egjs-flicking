/*
 * egjs-flicking
 * Copyright (c) 2023
 * MIT license
 */
import Component from "@egjs/component";
import { getElement } from "./utils";
import { Camera } from "./camera";
import { 
  Control, 
  SnapControl, 
  SnapControlOptions, 
  FreeControl, 
  FreeControlOptions, 
  StrictControl, 
  StrictControlOptions,
  ControlState
} from "./control";
import { AxesController, AxesControllerOptions } from "./input";
import { Viewport, FlickingError, Panel } from "./core";
import { EVENTS, ALIGN, MOVE_TYPE } from "./const/external";
import type { 
  ReadyEvent, 
  BeforeResizeEvent, 
  AfterResizeEvent,
  MoveStartEvent,
  MoveEvent,
  MoveEndEvent 
} from "./type/event";

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
export * from "./input";

/**
 * Control mode for Flicking
 */
export enum CONTROL_MODE {
  SNAP = "snap",
  FREE = "free",
  STRICT = "strict"
}

/**
 * Options for Flicking
 */
export interface FlickingOptions {
  align?: string | number;
  defaultIndex?: number;
  horizontal?: boolean;
  duration?: number;
  interruptable?: boolean;
  controlMode?: CONTROL_MODE;
  threshold?: number;
  preventDefaultOnMove?: boolean;
  deceleration?: boolean;
  decelerationRate?: number;
}

/**
 * Event types for Flicking
 */
export interface FlickingEvents {
  [EVENTS.READY]: ReadyEvent;
  [EVENTS.BEFORE_RESIZE]: BeforeResizeEvent;
  [EVENTS.AFTER_RESIZE]: AfterResizeEvent;
  [EVENTS.MOVE_START]: MoveStartEvent;
  [EVENTS.MOVE]: MoveEvent;
  [EVENTS.MOVE_END]: MoveEndEvent;
}

/**
 * A module that lets you drag and move your elements around
 */
class Flicking extends Component<FlickingEvents> {
  /**
   * Version string
   */
  public static VERSION = "1.0.0";
  
  /**
   * Event types
   */
  public static EVENTS = EVENTS;
  
  // Core components
  private _viewport: Viewport;
  private _camera: Camera;
  private _control: Control;
  private _axesController: AxesController | null = null;
  
  // Options
  private _align: string | number;
  private _defaultIndex: number;
  private _horizontal: boolean;
  private _duration: number;
  private _interruptable: boolean;
  private _controlMode: CONTROL_MODE;
  private _threshold: number;
  private _preventDefaultOnMove: boolean;
  private _deceleration: boolean;
  private _decelerationRate: number;
  
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
      interruptable = true,
      controlMode = CONTROL_MODE.SNAP,
      threshold = 0.3,
      preventDefaultOnMove = true,
      deceleration = true,
      decelerationRate = 0.95
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
    this._controlMode = controlMode;
    this._threshold = threshold;
    this._preventDefaultOnMove = preventDefaultOnMove;
    this._deceleration = deceleration;
    this._decelerationRate = decelerationRate;
    
    // Set viewport & initialize the camera
    this._viewport = new Viewport(el as HTMLElement);
    this._camera = new Camera(this._viewport, this._horizontal);
    
    // Initialize control based on controlMode
    this._control = this._createControl();
    
    // Initialize
    // We're handling init asynchronously now
    // Using void to ignore the Promise - consumers can call .on('ready') to handle completion
    void this.init();
  }
  
  /**
   * Initialize Flicking
   * @return Promise that resolves when initialization is complete
   */
  public init(): Promise<void> {
    if (this._initialized) return Promise.resolve();
    
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
    
    // Initialize axes controller
    this._initAxesController();
    
    this._initialized = true;
    
    // Emit ready event using trigger method from Component
    // We're using Promise.resolve().then() to make this async
    return new Promise<void>(resolve => {
      // Use setTimeout to ensure this executes after the current call stack is clear
      setTimeout(() => {
        this.trigger(EVENTS.READY, {});
        resolve();
      }, 0);
    });
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
    // Check if the control has a moveToPanel method
    if ("moveToPanel" in this._control) {
      (this._control as any).moveToPanel(index, duration);
    }
    // If it's a FreeControl, we need to calculate position and use moveBy
    else if (this._control instanceof FreeControl) {
      const targetPanel = this._camera.panels[index];
      if (targetPanel) {
        // TODO: Implement proper movement for FreeControl
      }
    }
    
    // Emit move events
    this.trigger(EVENTS.MOVE_START, { index, isTrusted: false, direction: index > this._camera.index ? "NEXT" : "PREV" });
    this.trigger(EVENTS.MOVE, { index, isTrusted: false, direction: index > this._camera.index ? "NEXT" : "PREV" });
    
    // Use setTimeout to simulate the end of animation
    setTimeout(() => {
      this.trigger(EVENTS.MOVE_END, { index, isTrusted: false, direction: index > this._camera.index ? "NEXT" : "PREV" });
    }, duration || this._duration);
  }
  
  /**
   * Create the appropriate control based on controlMode
   * @return The created control instance
   */
  private _createControl(): Control {
    switch (this._controlMode) {
      case CONTROL_MODE.FREE:
        return new FreeControl(this._camera, this._viewport, {
          deceleration: this._deceleration,
          decelerationRate: this._decelerationRate
        });
      case CONTROL_MODE.STRICT:
        return new StrictControl(this._camera, this._viewport, {
          duration: this._duration,
          threshold: this._threshold
        });
      case CONTROL_MODE.SNAP:
      default:
        return new SnapControl(this._camera, this._viewport, {
          duration: this._duration,
          interruptable: this._interruptable
        });
    }
  }
  
  /**
   * Initialize the axes controller
   */
  private _initAxesController(): void {
    if (this._axesController) {
      this._axesController.destroy();
    }
    
    this._axesController = new AxesController(
      this._viewport.element,
      this._control,
      this._horizontal,
      {
        preventDefault: this._preventDefaultOnMove,
        threshold: 5, // Small threshold to detect movement
        usePointer: true
      }
    );
    
    this._axesController.init();
  }
  
  /**
   * Clean up resources
   */
  public destroy(): void {
    if (this._axesController) {
      this._axesController.destroy();
      this._axesController = null;
    }
    
    this._control.destroy();
    this._initialized = false;
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
  
  /**
   * Get the control instance
   * @return The control instance
   */
  public get control(): Control {
    return this._control;
  }
  
  /**
   * Get the control mode
   * @return The control mode
   */
  public get controlMode(): CONTROL_MODE {
    return this._controlMode;
  }
}

export default Flicking; 