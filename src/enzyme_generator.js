import stringifyObject from "stringify-object"

/**
 * returns the selector which can be used to get hold of the element on which the event occured
 * If the target has an id the selector will be '#id'
 * If the target has a data-test-id attribute, the selector will be '[data-test-attribute="the_attribute_val"]'
 * @param {Object} event
 */
// TODO - In case of list item components, using our codemod, different list items
// will have some data-test-id. find().simulate() will return an error
// Maybe we should check if there are multiple targets with same data-test-id
// and find the index of the target on which the event was generated
// has to be done during event capture phase, i.e. in recordEvent method of top index.js
function getFindSelector(event) {
  const id = event.target && event.target.id
  const dataTestId = event.target && event.target["data-test-id"]

  if (id) {
    return `#${id}`
  } else if (dataTestId) {
    return `[data-test-id="${dataTestId}"]`
  } else {
    return event.target.tagName.toLowerCase()
  }
}

function testCommandsForFindAndSimulate(event) {
  switch (event.type) {
    case "copy":
    case "cut":
    case "paste":
      return `  wrapper.find('${getFindSelector(event)}')
                       .simulate('${event.type}', {clipboardData: ${
        event.clipboardData
      }})`

    case "componentWillReceiveProps":
      return `  wrapper.setProps(${indentAllLines(
        stringifyObject(event.nextProps, {
          indent: "  ",
          inlineCharacterLimit: 12
        }),
        1
      )})`
    case "input":
    case "change":
      return `  wrapper.find('${getFindSelector(event)}')
                      .simulate('${event.type}', {target: {value: "${
        event.target.value
      }", checked: ${event.target.checked}}})`
    case "keydown":
      return `  wrapper.find('${getFindSelector(
        event
      )}').simulate('keyDown', {keyCode: ${event.keyCode}, which: ${
        event.which
      }})`
    case "keyup":
      return `  wrapper.find('${getFindSelector(
        event
      )}').simulate('keyUp', {keyCode: ${event.keyCode}, which: ${
        event.which
      }})`
    case "keypress":
      return `  wrapper.find('${getFindSelector(
        event
      )}').simulate('keyPress', {keyCode: ${event.keyCode}, which: ${
        event.which
      }})`
    case "click":
    case "focus":
    case "blur":
      return `  wrapper.find('${getFindSelector(event)}')
           .simulate('${event.type}')`
    case "dblclick":
      return `  wrapper.find('${getFindSelector(event)}')
           .simulate('doubleClick')`
    case "mousedown":
      return `  wrapper.find('${getFindSelector(event)}')
           .simulate('mouseDown')`
    case "mouseup":
      return `  wrapper.find('${getFindSelector(event)}')
           .simulate('mouseUp')`
    case "mouseenter":
      return `  wrapper.find('${getFindSelector(event)}')
           .simulate('mouseEnter')`
    case "mouseleave":
      return `  wrapper.find('${getFindSelector(event)}')
           .simulate('mouseLeave')`
    default:
      return `  wrapper.find('${getFindSelector(event)}')
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

function removeEmptyStrings(acc, str) {
  if (str.trim() === "") {
    return acc
  } else {
    return acc.concat(str)
  }
}

export function getTestString(
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
    
test('${errorCase ? "breaking test" : "interaction test 1"}', () => {
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
    .reduce(squashSimilarConsecutiveEvents, [])
    .join("\n")

  const end = `\n  expect(toJson(wrapper)).toMatchSnapshot()
})`

  return begin + findAndSimulateCommands + end
}
