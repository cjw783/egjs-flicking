import { Camera } from "../camera";
import Viewport from "../core/Viewport";
import Control from "./Control";

/**
 * Options for SnapControl
 */
export interface SnapControlOptions {
  /**
   * Duration of the animation when moving to a panel
   */
  duration: number;
  
  /**
   * Whether animation is interruptable by user input
   */
  interruptable: boolean;
}

/**
 * Control that makes the camera snap to the nearest panel
 */
class SnapControl extends Control {
  /**
   * Options for this control
   */
  private _options: SnapControlOptions;
  
  /**
   * Whether the camera is animating
   */
  private _isAnimating: boolean = false;
  
  /**
   * Create a new instance of SnapControl
   * @param camera - The camera instance to control
   * @param viewport - The viewport instance for reference
   * @param options - Options for SnapControl
   */
  public constructor(
    camera: Camera, 
    viewport: Viewport, 
    options: Partial<SnapControlOptions> = {}
  ) {
    super(camera, viewport);
    
    this._options = {
      duration: 300,
      interruptable: true,
      ...options
    };
  }
  
  /**
   * Initialize control
   */
  public init(): void {
    // For now, just initialize the position
    this.update();
  }
  
  /**
   * Clean up resources
   */
  public destroy(): void {
    // Nothing to clean up yet
  }
  
  /**
   * Update the control state
   */
  public update(): void {
    if (!this._enabled) return;
    
    // For the initial implementation, just update the camera position
    if (this._camera.panels.length > 0) {
      this._camera.updatePosition();
    }
  }
  
  /**
   * Move to a panel by index
   * @param index - The index of the panel to move to
   * @param duration - The duration of the animation (overrides options.duration)
   */
  public moveToPanel(index: number, duration?: number): void {
    if (!this._enabled) return;
    
    const finalDuration = duration ?? this._options.duration;
    this._camera.moveToPanel(index, finalDuration);
  }
  
  /**
   * Check if the camera is animating
   * @return Whether the camera is currently animating
   */
  public get animating(): boolean {
    return this._isAnimating;
  }
}

export default SnapControl; 