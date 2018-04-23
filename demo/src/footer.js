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
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span>{itemsLeftCount(items)} items left</span>
      <div>
        <a
          onClick={onAllFilterClick}
          className={
            filter === "all" ? "selected filter-button" : "filter-button"
          }
        >
          All
        </a>
        <a
          onClick={onActiveFilterClick}
          className={
            filter === "active" ? "selected filter-button" : "filter-button"
          }
        >
          Active
        </a>
        <a
          onClick={onCompletedFilterClick}
          className={
            filter === "completed" ? "selected filter-button" : "filter-button"
          }
        >
          Completed
        </a>
      </div>
    </div>
  )
}

export default Footer
