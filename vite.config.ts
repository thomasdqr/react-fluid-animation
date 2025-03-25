import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      include: ['src'],
    }),
  ],
  build: {
    lib: {
      entry: resolve('src/index.ts'),
      name: 'ReactFluidAnimation',
      formats: ['es', 'umd'],
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', '@juggle/resize-observer', 'raf'],
      output: {
        exports: 'named',
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@juggle/resize-observer': 'ResizeObserver',
          'raf': 'raf'
        },
        sourcemap: true
      },
    },
    sourcemap: true,
    minify: 'esbuild',
  },
}); 