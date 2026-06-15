// Scroll through a page in viewport steps, screenshotting each — so scroll-triggered
// animations actually fire (a plain fullPage shot does not scroll).
// Usage: node scripts/scroll-shots.mjs <url> <outDir> [--mobile] [--steps=N]
import { chromium } from '@playwright/test'

const [url, outDir] = process.argv.slice(2)
const args = process.argv.slice(4)
const mobile = args.includes('--mobile')
const stepsArg = args.find((a) => a.startsWith('--steps='))
const steps = stepsArg ? parseInt(stepsArg.split('=')[1], 10) : 7

const viewport = mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 }
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile })
const page = await ctx.newPage()
const errors = []
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message))
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })

await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 })
await page.waitForTimeout(1500)

const total = await page.evaluate(() => document.documentElement.scrollHeight)
const vh = viewport.height
const n = Math.max(steps, Math.ceil(total / vh))
const tag = mobile ? 'm' : 'd'

for (let i = 0; i < n; i++) {
  const y = Math.round((i * (total - vh)) / Math.max(1, n - 1))
  await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: 'instant' }), y)
  await page.waitForTimeout(900)
  const out = `${outDir}/${tag}-${String(i).padStart(2, '0')}.png`
  await page.screenshot({ path: out })
}
console.log(`saved ${n} ${tag} frames to ${outDir}`)
if (errors.length) console.log('ERRORS:\n' + [...new Set(errors)].slice(0, 20).join('\n'))
else console.log('no console/page errors')
await browser.close()
