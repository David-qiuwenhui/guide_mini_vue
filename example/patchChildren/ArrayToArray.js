import { h, ref } from "../../lib/guide-mini-vue.esm.js";

/**
 * array to array
 */

// 1. 左侧的对比
// (a b) c
// (a b) d e
// i = 2, e1 = 3, e2 = 2
// const prevChildren = [
//   h("p", { key: "A" }, "A"),
//   h("p", { key: "B" }, "B"),
//   h("p", { key: "C" }, "C"),
// ];
// const nextChildren = [
//   h("p", { key: "A" }, "A"),
//   h("p", { key: "B" }, "B"),
//   h("p", { key: "D" }, "D"),
//   h("p", { key: "E" }, "E"),
// ];

// 2. 右侧的对比
// a (b c)
// d e (b c)
// i = 0, e1 = 0, e2 = 1
// const prevChildren = [
//   h("p", { key: "A" }, "A"),
//   h("p", { key: "B" }, "B"),
//   h("p", { key: "C" }, "C"),
// ];
// const nextChildren = [
//   h("p", { key: "D" }, "D"),
//   h("p", { key: "E" }, "E"),
//   h("p", { key: "B" }, "B"),
//   h("p", { key: "C" }, "C"),
// ];

// 3. 新的比老的长
//     创建新的
// 左侧
// (a b)
// (a b) c
// i = 2, e1 = 1, e2 = 2
// const prevChildren = [h("p", { key: "A" }, "A"), h("p", { key: "B" }, "B")];
// const nextChildren = [
//   h("p", { key: "A" }, "A"),
//   h("p", { key: "B" }, "B"),
//   h("p", { key: "C" }, "C"),
//   h("p", { key: "D" }, "D"),
// ];

// 右侧
// (a b)
// d c (a b)
// i = 0, e1 = -1, e2 = 1
// const prevChildren = [h("p", { key: "A" }, "A"), h("p", { key: "B" }, "B")];
// const nextChildren = [
//   h("p", { key: "D" }, "D"),
//   h("p", { key: "C" }, "C"),
//   h("p", { key: "A" }, "A"),
//   h("p", { key: "B" }, "B"),
// ];

// 4. 老的比新的长
//     删除老的
// 左侧
// (a b) c
// (a b)
// i = 2, e1 = 2, e2 = 1
// const prevChildren = [
//   h("p", { key: "A" }, "A"),
//   h("p", { key: "B" }, "B"),
//   h("p", { key: "C" }, "C"),
// ];
// const nextChildren = [h("p", { key: "A" }, "A"), h("p", { key: "B" }, "B")];

// 右侧
// a (b c)
// (b c)
// i = 0, e1 = 0, e2 = -1

// const prevChildren = [
//   h("p", { key: "A" }, "A"),
//   h("p", { key: "B" }, "B"),
//   h("p", { key: "C" }, "C"),
// ];
// const nextChildren = [h("p", { key: "B" }, "B"), h("p", { key: "C" }, "C")];

// 5. 对比中间的部分
//    1. 创建新的 （在老的里面不存在，新的里面存在）
//    2. 删除老的  (在老的里面存在，新的里面不存在)
//    3. 移动 (节点存在于新的和老的里面，但是位置变了)
//         - 使用最长子序列来优化

// 5. 对比中间的部分
// 删除老的  (在老的里面存在，新的里面不存在)
// 5.1
// a,b,(c,d),f,g
// a,b,(e,c),f,g
// D 节点在新的里面是没有的 - 需要删除掉
// C 节点 props 也发生了变化

// const prevChildren = [
//   h("p", { key: "A" }, "A"),
//   h("p", { key: "B" }, "B"),
//   h("p", { key: "C", id: "c-prev" }, "C"),
//   h("p", { key: "D" }, "D"),
//   h("p", { key: "F" }, "F"),
//   h("p", { key: "G" }, "G"),
// ];

// const nextChildren = [
//   h("p", { key: "A" }, "A"),
//   h("p", { key: "B" }, "B"),
//   h("p", { key: "E" }, "E"),
//   h("p", { key: "C", id: "c-next" }, "C"),
//   h("p", { key: "F" }, "F"),
//   h("p", { key: "G" }, "G"),
// ];

