export const extend = Object.assign;

export const isObject = (val) => {
  return val !== null && typeof val === "object";
};

export const hasChange = (newValue, value) => {
  return !Object.is(newValue, value);
};
