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
export function getFindSelector(event) {
  const id =
    event.target && event.target.getAttribute && event.target.getAttribute("id")
  const dataTestId =
    event.target &&
    event.target.getAttribute &&
    event.target.getAttribute("data-test-id")

  if (id) {
    return `#${id}`
  } else if (dataTestId) {
    return `${event.target.tagName.toLowerCase()}[data-test-id="${dataTestId}"]`
  } else {
    if (event && event.target && event.target.tagName) {
      return event.target.tagName.toLowerCase()
    } else {
      console.error("can't find selector for events without targets")
      return "COULD_NOT_FIND_SELECTOR"
    }
  }
}

export function removeEmptyStrings(acc, str) {
  if (str.trim() === "") {
    return acc
  } else {
    return acc.concat(str)
  }
}
