export const extend = Object.assign;

// 检查值是否为对象
export const isObject = (val) => {
  return val !== null && typeof val === "object";
};

export const hasChange = (newValue, value) => {
  return !Object.is(newValue, value);
};

// 检查对象是否具有指定的属性
export const hasOwn = (val, key) => {
  return Object.prototype.hasOwnProperty.call(val, key);
};

// 将字符串转换为驼峰命名法
// 示例： add -> Add, add-foo -> addFoo
export const camelize = (str: string) => {
  return str.replace(/-(\w)/g, (_, c: string) => {
    return c ? c.toUpperCase() : "";
  });
};

// 将字符串转换为大写首字母的驼峰命名法
export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// 将字符串转换为驼峰命名法，并在前面添加 on 前缀
export const toHandlerKey = (str: string) => {
  return str ? "on" + capitalize(str) : "";
};
