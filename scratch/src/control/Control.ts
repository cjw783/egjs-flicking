import { Camera } from "../camera";
import Viewport from "../core/Viewport";
import StateMachine from "../utils/StateMachine";

/**
 * Control states
 */
export enum ControlState {
  IDLE = "idle",
  HOLDING = "holding",
  DRAGGING = "dragging",
  ANIMATING = "animating"
}

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
   * State machine for control states
   */
  protected _stateMachine: StateMachine;
  
  /**
   * Create a new instance of Control
   * @param camera - The camera instance to control
   * @param viewport - The viewport instance for reference
   */
  public constructor(camera: Camera, viewport: Viewport) {
    this._camera = camera;
    this._viewport = viewport;
    
    // Initialize state machine
    this._stateMachine = new StateMachine(ControlState.IDLE);
    
    // Define valid state transitions
    this._stateMachine
      .addTransition(ControlState.IDLE, ControlState.HOLDING)
      .addTransition(ControlState.IDLE, ControlState.ANIMATING)
      .addTransition(ControlState.HOLDING, ControlState.DRAGGING)
      .addTransition(ControlState.HOLDING, ControlState.IDLE)
      .addTransition(ControlState.DRAGGING, ControlState.IDLE)
      .addTransition(ControlState.DRAGGING, ControlState.ANIMATING)
      .addTransition(ControlState.ANIMATING, ControlState.IDLE)
      .addTransition(ControlState.ANIMATING, ControlState.HOLDING);
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
   * Change the control state
   * @param state - The new state to transition to
   * @return Whether the transition was successful
   */
  protected changeState(state: ControlState): boolean {
    return this._stateMachine.transit(state);
  }
  
  /**
   * Check if the control is in a specific state
   * @param state - The state to check
   * @return Whether the control is in the specified state
   */
  public isState(state: ControlState): boolean {
    return this._stateMachine.state === state;
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
  
  /**
   * Get the current state
   * @return The current control state
   */
  public get state(): ControlState {
    return this._stateMachine.state as ControlState;
  }
}

export default Control; 