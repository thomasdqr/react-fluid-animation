import React, { Component, ForwardRefExoticComponent, RefAttributes } from 'react';

export interface FluidConfig {
  textureDownsample: number;
  densityDissipation: number;
  velocityDissipation: number;
  pressureDissipation: number;
  pressureIterations: number;
  curl: number;
  splatRadius: number;
  colors?: Array<[number, number, number]>;
}

export interface SizeMeProps {
  size?: {
    width: number;
    height: number;
  };
}

export interface ReactFluidAnimationProps extends SizeMeProps {
  content?: string;
  config?: Partial<FluidConfig>;
  style?: React.CSSProperties;
  animationRef?: (animation: any) => void;
  disableRandomSplats?: boolean;
  movementThreshold?: number;
}

class ReactFluidAnimationBase extends Component<ReactFluidAnimationProps> {
  _container: HTMLDivElement | null;
  _canvas: HTMLCanvasElement | null;
  _animation: any;
  _tickRaf: number | null;
}

declare const ReactFluidAnimation: ForwardRefExoticComponent<ReactFluidAnimationProps & RefAttributes<ReactFluidAnimationBase>>;

export default ReactFluidAnimation;
export { FluidConfig };
export const defaultConfig: FluidConfig; 