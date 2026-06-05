# CSS 动画性能标准 — 生化易界

> 建立于 2026-06-05 技术美术审计

## 铁律

1. **动画只使用 `transform` 和 `opacity`**
   - ✅ `transform: translateX/Y/Z`, `scale`, `rotate`
   - ✅ `opacity`
   - ❌ `left`, `top`, `width`, `height`, `margin`, `padding` — 触发重排

2. **禁止 `transition: all`**
   - ✅ 指定具体属性：`transition: transform 0.2s, opacity 0.2s`
   - ❌ `transition: all 0.2s`

3. **按钮/可交互元素使用弹性缓动**
   - ✅ `cubic-bezier(0.34, 1.56, 0.64, 1)`
   - ✅ `transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)`

## 已审计文件

| 文件 | Keyframes 数 | 状态 |
|------|:----------:|:----:|
| Battle.vue | 17 | ✅ 全部使用 transform/opacity |
| Fishing.vue | 6 | ✅ 全部使用 transform/opacity |
| TitleScreen.vue | 3 | ✅ 全部使用 transform/opacity |
| GameContainer.vue | 5 | ✅ 全部使用 transform/opacity |
| Achievements.vue | 3 | ✅ 已修复 shine（left→transform）|
| CharacterSelect.vue | 2 | ✅ 全部使用 transform/opacity |

## 性能预算

| 指标 | 限值 |
|------|:----:|
| 同时活跃粒子数（移动端） | ≤ 60 |
| 同时活跃粒子数（PC端） | ≤ 120 |
| 伤害数字同时显示 | ≤ 10 |
| 动画帧率目标 | 60fps |
| `backdrop-filter: blur()` | 仅 PC 端（≥768px）启用 |
