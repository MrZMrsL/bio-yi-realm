<template>
  <div class="panel-dungeon">
    <!-- 地牢入口 -->
    <DungeonIntro
      v-if="gameStore.gameMode === GAME_MODE.IDLE"
      :floor="playerStore.floor"
      :total-atk="equipmentStore.totalAtk"
      :total-def="equipmentStore.totalDef"
      :hp="playerStore.hp"
      :max-hp="playerStore.maxHp"
      @enter="onEnterDungeon"
    />

    <!-- 准备界面 -->
    <DungeonPrep
      v-if="gameStore.gameMode === GAME_MODE.DUNGEON_PREP"
      :floor="playerStore.floor"
      :floor-element-name="floorElementName"
      :floor-element-color="floorElementColor"
      :floor-element-hint="floorElementHint"
      :room-grid="dungeonStore.roomGrid"
      :equipped="equipmentStore.equipped"
      :consumables="equipmentStore.consumables"
      :active-monster="farmStore.activeMonster"
      @open-equip-picker="openEquipPicker"
      @open-pet-picker="openPetPicker"
      @enter-rooms="enterRooms"
    />

    <!-- 装备选择弹窗 -->
    <DungeonPickerModal
      :visible="showEquipPicker"
      mode="equip"
      :equip-type="equipPickerType"
      :equip-items="equipPickerItems"
      :equipped-item-id="equipmentStore.equipped[equipPickerType]?.id"
      @close="showEquipPicker = false"
      @select="pickEquip"
      @unequip="unequip(equipPickerType)"
    />

    <!-- 宠物选择弹窗 -->
    <DungeonPickerModal
      :visible="showPetPicker"
      mode="pet"
      :farm="farmStore.farm"
      :active-monster-name="farmStore.activeMonster?.name"
      @close="showPetPicker = false"
      @select="pickPet"
      @unequip="clearPet"
    />

    <!-- 房间选择 -->
    <DungeonRoomGrid
      v-if="gameStore.gameMode === GAME_MODE.DUNGEON_ROOMS"
      :floor="playerStore.floor"
      :room-grid="dungeonStore.roomGrid"
      :cleared-rooms-this-floor="dungeonStore.clearedRoomsThisFloor"
      :in-battle="gameStore.inBattle"
      :all-clear-count="dungeonStore.allClearCount"
      @enter-room="onEnterRoom"
      @next-floor="onNextFloor"
    />

    <!-- 战斗 -->
    <Battle v-if="gameStore.isCombatMode()" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useGameStore, GAME_MODE } from '../stores/game.ts'
import { usePlayerStore } from '../stores/playerStore.ts'
import { useEquipmentStore } from '../stores/equipmentStore.ts'
import { useDungeonStore } from '../stores/dungeonStore.ts'
import { useFarmStore } from '../stores/farmStore.ts'
import { DUNGEON_ELEMENTS, ELEMENT_COUNTER } from '../data/farm.ts'
import { sfxClick, sfxStart } from '../utils/sfx.ts'
import Battle from './Battle.vue'
import DungeonIntro from './dungeon/DungeonIntro.vue'
import DungeonPrep from './dungeon/DungeonPrep.vue'
import DungeonRoomGrid from './dungeon/DungeonRoomGrid.vue'
import DungeonPickerModal from './dungeon/DungeonPickerModal.vue'

const gameStore = useGameStore()
const playerStore = usePlayerStore()
const equipmentStore = useEquipmentStore()
const dungeonStore = useDungeonStore()
const farmStore = useFarmStore()

// 本层元素计算属性
const floorElementData = computed(() => {
  const el = dungeonStore.currentFloorElement
  return DUNGEON_ELEMENTS[el] || DUNGEON_ELEMENTS.water
})
const floorElementColor = computed(() => floorElementData.value.color)
const floorElementName = computed(() => floorElementData.value.name)
const floorElementHint = computed(() => {
  const el = dungeonStore.currentFloorElement
  const counters = ELEMENT_COUNTER[el] || []
  const counterNames = counters.map(k => DUNGEON_ELEMENTS[k]?.name || k).join('、')
  const weakTo = Object.entries(ELEMENT_COUNTER)
    .filter(([_, v]) => v.includes(el))
    .map(([k, _]) => DUNGEON_ELEMENTS[k]?.name || k)
    .join('、')
  return `${floorElementName.value}元素：克制 ${counterNames} | 被 ${weakTo} 克制`
})

function onEnterDungeon() {
  sfxStart()
  gameStore.enterDungeonPrep()
}

function onEnterRoom(index) {
  sfxClick()
  gameStore.enterRoom(index)
}

function onNextFloor() {
  sfxClick()
  gameStore.nextFloor()
}

function enterRooms() {
  sfxClick()
  gameStore.enterMode(GAME_MODE.DUNGEON_ROOMS)
  dungeonStore.enterRooms()
}

// 战前准备 - 装备与宠物选择
const showEquipPicker = ref(false)
const equipPickerType = ref('weapon')
const showPetPicker = ref(false)

const equipPickerItems = computed(() => equipmentStore.equipment.filter(e => e.type === equipPickerType.value))

function openEquipPicker(type) {
  sfxClick()
  equipPickerType.value = type
  showEquipPicker.value = true
}

function pickEquip(item) {
  sfxClick()
  equipmentStore.equip(item)
  showEquipPicker.value = false
}

function unequip(type) {
  sfxClick()
  if (type === 'weapon') equipmentStore.equipped.weapon = null
  else if (type === 'armor') equipmentStore.equipped.armor = null
  else if (type === 'accessory') equipmentStore.equipped.accessory = null
  showEquipPicker.value = false
}

function openPetPicker() {
  sfxClick()
  showPetPicker.value = true
}

function pickPet({ index }) {
  sfxClick()
  farmStore.setFollowMonster(index)
  showPetPicker.value = false
}

function clearPet() {
  sfxClick()
  farmStore.unfollowMonster()
  showPetPicker.value = false
}
</script>

<style scoped>
.panel-dungeon {
  height: 100%;
  overflow-y: auto;
}
</style>
