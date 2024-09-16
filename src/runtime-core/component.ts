export function createComponentInstance(vnode) {
  const component = {
    vnode,
    type: vnode.type,
  };

  return component;
}

export function setupComponent(instance) {
  // TODO:
  // initProps
  // initSlots

  setupStatefulComponent(instance);
}
function setupStatefulComponent(instance: any) {
  const Componet = instance.type;
  const { setup } = Componet;

  if (setup) {
    const setupResult = setup();
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

  if (Component.render) {
    instance.render = Component.render;
  }
}
