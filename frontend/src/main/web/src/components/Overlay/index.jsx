import React, { cloneElement, PropTypes } from 'react'
import BaseOverlay from 'react-overlays/lib/Overlay'
import { elementType } from 'react-prop-types'

const Overlay = ({
  children,
  transition,
  ...props
}) => {
  const child = transition
    ? children
    : cloneElement(children, {
      className: 'Op(1) ' + children.props.className
    })
  return (
    <BaseOverlay
      {...props}
      transition={transition}
    >
      {child}
    </BaseOverlay>
  )
}

Overlay.propTypes = {
  ...BaseOverlay.propTypes,
  children: PropTypes.node,
  transition: PropTypes.element,
  /**
   * Set the visibility of the Overlay
   */
  show: PropTypes.bool,
  /**
   * Specify whether the overlay should trigger
   * onHide when the user clicks outside the overlay
   */
  rootClose: PropTypes.bool,
  /**
   * A Callback fired by the Overlay when it wishes to be hidden.
   */
  onHide: PropTypes.func,
  /**
   * Use animation
   */
  animation: PropTypes.oneOfType([
    PropTypes.bool,
    elementType
  ]),
  /**
   * Callback fired before the Overlay transitions in
   */
  onEnter: PropTypes.func,
  /**
   * Callback fired as the Overlay begins to transition in
   */
  onEntering: PropTypes.func,
  /**
   * Callback fired after the Overlay finishes transitioning in
   */
  onEntered: PropTypes.func,
  /**
   * Callback fired right before the Overlay transitions out
   */
  onExit: PropTypes.func,
  /**
   * Callback fired as the Overlay begins to transition out
   */
  onExiting: PropTypes.func,
  /**
   * Callback fired after the Overlay finishes transitioning out
   */
  onExited: PropTypes.func
}

Overlay.defaultProps = {
  transition: null,
  rootClose: false,
  show: false
}

export default Overlay
