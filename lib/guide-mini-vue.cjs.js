'use strict';

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

const extend = Object.assign;
// 默认的空对象
const EMPTY_OBJ = {};
// 检查值是否为对象
const isObject = (val) => {
    return val !== null && typeof val === "object";
};
const hasChange = (newValue, value) => {
    return !Object.is(newValue, value);
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

// 全局的变量
let activeEffect;
let shouldTrack;
class ReactiveEffect {
    constructor(fn, scheduler) {
        this.scheduler = scheduler;
        this.deps = [];
        this.active = true;
        this._fn = fn;
    }
    run() {
        if (!this.active) {
            return this._fn();
        }
        // 设置收集状态
        shouldTrack = true;
        activeEffect = this;
        const result = this._fn();
        // 重置收集状态
        shouldTrack = false;
        return result;
    }
    stop() {
        if (this.active) {
            cleanupEffect(this);
            if (this.onStop) {
                this.onStop();
            }
            this.active = false;
        }
    }
}
function cleanupEffect(effect) {
    effect.deps.forEach((dep) => {
        dep.delete(effect);
    });
    // 清空effect.deps
    effect.deps.length = 0;
}
const targetMap = new Map();
function track(target, key) {
    if (!isTacking())
        return;
    // ! target -> key -> dep
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }
    let dep = depsMap.get(key);
    if (!dep) {
        dep = new Set();
        depsMap.set(key, dep);
    }
    // 判断dep之前有没有添加过activeEffect 如果添加过就无需再做添加操作
    trackEffects(dep);
}
function trackEffects(dep) {
    if (dep.has(activeEffect))
        return;
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
}
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
function effect(fn, options = {}) {
    // fn
    const _effect = new ReactiveEffect(fn, options.scheduler);
    // options
    extend(_effect, options);
    _effect.run();
    const runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
}
function isTacking() {
    return shouldTrack && activeEffect !== undefined;
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
        if (!isReadonly) {
            // 依赖收集
            track(target, key);
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
        isMounted: false,
        subTree: {},
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
        instance.setupState = proxyRefs(setupResult);
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

function createAppAPI(render) {
    return function createApp(rootComponent) {
        return {
            mount(rootContainer) {
                // component -> vnode 所有的逻辑操作 都会基于 vnode 做处理
                // 1. 基于rootComponent创建一个 vnode
                const vnode = createVNode(rootComponent);
                // 2. 进行render
                render(vnode, rootContainer);
            },
        };
    };
}

function createRenderer(options) {
    const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert, remove: hostRemove, setElementText: hostSetElementText, } = options;
    function render(vnode, container) {
        // 调用patch
        patch(null, vnode, container, null);
    }
    /**
     *
     * @param n1 更新前的 vnode
     * @param n2 更新后的 vnode
     * @param container 容器
     * @param parentComponent 父组件实例
     */
    function patch(n1, n2, container, parentComponent) {
        // 基于 vnode 的类型进行不同类型的组件处理
        const { type, shapeFlag } = n2;
        // Fragment -> 只渲染 children
        switch (type) {
            case Fragment:
                // 处理 Fragment 类型
                processFragment(n1, n2, container, parentComponent);
                break;
            case Text:
                // 处理 Text 类型
                processText(n1, n2, container);
                break;
            default:
                if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
                    // 处理 element 类型
                    processElement(n1, n2, container, parentComponent);
                }
                else if (shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
                    // 处理 component 类型
                    processComponent(n1, n2, container, parentComponent);
                }
                break;
        }
    }
    // 处理 Text 类型
    function processText(n1, n2, container) {
        const { children } = n2;
        // 创建文本节点
        const textNode = (n2.el = document.createTextNode(children));
        // 将文本节点添加到容器中
        container.append(textNode);
    }
    // 处理 Fragment 类型
    function processFragment(n1, n2, container, parentComponent) {
        // Fragment 只渲染 children
        mountChildren(n2.children, container, parentComponent);
    }
    // 处理 Element 类型
    function processElement(n1, n2, container, parentComponent) {
        if (!n1) {
            // 初始化元素节点
            mountElement(n2, container, parentComponent);
        }
        else {
            // 更新元素节点
            patchElement(n1, n2, parentComponent);
        }
    }
    function patchElement(n1, n2, parentComponent) {
        console.log("n1", n1);
        console.log("n2", n2);
        const oldProp = n1.props || EMPTY_OBJ;
        const newProp = n2.props || EMPTY_OBJ;
        const el = (n2.el = n1.el);
        patchChildren(n1, n2, el, parentComponent);
        patchProp(el, oldProp, newProp);
    }
    function patchChildren(n1, n2, container, parentComponent) {
        // children 类型
        const prevShapeFlag = n1.shapeFlag;
        const nextShapeFlag = n2.shapeFlag;
        // 更新的 children 实际内容
        const c1 = n1.children;
        const c2 = n2.children;
        if (nextShapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
            // 如果新节点是文本子节点
            if (prevShapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
                // 1. 如果旧节点是数组子节点，则需要清空旧的子节点
                unmountChildren(n1.children);
            }
            // 2. 设置新的文本内容
            if (c1 !== c2) {
                hostSetElementText(container, c2);
            }
        }
        else {
            if (prevShapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
                // 如果旧节点是文本子节点
                // 1. 清空旧的文本内容
                hostSetElementText(container, "");
                // 2. 挂载新的 children
                // TODO: container 和 parentComponent 的区别
                mountChildren(c2, container, parentComponent);
            }
        }
    }
    // 卸载 children
    function unmountChildren(children) {
        for (let i = 0; i < children.length; i++) {
            const el = children[i].el;
            // remove children
            hostRemove(el);
        }
    }
    function patchProp(el, oldProps, newProps) {
        // base case: 如果 oldProps 和 newProps 相同，则不需要处理
        if (oldProps === newProps) {
            return;
        }
        // 1. 处理属性的更新变化
        for (const key in newProps) {
            const prevProp = oldProps[key];
            const nextProp = newProps[key];
            if (prevProp !== nextProp) {
                hostPatchProp(el, key, prevProp, nextProp);
            }
        }
        // 2. 如果 oldProps 中的属性在 newProps 中不存在，则需要移除该属性
        if (oldProps !== EMPTY_OBJ) {
            for (const key in oldProps) {
                if (!(key in newProps)) {
                    const prevProp = oldProps[key];
                    hostPatchProp(el, key, prevProp, null);
                }
            }
        }
    }
    // 挂载 Element 元素
    function mountElement(vnode, container, parentComponent) {
        const { props, children, shapeFlag } = vnode;
        // 创建真实 DOM 元素
        const el = (vnode.el = hostCreateElement(vnode.type));
        // props 属性绑定处理
        for (const key in props) {
            const value = props[key];
            hostPatchProp(el, key, null, value);
        }
        // 处理 children
        if (shapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
            el.textContent = children;
        }
        else if (shapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
            mountChildren(vnode.children, el, parentComponent);
        }
        // 将 el 添加到 container 中
        hostInsert(el, container);
    }
    // 遍历 vnode 的 children 做 patch 操作
    function mountChildren(children, container, parentComponent) {
        children.forEach((v) => {
            patch(null, v, container, parentComponent);
        });
    }
    // 处理 component 类型
    function processComponent(n1, n2, container, parentComponent) {
        mountComponent(n2, container, parentComponent);
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
        effect(() => {
            if (!instance.isMounted) {
                const { proxy } = instance;
                const subTree = (instance.subTree = instance.render.call(proxy));
                // vnode -> patch
                // vnode -> element -> mountElement
                patch(null, subTree, container, instance);
                // element -> mount
                initialVNode.el = subTree.el;
                // 标记组件已挂载
                instance.isMounted = true;
            }
            else {
                const { proxy } = instance;
                const subTree = instance.render.call(proxy);
                const preSubTree = instance.subTree;
                instance.subTree = subTree;
                patch(preSubTree, subTree, container, instance);
            }
        });
    }
    return {
        createApp: createAppAPI(render),
    };
}

