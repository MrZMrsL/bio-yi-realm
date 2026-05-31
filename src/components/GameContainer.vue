<template>
  <div id="game-container">
    <!-- 新发现通知 -->
  <div class="discovery-notifications">
    <div v-for="(notif, idx) in store.newDiscoveries" :key="notif.time + idx" class="discovery-notif">
      <div class="discovery-notif-title">📖 新发现！</div>
      <div class="discovery-notif-text">发现{{ notif.type }}"{{ notif.name }}"</div>
    </div>
  </div>

  <!-- 新手引导弹窗 -->
  <div v-if="showTutorialModal" class="tutorial-overlay">
    <div class="tutorial-modal">
      <div class="tutorial-header">
        <span class="tutorial-step">{{ tutorialStep + 1 }} / {{ tutorialSteps.length }}</span>
        <button class="tutorial-skip" @click="skipTutorial">跳过</button>
      </div>
      <div class="tutorial-content">
        <h3 class="tutorial-title">{{ tutorialSteps[tutorialStep].title }}</h3>
        <p class="tutorial-text">{{ tutorialSteps[tutorialStep].text }}</p>
      </div>
      <div class="tutorial-actions">
        <button class="tutorial-btn" @click="nextTutorialStep">
          {{ tutorialStep < tutorialSteps.length - 1 ? '下一步 →' : '开始冒险！' }}
        </button>
      </div>
    </div>
  </div>

  <!-- 顶部状态栏 -->
    <div id="status-bar">
      <div class="stat-box">
        <div class="stat-title" title="点击查看人物简史">{{ store.title }}</div>
        <div class="stat-value">Lv.{{ store.level }}</div>
        <div class="stat-bar">
          <div class="stat-bar-fill" :style="{ width: store.expPercent + '%' }"></div>
          <span class="stat-bar-text">{{ store.exp }}/{{ store.maxExp }}</span>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-title">❤️ 生命</div>
        <div class="stat-value">{{ store.hp }}/{{ store.maxHp }}</div>
        <div class="stat-bar">
          <div class="stat-bar-fill hp" :style="{ width: store.hpPercent + '%' }"></div>
          <span class="stat-bar-text">{{ store.hpPercent.toFixed(0) }}%</span>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-title">💰 金币</div>
        <div class="stat-value">{{ store.gold }}</div>
        <div class="stat-label">🏠 第{{ store.floor }}层</div>
      </div>
    </div>

    <!-- 主界面 - 区域网格 -->
    <div id="main-content" v-if="!activePanel">
      <div class="dashboard-header">
        <h2>🏰 生化易界</h2>
        <p class="dashboard-subtitle">以知识为刃，斩破混沌迷雾</p>
      </div>

      <div class="area-grid">
        <!-- 地牢探索 -->
        <div class="area-card dungeon-card" @click="openPanel('dungeon')">
          <div class="area-icon">🏰</div>
          <div class="area-name">地牢探索</div>
          <div class="area-desc">第 {{ store.floor }} 层</div>
        </div>

        <!-- 图鉴 -->
        <div class="area-card encyclopedia-card" @click="openPanel('encyclopedia')">
          <div class="area-icon">📖</div>
          <div class="area-name">图鉴</div>
          <div class="area-desc">怪物 · 材料 · 鱼</div>
        </div>

        <!-- 仓库 -->
        <div class="area-card inventory-card" @click="openPanel('inventory')">
          <div class="area-icon">🎒</div>
          <div class="area-name">仓库</div>
          <div class="area-desc">装备 · 材料 · 药水</div>
        </div>

        <!-- 农场 -->
        <div class="area-card farm-card" @click="openPanel('farm')">
          <div class="area-icon">🏡</div>
          <div class="area-name">怪物农场</div>
          <div class="area-desc">伙伴: {{ store.farm.length }}/12</div>
        </div>

        <!-- 钓鱼塘 -->
        <div class="area-card fishing-card" @click="openPanel('fishing')">
          <div class="area-icon">🎣</div>
          <div class="area-name">钓鱼塘</div>
          <div class="area-desc">Lv.{{ store.fishingLevel }} 钓手</div>
        </div>

        <!-- 自习室 -->
        <div class="area-card study-card" @click="openPanel('study')">
          <div class="area-icon">📚</div>
          <div class="area-name">自习室</div>
          <div class="area-desc">错题回顾 · 知识巩固</div>
        </div>

        <!-- 商店 -->
        <div class="area-card shop-card" @click="openPanel('shop')">
          <div class="area-icon">🏪</div>
          <div class="area-name">杂货铺</div>
          <div class="area-desc">购买补给物资</div>
        </div>

        <!-- 设置 -->
        <div class="area-card settings-card" @click="openPanel('settings')">
          <div class="area-icon">⚙️</div>
          <div class="area-name">设置</div>
          <div class="area-desc">称号 · 存档</div>
        </div>

        <!-- 成就 -->
        <div class="area-card achievements-card" @click="openPanel('achievements')">
          <div class="area-icon">🏆</div>
          <div class="area-name">成就殿堂</div>
          <div class="area-desc">{{ store.unlockedAchievements?.length || 0 }} / {{ totalAchievements }} 已解锁</div>
        </div>
      </div>
    </div>

    <!-- 成就面板 -->
    <div v-if="activePanel === 'achievements'" class="panel-achievements">
      <Achievements />
    </div>

    <!-- 面板覆盖层 -->
    <div v-if="activePanel" class="panel-overlay">
      <div class="panel-header">
        <button class="btn-back" @click="closePanel">← 返回</button>
        <span class="panel-title">{{ panelTitle }}</span>
      </div>
      <div class="panel-content">
        <!-- 地牢面板 -->
        <div v-if="activePanel === 'dungeon'" class="panel-dungeon">
          <!-- 地牢入口 -->
          <div v-if="store.dungeonPhase === 'none'" class="dungeon-intro">
            <div class="dungeon-title">🏰 第 {{ store.floor }} 层地牢</div>
            <p class="dungeon-desc">黑暗中的密室散发着危险的气息...</p>
            <div class="dungeon-stats-hint">
              <span>⚔️{{ store.totalAtk }}</span>
              <span>🛡️{{ store.totalDef }}</span>
              <span>❤️{{ store.hp }}/{{ store.maxHp }}</span>
            </div>
            <button class="explore-btn" @click="onEnterDungeon">进入地牢</button>
          </div>

          <!-- 准备界面 -->
          <div v-if="store.dungeonPhase === 'prep'" class="dungeon-prep">
            <div class="prep-header">
              <div class="prep-title">⚔️ 第 {{ store.floor }} 层 - 战前准备</div>
              <div class="floor-element-badge" :style="{ background: floorElementColor }">
                {{ floorElementName }} 元素层
              </div>
              <div class="prep-hint">调整装备与宠物，确认后进入地牢</div>
            </div>

            <!-- 怪物预览 -->
            <div class="prep-preview">
              <div class="preview-title">🔮 本层怪物情报</div>
              <div class="preview-grid">
                <div v-for="room in store.roomGrid.slice(0, 6)" :key="room.index" class="preview-card" :class="{ 'preview-boss': room.isBoss }">
                  <span class="preview-icon">{{ room.enemyPreview.icon }}</span>
                  <span class="preview-name">{{ room.enemyPreview.name }}</span>
                  <span class="preview-subject" :style="{ background: room.enemyPreview.elementColor }">{{ room.enemyPreview.subjectLabel }}</span>
                  <span class="preview-atk">⚔️{{ room.enemyPreview.atk }}</span>
                </div>
                <div class="preview-more">+{{ store.roomGrid.length - 6 }} 更多...</div>
              </div>
            </div>

            <!-- 元素克制提示 -->
            <div class="element-hint">
              <div class="element-hint-title">💡 元素克制</div>
              <div class="element-hint-text">{{ floorElementHint }}</div>
            </div>

            <!-- 当前配置 -->
            <div class="prep-config">
              <div class="config-section">
                <div class="config-title">🗡️ 装备 <span class="config-sub">（点击更换）</span></div>
                <div class="config-slots">
                  <div class="config-slot" :class="{ empty: !store.equipped.weapon, clickable: true }" @click="openEquipPicker('weapon')">
                    <span v-if="store.equipped.weapon">⚔️ {{ store.equipped.weapon.name }}</span>
                    <span v-else>未装备武器</span>
                  </div>
                  <div class="config-slot" :class="{ empty: !store.equipped.armor, clickable: true }" @click="openEquipPicker('armor')">
                    <span v-if="store.equipped.armor">🛡️ {{ store.equipped.armor.name }}</span>
                    <span v-else>未装备防具</span>
                  </div>
                  <div class="config-slot" :class="{ empty: !store.equipped.accessory, clickable: true }" @click="openEquipPicker('accessory')">
                    <span v-if="store.equipped.accessory">💍 {{ store.equipped.accessory.name }}</span>
                    <span v-else>未装备饰品</span>
                  </div>
                </div>
              </div>

              <div class="config-section">
                <div class="config-title">🐾 宠物 <span class="config-sub">（点击更换）</span></div>
                <div class="config-pet clickable" @click="openPetPicker()">
                  <span v-if="store.activeMonster">{{ store.activeMonster.icon }} {{ store.activeMonster.name }} {{ store.activeMonster.ability?.desc }}</span>
                  <span v-else class="empty">未携带宠物</span>
                </div>
              </div>

              <div class="config-section">
                <div class="config-title">🧪 药水 ({{ store.consumables.length }})</div>
                <div class="config-potions">
                  <span v-for="item in store.consumables.slice(0, 5)" :key="item.id" class="config-potion">{{ item.icon }} {{ item.name }}</span>
                  <span v-if="store.consumables.length === 0" class="empty">无药水</span>
                </div>
              </div>
            </div>

            <div class="prep-actions">
              <button class="btn-enter-dungeon" @click="store.dungeonPhase = 'rooms'">🏰 进入地牢</button>
            </div>
          </div>

          <!-- 装备选择弹窗 -->
          <div v-if="showEquipPicker" class="prep-modal-overlay" @click.self="showEquipPicker = false">
            <div class="prep-modal">
              <div class="prep-modal-header">
                <span class="prep-modal-title">
                  {{ equipPickerType === 'weapon' ? '⚔️ 选择武器' : equipPickerType === 'armor' ? '🛡️ 选择防具' : '💍 选择饰品' }}
                </span>
                <button class="prep-modal-close" @click="showEquipPicker = false">✕</button>
              </div>
              <div class="prep-modal-body">
                <div v-if="store.equipment.filter(e => e.type === equipPickerType).length === 0" class="prep-modal-empty">
                  背包中没有{{ equipPickerType === 'weapon' ? '武器' : equipPickerType === 'armor' ? '防具' : '饰品' }}
                </div>
                <div
                  v-for="item in store.equipment.filter(e => e.type === equipPickerType)"
                  :key="item.id"
                  class="prep-modal-item"
                  :class="{ active: store.equipped[equipPickerType]?.id === item.id }"
                  @click="pickEquip(item)"
                >
                  <span class="prep-modal-icon">{{ item.icon || (equipPickerType === 'weapon' ? '⚔️' : equipPickerType === 'armor' ? '🛡️' : '💍') }}</span>
                  <span class="prep-modal-name">{{ item.name }}</span>
                  <span class="prep-modal-stat">
                    {{ equipPickerType === 'weapon' ? `攻+${item.atk}` : equipPickerType === 'armor' ? `防+${item.def}` : `攻+${item.atk || 0} 防+${item.def || 0}` }}
                  </span>
                </div>
                <div class="prep-modal-item empty-item" @click="unequip(equipPickerType)">
                  <span class="prep-modal-icon">🚫</span>
                  <span class="prep-modal-name">不装备</span>
                  <span class="prep-modal-stat">-</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 宠物选择弹窗 -->
          <div v-if="showPetPicker" class="prep-modal-overlay" @click.self="showPetPicker = false">
            <div class="prep-modal">
              <div class="prep-modal-header">
                <span class="prep-modal-title">🐾 选择宠物</span>
                <button class="prep-modal-close" @click="showPetPicker = false">✕</button>
              </div>
              <div class="prep-modal-body">
                <div v-if="store.farm.length === 0" class="prep-modal-empty">
                  农场中没有怪物，先去捕捉吧！
                </div>
                <div
                  v-for="(monster, idx) in store.farm"
                  :key="idx"
                  class="prep-modal-item"
                  :class="{ active: store.activeMonster?.name === monster.name }"
                  @click="pickPet(idx)"
                >
                  <span class="prep-modal-icon">{{ monster.icon }}</span>
                  <span class="prep-modal-name">{{ monster.name }}</span>
                  <span class="prep-modal-stat">{{ monster.ability?.desc || '' }}</span>
                </div>
                <div class="prep-modal-item empty-item" @click="clearPet()">
                  <span class="prep-modal-icon">🚫</span>
                  <span class="prep-modal-name">不携带宠物</span>
                  <span class="prep-modal-stat">-</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 房间选择 -->
          <div v-if="store.dungeonPhase === 'rooms'" class="dungeon-rooms">
            <div class="rooms-header">
              <div class="rooms-title">🏰 第 {{ store.floor }} 层 - 选择房间</div>
              <div class="rooms-progress">{{ store.clearedRoomsThisFloor }} / 9 已清空</div>
              <div v-if="store.allClearCount > 0" class="rooms-achievement">🏆 我全都要：{{ store.allClearCount }}/10</div>
            </div>
            <div class="rooms-grid">
              <div
                v-for="room in store.roomGrid"
                :key="room.index"
                class="room-card"
                :class="{
                  cleared: room.cleared,
                  boss: room.isBoss,
                  clickable: !room.cleared && !store.inBattle
                }"
                @click="!room.cleared && !store.inBattle && onEnterRoom(room.index)"
              >
                <div class="room-number">{{ room.index + 1 }}</div>
                <div v-if="!room.cleared" class="room-enemy">
                  <span class="room-icon">{{ room.isBoss ? '👹' : room.enemyPreview.icon }}</span>
                  <span class="room-name">{{ room.enemyPreview.name }}</span>
                  <span class="room-subject" :style="{ background: room.enemyPreview.elementColor }">{{ room.enemyPreview.subjectLabel }}</span>
                  <span class="room-stats">⚔️{{ room.enemyPreview.atk }} 🛡️{{ room.enemyPreview.def }}</span>
                </div>
                <div v-else class="room-cleared">
                  <span class="cleared-icon">✅</span>
                  <span>已清空</span>
                </div>
                <div v-if="room.isBoss" class="room-boss-tag">BOSS</div>
              </div>
            </div>
            <div class="rooms-actions">
              <button
                class="btn-next-floor"
                :class="{ 'all-clear': store.clearedRoomsThisFloor === 9 }"
                @click="onNextFloor"
              >
                {{ store.clearedRoomsThisFloor === 9 ? '🏆 全部清空！进入下一层' : '⬇️ 进入下一层' }}
              </button>
            </div>
          </div>

          <!-- 战斗 -->
          <Battle v-if="store.inBattle" />
        </div>

        <!-- 图鉴面板 -->
        <div v-if="activePanel === 'encyclopedia'" class="panel-encyclopedia">
          <div class="encyclopedia-tabs">
            <button
              v-for="cat in encyclopediaCategories"
              :key="cat.key"
              class="enc-tab-btn"
              :class="{ active: activeEncCategory === cat.key }"
              @click="activeEncCategory = cat.key"
            >
              {{ cat.label }} ({{ getEncProgress(cat.key) }})
            </button>
          </div>
          <!-- 怪物图鉴 -->
          <div v-if="activeEncCategory === 'monsters'" class="enc-list">
            <div v-for="m in allMonsters" :key="m.name" class="enc-item" :class="{ discovered: isDiscovered('monsters', m.name) }">
              <div class="enc-item-header">
                <span class="enc-icon">{{ isDiscovered('monsters', m.name) ? '👹' : '❓' }}</span>
                <span class="enc-name">{{ isDiscovered('monsters', m.name) ? m.name : '???' }}</span>
                <span class="enc-category">{{ m.category }}</span>
                <span class="enc-count" v-if="getDiscoveryCount('monsters', m.name) > 0">×{{ getDiscoveryCount('monsters', m.name) }}</span>
              </div>
              <p class="enc-lore" v-if="isDiscovered('monsters', m.name)">{{ m.lore }}</p>
              <p class="enc-lore hidden" v-else>尚未发现此怪物...</p>
            </div>
          </div>
          <!-- 材料图鉴 -->
          <div v-if="activeEncCategory === 'materials'" class="enc-list">
            <div v-for="mat in allMaterials" :key="mat.name" class="enc-item" :class="{ discovered: isDiscovered('materials', mat.name) }">
              <div class="enc-item-header">
                <span class="enc-icon">{{ isDiscovered('materials', mat.name) ? '💎' : '❓' }}</span>
                <span class="enc-name">{{ isDiscovered('materials', mat.name) ? mat.name : '???' }}</span>
                <span class="enc-count" v-if="getDiscoveryCount('materials', mat.name) > 0">×{{ getDiscoveryCount('materials', mat.name) }}</span>
              </div>
              <p class="enc-lore" v-if="isDiscovered('materials', mat.name)">{{ mat.lore }}</p>
              <p class="enc-lore hidden" v-else>尚未发现此材料...</p>
            </div>
          </div>
          <!-- 鱼类图鉴 -->
          <div v-if="activeEncCategory === 'fishes'" class="enc-list">
            <div v-for="fish in allFishes" :key="fish.name" class="enc-item" :class="{ discovered: isDiscovered('fishes', fish.name) }">
              <div class="enc-item-header">
                <span class="enc-icon">{{ isDiscovered('fishes', fish.name) ? '🐟' : '❓' }}</span>
                <span class="enc-name">{{ isDiscovered('fishes', fish.name) ? fish.name : '???' }}</span>
                <span class="enc-count" v-if="getDiscoveryCount('fishes', fish.name) > 0">×{{ getDiscoveryCount('fishes', fish.name) }}</span>
              </div>
              <p class="enc-lore" v-if="isDiscovered('fishes', fish.name)">{{ fish.lore }}</p>
              <p class="enc-lore hidden" v-else>尚未钓获此鱼...</p>
            </div>
          </div>
          <!-- 书籍图鉴 -->
          <div v-if="activeEncCategory === 'books'" class="enc-list">
            <div v-for="book in allBooks" :key="book.name" class="enc-item" :class="{ discovered: isDiscovered('books', book.name) }">
              <div class="enc-item-header">
                <span class="enc-icon">{{ isDiscovered('books', book.name) ? '📖' : '❓' }}</span>
                <span class="enc-name">{{ isDiscovered('books', book.name) ? book.name : '???' }}</span>
                <span class="enc-count" v-if="getDiscoveryCount('books', book.name) > 0">×{{ getDiscoveryCount('books', book.name) }}</span>
              </div>
              <p class="enc-lore" v-if="isDiscovered('books', book.name)">{{ book.lore }}</p>
              <p class="enc-lore hidden" v-else>尚未发现此古籍...</p>
            </div>
          </div>
        </div>

        <!-- 仓库面板 -->
        <div v-if="activePanel === 'inventory'" class="panel-inventory">
          <Inventory />
        </div>

        <!-- 农场面板 -->
        <div v-if="activePanel === 'farm'" class="panel-farm">
          <Farm />
        </div>

        <!-- 钓鱼面板 -->
        <div v-if="activePanel === 'fishing'" class="panel-fishing">
          <Fishing />
        </div>

        <!-- 自习室面板 -->
        <div v-if="activePanel === 'study'" class="panel-study">
          <Review />
        </div>

        <!-- 商店面板 -->
        <div v-if="activePanel === 'shop'" class="panel-shop">
          <Shop />
        </div>

        <!-- 设置面板 -->
        <div v-if="activePanel === 'settings'" class="panel-settings">
          <div class="settings-tabs">
            <button
              v-for="tab in settingsTabs"
              :key="tab.key"
              class="settings-tab-btn"
              :class="{ active: activeSettingsTab === tab.key }"
              @click="activeSettingsTab = tab.key"
            >
              {{ tab.label }}
            </button>
          </div>

          <!-- 称号面板 -->
          <div v-if="activeSettingsTab === 'title'" class="settings-content">
            <div class="title-card">
              <div class="title-header">
                <span class="title-badge">Lv.{{ store.level }}</span>
                <h3 class="title-name">{{ store.title }}</h3>
                <span class="title-field">{{ store.titleEra }} · {{ store.titleField }}</span>
              </div>
              <p class="title-bio">{{ store.titleBio }}</p>
              <div class="title-achievements">
                <h4>🏆 成就</h4>
                <div v-for="(ach, idx) in store.titleAchievements" :key="idx" class="achievement-item">
                  <span class="achievement-check">✓</span>
                  <span>{{ ach }}</span>
                </div>
              </div>
            </div>
            <div class="title-progress">
              <h4>📈 称号进度</h4>
              <div v-for="t in allTitles" :key="t.title" class="progress-item" :class="{ current: t.title === store.title }">
                <span class="progress-level">Lv.{{ t.min }}-{{ t.max }}</span>
                <span class="progress-name">{{ t.title }}</span>
                <span class="progress-field">{{ t.field }}</span>
              </div>
            </div>
          </div>

          <!-- 图鉴面板 -->
          <div v-if="activeSettingsTab === 'encyclopedia'" class="settings-content">
            <div class="encyclopedia-tabs">
              <button
                v-for="cat in encyclopediaCategories"
                :key="cat.key"
                class="enc-tab-btn"
                :class="{ active: activeEncCategory === cat.key }"
                @click="activeEncCategory = cat.key"
              >
                {{ cat.label }} ({{ getEncProgress(cat.key) }})
              </button>
            </div>

            <!-- 怪物图鉴 -->
            <div v-if="activeEncCategory === 'monsters'" class="enc-list">
              <div v-for="m in allMonsters" :key="m.name" class="enc-item" :class="{ discovered: isDiscovered('monsters', m.name) }">
                <div class="enc-item-header">
                  <span class="enc-icon">{{ isDiscovered('monsters', m.name) ? '👹' : '❓' }}</span>
                  <span class="enc-name">{{ isDiscovered('monsters', m.name) ? m.name : '???' }}</span>
                  <span class="enc-category">{{ m.category }}</span>
                  <span class="enc-count" v-if="getDiscoveryCount('monsters', m.name) > 0">×{{ getDiscoveryCount('monsters', m.name) }}</span>
                </div>
                <p class="enc-lore" v-if="isDiscovered('monsters', m.name)">{{ m.lore }}</p>
                <p class="enc-lore hidden" v-else>尚未发现此怪物...</p>
              </div>
            </div>

            <!-- 材料图鉴 -->
            <div v-if="activeEncCategory === 'materials'" class="enc-list">
              <div v-for="mat in allMaterials" :key="mat.name" class="enc-item" :class="{ discovered: isDiscovered('materials', mat.name) }">
                <div class="enc-item-header">
                  <span class="enc-icon">{{ isDiscovered('materials', mat.name) ? '💎' : '❓' }}</span>
                  <span class="enc-name">{{ isDiscovered('materials', mat.name) ? mat.name : '???' }}</span>
                  <span class="enc-count" v-if="getDiscoveryCount('materials', mat.name) > 0">×{{ getDiscoveryCount('materials', mat.name) }}</span>
                </div>
                <p class="enc-lore" v-if="isDiscovered('materials', mat.name)">{{ mat.lore }}</p>
                <p class="enc-lore hidden" v-else>尚未发现此材料...</p>
              </div>
            </div>

            <!-- 鱼类图鉴 -->
            <div v-if="activeEncCategory === 'fishes'" class="enc-list">
              <div v-for="fish in allFishes" :key="fish.name" class="enc-item" :class="{ discovered: isDiscovered('fishes', fish.name) }">
                <div class="enc-item-header">
                  <span class="enc-icon">{{ isDiscovered('fishes', fish.name) ? '🐟' : '❓' }}</span>
                  <span class="enc-name">{{ isDiscovered('fishes', fish.name) ? fish.name : '???' }}</span>
                  <span class="enc-count" v-if="getDiscoveryCount('fishes', fish.name) > 0">×{{ getDiscoveryCount('fishes', fish.name) }}</span>
                </div>
                <p class="enc-lore" v-if="isDiscovered('fishes', fish.name)">{{ fish.lore }}</p>
                <p class="enc-lore hidden" v-else>尚未钓获此鱼...</p>
              </div>
            </div>

            <!-- 书籍图鉴 -->
            <div v-if="activeEncCategory === 'books'" class="enc-list">
              <div v-for="book in allBooks" :key="book.name" class="enc-item" :class="{ discovered: isDiscovered('books', book.name) }">
                <div class="enc-item-header">
                  <span class="enc-icon">{{ isDiscovered('books', book.name) ? '📖' : '❓' }}</span>
                  <span class="enc-name">{{ isDiscovered('books', book.name) ? book.name : '???' }}</span>
                  <span class="enc-count" v-if="getDiscoveryCount('books', book.name) > 0">×{{ getDiscoveryCount('books', book.name) }}</span>
                </div>
                <p class="enc-lore" v-if="isDiscovered('books', book.name)">{{ book.lore }}</p>
                <p class="enc-lore hidden" v-else>尚未发现此古籍...</p>
              </div>
            </div>
          </div>

          <!-- 存档面板 -->
          <div v-if="activeSettingsTab === 'save'" class="settings-content">
            <div class="save-actions">
              <button class="save-btn" @click="saveGame">
                <span class="save-icon">💾</span>
                <span>保存存档</span>
              </button>
              <button class="save-btn" @click="exportSave">
                <span class="save-icon">📤</span>
                <span>导出存档</span>
              </button>
              <button class="save-btn" @click="importSave">
                <span class="save-icon">📥</span>
                <span>导入存档</span>
              </button>
              <button class="save-btn danger" @click="resetGame">
                <span class="save-icon">🗑️</span>
                <span>重置游戏</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useGameStore } from '../stores/game.js'
