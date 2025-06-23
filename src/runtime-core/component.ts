import { shallowReadonly } from "../reactivity/reactive";
import { emit } from "./componentEmit";
import { initProps } from "./componentProps";
import { PublicInstanceProxyHandlers } from "./componentPublicInstance";
import { initSlots } from "./componentSlots";

export function createComponentInstance(vnode, parent) {
  const component = {
    vnode,
    type: vnode.type,
    setupState: {},
    props: {},
    slots: {},
    provides: parent ? parent?.provides : {},
    parent,
    emit: () => {},
  };

  // 绑定 emit 方法到组件实例
  // 这样在组件内部可以通过 this.emit 调用 emit 方法
  component.emit = emit.bind(null, component) as any;

  return component;
}

export function setupComponent(instance) {
  // 1. 初始化props
  initProps(instance, instance.vnode.props);
  // 2. 初始化slots
  initSlots(instance, instance.vnode.children);
  // 3. 初始化状态
  setupStatefulComponent(instance);
}

function setupStatefulComponent(instance: any) {
  const Component = instance.type;
  // 创建一个代理对象，使用 PublicInstanceProxyHandlers 处理对实例属性的访问
  // 这使得在template中可以直接访问这些属性，而不需要手动解构或访问
  instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);

  // 调用 setup
  const { setup } = Component;
  if (setup) {
    setCurrentInstance(instance);
    const setupResult = setup(shallowReadonly(instance.props), {
      emit: instance.emit,
    });
    setCurrentInstance(null);

    handleSetupResult(instance, setupResult);
  }
}

function handleSetupResult(instance, setupResult: any) {
  // function object
  // TODO: function
  if (typeof setupResult === "object") {
    instance.setupState = setupResult;
  }

  finishComponentSetup(instance);
}

function finishComponentSetup(instance: any) {
  // Implement
  const Component = instance.type;
  instance.render = Component.render;
}

let currentInstance = null;

// 获取当前组件实例: 在 setup 中使用，可以获取到当前正在执行的组件实例
export function getCurrentInstance() {
  return currentInstance;
}

// 设置当前组件实例: 在 setup 中调用，可以设置当前正在执行的组件实例
function setCurrentInstance(instance) {
  currentInstance = instance;
}
