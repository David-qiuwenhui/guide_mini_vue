import { ShapeFlags } from "../shared/ShapeFlags";

export function initSlots(instance, children) {
  const { vnode } = instance;
  // 判断 vnode 的 children 是否是 slots
  if (vnode.shapeFlag & ShapeFlags.SLOTS_CHILDREN) {
    normalizeObjectSlots(children, instance);
  }
}

function normalizeObjectSlots(children: any, instance: any) {
  const slots = {};
  for (const propKey in children) {
    const propValue = children[propKey];
    // 如果 propValue 是函数，则将其转换为一个函数，接收 props 参数
    slots[propKey] = (props) => normalizeSlotValue(propValue(props));
  }

  instance.slots = slots;
}

function normalizeSlotValue(value) {
  return Array.isArray(value) ? value : [value];
}
