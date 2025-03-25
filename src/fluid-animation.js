import GLProgram from './gl-program'
import getGLContext from './get-gl-context'

import shaders from './shaders'

export const defaultConfig = {
  textureDownsample: 1,
  densityDissipation: 0.95,
  velocityDissipation: 0.98,
  pressureDissipation: 0.8,
  pressureIterations: 25,
  curl: 30,
  splatRadius: 0.005,
  additiveMode: false,
  additiveThreshold: 1.0, // Higher values require more fluid to turn white (range: 0.5-3.0 recommended)
  colorCycleSpeed: 0.1, // Controls how quickly colors cycle (0.01-1.0, where higher is faster)
  colors: [
    [5, 0, 15],   // Purple (reduced)
    [0, 13, 5],   // Green (reduced)
    [10, 5, 0],   // Orange (reduced)
    [0, 5, 15],   // Blue (reduced)
    [15, 0, 5]    // Red (reduced)
  ]
}

class Pointer {
  constructor() {
    this.id = -1
    this.x = 0
    this.y = 0
    this.dx = 0
    this.dy = 0
    this.down = false
    this.moved = false
    this.color = [30, 0, 300]
    this.prevX = 0
    this.prevY = 0
  }
}

export default class FluidAnimation {
  constructor(opts) {
    const {
      canvas,
      config = {
        ...defaultConfig,
        ...opts.config
      },
      disableRandomSplats = true,
      movementThreshold = 0
    } = opts

    this._canvas = canvas
    this._config = config
    this._disableRandomSplats = disableRandomSplats
    this._movementThreshold = movementThreshold

    this._pointers = [ new Pointer() ]
    this._splatStack = []

    const { gl, ext } = getGLContext(canvas)
    this._gl = gl
    this._ext = ext

    this._initPrograms()
    this._initBlit()
    this.resize()

    this._time = Date.now()
    this._timer = 0
    this._colorCycle = 0
  }

  get config() {
    return this._config
  }

  set config(config) {
    const prevConfig = this._config;
    this._config = {
      ...this._config,
      ...config
    };
    
    // Check if shader-relevant properties have changed
    const shaderPropsChanged = 
      prevConfig.additiveMode !== this._config.additiveMode || 
      prevConfig.additiveThreshold !== this._config.additiveThreshold;
    
    // If shader properties changed, update them immediately
    if (shaderPropsChanged && this._gl && this._programs) {
      // Update display shader
      if (this._programs.display) {
        this._programs.display.bind();
        this._gl.uniform1f(this._programs.display.uniforms.uAdditiveMode, this._config.additiveMode ? 1.0 : 0.0);
        this._gl.uniform1f(this._programs.display.uniforms.uAdditiveThreshold, this._config.additiveThreshold || 1.0);
      }
      
      // Update splat shader
      if (this._programs.splat) {
        this._programs.splat.bind();
        this._gl.uniform1f(this._programs.splat.uniforms.uAdditiveMode, this._config.additiveMode ? 1.0 : 0.0);
        this._gl.uniform1f(this._programs.splat.uniforms.uAdditiveThreshold, this._config.additiveThreshold || 1.0);
      }
    }
  }

  get disableRandomSplats() {
    return this._disableRandomSplats
  }

  set disableRandomSplats(value) {
    this._disableRandomSplats = value
  }

  get movementThreshold() {
    return this._movementThreshold
  }

  set movementThreshold(value) {
    this._movementThreshold = value
  }

  get width() {
    return this._canvas.width
  }

  get height() {
    return this._canvas.height
  }

  addSplat(splat) {
    this._splatStack.push([ splat ])
  }

  addSplats(splats) {
    this._splatStack.push(Array.isArray(splats) ? splats : [ splats ])
  }

  addRandomSplats(count) {
    const splats = []

    for (let i = 0; i < count; ++i) {
      splats.push(this._getRandomSplat())
    }

    this.addSplats(splats)
  }

  resize() {
    const {
      width,
      height
    } = this._canvas

    if (this._width !== width || this._height !== height) {
      this._width = width
      this._height = height

      this._initFramebuffers()
    }
  }

