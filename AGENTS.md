# 生化易界 — Agent 开发指南

> 本文件面向后续接手的 AI / 开发者，记录项目全貌、当前进度、技术决策和待办事项。

---

## 1. 项目概述

- **名称**：生化易界 · 肉鸽冒险
- **类型**：高中化学 / 生物 / 易学知识为核心的 Roguelike 地牢 RPG
- **技术栈**：uni-app（Vue3 + Vite + Pinia）
- **目标平台**：H5（GitHub Pages）、微信小程序、未来 App
- **仓库**：`git@github.com:MrZMrsL/bio-yi-realm.git`
- **本地路径**：`D:/我的超级龙虾_ARCHIVE_2026-06-20/games/生化易界-uniapp`
  - 历史旧 Vue 版本保留在同级目录 `生化易界-vue`（已锁定，暂无法删除/重命名）
  - 旧版本备份：`生化易界-vue-backup-2026-06-23`

---

## 2. 核心架构

### 2.1 目录结构

```
src/
  components/          # Vue 组件
    battle/            # 战斗相关组件
    dungeon/           # 地牢房间/准备组件
    farm/              # 怪物农场组件
    fishing/           # 钓鱼组件
    game/              # 通用游戏面板组件
    leaderboard/       # 排行榜组件
    pvp/               # PVP 组件
    review/            # 自习室/错题本组件
    Achievements.vue
    Battle.vue
    CharacterSelect.vue
    CharacterPanel.vue
    DialogModal.vue
    DungeonPanel.vue
    Farm.vue
    Fishing.vue
    GameContainer.vue
    Inventory.vue
    Leaderboard.vue
    MainDashboard.vue
    PvpBattle.vue
    Review.vue
    Shop.vue
    SkillTree.vue
    StatusBar.vue
    TitleDisplay.vue
    TitleScreen.vue
    ToastContainer.vue
    TutorialModal.vue
  composables/         # 组合式逻辑
  config/              # 游戏平衡配置
  data/                # 静态数据（题库、敌人、道具、引导等）
  pages/               # uni-app 页面入口
  platform/            # 跨平台适配层（H5 / 小程序）
  services/            # 存档服务
  stores/              # Pinia 状态管理
    game/              # gameStore 协调器
  styles/              # 全局样式
  utils/               # 工具函数
tests/                 # 测试
  components/          # 组件测试
  e2e/                 # Playwright E2E 测试
  stores/              # Store 单元测试
  setup.js             # 测试全局 mock
scripts/               # 辅助脚本
dist/                  # 构建输出（被 .gitignore 忽略）
```

### 2.2 Store 分层

- `gameStore`：全局 facade，聚合所有子 store，负责导航、存档/读档/重置
- `playerStore`：玩家属性、等级、金币、经验、专精
- `battleStore`：战斗状态、题目、连击、道具卡效果
- `dungeonStore`：地牢层数、房间、Boss
- `equipmentStore`：装备、材料、道具卡背包
- `farmStore`：宠物/怪物农场
- `fishingStore`：钓鱼
- `cyclopediaStore`：图鉴
- `weeklyBossStore`：周常 Boss
- `pvpStore`：PVP
- `reviewStore`：错题本/自习室
- `logStore`：战斗日志
- **guideStore**：新手引导状态（新增）

### 2.3 跨平台适配层（`src/platform/`）

- `env.js`：平台判断（H5 / 小程序 / App）
- `storage.js`：H5 `localStorage` ↔ 小程序 `uni.storage`
- `audio.js`：H5 Web Audio API ↔ 小程序静音占位
- `link.js`：H5 `window.open` ↔ 小程序剪贴板

---

## 3. 最近完成的大改动

### 3.1 战斗道具卡系统（已完成）

- 数据：`src/data/battleCards.ts` 定义 3 张卡
  - 提示卡：排除一个错误选项
  - 护盾卡：答错不扣血
  - 暴击卡：答对 2 倍伤害
- 背包：`equipmentStore.battleCards` 管理库存
- 战斗效果：`battleStore.activeCardEffects` 集成
- 掉落：战斗胜利概率掉落
- 商店：新增道具卡分页
- UI：`BattleActionPanel.vue` 增加道具卡按钮与效果显示

### 3.2 H5 输入框无法聚焦问题（已修复）

- 根因：uni-app H5 把 `<input>` 渲染成 `<uni-input>`，内部真实 input 高度为 0，点击无法聚焦
- 修复：`TitleScreen.vue` 中增加 H5 专用穿透样式 `:deep(.name-input) .uni-input-input { height: 100%; ... }`
- 验证：Edge 无头浏览器自动化测试通过

### 3.3 自动化测试

- 单元测试：`npm run test:run`（Vitest + jsdom + @vue/test-utils）
  - TitleScreen 组件测试
  - battleCards Store 测试
  - guideStore 测试
  - TutorialModal 组件测试
- 真实浏览器测试：`npm run test:input-focus`
  - 使用系统已安装的 Edge + puppeteer-core
  - 验证 H5 输入框可点击、可聚焦、可输入
- Playwright E2E：`npm run test:e2e`
  - 已配置，但需本地安装 Chromium：`npx playwright install chromium`

### 3.4 新手引导系统（已完成）

