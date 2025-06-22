export const enum ShapeFlags {
  // 原生元素
  ELEMENT = 1, // 0001
  // 组件
  STATEFUL_COMPONENT = 1 << 1, // 0010
  // 文字元素
  TEXT_CHILDREN = 1 << 2, // 0100
  // 数组元素
  ARRAY_CHILDREN = 1 << 3, // 1000
  // 插槽元素
  SLOTS_CHILDREN = 1 << 4, // 10000
}
