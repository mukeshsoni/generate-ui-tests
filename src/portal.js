import ReactDOM from "react-dom"

const Portal = props => ReactDOM.createPortal(props.children, document.body)

export default Portal
