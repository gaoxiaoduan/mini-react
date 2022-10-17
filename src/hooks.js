import { scheduleUpdateOnFiber } from "./ReactFiberWorkLoop";
import { areHookInputsEqual, HookLayout, HookPassive, isFn } from "./utils";

let currentlyRenderFiber = null; // 当前渲染的fiber
let workInProgressHook = null; // 工作的fiber
let currentHook = null; // 老的hook

export function renderWithHooks(wip) {
  currentlyRenderFiber = wip;
  currentlyRenderFiber.memorizedState = null; // state | effect
  workInProgressHook = null;

  // 为了方便，useEffect与useLayoutEffect区分开，并且以数组管理
  // 源码中是放一起的，并且是个链表
  currentlyRenderFiber.updateQueueOfEffect = [];
  currentlyRenderFiber.updateQueueOfLayout = [];
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
      currentHook = currentHook.next;
    } else {
      workInProgressHook = hook = currentlyRenderFiber.memorizedState;
      currentHook = current.memorizedState;
    }
  } else {
    currentHook = null;
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

function updateEffectImp(hooksFlags, create, deps) {
  const hook = updateWorkInProgressHook();
  if (currentHook) {
    const prevEffect = currentHook.memorizedState;
    if (deps) {
      const prevDeps = prevEffect.deps;
      if (areHookInputsEqual(deps, prevDeps)) {
        return;
      }
    }
  }

  const effect = { hooksFlags, create, deps };
  hook.memorizedState = effect;

  if (hooksFlags & HookPassive) {
    currentlyRenderFiber.updateQueueOfEffect.push(effect);
  } else if (hooksFlags & HookLayout) {
    currentlyRenderFiber.updateQueueOfLayout.push(effect);
  }
}

export function useEffect(create, deps) {
  return updateEffectImp(HookPassive, create, deps);
}
export function useLayoutEffect(create, deps) {
  return updateEffectImp(HookLayout, create, deps);
}
