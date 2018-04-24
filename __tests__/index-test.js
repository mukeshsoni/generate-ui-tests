import React from "react"
import Enzyme, { shallow, mount } from "enzyme"
import App from "../demo/src/App"
import testGenerator from "../src/index"
import toJson from "enzyme-to-json"

import Adapter from "enzyme-adapter-react-16"

Enzyme.configure({ adapter: new Adapter() })

test("something", () => {
  // const NewApp = testGenerator(App)
  const props = {
    person: {
      firstName: "Mukesh",
      lastName: "Soni",
      onChange: function onChange() {
        return console.log("person changed")
      }
    }
  }
  const wrapper = mount(<App {...props} />)

  expect(toJson(wrapper)).toMatchSnapshot()
  // wrapper.find("div").simulate("mouseEnter")
  wrapper
    .find('[data-test-id="input_to_test"]')
    .simulate("keyDown", { keyCode: 65, which: 65 })
  wrapper
    .find('[data-test-id="input_to_test"]')
    .simulate("change", { target: { value: "a", checked: false } })
  wrapper
    .find('[data-test-id="input_to_test"]')
    .simulate("keyDown", { keyCode: 13, which: 13 })
  wrapper
    .find('[data-test-id="input_to_test"]')
    .simulate("keyDown", { keyCode: 13, which: 13 })
  wrapper
    .find('[data-test-id="input_to_test"]')
    .at(0)
    .simulate("keyDown", { keyCode: 66, which: 66 })
  // wrapper
  //   .find('[data-test-id="src_todoitem_test_id_2"]')
  //   // .at(0)
  //   .simulate("change", { target: { value: "on", checked: true } })
  expect(toJson(wrapper)).toMatchSnapshot()
})
