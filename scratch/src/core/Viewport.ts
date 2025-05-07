/**
 * A component that manages the viewport element
 */
class Viewport {
  // DOM elements
  private _el: HTMLElement;
  private _cameraEl: HTMLElement;
  
  /**
   * The size of the viewport element
   */
  private _width: number = 0;
  private _height: number = 0;

  /**
   * Create a new instance of Viewport
   * @param el - The viewport HTMLElement
   */
  public constructor(el: HTMLElement) {
    this._el = el;
    // Find the camera element
    const cameraEl = this._el.querySelector(".flicking-camera") as HTMLElement;
    
    if (!cameraEl) {
      throw new Error("Camera element not found. Construct the camera element with proper class name.");
    }
    
    this._cameraEl = cameraEl;
  }

  /**
   * Update size of viewport
   * @return Updated viewport size
   */
  public updateSize(): { width: number; height: number } {
    const viewportRect = this._el.getBoundingClientRect();
    this._width = viewportRect.width;
    this._height = viewportRect.height;
    
    return {
      width: this._width,
      height: this._height
    };
  }

  /**
   * Get viewport width
   * @return The width of the viewport element
   */
  public get width(): number {
    return this._width;
  }

  /**
   * Get viewport height
   * @return The height of the viewport element
   */
  public get height(): number {
    return this._height;
  }

  /**
   * Get viewport element
   * @return The viewport element
   */
  public get element(): HTMLElement {
    return this._el;
  }

  /**
   * Get camera element
   * @return The camera element
   */
  public get cameraElement(): HTMLElement {
    return this._cameraEl;
  }
}

export default Viewport; 