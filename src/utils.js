// ! flags
export const NoFlags = /*                      */ 0b00000000000000000000;
// 新增、插入、移动
export const Placement = /*                    */ 0b0000000000000000000010; // 2
// 节点更新属性
export const Update = /*                       */ 0b0000000000000000000100; // 4
// 删除
export const Deletion = /*                     */ 0b0000000000000000001000; // 8

export function isStr(s) {
  return typeof s === "string";
}

export function isStringOrNumber(s) {
  return typeof s === "string" || typeof s === "number";
}

export function isFn(fn) {
  return typeof fn === "function";
}

export function isArray(arr) {
  return Array.isArray(arr);
}

export function isUndefined(s) {
  return s === undefined;
}

export function updateNode(node, prevVal, nextVal) {
  // 初始化
  Object.keys(prevVal).forEach((k) => {
    if (k === "children") {
      // 有可能是文本
      if (isStringOrNumber(prevVal[k])) {
        node.textContent = "";
      }
    } else if (k.slice(0, 2) === "on") {
      const eventName = k.slice(2).toLowerCase();
      node.removeEventListener(eventName, prevVal[k]);
    } else {
      if (!(k in nextVal)) {
        node[k] = "";
      }
    }
  });

  Object.keys(nextVal).forEach((k) => {
    if (k === "children") {
      if (isStringOrNumber(nextVal[k])) {
        node.textContent = nextVal[k] + "";
      }
    } else if (k.slice(0, 2) === "on") {
      // 简单处理事件 <==> 合成事件
      const eventName = k.slice(2).toLowerCase();
      node.addEventListener(eventName, nextVal[k]);
    } else {
      node[k] = nextVal[k];
    }
  });
}
