# PRD：PVP 对战 + 称号系统 + 排行榜

> **项目**: 生化易界（Bio-Chem-Yi Realm）  
> **版本**: v1.0  
> **日期**: 2026-06-04  
> **作者**: 产品经理 — 许清楚  
> **技术栈**: Vue3 + Vite + Pinia + Firebase SDK（Spark 计划）  
> **约束**: 纯前端，无后端服务器，GitHub Pages 部署

---

## 1. 产品目标

为「生化易界」引入异步幽灵对战、本地双人对战、称号成就系统与全球排行榜四大模块，以社交裂变（凭证分享）和竞争驱动（排行榜/对战）提升玩家留存与传播，同时用华丽的称号系统强化成长反馈。

---

## 2. 用户故事

1. **As a** 已通关 15 层的玩家，**I want** 生成一串短编码分享给我的同学，**so that** 他们可以挑战我的"幽灵"并体验我的战斗强度。
2. **As a** 课堂上的学生，**I want** 在同一台设备上和朋友进行 1v1 答题对战，**so that** 课堂学习变成有趣的竞技活动。
3. **As a** 追求成就感的玩家，**I want** 在通关特定楼层后获得稀有称号并展示全屏特效，**so that** 我的成长获得视觉化、可炫耀的反馈。
4. **As a** 竞争型玩家，**I want** 在全球排行榜上看到自己的排名和称号，**so that** 我有持续冲层、冲等级的动力。
5. **As a** 回归玩家，**I want** 每周重置的周排行榜给我重新竞争的机会，**so that** 即使之前落后也能在新周期内追上。

---

## 3. 需求池

### P0 — Must Have（核心功能，必须完成）

| # | 需求 | 所属子系统 | 验收标准 |
|---|------|-----------|---------|
| P0-1 | 玩家数据 → 压缩凭证编码 | A | 编码长度 ≤ 200 字符（Base64+JSON 压缩后），包含层数/称号/专精/等级/核心属性/技能/宠物/统计摘要 |
| P0-2 | 凭证解码 + AI 幽灵构建 | A | 输入凭证后成功还原玩家属性，AI 按对方历史正确率模拟答题行为（正确率 60%→AI 每题 60% 概率答对） |
| P0-3 | 异步幽灵对战核心循环 | A | 玩家 vs 幽灵轮流答题，胜利后发放金币+经验奖励，失败只扣时间无惩罚 |
| P0-4 | 称号数据结构 + 解锁判定 | C | 定义称号表（含解锁条件、增益效果、稀有度），通关/连击/捕捉事件触发解锁检查 |
| P0-5 | 称号切换 + 增益生效 | C | 玩家在称号面板自由切换已解锁称号，增益实时应用到战斗属性 |
| P0-6 | Firebase Realtime Database 接入 | C | 配置 Firebase 项目，实现分数上传与读取，数据结构符合排行榜需求 |
| P0-7 | 全球排行榜 UI（前 50 名） | C | 展示最高楼层/最高等级/最多捕捉三条榜单，高亮当前玩家，显示称号 |
| P0-8 | 本地双人对战核心循环 | B | 同设备 P1 vs P2 轮流答题，答对攻击对方，答错对方反击，有基础血条和胜负判定 |
| P0-9 | 双人对战预设角色 + 存档导入 | B | 提供 3 组预设角色（低/中/高属性），支持导入玩家 A 的存档作为角色 |

### P1 — Should Have（重要功能，建议完成）

