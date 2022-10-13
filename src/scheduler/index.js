import { peek, pop, push } from "./minHeap";

let taskQueue = [];
let taskIdCounter = 1;

const channel = new MessageChannel();
const port = channel.port2;
channel.port1.onmessage = function () {
  workLoop();
};

export function scheduleCallback(callback) {
  const currentTime = getCurrentTime();
  const timeout = -1;

  const expirationTime = currentTime - timeout;

  const newTask = {
    id: taskIdCounter++,
    callback: callback,
    expirationTime,
    sortIndex: expirationTime,
  };
  push(taskQueue, newTask);

  // 请求调度
  requestHostCallback();
}

function requestHostCallback() {
  port.postMessage(null);
}

function workLoop() {
  // 将队列中的任务拿出来执行
  let currentTask = peek(taskQueue);
  while (currentTask) {
    let callback = currentTask.callback;
    currentTask.callback = null;
    callback();
    pop(taskQueue);
    currentTask = peek(taskQueue);
  }
}

function getCurrentTime() {
  return performance.now();
}
