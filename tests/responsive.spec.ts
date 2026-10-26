import { test, expect, type Page, type Locator } from '@playwright/test'

async function activate(locator: Locator, touch: boolean) {
  if (touch) await locator.tap()
  else await locator.click()
}

async function noHorizontalOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    width: innerWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }))
  expect(dimensions.document).toBeLessThanOrEqual(dimensions.width + 1)
  expect(dimensions.body).toBeLessThanOrEqual(dimensions.width + 1)
}

async function inViewport(locator: Locator, page: Page, allowVerticalOverflow = false) {
  await expect(locator).toBeVisible()
  const box = await locator.boundingBox()
  const size = page.viewportSize()!
  expect(box).not.toBeNull()
  expect(box!.x).toBeGreaterThanOrEqual(-1)
  expect(box!.y).toBeGreaterThanOrEqual(-1)
  expect(box!.x + box!.width).toBeLessThanOrEqual(size.width + 1)
  if (!allowVerticalOverflow) expect(box!.y + box!.height).toBeLessThanOrEqual(size.height + 1)
}

async function run(page: Page, command: string) {
  const input = page.getByRole('textbox', { name: /^Run a workspace command/ })
  await input.fill(command)
  await input.press('Enter')
}

test('entry, shared explorer, projects, terminal, palette and touch layout', async ({ page }, testInfo) => {
  const touch = Boolean(testInfo.project.use.hasTouch)
  const { width, height } = page.viewportSize()!
  const compact = width < 768 || (width < 1024 && height <= 500)
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)
  await expect(page.locator('.entry-screen')).toBeVisible()
  await expect(page.getByText('dangerousEnigma.sys')).toBeVisible()
  await expect(page.locator('.entry-command-hint')).toContainText('cd portfolio')
  const entry = page.getByRole('textbox', { name: /Enter a safe portfolio command/ })
  await entry.fill('cd portfolio')
  await entry.press('Enter')
  await expect(page.locator('.terminal-window')).toBeVisible()
  await expect(page.locator('.detail-screen h2')).toHaveText(/Muneeb/)
  await expect(page.getByText(/Computer Science student at IIT/)).toBeVisible()
  await expect(page.getByText('dangerousEnigma.sys')).toBeVisible()
  await page.mouse.move(20, 20)
  const cursorCapabilities = await page.evaluate(() => ({
    pointerFine: matchMedia('(hover: hover) and (pointer: fine)').matches,
    ready: document.documentElement.classList.contains('custom-cursor-ready'),
    pointerEvents: getComputedStyle(document.querySelector('.custom-cursor-dot')!).pointerEvents,
  }))
  expect(cursorCapabilities.pointerEvents).toBe('none')
  if (cursorCapabilities.pointerFine) expect(cursorCapabilities.ready).toBe(true)
  else expect(cursorCapabilities.ready).toBe(false)
  await noHorizontalOverflow(page)
  await inViewport(page.locator('.command-line'), page)
  await page.screenshot({ path: testInfo.outputPath('workspace.png') })

  const explorer = page.locator('#portfolio-explorer')
  const filesToggle = page.getByRole('button', { name: 'FILES', exact: true })
  const openFiles = async () => {
    if (compact) await activate(filesToggle, touch)
    await expect(explorer).toBeVisible()
  }
  await openFiles()
  if (compact) {
    await expect(explorer).toHaveAttribute('aria-modal', 'true')
    await inViewport(explorer, page)
    await activate(page.getByRole('button', { name: 'Close files' }), touch)
    await expect(explorer).toBeHidden()
    await expect(filesToggle).toBeFocused()
    await openFiles()
    await page.keyboard.press('Escape')
    await expect(explorer).toBeHidden()
    await openFiles()
  } else {
    await expect(filesToggle).toBeHidden()
  }

  const projects = explorer.locator('[data-path="projects"]')
  const dairix = explorer.locator('[data-path="projects/dairix"]')
  const readme = explorer.locator('[data-path="projects/dairix/README.md"]')
  await activate(projects, touch)
  await expect(projects).toHaveAttribute('aria-expanded', 'false')
  await expect(dairix).toHaveCount(0)
  await projects.press('ArrowDown')
  await expect(explorer.locator('[data-path="skills"]')).toBeFocused()
  await projects.focus()
  await projects.press('ArrowRight')
  await expect(dairix).toBeVisible()
  await activate(dairix, touch)
  await expect(readme).toHaveCount(0)
  await dairix.press('ArrowRight')
  await expect(readme).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath('explorer.png') })
  await activate(readme, touch)
  await expect(page.locator('.project-detail h2')).toHaveText(/DAIRIX/)
  if (compact) await expect(explorer).toBeHidden()

  // Collapsing a current ancestor does not navigate or discard the selected file.
  await openFiles()
  await activate(projects, touch)
  await expect(readme).toHaveCount(0)
  await expect(page.locator('.breadcrumb')).toHaveText('~/projects/dairix/')
  await activate(projects, touch)
  await expect(readme).toHaveAttribute('aria-selected', 'true')
  if (compact) {
    await activate(page.getByRole('button', { name: 'Close files' }), touch)
    await openFiles()
    await expect(readme).toHaveAttribute('aria-selected', 'true')
    await activate(page.getByRole('button', { name: 'Close files' }), touch)
  }

  for (const project of ['dairix', 'smarttrace']) {
    await run(page, `open ${project}`)
    await expect(page.locator('.project-detail h2')).toHaveText(new RegExp(project.toUpperCase()))
    await inViewport(page.locator('.project-detail'), page)
    await expect(page.locator('.project-detail-description')).toBeVisible()
    const layout = await page.locator('.view-stage').evaluate((stage) => {
      const image = stage.querySelector('.project-image-placeholder')!.getBoundingClientRect()
      const description = stage.querySelector('.project-detail-description')!.getBoundingClientRect()
      const bounds = stage.getBoundingClientRect()
      return { width: image.width, height: image.height, center: image.x + image.width / 2,
        stageCenter: bounds.x + bounds.width / 2, bottom: description.bottom, stageBottom: bounds.bottom,
        overflow: stage.scrollHeight - stage.clientHeight }
    })
    expect(Math.abs(layout.width / layout.height - 16 / 9)).toBeLessThan(.02)
    expect(Math.abs(layout.center - layout.stageCenter)).toBeLessThan(2)
    expect(layout.bottom).toBeLessThanOrEqual(layout.stageBottom + 1)
    expect(layout.overflow, 'project must fit the content region at the target viewport').toBeLessThanOrEqual(2)
    await inViewport(page.locator('.command-line'), page)
    await noHorizontalOverflow(page)
    await page.screenshot({ path: testInfo.outputPath(`${project}.png`) })
  }

  for (const command of ['pwd', 'ls', 'tree', 'cat README.md']) {
    await run(page, command)
    await expect(page.getByRole('log', { name: 'Workspace command output' })).not.toBeEmpty()
    if (command === 'tree') {
      await expect(page.locator('.terminal-notice')).toContainText('smarttrace/')
      await expect(page.locator('.terminal-notice')).not.toContainText('nexchat')
      await expect(page.locator('.terminal-notice')).not.toContainText('overview.md')
    }
    await inViewport(page.locator('.command-line'), page)
    await inViewport(page.locator('.terminal-notice'), page)
    await noHorizontalOverflow(page)
  }
  await run(page, 'open dairix')
  await run(page, 'ls')
  await expect(page.locator('.terminal-notice')).toContainText('README.md')
  await expect(page.locator('.terminal-notice')).not.toContainText('overview.md')
  await run(page, 'cat README.md')
  await expect(page.locator('.terminal-notice')).toContainText('projects/dairix/README.md')
  const input = page.getByRole('textbox', { name: /^Run a workspace command/ })
  await input.press('ArrowUp')
  await expect(input).toHaveValue('cat README.md')
  await input.press('ControlOrMeta+a')
  await input.press('Backspace')
  await expect(input).toHaveValue('')
  await input.fill('x'.repeat(300))
  await noHorizontalOverflow(page)
  await input.press('Enter')
  await noHorizontalOverflow(page)
  await run(page, 'clear')

  for (const view of ['about', 'skills', 'resume', 'contact', 'projects']) {
    await run(page, view)
    await inViewport(page.locator('.detail-screen'), page, true)
    await inViewport(page.locator('.command-line'), page)
    await noHorizontalOverflow(page)
    if (view === 'skills') {
      await expect(page.locator('[data-skill-icon]')).toHaveCount(16)
      await expect(page.locator('[data-skill-icon="c"]')).toBeVisible()
      await expect(page.locator('[data-skill-icon="cplusplus"]')).toBeVisible()
      await expect(page.locator('[data-skill-icon="python"]')).toBeVisible()
      await expect(page.locator('[data-skill-icon="javascript"]')).toBeVisible()
      await expect(page.locator('[data-skill-icon="typescript"]')).toBeVisible()
      await expect(page.locator('[data-skill-icon="react"]')).toBeVisible()
      await expect(page.locator('[data-skill-icon="nextjs"]')).toBeVisible()
      await expect(page.locator('[data-skill-icon="tailwind-css"]')).toBeVisible()
      await expect(page.locator('[data-skill-icon="nodejs"]')).toBeVisible()
      await expect(page.locator('[data-skill-icon="expressjs"]')).toBeVisible()
      await expect(page.locator('[data-skill-icon="websockets"]')).toBeVisible()
      await expect(page.locator('[data-skill-icon="redis"]')).toBeVisible()
      await expect(page.locator('[data-skill-icon="mongodb"]')).toBeVisible()
      await expect(page.locator('[data-skill-icon="docker"]')).toBeVisible()
      await expect(page.locator('[data-skill-icon="postman"]')).toBeVisible()
      await expect(page.locator('[data-skill-icon="linux"]')).toBeVisible()
      const iconStyles = await page.locator('[data-skill-icon]').evaluateAll((icons) => icons.map((icon) => getComputedStyle(icon).color))
      expect(new Set(iconStyles).size).toBeGreaterThan(8)
      await page.screenshot({ path: testInfo.outputPath('skills.png') })
    }
  }

  await run(page, 'contact')
  await expect(page.getByRole('link', { name: /LinkedIn/ })).toHaveAttribute('href', /linkedin\.com/)
  await expect(page.getByRole('link', { name: /GitHub/ })).toHaveAttribute('href', 'https://github.com/dangerousEnigma1827')
  await expect(page.getByRole('link', { name: /Email/ })).toHaveAttribute('href', 'mailto:syedmuneebmalik1827@gmail.com')
  await run(page, 'resume')
  await expect(page.getByRole('button', { name: 'Download Resume' })).toBeDisabled()

  await activate(page.getByRole('button', { name: 'Open command palette' }), touch)
  const palette = page.getByRole('dialog', { name: 'command palette', exact: true })
  await inViewport(palette, page)
  await inViewport(page.getByRole('button', { name: 'Close command palette' }), page)
  await noHorizontalOverflow(page)
  await page.screenshot({ path: testInfo.outputPath('palette.png') })
  await page.getByRole('combobox').fill('skills')
  await activate(page.getByRole('option', { name: /Skills & stack/ }), touch)
  await expect(palette).toBeHidden()
  await expect(page.locator('.detail-screen h2')).toHaveText(/Skills & stack/)
  await activate(page.getByRole('button', { name: 'Open command palette' }), touch)
  await page.keyboard.press('Escape')
  await expect(palette).toBeHidden()
  await expect(page.getByRole('button', { name: 'Open command palette' })).toBeVisible()
  expect(errors).toEqual([])
})
