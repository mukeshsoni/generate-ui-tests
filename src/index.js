import React from "react"
import Modal from "react-modal"
import Switch from "react-switch"
import { TestViewer, TestViewerContainer } from "./test_viewer"
import * as enzymeGenerator from "./enzyme_generator"
import * as cypressGenerator from "./cypress_generator"
import { getFindSelector } from "./utils/selector"
import { allEvents, allEventNames } from "./events_map"
import "./base.css"
import SimpleButton from "./simple_button"

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
    name: eventName,
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
    return document.querySelectorAll(getFindSelector(event)).length > 1
  }

  function findIndexOfTargetInPossibleCandidates(event) {
    let i = -1

    document.querySelectorAll(getFindSelector(event)).forEach((el, index) => {
      if (el === event.target) {
        i = index
      }
    })

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
    state = {
      generatedTest: "",
      errorHappened: false,
      testName: "Interaction test 1",
      showExcludeModal: false,
      excludedEvents: [],
      excludeEventSearchString: "",
      excludeEventsSearchFilter: "all",
      generator: "enzyme"
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
      this.events = []
    }

    stopTestGenertion = () => {
      this.setState({
        generatedTest: this.getTestString()
      })
    }

    getEventHandlers() {
      const eventHandlers = allEventNames.reduce((acc, eventName) => {
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

    getTestString = () => {
      const { testName, excludedEvents } = this.state
      if (this.state.generator === "cypress") {
        return cypressGenerator.getTestString(
          testName,
          this.initialProps,
          Component.name,
          this.events.filter(event => !excludedEvents.includes(event.name))
        )
      } else {
        return enzymeGenerator.getTestString(
          testName,
          this.initialProps,
          Component.name,
          this.events.filter(event => !excludedEvents.includes(event.name))
        )
      }
    }

    handleTestNameChange = event => {
      this.setState({ testName: event.target.value })
    }

    handleExcludeClick = () => {
      this.setState({ showExcludeModal: true })
    }

    handleEventExcludeChange = (eventName, checked) => {
      const { excludedEvents } = this.state

      if (!checked) {
        this.setState({
          excludedEvents: excludedEvents.concat(eventName)
        })
      } else {
        const index = excludedEvents.indexOf(eventName)

        if (index >= 0) {
          this.setState({
            excludedEvents: [
              ...excludedEvents.slice(0, index),
              ...excludedEvents.slice(index + 1)
            ]
          })
        }
      }
    }

    handleGeneratorChange = event => {
      this.setState({
        generator: event.target.value
      })
    }

    render() {
      const {
        errorHappened,
        excludeEventsSearchFilter,
        excludedEvents,
        excludeEventSearchString,
        testName,
        showExcludeModal,
        generatedTest,
        generator
      } = this.state

      if (errorHappened) {
        return (
          <div style={{ marginTop: 10 }}>
            <h3 style={{ marginBottom: 20 }}>
              Looks like your app crashed 💣💥. This might help 👀.
            </h3>
            <TestViewer testString={this.getTestString()} />
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
              testString={generatedTest}
              onGetTestClick={this.stopTestGenertion}
              onStartTestGeneration={this.startTestGenertion}
              onStopTestGeneration={this.stopTestGenertion}
              testName={testName}
              onTestNameChange={this.handleTestNameChange}
              onExcludeClick={this.handleExcludeClick}
              excludedEvents={excludedEvents}
              onGeneratorChange={this.handleGeneratorChange}
              generator={generator}
            />
          </div>
          <Modal
            isOpen={showExcludeModal}
            onRequestClose={() =>
              this.setState({
                showExcludeModal: false,
                excludeEventSearchString: ""
              })
            }
            style={{
              overlay: {},
              content: {
                width: "50%",
                margin: "auto",
                padding: 30
              }
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between"
              }}
            >
              <h3 style={{ maxWidth: "80%" }}>
                Toggle switch to exclude an event. Green means it's included.
              </h3>
              <SimpleButton
                onClick={() =>
                  this.setState({
                    showExcludeModal: false,
                    excludeEventSearchString: ""
                  })
                }
              >
                close
              </SimpleButton>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 10
              }}
            >
              <div>
                <input
                  style={{
                    padding: "0.3em 0.6em",
                    marginBottom: 5
                  }}
                  onChange={e =>
                    this.setState({ excludeEventSearchString: e.target.value })
                  }
                  value={excludeEventSearchString}
                  autoFocus
                />
              </div>
              <div
                style={{ display: "flex", alignItems: "center" }}
                data-test-id="src_footer_test_id_2"
              >
                <div style={{ marginRight: 10 }}>
                  {excludedEvents.length} events excluded
                </div>
                <a
                  onClick={() =>
                    this.setState({ excludeEventsSearchFilter: "all" })
                  }
                  style={{
                    margin: 3,
                    padding: "3px 7px",
                    textDecoration: "none",
                    border:
                      excludeEventsSearchFilter === "all"
                        ? "1px solid black"
                        : "none",
                    borderRadius: 3,
                    cursor: "pointer"
                  }}
                >
                  All
                </a>
                <a
                  onClick={() =>
                    this.setState({ excludeEventsSearchFilter: "excluded" })
                  }
                  style={{
                    margin: 3,
                    padding: "3px 7px",
                    textDecoration: "none",
                    border:
                      excludeEventsSearchFilter === "excluded"
                        ? "1px solid black"
                        : "none",
                    borderRadius: 3,
                    cursor: "pointer"
                  }}
                  data-test-id="src_footer_test_id_4"
                >
                  Excluded
                </a>
              </div>
            </div>
            <ul style={{ padding: 0 }}>
              {allEventNames
                .filter(eventName =>
                  eventName
                    .toLowerCase()
                    .includes(excludeEventSearchString.toLocaleLowerCase())
                )
                .filter(
                  eventName =>
                    excludeEventsSearchFilter === "all" ||
                    excludedEvents.includes(eventName)
                )
                .map((eventName, index) => {
                  return (
                    <li
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        padding: "0.5em 0.6em",
                        borderBottom: "1px solid #eee"
                      }}
                      key={"exclude_list_item_" + index}
                    >
                      <Switch
                        onChange={this.handleEventExcludeChange.bind(
                          this,
                          eventName
                        )}
                        checked={!excludedEvents.includes(eventName)}
                        id={"switch_id_" + eventName}
                      />
                      <div style={{ marginLeft: 20, fontWeight: 700 }}>
                        {eventName}
                      </div>
                    </li>
                  )
                })}
            </ul>
          </Modal>
        </div>
      )
    }
  }
}

export default testGenerator
