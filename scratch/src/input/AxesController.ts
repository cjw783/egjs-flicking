import { Control } from "../control";
import Axes from "@egjs/axes";
import { PanInput } from "@egjs/axes";

/**
 * Options for AxesController
 */
export interface AxesControllerOptions {
  /**
   * Whether to prevent default action on touchmove
   */
  preventDefault: boolean;
  
  /**
   * Threshold in pixels to start dragging
   */
  threshold: number;
  
  /**
   * Whether to use pointer events if available
   */
  usePointer: boolean;
}

/**
 * Controller for handling touch and mouse input using egjs-axes
 */
class AxesController {
  /**
   * Element to attach events to
   */
  private _element: HTMLElement;
  
  /**
   * Control to update
   */
  private _control: Control;
  
  /**
   * Options for the controller
   */
  private _options: AxesControllerOptions;
  
  /**
   * Whether the controller is enabled
   */
  private _enabled: boolean = true;
  
  /**
   * Whether we're currently dragging
   */
  private _isDragging: boolean = false;
  
  /**
   * Is horizontal movement
   */
  private _isHorizontal: boolean;
  
  /**
   * The egjs-axes instance
   */
  private _axes: Axes;
  
  /**
   * The egjs-axes PanInput instance
   */
  private _panInput: PanInput;
  
  /**
   * Create a new instance of AxesController
   * @param element - Element to attach events to
   * @param control - Control to update
   * @param isHorizontal - Whether movement is horizontal
   * @param options - Options for controller
   */
  public constructor(
    element: HTMLElement,
    control: Control,
    isHorizontal: boolean = true,
    options: Partial<AxesControllerOptions> = {}
  ) {
    this._element = element;
    this._control = control;
    this._isHorizontal = isHorizontal;
    
    this._options = {
      preventDefault: true,
      threshold: 5,
      usePointer: false,
      ...options
    };
    
    // Initialize egjs-axes
    this._axes = new Axes({
      move: {
        range: [-Infinity, Infinity],
        bounce: 0
      }
    }, {
      deceleration: 0.001
    });
    
    // Bind axes events
    this._bindAxesEvents();
  }
  
  /**
   * Initialize the controller
   */
  public init(): void {
    // Create and connect PanInput
    const axisName = this._isHorizontal ? "horizontal" : "vertical";
    
    this._panInput = new PanInput(this._element, {
      scale: [1, 1],
      threshold: this._options.threshold,
      inputType: this._options.usePointer ? ["touch", "mouse", "pointer"] : ["touch", "mouse"],
      preventClickOnDrag: this._options.preventDefault
    });
    
    // Connect PanInput to axes
    this._axes.connect(["move"], this._panInput);
  }
  
  /**
   * Destroy the controller and remove event listeners
   */
  public destroy(): void {
    if (this._axes) {
      this._axes.destroy();
    }
  }
  
  /**
   * Enable the controller
   */
  public enable(): void {
    this._enabled = true;
    if (this._panInput) {
      this._panInput.enable();
    }
  }
  
  /**
   * Disable the controller
   */
  public disable(): void {
    this._enabled = false;
    if (this._panInput) {
      this._panInput.disable();
    }
    
    if (this._isDragging) {
      this._endDrag();
    }
  }
  
  /**
   * Bind egjs-axes events
   */
  private _bindAxesEvents(): void {
    // Hold event (start dragging)
    this._axes.on("hold", (evt) => {
      if (!this._enabled) return;
      
      this._isDragging = true;
      
      // Notify control about drag start
      if ("startDrag" in this._control) {
        (this._control as any).startDrag();
      }
    });
    
    // Change event (dragging)
    this._axes.on("change", (evt) => {
      if (!this._enabled || !this._isDragging) return;
      
      const delta = this._isHorizontal ? evt.delta.move : evt.delta.move;
      
      // Notify control about drag
      if ("drag" in this._control) {
        (this._control as any).drag(delta);
      } else if ("moveBy" in this._control) {
        (this._control as any).moveBy(delta);
      }
    });
    
    // Release event (end dragging)
    this._axes.on("release", (evt) => {
      if (!this._enabled) return;
      this._endDrag();
    });
    
    // Animationend event (all movement finished)
    this._axes.on("animationEnd", (evt) => {
      if (!this._enabled) return;
      this._endDrag();
    });
  }
  
  /**
   * Handle end of drag
   */
  private _endDrag(): void {
    if (this._isDragging) {
      // Notify control about drag end
      if ("endDrag" in this._control) {
        (this._control as any).endDrag();
      } else if ("startAnimation" in this._control) {
        (this._control as any).startAnimation();
      }
      
      this._isDragging = false;
    }
  }
  
  /**
   * Check if controller is enabled
   * @return Whether controller is enabled
   */
  public get enabled(): boolean {
    return this._enabled;
  }
  
  /**
   * Check if dragging is in progress
   * @return Whether dragging is in progress
   */
  public get dragging(): boolean {
    return this._isDragging;
  }
}

export default AxesController; 