  onMouseMove = (e) => {
    const pointer = this._pointers[0];
    pointer.prevX = pointer.x;
    pointer.prevY = pointer.y;
    
    pointer.x = e.offsetX
    pointer.y = e.offsetY
    pointer.dx = (pointer.x - pointer.prevX) * 10.0
    pointer.dy = (pointer.y - pointer.prevY) * 10.0
    
    // Calculate movement magnitude
    const movementMagnitude = Math.sqrt(pointer.dx * pointer.dx + pointer.dy * pointer.dy);
    
    // Only set moved to true if movement is above threshold
    pointer.moved = movementMagnitude > this._movementThreshold;
    
    // Dynamically update color on mouse move
    this._updatePointerColor(pointer);
  }

  _updatePointerColor(pointer) {
    // Use custom colors if provided, otherwise generate dynamically
    if (this._config.colors && this._config.colors.length > 0) {
      // Cycle through the colors array using colorCycleSpeed to control the rate
      const now = Date.now() * 0.001;
      const cycleSpeed = this._config.colorCycleSpeed || 0.1;
      const colorIndex = Math.floor((now * cycleSpeed) % this._config.colors.length);
      pointer.color = this._config.colors[colorIndex].slice(); // Make a copy of the color
      
      // Add slight variations to colors for more interesting effects
      // Also scale variation by cycle speed for more consistent feel
      const variation = Math.sin(now * 0.3 * cycleSpeed) * 2;
      pointer.color = pointer.color.map(c => Math.max(0, c + variation));
    } else {
      // Original color generation logic based on HSB
      const now = Date.now() * 0.001;
      const cycleSpeed = this._config.colorCycleSpeed || 0.1;
      const hue = (now * 0.15 * cycleSpeed) % 1;
      const saturation = 0.6;
      const brightness = 0.6;
      
      // Convert HSB to RGB
      let r, g, b;
      
      const i = Math.floor(hue * 6);
      const f = hue * 6 - i;
      const p = brightness * (1 - saturation);
      const q = brightness * (1 - f * saturation);
      const t = brightness * (1 - (1 - f) * saturation);
      
      switch (i % 6) {
        case 0: r = brightness; g = t; b = p; break;
        case 1: r = q; g = brightness; b = p; break;
        case 2: r = p; g = brightness; b = t; break;
        case 3: r = p; g = q; b = brightness; break;
        case 4: r = t; g = p; b = brightness; break;
        case 5: r = brightness; g = p; b = q; break;
      }
      
      pointer.color = [r * 10, g * 10, b * 10];
    }
  }

  onMouseDown = (e) => {
    this._pointers[0].down = true
    this._updatePointerColor(this._pointers[0]);
  }

  onMouseUp = (e) => {
    this._pointers[0].down = false
  }

  onTouchStart = (e) => {
    e.preventDefault(); // Prevent default to avoid scrolling
    
    for (let i = 0; i < e.touches.length; ++i) {
      const touch = e.touches[i]
      if (i >= this._pointers.length) {
        this._pointers.push(new Pointer())
      }
      
      const pointer = this._pointers[i]
      pointer.id = touch.identifier
      pointer.down = true
      
      // Convert touch coordinates to canvas coordinates
      const rect = this._canvas.getBoundingClientRect()
      pointer.x = touch.clientX - rect.left
      pointer.y = touch.clientY - rect.top
      pointer.prevX = pointer.x
      pointer.prevY = pointer.y
      
      this._updatePointerColor(pointer)
    }
  }

  onTouchMove = (e) => {
    e.preventDefault(); // Prevent default to avoid scrolling
    
    for (let i = 0; i < e.touches.length; ++i) {
      const touch = e.touches[i]
      // Find the pointer with matching ID
      let pointer = null
      for (let j = 0; j < this._pointers.length; j++) {
        if (this._pointers[j].id === touch.identifier) {
          pointer = this._pointers[j]
          break
        }
      }
      
      if (!pointer) {
        continue // Skip if no matching pointer found
      }
      
      pointer.prevX = pointer.x
      pointer.prevY = pointer.y
      
      // Convert touch coordinates to canvas coordinates
      const rect = this._canvas.getBoundingClientRect()
      pointer.x = touch.clientX - rect.left
      pointer.y = touch.clientY - rect.top
      pointer.dx = (pointer.x - pointer.prevX) * 10.0
      pointer.dy = (pointer.y - pointer.prevY) * 10.0
      
      // Calculate movement magnitude
      const movementMagnitude = Math.sqrt(pointer.dx * pointer.dx + pointer.dy * pointer.dy);
      
      // Only set moved to true if movement is above threshold
      pointer.moved = movementMagnitude > this._movementThreshold;
      
      this._updatePointerColor(pointer)
    }
  }

