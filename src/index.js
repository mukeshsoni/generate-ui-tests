import React from "react"
import { TestViewer, TestViewerContainer } from "./test_viewer"
import "./base.css"
// setup syntax highlighter

function eventHasTarget(event) {
  return event.target
}

function eventOnFocussableElement(event) {
  const focusableElements = ["input"]
  return focusableElements.includes(event.target.tagName.toLowerCase())
}

function serialize(propVal) {
  if (typeof propVal === "function") {
    return propVal.toString()
  } else {
    return JSON.stringify(propVal)
  }
}

function testCommandsForFindAndSimulate(event) {
  const id = event.target && event.target.id
  const dataTestId = event.target && event.target.dataTestId

  switch (event.type) {
    case "componentWillReceiveProps":
      return `  wrapper.setProps(${serialize(event.nextProps)})`
    case "change":
      if (id) {
        return `  wrapper.find('#${id}')
                    .simulate('change', {target: {value: "${
                      event.target.value
                    }"}})`
      } else if (dataTestId) {
        return `  wrapper.find('[data-test-id="${dataTestId}"]')
                    .simulate('change', {target: {value: "${
                      event.target.value
                    }"}})`
      } else {
        return `  //TODO - couldn't find a unique identifier for element. The find selector needs refinement
  wrapper.find('${event.target.tagName.toLowerCase()}').get(0).simulate('change', {target: {value: ${
          event.target.value
        }}})`
      }
    case "click":
    case "focus":
    case "blur":
      if (id) {
        return `  wrapper.find('#${id}')
         .simulate('${event.type}')
         `
      } else if (dataTestId) {
        return `  wrapper.find('[data-test-id="${dataTestId}"]')
         .simulate('${event.type}')
         `
      } else {
        return `  //TODO - couldn't find a unique identifier for element. The find selector needs refinement
  wrapper.find('${event.target.tagName.toLowerCase()}')
         .get(0)
         .simulate('${event.type}')
         `
      }
    default:
      return ""
  }
}

/**
 * multiple input change events can be flattened to single 'change' simulate call
 */
function squashSimilarConsecutiveEvents(result, str, currentIndex, arr) {
  if (currentIndex === 0) {
    return [str]
  }

  const lastResult = result[result.length - 1]
  if (
    currentIndex > 0 &&
    str.includes(".simulate('change") &&
    lastResult.includes(".simulate('change'")
  ) {
    // keep the last change event on input
    result[result.length - 1] = str
    return result
  } else {
    return result.concat(str)
  }
}

function getTestString(
  initialProps,
  componentName,
  events,
  startIndex,
  stopIndex,
  errorCase
) {
  const begin = `const { mount } = require('enzyme')
  
test('${errorCase ? "breaking test" : "interaction test 1"}', () => {
  const props = ${serialize(initialProps)}
  const wrapper = mount(<${componentName} {...props} />)
    
  expect(wrapper).toMatchSnapshot();
`

  const findAndSimulateCommands = events
    .slice(startIndex, stopIndex + 1)
    // .filter(eventHasTarget)
    .map(testCommandsForFindAndSimulate)
    .reduce(squashSimilarConsecutiveEvents, [])
    .join("\n")
  // .map((event, index) => {
  //   return (
  //     <div key={"test_generator_log_" + index}>
  //       Event: {event.type}, target: {getTargetIdentifierString(event.target)}
  //     </div>
  //   )
  // }).join()

  const end = `\n\n  expect(wrapper).toMatchSnapshot()
})`

  return begin + findAndSimulateCommands + end
}

function capitalize(str) {
  return str[0].toUpperCase() + str.slice(1)
}

// function shallowDiffers(a, b) {
//   for (let i in a) if (!(i in b)) return true
//   for (let i in b) if (a[i] !== b[i]) return true
//   return false
// }

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
