import { Panel } from "../core/panel";
import Viewport from "../core/Viewport";

/**
 * A component that manages visible panels and camera position
 */
class Camera {
  // DOM Elements
  private _viewport: Viewport;
  
  // Panels
  private _panels: Panel[] = [];
  private _currentIndex: number = 0;
  
  // Position
  private _position: number = 0;
  private _targetPosition: number = 0;
  
  // Options
  private _isHorizontal: boolean;
  
  /**
   * Create a new instance of Camera
   * @param viewport - The viewport instance
   * @param isHorizontal - Whether the movement is horizontal (true) or vertical (false)
   */
  public constructor(viewport: Viewport, isHorizontal: boolean) {
    this._viewport = viewport;
    this._isHorizontal = isHorizontal;
  }
  
  /**
   * Initialize panels from the given viewport
   */
  public init(): void {
    this.updatePanels();
    this.updatePanelSize();
    this.updatePanelPosition();
  }
  
  /**
   * Find panels from viewport's camera element and create Panel instances
   */
  public updatePanels(): void {
    // Clear previous panels
    this._panels = [];
    
    // Find panel elements
    const panelElements = Array.from(
      this._viewport.cameraElement.children
    ) as HTMLElement[];
    
    // Create new panel instances
    this._panels = panelElements.map((el, index) => 
      new Panel(el, index, this._isHorizontal)
    );
    
    // Update current index
    this._currentIndex = Math.min(this._currentIndex, this._panels.length - 1);
    this._currentIndex = Math.max(0, this._currentIndex);
  }
  
  /**
   * Update the size of all panels
   */
  public updatePanelSize(): void {
    this._panels.forEach(panel => panel.updateSize());
  }
  
  /**
   * Update the position of all panels based on their alignment
   */
  public updatePanelPosition(): void {
    // For simplicity, we'll use center alignment (0.5)
    const align = 0.5;
    
    this._panels.forEach(panel => {
      panel.updatePosition(align);
    });
    
    this.updatePosition();
  }
  
  /**
   * Update the camera's position to show the current panel
   */
  public updatePosition(): void {
    if (this._panels.length === 0) return;
    
    const currentPanel = this._panels[this._currentIndex];
    const viewportSize = this._isHorizontal 
      ? this._viewport.width 
      : this._viewport.height;
    
    // Calculate the target position to center the current panel
    this._targetPosition = currentPanel.position + (viewportSize - currentPanel.size) / 2;
    
    // Set current position to target immediately (without animation)
    this._position = this._targetPosition;
    
    // Apply transforms to all panels
    this.applyTransform();
  }
  
  /**
   * Apply transform to all panels based on camera position
   */
  public applyTransform(): void {
    this._panels.forEach(panel => {
      panel.applyTransform(this._position);
    });
  }
  
  /**
   * Move to a specific panel by index
   * @param index - The index of the panel to move to
   * @param duration - The duration of the animation in ms
   */
  public moveToPanel(index: number, duration: number = 0): void {
    if (index < 0 || index >= this._panels.length) {
      throw new Error(`Index out of range: ${index}`);
    }
    
    this._currentIndex = index;
    this.updatePosition();
  }
  
  /**
   * Get the current index
   * @return The current panel index
   */
  public get index(): number {
    return this._currentIndex;
  }
  
  /**
   * Get the list of panels
   * @return The array of panels
   */
  public get panels(): Panel[] {
    return this._panels;
  }
  
  /**
   * Get the current panel
   * @return The current panel or null if no panels
   */
  public get currentPanel(): Panel | null {
    return this._panels.length > 0 ? this._panels[this._currentIndex] : null;
  }
  
  /**
   * Get the current position
   * @return The current camera position
   */
  public get position(): number {
    return this._position;
  }
}

export default Camera; 