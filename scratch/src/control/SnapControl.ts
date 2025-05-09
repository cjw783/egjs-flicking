import { Camera } from "../camera";
import Viewport from "../core/Viewport";
import Control, { ControlState } from "./Control";

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
  
  /**
   * Threshold to snap to the next/prev panel (0-1) as a ratio of panel size
   */
  threshold: number;
  
  /**
   * Easing function for animation (CSS easing name or cubic-bezier function)
   */
  easing: string;
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
   * Starting position of drag
   */
  private _startPosition: number = 0;
  
  /**
   * Last position for animation calculation
   */
  private _lastPosition: number = 0;
  
  /**
   * Target panel index
   */
  private _targetIndex: number = -1;
  
  /**
   * Animation start time
   */
  private _animationStart: number = 0;
  
  /**
   * Animation duration
   */
  private _animationDuration: number = 0;
  
  /**
   * Target position to move to
   */
  private _targetPosition: number = 0;
  
  /**
   * Animation frame ID
   */
  private _animationFrame: number | null = null;
  
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
      threshold: 0.3,
      easing: "cubic-bezier(0.33, 1, 0.68, 1)", // easeOutCubic
      ...options
    };
  }
  
  /**
   * Initialize control
   */
  public init(): void {
    // Initialize the position and state
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
    
    // Default behavior when not in animation
    if (!this.isState(ControlState.ANIMATING) && this._camera.panels.length > 0) {
      this._camera.updatePosition();
    }
  }
  
  /**
   * Start drag operation
   */
  public startDrag(): void {
    if (!this._enabled) return;
    
    // If animation is in progress and not interruptable, ignore
    if (this.isState(ControlState.ANIMATING) && !this._options.interruptable) {
      return;
    }
    
    // Stop any ongoing animation
    this.stopAnimation();
    
    // Set the start position
    this._startPosition = this._camera.position;
    
    // Change state to holding
    this.changeState(ControlState.HOLDING);
  }
  
  /**
   * Update drag with delta
   * @param delta - Distance moved since last update
   */
  public drag(delta: number): void {
    if (!this._enabled || !this.isState(ControlState.HOLDING)) return;
    
    // Change state to dragging if not already
    if (!this.isState(ControlState.DRAGGING)) {
      this.changeState(ControlState.DRAGGING);
    }
    
    // Apply movement to camera (temporary direct manipulation for now)
    // In a more complete implementation, this should apply the delta
    // to the camera's position and update all panels accordingly
    this._camera.moveToPanel(this._camera.index, 0);
  }
  
  /**
   * End drag operation and snap to the nearest panel
   */
  public endDrag(): void {
    if (!this._enabled || 
        (!this.isState(ControlState.HOLDING) && !this.isState(ControlState.DRAGGING))) {
      return;
    }
    
    // Calculate movement distance
    const moveDistance = this._camera.position - this._startPosition;
    const currentIndex = this._camera.index;
    const currentPanel = this._camera.panels[currentIndex];
    
    if (!currentPanel) return;
    
    // Determine target panel based on movement
    let targetIndex = currentIndex;
    
    // If we moved more than the threshold, go to next/prev panel
    const moveRatio = Math.abs(moveDistance) / currentPanel.size;
    
    if (moveRatio >= this._options.threshold) {
      // Determine direction (positive = right/down, negative = left/up)
      const direction = moveDistance > 0 ? 1 : -1;
      
      // Calculate new target index
      const newIndex = currentIndex - direction; // Opposite because camera moves in opposite direction
      
      // Ensure new index is valid
      if (newIndex >= 0 && newIndex < this._camera.panels.length) {
        targetIndex = newIndex;
      }
    }
    
    // Move to the target panel with animation
    this.moveToPanel(targetIndex);
  }
  
  /**
   * Move to a panel by index
   * @param index - The index of the panel to move to
   * @param duration - The duration of the animation (overrides options.duration)
   */
  public moveToPanel(index: number, duration?: number): void {
    if (!this._enabled) return;
    
    // Validate index bounds
    if (index < 0 || index >= this._camera.panels.length) {
      return;
    }
    
    // Stop any ongoing animation
    this.stopAnimation();
    
    // Set the target index
    this._targetIndex = index;
    
    // Set animation duration
    this._animationDuration = duration !== undefined ? duration : this._options.duration;
    
    // If duration is 0, move immediately
    if (this._animationDuration <= 0) {
      this._camera.moveToPanel(index, 0);
      return;
    }
    
    // Change state to animating
    this.changeState(ControlState.ANIMATING);
    
    // Store current position as starting point
    this._lastPosition = this._camera.position;
    
    // Calculate target position from target panel
    const targetPanel = this._camera.panels[index];
    const viewportSize = this._viewport.width; // Assuming horizontal movement
    
    // Get desired final camera position (using the same logic as in Camera.updatePosition)
    this._targetPosition = -targetPanel.position + (viewportSize - targetPanel.size) / 2;
    
    // Start animation
    this._animationStart = performance.now();
    this._animate();
  }
  
  /**
   * Stop any ongoing animation
   */
  private stopAnimation(): void {
    if (this._animationFrame !== null) {
      cancelAnimationFrame(this._animationFrame);
      this._animationFrame = null;
    }
    
    if (this.isState(ControlState.ANIMATING)) {
      this.changeState(ControlState.IDLE);
    }
  }
  
  /**
   * Animation loop
   */
  private _animate(): void {
    const now = performance.now();
    const elapsed = now - this._animationStart;
    
    // Calculate progress (0 to 1)
    let progress = Math.min(elapsed / this._animationDuration, 1);
    
    // Apply easing (simple ease-out for now)
    // In a more complete implementation, this would use the easing function from options
    progress = 1 - Math.pow(1 - progress, 3); // easeOutCubic
    
    // Calculate current position
    const distance = this._targetPosition - this._lastPosition;
    const currentPosition = this._lastPosition + (distance * progress);
    
    // Apply the position to camera
    this._updateCameraPosition(currentPosition);
    
    // If animation is complete
    if (progress >= 1) {
      this._updateCameraPosition(this._targetPosition);
      this._finishAnimation();
      return;
    }
    
    // Continue animation
    this._animationFrame = requestAnimationFrame(() => this._animate());
  }
  
  /**
   * Update camera position directly
   * @param position - The position to set
   */
  private _updateCameraPosition(position: number): void {
    // TODO: In a real implementation, this would update the camera's position directly
    // For now, we're using the moveToPanel method which doesn't allow position setting
    this._camera.moveToPanel(this._targetIndex, 0);
  }
  
  /**
   * Finish animation and clean up
   */
  private _finishAnimation(): void {
    this._animationFrame = null;
    this.changeState(ControlState.IDLE);
    
    // Ensure camera is exactly at the target position
    this._camera.moveToPanel(this._targetIndex, 0);
  }
  
  /**
   * Check if the camera is animating
   * @return Whether the camera is currently animating
   */
  public get animating(): boolean {
    return this.isState(ControlState.ANIMATING);
  }
}

export default SnapControl; 