import { TITLE_TABLE } from '../data/titles.js'
import { ENCYCLOPEDIA_DATA, getAllMonsters, getAllMaterials, getAllFishes, getAllBooks } from '../data/cyclopedia.js'
import Battle from './Battle.vue'
import Inventory from './Inventory.vue'
import Farm from './Farm.vue'
import Fishing from './Fishing.vue'
import Shop from './Shop.vue'
import Review from './Review.vue'
import Achievements from './Achievements.vue'
import { FORGE_RECIPES, canForge } from '../data/forge.js'
import { ACHIEVEMENTS } from '../data/achievements.js'
import { sfxClick, sfxStart, setSoundEnabled, isSoundEnabled } from '../utils/audio.js'
import { DUNGEON_ELEMENTS, ELEMENT_COUNTER } from '../data/farm.js'

const store = useGameStore()
const activePanel = ref(null)
const activeSettingsTab = ref('title')
const soundEnabled = ref(isSoundEnabled())
const activeEncCategory = ref('monsters')
const allTitles = TITLE_TABLE
const allMonsters = getAllMonsters()
const allMaterials = getAllMaterials()
const allFishes = getAllFishes()
const allBooks = getAllBooks()
const totalAchievements = ACHIEVEMENTS.length

const settingsTabs = [
  { key: 'title', label: '称号' },
  { key: 'save', label: '存档' }
]

