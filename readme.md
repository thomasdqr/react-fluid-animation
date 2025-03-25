# React Fluid Animation

A fork of [transitive-bullshit/react-fluid-animation](https://github.com/transitive-bullshit/react-fluid-animation) with enhanced features and TypeScript support.

This package provides a beautiful WebGL fluid animation that responds to mouse/touch input for React applications. It's a direct port and extension of Pavel Dobryakov's excellent work on WebGL fluid simulation.

## Live Demo

**[Try the live demo here!](https://thomasdqr.github.io/react-fluid-animation/)**

![image](https://github.com/user-attachments/assets/7a1184ee-5c72-4bb4-8e1c-4c5d02b5522e)


## Installation

```bash
# Using npm
npm install react-fluid-animation

# Using yarn
yarn add react-fluid-animation

# Using pnpm
pnpm add react-fluid-animation
```

## Basic Usage

Here's a simple example to get you started:

```jsx
import React from 'react';
import ReactFluidAnimation from 'react-fluid-animation';

const App = () => {
  return (
    <div style={{ height: '100vh' }}>
      <ReactFluidAnimation />
    </div>
  );
};

export default App;
```

## Advanced Usage

You can customize the animation with various properties:

```jsx
import React, { useRef } from 'react';
import ReactFluidAnimation, { 
  FluidAnimation, 
  FluidConfig,
  defaultConfig 
} from 'react-fluid-animation';

const App = () => {
  // Create a custom configuration
  const config = {
    textureDownsample: 1,
    densityDissipation: 0.95,
    velocityDissipation: 0.98,
    pressureDissipation: 0.8,
    pressureIterations: 25,
    curl: 30,
    splatRadius: 0.005,
    additiveMode: true,
    additiveThreshold: 1.0,
    colorCycleSpeed: 0.1,
    colors: [
      [10, 0, 30],   // Purple
      [0, 26, 10],   // Green
      [20, 10, 0],   // Orange
      [0, 10, 30],   // Blue
      [30, 0, 10]    // Red
    ]
  };

  // Reference to access the animation instance
  const handleAnimationRef = (animation) => {
    // You can manually add splats or control the animation
    // Example: animation.addRandomSplats(5);
  };

  return (
    <div style={{ height: '100vh' }}>
      <ReactFluidAnimation
        config={config}
        animationRef={handleAnimationRef}
        disableRandomSplats={true}
        movementThreshold={10}
      />

      {/* Optional overlay content */}
      <div style={{
        position: 'absolute',
        zIndex: 1,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#fff',
        pointerEvents: 'none'
      }}>
        <h1>My Fluid Animation</h1>
      </div>
    </div>
  );
};

export default App;
```

## Running the Examples

The package includes an example project demonstrating different configurations and features:

```bash
# Clone the repository
git clone https://github.com/thomasdqr/react-fluid-animation.git
cd react-fluid-animation

# Install dependencies
npm install

# Run the example
cd example
npm run dev
```

## Props

`ReactFluidAnimation` accepts the following props:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `string` | `undefined` | Optional HTML content to overlay |
| `config` | `Partial<FluidConfig>` | `defaultConfig` | Configuration options for the fluid animation |
| `style` | `React.CSSProperties` | `{}` | Custom styles for the container |
| `animationRef` | `(animation: FluidAnimation) => void` | `undefined` | Callback to access the FluidAnimation instance |
| `disableRandomSplats` | `boolean` | `true` | Disable random splats |
| `movementThreshold` | `number` | `0` | Threshold for movement detection |

## Configuration Options

The `config` prop accepts a `FluidConfig` object with the following properties:

| Property | Type | Default | Range | Description |
|----------|------|---------|-------|-------------|
| `textureDownsample` | `number` | `1` | `0-2` | Level of texture downsampling |
| `densityDissipation` | `number` | `0.95` | `0.9-1.0` | How quickly density properties dissipate |
| `velocityDissipation` | `number` | `0.98` | `0.9-1.0` | How quickly velocity properties dissipate |
| `pressureDissipation` | `number` | `0.8` | `0.0-1.0` | How quickly pressure properties dissipate |
| `pressureIterations` | `number` | `25` | `1-60` | Number of pressure iterations |
| `curl` | `number` | `30` | `0-50` | Curl intensity |
| `splatRadius` | `number` | `0.005` | `0.0001-0.02` | Radius of splats |
| `additiveMode` | `boolean` | `false` | - | Enable additive color mode |
| `additiveThreshold` | `number` | `1.0` | `0.5-10.0` | Threshold for additive mode to turn fully white |
| `colorCycleSpeed` | `number` | `0.1` | `0.01-5.0` | Speed of color cycling |
| `colors` | `Array<[number, number, number]>` | See below | - | Array of RGB colors for the fluid |

Default colors:
```js
[
  [5, 0, 15],   // Purple (reduced)
  [0, 13, 5],   // Green (reduced)
  [10, 5, 0],   // Orange (reduced)
  [0, 5, 15],   // Blue (reduced)
  [15, 0, 5]    // Red (reduced)
]
```

## API

When using the `animationRef` prop, you get access to a `FluidAnimation` instance with these methods:

| Method | Parameters | Description |
|--------|------------|-------------|
| `addSplat` | `SplatOptions` | Add a single splat to the animation |
| `addSplats` | `SplatOptions[]` | Add multiple splats to the animation |
| `addRandomSplats` | `count: number` | Add a specified number of random splats |
| `resize` | none | Resize the animation to match canvas dimensions |
| `update` | none | Update the animation (called automatically) |

The `SplatOptions` interface includes:
- `x`: x-coordinate (optional)
- `y`: y-coordinate (optional)
- `dx`: x-velocity (optional)
- `dy`: y-velocity (optional)
- `color`: RGB color array (optional)

## Events

The component automatically handles the following events:
- Mouse events: `onMouseDown`, `onMouseMove`, `onMouseUp`
- Touch events: `onTouchStart`, `onTouchMove`, `onTouchEnd`

These events trigger splats in the fluid animation based on user interaction.

## Credits

This project is a fork of the original [react-fluid-animation](https://github.com/transitive-bullshit/react-fluid-animation) by Travis Fischer.

Special thanks to:

- [Pavel Dobryakov](https://github.com/PavelDoGreat/WebGL-Fluid-Simulation) - Original WebGL fluid experiment by Pavel Dobryakov. This project is a direct port and extension of Pavel's excellent work.
- [GPU Gems Chapter 38](http://developer.download.nvidia.com/books/HTML/gpugems/gpugems_ch38.html) - Fast fluid dynamics simulation on the GPU.
- [jwagner](https://github.com/jwagner/fluidwebgl) - Similar WebGL implementation.
- [haxiomic](https://github.com/haxiomic/GPU-Fluid-Experiments) - Alternative WebGL fluid experiment.

## License

MIT
