import React, { Component } from "react"
import "./App.css"
import SimpleButton from "../../src/simple_button"
import TodoItem from "./todoitem"
import Footer from "./footer"

class Bonker extends Component {
  componentWillReceiveProps(nextProps) {
    if (nextProps.bonk) {
      throw new Error("bonked")
    }
  }

  render() {
    return null
  }
}

function filterBy(filter, item) {
  if (filter === "all") {
    return true
  } else if (filter === "active") {
    return !item.completed
  } else {
    return item.completed
  }
}

class App extends Component {
  state = {
    value: "",
    bonk: false,
    todos: [],
    filter: "all"
  }

  handleKeyDown = e => {
    if (e.keyCode === 13) {
      this.setState({
        todos: this.state.todos.concat({
          text: this.state.value,
          completed: false
        }),
        value: ""
      })
    }
  }

  handleCompletedChange = index => {
    this.setState({
      todos: [
        ...this.state.todos.slice(0, index),
        {
          ...this.state.todos[index],
          completed: !this.state.todos[index].completed
        },
        ...this.state.todos.slice(index + 1)
      ]
    })
  }

  handleRemoveClick = index => {
    this.setState({
      todos: [
        ...this.state.todos.slice(0, index),
        ...this.state.todos.slice(index + 1)
      ]
    })
  }

  handleAllFilterClick = () => {
    this.setState({ filter: "all" })
  }

  handleActiveFilterClick = () => {
    this.setState({ filter: "active" })
  }

  handleCompletedFilterClick = () => {
    this.setState({ filter: "completed" })
  }

  render() {
    return (
      <div
        className="App"
        style={{ backgroundColor: "black", color: "#f1f1f1" }}
      >
        <h3
          style={{
            marginBottom: 10,
            textAlign: "center",
            fontSize: "3em",
            fontWeight: 100
          }}
        >
          todos
        </h3>
        <input
          style={{
            padding: "0.5em 1em",
            fontSize: "1.2em",
            width: "100%",
            marginBottom: 10,
            border: "none"
          }}
          value={this.state.value}
          onChange={e => this.setState({ value: e.target.value })}
          onKeyDown={this.handleKeyDown}
          data-test-id="input to test"
        />
        {this.state.todos
          .filter(filterBy.bind(null, this.state.filter))
          .map((todoItem, index) => (
            <TodoItem
              item={todoItem}
              key={index}
              onCompletedChange={this.handleCompletedChange.bind(this, index)}
              onRemoveClick={this.handleRemoveClick.bind(this, index)}
            />
          ))}
        <Footer
          items={this.state.todos}
          onAllFilterClick={this.handleAllFilterClick}
          onActiveFilterClick={this.handleActiveFilterClick}
          onCompletedFilterClick={this.handleCompletedFilterClick}
          filter={this.state.filter}
        />
        <br />
        <br />
        <br />
        <div style={{ marginTop: 100 }}>
          <SimpleButton>Button without id attribute</SimpleButton>
          <SimpleButton data-test-id="btn 1" id="ok-btn">
            Ok
          </SimpleButton>
          <SimpleButton data-test-id="btn 2">Cancel</SimpleButton>
          <div
            style={{
              marginTop: 60,
              display: "flex"
            }}
          >
            <SimpleButton
              data-test-id="btn-bonker"
              onClick={() => this.setState({ bonk: true })}
            >
              Crash it 💔
            </SimpleButton>
          </div>
          <Bonker bonk={this.state.bonk} />
        </div>
      </div>
    )
  }
}

export default App
