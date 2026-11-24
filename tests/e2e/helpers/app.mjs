import { assert } from './assertions.mjs';

export const GRAPHICS_STORAGE_KEY = 'scifi_fps_graphics_v1';
export const PREFS_STORAGE_KEY = 'scifi_fps_prefs_v1';

export function attachErrorTracker(page) {
  const consoleErrors = [];
  const pageErrors = [];
  const httpErrors = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', (err) => {
    pageErrors.push(err?.message || String(err));
  });

  page.on('response', (res) => {
    if (res.status() >= 400) {
      httpErrors.push(`${res.status()} ${res.url()}`);
    }
  });

  return {
    consoleErrors,
    pageErrors,
    httpErrors,
    clear() {
      consoleErrors.length = 0;
      pageErrors.length = 0;
      httpErrors.length = 0;
    },
  };
}

export async function waitForFrames(page, count = 3) {
  await page.evaluate(
    (n) =>
      new Promise((resolve) => {
        let remaining = n;
        const step = () => {
          remaining -= 1;
          if (remaining <= 0) resolve();
          else requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }),
    count
  );
}

export async function gotoApp(page, baseUrl) {
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#root', { state: 'attached', timeout: 15000 });
  await page.locator('button:has-text("CAMPAÑA")').waitFor({ state: 'visible', timeout: 15000 });
  await getWebGLCanvas(page).waitFor({ state: 'visible', timeout: 15000 });
  await waitForFrames(page, 4);
}

export function getWebGLCanvas(page) {
  return page.locator('canvas:not([data-testid="minimap-canvas"])').first();
}

export async function getMinimapCanvas(page) {
  const byTestId = page.locator('[data-testid="minimap-canvas"]');
  if ((await byTestId.count()) > 0) {
    return byTestId.first();
  }
  const byPanel = page.locator('div:has-text("AZ"):has-text("ZOOM") canvas');
  if ((await byPanel.count()) > 0) {
    return byPanel.first();
  }
  return page.locator('canvas').nth(1);
}

export function getScoreBoardLocator(page) {
  return page.locator('div.absolute.top-12.right-5').first();
}

export function getTopBarLocator(page) {
  return page.locator('div.absolute.top-0.left-0.right-0.h-10').first();
}

export function getFpsCounterLocator(page) {
  return page.locator('div.absolute.top-12.left-5').first();
}

export function getCrosshairAzimuthLocator(page) {
  return page.locator('div.absolute.bottom-24').first();
}

export function getCrosshairHintLocator(page) {
  return page.locator('div.whitespace-nowrap:has-text("WASD MOVER")').first();
}

export function getMinimapPanelLocator(page) {
  return page.locator('[data-testid="minimap-panel"]').first();
}

export async function getAmmoLocator(page) {
  const byTestId = page.locator('[data-testid="ammo-counter"]');
  if ((await byTestId.count()) > 0) {
    return byTestId.first();
  }
  return page.locator('div, span').filter({ hasText: /^\d+\s*\/\s*∞$/ }).first();
}

export async function getAmmoHudContainer(page) {
  const byTestId = page.locator('[data-testid="ammo-hud"]');
  if ((await byTestId.count()) > 0) {
    return byTestId.first();
  }
  return page.locator('div').filter({ hasText: /\d+\s*\/\s*∞/ }).last();
}

export async function getAmmoState(page) {
  const locator = await getAmmoLocator(page);
  await locator.waitFor({ state: 'visible', timeout: 5000 });
  const raw = (await locator.innerText()).replace(/\s+/g, ' ').trim();
  const match = raw.match(/(\d+)\s*\/\s*∞/);
  assert(Boolean(match), `Ammo counter did not match "<n> / ∞", got: "${raw}"`);
  return {
    raw,
    current: Number(match[1]),
  };
}

export async function openSettingsFromMainMenu(page) {
  await page.locator('button:has-text("AJUSTES")').click();
  await page.getByText('CENTRO DE CONFIGURACIÓN').waitFor({ state: 'visible', timeout: 15000 });
}

export async function closeSettingsModal(page) {
  const closeBtn = page.locator('button:has-text("ESC / CERRAR")').first();
  if (await closeBtn.isVisible()) {
    await closeBtn.click({ force: true }).catch(() => {});
  }
  await page.keyboard.press('Escape').catch(() => {});
  await page.getByText('CENTRO DE CONFIGURACIÓN').waitFor({ state: 'detached', timeout: 15000 });
}

export async function selectSettingsTab(page, tabLabel) {
  await page.locator(`button:has-text("${tabLabel}")`).first().click();
  await waitForFrames(page, 2);
}

export async function setRangeInputValue(locator, value) {
  await locator.waitFor({ state: 'visible', timeout: 5000 });
  await locator.evaluate((el, v) => {
    const descriptor = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value'
    );
    if (descriptor && descriptor.set) {
      descriptor.set.call(el, String(v));
    } else {
      el.value = String(v);
    }
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, value);
  await locator.page().waitForTimeout(60);
}

export function getSettingsRowButton(page, labelRegex) {
  return page
    .locator('div.max-w-xl div.flex.items-center.justify-between')
    .filter({ hasText: labelRegex })
    .last()
    .locator('button')
    .first();
}

export async function startMode(page, modeLabel) {
  await page.locator(`button:has-text("${modeLabel}")`).first().click();
  await page.getByText('ELIGE 1 DE 3 PODERES').waitFor({ state: 'visible', timeout: 20000 });
}

export async function chooseFirstPower(page) {
  const cards = page.locator('button').filter({ hasText: /\[[123]\]/ });
  await cards.first().waitFor({ state: 'visible', timeout: 5000 });
  const count = await cards.count();
  let chosen = cards.first();
  for (let i = 0; i < count; i++) {
    const text = await cards.nth(i).innerText();
    if (!/CARGADOR EXTENDIDO/i.test(text)) {
      chosen = cards.nth(i);
      break;
    }
  }
  await chosen.click();
  await page.getByText('ELIGE 1 DE 3 PODERES').waitFor({ state: 'detached', timeout: 5000 });
  await waitForFrames(page, 4);
}

export async function enterCombatMode(page, modeLabel = 'CAMPAÑA') {
  await startMode(page, modeLabel);
  await chooseFirstPower(page);
}

export async function pauseGame(page) {
  await page.keyboard.press('KeyP');
  await page.locator('button:has-text("REANUDAR MISIÓN")').waitFor({ state: 'visible', timeout: 5000 });
}

export async function resumeGame(page) {
  await page.locator('button:has-text("REANUDAR MISIÓN")').click();
  await page.locator('button:has-text("REANUDAR MISIÓN")').waitFor({ state: 'detached', timeout: 5000 });
  await waitForFrames(page, 3);
}

export async function abortToMainMenu(page) {
  const abortBtn = page.locator('button:has-text("ABORTAR")');
  if ((await abortBtn.count()) === 0 || !(await abortBtn.first().isVisible())) {
    await pauseGame(page);
  }
  await abortBtn.first().click();
  await page.locator('button:has-text("CAMPAÑA")').waitFor({ state: 'visible', timeout: 5000 });
  await waitForFrames(page, 3);
}

export async function acquirePowerViaWaves(page, powerTextRegex, maxAttempts = 45) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const inPowerSelect = await page.getByText('ELIGE 1 DE 3 PODERES').isVisible().catch(() => false);
    if (!inPowerSelect) {
      await startMode(page, 'OLEADAS');
    }

    const cards = page.locator('button').filter({ hasText: /\[[123]\]/ });
    const count = await cards.count();
    for (let i = 0; i < count; i++) {
      const text = await cards.nth(i).innerText();
      if (powerTextRegex.test(text)) {
        await cards.nth(i).click();
        await page.getByText('ELIGE 1 DE 3 PODERES').waitFor({ state: 'detached', timeout: 5000 });
        await waitForFrames(page, 6);
        return attempt + 1;
      }
    }

    await pauseGame(page);
    await abortToMainMenu(page);
  }
  throw new Error(`Failed to roll power matching ${powerTextRegex} within ${maxAttempts} attempts`);
}

