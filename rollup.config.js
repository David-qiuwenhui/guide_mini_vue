import typescript from "@rollup/plugin-typescript";
import pkg from "./package.json" assert { type: "json" };
export default {
  input: "./src/index.ts",
  output: [
    // 1. cjs -> commonjs -> package.json -> main
    // 2. esm -> es module -> package.json -> module
    {
      format: "cjs",
      file: pkg.main,
    },
    {
      format: "es",
      file: pkg.module,
    },
  ],
  plugins: [typescript()],
};
