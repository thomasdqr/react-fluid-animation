import { FC, RefObject } from 'react';
import { SizeMeProps } from 'react-sizeme';
import FluidAnimation, { FluidConfig } from './fluid-animation';

export interface ReactFluidAnimationProps extends SizeMeProps {
  content?: string;
  config?: Partial<FluidConfig>;
  style?: React.CSSProperties;
  animationRef?: (animation: FluidAnimation) => void;
  disableRandomSplats?: boolean;
  movementThreshold?: number;
}

declare const ReactFluidAnimation: FC<ReactFluidAnimationProps>;

export default ReactFluidAnimation;
export { FluidAnimation, FluidConfig };
export { defaultConfig } from './fluid-animation'; 