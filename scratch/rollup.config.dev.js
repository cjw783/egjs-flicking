import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';

export default {
  input: 'src/index.umd.ts',
  output: {
    file: 'dist/flicking.js',
    format: 'umd',
    name: 'Flicking',
    sourcemap: true,
    globals: {
      '@egjs/component': 'eg.Component'
    }
  },
  plugins: [
    typescript(),
    nodeResolve(),
    commonjs(),
    serve({
      open: true,
      contentBase: ['./dist', './demo'],
      port: 8080
    }),
    livereload('dist')
  ]
}; 