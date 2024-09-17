const isObject = (val) => {
  return val !== null && typeof val === "object";
};

function createComponentInstance(vnode) {
  const component = {
    vnode,
    type: vnode.type,
  };
  return component;
}
function setupComponent(instance) {
  // TODO:
  // initProps
  // initSlots
  setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
  const Component = instance.type;
  const { setup } = Component;
  if (setup) {
    const setupResult = setup();
    handleSetupResult(instance, setupResult);
  }
}
function handleSetupResult(instance, setupResult) {
  // function object
  // TODO: function
  if (typeof setupResult === "object") {
    instance.setupState = setupResult;
  }
  finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
  // Implement
  const Component = instance.type;
  instance.render = Component.render;
}

function render(vnode, container) {
  // patch;
  patch(vnode, container);
}
function patch(vnode, container) {
  // 去处理组件
  // TODO: 判断vnode 是不是一个 element
  // 是 element 那么就应该处理 element
  // 思考题：如何去区分是 element 还是 component 类型呢？
  if (typeof vnode.type === "string") {
    processElement(vnode, container);
  } else if (isObject(vnode.type)) {
    processComponent(vnode, container);
  }
}
function processElement(vnode, container) {
  mountElement(vnode, container);
}
function mountElement(vnode, container) {
  const { type, props, children } = vnode;
  // element
  const el = document.createElement(type);
  // props
  for (const key in props) {
    const value = props[key];
    el.setAttribute(key, value);
  }
  // children
  if (typeof children === "string") {
    el.textContent = children;
  } else if (Array.isArray(children)) {
    mountChildren(vnode, el);
  }
  container.append(el);
}
function mountChildren(vnode, container) {
  vnode.children.forEach((v) => {
    patch(v, container);
  });
}
function processComponent(vnode, container) {
  mountComponent(vnode, container);
}
function mountComponent(vnode, container) {
  const instance = createComponentInstance(vnode);
  setupComponent(instance);
  setupRenderEffect(instance, container);
}
function setupRenderEffect(instance, container) {
  const subTree = instance.render();
  // vnode -> patch
  // vnode -> element -> mountElement
  patch(subTree, container);
}

function createVNode(type, props, children) {
  const vnode = {
    type,
    props,
    children,
  };
  return vnode;
}

function createApp(rootComponent) {
  return {
    mount(rootContainer) {
      // 先 vnode
      // component -> vnode
      // 所有的逻辑操作 都会基于 vnode 做处理
      const vnode = createVNode(rootComponent);
      render(vnode, rootContainer);
    },
  };
}

function h(type, props, children) {
  return createVNode(type, props, children);
}

export { createApp, h };
