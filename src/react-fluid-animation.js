import React, { Component, useEffect, useRef, useState, forwardRef } from 'react'
import PropTypes from 'prop-types'

import raf from 'raf'
import { ResizeObserver } from '@juggle/resize-observer'

import FluidAnimation, { defaultConfig } from './fluid-animation'

const useResizeObserver = (ref) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

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

class ReactFluidAnimation extends Component {
  static propTypes = {
    content: PropTypes.string,
    config: PropTypes.object,
    style: PropTypes.object,
    animationRef: PropTypes.func,
    disableRandomSplats: PropTypes.bool,
    movementThreshold: PropTypes.number,
    size: PropTypes.shape({
      width: PropTypes.number,
      height: PropTypes.number
    })
  }

  static defaultProps = {
    config: defaultConfig,
    style: { },
    disableRandomSplats: false,
    movementThreshold: 0
  }

  componentWillReceiveProps(props) {
    this._onResize()

    if (props.config) {
      this._animation.config = {
        ...props.config,
        defaultConfig
      }
    }
    if (this._animation) {
      this._animation.disableRandomSplats = props.disableRandomSplats
      if (typeof props.movementThreshold === 'number') {
        this._animation.movementThreshold = props.movementThreshold
      }
    }
  }

  componentDidMount() {
    this._reset(this.props)
    this._tick()
  }

  componentWillUnmount() {
    if (this._tickRaf) {
      raf.cancel(this._tickRaf)
      this._tickRaf = null
    }
  }

  render() {
    const {
      content,
      config,
      animationRef,
      style,
      size,
      disableRandomSplats,
      movementThreshold,
      ...rest
    } = this.props

    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          ...style
        }}
        {...rest}
        ref={this._containerRef}
      >
        <canvas
          ref={this._canvasRef}
          onMouseDown={this._onMouseDown}
          onMouseMove={this._onMouseMove}
          onMouseUp={this._onMouseUp}
          onTouchStart={this._onTouchStart}
          onTouchMove={this._onTouchMove}
          onTouchEnd={this._onTouchEnd}
          style={{
            width: '100%',
            height: '100%',
            background: 'transparent'
          }}
        />
      </div>
    )
  }

  _containerRef = (ref) => {
    this._container = ref
  }

  _canvasRef = (ref) => {
    this._canvas = ref
  }

  _onMouseDown = (event) => {
    event.preventDefault()
    this._animation.onMouseDown(event.nativeEvent)
  }

  _onMouseMove = (event) => {
    event.preventDefault()
    this._animation.onMouseMove(event.nativeEvent)
  }

  _onMouseUp = (event) => {
    event.preventDefault()
    this._animation.onMouseUp(event.nativeEvent)
  }

  _onTouchStart = (event) => {
    this._animation.onTouchStart(event.nativeEvent)
  }

  _onTouchMove = (event) => {
    this._animation.onTouchMove(event.nativeEvent)
  }

  _onTouchEnd = (event) => {
    this._animation.onTouchEnd(event.nativeEvent)
  }

  _onResize = () => {
    if (!this._container || !this._canvas) return
    this._canvas.width = this._container.clientWidth
    this._canvas.height = this._container.clientHeight

    if (this._animation) {
      this._animation.resize()
    }
  }

  _tick = () => {
    if (this._animation) {
      this._animation.update()
    }

    this._tickRaf = raf(this._tick)
  }

  _reset(props) {
    const {
      animationRef,
      content,
      config,
      disableRandomSplats,
      movementThreshold
    } = props

    this._onResize()

    this._animation = new FluidAnimation({
      canvas: this._canvas,
      content,
      config,
      disableRandomSplats,
      movementThreshold
    })

    if (typeof animationRef === 'function') {
      animationRef(this._animation)
    }
  }
}

const withResizeObserver = (WrappedComponent) => {
  return forwardRef(function WithResizeObserver(props, ref) {
    const containerRef = useRef(null)
    const dimensions = useResizeObserver(containerRef)

    return (
      <WrappedComponent
        {...props}
        size={dimensions}
        ref={(instance) => {
          containerRef.current = instance && instance._container
          if (typeof ref === 'function') {
            ref(instance)
          } else if (ref) {
            ref.current = instance
          }
        }}
      />
    )
  })
}

export default withResizeObserver(ReactFluidAnimation)
