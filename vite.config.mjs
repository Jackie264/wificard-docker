import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // 允许在 Docker 容器中通过 IP 地址访问
    port: 5173 // Vite 默认端口
  },
  build: {
    outDir: 'build' // 输出目录设置为 build，与 CRA 保持一致
  }
});
