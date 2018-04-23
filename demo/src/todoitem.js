import React from "react"

const TodoItem = ({ item, onCompletedChange, onRemoveClick }) => {
  return (
    <div
      style={{
        backgroundColor: "rgb(238, 211, 105)",
        marginBottom: 10,
        padding: "0.5em 1em",
        color: "black",
        width: "100%",
        fontSize: "1.2em",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <input
          type="checkbox"
          checked={item.completed}
          onChange={onCompletedChange}
          style={{ marginRight: "1em", width: 30, height: 30 }}
        />
        <span>{item.text}</span>
      </div>
      <div onClick={onRemoveClick}>x</div>
    </div>
  )
}

export default TodoItem
