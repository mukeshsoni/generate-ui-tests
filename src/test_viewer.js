import { CopyToClipboard } from "react-copy-to-clipboard"
import React from "react"
import Draggable from "react-draggable"
import Portal from "./portal"
import Collapsible from "react-collapsible"
import SimpleButton from "./simple_button"

import SyntaxHighlighter, {
  registerLanguage
} from "react-syntax-highlighter/prism-light"
import jsx from "react-syntax-highlighter/languages/prism/jsx"
import prism from "react-syntax-highlighter/styles/prism/prism"

registerLanguage("jsx", jsx)

const CollapsibleHeader = props => {
  return (
    <div
      className="drag-handle"
      style={{
        display: "flex",
        justifyContent: "space-between",
        backgroundColor: "#EED369",
        color: "#31363C",
        padding: 10
      }}
    >
      <h4>Automated test for {props.componentName}</h4>
      <div>></div>
    </div>
  )
}

export class TestViewer extends React.Component {
  state = {
    copiedToClipboard: false
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.testString !== this.props.testString) {
      this.setState({ copiedToClipboard: false })
    }
  }

  render() {
    const { testString, onGetTestClick } = this.props

    return (
      <div style={{ padding: 15, backgroundColor: "#083045", color: "white" }}>
        {testString ? (
          <div>
            <div>
              <CopyToClipboard
                text={testString}
                onCopy={() => this.setState({ copiedToClipboard: true })}
              >
                <SimpleButton>Copy to clipboard</SimpleButton>
              </CopyToClipboard>
              {this.state.copiedToClipboard ? (
                <span style={{ color: "red", marginLeft: 10 }}>Copied</span>
              ) : null}
            </div>
            <SyntaxHighlighter language="javascript" style={prism}>
              {testString}
            </SyntaxHighlighter>
          </div>
        ) : (
          <div>
            <p>No tests yet. Click on the button to generate a test.</p>
            <SimpleButton onClick={onGetTestClick}>Get test</SimpleButton>
          </div>
        )}
      </div>
    )
  }
}

export const TestViewerContainer = props => {
  const {
    componentName,
    onTestNameChange,
    testName,
    onStartTestGeneration,
    onStopTestGeneration
  } = props

  return (
    <Portal>
      <Draggable defaultPosition={{ x: 0, y: 0 }} handle=".drag-handle">
        <div
          style={{ position: "absolute", right: 30, top: 30, minWidth: 500 }}
        >
          <Collapsible
            trigger={<CollapsibleHeader componentName={componentName} />}
            transitionTime={100}
            lazyRender
            open
          >
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  padding: 10,
                  backgroundColor: "#083045",
                  color: "white",
                  alignItems: "center"
                }}
              >
                <label style={{ marginRight: 10, fontSize: "1.2em" }}>
                  Test Name
                </label>
                <input
                  onChange={onTestNameChange}
                  value={testName}
                  placeholder="Name of your test"
                  style={{
                    marginRight: 10,
                    padding: "0.3em 0.6em",
                    fontSize: "1.2em",
                    maxWidth: 200
                  }}
                />
                <SimpleButton
                  type="primary"
                  style={{ marginRight: 10 }}
                  onClick={onStartTestGeneration}
                >
                  Start from now
                </SimpleButton>
                <SimpleButton type="primary" onClick={onStopTestGeneration}>
                  Get test
                </SimpleButton>
              </div>
              <TestViewer {...props} />
            </div>
          </Collapsible>
        </div>
      </Draggable>
    </Portal>
  )
}
