
// declare const BRIDGE: typeof import("@/main/preload.ts").BRIDGE;

declare global {
  interface Window {
    BRIDGE: typeof import("@/main/preload.ts").BRIDGE;
  }
}
export {}