export async function fireShots(page, count, delayMs = 200) {
  const vp = page.viewportSize() || { width: 1280, height: 720 };
  const cx = Math.floor(vp.width / 2);
  const cy = Math.floor(vp.height / 2);
  await page.mouse.move(cx, cy);
  for (let i = 0; i < count; i++) {
    await page.mouse.down({ button: 'left' });
    await page.waitForTimeout(45);
    await page.mouse.up({ button: 'left' });
    if (i < count - 1) {
      await page.waitForTimeout(delayMs);
    }
  }
  await waitForFrames(page, 2);
}

export async function waitForAmmoCount(page, expectedCount, timeoutMs = 15000) {
  await page.waitForFunction(
    (target) => {
      const el = document.querySelector('[data-testid="ammo-counter"]');
      if (!el) return false;
      const m = (el.textContent || '').replace(/\s+/g, ' ').match(/(\d+)\s*\/\s*∞/);
      return m ? Number(m[1]) === target : false;
    },
    expectedCount,
    { timeout: timeoutMs }
  );
}

export async function emptyMagazine(page, timeoutMs = 28000) {
  const vp = page.viewportSize() || { width: 1280, height: 720 };
  const cx = Math.floor(vp.width / 2);
  const cy = Math.floor(vp.height / 2);
  await page.mouse.move(cx, cy);
  await page.mouse.down({ button: 'left' });

  const start = Date.now();
  let reachedZero = false;
  let sawReload = false;
  try {
    while (Date.now() - start < timeoutMs) {
      const ammo = await getAmmoState(page);
      const reloadingVisible = await page.getByText('RECARGANDO...').isVisible().catch(() => false);
      if (ammo.current === 0) reachedZero = true;
      if (reloadingVisible) sawReload = true;
      if (reachedZero || sawReload) break;
      await page.waitForTimeout(90);
    }
  } finally {
    await page.mouse.up({ button: 'left' });
  }
  return { reachedZero, sawReload };
}