| # | 需求 | 所属子系统 | 验收标准 |
|---|------|-----------|---------|
| P1-1 | 称号展示特效系统 | C | 称号获得时播放全屏特效（CSS animation），称号 UI 有金色边框/动态背景/稀有度颜色区分 |
| P1-2 | 周排行榜（每周重置） | C | 周一 00:00 UTC 自动重置，使用 Firebase 中按周分片存储 |
| P1-3 | 连击机制（双人对战） | B | 连续答对伤害递增（每次 +25%，上限 3 连后维持），UI 显示连击计数 |
| P1-4 | 异步对战结果展示 | A | 结算界面展示双方称号（大字体+稀有度颜色）、伤害统计、战斗日志摘要 |
| P1-5 | 排行榜分数上传时附带称号 | C | `leaderboardEntry` 包含 `displayTitle` 字段，读取时渲染 |
| P1-6 | 凭证二维码生成与扫描 | A | 使用 `qrcode` 库生成 canvas 二维码，支持移动端扫描识别（依赖设备摄像头能力） |

### P2 — Nice to Have（锦上添花）

| # | 需求 | 所属子系统 | 验收标准 |
|---|------|-----------|---------|
| P2-1 | 称号碎片合成系统 | A/C | 异步对战胜利掉落称号碎片，集齐碎片可合成限定称号 |
| P2-2 | 双人对战伤害统计与回放 | B | 结算页展示双方伤害曲线图、答对率、连击峰值 |
| P2-3 | 排行榜头像/徽章 | C | 前三名有金银铜皇冠图标，玩家可自选已解锁称号作为徽章展示 |
| P2-4 | 异步对战防守日志 | A | 记录谁挑战过我的幽灵、胜负结果，本地存储最近 20 条 |
| P2-5 | 排行榜防刷机制 | C | 同一设备/同一存档哈希 1 小时内只计最高分一次 |

---

## 4. UI 设计描述

### 4.1 全局新增入口

在主界面（`GameContainer.vue` 底部导航栏）新增两个入口：
- **对战**（交叉剑图标）— 展开子菜单：「幽灵对战」/「本地对战」
- **排行榜**（奖杯图标）— 直接打开排行榜面板

称号入口整合进角色面板（`CharacterPanel.vue`），在等级/属性下方新增「称号」按钮。

### 4.2 子系统 A：异步幽灵对战

#### 流程图

```
[对战大厅]
    ├─ 「生成我的凭证」按钮 → 弹出模态框展示编码 + 复制按钮 + 二维码
    └─ 「输入对方凭证」输入框 + 「挑战」按钮

[对战准备界面]
    ├─ 左侧：我方角色面板（属性、宠物、当前称号）
    ├─ 右侧：敌方幽灵面板（层数、称号大字体展示、专精、等级）
    │           ↑ 敌方称号必须使用 P1-1 的特效样式，醒目展示
    └─ 底部：「开始挑战」按钮

[对战战斗界面]
    ├─ 复用现有 Battle.vue 布局
    ├─ 敌方血条旁显示其称号（金色边框标签）
    ├─ 题目区上方显示当前连击数
    └─ 敌方行动时显示「幽灵正在思考...」动画（1~2 秒延迟模拟答题）

[结算界面]
    ├─ 胜/负大标题 + 全屏特效（胜利金色/失败灰色）
    ├─ 双方对比卡片：称号（大字体）、层数、等级、造成伤害
    ├─ 奖励区：获得金币 / 经验 / 称号碎片
    └─ 「再挑战一次」/「返回大厅」按钮
```

#### 幽灵 AI 行为设计

- 每题开始时，延迟 `800ms + random(0, 1200ms)` 模拟"思考"
- 答题正确率 = 凭证中记录的 `stats.totalCorrect / (stats.totalCorrect + stats.totalWrong)`， clamp 在 `[0.3, 0.95]`
- 幽灵使用其原玩家的属性计算伤害，但**不触发连击重置机制**（简化 AI）

### 4.3 子系统 B：本地双人对战

#### 流程图