const encyclopediaCategories = [
  { key: 'monsters', label: '怪物' },
  { key: 'materials', label: '材料' },
  { key: 'fishes', label: '鱼类' },
  { key: 'books', label: '古籍' }
]

function isDiscovered(type, id) {
  return store.isDiscovered(type, id)
}

function getDiscoveryCount(type, id) {
  return store.getDiscoveryCount(type, id)
}

function getEncProgress(type) {
  const progress = store.getCyclopediaProgress(type)
  return `${progress.found}/${progress.total}`
}

const panelTitle = computed(() => {
  const titles = {
    dungeon: '地牢探索',
    encyclopedia: '图鉴',
    inventory: '仓库',
    farm: '怪物农场',
    fishing: '钓鱼塘',
    study: '自习室',
    shop: '杂货铺',
    achievements: '成就殿堂',
    settings: '设置'
  }
  return titles[activePanel.value] || ''
})

const forgeRecipes = computed(() => FORGE_RECIPES)
const activeForgeCategory = ref('all')
const forgeCategories = [
  { key: 'all', label: '全部' },
  { key: 'weapon', label: '武器' },
  { key: 'armor', label: '防具' },
  { key: 'accessory', label: '饰品' },
  { key: 'potion', label: '药水' }
]
const filteredForgeRecipes = computed(() => {
  if (activeForgeCategory.value === 'all') return forgeRecipes.value
  return forgeRecipes.value.filter(r => r.type === activeForgeCategory.value)
})

