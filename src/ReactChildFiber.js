import { createFiber } from "./ReactFiber";
import { isArray, isStringOrNumber, Placement, Update } from "./utils";

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

// 初次渲染，只是记录下标
// 更新，检查子节点是否移动
function placeChild(
  newFiber,
  lastPlacedIndex,
  newIndex,
  shouldTrackSideEffects
) {
  newFiber.index = newIndex;
  if (!shouldTrackSideEffects) {
    // 初次渲染
    return lastPlacedIndex;
  }
  // 父节点更新
  // 子节点是初次渲染还是更新？
  const current = newFiber.alternate;
  if (current) {
    const oldIndex = current.index;
    // 子节点更新
    // old 0 1 2 3 4
    // new 2 1 3 4
    if (oldIndex < lastPlacedIndex) {
      newFiber.flags |= Placement;
      return lastPlacedIndex;
    } else {
      return oldIndex;
    }
  } else {
    newFiber.flags |= Placement;
    return lastPlacedIndex;
  }
}

function mapRemainingChildren(currentFistChild) {
  let existingChildren = new Map();

  let existingChild = currentFistChild;
  while (existingChild) {
    existingChildren.set(
      existingChild.key || existingChild.index,
      existingChild
    );
    existingChild = existingChild.sibling;
  }
  return existingChildren;
}

// diff
// 简单更新，一一对比
export function reconcileChildren(returnFiber, children) {
  if (isStringOrNumber(children)) return;

  const newChildren = isArray(children) ? children : [children];
  let oldFiber = returnFiber.alternate?.child; // oldFiber的头节点

  // 下一个老节点 ｜ 暂时缓存一下老节点
  let nextOldFiber = null;
  // 用于判断returnFiber是 初次渲染还是更新
  let shouldTrackSideEffects = !!returnFiber.alternate;
  let prevNewFiber = null;
  let newIndex = 0;

  // 上一次dom节点插入的最远位置
  // old 0 1 2 3 4
  // new 2 1 3 4
  let lastPlacedIndex = 0;

  // ! 1.从左往右遍历，比较新老节点，如果节点可以复用，继续往右，否则就停止
  for (; oldFiber && newIndex < newChildren.length; newIndex++) {
    const newChild = newChildren[newIndex];
    if (newChild === null) continue;

    // 如果oldFiber乱序
    if (oldFiber.index > newIndex) {
      nextOldFiber = oldFiber;
      oldFiber = null;
    } else {
      nextOldFiber = oldFiber.sibling;
    }

    const same = sameNode(newChild, oldFiber);
    if (!same) {
      if (oldFiber === null) {
        oldFiber = nextOldFiber;
      }
      break;
    }
    const newFiber = createFiber(newChild, returnFiber);

    Object.assign(newFiber, {
      stateNode: oldFiber.stateNode,
      alternate: oldFiber,
      flags: Update,
    });
    lastPlacedIndex = placeChild(
      newFiber,
      lastPlacedIndex,
      newIndex,
      shouldTrackSideEffects
    );

    if (prevNewFiber === null) {
      returnFiber.child = newFiber;
    } else {
      prevNewFiber.sibling = newFiber;
    }
    prevNewFiber = newFiber;
    oldFiber = nextOldFiber;
  }

  // ! 2.新节点没了，老节点还有
  // old 0 1 2
  // new 0
  if (newIndex === newChildren.length) {
    deleteRemainingChildren(returnFiber, oldFiber);
    return;
  }

  // ! 3.初次渲染
  // !! 3.1 初次渲染
  // !! 3.2 老节点没了，更新节点
  if (!oldFiber) {
    for (; newIndex < newChildren.length; newIndex++) {
      const newChild = newChildren[newIndex];
      if (newChild === null) continue;

      const newFiber = createFiber(newChild, returnFiber);

      lastPlacedIndex = placeChild(
        newFiber,
        lastPlacedIndex,
        newIndex,
        shouldTrackSideEffects
      );

      if (prevNewFiber === null) {
        returnFiber.child = newFiber;
      } else {
        prevNewFiber.sibling = newFiber;
      }
      prevNewFiber = newFiber;
    }
  }

  // ! 4.新老节点都还有
  // old 0 1 [2 3 4]
  // new 0 1 [3 4]
  // !! 4.1 把剩下的链表构建哈希表
  const existingChildren = mapRemainingChildren(oldFiber);

  for (; newIndex < newChildren.length; newIndex++) {
    const newChild = newChildren[newIndex];
    if (newChild === null) continue;
    const newFiber = createFiber(newChild, returnFiber);

    const mapKey = newFiber.key || newFiber.index;
    const matchedFiber = existingChildren.get(mapKey);
    if (matchedFiber) {
      // 节点复用
      Object.assign(newFiber, {
        stateNode: matchedFiber.stateNode,
        alternate: matchedFiber,
        flags: Update,
      });

      // 删除map中已经服用的fiber
      existingChildren.delete(mapKey);
    }

    lastPlacedIndex = placeChild(
      newFiber,
      lastPlacedIndex,
      newIndex,
      shouldTrackSideEffects
    );

    if (prevNewFiber === null) {
      returnFiber.child = newFiber;
    } else {
      prevNewFiber.sibling = newFiber;
    }
    prevNewFiber = newFiber;
  }

  // ! 5.删除old中的元素
  if (shouldTrackSideEffects) {
    existingChildren.forEach((child) => deleteChild(returnFiber, child));
  }
}
