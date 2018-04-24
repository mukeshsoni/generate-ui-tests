import stringifyObject from "stringify-object"

/**
 * returns the selector which can be used to get hold of the element on which the event occured
 * If the target has an id the selector will be '#id'
 * If the target has a data-test-id attribute, the selector will be '[data-test-attribute="the_attribute_val"]'
 * @param {Object} event
 */
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
    case "componentWillReceiveProps":
      return `  wrapper.setProps(${indentAllLines(
        stringifyObject(event.nextProps, {
          indent: "  ",
          inlineCharacterLimit: 12
        }),
        1
      )})`
    case "change":
      return `  wrapper.find('${getFindSelector(event)}')
                      .simulate('change', {target: {value: "${
                        event.target.value
                      }", checked: ${event.target.checked}}})`
    case "keydown":
      return `  wrapper.find('${getFindSelector(
        event
      )}').simulate('keyDown', {keyCode: ${event.keyCode}})`
    case "click":
    case "focus":
    case "blur":
      return `  wrapper.find('${getFindSelector(event)}')
           .simulate('${event.type}')`
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

function indentAllLines(str, indentTimes) {
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
  initialProps,
  componentName,
  events,
  startIndex,
  stopIndex,
  errorCase
) {
  const begin = `const { mount } = require('enzyme')
    
test('${errorCase ? "breaking test" : "interaction test 1"}', () => {
  const props = ${indentAllLines(
    stringifyObject(initialProps, {
      indent: "  ",
      inlineCharacterLimit: 12
    }),
    1
  )}
  const wrapper = mount(<${componentName} {...props} />)
    
  expect(wrapper).toMatchSnapshot();
`

  const findAndSimulateCommands = events
    .slice(startIndex, stopIndex + 1)
    .map(testCommandsForFindAndSimulate)
    .reduce(squashSimilarConsecutiveEvents, [])
    .join("\n")

  const end = `\n  expect(wrapper).toMatchSnapshot()
})`

  return begin + findAndSimulateCommands + end
}