export async function getBox(locator) {
  if ((await locator.count()) === 0) return null;
  const visible = await locator.first().isVisible().catch(() => false);
  if (!visible) return null;
  return await locator.first().boundingBox();
}

export async function inspectMinimapPixels(page) {
  const canvas = await getMinimapCanvas(page);
  await canvas.waitFor({ state: 'visible', timeout: 5000 });
  const box = await canvas.boundingBox();
  const stats = await canvas.evaluate((el) => {
    const ctx = el.getContext('2d');
    if (!ctx) return null;
    const { width, height } = el;
    const data = ctx.getImageData(0, 0, width, height).data;
    const cx = width / 2;
    const cy = height / 2;
    const maxR = Math.min(cx, cy) - 1;

    let totalNonBg = 0;
    let crimsonEnemyPixels = 0;
    let emeraldAllyPixels = 0;
    let tealOrCyanPixels = 0;
    let outsideCircleOpaquePixels = 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const a = data[idx + 3];

        const dist = Math.hypot(x - cx, y - cy);
        if (dist > maxR + 2 && a > 30) {
          outsideCircleOpaquePixels += 1;
        }

        if (a > 40 && (r > 25 || g > 30 || b > 45)) {
          totalNonBg += 1;
        }

        // Enemy markers (#fb7185 / #f43f5e / red glow)
        if (a > 120 && r >= 180 && g <= 145 && r > g + 50) {
          crimsonEnemyPixels += 1;
        }

        // Ally role 0 emerald (#34d399 -> rgb(52, 211, 153))
        if (a > 120 && g >= 165 && r <= 125 && g > r + 60 && g > b + 20) {
          emeraldAllyPixels += 1;
        }

        // Cyan / teal (#2dd4bf, #22d3ee)
        if (a > 120 && b >= 160 && g >= 160 && r <= 110) {
          tealOrCyanPixels += 1;
        }
      }
    }

    return {
      attrWidth: width,
      attrHeight: height,
      totalNonBg,
      crimsonEnemyPixels,
      emeraldAllyPixels,
      tealOrCyanPixels,
      outsideCircleOpaquePixels,
    };
  });

  return { box, stats };
}

