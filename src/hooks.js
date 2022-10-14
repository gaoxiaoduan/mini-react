import { scheduleUpdateOnFiber } from "./ReactFiberWorkLoop";
import { isFn } from "./utils";

let currentlyRenderFiber = null; // 当前渲染的fiber
let workInProgressHook = null; // 工作的fiber

export function renderWithHooks(wip) {
  currentlyRenderFiber = wip;
  currentlyRenderFiber.memorizedState = null;
  workInProgressHook = null;
}

function updateWorkInProgressHook() {
  let hook;

  const current = currentlyRenderFiber.alternate;
  if (current) {
    // 更新
    currentlyRenderFiber.memorizedState = current.memorizedState;
    if (workInProgressHook) {
      // 指针后移
      workInProgressHook = hook = workInProgressHook.next;
    } else {
      workInProgressHook = hook = currentlyRenderFiber.memorizedState;
    }
  } else {
    // 初次渲染
    hook = {
      memorizedState: null, // state
      next: null, // 下一个hook
    };
    if (workInProgressHook) {
      workInProgressHook = workInProgressHook.next = hook;
    } else {
      // 设置memorizedState头节点
      workInProgressHook = currentlyRenderFiber.memorizedState = hook;
    }
  }

  return hook;
}

export function useReducer(reducer, initialState) {
  let hook = updateWorkInProgressHook();

  // 初次渲染
  if (!currentlyRenderFiber.alternate) {
    hook.memorizedState = initialState;
  }

  const dispatch = dispatchReducerAction.bind(
    null,
    currentlyRenderFiber,
    hook,
    reducer
  );

  return [hook.memorizedState, dispatch];
}

function dispatchReducerAction(fiber, hook, reducer, action) {
  const actionRes = isFn(action) ? action(hook.memorizedState) : action;
  hook.memorizedState = reducer ? reducer(hook.memorizedState) : actionRes;
  fiber.alternate = { ...fiber };
  fiber.sibling = null; // 不更新兄弟节点
  scheduleUpdateOnFiber(fiber);
}

export function useState(initialState) {
  return useReducer(null, initialState);
}
