import { Camera } from "../camera";
import Viewport from "../core/Viewport";
import Control from "./Control";

/**
 * Options for StrictControl
 */
export interface StrictControlOptions {
  /**
   * Duration of the animation when moving to a panel
   */
  duration: number;
  
  /**
   * Movement threshold as a ratio of panel size (0-1)
   * Movement smaller than this ratio will return to the original panel
   */
  threshold: number;
}

/**
 * Control that strictly enforces movement between adjacent panels only
 */
class StrictControl extends Control {
  /**
   * Options for this control
   */
  private _options: StrictControlOptions;
  
  /**
   * Whether the camera is animating
   */
  private _isAnimating: boolean = false;
  
  /**
   * Starting drag position
   */
  private _startPosition: number = 0;
  
  /**
   * Whether a drag operation is in progress
   */
  private _isDragging: boolean = false;
  
  /**
   * Whether movement is horizontal
   */
  private _isHorizontal: boolean;
  
  /**
   * Create a new instance of StrictControl
   * @param camera - The camera instance to control
   * @param viewport - The viewport instance for reference
   * @param options - Options for StrictControl
   */
  public constructor(
    camera: Camera, 
    viewport: Viewport, 
    options: Partial<StrictControlOptions> = {}
  ) {
    super(camera, viewport);
    
    this._options = {
      duration: 300,
      threshold: 0.3,
      ...options
    };
    
    // Determine orientation from camera
    this._isHorizontal = true; // Default to horizontal
    if (camera && typeof camera['_isHorizontal'] === 'boolean') {
      this._isHorizontal = camera['_isHorizontal'];
    }
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
   * Begin dragging operation
   */
  public startDrag(): void {
    if (!this._enabled || this._isAnimating) return;
    
    this._isDragging = true;
    this._startPosition = this._camera.position;
  }
  
  /**
   * Update dragging with position delta
   * @param delta - The change in position
   */
  public drag(delta: number): void {
    if (!this._enabled || !this._isDragging) return;
    
    // Limit drag to adjacent panels only
    const currentIndex = this._camera.index;
    const panels = this._camera.panels;
    
    if (panels.length <= 1) return;
    
    // Get the current panel
    const currentPanel = panels[currentIndex];
    if (!currentPanel) return;
    
    // Calculate new position
    const currentPosition = this._camera.position;
    let newPosition = currentPosition + delta;
    
    // Get the limits for dragging
    // For StrictControl, we only allow dragging to adjacent panels
    const minIndex = Math.max(0, currentIndex - 1);
    const maxIndex = Math.min(panels.length - 1, currentIndex + 1);
    
    // Get the panel positions for min and max indices
    const minPanel = panels[minIndex];
    const maxPanel = panels[maxIndex];
    
    if (!minPanel || !maxPanel) return;
    
    // Calculate position limits (we need to calculate camera positions for these panels)
    const viewportSize = this._isHorizontal ? this._viewport.width : this._viewport.height;
    
    // Calculate camera position for min and max panels (same logic as in Camera.updatePosition)
    const minPosition = -minPanel.position + (viewportSize - minPanel.size) / 2;
    const maxPosition = -maxPanel.position + (viewportSize - maxPanel.size) / 2;
    
    // Ensure min position is less than max position
    const lowerLimit = Math.min(minPosition, maxPosition);
    const upperLimit = Math.max(minPosition, maxPosition);
    
    // Clamp the new position within the limits
    newPosition = Math.max(lowerLimit, Math.min(newPosition, upperLimit));
    
    // Apply the position change to all panels
    panels.forEach(panel => {
      panel.applyTransform(newPosition);
    });
  }
  
  /**
   * End dragging operation and decide the target panel
   */
  public endDrag(): void {
    if (!this._enabled || !this._isDragging) return;
    
    this._isDragging = false;
    
    const currentIndex = this._camera.index;
    const currentPosition = this._camera.position;
    const movementRatio = Math.abs(currentPosition - this._startPosition) / 
      (this._camera.currentPanel?.size || 1);
    
    // If movement is smaller than threshold, return to original panel
    if (movementRatio < this._options.threshold) {
      this.moveToPanel(currentIndex);
      return;
    }
    
    // Determine direction of movement
    const direction = currentPosition > this._startPosition ? -1 : 1;
    const targetIndex = Math.max(0, Math.min(currentIndex + direction, this._camera.panels.length - 1));
    
    this.moveToPanel(targetIndex);
  }
  
  /**
   * Move to a specific panel by index
   * @param index - The index of the panel to move to
   * @param duration - The duration of the animation in ms
   */
  public moveToPanel(index: number, duration?: number): void {
    if (!this._enabled) return;
    
    // Only allow movement to adjacent panels
    const currentIndex = this._camera.index;
    
    if (Math.abs(index - currentIndex) > 1) {
      // For strict control, we only allow movement to adjacent panels
      // However, we could implement multi-step movement here in the future
      
      // For now, just clamp the index to be adjacent
      const direction = index > currentIndex ? 1 : -1;
      index = currentIndex + direction;
    }
    
    const finalDuration = duration ?? this._options.duration;
    this._isAnimating = true;
    
    // Move to the panel
    this._camera.moveToPanel(index, finalDuration);
    
    // In a real implementation, we would need to handle animation completion
    setTimeout(() => {
      this._isAnimating = false;
    }, finalDuration);
  }
  
  /**
   * Check if the camera is animating
   * @return Whether the camera is currently animating
   */
  public get animating(): boolean {
    return this._isAnimating;
  }
  
  /**
   * Check if a drag operation is in progress
   * @return Whether dragging is in progress
   */
  public get dragging(): boolean {
    return this._isDragging;
  }
}

export default StrictControl; 