/**
 * Error for Flicking
 * @ko Flicking 에러
 */
class FlickingError extends Error {
  /**
   * @param message Error message
   */
  public constructor(message: string) {
    super(message);
  
    this.name = "FlickingError";
    
    // Restore prototype chain for ES5 environments
    if (typeof Object.setPrototypeOf === "function") {
      Object.setPrototypeOf(this, FlickingError.prototype);
    } else {
      (this as any).__proto__ = FlickingError.prototype;
    }
  }
}

export default FlickingError; 