export async function measureElementLuminance(page, locator) {
  const box = await locator.boundingBox();
  const clip = box
    ? {
        x: Math.max(0, Math.floor(box.x)),
        y: Math.max(0, Math.floor(box.y)),
        width: Math.max(1, Math.floor(box.width)),
        height: Math.max(1, Math.floor(box.height)),
      }
    : undefined;
  const pngBuffer = await page.screenshot({ type: 'png', clip, animations: 'allow' });
  const base64 = pngBuffer.toString('base64');
  const metrics = await page.evaluate(async (b64) => {
    const img = new Image();
    img.src = `data:image/png;base64,${b64}`;
    await img.decode();
    const offscreen = document.createElement('canvas');
    offscreen.width = img.width;
    offscreen.height = img.height;
    const ctx = offscreen.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const { data } = ctx.getImageData(0, 0, img.width, img.height);
    let lumSum = 0;
    let nonBlack = 0;
    const pixelCount = img.width * img.height;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      lumSum += lum;
      if (r > 12 || g > 12 || b > 12) nonBlack += 1;
    }
    return {
      width: img.width,
      height: img.height,
      meanLuminance: lumSum / Math.max(1, pixelCount),
      nonBlackRatio: nonBlack / Math.max(1, pixelCount),
    };
  }, base64);
  return { ...metrics, pngBuffer };
}

export async function comparePngBuffers(page, bufA, bufB) {
  const b64A = bufA.toString('base64');
  const b64B = bufB.toString('base64');
  return await page.evaluate(
    async ({ a, b }) => {
      const loadImg = async (src) => {
        const img = new Image();
        img.src = `data:image/png;base64,${src}`;
        await img.decode();
        return img;
      };
      const [imgA, imgB] = await Promise.all([loadImg(a), loadImg(b)]);
      const w = Math.min(imgA.width, imgB.width);
      const h = Math.min(imgA.height, imgB.height);
      const readPixels = (img) => {
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        return ctx.getImageData(0, 0, w, h).data;
      };
      const dataA = readPixels(imgA);
      const dataB = readPixels(imgB);
      let diffPixels = 0;
      let deltaSum = 0;
      const total = w * h;
      for (let i = 0; i < dataA.length; i += 4) {
        const d =
          Math.abs(dataA[i] - dataB[i]) +
          Math.abs(dataA[i + 1] - dataB[i + 1]) +
          Math.abs(dataA[i + 2] - dataB[i + 2]);
        deltaSum += d / 3;
        if (d > 18) diffPixels += 1;
      }
      return {
        totalPixels: total,
        diffPixels,
        diffRatio: diffPixels / Math.max(1, total),
        meanAbsDelta: deltaSum / Math.max(1, total),
      };
    },
    { a: b64A, b: b64B }
  );
}

export async function verifyAudioFileDecodes(page, audioPath) {
  return await page.evaluate(async (url) => {
    const res = await fetch(url);
    const status = res.status;
    if (!res.ok) {
      return { url, status, ok: false, error: `HTTP ${status}` };
    }
    const arrayBuffer = await res.arrayBuffer();
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();
    try {
      const decoded = await ctx.decodeAudioData(arrayBuffer);
      return {
        url,
        status,
        ok: decoded.duration > 0 && decoded.sampleRate > 0,
        duration: decoded.duration,
        sampleRate: decoded.sampleRate,
        channels: decoded.numberOfChannels,
      };
    } catch (err) {
      return { url, status, ok: false, error: err?.message || String(err) };
    } finally {
      await ctx.close().catch(() => {});
    }
  }, audioPath);
}

export async function getAudioDebugState(page) {
  return await page.evaluate(() => window.__AUDIO_DEBUG__ ?? null);
}

export async function readStorageJson(page, key) {
  return await page.evaluate((k) => {
    const raw = localStorage.getItem(k);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return { __rawInvalid: raw };
    }
  }, key);
}