  onTouchEnd = (e) => {
    e.preventDefault(); // Prevent default to avoid scrolling

    // Create an array of active touch identifiers
    const activeTouchIds = Array.from(e.touches).map(touch => touch.identifier)
    
    // Update each pointer that is no longer active
    for (let i = 0; i < this._pointers.length; i++) {
      const pointer = this._pointers[i]
      if (pointer.id !== -1 && !activeTouchIds.includes(pointer.id)) {
        pointer.down = false
        pointer.moved = false // Reset moved flag when touch ends
      }
    }
  }

  _initPrograms() {
    const gl = this._gl
    const ext = this._ext

    this._programs = { }
    this._programs.clear = new GLProgram(gl, shaders.vert, shaders.clear)
    this._programs.display = new GLProgram(gl, shaders.vert, shaders.display)
    this._programs.splat = new GLProgram(gl, shaders.vert, shaders.splat)
    this._programs.advection = new GLProgram(gl, shaders.vert, ext.supportLinearFiltering
      ? shaders.advection
      : shaders.advectionManualFiltering
    )
    this._programs.divergence = new GLProgram(gl, shaders.vert, shaders.divergence)
    this._programs.curl = new GLProgram(gl, shaders.vert, shaders.curl)
    this._programs.vorticity = new GLProgram(gl, shaders.vert, shaders.vorticity)
    this._programs.pressure = new GLProgram(gl, shaders.vert, shaders.pressure)
    this._programs.gradientSubtract = new GLProgram(gl, shaders.vert, shaders.gradientSubtract)
  }

  _initFramebuffers() {
    const gl = this._gl
    const ext = this._ext

    function createFBO(texId, w, h, internalFormat, format, type, param) {
      gl.activeTexture(gl.TEXTURE0 + texId)
      const texture = gl.createTexture()
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null)

      const fbo = gl.createFramebuffer()
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        texture,
        0
      )
      gl.viewport(0, 0, w, h)
      gl.clear(gl.COLOR_BUFFER_BIT)

