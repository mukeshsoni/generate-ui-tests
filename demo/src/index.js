import React, { Component } from "react"
import { render } from "react-dom"
import App from "./App"

import testGenerator from "../../src"

const NewApp = testGenerator(App)

class Demo extends Component {
  render() {
    return (
      <div data-test-id="src_index_test_id_0">
        <h1 data-test-id="src_index_test_id_1">generate-ui-tests Demo</h1>
        <NewApp
          person={{
            firstName: "Mukesh",
            lastName: "Soni",
            onChange: () => console.log("person changed")
          }}
        />
      </div>
    );
  }
}

render(<Demo />, document.querySelector("#demo"))
