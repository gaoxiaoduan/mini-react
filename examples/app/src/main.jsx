import { ReactDOM } from "../which-react";
import FunctionComponent from "./Components/FunctionComponent";
import ClassComponent from "./Components/ClassComponent";
import FragmentComponent from "./Components/FragmentComponent";
import "./index.css";

const jsx = (
  <div className="border">
    <h1>Hello</h1>
    <p className="p">react</p>
    <FunctionComponent name="函数组件" />
    <ClassComponent name="类组件" />
    <FragmentComponent />
  </div>
);

ReactDOM.createRoot(document.getElementById("root")).render(jsx);
