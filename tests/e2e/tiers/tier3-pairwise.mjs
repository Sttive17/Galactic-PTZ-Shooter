import {
  GRAPHICS_STORAGE_KEY,
  PREFS_STORAGE_KEY,
  abortToMainMenu,
  acquirePowerViaWaves,
  closeSettingsModal,
  enterCombatMode,
  fireShots,
  getAmmoHudContainer,
  getAmmoState,
  getAudioDebugState,
  getBox,
  getMinimapCanvas,
  getSettingsRowButton,
  getWebGLCanvas,
  gotoApp,
  inspectMinimapPixels,
  measureElementLuminance,
  openSettingsFromMainMenu,
  pauseGame,
  readStorageJson,
  resumeGame,
  selectSettingsTab,
  setRangeInputValue,
  waitForAmmoCount,
  waitForFrames,
} from '../helpers/app.mjs';
import {
  assert,
  assertBoxesDoNotOverlap,
  assertEqual,
  assertGreaterThan,
  assertInRange,
} from '../helpers/assertions.mjs';

export const tests = [
  {
    name: 't3_pair_firing_reload_with_active_ally_drone',
    async run({ page, baseUrl }) {
      await gotoApp(page, baseUrl);
      await acquirePowerViaWaves(page, /ESCUADR[ÓO]N DE DRONES/i);

      await fireShots(page, 8, 200);
      const midAmmo = await getAmmoState(page);
      assert(midAmmo.current < 50, 'Ammo must decrement while ally drone is active');

      await page.keyboard.press('KeyR');
      await waitForAmmoCount(page, 50, 15000);
      const reloaded = await getAmmoState(page);
      assertEqual(reloaded.current, 50, 'Reload must restore 50 / ∞ with ally active');

      const { stats } = await inspectMinimapPixels(page);
      assertGreaterThan(stats.emeraldAllyPixels, 6, 'Ally marker must remain active during reload');
    },
  },
  {
    name: 't3_pair_pause_settings_audio_and_brightness_resume',
    async run({ page, baseUrl }) {
      await gotoApp(page, baseUrl);
      await enterCombatMode(page, 'CAMPAÑA');
      await page.waitForTimeout(350);

      await pauseGame(page);
      await page.waitForTimeout(350);
      const pausedDbg = await getAudioDebugState(page);
      assert(pausedDbg !== null, 'window.__AUDIO_DEBUG__ required');
      assert(
        pausedDbg.activeScreen === 'PAUSED' || pausedDbg.activeScreen === 'SETTINGS_MENU',
        `Expected PAUSED/SETTINGS_MENU audio state, got ${pausedDbg.activeScreen}`
      );

      await page.locator('button:has-text("MEDIO")').first().click();
      await selectSettingsTab(page, 'PANTALLA & BRILLO');
      await setRangeInputValue(page.locator('input[type="range"]').first(), 1.4);

      await resumeGame(page);
      await page.waitForTimeout(350);

      const resumedDbg = await getAudioDebugState(page);
      assertEqual(resumedDbg.activeSituation, 'COMBAT', 'Resume must restore COMBAT audio');
      const cfg = await readStorageJson(page, GRAPHICS_STORAGE_KEY);
      assertEqual(cfg.brightness, 1.4, 'Brightness adjusted mid-pause must persist');
    },
  },
  {
    name: 't3_pair_autodetect_graphics_into_campaign_combat',
    async run({ page, baseUrl }) {
      await gotoApp(page, baseUrl);
      await openSettingsFromMainMenu(page);
      await page.locator('button:has-text("ACOMODAR A MI PC")').click();
      await page.getByText(/Hardware analizado:/).waitFor({ state: 'visible', timeout: 5000 });
      await closeSettingsModal(page);

      await enterCombatMode(page, 'CAMPAÑA');
      const ammo = await getAmmoState(page);
      assertEqual(ammo.current, 50, 'Combat after auto-detect must show 50 / ∞');

      const minimap = await getMinimapCanvas(page);
      const mBox = await minimap.boundingBox();
      assertGreaterThan(mBox.width, 191, 'Enlarged minimap must render after auto-detect');

      const lum = await measureElementLuminance(page, getWebGLCanvas(page));
      assertGreaterThan(lum.nonBlackRatio, 0.01, 'WebGL 3D combat scene must render non-blank');
    },
  },
  {
    name: 't3_pair_topbar_mute_sync_with_settings_panel',
    async run({ page, baseUrl }) {
      await gotoApp(page, baseUrl);
      await enterCombatMode(page, 'CAMPAÑA');

      const topMuteBtn = page
        .locator('button[title*="Silenciar"], button[title*="Activar"]')
        .first();
      await topMuteBtn.waitFor({ state: 'visible', timeout: 5000 });
      await topMuteBtn.click();
      await page.waitForTimeout(150);

      const dbg = await getAudioDebugState(page);
      assert(dbg !== null, 'window.__AUDIO_DEBUG__ required');
      assertEqual(dbg.volumes.muted, true, 'TopBar mute must mute AudioSystem');

      await pauseGame(page);
      await selectSettingsTab(page, 'AUDIO & CONTROL');
      const activarVisible = await page.locator('button:has-text("ACTIVAR")').isVisible();
      assert(activarVisible, 'SettingsPanel mute button must sync to ACTIVAR when muted via TopBar');
    },
  },
  {
    name: 't3_pair_extended_mag_with_minimap_and_hud_layout',
    async run({ page, baseUrl }) {
      await gotoApp(page, baseUrl);
      await acquirePowerViaWaves(page, /CARGADOR EXTENDIDO/i);

      const ammo = await getAmmoState(page);
      assertEqual(ammo.current, 80, 'EXTENDED_MAG must set ammo counter to 80 / ∞');
      const capVisible = await page.getByText('CAP 80').isVisible();
      assert(capVisible, 'AmmoHUD must display CAP 80 badge with EXTENDED_MAG');

      const ammoBox = await getBox(await getAmmoHudContainer(page));
      const minimapBox = await getBox(page.locator('[data-testid="minimap-panel"]'));
      assertBoxesDoNotOverlap(ammoBox, minimapBox, 'AmmoHUD(80)', 'Minimap');
    },
  },
  {
    name: 't3_pair_showfps_and_hudeffects_toggles_with_gameplay_hud',
    async run({ page, baseUrl }) {
      await gotoApp(page, baseUrl);
      await openSettingsFromMainMenu(page);
      await selectSettingsTab(page, 'PANTALLA & BRILLO');

      await getSettingsRowButton(page, /Mostrar FPS/i).click();
      await getSettingsRowButton(page, /Efectos HUD/i).click();
      await closeSettingsModal(page);

      await enterCombatMode(page, 'CAMPAÑA');
      assertEqual(await page.locator('text=/\\d+ FPS/').count(), 0, 'FPS pill must remain hidden in combat');
      assertEqual(await page.locator('.scanlines').count(), 0, '.scanlines must remain disabled in combat');
      assertEqual(await page.locator('.vignette').count(), 0, '.vignette must remain disabled in combat');

      const ammo = await getAmmoState(page);
      assertEqual(ammo.current, 50, 'AmmoHUD must still function with HUD overlays disabled');
    },
  },
  {
    name: 't3_pair_midgame_preset_change_dpr_and_hud_alignment',
    async run({ page, baseUrl }) {
      await gotoApp(page, baseUrl);
      await enterCombatMode(page, 'CAMPAÑA');

      await pauseGame(page);
      await page.locator('button:has-text("BAJO")').first().click();
      await waitForFrames(page, 4);
      const lowWidth = await getWebGLCanvas(page).evaluate((c) => c.width);

      await page.locator('button:has-text("ALTO")').first().click();
      await waitForFrames(page, 4);
      const highWidth = await getWebGLCanvas(page).evaluate((c) => c.width);
      assertGreaterThan(highWidth, lowWidth, 'Mid-game preset change BAJO->ALTO must scale canvas DPR');

      await resumeGame(page);
      const ammoBox = await getBox(await getAmmoHudContainer(page));
      const minimapBox = await getBox(page.locator('[data-testid="minimap-panel"]'));
      assertBoxesDoNotOverlap(ammoBox, minimapBox, 'AmmoHUD', 'Minimap');
    },
  },
  {
    name: 't3_pair_ajustes_levelmap_volver_audio_flow',
    async run({ page, baseUrl }) {
      await gotoApp(page, baseUrl);

      await openSettingsFromMainMenu(page);
      await page.waitForTimeout(300);
      const sDbg = await getAudioDebugState(page);
      assert(sDbg !== null, 'window.__AUDIO_DEBUG__ required');
      assertEqual(sDbg.activeScreen, 'SETTINGS_MENU', 'Must track SETTINGS_MENU');

      await closeSettingsModal(page);
      await page.locator('button:has-text("MAPA ESTELAR")').click();
      await page.waitForTimeout(300);
      const lDbg = await getAudioDebugState(page);
      assertEqual(lDbg.activeScreen, 'LEVEL_MAP', 'Must track LEVEL_MAP');

      await page.locator('button:has-text("VOLVER")').click();
      await page.waitForTimeout(300);
      const mDbg = await getAudioDebugState(page);
      assertEqual(mDbg.activeScreen, 'MAIN_MENU', 'Must return to MAIN_MENU');
      assertEqual(mDbg.failedTracks.length, 0, 'Zero failedTracks across menu audio flow');
    },
  },
  {
    name: 't3_pair_audio_and_sensitivity_persistence_across_reload_combat',
    async run({ page, baseUrl }) {
      await gotoApp(page, baseUrl);
      await openSettingsFromMainMenu(page);
      await selectSettingsTab(page, 'AUDIO & CONTROL');

      const ranges = page.locator('input[type="range"]');
      assertGreaterThan(await ranges.count(), 3, 'Expected sensitivity + master + music + sfx sliders');
      await setRangeInputValue(ranges.nth(0), 2.2);
      await setRangeInputValue(ranges.nth(1), 0.4);
      await setRangeInputValue(ranges.nth(2), 0.3);
      await closeSettingsModal(page);

      await page.reload({ waitUntil: 'domcontentloaded' });
      await enterCombatMode(page, 'CAMPAÑA');
      await page.waitForTimeout(400);

      const prefs = await readStorageJson(page, PREFS_STORAGE_KEY);
      assert(prefs !== null, 'Preferences must persist across reload');
      assertInRange(prefs.sensitivity, 2.15, 2.25, 'Sensitivity 2.2 must persist into combat');

      const dbg = await getAudioDebugState(page);
      assert(dbg !== null, 'window.__AUDIO_DEBUG__ required');
      assertInRange(dbg.volumes.master, 0.35, 0.45, 'Master volume 0.4 must persist into combat');
      assertInRange(dbg.volumes.music, 0.25, 0.35, 'Music volume 0.3 must persist into combat');
    },
  },
  {
    name: 't3_pair_abort_mid_fire_resets_ammo_allies_and_audio',
    async run({ page, baseUrl }) {
      await gotoApp(page, baseUrl);
      await acquirePowerViaWaves(page, /ESCUADR[ÓO]N DE DRONES/i);

      await fireShots(page, 7, 190);
      const beforeAbort = await getAmmoState(page);
      assert(beforeAbort.current < 50, 'Ammo should be < 50 before abort');

      await abortToMainMenu(page);
      await page.waitForTimeout(350);
      const menuDbg = await getAudioDebugState(page);
      assert(menuDbg !== null, 'window.__AUDIO_DEBUG__ required');
      assertEqual(menuDbg.activeScreen, 'MAIN_MENU', 'Audio screen must reset to MAIN_MENU after abort');

      await enterCombatMode(page, 'CAMPAÑA');
      await waitForFrames(page, 6);
      const freshAmmo = await getAmmoState(page);
      assertEqual(freshAmmo.current, 50, 'Ammo must reset to 50 / ∞ on new match');

      const { stats } = await inspectMinimapPixels(page);
      assertEqual(stats.emeraldAllyPixels, 0, 'Ally markers must reset to 0 on new match');
    },
  },
];