```
[本地对战大厅]
    ├─ 模式选择：「快速开始（预设角色）」/「导入存档对战」
    └─ 楼层选择：滑动条 1~30（决定题库难度）

[角色配置界面]
    ├─ Player 1 区：选择预设角色 或 导入存档
    ├─ VS 大字动画
    ├─ Player 2 区：同上
    └─ 「开始对战」按钮

[对战界面]
    ├─ 顶部：P1 血条（左） vs P2 血条（右），血条颜色区分（蓝/红）
    ├─ 中部：当前回合玩家标识（高亮边框 + "轮到 P1" 提示）
    ├─ 题目区：同层题库随机抽题，显示学科标签
    ├─ 选项区：4 个选项按钮
    ├─ 连击区：当前玩家连续答对计数，≥2 时显示火焰特效
    └─ 底部：双方称号展示（小标签）

[结算界面]
    ├─ 获胜方大头像 + 称号特效
    ├─ 统计表格：
    │   ├─ 总答题数 / 正确数 / 正确率
    │   ├─ 最高连击
    │   ├─ 总造成伤害
    │   └─ 使用称号
    └─ 「再来一局」/「返回大厅」
```

#### 双人对战伤害规则

- 基础伤害 = `atk * 1.5 - 对方 def * 0.5`，保底为 `atk * 0.3`
- 连击加成：第 1 题 ×1.0，第 2 题 ×1.25，第 3 题起 ×1.5
- 答错时对方**立即反击**，伤害 = `对方 atk * 0.8 - 我方 def * 0.5`

### 4.4 子系统 C：称号系统

#### 称号分类与示例

| 类型 | 示例称号 | 解锁条件 | 增益效果 |
|------|---------|---------|---------|
| 楼层成就 | 初出茅庐 | 通关第 5 层 | 攻击 +2 |
| 楼层成就 | 深渊行者 | 通关第 20 层 | 攻击 +5，防御 +3 |
| 楼层成就 | 深渊征服者 | 通关第 30 层 | 全属性 +5% |
| 连击成就 | 连环快打 | 单场连击达到 5 | 连击伤害额外 +10% |
| 连击成就 | 无双学者 | 单场连击达到 10 | 连击伤害额外 +20% |
| 收集成就 | 怪物收藏家 | 捕捉 10 种不同怪物 | 宠物属性加成 +15% |
| 收集成就 | 传说驯兽师 | 捕捉 3 只传说怪物 | 宠物属性加成 +30% |
| 特殊成就 | 百战百胜 | 累计胜利 100 场 | 经验获取 +10% |

#### 称号面板 UI

```
[称号面板 — 标签页：全部 | 已解锁 | 未解锁]
    ├─ 当前装备称号区（顶部大图 + 特效预览）
    │   └─ 「卸下称号」按钮
    ├─ 称号网格列表：
    │   ├─ 每个称号卡片：图标 + 名称 + 稀有度边框（铜/银/金/彩虹）
    │   ├─ 已解锁：可点击，点击后弹出详情 + 「装备」按钮
    │   ├─ 未解锁：灰色遮罩，显示解锁条件进度（如 3/10）
    │   └─ 新获得：右上角「NEW」角标，首次打开面板播放获得特效
    └─ 称号详情弹窗：
        ├─ 称号名称（大字体 + 特效）
        ├─ 称号描述
        ├─ 解锁条件（进度条）
        └─ 增益效果说明
```

#### 称号稀有度视觉规范

| 稀有度 | 边框颜色 | 背景特效 | 字体特效 |
|--------|---------|---------|---------|
| 普通 | 灰色 #9E9E9E | 无 | 白色 |
| 稀有 | 蓝色 #2196F3 | 微光脉冲 | 蓝色微光 |
| 史诗 | 紫色 #9C27B0 | 粒子环绕 | 紫色渐变 |
| 传说 | 金色 #FFD700 | 金色边框流动 + 全屏闪 | 金色描边 + 阴影 |

### 4.5 子系统 C：Firebase 排行榜

#### 排行榜 UI

