// Reusable screenshot helper for design verification.
// Usage: node scripts/shot.mjs <url> <outPathPrefix> [--mobile] [--full] [--wait=ms]
import { chromium } from '@playwright/test'

const [url, outPrefix] = process.argv.slice(2)
const args = process.argv.slice(4)
const mobile = args.includes('--mobile')
const full = args.includes('--full')
const waitArg = args.find((a) => a.startsWith('--wait='))
const extraWait = waitArg ? parseInt(waitArg.split('=')[1], 10) : 1200

if (!url || !outPrefix) {
  console.error('usage: node scripts/shot.mjs <url> <outPrefix> [--mobile] [--full] [--wait=ms]')
  process.exit(1)
}

const viewport = mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 }
const browser = await chromium.launch()
const ctx = await browser.newContext({
  viewport,
  deviceScaleFactor: 2,
  isMobile: mobile,
  hasTouch: mobile,
  userAgent: mobile
    ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
    : undefined,
})
const page = await ctx.newPage()
const errors = []
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text())
})
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message))

await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch((e) => {
  console.error('nav error', e.message)
})
await page.waitForTimeout(extraWait)

const out = `${outPrefix}${mobile ? '-mobile' : ''}.png`
await page.screenshot({ path: out, fullPage: full })
console.log('saved', out)
if (errors.length) console.log('CONSOLE ERRORS:\n' + errors.slice(0, 30).join('\n'))
else console.log('no console errors')

await browser.close()
