import stringifyObject from "stringify-object"
import { getFindSelector, removeEmptyStrings } from "./utils/selector"

function getFinderString(event) {
  if (Number.isInteger(event.targetIndex)) {
    return `    cy.get('${getFindSelector(event)}')
      .eq(${event.targetIndex})`
  } else {
    return `    cy.get('${getFindSelector(event)}')`
  }
}

function getKeydownString(event) {
  switch (event.keyCode) {
    case 13:
      return `${getFinderString(event)}
    .type('{enter}')`
    default:
      return ""
  }
}

function testCommandsForFindAndSimulate(event) {
  console.log("event", event)
  switch (event.type) {
    case "keydown":
      return getKeydownString(event)
    case "input":
    case "change":
      if (event.target.type === "checkbox") {
        if (event.target.checked) {
          return `${getFinderString(event)}
      .check()`
        } else {
          return `${getFinderString(event)}
      .uncheck()`
        }
      } else {
        return `${getFinderString(event)}
      .type('${event.target.value}')`
      }
    case "click":
      return `${getFinderString(event)}.click()`
    default:
      return ""
  }
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
  const begin = `describe('${testName}', () => {
  it('should pass', () => {
    cy.visit('/')
`

  const findAndSimulateCommands = events
    .slice(startIndex, stopIndex + 1)
    .map(testCommandsForFindAndSimulate)
    .reduce(removeEmptyStrings, [])
    //     // .reduce(squashSimilarConsecutiveEvents, [])
    .join("\n")

  const end = `\n  })
})`

  return begin + findAndSimulateCommands + end
}