- 数据：`src/data/guideSteps.ts` 定义 7 个核心循环步骤
- 状态：`src/stores/guideStore.ts` 管理展示队列、完成状态、存档序列化
- UI：`TutorialModal.vue` 弹窗对话框
- 触发点：
  - 起完名字开始游戏 → 欢迎
  - 进入 CharacterSelect → 选择专精
  - 进入 GameContainer → 主界面介绍
  - 第一次打开地牢 → 地牢探索规则
  - 第一场战斗 → 答题战斗 + 道具卡
  - 首次退出地牢回主界面 → 养成系统
- 引导进度随存档保存，不会重复触发

### 3.5 仓库迁移与推送

- 旧 Vue 版本备份：`生化易界-vue-backup-2026-06-23`
- uni-app 版本已初始化为 Git 仓库并强制推送到 `MrZMrsL/bio-yi-realm.git` 的 `master` 分支
- 后续开发在 `生化易界-uniapp` 目录进行

---

## 4. 常用命令

```bash
# 进入项目
cd "D:/我的超级龙虾_ARCHIVE_2026-06-20/games/生化易界-uniapp"

# 安装依赖（已安装）
npm install

# H5 开发
npm run dev:h5

# H5 构建
npm run build:h5

# 微信小程序构建
npm run build:mp-weixin

# 单元测试
npm run test:run

# H5 输入框聚焦测试（Edge 无头）
npm run test:input-focus

# Playwright E2E（需先安装浏览器）
npx playwright install chromium
npm run test:e2e
```

---

## 5. 当前状态

### 已稳定功能

- [x] 登录/起名/存档
- [x] 专精选择
- [x] 主界面 dashboard
- [x] 地牢探索（房间、Boss、多层）
- [x] 答题战斗（连击、暴击、限时）
- [x] 战斗道具卡（提示/护盾/暴击）
- [x] 怪物农场
- [x] 钓鱼
- [x] 锻造
- [x] 商店
- [x] 背包/装备
- [x] 图鉴
- [x] 成就系统
- [x] 排行榜（本地 / Supabase）
- [x] PVP
- [x] 周常 Boss
- [x] 自习室/错题本
- [x] 新手引导
- [x] 跨平台 H5/小程序适配层
- [x] 自动化测试（单元 + Edge 无头）
- [x] 每日签到系统（7 天周期、连击、断签重置、灵气货币）

### 已知问题

- `生化易界-vue` 旧目录被系统占用，暂时无法删除或重命名；`生化易界-uniapp` 也无法重命名为 `生化易界-vue`
- Playwright 浏览器未在环境内安装，完整 E2E 需本地执行 `npx playwright install chromium`
- Store 间存在循环依赖警告（不影响构建和运行）
- 构建时有 `encyclopedia.ts` 动态+静态导入的警告（不影响功能）

---

## 6. 下一步待办（按优先级）

### 高优先级

1. ~~**每日签到系统**~~（已完成）
   - 签到日历 UI
   - 连续签到奖励递增
   - 奖励：金币、灵气、道具卡、随机材料
   - 断签处理策略

2. **音效与音乐**
   - 战斗音效（攻击、受击、胜利）
   - 钓鱼、锻造、商店等场景音效
   - 背景音乐
   - 静音/音量设置

3. **UI 打磨**
   - 页面过渡动画
   - 战斗飘字优化
   - 手机端响应式适配

### 中优先级

4. **排行榜增强**
   - 更多维度排行
   - 本地/云端同步策略优化

5. **新玩法**
   - 成就系统扩展
   - 每日/每周任务
   - 更多战斗道具卡
   - 地牢随机事件/奇遇
   - Boss 特殊机制

### 工程与发布

6. ~~**H5 部署到 GitHub Pages**~~（已完成）
   - `.github/workflows/deploy.yml` 自动部署
   - push 到 master 后自动跑测试、构建 H5、部署到 Pages
   - 访问地址：`https://mrzmrsL.github.io/bio-yi-realm/`
7. **微信小程序真机调试**
8. **清理旧 `生化易界-vue` 目录**（需重启或关闭占用进程后手动删除）

---

## 7. 重要技术约定

### 7.1 跨平台写法

- 平台差异用条件编译：
  ```js
  // #ifdef H5
  // H5 专用代码
  // #endif
  // #ifndef H5
  // 非 H5（小程序/App）代码
  // #endif
  ```
- 通用能力抽象到 `src/platform/`

### 7.2 uni-app H5 输入框注意

- `<input>` 在 H5 下编译为 `<uni-input>`
- 内部真实 input 的 class 为 `uni-input-input`
- 若需要设置内部 input 样式，使用 `:deep(.your-class) .uni-input-input`

### 7.3 测试

- 新增功能尽量补充单元测试或组件测试
- H5 关键交互补充 `scripts/test-input-focus.js` 或 Playwright E2E
- E2E 测试文件放在 `tests/e2e/`，已被排除在 Vitest 扫描外

### 7.4 存档

- 所有 Store 需要提供 `serialize()` 和 `deserialize(data)`
- 新增 Store 需在 `useGameSaveSystem.ts` 注册
- 新增全局状态需在 `gameStore.ts` 的 `startGame/loadGame/deleteSave` 中处理

---

## 8. 联系方式/参考

- GitHub: `https://github.com/MrZMrsL/bio-yi-realm`
- 当前主要负责 Agent：Kimi Code CLI
