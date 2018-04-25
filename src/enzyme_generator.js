import stringifyObject from "stringify-object"
import { getFindSelector, removeEmptyStrings } from "./utils/selector"

function getFinderString(event) {
  if (Number.isInteger(event.targetIndex)) {
    return `  wrapper.find('${getFindSelector(event)}')
         .at(${event.targetIndex})`
  } else {
    return `  wrapper.find('${getFindSelector(event)}')`
  }
}

/**
 * Generates the event simulation part of the string.
 * E.g. for a click event it generates "simulate('click')"
 * @param {Object} event
 */
function getSimulationString(event) {
  switch (event.type) {
    case "copy":
    case "cut":
    case "paste":
      return `simulate('${event.type}', {clipboardData: ${
        event.clipboardData
      }})`
    case "input":
    case "change":
      return `simulate('${event.type}', {target: {value: "${
        event.target.value
      }", checked: ${event.target.checked}}})`
    case "keydown":
      return `simulate('keyDown', {keyCode: ${event.keyCode}, which: ${
        event.which
      }})`
    case "keyup":
      return `simulate('keyUp', {keyCode: ${event.keyCode}, which: ${
        event.which
      }})`
    case "keypress":
      return `simulate('keyPress', {keyCode: ${event.keyCode}, which: ${
        event.which
      }})`
    case "click":
    case "focus":
    case "blur":
      return `simulate('${event.type}')`
    case "dblclick":
      return `simulate('doubleClick')`
    case "mousedown":
      return `simulate('mouseDown')`
    case "mouseup":
      return `simulate('mouseUp')`
    case "mouseenter":
      return `simulate('mouseEnter')`
    case "mouseleave":
      return `simulate('mouseLeave')`
    default:
      return `simulate('${event.type}')`
  }
}

/**
 * A complete event simulation string in enzyme will consist of two parts
 * 1. Selector
 * 2. Event simulation
 * This function just glues the two together
 * @param {Object} event
 */
function testCommandForDOMEvents(event) {
  const simulationString = getSimulationString(event)

  if (!simulationString) {
    return ""
  } else {
    return `${getFinderString(event)}
         .${simulationString}`
  }
}

function testCommandsForFindAndSimulate(event) {
  if (event.type === "COMPONENT_WILL_RECEIVE_PROPS") {
    return `  wrapper.setProps(${indentAllLines(
      stringifyObject(event.nextProps, {
        indent: "  ",
        inlineCharacterLimit: 12
      }),
      1
    )})`
  }

  return testCommandForDOMEvents(event)
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

function indentAllLines(str, indentTimes = 1) {
  var newStr = str
  for (let i = 0; i < indentTimes; i++) {
    newStr = str
      .split("\n")
      .map(line => "  " + line)
      .join("\n")
  }

  return newStr
}

export function getTestString(
  testName,
  initialProps,
  componentName,
  events,
  startIndex,
  stopIndex,
  errorCase
) {
  const begin = `const { mount } = require('enzyme')
import toJson, {createSerializer} from 'enzyme-to-json';
expect.addSnapshotSerializer(createSerializer({mode: 'deep'}));
    
test('${testName}', () => {
  const props = ${indentAllLines(
    stringifyObject(initialProps, {
      indent: "  ",
      inlineCharacterLimit: 12
    }),
    1
  )}
  const wrapper = mount(<${componentName} {...props} />)
    
  expect(toJson(wrapper)).toMatchSnapshot();
`

  const findAndSimulateCommands = events
    .slice(startIndex, stopIndex + 1)
    .map(testCommandsForFindAndSimulate)
    .reduce(removeEmptyStrings, [])
    // .reduce(squashSimilarConsecutiveEvents, [])
    .join("\n")

  const end = `\n  expect(toJson(wrapper)).toMatchSnapshot()
})`

  return begin + findAndSimulateCommands + end
}
