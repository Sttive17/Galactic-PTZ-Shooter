import fs from 'node:fs';
import path from 'node:path';
import {
  GRAPHICS_STORAGE_KEY,
  PREFS_STORAGE_KEY,
  abortToMainMenu,
  acquirePowerViaWaves,
  closeSettingsModal,
  emptyMagazine,
  enterCombatMode,
  fireShots,
  getAmmoHudContainer,
  getAmmoState,
  getAudioDebugState,
  getBox,
  getFpsCounterLocator,
  getMinimapCanvas,
  getMinimapPanelLocator,
  getScoreBoardLocator,
  getSettingsRowButton,
  getTopBarLocator,
  gotoApp,
  inspectMinimapPixels,
  openSettingsFromMainMenu,
  pauseGame,
  readStorageJson,
  resumeGame,
  selectSettingsTab,
  setRangeInputValue,
  startMode,
  verifyAudioFileDecodes,
  waitForAmmoCount,
  waitForFrames,
} from '../helpers/app.mjs';
import {
  assert,
  assertBoxesDoNotOverlap,
  assertEqual,
  assertGreaterThan,
  assertInRange,
  assertNotEqual,
} from '../helpers/assertions.mjs';

export const tests = [
  {
    name: 't4_scenario1_first_time_pc_autosetup_persistence_and_campaign_fire_reload',
    async run({ page, baseUrl }) {
      await gotoApp(page, baseUrl);

      // First-time PC auto-setup + brightness + sensitivity
      await openSettingsFromMainMenu(page);
      await page.locator('button:has-text("ACOMODAR A MI PC")').click();
      await page.getByText(/Hardware analizado:/).waitFor({ state: 'visible', timeout: 5000 });

      await selectSettingsTab(page, 'PANTALLA & BRILLO');
      await setRangeInputValue(page.locator('input[type="range"]').first(), 1.25);

      await selectSettingsTab(page, 'AUDIO & CONTROL');
      await setRangeInputValue(page.locator('input[type="range"]').first(), 1.6);
      await closeSettingsModal(page);

      // Reload and confirm settings persisted
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.locator('button:has-text("CAMPAÑA")').waitFor({ state: 'visible', timeout: 10000 });

      const gfx = await readStorageJson(page, GRAPHICS_STORAGE_KEY);
      const prefs = await readStorageJson(page, PREFS_STORAGE_KEY);
      assertEqual(gfx.brightness, 1.25, 'Brightness 1.25 must persist across reload');
      assert(prefs !== null, 'Preferences must persist across reload');
      assertInRange(prefs.sensitivity, 1.55, 1.65, 'Sensitivity 1.6 must persist across reload');

      // Enter Campaign combat, empty magazine to 0 / ∞, auto-reload, then manual KeyR reload
      await enterCombatMode(page, 'CAMPAÑA');
      assertEqual((await getAmmoState(page)).current, 50, 'Campaign starts with 50 / ∞');

      await emptyMagazine(page, 28000);
      await waitForAmmoCount(page, 50, 15000);
      assertEqual((await getAmmoState(page)).current, 50, 'Auto-reload restores 50 / ∞');

      await fireShots(page, 5, 200);
      assert((await getAmmoState(page)).current < 50, 'Firing decrements from 50');
      await page.keyboard.press('KeyR');
      await waitForAmmoCount(page, 50, 15000);
      assertEqual((await getAmmoState(page)).current, 50, 'Manual KeyR restores 50 / ∞');
    },
  },
  {
    name: 't4_scenario2_tactical_squad_combat_minimap_and_midgame_pause_settings',
    async run({ page, baseUrl }) {
      await gotoApp(page, baseUrl);
      await acquirePowerViaWaves(page, /ESCUADR[ÓO]N DE DRONES/i);
      await waitForFrames(page, 8);

      const mBox = await (await getMinimapCanvas(page)).boundingBox();
      assertGreaterThan(mBox.width, 191, 'Enlarged minimap >= 192px in squad combat');

      const { stats } = await inspectMinimapPixels(page);
      assertGreaterThan(stats.emeraldAllyPixels, 6, 'Ally marker visible on minimap');
      assertGreaterThan(stats.crimsonEnemyPixels, 4, 'Enemy markers visible on minimap');

      await fireShots(page, 4, 200);
      await page.keyboard.press('KeyR');

      // Pause mid-game -> adjust audio mute & brightness -> resume
      await pauseGame(page);
      await page.waitForTimeout(300);
      const pausedDbg = await getAudioDebugState(page);
      assert(pausedDbg !== null, 'window.__AUDIO_DEBUG__ required');
      assert(
        pausedDbg.activeScreen === 'PAUSED' || pausedDbg.activeScreen === 'SETTINGS_MENU',
        'Audio reflects paused state'
      );

      await selectSettingsTab(page, 'PANTALLA & BRILLO');
      await setRangeInputValue(page.locator('input[type="range"]').first(), 1.15);
      await selectSettingsTab(page, 'AUDIO & CONTROL');
      await page.locator('button:has-text("SILENCIAR")').click();

      await resumeGame(page);
      await page.waitForTimeout(300);
      const resumedDbg = await getAudioDebugState(page);
      assertEqual(resumedDbg.activeSituation, 'COMBAT', 'Audio returns to COMBAT on resume');
      assertEqual(resumedDbg.volumes.muted, true, 'Mute state persists on resume');

      // Abort and verify clean reset in next match
      await abortToMainMenu(page);
      await enterCombatMode(page, 'CAMPAÑA');
      await waitForFrames(page, 6);
      assertEqual((await getAmmoState(page)).current, 50, 'Ammo resets cleanly to 50 / ∞');
      assertEqual((await inspectMinimapPixels(page)).stats.emeraldAllyPixels, 0, 'Allies reset cleanly');
    },
  },
  {
    name: 't4_scenario3_full_audio_asset_verification_and_lifecycle_transitions',
    async run({ page, baseUrl }) {
      const audioDir = path.resolve('public', 'audio');
      assert(fs.existsSync(path.join(audioDir, 'ATTRIBUTION.md')), 'ATTRIBUTION.md required');
      const files = fs
        .readdirSync(audioDir)
        .filter((f) => /\.(ogg|mp3|wav|m4a|opus|flac)$/i.test(f));
      assertGreaterThan(files.length, 8, 'Expected >= 9 royalty-free audio files in public/audio/');

      await gotoApp(page, baseUrl);
      await openSettingsFromMainMenu(page);
      await page.waitForTimeout(600);

      for (const file of files) {
        const res = await verifyAudioFileDecodes(page, `/audio/${file}`);
        assertEqual(res.status, 200, `Audio ${file} HTTP 200`);
        assert(res.ok, `Audio ${file} decodeAudioData succeeded`);
      }

      const settingsDbg = await getAudioDebugState(page);
      assert(settingsDbg !== null, 'window.__AUDIO_DEBUG__ required');
      assertEqual(settingsDbg.contextState, 'running', 'AudioContext running after gesture');
      assertEqual(settingsDbg.activeScreen, 'SETTINGS_MENU', 'SETTINGS_MENU active');
      assertEqual(settingsDbg.failedTracks.length, 0, 'Zero failedTracks');

      await closeSettingsModal(page);
      await page.locator('button:has-text("MAPA ESTELAR")').click();
      await page.waitForTimeout(300);
      const mapDbg = await getAudioDebugState(page);
      assertEqual(mapDbg.activeScreen, 'LEVEL_MAP', 'LEVEL_MAP active');
      assertNotEqual(mapDbg.activeTrackKey, settingsDbg.activeTrackKey, 'Distinct track between SETTINGS_MENU and LEVEL_MAP');

      await page.locator('button:has-text("VOLVER")').click();
      await startMode(page, 'OLEADAS');
      await page.waitForTimeout(300);
      assertEqual((await getAudioDebugState(page)).activeSituation, 'POWER_SELECT', 'POWER_SELECT active');

      await page.locator('button:has-text("[1]")').first().click();
      await page.getByText('ELIGE 1 DE 3 PODERES').waitFor({ state: 'detached', timeout: 5000 });
      await page.waitForTimeout(350);
      assertEqual((await getAudioDebugState(page)).activeSituation, 'COMBAT', 'COMBAT active');

      // Wait for wave enemies to drive CRITICAL -> GAMEOVER
      let reachedGameOver = false;
      const start = Date.now();
      while (Date.now() - start < 45000) {
        const dbg = await getAudioDebugState(page);
        if (dbg?.activeScreen === 'GAMEOVER') {
          reachedGameOver = true;
          break;
        }
        await page.waitForTimeout(250);
      }
      assert(reachedGameOver, 'Must transition to GAMEOVER audio state on defeat');
    },
  },
  {
    name: 't4_scenario4_responsive_multi_viewport_hud_layout',
    async run({ page, baseUrl }) {
      await gotoApp(page, baseUrl);
      await enterCombatMode(page, 'CAMPAÑA');

      for (const vp of [
        { width: 1280, height: 720 },
        { width: 1024, height: 768 },
        { width: 768, height: 720 },
      ]) {
        await page.setViewportSize(vp);
        await waitForFrames(page, 4);

        const minimapBox = await getBox(getMinimapPanelLocator(page));
        const ammoBox = await getBox(await getAmmoHudContainer(page));
        const sbBox = await getBox(getScoreBoardLocator(page));
        const topBarBox = await getBox(getTopBarLocator(page));
        const fpsBox = await getBox(getFpsCounterLocator(page));

        assertBoxesDoNotOverlap(minimapBox, ammoBox, `Minimap@${vp.width}`, `AmmoHUD@${vp.width}`);
        assertBoxesDoNotOverlap(minimapBox, sbBox, `Minimap@${vp.width}`, `ScoreBoard@${vp.width}`);
        assertBoxesDoNotOverlap(minimapBox, topBarBox, `Minimap@${vp.width}`, `TopBar@${vp.width}`);
        assertBoxesDoNotOverlap(ammoBox, sbBox, `AmmoHUD@${vp.width}`, `ScoreBoard@${vp.width}`);
        assertBoxesDoNotOverlap(minimapBox, fpsBox, `Minimap@${vp.width}`, `FpsCounter@${vp.width}`);
      }

      // Below md (<768px): minimap hides cleanly, AmmoHUD stays visible
      await page.setViewportSize({ width: 640, height: 720 });
      await waitForFrames(page, 4);
      assertEqual(
        await page.locator('[data-testid="minimap-panel"]').isVisible().catch(() => false),
        false,
        'Minimap hides cleanly on 640x720'
      );
      assertEqual((await getAmmoState(page)).current, 50, 'AmmoHUD remains visible on 640x720');

      // Toggle showFps and hudEffects mid-match
      await pauseGame(page);
      await selectSettingsTab(page, 'PANTALLA & BRILLO');
      await getSettingsRowButton(page, /Mostrar FPS/i).click();
      await getSettingsRowButton(page, /Efectos HUD/i).click();
      await resumeGame(page);

      assertEqual(await page.locator('text=/\\d+ FPS/').count(), 0, 'FPS counter hidden when toggled off');
      assertEqual(await page.locator('.scanlines').count(), 0, 'Scanlines hidden when hudEffects off');
    },
  },
  {
    name: 't4_scenario5_corrupted_storage_recovery_and_rapid_ui_gameplay_stress',
    async run({ page, baseUrl }) {
      await gotoApp(page, baseUrl);
      await page.evaluate(
        ({ gKey, pKey }) => {
          localStorage.setItem(gKey, '{{{BAD_JSON');
          localStorage.setItem(pKey, '{{{BAD_PREFS');
        },
        { gKey: GRAPHICS_STORAGE_KEY, pKey: PREFS_STORAGE_KEY }
      );

      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.locator('button:has-text("CAMPAÑA")').waitFor({ state: 'visible', timeout: 10000 });

      // Recover via auto-detect & rapid UI stress
      await openSettingsFromMainMenu(page);
      await page.locator('button:has-text("ACOMODAR A MI PC")').click();
      await page.getByText(/Hardware analizado:/).waitFor({ state: 'visible', timeout: 5000 });
      await page.keyboard.press('Escape');
      await page.getByText('CENTRO DE CONFIGURACIÓN').waitFor({ state: 'detached', timeout: 3000 });

      for (let i = 0; i < 3; i++) {
        await page.locator('button:has-text("MAPA ESTELAR")').click();
        await page.locator('button:has-text("VOLVER")').click();
      }

      await enterCombatMode(page, 'CAMPAÑA');
      await fireShots(page, 6, 185);
      assert((await getAmmoState(page)).current < 50, 'Firing works after rapid UI stress');
      await page.keyboard.press('KeyR');
      await waitForAmmoCount(page, 50, 15000);
      assertEqual((await getAmmoState(page)).current, 50, 'Reload works cleanly after stress');

      const dbg = await getAudioDebugState(page);
      assert(dbg !== null, 'window.__AUDIO_DEBUG__ required');
      assertEqual(dbg.failedTracks.length, 0, 'Zero audio failures after corrupted recovery + rapid stress');
    },
  },
];
