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

/** The default configuration for the fluid animation */
export const defaultConfig: FluidConfig;

/**
 * The core fluid animation class
 * Random splats are disabled by default and will only trigger when explicitly called
 */
export default class FluidAnimation {
  /**
   * Create a new fluid animation
   */
  constructor(options: {
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
  });

  /** Get the current configuration */
  get config(): FluidConfig;
  /** Set the configuration */
  set config(config: Partial<FluidConfig>): void;
  /** Get whether random splats are disabled */
  get disableRandomSplats(): boolean;
  /** Set whether random splats are disabled */
  set disableRandomSplats(value: boolean): void;
  /** Get the movement threshold */
  get movementThreshold(): number;
  /** Set the movement threshold */
  set movementThreshold(value: number): void;
  /** Get the canvas width */
  get width(): number;
  /** Get the canvas height */
  get height(): number;

  /** Add a single splat to the animation */
  addSplat(splat: SplatOptions): void;
  /** Add multiple splats to the animation */
  addSplats(splats: SplatOptions[]): void;
  /** Add a specified number of random splats */
  addRandomSplats(count: number): void;
  /** Resize the animation to match canvas dimensions */
  resize(): void;
  /** Update the animation (called automatically) */
  update(): void;

  /** Handle mouse down event */
  onMouseDown(event: MouseEvent): void;
  /** Handle mouse move event */
  onMouseMove(event: MouseEvent): void;
  /** Handle mouse up event */
  onMouseUp(event: MouseEvent): void;
  /** Handle touch start event */
  onTouchStart(event: TouchEvent): void;
  /** Handle touch move event */
  onTouchMove(event: TouchEvent): void;
  /** Handle touch end event */
  onTouchEnd(event: TouchEvent): void;
} 