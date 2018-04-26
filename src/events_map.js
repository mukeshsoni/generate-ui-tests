export const eventsMap = {
  clipboard: {
    eventNames: ["copy", "cut", "paste"],
    props: ["clipboardData"]
  },
  composition: {
    eventNames: ["compositionEnd", "compositionStart", "compositionUpdate"],
    props: ["data"]
  },
  keyboard: {
    eventNames: ["keyDown", "keyUp", "keyPress"],
    props: ["altKey", "charCode", "ctrlKey", "getModifierState"]
  },
  focus: { eventNames: ["focus", "blur"], props: ["relatedTarget"] },
  form: {
    eventNames: ["change", "input", "invalid", "submit"],
    props: []
  },
  mouse: {
    eventNames: [
      "click",
      "contextMenu",
      "doubleClick",
      "drag",
      "dragEnd",
      "dragEnter",
      "dragExit",
      "dragLeave",
      "dragOver",
      "dragStart",
      "drop",
      "mouseDown",
      "mouseEnter",
      "mouseLeave",
      // "mouseMove",
      // "mouseOut",
      // "mouseOver",
      "mouseUp"
    ],
    props: [
      "altKey",
      "button",
      "buttons",
      "clientX",
      "clientY",
      "ctrlKey",
      "getModifierState",
      "metaKey",
      "pageX",
      "pageY",
      "relatedTarget",
      "screenX",
      "screenY",
      "shiftKey"
    ]
  },
  selection: { eventNames: ["select"], props: [] },
  touch: {
    eventNames: ["touchCancel", "touchEnd", "touchMove", "touchStart"],
    props: [
      "altKey",
      "changedTouches",
      "ctrlKey",
      "getModifierState",
      "metaKey",
      "shiftKey",
      "targetTouches",
      "touches"
    ]
  },
  ui: { eventNames: ["scroll"], props: ["detail", "view"] },
  wheel: {
    eventNames: ["wheel"],
    props: ["deltaMode", "deltaX", "deltaY", "deltaX"]
  },
  media: {
    eventNames: [
      "abort",
      "canPlay",
      "canPlayThrough",
      "durationChange",
      "emptied",
      "encrypted",
      "ended",
      "error",
      "loadedData",
      "loadedMetadata",
      "loadStart",
      "pause",
      "play",
      "playing",
      "progress",
      "rateChange",
      "seeked",
      "seeking",
      "stalled",
      "suspend",
      "timeUpdate",
      "volumeChange",
      "waiting"
    ],
    props: []
  },
  image: { eventNames: ["load", "error"], props: [] },
  animation: {
    eventNames: ["animationStart", "animationEnd", "animationIteration"],
    props: ["animationName", "pseudoElement", "elapsedTime"]
  },
  transition: {
    eventNames: ["transitionEnd"],
    props: ["propertyName", "pseudoElement", "elapsedTime"]
  },
  others: { eventNames: ["toggle"], props: [] }
}

export const allEvents = Object.entries(eventsMap)
  .map(([eventType, eventDetails]) => eventDetails)
  .reduce((acc, e) => {
    return {
      ...acc,
      ...e.eventNames.reduce(
        (acc2, eventName) => ({
          ...acc2,
          [eventName]: e.props
        }),
        {}
      )
    }
  }, {})

export const allEventNames = Object.keys(allEvents)