function openPanel(panel) {
  sfxClick()
  activePanel.value = panel
  if (panel === 'settings') {
    activeSettingsTab.value = 'title'
  }
  // 首次进入游戏显示新手引导
  if (panel === 'dungeon' && store.firstVisit && store.gameStarted) {
    startTutorial()
  }
}

function closePanel() {
  sfxClick()
  // 只有从地牢面板退出时，才提示是否保存进度
  if (activePanel.value === 'dungeon' && store.dungeonPhase !== 'none') {
    const saveProgress = confirm('是否保存当前地牢进度？\n保存后可在下次继续探索。\n不保存则本层进度将丢失，重进会刷新。')
    if (saveProgress) {
      store.saveGame()
    } else {
      // 不保存：清空当前地牢进度
      store.dungeonPhase = 'none'
      store.roomGrid = []
      store.bossRoomIndex = -1
      store.currentRoomIndex = -1
      store.clearedRoomsThisFloor = 0
      store.inBattle = false
      store.enemy = null
      store.question = null
      store.battleState = ''
    }
  }
  activePanel.value = null
}

// 本层元素计算属性
const floorElementData = computed(() => {
  const el = store.currentFloorElement
  return DUNGEON_ELEMENTS[el] || DUNGEON_ELEMENTS.water
})
const floorElementColor = computed(() => floorElementData.value.color)
const floorElementName = computed(() => floorElementData.value.name)
const floorElementHint = computed(() => {
  const el = store.currentFloorElement
  const counters = ELEMENT_COUNTER[el] || []
  const counterNames = counters.map(k => DUNGEON_ELEMENTS[k]?.name || k).join('、')
  const weakTo = Object.entries(ELEMENT_COUNTER)
    .filter(([_, v]) => v.includes(el))
    .map(([k, _]) => DUNGEON_ELEMENTS[k]?.name || k)
    .join('、')
  return `${floorElementName.value}元素：克制 ${counterNames} | 被 ${weakTo} 克制`
})

