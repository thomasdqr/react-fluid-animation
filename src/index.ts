import ReactFluidAnimation, { ReactFluidAnimationProps, defaultConfig } from './react-fluid-animation'
import FluidAnimation from './fluid-animation'
import type { FluidConfig, SplatOptions } from './fluid-animation'

// Re-export all necessary types and components
export { 
  FluidAnimation,
  defaultConfig,
  type FluidConfig,
  type ReactFluidAnimationProps,
  type SplatOptions
}

// Export the component with its type information
export default ReactFluidAnimation 