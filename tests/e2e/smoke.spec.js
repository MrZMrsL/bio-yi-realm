import { test, expect } from '@playwright/test'

test.describe('游戏核心流程', () => {
  test('可以输入名字并开始游戏', async ({ page }) => {
    await page.goto('/')

    // 等待标题页面加载
    await expect(page.locator('.game-title')).toBeVisible()

    // 输入名字
    const nameInput = page.locator('.name-input')
    await expect(nameInput).toBeVisible()
    await nameInput.click()

    // 验证输入框真正获得焦点（H5 下 uni-input 内部 input 高度为 0 时无法聚焦）
    const activeTag = await page.evaluate(() => document.activeElement?.tagName)
    expect(activeTag).toBe('INPUT')

    await nameInput.fill('测试勇者')
    await expect(nameInput).toHaveValue('测试勇者')

    // 点击开始冒险
    await page.locator('.start-btn').click()

    // 等待进入选专精界面
    await expect(page.locator('.select-header')).toBeVisible({ timeout: 5000 })
  })

  test('可以选择专精并进入主界面', async ({ page }) => {
    await page.goto('/')

    await page.locator('.name-input').fill('测试勇者')
    await page.locator('.start-btn').click()

    // 选择第一个专精卡片
    await page.locator('.select-card').first().click()

    // 等待进入主界面
    await expect(page.locator('.dashboard-header')).toBeVisible({ timeout: 5000 })
  })
})
