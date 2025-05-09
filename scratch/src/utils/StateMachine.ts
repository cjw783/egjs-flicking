/**
 * StateMachine implementation using XState library
 */
import { createMachine, createActor } from 'xstate';
import type { AnyActorRef } from 'xstate';

export class StateMachine {
  /**
   * Current state
   */
  private _state: string;
  
  /**
   * XState machine instance
   */
  private _machine: ReturnType<typeof createMachine>;
  
  /**
   * XState actor instance
   */
  private _actor: AnyActorRef;
  
  /**
   * Map to track valid transitions
   */
  private _transitions: Map<string, Set<string>> = new Map();
  
  /**
   * Create a new StateMachine
   * @param initialState - Initial state 
   */
  public constructor(initialState: string) {
    this._state = initialState;
    
    // Create an empty machine with just the initial state
    this._machine = createMachine({
      id: 'flickingStateMachine',
      initial: initialState,
      states: {
        [initialState]: {}
      }
    });
    
    // Initialize the actor
    this._actor = createActor(this._machine);
    this._actor.subscribe(state => {
      if (typeof state.value === 'string') {
        this._state = state.value;
      }
    });
    this._actor.start();
  }
  
  /**
   * Add a valid transition between states
   * @param fromState - Source state
   * @param toState - Target state
   */
  public addTransition(fromState: string, toState: string): this {
    if (!this._transitions.has(fromState)) {
      this._transitions.set(fromState, new Set());
    }
    
    this._transitions.get(fromState)!.add(toState);
    
    // Recreate machine with updated transitions
    this._updateMachine();
    
    return this;
  }
  
  /**
   * Update XState machine definition based on transitions
   */
  private _updateMachine(): void {
    // Create states config for the machine
    const states: Record<string, any> = {};
    
    // Add each state and its transitions
    this._transitions.forEach((targets, source) => {
      if (!states[source]) {
        states[source] = { on: {} };
      }
      
      // Add transitions for this state
      targets.forEach(target => {
        states[source].on[`TO_${target}`] = { target };
        
        // Ensure target state exists in machine definition
        if (!states[target]) {
          states[target] = { on: {} };
        }
      });
    });
    
    // Create new machine with all states and transitions
    this._machine = createMachine({
      id: 'flickingStateMachine',
      initial: this._state,
      states
    });
    
    // Stop previous actor and start new one
    try {
      this._actor.stop();
    } catch (e) {
      // Actor may not be running
    }
    
    this._actor = createActor(this._machine);
    this._actor.subscribe(state => {
      if (typeof state.value === 'string') {
        this._state = state.value;
      }
    });
    this._actor.start();
  }
  
  /**
   * Attempt to transition to a new state
   * @param newState - The state to transition to
   * @return Whether the transition was successful
   */
  public transit(newState: string): boolean {
    if (this._state === newState) return true;
    
    if (!this.isValidTransition(newState)) {
      return false;
    }
    
    try {
      this._actor.send({ type: `TO_${newState}` });
      return true;
    } catch (e) {
      console.error('Transition failed:', e);
      return false;
    }
  }
  
  /**
   * Check if a transition is valid
   * @param toState - The target state
   * @return Whether the transition is valid
   */
  public isValidTransition(toState: string): boolean {
    if (this._state === toState) return true;
    
    const validTransitions = this._transitions.get(this._state);
    return !!validTransitions && validTransitions.has(toState);
  }
  
  /**
   * Get the current state
   */
  public get state(): string {
    return this._state;
  }
}

export default StateMachine; 