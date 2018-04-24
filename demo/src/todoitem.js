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
      data-test-id="src_todoitem_test_id_0"
    >
      <div
        style={{ display: "flex", alignItems: "center" }}
        data-test-id="src_todoitem_test_id_1"
      >
        <input
          type="checkbox"
          checked={item.completed}
          onChange={onCompletedChange}
          style={{ marginRight: "1em", width: 30, height: 30 }}
          data-test-id="src_todoitem_test_id_2"
        />
        <span data-test-id="src_todoitem_test_id_3">{item.text}</span>
      </div>
      <div onClick={onRemoveClick} data-test-id="src_todoitem_test_id_4">
        x
      </div>
    </div>
  )
}

export default TodoItem
