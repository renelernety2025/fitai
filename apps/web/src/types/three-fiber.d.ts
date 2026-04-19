/* eslint-disable @typescript-eslint/no-explicit-any */

// React Three Fiber JSX intrinsic elements.
// R3F v8 module augmentation doesn't auto-resolve with TS 5.9.
// Declare elements used in this project.

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
