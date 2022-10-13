import {
  updateClassComponent,
  updateFragmentComponent,
  updateFunctionComponent,
  updateHostComponent,
  updateHostTextComponent,
} from "./ReactFiberReconciler";
import {
  ClassComponent,
  Fragment,
  FunctionComponent,
  HostComponent,
  HostText,
} from "./ReactWorkTags";
import { Placement } from "./utils";

let wip = null; // work in progress
let wipRoot = null;

export function scheduleUpdateOnFiber(fiber) {
  wip = fiber;
  wipRoot = fiber;
}

function performUnitOfWork() {
  const { tag } = wip;
  switch (tag) {
    case HostComponent:
      updateHostComponent(wip);
      break;
    case FunctionComponent:
      updateFunctionComponent(wip);
      break;
    case ClassComponent:
      updateClassComponent(wip);
      break;
    case Fragment:
      updateFragmentComponent(wip);
      break;
    case HostText:
      updateHostTextComponent(wip);
      break;

    default:
      break;
  }
  // 深度优先
  if (wip.child) {
    wip = wip.child;
    return;
  }

  let next = wip;
  while (next) {
    if (next.sibling) {
      wip = next.sibling;
      return;
    }
    next = next.return;
  }

  wip = null;
}

function workLoop(IdleDeadline) {
  while (wip && IdleDeadline.timeRemaining() > 0) {
    performUnitOfWork();
  }
  if (!wip && wipRoot) {
    commitRoot();
  }
}

requestIdleCallback(workLoop);

function commitRoot() {
  commitWorker(wipRoot);
  wipRoot = null;
}

function commitWorker(wip) {
  if (!wip) return;
  // 1.提交自己
  const { flags, stateNode } = wip;
  const parentNode = getParentNode(wip.return);
  if (flags & Placement && stateNode) {
    parentNode.appendChild(stateNode);
  }
  // 2.提交子节点
  commitWorker(wip.child);
  // 3.提交兄弟节点
  commitWorker(wip.sibling);
}

function getParentNode(wip) {
  let tmp = wip;
  while (tmp) {
    if (tmp.stateNode) {
      return tmp.stateNode;
    }
    tmp = tmp.return;
  }
}
