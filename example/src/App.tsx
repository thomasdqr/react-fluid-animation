import React, { useState, useRef, useEffect } from 'react'
import FluidAnimation from 'react-fluid-animation'
import GitHubCorner from 'react-github-corner'
import { Pane } from 'tweakpane'

interface FluidConfig {
  textureDownsample: number
  densityDissipation: number
  velocityDissipation: number
  pressureDissipation: number
  pressureIterations: number
  curl: number
  splatRadius: number
  colors: number[][]
}

const defaultConfig: FluidConfig = {
  textureDownsample: 1,
  densityDissipation: 0.98,
  velocityDissipation: 0.99,
  pressureDissipation: 0.8,
  pressureIterations: 25,
  curl: 30,
  splatRadius: 0.005,
  colors: [
    [10, 0, 30],   // Purple
    [0, 26, 10],   // Green
    [20, 10, 0],   // Orange
    [0, 10, 30],   // Blue
    [30, 0, 10]    // Red
  ]
}

const colorPresets: Record<string, number[][]> = {
  default: [
    [10, 0, 30],   // Purple
    [0, 26, 10],   // Green
    [20, 10, 0],   // Orange
    [0, 10, 30],   // Blue
    [30, 0, 10]    // Red
  ],
  warm: [
    [30, 0, 0],    // Red
    [30, 15, 0],   // Orange
    [30, 30, 0],   // Yellow
    [20, 10, 0],   // Light orange
    [15, 5, 0]     // Light red
  ],
  cool: [
    [0, 0, 30],    // Blue
    [0, 15, 30],   // Light blue
    [0, 30, 30],   // Cyan
    [0, 10, 20],   // Darker blue
    [10, 0, 30]    // Purple
  ],
  rainbow: [
    [30, 0, 0],    // Red
    [30, 30, 0],   // Yellow
    [0, 30, 0],    // Green
    [0, 30, 30],   // Cyan
    [0, 0, 30],    // Blue
    [30, 0, 30]    // Magenta
  ]
}

const App: React.FC = () => {
  const [config, setConfig] = useState<FluidConfig>(defaultConfig)
  const [colorScheme, setColorScheme] = useState('default')
  const animationRef = useRef<any>(null)
  const paneRef = useRef<Pane | null>(null)

  useEffect(() => {
    // Create Tweakpane instance
    const pane = new Pane({
      title: 'Fluid Animation Controls',
      container: document.querySelector('.tweakpane-container') as HTMLElement || undefined
    })

    // Add controls
    pane.addBinding(config, 'textureDownsample', {
      label: 'Texture Downsample',
      options: { '0': 0, '1': 1, '2': 2 }
    })

    pane.addBinding(config, 'densityDissipation', {
      label: 'Density Diffusion',
      min: 0.9,
      max: 1.0
    })

    pane.addBinding(config, 'velocityDissipation', {
      label: 'Velocity Diffusion',
      min: 0.9,
      max: 1.0
    })

    pane.addBinding(config, 'pressureDissipation', {
      label: 'Pressure Diffusion',
      min: 0.0,
      max: 1.0
    })

    pane.addBinding(config, 'pressureIterations', {
      label: 'Pressure Iterations',
      min: 1,
      max: 60,
      step: 1
    })

    pane.addBinding(config, 'curl', {
      label: 'Curl',
      min: 0,
      max: 50,
      step: 1
    })

    pane.addBinding(config, 'splatRadius', {
      label: 'Splat Radius',
      min: 0.0001,
      max: 0.02
    })

    const colorSchemeBinding = pane.addBinding({ colorScheme }, 'colorScheme', {
      label: 'Color Scheme',
      options: Object.keys(colorPresets).reduce((acc, key) => ({ ...acc, [key]: key }), {})
    })

    pane.addButton({
      title: 'Random Splats',
      label: 'Random Splats'
    }).on('click', handleRandomSplats)

    pane.addButton({
      title: 'Reset Config',
      label: 'Reset Config'
    }).on('click', handleReset)

    // Handle updates
    pane.on('change', (ev) => {
      if (ev.target === colorSchemeBinding) {
        setColorScheme(ev.value as string)
        setConfig({ ...config, colors: colorPresets[ev.value as keyof typeof colorPresets] })
      } else {
        const target = ev.target as { key?: string };
        if (target.key) {
          setConfig(prev => ({ ...prev, [target.key as string]: ev.value }))
        }
      }
    })

    paneRef.current = pane

    return () => {
      pane.dispose()
    }
  }, [])

  const handleRandomSplats = () => {
    animationRef.current?.addSplats(5 + Math.random() * 20 | 0)
  }

  const handleReset = () => {
    setConfig(defaultConfig)
    setColorScheme('default')
  }

  return (
    <div style={{ height: '100vh' }}>
      <FluidAnimation
        config={config}
        animationRef={animationRef}
      />

      <div
        style={{
          position: 'absolute',
          zIndex: 1,
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          padding: '1em',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: '#fff',
          fontFamily: 'Quicksand, "Helvetica Neue", sans-serif',
          pointerEvents: 'none'
        }}
      >
        <h1
          style={{
            fontSize: '3em',
            textShadow: '2px 2px 8px rgba(0, 0, 0, 0.5)'
          }}
        >
          React Fluid Animation
        </h1>
      </div>

      <GitHubCorner
        href='https://github.com/transitive-bullshit/react-fluid-animation'
        bannerColor='#70B7FD'
        direction='left'
      />

      <div className="tweakpane-container" style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        zIndex: 1000
      }} />
    </div>
  )
}

export default App 