```
[排行榜面板 — 标签页：全球榜 | 周榜]
    ├─ 子标签：最高楼层 | 最高等级 | 最多捕捉
    ├─ 前三名特殊展示：
    │   ├─ 第1名：大金冠 + 全宽卡片 + 玩家称号特效
    │   ├─ 第2名：银冠 + 全宽卡片
    │   └─ 第3名：铜冠 + 全宽卡片
    ├─ 第4~50名：紧凑列表行
    │   ├─ 排名数字
    │   ├─ 玩家称号（彩色标签）
    │   ├─ 玩家名（匿名或自定义）
    │   └─ 分数值（楼层/等级/捕捉数）
    ├─ 底部分隔线 + 「我的排名」区（高亮背景）
    │   └─ 若未上榜：显示「未进入前 50，当前第 N 名」
    └─ 「上传我的分数」按钮（检测是否有新纪录需要上传）
```

---

## 5. 数据结构设计

### 5.1 凭证编码格式（子系统 A）

编码流程：**玩家数据对象 → JSON.stringify → pako.deflate（zlib）→ Base64URL**

```typescript
// 原始数据对象（编码前）
interface GhostCredentialRaw {
  v: number;        // 版本号，当前为 1
  f: number;        // 最高楼层 (floor)
  l: number;        // 等级 (level)
  s: string;        // 专精 (spec: 'chem'|'bio'|'yi'|'biochem'|'all')
  t: string;        // 当前装备称号 ID（若无不传）
  a: number;        // 攻击 (atk)
  d: number;        // 防御 (def)
  h: number;        // 最大生命 (maxHp)
  sk: string[];     // 已解锁专精技能 effect 列表
  p?: {             // 宠物摘要（若携带）
    n: string;      // 宠物名
    e: string;      // 元素
    a: number;      // 宠物攻击
    d: number;      // 宠物防御
    h: number;      // 宠物生命
  };
  eq?: {            // 装备摘要
    w?: number;     // 武器攻击加成
    ar?: number;    // 防具防御加成
    ac?: number;    // 饰品攻击/防御加成
  };
  st: {             // 统计摘要（用于 AI 正确率）
    c: number;      // 总答对数 (totalCorrect)
    w: number;      // 总答错数 (totalWrong)
  };
  ts: number;       // 生成时间戳（用于防篡改/过期检测，可选）
}

// 编码示例
const json = JSON.stringify(raw);
const compressed = pako.deflate(json, { level: 9 });
const token = btoa(String.fromCharCode(...compressed))
  .replace(/\+/g, '-')
  .replace(/\//g, '_')
  .replace(/=/g, '');
```

**预期长度**：典型玩家数据压缩后约 80~150 字符。

解码时做版本兼容检查：`v` 字段不匹配则提示"凭证版本过旧，请重新生成"。

### 5.2 称号数据结构（子系统 C）

```typescript
// src/data/heroTitles.js

export const HERO_TITLES = [
  {
    id: 'floor_5',
    name: '初出茅庐',
    category: 'floor',        // 'floor' | 'combo' | 'collection' | 'battle' | 'special'
    rarity: 'common',         // 'common' | 'rare' | 'epic' | 'legendary'
    unlockCondition: {
      type: 'maxFloor',
      value: 5
    },
    bonus: {
      atk: 2
    },
    description: '成功突破第 5 层的证明，知识之路刚刚开始。'
  },
  {
    id: 'floor_30',
    name: '深渊征服者',
    category: 'floor',
    rarity: 'legendary',
    unlockCondition: {
      type: 'maxFloor',
      value: 30
    },
    bonus: {
      atkPercent: 0.05,
      defPercent: 0.05,
      hpPercent: 0.05
    },
    description: '通关第 30 层的至高荣誉，你已俯瞰深渊。'
  },
  {
    id: 'combo_5',
    name: '连环快打',
    category: 'combo',
    rarity: 'rare',
    unlockCondition: {
      type: 'maxComboInBattle',
      value: 5
    },
    bonus: {
      comboDamagePercent: 0.10
    },
    description: '单场战斗连击达到 5 次，答题如行云流水。'
  },
  {
    id: 'catch_10_unique',
    name: '怪物收藏家',
    category: 'collection',
    rarity: 'epic',
    unlockCondition: {
      type: 'uniqueMonstersCaught',
      value: 10
    },
    bonus: {
      petBonusPercent: 0.15
    },
    description: '已捕捉 10 种不同的怪物，你的农场欣欣向荣。'
  },
  {
    id: 'win_100',
    name: '百战百胜',
    category: 'battle',
    rarity: 'epic',
    unlockCondition: {
      type: 'totalWins',
      value: 100
    },
    bonus: {
      expPercent: 0.10
    },
    description: '累计获得 100 场战斗胜利，身经百战。'
  }
];

// 玩家端的称号存储（存入 Pinia + localStorage）
interface PlayerTitleState {
  unlocked: string[];       // 已解锁称号 ID 列表
  equipped: string | null;  // 当前装备称号 ID
  newUnlocks: string[];     // 本次会话新解锁（用于 NEW 角标提示）
}
```

