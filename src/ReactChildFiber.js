import { createFiber } from "./ReactFiber";
import { isArray, isStringOrNumber, Update } from "./utils";

// diff
// 简单更新，一一对比
export function reconcileChildren(returnFiber, children) {
  if (isStringOrNumber(children)) return;

  const newChildren = isArray(children) ? children : [children];
  let oldFiber = returnFiber.alternate?.child; // oldFiber的头节点

  let prevNewFiber = null;
  let newIndex = 0;
  for (newIndex = 0; newIndex < newChildren.length; newIndex++) {
    const newChild = newChildren[newIndex];
    if (newChild === null) continue;

    const newFiber = createFiber(newChild, returnFiber);
    const same = sameNode(newFiber, oldFiber);
    if (same) {
      Object.assign(newFiber, {
        stateNode: oldFiber.stateNode,
        alternate: oldFiber,
        flags: Update,
      });
    }

    if (!same && oldFiber) {
      deleteChild(returnFiber, oldFiber);
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (prevNewFiber === null) {
      returnFiber.child = newFiber;
    } else {
      prevNewFiber.sibling = newFiber;
    }
    prevNewFiber = newFiber;
  }

  // 新节点遍历完，但是还有 老节点，老节点要被删除
  if (newIndex === newChildren.length) {
    deleteRemainingChildren(returnFiber, oldFiber);
    return;
  }
}

function sameNode(a, b) {
  return a && b && a.type === b.type && a.key === b.key;
}

function deleteChild(returnFiber, childToDelete) {
  const deletions = returnFiber.deletions;
  if (deletions) {
    returnFiber.deletions.push(childToDelete);
  } else {
    returnFiber.deletions = [childToDelete];
  }
}

function deleteRemainingChildren(returnFiber, currentFistChild) {
  let childToDelete = currentFistChild;
  while (childToDelete) {
    deleteChild(returnFiber, childToDelete);
    childToDelete = childToDelete.sibling;
  }
}
