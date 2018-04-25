import React from "react"
import "./simple_button.css"

const SimpleButton = ({
  type = "secondary",
  onClick,
  children,
  ...otherProps
}) => {
  const classNames =
    type === "secondary" ? "simple-button" : "simple-button primary"

  return (
    <button className={classNames} onClick={onClick} {...otherProps}>
      {children}
    </button>
  )
}

export default SimpleButton
