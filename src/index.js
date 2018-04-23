import React from "react"
import { TestViewer, TestViewerContainer } from "./test_viewer"
import { getTestString } from "./enzyme_generator"
import "./base.css"

function eventHasTarget(event) {
  return event.target
}

function eventOnFocussableElement(event) {
  const focusableElements = ["input"]
  return focusableElements.includes(event.target.tagName.toLowerCase())
}

// function shallowDiffers(a, b) {
//   for (let i in a) if (!(i in b)) return true
//   for (let i in b) if (a[i] !== b[i]) return true
//   return false
// }

function capitalize(str) {
  return str[0].toUpperCase() + str.slice(1)
}

function testGenerator(Component) {
  return class TestGeneratorComponent extends React.Component {
    events = []
    eventStartIndex = 0
    eventStopIndex = 0
    state = {
      eventStartIndex: 0,
      eventStopIndex: 0,
      generatedTest: "",
      errorHappened: false
    }
    initialProps = null

    constructor(props) {
      super(props)

      this.initialProps = { ...props }
    }

    componentWillReceiveProps(nextProps) {
      // if (shallowDiffers(this.props, nextProsp)) {
      this.events.push({
        type: "componentWillReceiveProps",
        nextProps
      })
      // }
    }

    componentDidCatch = (error, info) => {
      console.log("error somewhere in the component tree")
      this.setState({ errorHappened: true })
    }

    startTestGenertion = () => {
      this.setState({
        eventStartIndex: this.events.length
      })
    }

    stopTestGenertion = () => {
      const eventStopIndex = this.events.length

      const testString = getTestString(
        this.initialProps,
        Component.name,
        this.events,
        this.state.eventStartIndex,
        eventStopIndex
      )

      console.log("generated test string")
      console.log(testString)
      this.setState({
        generatedTest: testString,
        eventStopIndex
      })
    }

    handleClick = event => {
      this.recordEvent(event)
    }

    handleFocus = event => {
      if (eventOnFocussableElement(event)) {
        this.recordEvent(event)
      }
    }

    handleBlur = event => {
      if (eventOnFocussableElement(event)) {
        this.recordEvent(event)
      }
    }

    handleChange = event => {
      if (eventOnFocussableElement(event)) {
        this.recordEvent(event)
      }
    }

    handleMouseDown = event => {
      // event.persist()
      this.recordEvent(event)
    }

    recordEvent = event => {
      this.events.push({
        type: event.type,
        target: {
          dataTestId: event.target.getAttribute("data-test-id"),
          id: event.target.getAttribute("id"),
          tagName: event.target.tagName,
          value: event.target.value
        }
      })
    }

    render() {
      if (this.state.errorHappened) {
        return (
          <div style={{ marginTop: 100 }}>
            <h3 style={{ marginBottom: 20 }}>
              Looks like your app crashed 💣💥. This might help 👀.
            </h3>
            <TestViewer
              testString={getTestString(
                this.initialProps,
                Component.name,
                this.events,
                this.state.startIndex,
                this.events.length - 1,
                true
              )}
            />
          </div>
        )
      }

      const events = ["click", "focus", "blur", "change"]

      const eventHandlers = events.reduce((acc, event) => {
        return {
          ...acc,
          ["on" + capitalize(event) + "Capture"]: this[
            "handle" + capitalize(event)
          ]
        }
      }, {})

      return (
        <div>
          <div {...eventHandlers}>
            <Component {...this.props} />
          </div>
          <div style={{ marginTop: 20 }}>
            <TestViewerContainer
              componentName={Component.name}
              testString={this.state.generatedTest}
              onGetTestClick={this.stopTestGenertion}
              onStartTestGeneration={this.startTestGenertion}
              onStopTestGeneration={this.stopTestGenertion}
            />
          </div>
        </div>
      )
    }
  }
}

export default testGenerator
