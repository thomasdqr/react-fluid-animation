import React from 'react';
import type { FluidConfig } from './fluid-animation';
import FluidAnimation from '../fluid-animation';

/**
 * Props for the ReactFluidAnimation component
 */
export interface ReactFluidAnimationProps {
  /** Optional HTML content to overlay */
  content?: string;
  /** Configuration options for the fluid animation */
  config?: Partial<FluidConfig>;
  /** Custom styles for the container */
  style?: React.CSSProperties;
  /** Callback to access the FluidAnimation instance */
  animationRef?: (animation: FluidAnimation) => void;
  /** Disable random splats (defaults to true) */
  disableRandomSplats?: boolean;
  /** Threshold for movement detection */
  movementThreshold?: number;
  /** Size information (automatically provided when using withResizeObserver) */
  size?: {
    width: number;
    height: number;
  };
} 