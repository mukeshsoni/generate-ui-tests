import React from "react"
import { TestViewer, TestViewerContainer } from "./test_viewer"
import { getTestString } from "./enzyme_generator"
import { getFindSelector } from "./utils/selector"
import { allEvents } from "./events_map"
import "./base.css"

function eventHasTarget(event) {
  return event.target
}

function eventOnFocussableElement(event) {
  const focusableElements = ["input"]
  return focusableElements.includes(event.target.tagName.toLowerCase())
}

function shallowDiffers(a, b) {
  for (let i in a) if (!(i in b)) return true
  for (let i in b) if (a[i] !== b[i]) return true
  return false
}

function capitalize(str) {
  return str[0].toUpperCase() + str.slice(1)
}

// event names are 'click', 'keyDown', 'blur' etc.
// event handlers in react are onClick, onKeyDown, onBlur
// easy to get event handler names from event names
function eventToClickHandlerMapping(eventName) {
  return "on" + capitalize(eventName)
}

/**
 * we want to listen on the Capture version of events
 * so instead of onClick, onClickCapture, since that handler is invoked in the
 * first phase of event capture - flowing from top to bottom
 * @param {string} eventName
 */
function eventToCaptureClickHandlerMapping(eventName) {
  // mouseenter and mouseleave do not have capture phase but have special bubbling
  // https://github.com/facebook/react/issues/2826
  if (eventName === "mouseEnter" || eventName === "mouseLeave") {
    return eventToClickHandlerMapping(eventName)
  } else {
    return eventToClickHandlerMapping(eventName) + "Capture"
  }
}

const customEvents = {
  COMPONENT_WILL_RECEIVE_PROPS: "COMPONENT_WILL_RECEIVE_PROPS"
}

function isCustomEvent(event) {
  return Object.values(customEvents).includes(event.type)
}

/**
 * we take properties from the event which might be needed to be passed on while simulating the event
 * Or helpful in any other way while creating the test string
 * @param {Object} event
 */
function createEventObject(eventName, event) {
  let id = event.target && event.target.getAttribute("id")
  let dataTestId = event.target && event.target.getAttribute("data-test-id")

  const ourEvent = {
    type: event.type,
    key: event.key,
    keyCode: event.keyCode,
    which: event.which,
    ...allEvents[eventName].reduce(
      (acc, propName) => ({
        ...acc,
        [propName]: event[propName]
      }),
      {}
    ),
    target: {
      "data-test-id": dataTestId,
      id: id,
      tagName: event.target.tagName,
      value: event.target.value,
      checked: event.target.checked,
      type: event.target && event.target.type,
      getAttribute: attr => {
        if (attr === "id") {
          return id
        } else if (attr === "data-test-id") {
          return dataTestId
        } else {
          return null
        }
      }
    }
  }

  function moreThanOnePossibleTargets(event) {
    console.log(
      "found elements",
      document.querySelectorAll(getFindSelector(event))
    )
    return document.querySelectorAll(getFindSelector(event)).length > 1
  }

  function findIndexOfTargetInPossibleCandidates(event) {
    let i = -1

    document.querySelectorAll(getFindSelector(event)).forEach((el, index) => {
      if (el === event.target) {
        i = index
      }
    })

    console.log("index of evented element", i)
    return i
  }

  if (!isCustomEvent(event) && moreThanOnePossibleTargets(event)) {
    // if we find more than one element matching the selection criteria we defined,
    // let's find the index of that element
    return {
      ...ourEvent,
      targetIndex: findIndexOfTargetInPossibleCandidates(event)
    }
  } else {
    return ourEvent
  }
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
      errorHappened: false,
      testName: "Interaction test 1"
    }
    initialProps = null
    eventWrapperRef = null

    constructor(props) {
      super(props)

      this.initialProps = { ...props }
    }

    componentWillReceiveProps(nextProps) {
      if (shallowDiffers(this.props, nextProps)) {
        this.events.push({
          eventFromTestGenerator: true,
          type: customEvents.COMPONENT_WILL_RECEIVE_PROPS,
          nextProps
        })
      }
    }

    componentDidCatch = (error, info) => {
      console.log("error somewhere in the component tree")
      this.setState({ errorHappened: true, testName: "Breaking test" })
    }

    startTestGenertion = () => {
      this.setState({
        eventStartIndex: this.events.length
      })
    }

    stopTestGenertion = () => {
      const eventStopIndex = this.events.length

      const testString = getTestString(
        this.state.testName,
        this.initialProps,
        Component.name,
        this.events,
        this.state.eventStartIndex,
        eventStopIndex
      )

      this.setState({
        generatedTest: testString,
        eventStopIndex
      })
    }

    getEventHandlers() {
      const eventHandlers = Object.keys(allEvents).reduce((acc, eventName) => {
        return {
          ...acc,
          [eventToCaptureClickHandlerMapping(eventName)]: this.recordEvent.bind(
            this,
            eventName
          )
        }
      }, {})

      return eventHandlers
    }

    recordEvent = (eventName, event) => {
      function targetListeningOnEvent(eventName, event) {
        // the event object has a weird property named something like '__reactEventHandlers$<random_chars>
        // which contains info about the input as setup in jsx
        // so it includes the event handlers setup in jsx by the user - like onKeyDown, onClick etc.
        const reactEventObjectProp = Object.keys(event.target).filter(key =>
          key.includes("__reactEventHandlers")
        )[0]

        if (reactEventObjectProp) {
          // return Object.keys(event.target[reactEventObjectProp]).some(
          //   propName =>
          //     propName.toLowerCase().includes(eventName.toLowerCase()) &&
          //     typeof event.target[reactEventObjectProp][propName] === "function"
          // )
          return (
            typeof event.target[reactEventObjectProp][
              eventToClickHandlerMapping(eventName)
            ] === "function"
          )
        } else {
          return false
        }
      }

      function targetNotEventWrapper(event, eventWrapperRef) {
        return event.target !== eventWrapperRef
      }
      // only record event if the target element is also listening on the same event
      if (
        (targetListeningOnEvent(eventName, event) || isCustomEvent(event)) &&
        targetNotEventWrapper(event, this.eventWrapperRef)
      ) {
        this.events.push(createEventObject(eventName, event))
      }
    }

    handleTestNameChange = event => {
      this.setState({ testName: event.target.value })
    }

    render() {
      if (this.state.errorHappened) {
        return (
          <div style={{ marginTop: 10 }}>
            <h3 style={{ marginBottom: 20 }}>
              Looks like your app crashed 💣💥. This might help 👀.
            </h3>
            <TestViewer
              testString={getTestString(
                this.state.testName,
                this.initialProps,
                Component.name,
                this.events,
                this.state.startIndex,
                this.events.length - 1
              )}
            />
          </div>
        )
      }

      return (
        <div>
          <div
            {...this.getEventHandlers()}
            ref={node => (this.eventWrapperRef = node)}
          >
            <Component {...this.props} />
          </div>
          <div style={{ marginTop: 20 }}>
            <TestViewerContainer
              componentName={Component.name}
              testString={this.state.generatedTest}
              onGetTestClick={this.stopTestGenertion}
              onStartTestGeneration={this.startTestGenertion}
              onStopTestGeneration={this.stopTestGenertion}
              testName={this.state.testName}
              onTestNameChange={this.handleTestNameChange}
            />
          </div>
        </div>
      )
    }
  }
}

export default testGenerator
