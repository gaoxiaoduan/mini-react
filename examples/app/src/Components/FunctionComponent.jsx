import {
  useReducer,
  useState,
  useEffect,
  useLayoutEffect,
} from "../../which-react";

function FunctionComponent(props) {
  const [count1, setCount1] = useReducer((x) => x + 1, 0);
  const [count2, setCount2] = useState(0);

  useEffect(() => {
    console.log("useEffect->count1", count1);
  }, [count1]);

  useLayoutEffect(() => {
    console.log("useLayoutEffect->count2", count2);
  }, [count2]);

  return (
    <div className="border">
      <h2>{props.name}</h2>
      <button onClick={() => setCount1()}>{count1}</button>
      <button onClick={() => setCount2(count2 + 1)}>{count2}</button>

      <div>{count1 % 2 ? <store>true</store> : <span>false</span>}</div>
      <ul>
        {/* {[0, 1, 2, 3, 4].map((item) => {
          return count2 >= item ? <li key={item}>{item}</li> : null;
        })} */}

        {/* {count2 % 2
          ? [0, 1, 3, 4].map((item) => <li key={item}>{item}</li>)
          : [0, 1, 2, 3, 4].map((item) => <li key={item}>{item}</li>)} */}

        {count2 % 2
          ? [2, 1, 3, 4].map((item) => <li key={item}>{item}</li>)
          : [0, 1, 2, 3, 4].map((item) => <li key={item}>{item}</li>)}
      </ul>
    </div>
  );
}

export default FunctionComponent;
