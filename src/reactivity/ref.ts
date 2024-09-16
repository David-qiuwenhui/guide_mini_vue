import { hasChange } from "../shared";
import { trackEffects, triggerEffects, isTacking } from "./effect";
import { reactive } from "./reactive";
import { isObject } from "../shared/index";

class RefImpl {
  private _value: any;
  private rawValue: any;
  public dep;

  constructor(value) {
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

export function trackRefValue(ref) {
  if (isTacking()) {
    trackEffects(ref.dep);
  }
}

export function ref(value) {
  return new RefImpl(value);
}
