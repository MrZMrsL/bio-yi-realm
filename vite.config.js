import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    uni(),
  ],
  // GitHub Pages 项目站点使用相对路径，确保资源加载正确
  base: './',
})
