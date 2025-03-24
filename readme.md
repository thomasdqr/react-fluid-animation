# react-fluid-animation ([demo](https://transitive-bullshit.github.io/react-fluid-animation/))

> Fluid media simulation for React powered by WebGL.

[![NPM](https://img.shields.io/npm/v/react-fluid-animation.svg)](https://www.npmjs.com/package/react-fluid-animation) [![Build Status](https://travis-ci.com/transitive-bullshit/react-fluid-animation.svg?branch=master)](https://travis-ci.com/transitive-bullshit/react-fluid-animation) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

[![Demo](https://raw.githubusercontent.com/transitive-bullshit/react-fluid-animation/master/example/demo.gif)](https://transitive-bullshit.github.io/react-fluid-animation/)

This is a port of the WebGL fluid animation by [Pavel Dobryakov](https://github.com/PavelDoGreat/WebGL-Fluid-Simulation), which itself is a port of [GPU Gems Chapter 38](http://developer.download.nvidia.com/books/HTML/gpugems/gpugems_ch38.html). It provides a very fast, stable fluid simulation by iteratively solving the Navier-Stokes equations for incompressible flow.

## Install

```bash
npm install --save react-fluid-animation
```

## Usage

Check out the [demo](https://transitive-bullshit.github.io/react-fluid-animation/).

### ES Modules (Recommended)

```jsx
import React from 'react'
import FluidAnimation from 'react-fluid-animation'

export default function App() {
  return (
    <FluidAnimation
      style={{ height: '100vh' }}
    />
  )
}
```

### CommonJS

```jsx
const React = require('react')
const FluidAnimation = require('react-fluid-animation').default

function App() {
  return (
    <FluidAnimation
      style={{ height: '100vh' }}
    />
  )
}

module.exports = App
```

## TypeScript Support

This package includes TypeScript type definitions.

```tsx
import React from 'react'
import FluidAnimation, { FluidConfig } from 'react-fluid-animation'

// Optional configuration
const config: Partial<FluidConfig> = {
  textureDownsample: 1,
  densityDissipation: 0.98,
  velocityDissipation: 0.99
}

export default function App() {
  return (
    <FluidAnimation
      config={config}
      style={{ height: '100vh' }}
    />
  )
}
```

## Props

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| content | string | | Optional background content for the animation |
| config | object | defaultConfig | Configuration for the fluid animation |
| style | object | {} | Optional style object for the container |
| animationRef | function | | Optional callback with a reference to the animation instance |
| disableRandomSplats | boolean | false | Disable random splats that spawn occasionally |

## Configuration

```js
// Default configuration
const defaultConfig = {
  textureDownsample: 1,
  densityDissipation: 0.95,
  velocityDissipation: 0.98,
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
```

You can provide your own array of colors to customize the fluid animation. Each color is represented as an RGB array with values ranging from 0 to 30 for optimal fluid display. If you don't provide the `colors` array, the animation will use the default HSB-based color generation.

```jsx
// Example with custom colors
const config = {
  // ... other config options
  colors: [
    [30, 0, 0],    // Red
    [0, 30, 0],    // Green
    [0, 0, 30],    // Blue
    [30, 30, 0],   // Yellow
    [0, 30, 30]    // Cyan
  ]
}
```

## Credits

- [Pavel Dobryakov](https://github.com/PavelDoGreat/WebGL-Fluid-Simulation) - Original WebGL fluid experiment by Pavel Dobryakov. This project is a direct port and extension of Pavel's excellent work.
- [GPU Gems Chapter 38](http://developer.download.nvidia.com/books/HTML/gpugems/gpugems_ch38.html) - Fast fluid dynamics simulation on the GPU.
- [jwagner](https://github.com/jwagner/fluidwebgl) - Similar WebGL implementation.
- [haxiomic](https://github.com/haxiomic/GPU-Fluid-Experiments) - Alternative WebGL fluid experiment.

## License

MIT © [Travis Fischer](https://github.com/transitive-bullshit)

Support my OSS work by <a href="https://twitter.com/transitive_bs">following me on twitter <img src="https://storage.googleapis.com/saasify-assets/twitter-logo.svg" alt="twitter" height="24px" align="center"></a>
