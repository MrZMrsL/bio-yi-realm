<script setup>
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { provide } from 'vue'
import { flushSaveIfNeeded } from './services/saveService.js'
import { usePwaUpdate } from './composables/usePwaUpdate.js'

const pwaUpdate = usePwaUpdate()
provide('pwaUpdate', pwaUpdate)

onLaunch(() => {
  console.log('App Launch')
})
onShow(() => {
  console.log('App Show')
})
onHide(() => {
  console.log('App Hide')
  flushSaveIfNeeded()
})
</script>

<style>
/* 全局公共样式 */
@import './style.css';
@import './styles/mobile.css';
</style>
