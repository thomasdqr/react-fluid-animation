/**
 * Configuration options for the fluid animation
 */
export interface FluidConfig {
  /** Level of texture downsampling (0-2) */
  textureDownsample: number;
  /** How quickly density properties dissipate (0.9-1.0) */
  densityDissipation: number;
  /** How quickly velocity properties dissipate (0.9-1.0) */
  velocityDissipation: number;
  /** How quickly pressure properties dissipate (0.0-1.0) */
  pressureDissipation: number;
  /** Number of pressure iterations (1-60) */
  pressureIterations: number;
  /** Curl intensity (0-50) */
  curl: number;
  /** Radius of splats (0.0001-0.02) */
  splatRadius: number;
  /** Enable additive color mode */
  additiveMode?: boolean;
  /** Control threshold for additive mode to turn fully white (0.5-10.0) */
  additiveThreshold?: number;
  /** Control speed of color cycling (0.01-5.0) */
  colorCycleSpeed?: number;
  /** Array of RGB colors for the fluid */
  colors?: Array<[number, number, number]>;
}

/**
 * Options for creating a splat in the fluid animation
 */
export interface SplatOptions {
  /** X coordinate */
  x: number;
  /** Y coordinate */
  y: number;
  /** X velocity */
  dx: number;
  /** Y velocity */
  dy: number;
  /** RGB color array */
  color: [number, number, number];
}

/**
 * Options for fluid animation constructor
 */
export interface FluidAnimationOptions {
  /** Canvas element to render on */
  canvas: HTMLCanvasElement;
  /** Configuration options */
  config?: Partial<FluidConfig>;
  /** Optional content */
  content?: string;
  /** Disable random splats (defaults to true) */
  disableRandomSplats?: boolean;
  /** Threshold for movement detection */
  movementThreshold?: number;
} 