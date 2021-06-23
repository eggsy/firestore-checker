import consola from "consola";

export function log(message: any) {
  consola.log(message);
}

export function success(message: any) {
  consola.success(message);
}

export function warn(message: any) {
  consola.warn(message);
}

export function error(message: any) {
  consola.error(message);
}
