<template>
  <div class="farm-container">
    <FarmHeader
      :active-monster="store.activeMonster"
      :fusion-mode="fusionMode"
      @enter-fusion="enterFusionMode"
      @exit-fusion="exitFusionMode"
    />

    <FarmMaterialPanel :inventory="store.inventory" />

    <FarmEmptyState v-if="store.farm.length === 0" />

    <template v-else>
      <FarmPetGrid
        :farm="store.farm"
        :fusion-mode="fusionMode"
        :fusion-selected="fusionSelected"
        :active-monster-name="store.activeMonster?.name"
        @toggle-follow="toggleFollow"
        @upgrade="handleUpgrade"
        @release="handleRelease"
        @toggle-fusion-select="toggleFusionSelect"
      />

      <FarmFusionPanel
        v-if="fusionMode && fusionSelected.length === 2"
        :parent1="store.farm[fusionSelected[0]]"
        :parent2="store.farm[fusionSelected[1]]"
        :fusion-preview="fusionPreview"
        :fuse-cost="fuseCost"
        :gold="store.gold"
        @confirm="doFusion"
        @reset="resetFusion"
      />
    </template>

    <FarmFusionResult :result="fusionResult" @close="closeFusionResult" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useGameStore } from '../stores/game.ts'
import { FUSE_RULES, fusePets, getUpgradeMaterialName } from '../data/farm.ts'
import { useToast } from '../composables/useToast.js'
import { useDialog } from '../composables/useDialog.js'
import FarmHeader from './farm/FarmHeader.vue'
import FarmMaterialPanel from './farm/FarmMaterialPanel.vue'
import FarmEmptyState from './farm/FarmEmptyState.vue'
import FarmPetGrid from './farm/FarmPetGrid.vue'
import FarmFusionPanel from './farm/FarmFusionPanel.vue'
import FarmFusionResult from './farm/FarmFusionResult.vue'

const store = useGameStore()
const toast = useToast()
const dialog = useDialog()

const fusionMode = ref(false)
const fusionSelected = ref([])
const fusionResult = ref(null)

const fuseCost = computed(() => {
  if (fusionSelected.value.length < 2) return 0
  const pet = store.farm[fusionSelected.value[0]]
  if (!pet) return 0
  const rule = FUSE_RULES[pet.rarity]
  return rule?.cost || 0
})

const fusionPreview = computed(() => {
  if (fusionSelected.value.length < 2) return null
  const pet1 = store.farm[fusionSelected.value[0]]
  const pet2 = store.farm[fusionSelected.value[1]]
  if (!pet1 || !pet2) return null
  const result = fusePets(pet1, pet2)
  return result?.error ? null : result
})

function isFollowing(m) {
  return store.activeMonster?.name === m.name
}

function toggleFollow(idx) {
  if (isFollowing(store.farm[idx])) {
    store.unfollowMonster()
  } else {
    store.setFollowMonster(idx)
  }
}

function handleUpgrade(idx) {
  const m = store.farm[idx]
  const matName = getUpgradeMaterialName(m.element)
  const matCost = Math.floor(m.level * 2)
  const matCount = store.inventory[matName] || 0

  if (m.exp < m.maxExp && matCount < matCost) {
    toast.warning(`${matName} 不足 (${matCount}/${matCost})，击败对应元素怪物可获得`)
    return
  }

  const success = store.upgradeMonster(idx)
  if (success) {
    toast.success(`${m.name} 升级到 Lv.${m.level}！`)
  }
}

async function handleRelease(idx) {
  const m = store.farm[idx]
  const confirmed = await dialog.confirm({
    title: '放生确认',
    message: `确定要放生 ${m.name} 吗？放生后无法找回。`,
    confirmText: '放生',
    cancelText: '取消',
  })
  if (confirmed) {
    store.releaseMonster(idx)
    toast.success(`${m.name} 已放生`)
  }
}

// ===== 融合进化 =====
function toggleFusionSelect(idx) {
  if (fusionSelected.value.includes(idx)) {
    fusionSelected.value = fusionSelected.value.filter(i => i !== idx)
  } else if (fusionSelected.value.length < 2) {
    fusionSelected.value.push(idx)
  }
}

function enterFusionMode() {
  fusionMode.value = true
  fusionSelected.value = []
  fusionResult.value = null
}

function exitFusionMode() {
  fusionMode.value = false
  fusionSelected.value = []
  fusionResult.value = null
}

function resetFusion() {
  fusionSelected.value = []
}

function doFusion() {
  if (fusionSelected.value.length < 2) return
  const result = store.executeFusion(fusionSelected.value[0], fusionSelected.value[1])
  if (result.error) {
    toast.error(result.error)
    return
  }
  if (result.success) {
    fusionResult.value = result.result
    fusionSelected.value = []
    toast.success(`融合成功！获得 ${result.result.name}`)
  }
}

function closeFusionResult() {
  fusionResult.value = null
  fusionMode.value = false
}
</script>

<style scoped>
.farm-container {
  padding: 16px;
  color: #e0e0e0;
  height: 100%;
  overflow-y: auto;
}
</style>
