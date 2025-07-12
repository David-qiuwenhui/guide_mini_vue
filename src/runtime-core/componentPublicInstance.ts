import { hasOwn } from "../shared/index";

// 公共属性映射表 定义了 Vue 组件实例中可以直接访问的公共属性
const publicPropertiesMap = {
  // $el
  $el: (i) => i.vnode.el,
  // $slots
  $slots: (i) => i.slots,
  // $props
  $props: (i) => i.props,
};

export const PublicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    // setupState
    const { setupState, props } = instance;

    if (hasOwn(setupState, key)) {
      // setupState 中的属性
      return setupState[key];
    } else if (hasOwn(props, key)) {
      // props 中的属性
      return props[key];
    }

    // 如果访问的是公共属性映射表中的属性，则直接返回对应的值
    const publicGetter = publicPropertiesMap[key];
    if (publicGetter) {
      return publicGetter(instance);
    }
  },
};
