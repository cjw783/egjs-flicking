import { Camera } from "../camera";
import Viewport from "../core/Viewport";
import Control from "./Control";

/**
 * Options for FreeControl
 */
export interface FreeControlOptions {
  /**
   * Whether to use deceleration when dragging ends
   */
  deceleration: boolean;
  
  /**
   * Deceleration rate (0-1, smaller value means faster deceleration)
   */
  decelerationRate: number;
}

/**
 * Control that allows free scrolling of the camera without snapping
 */
class FreeControl extends Control {
  /**
   * Options for this control
   */
  private _options: FreeControlOptions;
  
  /**
   * Current velocity of the movement
   */
  private _velocity: number = 0;
  
  /**
   * Whether the camera is currently in motion
   */
  private _isMoving: boolean = false;
  
  /**
   * Animation frame ID for deceleration animation
   */
  private _animationFrameId: number | null = null;
  
  /**
   * Create a new instance of FreeControl
   * @param camera - The camera instance to control
   * @param viewport - The viewport instance for reference
   * @param options - Options for FreeControl
   */
  public constructor(
    camera: Camera, 
    viewport: Viewport, 
    options: Partial<FreeControlOptions> = {}
  ) {
    super(camera, viewport);
    
    this._options = {
      deceleration: true,
      decelerationRate: 0.95,
      ...options
    };
  }
  
  /**
   * Initialize control
   */
  public init(): void {
    this.update();
  }
  
  /**
   * Clean up resources
   */
  public destroy(): void {
    this.stopAnimation();
  }
  
  /**
   * Update the control state
   */
  public update(): void {
    if (!this._enabled) return;
    
    // For the initial implementation, just ensure the camera has correct position
    if (this._camera.panels.length > 0) {
      this._camera.updatePosition();
    }
  }
  
  /**
   * Move the camera by a delta amount
   * @param delta - The amount to move
   */
  public moveBy(delta: number): void {
    if (!this._enabled) return;
    
    // Store the delta as velocity for deceleration
    this._velocity = delta;
    
    // Apply the movement directly
    this.applyMovement(delta);
  }
  
  /**
   * Start deceleration animation
   */
  public startAnimation(): void {
    if (!this._enabled || !this._options.deceleration || !this._velocity) return;
    
    this._isMoving = true;
    this.animateDeceleration();
  }
  
  /**
   * Stop any ongoing animation
   */
  public stopAnimation(): void {
    if (this._animationFrameId !== null) {
      cancelAnimationFrame(this._animationFrameId);
      this._animationFrameId = null;
    }
    
    this._isMoving = false;
  }
  
  /**
   * Apply a movement to the camera
   * @param delta - The amount to move
   */
  private applyMovement(delta: number): void {
    // Get the current camera position
    const currentPosition = this._camera.position;
    
    // Calculate the new position by adding the delta
    const newPosition = currentPosition + delta;
    
    // Update the camera's position directly
    // Since Camera class doesn't expose a direct setPosition method,
    // we need to implement this functionality here
    
    // Get all panels
    const panels = this._camera.panels;
    
    // Apply the position change to all panels
    panels.forEach(panel => {
      panel.applyTransform(newPosition);
    });
    
    // Update our internal state to reflect the new position
    // In a more complete implementation, we would update the Camera's internal position as well
    // For now, we'll rely on the panels' transform to handle the visual update
  }
  
  /**
   * Animate deceleration effect
   */
  private animateDeceleration(): void {
    if (!this._isMoving || Math.abs(this._velocity) < 0.1) {
      this._isMoving = false;
      this._velocity = 0;
      return;
    }
    
    // Apply deceleration
    this._velocity *= this._options.decelerationRate;
    
    // Apply the movement with the updated velocity
    this.applyMovement(this._velocity);
    
    // Request next animation frame
    this._animationFrameId = requestAnimationFrame(() => this.animateDeceleration());
  }
  
  /**
   * Check if the camera is moving
   * @return Whether the camera is currently moving
   */
  public get moving(): boolean {
    return this._isMoving;
  }
}

export default FreeControl; 