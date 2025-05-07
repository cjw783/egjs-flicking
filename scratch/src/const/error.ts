export const MESSAGE = {
  INDEX_OUT_OF_RANGE: "Index is out of range.",
  POSITION_NOT_REACHABLE: "Position is not reachable. Consider enabling circular behavior.",
  NOT_ATTACHED_TO_FLICKING: "This component is not attached to Flicking instance.",
  NOT_ALLOWED_IN_FRAMEWORK: "This method call is not allowed in this framework.",
  WRONG_TYPE: "Options should be one of the provided types.",
  NOT_INITIALIZED: "Flicking is not initialized yet. This behavior is only allowed on flicking:ready event.",
  CANNOT_RENDER_PANEL: "Cannot render panels because of wrong HTML structure.",
  NOT_ENOUGH_PANEL: "Not enough panels to render.",
  OPERATION_BLOCKED: "This operation is blocked by the event handler.",
  NOT_SUPPORT_LAZY_LOADING: "Lazy loading feature is not supported in this environment.",
  NOT_SUPPORT_TRANSFORM: "Transform is not supported in this environment."
} as const; 