// 新手引导
const showTutorialModal = ref(false)
const tutorialStep = ref(0)
const tutorialSteps = [
  { title: '欢迎来到生化易界！', text: '这是一个以高中化学、生物、易学知识为战斗核心的RPG地牢探险游戏。答对题目触发暴击，答错则受到反噬。' },
  { title: '地牢探索', text: '点击地牢探索进入战斗。每答对一题，知识攻击就会命中敌人。连续答对还能触发连击暴击！' },
  { title: '怪物农场', text: '击败怪物后，有机会收养它们作为宠物。宠物会提供攻击或防御加成，还能在元素克制上帮助你。' },
  { title: '锻造与商店', text: '收集材料在锻造店合成装备，或在杂货铺购买补给。好装备是深入高层地牢的关键。' },
  { title: '准备好了吗？', text: '出发吧，以知识为刃，斩破混沌迷雾！' }
]

function startTutorial() {
  showTutorialModal.value = true
  tutorialStep.value = 0
}

function nextTutorialStep() {
  if (tutorialStep.value < tutorialSteps.length - 1) {
    tutorialStep.value++
  } else {
    showTutorialModal.value = false
    store.firstVisit = false
    store.saveGame()
  }
}

function skipTutorial() {
  showTutorialModal.value = false
  store.firstVisit = false
  store.saveGame()
}

function onEnterDungeon() {
  sfxStart()
  store.enterDungeonPrep()
}

function onEnterRoom(index) {
  sfxClick()
  store.enterRoom(index)
}

function onNextFloor() {
  sfxClick()
  store.nextFloor()
}

// ===== 战前准备 - 装备与宠物选择 =====
const showEquipPicker = ref(false)
const equipPickerType = ref('weapon')
const showPetPicker = ref(false)

function openEquipPicker(type) {
  sfxClick()
  equipPickerType.value = type
  showEquipPicker.value = true
}

function pickEquip(item) {
  sfxClick()
  store.equip(item)
  showEquipPicker.value = false
}

function unequip(type) {
  sfxClick()
  if (type === 'weapon') store.equipped.weapon = null
  else if (type === 'armor') store.equipped.armor = null
  else if (type === 'accessory') store.equipped.accessory = null
}

function openPetPicker() {
  sfxClick()
  showPetPicker.value = true
}

function pickPet(idx) {
  sfxClick()
  store.setFollowMonster(idx)
  showPetPicker.value = false
}

function clearPet() {
  sfxClick()
  store.unfollowMonster()
  showPetPicker.value = false
}

