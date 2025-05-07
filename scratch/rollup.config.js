import { babel } from "@rollup/plugin-babel";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";

import pkg from "./package.json";

const banner = `/*
 * egjs-flicking-from-scratch
 * Copyright (c) ${new Date().getFullYear()}
 * MIT license
 */`;

const external = Object.keys(pkg.dependencies);

export default [
  // ESM build
  {
    input: "src/index.ts",
    output: {
      file: pkg.module,
      format: "es",
      banner,
      sourcemap: true
    },
    plugins: [typescript(), nodeResolve(), commonjs()],
    external
  },
  // CommonJS build
  {
    input: "src/index.ts",
    output: {
      file: pkg.main,
      format: "cjs",
      banner,
      sourcemap: true,
      exports: "auto"
    },
    plugins: [typescript(), nodeResolve(), commonjs()],
    external
  },
  // UMD build (minified)
  {
    input: "src/index.umd.ts",
    output: {
      file: "dist/flicking.pkgd.min.js",
      format: "umd",
      name: "Flicking",
      banner,
      sourcemap: true,
      globals: {
        "@egjs/component": "eg.Component"
      }
    },
    plugins: [
      typescript(),
      nodeResolve(),
      commonjs(),
      babel({
        babelHelpers: "bundled",
        exclude: "node_modules/**"
      }),
      terser()
    ]
  }
];
