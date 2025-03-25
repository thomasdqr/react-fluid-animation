import React, { useEffect, useRef, useState, forwardRef, RefObject, useCallback } from 'react'
import raf from 'raf'
import { ResizeObserver } from '@juggle/resize-observer'

import FluidAnimation, { defaultConfig, FluidConfig } from './fluid-animation'

// Add an export for FluidAnimation config
export { defaultConfig }

interface Dimensions {
  width: number;
  height: number;
}

// Custom hook for resize observation
export const useResizeObserver = (ref: RefObject<HTMLElement>): Dimensions => {
  const [dimensions, setDimensions] = useState<Dimensions>({ width: 0, height: 0 })

  useEffect(() => {
    if (!ref || !ref.current) return

    const resizeObserver = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect
      setDimensions({ width, height })
    })

    resizeObserver.observe(ref.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [ref])

  return dimensions
}

// Export interface to match the type definition in types/react-fluid-animation.ts
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
  /** Additional props passed to the div */
  [key: string]: any;
}

// Main component as a function component (not using forwardRef)
const ReactFluidAnimation: React.FC<ReactFluidAnimationProps> = (props) => {
  const {
    content,
    config = defaultConfig,
    style = {},
    animationRef,
    disableRandomSplats = true,
    movementThreshold = 0,
    ...rest
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationInstance = useRef<FluidAnimation | null>(null);
  const rafRef = useRef<number | null>(null);
  
  // Use resize observer directly in the component
  const dimensions = useResizeObserver(containerRef as RefObject<HTMLElement>);

  const onResize = useCallback(() => {
    if (!containerRef.current || !canvasRef.current) return;
    
    canvasRef.current.width = containerRef.current.clientWidth;
    canvasRef.current.height = containerRef.current.clientHeight;

    if (animationInstance.current) {
      animationInstance.current.resize();
    }
  }, []);

  const resetAnimation = useCallback(() => {
    onResize();

    if (!canvasRef.current) return;

    animationInstance.current = new FluidAnimation({
      canvas: canvasRef.current,
      content,
      config,
      disableRandomSplats,
      movementThreshold
    });

    if (animationRef) {
      animationRef(animationInstance.current);
    }
  }, [content, config, disableRandomSplats, movementThreshold, animationRef, onResize]);

  const tick = useCallback(() => {
    if (animationInstance.current) {
      animationInstance.current.update();
    }

    rafRef.current = raf(tick);
  }, []);

  // Initialize animation
  useEffect(() => {
    resetAnimation();
    tick();

    return () => {
      if (rafRef.current) {
        raf.cancel(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [resetAnimation, tick]);

  // Handle prop changes
  useEffect(() => {
    onResize();

    if (config && animationInstance.current) {
      animationInstance.current.config = {
        ...defaultConfig,
        ...config
      };
      
      // Force immediate update on config changes
      // Update dynamic shader parameters immediately to see changes in real-time
      const gl = (animationInstance.current as any)._gl;
      const programs = (animationInstance.current as any)._programs;
      
      // Update display shader settings
      if (programs?.display) {
        programs.display.bind();
        gl.uniform1f(programs.display.uniforms.uAdditiveMode, (config as any).additiveMode ? 1.0 : 0.0);
        gl.uniform1f(programs.display.uniforms.uAdditiveThreshold, (config as any).additiveThreshold || 1.0);
      }
      
      // Update splat shader settings
      if (programs?.splat) {
        programs.splat.bind();
        gl.uniform1f(programs.splat.uniforms.uAdditiveMode, (config as any).additiveMode ? 1.0 : 0.0);
        gl.uniform1f(programs.splat.uniforms.uAdditiveThreshold, (config as any).additiveThreshold || 1.0);
      }
    }
    
    if (animationInstance.current) {
      animationInstance.current.disableRandomSplats = !!disableRandomSplats;
      if (typeof movementThreshold === 'number') {
        animationInstance.current.movementThreshold = movementThreshold;
      }
    }
  }, [config, disableRandomSplats, movementThreshold, onResize]);

  // Handle resize from observer
  useEffect(() => {
    if (dimensions.width !== 0 && dimensions.height !== 0) {
      onResize();
    }
  }, [dimensions, onResize]);

  const onMouseDown = (event: React.MouseEvent) => {
    event.preventDefault();
    animationInstance.current?.onMouseDown(event.nativeEvent);
  };

  const onMouseMove = (event: React.MouseEvent) => {
    event.preventDefault();
    animationInstance.current?.onMouseMove(event.nativeEvent);
  };

  const onMouseUp = (event: React.MouseEvent) => {
    event.preventDefault();
    animationInstance.current?.onMouseUp(event.nativeEvent);
  };

  const onTouchStart = (event: React.TouchEvent) => {
    animationInstance.current?.onTouchStart(event.nativeEvent);
  };

  const onTouchMove = (event: React.TouchEvent) => {
    animationInstance.current?.onTouchMove(event.nativeEvent);
  };

  const onTouchEnd = (event: React.TouchEvent) => {
    animationInstance.current?.onTouchEnd(event.nativeEvent);
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        ...style
      }}
      {...rest}
      ref={containerRef}
    >
      <canvas
        ref={canvasRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          width: '100%',
          height: '100%',
          background: 'transparent'
        }}
      />
    </div>
  );
};

// Add display name for debugging
ReactFluidAnimation.displayName = 'ReactFluidAnimation';

export default ReactFluidAnimation;