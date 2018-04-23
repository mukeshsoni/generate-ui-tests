import React, { Component } from "react"
import "./App.css"
import SimpleButton from "../../src/simple_button"

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

class App extends Component {
  state = {
    value: "",
    bonk: false
  }

  render() {
    return (
      <div
        className="App"
        style={{ backgroundColor: "black", color: "#f1f1f1" }}
      >
        <h3 style={{ marginBottom: 10 }}>
          Welcome, {this.props.person.firstName} {this.props.person.lastName}!
        </h3>
        <input
          style={{ marginRight: 10, width: "100%", marginBottom: 10 }}
          value={this.state.value}
          onChange={e => this.setState({ value: e.target.value })}
          data-test-id="input to test"
        />
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
    )
  }
}

export default App