**增益生效规则**：
- `atk` / `def` / `hp`：绝对值加成，直接加到基础属性
- `atkPercent` / `defPercent` / `hpPercent`：百分比加成，在战斗时计算 `base * (1 + percent)`
- `comboDamagePercent`：连击伤害额外加成，乘在现有连击倍率上
- `petBonusPercent`：宠物提供的属性加成比例提升
- `expPercent`：战斗胜利后经验获取比例提升

称号增益在 `totalAtk` / `totalDef` computed 中合并计算。

### 5.3 排行榜数据结构（子系统 C）

```typescript
// Firebase Realtime Database 路径设计
// 项目: bio-yi-realm-leaderboard (Spark 计划)

{
  "global": {
    "maxFloor": {
      "entries": {
        "<pushId>": {
          "n": "玩家自定义名",      // name
          "f": 25,                  // floor
          "l": 32,                  // level
          "t": "深渊行者",          // displayTitle（当前装备称号）
          "ts": 1717440000000       // timestamp
        }
      }
    },
    "maxLevel": { /* 同上结构，按 level 排序 */ },
    "mostCaptures": { /* 同上结构，按 captures 排序 */ }
  },
  "weekly": {
    "2026-W23": {   // 使用 ISO 周格式 YYYY-Www
      "maxFloor": { /* 同 global 结构 */ },
      "maxLevel": { /* 同上 */ },
      "mostCaptures": { /* 同上 */ }
    }
  }
}
```

**上传规则**：
- 上传时读取本地 `stats.maxFloor`、`level`、`farm.length`（捕捉数）
- 每条榜单独立上传，可上传多条记录
- 同一玩家（按 `localStorage` 中生成的 `playerId` UUID 识别）同一榜单只保留最高分记录
- 使用 Firebase `push()` 写入，`onValue()` 实时监听前 50 条

**客户端查询逻辑**：
```javascript
import { getDatabase, ref, query, orderByChild, limitToLast } from 'firebase/database';

const db = getDatabase(app);
const weeklyPath = `weekly/${getCurrentISOWeek()}/maxFloor/entries`;
const entriesQuery = query(ref(db, weeklyPath), orderByChild('f'), limitToLast(50));
// 读取后客户端按 f 降序排列
```

**玩家匿名标识**：
- 首次上传时生成 `playerId`（UUID v4）存入 localStorage
- 允许玩家输入自定义昵称（默认"匿名学者"），昵称也存 localStorage
- 排行榜展示时优先显示自定义昵称，无则显示 `playerId` 前 6 位

### 5.4 本地双人对战数据结构（子系统 B）

