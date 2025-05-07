/**
 * A component that manages a single panel element
 */
class Panel {
  // DOM Element
  private _el: HTMLElement;
  
  // Position & Size
  private _index: number;
  private _position: number = 0;
  private _size: number = 0;
  
  // Options
  private _align: number = 0;
  private _isHorizontal: boolean;
  
  /**
   * Create a new instance of Panel
   * @param element - An HTMLElement representing the panel
   * @param index - The index of the panel
   * @param isHorizontal - Whether the movement is horizontal (true) or vertical (false)
   */
  public constructor(element: HTMLElement, index: number, isHorizontal: boolean) {
    this._el = element;
    this._index = index;
    this._isHorizontal = isHorizontal;
  }
  
  /**
   * Update panel's position and size according to viewport size
   * @param align - The alignment of the panel
   */
  public updatePosition(align: number): void {
    this._align = align;
    this.calculatePosition();
  }
  
  /**
   * Update panel's size from element's size
   */
  public updateSize(): void {
    const rect = this._el.getBoundingClientRect();
    this._size = this._isHorizontal ? rect.width : rect.height;
  }
  
  /**
   * Calculate panel's position using its offset and size
   */
  private calculatePosition(): void {
    // Position is calculated based on the panel's size and alignment
    this._position = -this._size * this._align;
  }
  
  /**
   * Apply CSS transform to the panel element
   * @param cameraOffset - The offset of the camera
   */
  public applyTransform(cameraOffset: number): void {
    const transform = this._isHorizontal
      ? `translate3d(${this._position + cameraOffset}px, 0, 0)`
      : `translate3d(0, ${this._position + cameraOffset}px, 0)`;
    
    this._el.style.transform = transform;
  }
  
  /**
   * Get panel element
   * @return The panel element
   */
  public get element(): HTMLElement {
    return this._el;
  }
  
  /**
   * Get panel index
   * @return The panel index
   */
  public get index(): number {
    return this._index;
  }
  
  /**
   * Get panel size
   * @return The size of the panel element
   */
  public get size(): number {
    return this._size;
  }
  
  /**
   * Get panel position
   * @return The position of the panel element
   */
  public get position(): number {
    return this._position;
  }
}

export default Panel; 