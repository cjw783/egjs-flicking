/**
 * Event type for ready events
 */
export interface ReadyEvent {}

/**
 * Event type for before resize events
 */
export interface BeforeResizeEvent {
  viewport: { width: number; height: number };
}

/**
 * Event type for after resize events
 */
export interface AfterResizeEvent {
  viewport: { width: number; height: number };
}

/**
 * Event type for hold start events
 */
export interface HoldStartEvent {
  axesEvent: {
    inputEvent: any;
    pos: {[key: string]: number};
    inputType: string;
  };
}

/**
 * Event type for hold end events
 */
export interface HoldEndEvent {
  axesEvent: {
    inputEvent: any;
    pos: {[key: string]: number};
    inputType: string;
  };
}

/**
 * Event type for move start events
 */
export interface MoveStartEvent {
  index: number;
  isTrusted: boolean;
  direction: string;
  axesEvent?: {
    inputEvent: any;
    pos: {[key: string]: number};
    delta: {[key: string]: number};
    inputType: string;
  };
}

/**
 * Event type for move events
 */
export interface MoveEvent {
  index: number;
  isTrusted: boolean;
  direction: string;
  axesEvent?: {
    inputEvent: any;
    pos: {[key: string]: number};
    delta: {[key: string]: number};
    inputType: string;
  };
}

/**
 * Event type for move end events
 */
export interface MoveEndEvent {
  index: number;
  isTrusted: boolean;
  direction: string;
  axesEvent?: {
    inputEvent: any;
    pos: {[key: string]: number};
    delta: {[key: string]: number};
    inputType: string;
  };
}

/**
 * Event type for select events
 */
export interface SelectEvent {
  index: number;
  panel: any;
}

/**
 * Event type for panel change events
 */
export interface PanelChangeEvent {
  added: any[];
  removed: any[];
}

/**
 * Event type for will change events
 */
export interface WillChangeEvent {
  index: number;
  panel: any;
  direction: string;
}

/**
 * Event type for changed events
 */
export interface ChangedEvent {
  index: number;
  panel: any;
  direction: string;
}

/**
 * Event type for need panel events
 */
export interface NeedPanelEvent {
  direction: string;
}

/**
 * Event type for visible change events
 */
export interface VisibleChangeEvent {
  visible: any[];
  invisible: any[];
}

/**
 * Event type for will restore events
 */
export interface WillRestoreEvent {
  status: {
    index: number;
    position: number;
    panels: any[];
  };
}

/**
 * Event type for restored events
 */
export interface RestoredEvent {
  status: {
    index: number;
    position: number;
    panels: any[];
  };
} 