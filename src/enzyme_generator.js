import stringifyObject from "stringify-object"

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
      return `  wrapper.setProps(${stringifyObject(event.nextProps)})`
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
  const props = ${stringifyObject(initialProps)}
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
