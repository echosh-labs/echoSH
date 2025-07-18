// src/main/asset.d.ts

/**
 * This declaration file tells TypeScript how to handle imports
 * ending with `?asset`. Vite uses this suffix to return the
 * resolved public path of a static asset as a string.
 */
declare module '*?asset' {
  const src: string
  export default src
}
