import { Camera } from "../camera";
import Viewport from "../core/Viewport";

/**
 * Abstract class for controlling camera movement
 */
abstract class Control {
  /**
   * Camera instance to control
   */
  protected _camera: Camera;
  
  /**
   * Viewport instance to reference
   */
  protected _viewport: Viewport;
  
  /**
   * Whether the control is enabled
   */
  protected _enabled: boolean = true;
  
  /**
   * Create a new instance of Control
   * @param camera - The camera instance to control
   * @param viewport - The viewport instance for reference
   */
  public constructor(camera: Camera, viewport: Viewport) {
    this._camera = camera;
    this._viewport = viewport;
  }
  
  /**
   * Initialize control
   */
  public abstract init(): void;
  
  /**
   * Destroy control and release resources
   */
  public abstract destroy(): void;
  
  /**
   * Update control state
   */
  public abstract update(): void;
  
  /**
   * Enable the control
   */
  public enable(): void {
    this._enabled = true;
  }
  
  /**
   * Disable the control
   */
  public disable(): void {
    this._enabled = false;
  }
  
  /**
   * Check if control is enabled
   * @return Whether the control is enabled
   */
  public get enabled(): boolean {
    return this._enabled;
  }
  
  /**
   * Get the camera instance
   * @return The camera instance
   */
  public get camera(): Camera {
    return this._camera;
  }
}

export default Control; 