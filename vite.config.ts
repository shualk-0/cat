
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // 这里的 base 必须和你的 GitHub 仓库名完全对应
  base: '/cat/', 
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true // 开启 sourcemap 方便调试
  },
  server: {
    fs: {
      strict: false
    }
  }
});