function canForgeRecipe(recipe) {
  return canForge(recipe, store.inventory, store.gold)
}

function toggleSound() {
  soundEnabled.value = !soundEnabled.value
  setSoundEnabled(soundEnabled.value)
  sfxClick()
}

function saveGame() {
  store.saveGame()
  alert('存档已保存！')
}

function exportSave() {
  const saveData = localStorage.getItem('bioyi_realm_save')
  if (saveData) {
    navigator.clipboard.writeText(saveData)
    alert('存档已复制到剪贴板！')
  }
}

function importSave() {
  const data = prompt('请粘贴存档数据：')
  if (data) {
    try {
      JSON.parse(data)
      localStorage.setItem('bioyi_realm_save', data)
      store.loadGame()
      alert('存档已恢复！')
    } catch (e) {
      alert('存档数据无效！')
    }
  }
}

function resetGame() {
  if (confirm('确定要重置所有游戏数据吗？此操作不可恢复！')) {
    store.deleteSave()
    location.reload()
  }
}
</script>

<style scoped>
/* 新手引导 */
.tutorial-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 300;
  padding: 20px;
}

.tutorial-modal {
  background: #1a1a2e;
  border: 2px solid rgba(212, 168, 83, 0.4);
  border-radius: 20px;
  width: 100%;
  max-width: 420px;
  padding: 24px;
  animation: tutorial-pop 0.4s ease;
}

@keyframes tutorial-pop {
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.tutorial-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.tutorial-step {
  font-size: 13px;
  color: #d4a853;
  font-weight: bold;
}

.tutorial-skip {
  background: none;
  border: none;
  color: #888;
  font-size: 13px;
  cursor: pointer;
}

.tutorial-skip:hover {
  color: #e74c3c;
}

.tutorial-content {
  text-align: center;
  margin-bottom: 24px;
}

.tutorial-title {
  font-size: 20px;
  color: #e0e0e0;
  margin-bottom: 12px;
}

.tutorial-text {
  font-size: 14px;
  color: #a0a0a0;
  line-height: 1.6;
}

.tutorial-actions {
  display: flex;
  justify-content: center;
}

.tutorial-btn {
  padding: 12px 32px;
  background: linear-gradient(135deg, #d4a853, #e8c67a);
  color: #1a1a2e;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;
}

.tutorial-btn:hover {
  transform: scale(1.05);
}

/* 元素提示 */
.element-hint {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 12px 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.element-hint-title {
  font-size: 12px;
  color: #d4a853;
  margin-bottom: 4px;
  font-weight: bold;
}

.element-hint-text {
  font-size: 12px;
  color: #a0a0a0;
}

.floor-element-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 13px;
  color: #fff;
  font-weight: bold;
  margin: 8px 0;
}

/* 锻造店分类 */
.forge-tabs {
  display: flex;
  gap: 4px;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  overflow-x: auto;
}

.forge-tab-btn {
  padding: 6px 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #888;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
}

.forge-tab-btn.active {
  background: rgba(212, 168, 83, 0.15);
  border-color: rgba(212, 168, 83, 0.3);
  color: #d4a853;
}

.forge-empty {
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 14px;
}

.recipe-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.recipe-icon {
  font-size: 20px;
}

.recipe-type {
  font-size: 11px;
  color: #888;
  background: rgba(255, 255, 255, 0.05);
  padding: 2px 8px;
  border-radius: 4px;
  margin-left: auto;
}

.recipe-desc {
  font-size: 12px;
  color: #a0a0a0;
  margin-bottom: 8px;
}

.material-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  font-size: 12px;
  color: #e74c3c;
}

.material-tag.has-enough {
  color: #2ecc71;
  background: rgba(46, 204, 113, 0.1);
}

.mat-count {
  color: #888;
  font-size: 11px;
}

.btn-forge.can-forge {
  background: #e67e22;
}

#game-container {
  width: 100%;
  max-width: 480px;
  height: 100vh;
  height: 100dvh;
  background: #16213e;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

@media (min-width: 768px) {
  #game-container {
    max-width: 520px;
    height: 90vh;
    height: 90dvh;
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    border: 1px solid rgba(255,255,255,0.08);
  }
}

#status-bar {
  display: flex;
  gap: 8px;
  padding: 8px 12px;
  background: #0f3460;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  flex-shrink: 0;
}

.stat-box {
  flex: 1;
  min-width: 0;
}

.stat-title {
  font-size: 11px;
  color: #a0a0a0;
  margin-bottom: 2px;
}

.stat-value {
  font-size: 14px;
  font-weight: bold;
  color: #e0e0e0;
}

.stat-bar {
  height: 6px;
  background: rgba(255,255,255,0.1);
  border-radius: 3px;
  margin-top: 4px;
  position: relative;
  overflow: hidden;
}

.stat-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #d4a853, #f4d03f);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.stat-bar-fill.hp {
  background: linear-gradient(90deg, #2ecc71, #27ae60);
}

.stat-bar-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 9px;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
}

.stat-label {
  margin-top: 4px;
  color: #a0a0a0;
  font-size: 11px;
}

#main-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  -webkit-overflow-scrolling: touch;
}

.dashboard-header {
  text-align: center;
  margin-bottom: 20px;
}

.dashboard-header h2 {
  color: #d4a853;
  font-size: 24px;
  margin-bottom: 4px;
}

.dashboard-subtitle {
  color: #888;
  font-size: 13px;
}

/* 区域网格 */
.area-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.area-card {
  background: linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02));
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  padding: 20px 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.area-card:hover {
  transform: translateY(-4px);
  border-color: rgba(212, 168, 83, 0.4);
  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
}

.area-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #d4a853, #e8c67a);
  opacity: 0;
  transition: opacity 0.3s;
}

.area-card:hover::before {
  opacity: 1;
}

.area-icon {
  font-size: 36px;
  margin-bottom: 8px;
}

.area-name {
  font-size: 15px;
  font-weight: bold;
  color: #e0e0e0;
  margin-bottom: 4px;
}

.area-desc {
  font-size: 12px;
  color: #888;
}

.area-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #e74c3c;
  color: white;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: bold;
}

