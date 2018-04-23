import React from "react"
import "./simple_button.css"

const SimpleButton = ({ onClick, children, ...otherProps }) => {
  return (
    <button className="simple-button" onClick={onClick} {...otherProps}>
      {children}
    </button>
  )
}

export default SimpleButton
