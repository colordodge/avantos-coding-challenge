  /// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    // Use 'happy-dom' which is faster and more stable than jsdom
    environment: 'happy-dom',
    setupFiles: './src/test/setup.ts',
    css: {
      modules: {
        classNameStrategy: 'non-scoped', // Use original class names in tests
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        '**/types/',
        '**/*.test.*',
        '**/*.spec.*',
        '**/main.tsx',
        '**/index.ts', // barrel exports
        '**/*.module.css.d.ts',
        '**/theme/**', // theme configuration files
      ],
      include: [
        'src/**/*.{ts,tsx}',
      ],
    },
  },
})
