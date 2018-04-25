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

function testCommandsForFindAndSimulate(event) {
  switch (event.type) {
    case "copy":
    case "cut":
    case "paste":
      return `${getFinderString(event)}
                       .simulate('${event.type}', {clipboardData: ${
        event.clipboardData
      }})`

    case "COMPONENT_WILL_RECEIVE_PROPS":
      return `  wrapper.setProps(${indentAllLines(
        stringifyObject(event.nextProps, {
          indent: "  ",
          inlineCharacterLimit: 12
        }),
        1
      )})`
    case "input":
    case "change":
      return `${getFinderString(event)}
         .simulate('${event.type}', {target: {value: "${
        event.target.value
      }", checked: ${event.target.checked}}})`
    case "keydown":
      return `${getFinderString(event)}
         .simulate('keyDown', {keyCode: ${event.keyCode}, which: ${
        event.which
      }})`
    case "keyup":
      return `${getFinderString(event)}
         .simulate('keyUp', {keyCode: ${event.keyCode}, which: ${event.which}})`
    case "keypress":
      return `${getFinderString(event)}
         .simulate('keyPress', {keyCode: ${event.keyCode}, which: ${
        event.which
      }})`
    case "click":
    case "focus":
    case "blur":
      return `${getFinderString(event)}
         .simulate('${event.type}')`
    case "dblclick":
      return `${getFinderString(event)}
         .simulate('doubleClick')`
    case "mousedown":
      return `${getFinderString(event)}
         .simulate('mouseDown')`
    case "mouseup":
      return `${getFinderString(event)}
         .simulate('mouseUp')`
    case "mouseenter":
      return `${getFinderString(event)}
         .simulate('mouseEnter')`
    case "mouseleave":
      return `${getFinderString(event)}
         .simulate('mouseLeave')`
    default:
      return `${getFinderString(event)}
         .simulate('${event.type}')`
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