```typescript
interface LocalPvPState {
  mode: 'quick' | 'import';     // 快速预设 / 导入存档
  floor: number;                // 选择的楼层（1~30）
  player1: PvPPlayer;
  player2: PvPPlayer;
  currentTurn: 1 | 2;
  battleLog: string[];
  status: 'setup' | 'fighting' | 'finished';
}

interface PvPPlayer {
  name: string;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  title: string;           // 称号
  titleRarity: string;     // 称号稀有度（用于UI颜色）
  combo: number;           // 当前连击数
  totalDamage: number;     // 累计造成伤害
  correctCount: number;
  wrongCount: number;
  // 导入模式时从存档映射
  imported?: boolean;
}

// 预设角色表
const PRESET_CHARACTERS = [
  { name: '见习生', level: 1, hp: 100, atk: 10, def: 5, title: '菜鸟学徒' },
  { name: '资深学者', level: 15, hp: 300, atk: 35, def: 18, title: '沈括' },
  { name: '传说大师', level: 30, hp: 800, atk: 80, def: 45, title: '竺可桢' }
];
```

---

## 6. 模块划分与组件建议

| 组件/模块 | 路径建议 | 说明 |
|----------|---------|------|
| 对战大厅 | `src/components/PvPLobby.vue` | 入口，包含子系统 A/B 的导航 |
| 凭证管理器 | `src/composables/useGhostCredential.js` | 编码/解码/二维码逻辑 |
| 幽灵对战面板 | `src/components/GhostBattle.vue` | 子系统 A 战斗 UI |
| 幽灵 AI | `src/utils/ghostAI.js` | AI 答题决策、延迟模拟 |
| 本地对战面板 | `src/components/LocalPvP.vue` | 子系统 B 完整对战 UI |
| 称号系统数据 | `src/data/heroTitles.js` | 称号表定义 |
| 称号管理器 | `src/composables/useTitleSystem.js` | 解锁检查、增益计算、切换逻辑 |
| 称号面板 | `src/components/TitlePanel.vue` | 称号列表、详情、装备 UI |
| Firebase 配置 | `src/firebase/config.js` | SDK 初始化、数据库引用 |
| 排行榜管理器 | `src/composables/useLeaderboard.js` | 上传/查询/周计算逻辑 |
| 排行榜面板 | `src/components/Leaderboard.vue` | 排行榜 UI |

---

## 7. 待确认问题

1. **凭证安全/作弊**：幽灵对战的凭证本质上是客户端生成，技术上可被篡改。是否需要加入简单的校验和（如 HMAC-SHA256 用硬编码密钥）？还是明确"休闲对战，不作防作弊"？
2. **Firebase 配额**：Spark 计划免费额度为 100 并发连接、1GB 存储。预估日活用户量？若超出需考虑数据清理策略（如只保留最近 4 周周榜数据）。
3. **称号与现有等级称号的关系**：现有 `titles.js` 是等级解锁的「头衔」（张衡→华佗→...），本次新增的是「称号」（初出茅庐→深渊征服者...）。UI 上是否需要区分「头衔」和「称号」两个概念？还是将新称号系统称为「荣耀称号」以避免混淆？
4. **双人对战题库范围**：双人对战使用同层题库，但两名玩家可能专精不同（如 P1 化学、P2 生物）。是否强制使用 `all` 混合题库？还是允许出题时按当前答题者的专精出对应学科题？
5. **二维码依赖**：P1-6 的二维码功能在纯网页端依赖设备摄像头，若用户无摄像头或浏览器限制则回退到手动输入。是否将二维码降级为 P2？

---

## 8. 技术风险与依赖

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| Firebase 在部分网络环境下不可用 | 排行榜功能失效 | 排行榜 UI 做空状态处理，显示「排行榜暂不可用，请稍后重试」；核心对战功能不依赖 Firebase |
| pako 库增加包体积 | 首屏加载变慢 | pako 仅用于对战模块，建议动态 import（`import('pako')`），按需加载 |
| 凭证编码过长（>200 字符） | 分享不便，二维码密度过高 | 精简数据结构字段名（单字母）、剔除默认值、优先使用数值而非字符串 |

---

*本 PRD 为 v1.0 草案，待与开发团队确认待确认问题后进入详细设计阶段。*
