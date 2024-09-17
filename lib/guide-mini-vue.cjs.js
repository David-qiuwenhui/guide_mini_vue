'use strict';

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
    const Componet = instance.type;
    const { setup } = Componet;
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
    patch(vnode);
}
function patch(vnode, container) {
    // 去处理组件
    // 判断是不是element
    // TODO: 判断vnode 是不是一个 element
    // 是 element 那么就应该处理 element
    // 思考题：如何去区分是 element 还是 component 类型呢？
    // processElement();
    processComponent(vnode);
}
function processComponent(vnode, container) {
    mountComponent(vnode);
}
function mountComponent(vnode, container) {
    const instance = createComponentInstance(vnode);
    setupComponent(instance);
    setupRenderEffect(instance);
}
function setupRenderEffect(instance, container) {
    const subTree = instance.render();
    // vnode -> patch
    // vnode -> element -> mountElement
    patch(subTree);
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
            render(vnode);
        },
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

exports.createApp = createApp;
exports.h = h;
