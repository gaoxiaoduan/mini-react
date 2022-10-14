import { useReducer, useState } from "../../which-react";

function FunctionComponent(props) {
  const [count1, setCount1] = useReducer((x) => x + 1, 0);
  const [count2, setCount2] = useState(0);
  return (
    <div className="border">
      <h2>{props.name}</h2>
      <button onClick={() => setCount1()}>{count1}</button>
      <button onClick={() => setCount2((count2) => count2 + 1)}>
        {count2}
      </button>
    </div>
  );
}

export default FunctionComponent;