// 5.1.1 删除老的 (节点存在于老的里面，但是新的里面不存在)
// a,b,(c,e,d),f,g
// a,b,(e,c),f,g
// 中间部分，老的比新的多， 那么多出来的直接就可以被干掉(优化删除逻辑)
// const prevChildren = [
//   h("p", { key: "A" }, "A"),
//   h("p", { key: "B" }, "B"),
//   h("p", { key: "C", id: "c-prev" }, "C"),
//   h("p", { key: "E" }, "E"),
//   h("p", { key: "D" }, "D"),
//   h("p", { key: "F" }, "F"),
//   h("p", { key: "G" }, "G"),
// ];

// const nextChildren = [
//   h("p", { key: "A" }, "A"),
//   h("p", { key: "B" }, "B"),
//   h("p", { key: "E" }, "E"),
//   h("p", { key: "C", id: "c-next" }, "C"),
//   h("p", { key: "F" }, "F"),
//   h("p", { key: "G" }, "G"),
// ];

// 5.1.2 仅移动 (节点存在于新的和老的里面，但是位置变了)
// a,b,(c,d,e),f,g
// a,b,(e,c,d),f,g
// const prevChildren = [
//   h("p", { key: "A" }, "A"),
//   h("p", { key: "B" }, "B"),
//   h("p", { key: "C" }, "C"),
//   h("p", { key: "D" }, "D"),
//   h("p", { key: "E" }, "E"),
//   h("p", { key: "F" }, "F"),
//   h("p", { key: "G" }, "G"),
// ];
// const nextChildren = [
//   h("p", { key: "A" }, "A"),
//   h("p", { key: "B" }, "B"),
//   h("p", { key: "E" }, "E"),
//   h("p", { key: "C" }, "C"),
//   h("p", { key: "D" }, "D"),
//   h("p", { key: "F" }, "F"),
//   h("p", { key: "G" }, "G"),
// ];

// 5.1.3 创建新的节点
// a,b,(c,e),f,g
// a,b,(e,c,d),f,g
// d 节点在老的节点中不存在，新的里面存在，所以需要创建
// const prevChildren = [
//   h("p", { key: "A" }, "A"),
//   h("p", { key: "B" }, "B"),
//   h("p", { key: "C" }, "C"),
//   h("p", { key: "E" }, "E"),
//   h("p", { key: "F" }, "F"),
//   h("p", { key: "G" }, "G"),
// ];

// const nextChildren = [
//   h("p", { key: "A" }, "A"),
//   h("p", { key: "B" }, "B"),
//   h("p", { key: "E" }, "E"),
//   h("p", { key: "C" }, "C"),
//   h("p", { key: "D" }, "D"),
//   h("p", { key: "F" }, "F"),
//   h("p", { key: "G" }, "G"),
// ];

// 5.1.4 综合例子
// a,b,(c,d,e,z),f,g
// a,b,(d,c,y,e),f,g
// const prevChildren = [
//   h("p", { key: "A" }, "A"),
//   h("p", { key: "B" }, "B"),
//   h("p", { key: "C" }, "C"),
//   h("p", { key: "D" }, "D"),
//   h("p", { key: "E" }, "E"),
//   h("p", { key: "Z" }, "Z"),
//   h("p", { key: "F" }, "F"),
//   h("p", { key: "G" }, "G"),
// ];
// const nextChildren = [
//   h("p", { key: "A" }, "A"),
//   h("p", { key: "B" }, "B"),
//   h("p", { key: "D" }, "D"),
//   h("p", { key: "C" }, "C"),
//   h("p", { key: "Y" }, "Y"),
//   h("p", { key: "E" }, "E"),
//   h("p", { key: "F" }, "F"),
//   h("p", { key: "G" }, "G"),
// ];

// 5.1.5 修复边界场景的测试用例
// a,(b,c),d
// a,(c,b),d
const prevChildren = [
  h("p", { key: "A" }, "A"),
  h("p", {}, "B"),
  h("p", { key: "C" }, "C"),
  h("p", { key: "D" }, "D"),
];
const nextChildren = [
  h("p", { key: "A" }, "A"),
  h("p", { key: "C" }, "C"),
  h("p", {}, "B"),
  h("p", { key: "D" }, "D"),
];

export default {
  name: "ArrayToArray",
  setup() {
    const isChanged = ref(false);
    window.isChanged = isChanged;

    return {
      isChanged,
    };
  },
  render() {
    const self = this;

    return self.isChanged === true
      ? h("div", {}, nextChildren)
      : h("div", {}, prevChildren);
  },
};
