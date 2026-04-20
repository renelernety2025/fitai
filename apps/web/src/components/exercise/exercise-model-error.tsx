'use client';

import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/** Error boundary for 3D Canvas — shows fallback if WebGL/Three.js fails. */
export class ExerciseModelError extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mb-12 flex aspect-[16/10] max-h-[500px] w-full items-center justify-center rounded-2xl border border-white/8 bg-black/50">
          <div className="text-center">
            <p className="text-sm text-white/40">
              3D nahled neni dostupny na tomto zarizeni
            </p>
            <p className="mt-1 text-[10px] text-white/20">
              Instrukce a faze pohybu jsou nize
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
