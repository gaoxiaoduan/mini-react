import { createFiber } from "./ReactFiber";
import { isArray, isStringOrNumber, updateNode } from "./utils";

export function updateHostComponent(wip) {
  if (!wip.stateNode) {
    wip.stateNode = document.createElement(wip.type);
    // 属性
    updateNode(wip.stateNode, wip.props);
  }
  // 子节点
  reconcileChildren(wip, wip.props.children);
}

export function updateFunctionComponent(wip) {
  const { type, props } = wip;
  const children = type(props); // 函数组件执行
  reconcileChildren(wip, children);
}

export function updateClassComponent(wip) {
  const { type, props } = wip;
  let instance = new type(props);
  const children = instance.render();
  reconcileChildren(wip, children);
}

export function updateFragmentComponent(wip) {
  reconcileChildren(wip, wip.props.children);
}
export function updateHostTextComponent(wip) {
  wip.stateNode = document.createTextNode(wip.props.children);
}

// diff
function reconcileChildren(wip, children) {
  if (isStringOrNumber(children)) return;
  const newChildren = isArray(children) ? children : [children];
  let prevNewFiber = null;
  for (let i = 0; i < newChildren.length; i++) {
    const newChild = newChildren[i];
    const newFiber = createFiber(newChild, wip);
    if (prevNewFiber === null) {
      wip.child = newFiber;
    } else {
      prevNewFiber.sibling = newFiber;
    }
    prevNewFiber = newFiber;
  }
}
