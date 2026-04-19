/**
 * React Three Fiber JSX element type declarations.
 * R3F v9 + TS 5.9 module augmentation may not auto-resolve.
 * Declare the specific Three.js elements used in this project.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

declare namespace JSX {
  interface IntrinsicElements {
    ambientLight: any;
    directionalLight: any;
    primitive: any;
    mesh: any;
    meshStandardMaterial: any;
    group: any;
  }
}
