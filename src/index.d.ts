import React from 'react';

export interface FluidConfig {
  textureDownsample: number;
  densityDissipation: number;
  velocityDissipation: number;
  pressureDissipation: number;
  pressureIterations: number;
  curl: number;
  splatRadius: number;
  additiveMode?: boolean;
  additiveThreshold?: number;
  colors?: Array<[number, number, number]>;
}

export interface ReactFluidAnimationProps {
  content?: string;
  config?: Partial<FluidConfig>;
  style?: React.CSSProperties;
  animationRef?: (animation: any) => void;
  disableRandomSplats?: boolean;
  movementThreshold?: number;
  size?: {
    width: number;
    height: number;
  };
}

// Export the FluidAnimation class
export class FluidAnimation {
  constructor(options: {
    canvas: HTMLCanvasElement;
    content?: string;
    config?: Partial<FluidConfig>;
    disableRandomSplats?: boolean;
    movementThreshold?: number;
  });
  
  resize(): void;
  update(): void;
  addRandomSplats(count: number): void;
  onMouseDown(e: MouseEvent): void;
  onMouseMove(e: MouseEvent): void;
  onMouseUp(e: MouseEvent): void;
  onTouchStart(e: TouchEvent): void;
  onTouchMove(e: TouchEvent): void;
  onTouchEnd(e: TouchEvent): void;
}

// Export the default component
declare const ReactFluidAnimation: React.ForwardRefExoticComponent<ReactFluidAnimationProps & React.RefAttributes<any>>;

export default ReactFluidAnimation;
export const defaultConfig: FluidConfig; 