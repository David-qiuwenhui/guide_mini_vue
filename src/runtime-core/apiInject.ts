import { getCurrentInstance } from "./component";

// 存储
export function provide(key, value) {
  const currentInstance: any = getCurrentInstance();
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
export function inject(key, defaultValue?) {
  const currentInstance: any = getCurrentInstance();
  if (currentInstance) {
    const parentProvides = currentInstance.parent.provides;

    if (key in parentProvides) {
      return parentProvides[key];
    } else if (defaultValue) {
      if (typeof defaultValue === "function") {
        return defaultValue();
      }
      return defaultValue;
    }
  }
}
