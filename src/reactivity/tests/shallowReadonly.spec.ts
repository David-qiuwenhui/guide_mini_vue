import { isReadonly, shallowReadonly } from "../reactive";

describe("shallowReadonly", () => {
  it("should not make non-reactive properties reactive", () => {
    const props = shallowReadonly({
      n: {
        foo: 1,
      },
    });

    expect(isReadonly(props)).toBe(true);
    expect(isReadonly(props.n)).toBe(false);
  });

  it("should call console.warn when set", () => {
    console.warn = jest.fn();
    const original = {
      foo: 1,
      bar: {
        baz: 2,
      },
    };
    const wrapped = shallowReadonly(original);
    wrapped.foo = 10;

    expect(console.warn).toHaveBeenCalled();
  });
});
