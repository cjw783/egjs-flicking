/**
 * Direction for Flicking movement
 * @ko Flicking 이동 방향
 */
export const DIRECTION = {
  PREV: "PREV",
  NEXT: "NEXT",
  NONE: "NONE"
} as const;

/**
 * Available preset align options
 * @ko 사용 가능한 정렬 옵션
 */
export const ALIGN = {
  /**
   * Left align
   * @ko 왼쪽 정렬
   */
  LEFT: "left",
  /**
   * Center align
   * @ko 가운데 정렬
   */
  CENTER: "center",
  /**
   * Right align
   * @ko 오른쪽 정렬
   */
  RIGHT: "right"
} as const;

/**
 * Available move type options
 * @ko 사용 가능한 이동 타입 옵션
 */
export const MOVE_TYPE = {
  /**
   * Snap to the closest panel after movement
   * @ko 이동 후 가장 가까운 패널로 스냅
   */
  SNAP: "snap",
  /**
   * No snapping after movement
   * @ko 이동 후 스냅하지 않음 (자유 스크롤)
   */
  FREE_SCROLL: "freeScroll",
  /**
   * Always snap to a panel
   * @ko 항상 패널에 스냅
   */
  STRICT: "strict"
} as const;

/**
 * Available circular fallback strategy
 * @ko 사용 가능한 순환 복구 전략
 */
export const CIRCULAR_FALLBACK = {
  /**
   * Do nothing
   * @ko 아무것도 하지 않음
   */
  NONE: "none",
  /**
   * Return to linear behavior
   * @ko 선형 동작으로 돌아감
   */
  LINEAR: "linear"
} as const;

/**
 * Event type for Flicking events
 * @ko Flicking 이벤트 타입
 */
export const EVENTS = {
  READY: "ready",
  BEFORE_RESIZE: "beforeResize",
  AFTER_RESIZE: "afterResize",
  HOLD_START: "holdStart",
  HOLD_END: "holdEnd",
  MOVE_START: "moveStart",
  MOVE: "move",
  MOVE_END: "moveEnd",
  WILL_CHANGE: "willChange",
  CHANGED: "changed",
  WILL_RESTORE: "willRestore",
  RESTORED: "restored",
  SELECT: "select",
  NEED_PANEL: "needPanel",
  VISIBLE_CHANGE: "visibleChange",
  REACH_EDGE: "reachEdge",
  PANEL_CHANGE: "panelChange"
} as const; 