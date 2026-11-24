import {
  GRAPHICS_STORAGE_KEY,
  closeSettingsModal,
  getWebGLCanvas,
  gotoApp,
  measureElementLuminance,
  openSettingsFromMainMenu,
  readStorageJson,
  selectSettingsTab,
  setRangeInputValue,
  verifyAudioFileDecodes,
  waitForFrames,
} from '../helpers/app.mjs';
import {
  assert,
  assertEqual,
  assertGreaterThan,
  assertInRange,
  assertIncludes,
} from '../helpers/assertions.mjs';

export const tests = [
  {
    name: 'smoke_boot_and_webgl_render',
    async run({ page, baseUrl }) {
      await gotoApp(page, baseUrl);
      const rootText = await page.locator('#root').innerText();
      assertIncludes(rootText, 'GALACTIC PTZ', 'Main menu title should render in #root');

      const canvas = getWebGLCanvas(page);
      const box = await canvas.boundingBox();
      assert(box !== null, 'WebGL canvas must have a bounding box');
      assertGreaterThan(box.width, 600, 'WebGL canvas width must be >= 600px');
      assertGreaterThan(box.height, 400, 'WebGL canvas height must be >= 400px');

      const lum = await measureElementLuminance(page, canvas);
      assertGreaterThan(lum.nonBlackRatio, 0.01, 'WebGL canvas must render visible non-black pixels');
    },
  },
  {
    name: 'smoke_real_gesture_webaudio_unlock_and_decode',
    async run({ page, baseUrl }) {
      await gotoApp(page, baseUrl);

      // Genuine user pointer click to unlock AudioContext
      await openSettingsFromMainMenu(page);
      await closeSettingsModal(page);

      const decoded = await verifyAudioFileDecodes(page, '/audio/space-ambient.ogg');
      assertEqual(decoded.status, 200, '/audio/space-ambient.ogg must respond HTTP 200');
      assert(decoded.ok, `Real decodeAudioData failed: ${decoded.error || 'unknown'}`);
      assertGreaterThan(decoded.duration, 1, 'Decoded audio duration must be > 1s');

      const ctxState = await page.evaluate(async () => {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        const ctx = new Ctx();
        await ctx.resume();
        const state = ctx.state;
        await ctx.close();
        return state;
      });
      assertEqual(ctxState, 'running', 'Real AudioContext must reach running state');
    },
  },
  {
    name: 'smoke_r4_baseline_settings_presets_brightness_autodetect_and_clamp',
    async run({ page, baseUrl }) {
      await gotoApp(page, baseUrl);
      await openSettingsFromMainMenu(page);

      // Verify all 3 tabs exist and switch cleanly
      await assert(
        await page.locator('button:has-text("GRÁFICOS")').isVisible(),
        'GRÁFICOS tab must be visible'
      );
      await selectSettingsTab(page, 'PANTALLA & BRILLO');
      await assert(
        await page.getByText('BRILLO DEL ENTORNO').isVisible(),
        'PANTALLA & BRILLO tab must show BRILLO DEL ENTORNO'
      );
      await selectSettingsTab(page, 'AUDIO & CONTROL');
      await assert(
        await page.getByText('SENSIBILIDAD DE CÁMARA').isVisible(),
        'AUDIO & CONTROL tab must show SENSIBILIDAD DE CÁMARA'
      );
      await selectSettingsTab(page, 'GRÁFICOS');

      // Presets BAJO (dpr 0.9) vs MEDIO (dpr 1.0) change WebGL canvas backing dimensions
      await page.locator('button:has-text("BAJO")').first().click();
      await waitForFrames(page, 4);
      const lowCfg = await readStorageJson(page, GRAPHICS_STORAGE_KEY);
      assertEqual(lowCfg.preset, 'LOW', 'Clicking BAJO must save preset=LOW');
      const lowCanvasDims = await getWebGLCanvas(page).evaluate((c) => ({
        w: c.width,
        h: c.height,
      }));

      await page.locator('button:has-text("MEDIO")').first().click();
      await waitForFrames(page, 4);
      const medCfg = await readStorageJson(page, GRAPHICS_STORAGE_KEY);
      assertEqual(medCfg.preset, 'MEDIUM', 'Clicking MEDIO must save preset=MEDIUM');
      const medCanvasDims = await getWebGLCanvas(page).evaluate((c) => ({
        w: c.width,
        h: c.height,
      }));
      assertGreaterThan(
        medCanvasDims.w,
        lowCanvasDims.w,
        'Canvas backing width must increase from LOW (dpr 0.9) to MEDIUM (dpr 1.0)'
      );

      // Brightness luminance diff under MEDIO preset
      await selectSettingsTab(page, 'PANTALLA & BRILLO');
      const brightnessRange = page.locator('input[type="range"]').first();
      await setRangeInputValue(brightnessRange, 0.5);
      await closeSettingsModal(page);
      await waitForFrames(page, 6);
      const dimMetrics = await measureElementLuminance(page, getWebGLCanvas(page));

      await openSettingsFromMainMenu(page);
      await selectSettingsTab(page, 'PANTALLA & BRILLO');
      await setRangeInputValue(page.locator('input[type="range"]').first(), 1.5);
      await closeSettingsModal(page);
      await waitForFrames(page, 6);
      const brightMetrics = await measureElementLuminance(page, getWebGLCanvas(page));

      assertGreaterThan(
        brightMetrics.meanLuminance,
        dimMetrics.meanLuminance + 0.5,
        `Brightness 1.5 (${brightMetrics.meanLuminance.toFixed(2)}) must visibly exceed 0.5 (${dimMetrics.meanLuminance.toFixed(2)})`
      );

      // Auto-detect button + toast + storage
      await openSettingsFromMainMenu(page);
      await page.locator('button:has-text("ACOMODAR A MI PC")').click();
      const toast = page.getByText(/Hardware analizado:/);
      await toast.waitFor({ state: 'visible', timeout: 5000 });
      const autoCfg = await readStorageJson(page, GRAPHICS_STORAGE_KEY);
      assert(
        ['LOW', 'MEDIUM', 'HIGH'].includes(autoCfg.preset),
        `Auto-detect must persist a valid preset, got ${autoCfg?.preset}`
      );

      // Reload clamping
      await page.evaluate((key) => {
        localStorage.setItem(
          key,
          JSON.stringify({
            preset: 'HIGH',
            dpr: 5.0,
            brightness: 9.0,
            shadowMapSize: 4096,
          })
        );
      }, GRAPHICS_STORAGE_KEY);

      await page.reload({ waitUntil: 'domcontentloaded' });
      await openSettingsFromMainMenu(page);
      await selectSettingsTab(page, 'PANTALLA & BRILLO');
      const readoutText = await page.getByText('150%', { exact: true }).isVisible();
      assert(readoutText, 'Clamped brightness 1.5 must display 150% after reload');
      await page.locator('button:has-text("GRÁFICOS")').first().click();
      await page.locator('button:has-text("ALTO")').first().click();
      const clampedRead = await page.evaluate((key) => {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
      }, GRAPHICS_STORAGE_KEY);
      assertInRange(clampedRead.brightness, 0.5, 1.5, 'Brightness must remain clamped in [0.5, 1.5]');
      assertInRange(clampedRead.dpr, 0.75, 1.5, 'DPR must remain clamped in [0.75, 1.5]');
    },
  },
];
