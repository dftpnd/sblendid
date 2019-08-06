import typescript from "typescript";
import commonjs from "rollup-plugin-commonjs";
import resolve from "rollup-plugin-node-resolve";
import typescriptPlugin from "rollup-plugin-typescript2";
import autoExternal from "rollup-plugin-auto-external";
import copy from "rollup-plugin-copy";
import { terser } from "rollup-plugin-terser";
import pkg from "./package.json";

export default {
  input: "src/index.ts",
  output: [
    {
      file: pkg.main,
      format: "cjs",
      sourcemap: true
    },
    {
      file: pkg.module,
      format: "es",
      sourcemap: true
    }
  ],
  plugins: [
    autoExternal(),
    resolve({ preferBuiltins: true }),
    commonjs(),
    typescriptPlugin({ typescript, objectHashIgnoreUnknownHack: true }),
    terser(),
    copy({
      targets: [{ src: "src/native/**/*.node", dest: "lib" }],
      copyOnce: true
    })
  ]
};
