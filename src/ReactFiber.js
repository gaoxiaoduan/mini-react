import { isFn, isStr, isUndefined, Placement } from "./utils";
import {
  ClassComponent,
  FunctionComponent,
  HostText,
  Fragment,
  HostComponent,
} from "./ReactWorkTags";

export function createFiber(vnode, returnFiber) {
  const fiber = {
    type: vnode.type,
    key: vnode.key,
    props: vnode.props,
    // 原生标签 dom节点
    // class&function
    stateNode: null,
    // 第一个子fiber
    child: null,
    // 下一个fiber
    sibling: null,
    // 父节点
    return: returnFiber,
    // 操作标记
    flags: Placement,
    // 节点在当前层级下的位置
    index: null,
    // old fiber
    alternate: null,
  };
  const { type } = fiber;
  if (isStr(type)) {
    fiber.tag = HostComponent;
  } else if (isFn(type)) {
    // todo 函数以及类组件
    fiber.tag = type.prototype.isReactComponent
      ? ClassComponent
      : FunctionComponent;
  } else if (isUndefined(type)) {
    fiber.tag = HostText;
    fiber.props = { children: vnode };
  } else {
    fiber.tag = Fragment;
  }

  return fiber;
}