/* 各卡片颜色主题 */
.dungeon-card { border-top: 3px solid #e74c3c; }
.encyclopedia-card { border-top: 3px solid #e67e22; }
.inventory-card { border-top: 3px solid #3498db; }
.farm-card { border-top: 3px solid #2ecc71; }
.fishing-card { border-top: 3px solid #1abc9c; }
.study-card { border-top: 3px solid #9b59b6; }
.shop-card { border-top: 3px solid #f1c40f; }
.settings-card { border-top: 3px solid #95a5a6; }

/* 面板覆盖层 */
.panel-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #16213e;
  display: flex;
  flex-direction: column;
  z-index: 50;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #0f3460;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  flex-shrink: 0;
}

.btn-back {
  background: rgba(255,255,255,0.1);
  border: none;
  color: #d4a853;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-back:hover {
  background: rgba(212,168,83,0.2);
}

.panel-title {
  font-size: 16px;
  font-weight: bold;
  color: #e0e0e0;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

/* 地牢 */
.panel-dungeon .dungeon-intro {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding-top: 40px;
}

.dungeon-title {
  font-size: 22px;
  font-weight: bold;
  color: #d4a853;
}

.dungeon-desc {
  font-size: 14px;
  color: #888;
  text-align: center;
}

.explore-btn {
  padding: 14px 40px;
  font-size: 16px;
  font-weight: bold;
  color: #1a1a2e;
  background: linear-gradient(135deg, #d4a853, #e8c67a);
  border: none;
  border-radius: 28px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(212,168,83,0.4);
  transition: transform 0.2s;
}

.explore-btn:hover {
  transform: translateY(-2px);
}

/* 锻造 */
.panel-forge {
  padding: 20px;
}

.forge-placeholder {
  text-align: center;
}

.forge-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.forge-recipes {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
}

.recipe-card {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 16px;
  text-align: left;
}

.recipe-name {
  font-size: 16px;
  font-weight: bold;
  color: #e0e0e0;
  margin-bottom: 8px;
}

.recipe-materials {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 13px;
  color: #888;
}

.btn-forge {
  width: 100%;
  padding: 10px;
  background: #e67e22;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-forge:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-forge:hover:not(:disabled) {
  background: #d35400;
}

/* 自习室 */
.panel-study {
  padding: 20px;
}

.study-placeholder {
  text-align: center;
}

.study-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.study-stats {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin: 20px 0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-num {
  font-size: 24px;
  font-weight: bold;
  color: #d4a853;
}

.stat-label {
  font-size: 12px;
  color: #888;
}

.study-section {
  margin-top: 30px;
  padding: 20px;
  background: rgba(255,255,255,0.05);
  border-radius: 12px;
}

.study-section h4 {
  color: #e0e0e0;
  margin-bottom: 8px;
}

.study-hint {
  color: #888;
  font-size: 13px;
}

/* 设置 */
.panel-settings {
  padding: 0;
  position: relative;
}

.settings-tabs {
  display: flex;
  gap: 2px;
  padding: 8px 12px 0;
  background: #0f3460;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}

.settings-tab-btn {
  flex: 1;
  padding: 8px;
  background: transparent;
  border: none;
  border-radius: 8px 8px 0 0;
  color: #888;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.settings-tab-btn.active {
  background: rgba(212,168,83,0.15);
  color: #d4a853;
}

.settings-content {
  padding: 16px;
  overflow-y: auto;
  max-height: calc(100vh - 160px);
}

/* 称号卡片 */
.title-card {
  background: linear-gradient(135deg, rgba(212,168,83,0.1), rgba(212,168,83,0.02));
  border: 1px solid rgba(212,168,83,0.2);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
}

.title-header {
  text-align: center;
  margin-bottom: 16px;
}

.title-badge {
  display: inline-block;
  background: #d4a853;
  color: #1a1a2e;
  font-size: 12px;
  font-weight: bold;
  padding: 4px 12px;
  border-radius: 12px;
  margin-bottom: 8px;
}

.title-name {
  font-size: 22px;
  color: #e0e0e0;
  margin: 8px 0;
}

.title-field {
  font-size: 12px;
  color: #a0a0a0;
}

.title-bio {
  font-size: 13px;
  line-height: 1.6;
  color: #b0b0b0;
  margin-bottom: 16px;
  padding: 12px;
  background: rgba(255,255,255,0.05);
  border-radius: 8px;
}

.title-achievements h4 {
  color: #d4a853;
  margin-bottom: 12px;
  font-size: 14px;
}

.achievement-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  font-size: 13px;
  color: #c0c0c0;
}

.achievement-check {
  color: #2ecc71;
  font-weight: bold;
}

/* 称号进度 */
.title-progress h4 {
  color: #d4a853;
  margin-bottom: 12px;
  font-size: 14px;
}

.progress-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  margin-bottom: 4px;
  font-size: 13px;
  transition: all 0.2s;
}

.progress-item.current {
  background: rgba(212,168,83,0.15);
  border: 1px solid rgba(212,168,83,0.3);
}

.progress-item:not(.current) {
  opacity: 0.6;
}

.progress-level {
  color: #888;
  font-size: 11px;
  min-width: 50px;
}

.progress-name {
  flex: 1;
  color: #e0e0e0;
  font-weight: bold;
}

.progress-field {
  color: #888;
  font-size: 11px;
}

/* 存档 */
.save-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.save-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  color: #e0e0e0;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.save-btn:hover {
  background: rgba(212,168,83,0.1);
  border-color: rgba(212,168,83,0.3);
}

.save-btn.danger:hover {
  border-color: #e74c3c;
  background: rgba(231,76,60,0.1);
}

.save-icon {
  font-size: 24px;
}

/* 图鉴 */
.encyclopedia-tabs {
  display: flex;
  gap: 4px;
  padding-bottom: 12px;
  margin-bottom: 12px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  overflow-x: auto;
}

.enc-tab-btn {
  padding: 6px 12px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  color: #888;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
}

.enc-tab-btn.active {
  background: rgba(212,168,83,0.15);
  border-color: rgba(212,168,83,0.3);
  color: #d4a853;
}

.enc-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.enc-item {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  padding: 12px;
  transition: all 0.2s;
}

.enc-item.discovered {
  background: rgba(255,255,255,0.05);
  border-color: rgba(212,168,83,0.15);
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
  background: rgba(255,255,255,0.05);
  padding: 2px 8px;
  border-radius: 4px;
}

.enc-count {
  font-size: 11px;
  color: #d4a853;
  background: rgba(212,168,83,0.1);
  padding: 2px 8px;
  border-radius: 4px;
}

.enc-lore {
  font-size: 12px;
  line-height: 1.6;
  color: #a0a0a0;
  padding: 8px;
  background: rgba(0,0,0,0.2);
  border-radius: 8px;
}

.enc-lore.hidden {
  color: #666;
  font-style: italic;
}

/* 新发现通知 */
.discovery-notifications {
  position: fixed;
  top: 60px;
  right: 12px;
  z-index: 200;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
}

.discovery-notif {
  background: linear-gradient(135deg, #d4a853, #e8c67a);
  color: #1a1a2e;
  padding: 12px 16px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
  animation: notif-pop 0.3s ease;
  max-width: 220px;
}

.discovery-notif-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 4px;
}

.discovery-notif-text {
  font-size: 13px;
}

@keyframes notif-pop {
  0% { transform: translateX(100px); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
}
/* 地牢准备界面 */
.dungeon-prep {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.prep-header {
  text-align: center;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.prep-title {
  font-size: 18px;
  font-weight: bold;
  color: #d4a853;
  margin-bottom: 4px;
}

.prep-hint {
  font-size: 12px;
  color: #888;
}

.prep-preview {
  background: rgba(255,255,255,0.05);
  border-radius: 12px;
  padding: 16px;
}

.preview-title {
  font-size: 14px;
  color: #e0e0e0;
  margin-bottom: 12px;
  font-weight: bold;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.preview-card {
  background: rgba(255,255,255,0.08);
  border-radius: 8px;
  padding: 8px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 11px;
}

.preview-boss {
  border: 1px solid #e74c3c;
  background: rgba(231, 76, 60, 0.15);
}

.preview-icon {
  font-size: 18px;
}

.preview-name {
  color: #e0e0e0;
  font-weight: bold;
}

.preview-subject {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  color: #fff;
}

.preview-atk {
  color: #e74c3c;
  font-size: 11px;
}

.preview-more {
  grid-column: span 3;
  text-align: center;
  color: #666;
  font-size: 12px;
  padding: 4px;
}

.prep-config {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: rgba(255,255,255,0.05);
  border-radius: 12px;
  padding: 16px;
}

.config-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.config-title {
  font-size: 13px;
  color: #d4a853;
  font-weight: bold;
}

.config-slots {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.config-slot {
  background: rgba(255,255,255,0.08);
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  color: #e0e0e0;
  flex: 1;
  min-width: 100px;
  text-align: center;
}

.config-slot.empty {
  color: #666;
}

.config-pet {
  background: rgba(255,255,255,0.08);
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  color: #e0e0e0;
}

.config-pet .empty {
  color: #666;
}

.config-potions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.config-potion {
  background: rgba(255,255,255,0.08);
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  color: #e0e0e0;
}

.prep-actions {
  display: flex;
  justify-content: center;
}

.btn-enter-dungeon {
  padding: 12px 32px;
  font-size: 16px;
  background: #d4a853;
  color: #1a1a2e;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: bold;
  transition: transform 0.2s;
}

.btn-enter-dungeon:hover {
  transform: scale(1.05);
}

/* 可点击配置槽 */
.config-slot.clickable,
.config-pet.clickable {
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
}
.config-slot.clickable:hover,
.config-pet.clickable:hover {
  background: rgba(212, 168, 83, 0.15);
  transform: translateY(-1px);
}

.config-sub {
  font-size: 11px;
  color: #888;
  font-weight: normal;
  margin-left: 4px;
}

/* 战前准备 - 选择弹窗 */
.prep-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 20px;
}

.prep-modal {
  background: #1a1a2e;
  border: 1px solid rgba(212, 168, 83, 0.3);
  border-radius: 16px;
  width: 100%;
  max-width: 420px;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.prep-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.prep-modal-title {
  font-size: 16px;
  font-weight: bold;
  color: #d4a853;
}

.prep-modal-close {
  background: none;
  border: none;
  color: #888;
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
  line-height: 1;
}

.prep-modal-body {
  overflow-y: auto;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.prep-modal-empty {
  text-align: center;
  padding: 24px;
  color: #666;
  font-size: 14px;
}

.prep-modal-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
}

.prep-modal-item:hover {
  background: rgba(212, 168, 83, 0.12);
  transform: translateX(4px);
}

.prep-modal-item.active {
  background: rgba(212, 168, 83, 0.2);
  border: 1px solid rgba(212, 168, 83, 0.4);
}

.prep-modal-item.empty-item {
  opacity: 0.7;
}

.prep-modal-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.prep-modal-name {
  font-size: 14px;
  color: #e0e0e0;
  flex: 1;
}

.prep-modal-stat {
  font-size: 12px;
  color: #888;
  white-space: nowrap;
}

/* 房间网格 */
.dungeon-rooms {
  padding: 20px;
}

.rooms-header {
  text-align: center;
  margin-bottom: 16px;
}

.rooms-title {
  font-size: 18px;
  font-weight: bold;
  color: #d4a853;
  margin-bottom: 4px;
}

.rooms-progress {
  font-size: 13px;
  color: #888;
}

.rooms-achievement {
  font-size: 12px;
  color: #e74c3c;
  margin-top: 4px;
}

.rooms-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}

.room-card {
  background: rgba(255,255,255,0.08);
  border-radius: 12px;
  padding: 14px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  position: relative;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.room-card.clickable {
  cursor: pointer;
}

.room-card.clickable:hover {
  background: rgba(255,255,255,0.15);
  border-color: rgba(255,255,255,0.2);
  transform: translateY(-2px);
}

.room-card.cleared {
  background: rgba(46, 204, 113, 0.15);
  border-color: rgba(46, 204, 113, 0.3);
  opacity: 0.7;
}

.room-card.boss {
  background: rgba(231, 76, 60, 0.15);
  border-color: rgba(231, 76, 60, 0.3);
}

.room-card.boss.clickable:hover {
  background: rgba(231, 76, 60, 0.25);
  border-color: rgba(231, 76, 60, 0.5);
}

.room-number {
  position: absolute;
  top: 4px;
  left: 8px;
  font-size: 11px;
  color: #666;
}

.room-icon {
  font-size: 28px;
  margin-top: 4px;
}

.room-name {
  font-size: 12px;
  font-weight: bold;
  color: #e0e0e0;
  text-align: center;
}

.room-subject {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  color: #fff;
}

.room-stats {
  font-size: 11px;
  color: #888;
}

.room-cleared {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: #2ecc71;
  font-size: 12px;
}

.cleared-icon {
  font-size: 24px;
}

.room-boss-tag {
  position: absolute;
  top: 4px;
  right: 6px;
  font-size: 9px;
  background: #e74c3c;
  color: #fff;
  padding: 2px 5px;
  border-radius: 4px;
  font-weight: bold;
}

.rooms-actions {
  display: flex;
  justify-content: center;
}

.btn-next-floor {
  padding: 12px 24px;
  font-size: 14px;
  background: #444;
  color: #ccc;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s;
}

.btn-next-floor:hover {
  background: #555;
}

.btn-next-floor.all-clear {
  background: linear-gradient(135deg, #d4a853, #e8c67a);
  color: #1a1a2e;
  animation: pulse-gold 1.5s infinite;
}

@keyframes pulse-gold {
  0%, 100% { box-shadow: 0 0 0 0 rgba(212, 168, 83, 0.4); }
  50% { box-shadow: 0 0 0 12px rgba(212, 168, 83, 0); }
}

/* 地牢入口统计 */
.dungeon-stats-hint {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin: 12px 0;
  font-size: 13px;
  color: #ccc;
}

</style>
