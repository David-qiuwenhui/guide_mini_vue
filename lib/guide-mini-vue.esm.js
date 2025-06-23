const extend = Object.assign;
// 检查值是否为对象
const isObject = (val) => {
    return val !== null && typeof val === "object";
};
// 检查对象是否具有指定的属性
const hasOwn = (val, key) => {
    return Object.prototype.hasOwnProperty.call(val, key);
};
// 将字符串转换为驼峰命名法
// 示例： add -> Add, add-foo -> addFoo
const camelize = (str) => {
    return str.replace(/-(\w)/g, (_, c) => {
        return c ? c.toUpperCase() : "";
    });
};
// 将字符串转换为大写首字母的驼峰命名法
const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
// 将字符串转换为驼峰命名法，并在前面添加 on 前缀
const toHandlerKey = (str) => {
    return str ? "on" + capitalize(str) : "";
};

const targetMap = new Map();
function trigger(target, key) {
    let depsMap = targetMap.get(target);
    let dep = depsMap.get(key);
    triggerEffects(dep);
}
function triggerEffects(dep) {
    for (const effect of dep) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }
}

// 缓存机制
const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
function createGetter(isReadonly = false, shallow = false) {
    return function get(target, key) {
        const res = Reflect.get(target, key);
        if (key === "__v_isReactive" /* ReactiveFlags.IS_REACTIVE */) {
            return true;
        }
        else if (key === "__v_isReadonly" /* ReactiveFlags.IS_READONLY */) {
            return isReadonly;
        }
        if (shallow) {
            return res;
        }
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        return res;
    };
}
function createSetter() {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value);
        // 触发依赖
        trigger(target, key);
        return res;
    };
}
const mutableHandlers = {
    get,
    set,
};
const readonlyHandlers = {
    get: readonlyGet,
    set(target, key, value) {
        console.warn(`can not set key ${key}, because target ${target} is readonly,`);
        return true;
    },
};
const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
    get: shallowReadonlyGet,
});

function reactive(raw) {
    return createReactiveObject(raw, mutableHandlers);
}
function readonly(raw) {
    return createReactiveObject(raw, readonlyHandlers);
}
function shallowReadonly(raw) {
    return createReactiveObject(raw, shallowReadonlyHandlers);
}
function createReactiveObject(target, baseHandlers) {
    if (!isObject(target)) {
        console.warn(`target ${target} 必须是一个object`);
        return target;
    }
    return new Proxy(target, baseHandlers);
}

function emit(instance, event, ...args) {
    console.log("component emit event", event);
    // instance.props -> event
    const { props } = instance;
    // get handler of emit from props
    const handlerName = toHandlerKey(camelize(event));
    const handler = props[handlerName];
    handler && handler(...args);
}

function initProps(instance, rawProps) {
    instance.props = rawProps || {};
    // attrs
}

// 公共属性映射表 定义了 Vue 组件实例中可以直接访问的公共属性
const publicPropertiesMap = {
    // $el
    $el: (i) => i.vnode.el,
    // $slots
    $slots: (i) => i.slots,
};
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        // setupState
        const { setupState, props } = instance;
        if (hasOwn(setupState, key)) {
            // setupState 中的属性
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
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

function initSlots(instance, children) {
    const { vnode } = instance;
    // 判断 vnode 的 children 是否是 slots
    if (vnode.shapeFlag & 16 /* ShapeFlags.SLOTS_CHILDREN */) {
        normalizeObjectSlots(children, instance);
    }
}
function normalizeObjectSlots(children, instance) {
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

function createComponentInstance(vnode, parent) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        slots: {},
        provides: parent ? parent === null || parent === void 0 ? void 0 : parent.provides : {},
        parent,
        emit: () => { },
    };
    // 绑定 emit 方法到组件实例
    // 这样在组件内部可以通过 this.emit 调用 emit 方法
    component.emit = emit.bind(null, component);
    return component;
}
function setupComponent(instance) {
    // 1. 初始化props
    initProps(instance, instance.vnode.props);
    // 2. 初始化slots
    initSlots(instance, instance.vnode.children);
    // 3. 初始化状态
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
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
let currentInstance = null;
// 获取当前组件实例: 在 setup 中使用，可以获取到当前正在执行的组件实例
function getCurrentInstance() {
    return currentInstance;
}
// 设置当前组件实例: 在 setup 中调用，可以设置当前正在执行的组件实例
function setCurrentInstance(instance) {
    currentInstance = instance;
}

const Fragment = Symbol("Fragment");
const Text = Symbol("Text");
// 创建虚拟节点
function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        shapeFlag: getShapeFlag(type),
        el: null,
    };
    // 判断children类型
    if (typeof children === "string") {
        vnode.shapeFlag |= 4 /* ShapeFlags.TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag |= 8 /* ShapeFlags.ARRAY_CHILDREN */;
    }
    // 判断是否为slot组件
    // 组件 + children slots
    if (vnode.shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
        if (typeof children === "object") {
            vnode.shapeFlag |= 16 /* ShapeFlags.SLOTS_CHILDREN */;
        }
    }
    return vnode;
}
/**
 * 判断元素类型
 * @param type
 * @returns
 */