      return [texture, fbo, texId]
    }

    function createDoubleFBO(texId, w, h, internalFormat, format, type, param) {
      let fbo1 = createFBO(texId, w, h, internalFormat, format, type, param)
      let fbo2 = createFBO(texId + 1, w, h, internalFormat, format, type, param)

      return {
        get read() {
          return fbo1
        },
        get write() {
          return fbo2
        },
        swap() {
          const temp = fbo1
          fbo1 = fbo2
          fbo2 = temp
        }
      }
    }

    this._textureWidth = gl.drawingBufferWidth >> this._config.textureDownsample
    this._textureHeight = gl.drawingBufferHeight >> this._config.textureDownsample

    const texType = ext.halfFloatTexType
    const rgba = ext.formatRGBA
    const rg = ext.formatRG
    const r = ext.formatR

    this._density = createDoubleFBO(
      2,
      this._textureWidth,
      this._textureHeight,
      rgba.internalFormat,
      rgba.format,
      texType,
      ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST
    )

    this._velocity = createDoubleFBO(
      0,
      this._textureWidth,
      this._textureHeight,
      rg.internalFormat,
      rg.format,
      texType,
      ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST
    )

    this._divergence = createFBO(
      4,
      this._textureWidth,
      this._textureHeight,
      r.internalFormat,
      r.format,
      texType,
      gl.NEAREST
    )

    this._curl = createFBO(
      5,
      this._textureWidth,
      this._textureHeight,
      r.internalFormat,
      r.format,
      texType,
      gl.NEAREST
    )

    this._pressure = createDoubleFBO(
      6,
      this._textureWidth,
      this._textureHeight,
      r.internalFormat,
      r.format,
      texType,
      gl.NEAREST
    )
  }

  _initBlit() {
    const gl = this._gl

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer())
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(0)
  }

  _blit = (destination) => {
    const gl = this._gl
    gl.bindFramebuffer(gl.FRAMEBUFFER, destination)
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0)
  }

  _splat(x, y, dx, dy, color) {
    const gl = this._gl

    this._programs.splat.bind()
    gl.uniform1i(this._programs.splat.uniforms.uTarget, this._velocity.read[2])
    gl.uniform1f(this._programs.splat.uniforms.aspectRatio, this._canvas.width / this._canvas.height)
    gl.uniform2f(this._programs.splat.uniforms.point, x / this._canvas.width, 1.0 - y / this._canvas.height)
    gl.uniform3f(this._programs.splat.uniforms.color, dx, -dy, 1.0)
    gl.uniform1f(this._programs.splat.uniforms.radius, this._config.splatRadius)
    gl.uniform1f(this._programs.splat.uniforms.uAdditiveMode, this._config.additiveMode ? 1.0 : 0.0)
    gl.uniform1f(this._programs.splat.uniforms.uAdditiveThreshold, this._config.additiveThreshold || 1.0)
    this._blit(this._velocity.write[1])
    this._velocity.swap()

    this._programs.splat.bind()
    gl.uniform1i(this._programs.splat.uniforms.uTarget, this._density.read[2])
    // Adjust color intensity - more subtle for additive mode to prevent oversaturation
    const colorIntensity = this._config.additiveMode ? 0.12 : 0.15;
    gl.uniform3f(this._programs.splat.uniforms.color, color[0] * colorIntensity, color[1] * colorIntensity, color[2] * colorIntensity)
    gl.uniform1f(this._programs.splat.uniforms.uAdditiveMode, this._config.additiveMode ? 1.0 : 0.0)
    gl.uniform1f(this._programs.splat.uniforms.uAdditiveThreshold, this._config.additiveThreshold || 1.0)
    this._blit(this._density.write[1])
    this._density.swap()
  }

  _addSplat(splat) {
    const { x, y, dx, dy, color } = splat

    if (x === undefined) return
    if (y === undefined) return
    if (dx === undefined) return
    if (dy === undefined) return
    if (color === undefined) return

    this._splat(x, y, dx, dy, color)
  }

  _addSplats(splats) {
    for (const splat of splats) {
      this._addSplat(splat)
    }
  }

  _getRandomSplat() {
    // Create a temporary pointer to generate color
    const tempPointer = new Pointer();
    this._updatePointerColor(tempPointer);
    
    const color = tempPointer.color;
    const x = this._canvas.width * Math.random()
    const y = this._canvas.height * Math.random()
    const dx = 1000 * (Math.random() - 0.5)
    const dy = 1000 * (Math.random() - 0.5)

    return { x, y, dx, dy, color }
  }

  update() {
    const gl = this._gl

    const dt = Math.min((Date.now() - this._time) / 1000, 0.016)
    this._time = Date.now()
    this._timer += 0.0001
    
    // Use colorCycleSpeed to control the rate of color cycling
    const cycleSpeed = this._config.colorCycleSpeed || 0.1
    this._colorCycle = (this._colorCycle + dt * cycleSpeed * 5.0) % 1.0
    
    // Random splats are now only added via explicit addRandomSplats() calls
    // Removed: if (!this._disableRandomSplats && Math.random() < 0.01) {
    //   this.addRandomSplats(1);
    // }

    const w = this._textureWidth
    const h = this._textureHeight
    const iW = 1.0 / w
    const iH = 1.0 / h

    gl.viewport(0, 0, w, h)

    if (this._splatStack.length > 0) {
      this._addSplats(this._splatStack.pop())
    }

    this._programs.advection.bind()
    gl.uniform2f(this._programs.advection.uniforms.texelSize, iW, iH)
    gl.uniform1i(this._programs.advection.uniforms.uVelocity, this._velocity.read[2])
    gl.uniform1i(this._programs.advection.uniforms.uSource, this._velocity.read[2])
    gl.uniform1f(this._programs.advection.uniforms.dt, dt)
    gl.uniform1f(
      this._programs.advection.uniforms.dissipation,
      this._config.velocityDissipation
    )
    this._blit(this._velocity.write[1])
    this._velocity.swap()

    gl.uniform1i(this._programs.advection.uniforms.uVelocity, this._velocity.read[2])
    gl.uniform1i(this._programs.advection.uniforms.uSource, this._density.read[2])
    gl.uniform1f(
      this._programs.advection.uniforms.dissipation,
      this._config.densityDissipation
    )
    this._blit(this._density.write[1])
    this._density.swap()

    for (let i = 0; i < this._pointers.length; i++) {
      const pointer = this._pointers[i]
      if (pointer.moved) {
        // Update color continuously based on time, even without user interaction
        this._updatePointerColor(pointer);
        this._splat(pointer.x, pointer.y, pointer.dx, pointer.dy, pointer.color)
        
        // Reset moved flag for all pointers if they are not down
        // This ensures we don't keep generating splats after touch/mouse released
        if (!pointer.down) {
          pointer.moved = false
        }
      }
    }

    this._programs.curl.bind()
    gl.uniform2f(this._programs.curl.uniforms.texelSize, iW, iH)
    gl.uniform1i(this._programs.curl.uniforms.uVelocity, this._velocity.read[2])
    this._blit(this._curl[1])

    this._programs.vorticity.bind()
    gl.uniform2f(this._programs.vorticity.uniforms.texelSize, iW, iH)
    gl.uniform1i(this._programs.vorticity.uniforms.uVelocity, this._velocity.read[2])
    gl.uniform1i(this._programs.vorticity.uniforms.uCurl, this._curl[2])
    gl.uniform1f(this._programs.vorticity.uniforms.curl, this._config.curl)
    gl.uniform1f(this._programs.vorticity.uniforms.dt, dt)
    this._blit(this._velocity.write[1])
    this._velocity.swap()

    this._programs.divergence.bind()
    gl.uniform2f(this._programs.divergence.uniforms.texelSize, iW, iH)
    gl.uniform1i(this._programs.divergence.uniforms.uVelocity, this._velocity.read[2])
    this._blit(this._divergence[1])

    this._programs.clear.bind()
    let pressureTexId = this._pressure.read[2]
    gl.activeTexture(gl.TEXTURE0 + pressureTexId)
    gl.bindTexture(gl.TEXTURE_2D, this._pressure.read[0])
    gl.uniform1i(this._programs.clear.uniforms.uTexture, pressureTexId)
    gl.uniform1f(this._programs.clear.uniforms.value, this._config.pressureDissipation)
    this._blit(this._pressure.write[1])
    this._pressure.swap()

    this._programs.pressure.bind()
    gl.uniform2f(this._programs.pressure.uniforms.texelSize, iW, iH)
    gl.uniform1i(this._programs.pressure.uniforms.uDivergence, this._divergence[2])
    pressureTexId = this._pressure.read[2]
    gl.uniform1i(this._programs.pressure.uniforms.uPressure, pressureTexId)
    gl.activeTexture(gl.TEXTURE0 + pressureTexId)
    for (let i = 0; i < this._config.pressureIterations; i++) {
      gl.bindTexture(gl.TEXTURE_2D, this._pressure.read[0])
      this._blit(this._pressure.write[1])
      this._pressure.swap()
    }

    this._programs.gradientSubtract.bind()
    gl.uniform2f(this._programs.gradientSubtract.uniforms.texelSize, iW, iH)
    gl.uniform1i(this._programs.gradientSubtract.uniforms.uPressure, this._pressure.read[2])
    gl.uniform1i(this._programs.gradientSubtract.uniforms.uVelocity, this._velocity.read[2])
    this._blit(this._velocity.write[1])
    this._velocity.swap()

    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
    this._programs.display.bind()
    gl.uniform1i(this._programs.display.uniforms.uTexture, this._density.read[2])
    gl.uniform4f(this._programs.display.uniforms.uBackgroundColor, 0.0, 0.0, 0.0, 0.0)
    gl.uniform1f(this._programs.display.uniforms.uAdditiveMode, this._config.additiveMode ? 1.0 : 0.0)
    gl.uniform1f(this._programs.display.uniforms.uAdditiveThreshold, this._config.additiveThreshold || 1.0)
    this._blit(null)
  }
}
