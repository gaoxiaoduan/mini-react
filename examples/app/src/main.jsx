import { ReactDOM } from "../which-react";

import "./index.css";

const jsx = (
  <div className="border">
    <h1>Hello</h1>
    <p className="p">react</p>
  </div>
);

ReactDOM.createRoot(document.getElementById("root")).render(jsx);
