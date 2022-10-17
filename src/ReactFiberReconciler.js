import { createFiber } from "./ReactFiber";
import { renderWithHooks } from "./hooks";
import { isArray, isStringOrNumber, Update, updateNode } from "./utils";

export function updateHostComponent(wip) {
  if (!wip.stateNode) {
    wip.stateNode = document.createElement(wip.type);
    // 属性
    updateNode(wip.stateNode, {}, wip.props);
  }
  // 子节点
  reconcileChildren(wip, wip.props.children);
}

export function updateFunctionComponent(wip) {
  renderWithHooks(wip);
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

export function deleteChild(returnFiber, childToDelete) {
  const deletions = returnFiber.deletions;
  if (deletions) {
    returnFiber.deletions.push(childToDelete);
  } else {
    returnFiber.deletions = [childToDelete];
  }
}

// diff
// 简单更新，一一对比
function reconcileChildren(wip, children) {
  if (isStringOrNumber(children)) return;

  const newChildren = isArray(children) ? children : [children];
  let oldFiber = wip.alternate?.child; // oldFiber的头节点

  let prevNewFiber = null;
  for (let i = 0; i < newChildren.length; i++) {
    const newChild = newChildren[i];
    if (newChild === null) continue;

    const newFiber = createFiber(newChild, wip);
    const same = sameNode(newFiber, oldFiber);
    if (same) {
      Object.assign(newFiber, {
        stateNode: oldFiber.stateNode,
        alternate: oldFiber,
        flags: Update,
      });
    }

    if (!same && oldFiber) {
      deleteChild(wip, oldFiber);
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (prevNewFiber === null) {
      wip.child = newFiber;
    } else {
      prevNewFiber.sibling = newFiber;
    }
    prevNewFiber = newFiber;
  }
}

function sameNode(a, b) {
  return a && b && a.type === b.type && a.key === b.key;
}
