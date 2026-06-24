import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import { VitePWA } from 'vite-plugin-pwa'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    uni(),
    VitePWA({
      // 手动在 usePwaUpdate.js 中注册，避免重复注入
      injectRegister: false,
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        // GitHub Pages 项目站点路径
        navigateFallback: 'index.html',
      },
      manifest: false,
      devOptions: {
        enabled: false,
      },
    }),
  ],
  // GitHub Pages 项目站点使用相对路径，确保资源加载正确
  base: './',
})
