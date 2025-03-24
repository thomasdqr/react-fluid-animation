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

export interface SplatOptions {
  x: number;
  y: number;
  dx: number;
  dy: number;
  color: [number, number, number];
}

export const defaultConfig: FluidConfig;

export default class FluidAnimation {
  constructor(options: {
    canvas: HTMLCanvasElement;
    config?: Partial<FluidConfig>;
    content?: string;
    disableRandomSplats?: boolean;
    movementThreshold?: number;
  });

  get config(): FluidConfig;
  set config(config: Partial<FluidConfig>): void;
  get disableRandomSplats(): boolean;
  set disableRandomSplats(value: boolean): void;
  get movementThreshold(): number;
  set movementThreshold(value: number): void;
  get width(): number;
  get height(): number;

  addSplat(splat: SplatOptions): void;
  addSplats(splats: SplatOptions[]): void;
  addRandomSplats(count: number): void;
  resize(): void;
  update(): void;

  onMouseDown(event: MouseEvent): void;
  onMouseMove(event: MouseEvent): void;
  onMouseUp(event: MouseEvent): void;
  onTouchStart(event: TouchEvent): void;
  onTouchMove(event: TouchEvent): void;
  onTouchEnd(event: TouchEvent): void;
} 