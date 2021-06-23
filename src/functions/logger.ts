import consola from "consola";

/**
 * Log message to console.
 * @param message
 */
export function log(message: any) {
  consola.log(message);
}

/**
 * Log message to console in "success" style
 * @param message
 */
export function success(message: any) {
  consola.success(message);
}

/**
 * Log message to console in "warn" style
 * @param message
 */
export function warn(message: any) {
  consola.warn(message);
}

/**
 * Log message to console in "error" style
 * @param message
 */
export function error(message: any) {
  consola.error(message);
}
