import { useReducer, useState } from "../../which-react";

function FunctionComponent(props) {
  const [count1, setCount1] = useReducer((x) => x + 1, 0);
  const [count2, setCount2] = useState(4);
  return (
    <div className="border">
      <h2>{props.name}</h2>
      <button onClick={() => setCount1()}>{count1}</button>
      <button
        onClick={() => {
          if (count2 === 0) {
            setCount2(4);
          } else {
            setCount2(count2 - 2);
          }
        }}
      >
        {count2}
      </button>

      <div>{count1 % 2 ? <store>true</store> : <span>false</span>}</div>
      <ul>
        {[0, 1, 2, 3, 4].map((item) => {
          return count2 >= item ? <li key={item}>{item}</li> : null;
        })}
      </ul>
    </div>
  );
}

export default FunctionComponent;
