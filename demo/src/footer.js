import React from "react"
import "./footer.css"

function itemsLeftCount(items) {
  return items.filter(item => !item.completed).length
}

const Footer = ({
  items,
  onAllFilterClick,
  onActiveFilterClick,
  onCompletedFilterClick,
  filter = "all"
}) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        backgroundColor: "#083045",
        padding: 20,
        fontSize: "1.2em",
        width: "100%"
      }}
      data-test-id="src_footer_test_id_0"
    >
      <span data-test-id="src_footer_test_id_1">
        {itemsLeftCount(items)} items left
      </span>
      <div data-test-id="src_footer_test_id_2">
        <a
          onClick={onAllFilterClick}
          className={
            filter === "all" ? "selected filter-button" : "filter-button"
          }
          data-test-id="src_footer_test_id_3"
        >
          All
        </a>
        <a
          onClick={onActiveFilterClick}
          className={
            filter === "active" ? "selected filter-button" : "filter-button"
          }
          data-test-id="src_footer_test_id_4"
        >
          Active
        </a>
        <a
          onClick={onCompletedFilterClick}
          className={
            filter === "completed" ? "selected filter-button" : "filter-button"
          }
          data-test-id="src_footer_test_id_5"
        >
          Completed
        </a>
      </div>
    </div>
  )
}

export default Footer