function createElement(type) {
    return document.createElement(type);
}
function patchProp(el, key, prevValue, nextValue) {
    // 判断属性是否为绑定事件 on + Event name
    const isOn = (key) => /^on[A-Z]/.test(key);
    if (isOn(key)) {
        // 绑定事件 onClick -> click, onMouseOver -> mouseover
        const event = key.slice(2).toLowerCase();
        el.addEventListener(event, nextValue);
    }
    else {
        if (nextValue === null || nextValue === undefined) {
            // 如果 nextValue 为 null 或 undefined，移除属性
            el.removeAttribute(key);
        }
        else {
            // 绑定属性
            el.setAttribute(key, nextValue);
        }
    }
}
// 将元素插入到父元素中
function insert(el, parent) {
    // 将 el 添加到 container 中
    parent.append(el);
}
// 移除元素
function remove(child) {
    const parent = child.parentNode;
    if (parent) {
        parent.removeChild(child);
    }
}
// 设置元素文本内容
function setElementText(el, text) {
    el.textContent = text;
}
const renderer = createRenderer({
    createElement,
    patchProp,
    insert,
    remove,
    setElementText,
});
function createApp(...args) {
    return renderer.createApp(...args);
}

class RefImpl {
    constructor(value) {
        this.__v_isRef = true;
        this.rawValue = value;
        this._value = convert(value);
        this.dep = new Set();
    }
    get value() {
        trackRefValue(this);
        return this._value;
    }
    set value(newValue) {
        if (hasChange(newValue, this.rawValue)) {
            // 先更新 value
            this.rawValue = newValue;
            this._value = convert(newValue);
            triggerEffects(this.dep);
        }
    }
}
function convert(value) {
    return isObject(value) ? reactive(value) : value;
}
function trackRefValue(ref) {
    if (isTacking()) {
        trackEffects(ref.dep);
    }
}
function ref(value) {
    return new RefImpl(value);
}
function isRef(ref) {
    return !!ref.__v_isRef;
}
function unRef(ref) {
    return isRef(ref) ? ref.value : ref;
}
function proxyRefs(objectWithRefs) {
    return new Proxy(objectWithRefs, {
        get(target, key) {
            return unRef(Reflect.get(target, key));
        },
        set(target, key, value) {
            if (isRef(target[key]) && !isRef(value)) {
                // base case
                return (target[key].value = value);
            }
            else {
                return Reflect.set(target, key, value);
            }
        },
    });
}

exports.createApp = createApp;
exports.createRenderer = createRenderer;
exports.createTextVNode = createTextVNode;
exports.getCurrentInstance = getCurrentInstance;
exports.h = h;
exports.inject = inject;
exports.provide = provide;
exports.proxyRefs = proxyRefs;
exports.ref = ref;
exports.renderSlots = renderSlots;