function getShapeFlag(type) {
    return typeof type === "string"
        ? 1 /* ShapeFlags.ELEMENT */
        : 2 /* ShapeFlags.STATEFUL_COMPONENT */;
}
// 创建 Text 文本虚拟节点
function createTextVNode(text) {
    return createVNode(Text, {}, text);
}

function render(vnode, container) {
    // 调用patch
    patch(vnode, container, null);
}
function patch(vnode, container, parentComponent) {
    // 基于 vnode 的类型进行不同类型的组件处理
    const { type, shapeFlag } = vnode;
    // Fragment -> 只渲染 children
    switch (type) {
        case Fragment:
            // 处理 Fragment 类型
            processFragment(vnode, container, parentComponent);
            break;
        case Text:
            // 处理 Text 类型
            processText(vnode, container);
            break;
        default:
            if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
                // 处理 element 类型
                processElement(vnode, container, parentComponent);
            }
            else if (shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
                // 处理 component 类型
                processComponent(vnode, container, parentComponent);
            }
            break;
    }
}
// 处理 Text 类型
function processText(vnode, container) {
    const { children } = vnode;
    // 创建文本节点
    const textNode = (vnode.el = document.createTextNode(children));
    // 将文本节点添加到容器中
    container.append(textNode);
}
// 处理 Fragment 类型
function processFragment(vnode, container, parentComponent) {
    // Fragment 只渲染 children
    mountChildren(vnode, container, parentComponent);
}
// 处理 Element 类型
function processElement(vnode, container, parentComponent) {
    mountElement(vnode, container, parentComponent);
}
// 挂载 Element 元素
function mountElement(vnode, container, parentComponent) {
    const { type, props, children, shapeFlag } = vnode;
    // 创建真实 DOM 元素
    const el = (vnode.el = document.createElement(type));
    // props 属性绑定处理
    for (const key in props) {
        const value = props[key];
        // 判断属性是否为绑定事件 on + Event name
        const isOn = (key) => /^on[A-Z]/.test(key);
        if (isOn(key)) {
            // 绑定事件 onClick -> click, onMouseOver -> mouseover
            const event = key.slice(2).toLowerCase();
            el.addEventListener(event, value);
        }
        else {
            // 绑定属性
            el.setAttribute(key, value);
        }
    }
    // 处理 children
    if (shapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
        el.textContent = children;
    }
    else if (shapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
        mountChildren(vnode, el, parentComponent);
    }
    // 将 el 添加到 container 中
    container.append(el);
}
// 遍历 vnode 的 children 做 patch 操作
function mountChildren(vnode, container, parentComponent) {
    vnode.children.forEach((v) => {
        patch(v, container, parentComponent);
    });
}
// 处理 component 类型
function processComponent(vnode, container, parentComponent) {
    mountComponent(vnode, container, parentComponent);
}
// 组件初始化
function mountComponent(initialVNode, container, parentComponent) {
    // 1. 创建 component instance 对象
    const instance = createComponentInstance(initialVNode, parentComponent);
    // 2. setup component
    setupComponent(instance);
    // 3. setup render effect
    setupRenderEffect(instance, initialVNode, container);
}
function setupRenderEffect(instance, initialVNode, container) {
    const { proxy } = instance;
    const subTree = instance.render.call(proxy);
    // vnode -> patch
    // vnode -> element -> mountElement
    patch(subTree, container, instance);
    // element -> mount
    initialVNode.el = subTree.el;
}

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            // component -> vnode 所有的逻辑操作 都会基于 vnode 做处理
            // 1. 基于rootComponent创建一个 vnode
            const vnode = createVNode(rootComponent);
            // 2. 进行render
            render(vnode, rootContainer);
        },
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

// 在子组件中渲染插槽内容
function renderSlots(slots, name, props) {
    const slot = slots[name];
    if (slot) {
        // function
        if (typeof slot === "function") {
            return createVNode(Fragment, {}, slot(props));
        }
    }
}

// 存储
function provide(key, value) {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        let { provides } = currentInstance;
        const parentProvides = currentInstance.parent.provides;
        // 初始化provides
        if (provides === parentProvides) {
            // 如果当前实例的 provides 和父实例的 provides 相同，则创建一个新的对象
            provides = currentInstance.provides = Object.create(parentProvides);
        }
        // 存储 key 和 value
        provides[key] = value;
    }
}
// 取值
function inject(key, defaultValue) {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        const parentProvides = currentInstance.parent.provides;
        if (key in parentProvides) {
            return parentProvides[key];
        }
        else if (defaultValue) {
            if (typeof defaultValue === "function") {
                return defaultValue();
            }
            return defaultValue;
        }
    }
}

export { createApp, createTextVNode, getCurrentInstance, h, inject, provide, renderSlots };
