import { isReadonly, readonly } from "../reactive";

describe("readonly", () => {
  it("happy path ", () => {
    // not set
    const original = {
      foo: 1,
      bar: {
        baz: 2,
      },
    };
    const wrapped = readonly(original);

    expect(wrapped).not.toBe(original);
    expect(wrapped.foo).toBe(1);
  });

  it("readonly set", () => {
    console.warn = jest.fn();
    const original = {
      foo: 1,
      bar: {
        baz: 2,
      },
    };
    const wrapped = readonly(original);
    wrapped.foo = 10;

    expect(console.warn).toHaveBeenCalled();
  });

  it("isReadonly", () => {
    const original = {
      foo: 1,
      bar: {
        baz: 2,
      },
    };
    const wrapped = readonly(original);
    expect(isReadonly(wrapped)).toBe(true);
    expect(isReadonly(original)).toBe(false);
  });
});