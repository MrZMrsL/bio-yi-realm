<template>
  <div class="encyclopedia-panel">
    <div class="encyclopedia-tabs">
      <button
        v-for="cat in categories"
        :key="cat.key"
        type="button"
        class="enc-tab-btn"
        :class="{ active: activeCategory === cat.key }"
        @click="activeCategory = cat.key"
      >
        {{ cat.label }} ({{ getEncProgress(cat.key) }})
      </button>
    </div>
    <!-- 怪物图鉴 -->
    <div v-if="activeCategory === 'monsters'" class="enc-list">
      <div
        v-for="m in allMonsters"
        :key="m.name"
        class="enc-item"
        :class="{ discovered: isDiscovered('monsters', m.name) }"
      >
        <div class="enc-item-header">
          <span class="enc-icon">{{ isDiscovered('monsters', m.name) ? '👹' : '❓' }}</span>
          <span class="enc-name">{{ isDiscovered('monsters', m.name) ? m.name : '???' }}</span>
          <span class="enc-category">{{ m.category }}</span>
          <span v-if="getDiscoveryCount('monsters', m.name) > 0" class="enc-count">×{{ getDiscoveryCount('monsters', m.name) }}</span>
        </div>
        <p v-if="isDiscovered('monsters', m.name)" class="enc-lore">{{ m.lore }}</p>
        <p v-else class="enc-lore hidden">尚未发现此怪物...</p>
      </div>
    </div>
    <!-- 材料图鉴 -->
    <div v-if="activeCategory === 'materials'" class="enc-list">
      <div
        v-for="mat in allMaterials"
        :key="mat.name"
        class="enc-item"
        :class="{ discovered: isDiscovered('materials', mat.name) }"
      >
        <div class="enc-item-header">
          <span class="enc-icon">{{ isDiscovered('materials', mat.name) ? '💎' : '❓' }}</span>
          <span class="enc-name">{{ isDiscovered('materials', mat.name) ? mat.name : '???' }}</span>
          <span v-if="getDiscoveryCount('materials', mat.name) > 0" class="enc-count">×{{ getDiscoveryCount('materials', mat.name) }}</span>
        </div>
        <p v-if="isDiscovered('materials', mat.name)" class="enc-lore">{{ mat.lore }}</p>
        <p v-else class="enc-lore hidden">尚未发现此材料...</p>
      </div>
    </div>
    <!-- 鱼类图鉴 -->
    <div v-if="activeCategory === 'fishes'" class="enc-list">
      <div
        v-for="fish in allFishes"
        :key="fish.name"
        class="enc-item"
        :class="{ discovered: isDiscovered('fishes', fish.name) }"
      >
        <div class="enc-item-header">
          <span class="enc-icon">{{ isDiscovered('fishes', fish.name) ? '🐟' : '❓' }}</span>
          <span class="enc-name">{{ isDiscovered('fishes', fish.name) ? fish.name : '???' }}</span>
          <span v-if="getDiscoveryCount('fishes', fish.name) > 0" class="enc-count">×{{ getDiscoveryCount('fishes', fish.name) }}</span>
        </div>
        <p v-if="isDiscovered('fishes', fish.name)" class="enc-lore">{{ fish.lore }}</p>
        <p v-else class="enc-lore hidden">尚未钓获此鱼...</p>
      </div>
    </div>
    <!-- 书籍图鉴 -->
    <div v-if="activeCategory === 'books'" class="enc-list">
      <div
        v-for="book in allBooks"
        :key="book.name"
        class="enc-item"
        :class="{ discovered: isDiscovered('books', book.name) }"
      >
        <div class="enc-item-header">
          <span class="enc-icon">{{ isDiscovered('books', book.name) ? '📖' : '❓' }}</span>
          <span class="enc-name">{{ isDiscovered('books', book.name) ? book.name : '???' }}</span>
          <span v-if="getDiscoveryCount('books', book.name) > 0" class="enc-count">×{{ getDiscoveryCount('books', book.name) }}</span>
        </div>
        <p v-if="isDiscovered('books', book.name)" class="enc-lore">{{ book.lore }}</p>
        <p v-else class="enc-lore hidden">尚未发现此古籍...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCyclopedia } from '../../composables/useCyclopedia.js'
import { getAllMonsters, getAllMaterials, getAllBooks } from '../../data/encyclopedia.ts'

const { isDiscovered, getDiscoveryCount, getEncProgress } = useCyclopedia()
const activeCategory = ref('monsters')
const allMonsters = ref(getAllMonsters())
const allMaterials = ref(getAllMaterials())
const allFishes = ref([])
const allBooks = ref(getAllBooks())

onMounted(async () => {
  const { getAllFishes: getAllFishesAsync } = await import('../../data/encyclopedia.ts')
  allFishes.value = await getAllFishesAsync()
})

const categories = [
  { key: 'monsters', label: '怪物' },
  { key: 'materials', label: '材料' },
  { key: 'fishes', label: '鱼类' },
  { key: 'books', label: '古籍' },
]

</script>

<style scoped>
.encyclopedia-panel {
  padding: 16px;
}

.encyclopedia-tabs {
  display: flex;
  gap: 4px;
  padding-bottom: 12px;
  margin-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  overflow-x: auto;
}

.enc-tab-btn {
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #888;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
}

.enc-tab-btn.active {
  background: rgba(212, 168, 83, 0.15);
  border-color: rgba(212, 168, 83, 0.3);
  color: #d4a853;
}

.enc-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.enc-item {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 12px;
  transition: all 0.2s;
}

.enc-item.discovered {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(212, 168, 83, 0.15);
}

.enc-item-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.enc-icon {
  font-size: 20px;
}

.enc-name {
  flex: 1;
  font-size: 14px;
  font-weight: bold;
  color: #e0e0e0;
}

.enc-item:not(.discovered) .enc-name {
  color: #666;
}

.enc-category {
  font-size: 11px;
  color: #888;
  background: rgba(255, 255, 255, 0.05);
  padding: 2px 8px;
  border-radius: 4px;
}

.enc-count {
  font-size: 11px;
  color: #d4a853;
  background: rgba(212, 168, 83, 0.1);
  padding: 2px 8px;
  border-radius: 4px;
}

.enc-lore {
  font-size: 12px;
  line-height: 1.6;
  color: #a0a0a0;
  padding: 8px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

.enc-lore.hidden {
  color: #666;
  font-style: italic;
}
</style>
