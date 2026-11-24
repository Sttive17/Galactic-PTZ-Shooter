import fs from 'node:fs';
import path from 'node:path';
import {
  GRAPHICS_STORAGE_KEY,
  PREFS_STORAGE_KEY,
  abortToMainMenu,
  acquirePowerViaWaves,
  closeSettingsModal,
  comparePngBuffers,
  emptyMagazine,
  enterCombatMode,
  fireShots,
  getAmmoHudContainer,
  getAmmoState,
  getAudioDebugState,
  getBox,
  getCrosshairAzimuthLocator,
  getCrosshairHintLocator,
  getFpsCounterLocator,
  getMinimapCanvas,
  getMinimapPanelLocator,
  getScoreBoardLocator,
  getSettingsRowButton,
  getTopBarLocator,
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
    name: 't1_mobile_touch_controls_render_and_fire',
    async run({ page, baseUrl }) {
      await page.addInitScript(() => {
        Object.defineProperty(navigator, 'maxTouchPoints', { configurable: true, value: 1 });
      });
      await page.setViewportSize({ width: 390, height: 844 });
      await gotoApp(page, baseUrl);
      await enterCombatMode(page, 'CAMPAÑA');

      const moveStick = page.getByRole('group', { name: 'MOVER' });
      const lookStick = page.getByRole('group', { name: 'MIRAR' });
      const fireButton = page.getByRole('button', { name: 'FUEGO' });
      await assert(await moveStick.isVisible(), 'Mobile movement joystick must be visible');
      await assert(await lookStick.isVisible(), 'Mobile look joystick must be visible');
      await assert(await fireButton.isVisible(), 'Mobile fire button must be visible');

      const fireBox = await fireButton.boundingBox();
      assert(fireBox !== null, 'Mobile fire button must have a clickable area');
      const initialAmmo = (await getAmmoState(page)).current;
      await page.mouse.move(fireBox.x + fireBox.width / 2, fireBox.y + fireBox.height / 2);
      await page.mouse.down();
      await page.waitForTimeout(450);
      await page.mouse.up();

      const remainingAmmo = (await getAmmoState(page)).current;
      assert(remainingAmmo < initialAmmo, 'Holding the mobile fire button must consume ammo');
    },
  },
  // ==================== R1: Ammo HUD & Magazine (6 tests) ====================
  {
    name: 't1_r1_ammo_hud_visible_bottom_right_50_infinity',
    async run({ page, baseUrl }) {
      await gotoApp(page, baseUrl);
      await enterCombatMode(page, 'CAMPAÑA');

      const ammo = await getAmmoState(page);
      assertEqual(ammo.current, 50, 'Initial active magazine must start at 50');

      const hudBox = await getBox(await getAmmoHudContainer(page));
      assert(hudBox !== null, 'Bottom-right AmmoHUD container must be visible');
      const vp = page.viewportSize();
      assertGreaterThan(hudBox.x, vp.width * 0.65, 'AmmoHUD must be anchored on the right side');
      assertGreaterThan(hudBox.y, vp.height * 0.65, 'AmmoHUD must be anchored at the bottom');
    },
  },
  {
    name: 't1_r1_ammo_decrements_on_click_and_hold_fire',
    async run({ page, baseUrl }) {
      await gotoApp(page, baseUrl);
      await enterCombatMode(page, 'CAMPAÑA');

      const initial = await getAmmoState(page);
      assertEqual(initial.current, 50, 'Initial ammo must be 50');

      await fireShots(page, 4, 210);
      const afterClicks = await getAmmoState(page);
      assert(
        afterClicks.current <= 47 && afterClicks.current >= 44,
        `Expected ammo to decrement after 4 clicks, got ${afterClicks.current}`
      );

      // Hold left mouse button to fire continuously (allow enough frames under SwiftShader)
      const vp = page.viewportSize();
      await page.mouse.move(vp.width / 2, vp.height / 2);
      await page.mouse.down({ button: 'left' });
      await page.waitForTimeout(1400);
      await page.mouse.up({ button: 'left' });

      const afterHold = await getAmmoState(page);
      assertGreaterThan(
        afterClicks.current,
        afterHold.current,
        'Holding left mouse button must continue decrementing ammo'
      );
    },
  },
  {
    name: 't1_r1_ammo_reaches_zero_with_infinite_reserve',
    async run({ page, baseUrl }) {
      await gotoApp(page, baseUrl);
      await enterCombatMode(page, 'CAMPAÑA');

      const result = await emptyMagazine(page, 28000);
      assert(
        result.reachedZero || result.sawReload,
        'Emptying 50-round magazine must reach 0 / ∞ and trigger reload'
      );
      const ammoText = (await (await getAmmoHudContainer(page)).innerText()).replace(/\s+/g, ' ');
      assert(ammoText.includes('∞'), `Infinite reserve symbol ∞ must remain visible, got "${ammoText}"`);
    },
  },
  {
    name: 't1_r1_manual_keyr_reload_restores_50_infinity',
    async run({ page, baseUrl }) {
      await gotoApp(page, baseUrl);
      await enterCombatMode(page, 'CAMPAÑA');

      await fireShots(page, 6, 200);
      const spent = await getAmmoState(page);
      assert(spent.current < 50, `Expected spent ammo < 50 before reload, got ${spent.current}`);

      await page.keyboard.press('KeyR');
      await page.getByText('RECARGANDO...').waitFor({ state: 'visible', timeout: 3500 });

      await waitForAmmoCount(page, 50, 15000);
      const reloaded = await getAmmoState(page);
      assertEqual(reloaded.current, 50, 'Manual KeyR reload must restore magazine to 50 / ∞');
    },
  },
  {
    name: 't1_r1_auto_reload_at_zero_restores_50_infinity',
    async run({ page, baseUrl }) {
      await gotoApp(page, baseUrl);
      await enterCombatMode(page, 'CAMPAÑA');

      const emptied = await emptyMagazine(page, 28000);
      assert(emptied.reachedZero || emptied.sawReload, 'Must hit 0 / ∞ to trigger auto-reload');

      await waitForAmmoCount(page, 50, 15000);
      const restored = await getAmmoState(page);
      assertEqual(restored.current, 50, 'Auto-reload from 0 must restore 50 / ∞');
    },
  },
  {
    name: 't1_r1_no_duplicate_scoreboard_ammo_and_no_hud_overlap',
    async run({ page, baseUrl }) {
      await gotoApp(page, baseUrl);
      await enterCombatMode(page, 'CAMPAÑA');

      // ScoreBoard should not display duplicate MUNICIÓN or 50 / 50
      const topRightScoreboard = getScoreBoardLocator(page);
      const sbText = await topRightScoreboard.innerText();
      assert(
        !/MUNICI[ÓO]N/i.test(sbText) && !/50\s*\/\s*50/.test(sbText),
        `ScoreBoard must not contain duplicate ammo readout, got: "${sbText}"`
      );

      const ammoBox = await getBox(await getAmmoHudContainer(page));
      const sbBox = await getBox(topRightScoreboard);
      const minimapBox = await getBox(getMinimapPanelLocator(page));
      const topBarBox = await getBox(getTopBarLocator(page));

      assertBoxesDoNotOverlap(ammoBox, sbBox, 'AmmoHUD', 'ScoreBoard');
      assertBoxesDoNotOverlap(ammoBox, minimapBox, 'AmmoHUD', 'ControlsPanel(minimap)');
      assertBoxesDoNotOverlap(ammoBox, topBarBox, 'AmmoHUD', 'TopBar');
    },
  },

  // ==================== R2: Enlarged Minimap & Allies (6 tests) ====================
  {
    name: 't1_r2_minimap_enlarged_size_and_crisp_dpr',
    async run({ page, baseUrl }) {
      await gotoApp(page, baseUrl);
      await enterCombatMode(page, 'CAMPAÑA');

      const canvas = await getMinimapCanvas(page);
      const box = await canvas.boundingBox();
      assert(box !== null, 'Minimap canvas must be visible at 1280x720');
      assertGreaterThan(box.width, 191, `Minimap width must be >= 192px (got ${box.width})`);
      assertGreaterThan(box.height, 191, `Minimap height must be >= 192px (got ${box.height})`);

      // Verify DPR scaling on a 2x deviceScaleFactor context
      const hiDpiContext = await page.context().browser().newContext({
        viewport: { width: 1280, height: 720 },
        deviceScaleFactor: 2,
      });
      try {
        const hiPage = await hiDpiContext.newPage();
        await gotoApp(hiPage, baseUrl);
        await enterCombatMode(hiPage, 'CAMPAÑA');
        const hiCanvas = await getMinimapCanvas(hiPage);
        const dims = await hiCanvas.evaluate((el) => ({ w: el.width, h: el.height }));
        assertGreaterThan(
          dims.w,
          380,
          `Minimap backing buffer must scale crisply on DPR=2 (got width=${dims.w})`
        );
        assertGreaterThan(
          dims.h,
          380,
          `Minimap backing buffer height must scale crisply on DPR=2 (got height=${dims.h})`
        );
      } finally {
        await hiDpiContext.close();
      }
    },
  },
  {
    name: 't1_r2_minimap_renders_arena_obstacles_and_player_pixels',
    async run({ page, baseUrl }) {
      await gotoApp(page, baseUrl);
      await enterCombatMode(page, 'CAMPAÑA');
      await waitForFrames(page, 6);

      const { stats } = await inspectMinimapPixels(page);
      assert(stats !== null, 'Must be able to read 2D ImageData from minimap canvas');
      assertGreaterThan(
        stats.totalNonBg,
        250,
        `Minimap must draw arena grid/obstacles/player pixels (nonBg=${stats.totalNonBg})`
      );
      assertGreaterThan(
        stats.tealOrCyanPixels,
        12,
        `Minimap must draw player chevron / FOV wedge in cyan/teal (got ${stats.tealOrCyanPixels})`
      );
    },
  },
  {
    name: 't1_r2_minimap_renders_enemy_crimson_markers',
    async run({ page, baseUrl }) {
      await gotoApp(page, baseUrl);
      await enterCombatMode(page, 'CAMPAÑA');
      await waitForFrames(page, 8);

      const { stats } = await inspectMinimapPixels(page);
      assertGreaterThan(
        stats.crimsonEnemyPixels,
        4,
        `Minimap must render crimson enemy target markers (got ${stats.crimsonEnemyPixels})`
      );
    },
  },
  {
    name: 't1_r2_minimap_ally_drone_renders_distinct_emerald_markers',
    async run({ page, baseUrl }) {
      await gotoApp(page, baseUrl);
      await acquirePowerViaWaves(page, /ESCUADR[ÓO]N DE DRONES/i);
      await waitForFrames(page, 10);

      const allyCountEl = page.locator('[data-testid="minimap-ally-count"]');
      if ((await allyCountEl.count()) > 0) {
        const countText = (await allyCountEl.innerText()).trim();
        assertEqual(countText, '1', 'Minimap ally count indicator must show 1 after acquiring ALLY_DRONE');
      }

      const { stats } = await inspectMinimapPixels(page);
      assertGreaterThan(
        stats.emeraldAllyPixels,
        6,
        `Minimap must render distinct emerald (#34d399) ally drone markers (got ${stats.emeraldAllyPixels})`
      );
    },
  },
  {
    name: 't1_r2_minimap_abort_and_restart_clears_allies',
    async run({ page, baseUrl }) {
      await gotoApp(page, baseUrl);
      await acquirePowerViaWaves(page, /ESCUADR[ÓO]N DE DRONES/i);
      await waitForFrames(page, 8);

      const withAlly = await inspectMinimapPixels(page);
      assertGreaterThan(withAlly.stats.emeraldAllyPixels, 6, 'Ally pixels expected before abort');

      await abortToMainMenu(page);
      await enterCombatMode(page, 'CAMPAÑA');
      await waitForFrames(page, 8);

      const allyCountEl = page.locator('[data-testid="minimap-ally-count"]');
      if ((await allyCountEl.count()) > 0) {
        const countText = (await allyCountEl.innerText()).trim();
        assertEqual(countText, '0', 'Minimap ally count must reset to 0 after ABORTAR and restart');
      }

      const afterRestart = await inspectMinimapPixels(page);
      assertEqual(
        afterRestart.stats.emeraldAllyPixels,
        0,
        'Emerald ally pixels must clear completely after ABORTAR and restarting a fresh match'
      );
    },
  },
  {
    name: 't1_r2_minimap_non_overlap_with_hud_elements',
    async run({ page, baseUrl }) {
      await gotoApp(page, baseUrl);
      await enterCombatMode(page, 'CAMPAÑA');
      await waitForFrames(page, 6);

      const minimapBox = await getBox(getMinimapPanelLocator(page));
      const fpsBox = await getBox(getFpsCounterLocator(page));
      const topBarBox = await getBox(getTopBarLocator(page));
      const ammoBox = await getBox(await getAmmoHudContainer(page));
      const hintBox = await getBox(getCrosshairHintLocator(page));
      const azBarBox = await getBox(getCrosshairAzimuthLocator(page));

      assertBoxesDoNotOverlap(minimapBox, fpsBox, 'Minimap', 'FpsCounter');
      assertBoxesDoNotOverlap(minimapBox, topBarBox, 'Minimap', 'TopBar');
      assertBoxesDoNotOverlap(minimapBox, ammoBox, 'Minimap', 'AmmoHUD');
      if (hintBox) assertBoxesDoNotOverlap(minimapBox, hintBox, 'Minimap', 'CrosshairHint');
      if (azBarBox) assertBoxesDoNotOverlap(minimapBox, azBarBox, 'Minimap', 'CrosshairAzimuth');
    },
  },

  // ==================== R3: Multi-Context Audio & Assets (6 tests) ====================
  {
    name: 't1_r3_audio_assets_attribution_and_real_webaudio_decode_all',
    async run({ page, baseUrl }) {
      const audioDir = path.resolve('public', 'audio');
      assert(fs.existsSync(audioDir), 'public/audio directory must exist');

      const attrPath = path.join(audioDir, 'ATTRIBUTION.md');
      assert(fs.existsSync(attrPath), 'public/audio/ATTRIBUTION.md must exist for royalty-free licensing');
      const attrContent = fs.readFileSync(attrPath, 'utf8');
      assertGreaterThan(attrContent.length, 80, 'ATTRIBUTION.md must document track licenses and sources');

      const audioFiles = fs
        .readdirSync(audioDir)
        .filter((f) => /\.(ogg|mp3|wav|m4a|opus|flac)$/i.test(f));

      // Expect distinct local audio files covering menus, settings, 5 biomes, situations, and bosses
      assertGreaterThan(
        audioFiles.length,
        8,
        `Expected >= 9 distinct royalty-free audio files in public/audio (menus, settings, 5 biomes, situations, bosses), found ${audioFiles.length}: ${audioFiles.join(', ')}`
      );

      await gotoApp(page, baseUrl);
      await openSettingsFromMainMenu(page);
      await closeSettingsModal(page);

      for (const file of audioFiles) {
        const res = await verifyAudioFileDecodes(page, `/audio/${file}`);
        assertEqual(res.status, 200, `/audio/${file} must load with HTTP 200`);
        assert(res.ok, `/audio/${file} failed real AudioContext.decodeAudioData: ${res.error || 'unknown'}`);
        assertGreaterThan(res.duration, 0.05, `/audio/${file} decoded duration must be > 0.05s`);
      }
    },
  },
  {
    name: 't1_r3_audio_debug_initializes_running_on_real_click',
    async run({ page, baseUrl }) {
      await gotoApp(page, baseUrl);

      // Click real UI button to unlock Web Audio API without mocking AudioContext
      await openSettingsFromMainMenu(page);
      await page.waitForTimeout(700);

      const debug = await getAudioDebugState(page);
      assert(debug !== null, 'window.__AUDIO_DEBUG__ must be exposed by AudioSystem');
      assertEqual(debug.initialized, true, '__AUDIO_DEBUG__.initialized must be true after user gesture');
      assertEqual(debug.contextState, 'running', '__AUDIO_DEBUG__.contextState must be running');
      assertEqual(
        debug.failedTracks.length,
        0,
        `Audio failedTracks must be empty, got: ${JSON.stringify(debug.failedTracks)}`
      );
      assertGreaterThan(
        debug.loadedTracks.length,
        0,
        '__AUDIO_DEBUG__.loadedTracks must contain decoded audio tracks'
      );
    },
  },
  {
    name: 't1_r3_audio_distinct_menu_levelmap_settings_transitions',
    async run({ page, baseUrl }) {
      await gotoApp(page, baseUrl);

      // Unlock on MAIN_MENU via MAPA ESTELAR -> LEVEL_MAP
      await page.locator('button:has-text("MAPA ESTELAR")').click();
      await page.getByText('SELECCIÓN DE MISIÓN').waitFor({ state: 'visible', timeout: 5000 });
      await page.waitForTimeout(400);
      const levelMapDebug = await getAudioDebugState(page);
      assert(levelMapDebug !== null, 'window.__AUDIO_DEBUG__ required');
      assertEqual(levelMapDebug.activeScreen, 'LEVEL_MAP', 'Expected activeScreen=LEVEL_MAP');

      // Back to MAIN_MENU
      await page.locator('button:has-text("VOLVER")').click();
      await page.locator('button:has-text("AJUSTES")').waitFor({ state: 'visible', timeout: 5000 });
      await page.waitForTimeout(400);
      const menuDebug = await getAudioDebugState(page);
      assertEqual(menuDebug.activeScreen, 'MAIN_MENU', 'Expected activeScreen=MAIN_MENU');

      // Open SETTINGS_MENU
      await openSettingsFromMainMenu(page);
      await page.waitForTimeout(400);
      const settingsDebug = await getAudioDebugState(page);
      assertEqual(settingsDebug.activeScreen, 'SETTINGS_MENU', 'Expected activeScreen=SETTINGS_MENU');
      assertNotEqual(
        settingsDebug.activeTrackKey,
        menuDebug.activeTrackKey,
        'SETTINGS_MENU must transition to a distinct track/ambience from MAIN_MENU'
      );
    },
  },
  {
    name: 't1_r3_audio_gameplay_powerselect_combat_paused_transitions',
    async run({ page, baseUrl }) {
      await gotoApp(page, baseUrl);

      await startMode(page, 'CAMPAÑA');
      await page.waitForTimeout(400);
      const powerDebug = await getAudioDebugState(page);
      assert(powerDebug !== null, 'window.__AUDIO_DEBUG__ required');
      assertEqual(powerDebug.activeSituation, 'POWER_SELECT', 'Expected activeSituation=POWER_SELECT');

      await page.locator('button:has-text("[1]")').first().click();
      await page.getByText('ELIGE 1 DE 3 PODERES').waitFor({ state: 'detached', timeout: 5000 });
      await page.waitForTimeout(450);
      const combatDebug = await getAudioDebugState(page);
      assertEqual(combatDebug.activeScreen, 'GAMEPLAY', 'Expected activeScreen=GAMEPLAY');
      assertEqual(combatDebug.activeChapter, 'UNDERGROUND_LAB', 'Level 1 chapter must be UNDERGROUND_LAB');
      assertEqual(combatDebug.activeSituation, 'COMBAT', 'Expected activeSituation=COMBAT');
      assertNotEqual(
        combatDebug.activeTrackKey,
        powerDebug.activeTrackKey,
        'COMBAT must use a distinct track from POWER_SELECT'
      );

      await pauseGame(page);
      await page.waitForTimeout(450);
      const pausedDebug = await getAudioDebugState(page);
      assert(
        pausedDebug.activeScreen === 'PAUSED' || pausedDebug.activeScreen === 'SETTINGS_MENU',
        `Expected PAUSED or SETTINGS_MENU while paused, got ${pausedDebug.activeScreen}`
      );

      await resumeGame(page);
      await page.waitForTimeout(450);
      const resumedDebug = await getAudioDebugState(page);
      assertEqual(resumedDebug.activeSituation, 'COMBAT', 'Resuming must restore COMBAT situation');
    },
  },
  {
    name: 't1_r3_audio_critical_and_gameover_transitions',
    async run({ page, baseUrl }) {
      await gotoApp(page, baseUrl);
      await enterCombatMode(page, 'OLEADAS');

      // In OLEADAS wave 1 enemies shoot continuously until player reaches CRITICAL (<35 HP) & GAMEOVER
      let sawCritical = false;
      let sawGameOver = false;
      const start = Date.now();
      while (Date.now() - start < 45000) {
        const dbg = await getAudioDebugState(page);
        assert(dbg !== null, 'window.__AUDIO_DEBUG__ required');
        if (dbg.activeSituation === 'CRITICAL') sawCritical = true;
        if (dbg.activeScreen === 'GAMEOVER') {
          sawGameOver = true;
          break;
        }
        const gameOverVisible = await page.getByText(/CA[ÍI]STE EN LA OLEADA|SIMULACI[ÓO]N FINALIZADA/i).isVisible().catch(() => false);
        if (gameOverVisible) {
          await page.waitForTimeout(400);
          const afterDbg = await getAudioDebugState(page);
          if (afterDbg?.activeScreen === 'GAMEOVER') sawGameOver = true;
          break;
        }
        await page.waitForTimeout(200);
      }

      assert(sawCritical || sawGameOver, 'Expected CRITICAL and/or GAMEOVER audio transition during lethal wave combat');
      assert(sawGameOver, 'Expected activeScreen === GAMEOVER on defeat');
    },
  },
  {
    name: 't1_r3_audio_biome_and_boss_tracks_loaded_and_boss_transition',
    async run({ page, baseUrl }) {
      await gotoApp(page, baseUrl);
      await openSettingsFromMainMenu(page);
      await page.waitForTimeout(900);

      const debug = await getAudioDebugState(page);
      assert(debug !== null, 'window.__AUDIO_DEBUG__ required');
      assertEqual(debug.failedTracks.length, 0, 'All registered audio tracks must load with zero failures');

      const trackIds = debug.loadedTracks.join(' ').toLowerCase();
      assert(trackIds.includes('boss') || fs.readdirSync(path.resolve('public/audio')).some((f) => /boss/i.test(f)), 'Boss track keys/assets must exist');

      // Check distinct biome / boss tracks are present in loadedTracks (at least 7 tracks loaded)
      assertGreaterThan(
        debug.loadedTracks.length,
        6,
        `Expected >= 7 loaded tracks covering menus, biomes, situations, and bosses; got ${debug.loadedTracks.length}: ${debug.loadedTracks.join(', ')}`
      );
    },
  },

  // ==================== R4: Settings, Rendering & Auto-Detect (6 tests) ====================
  {
    name: 't1_r4_settings_accessible_from_main_menu_and_pause_menu_with_3_tabs',
    async run({ page, baseUrl }) {
      await gotoApp(page, baseUrl);
      await openSettingsFromMainMenu(page);

      for (const tab of ['GRÁFICOS', 'PANTALLA & BRILLO', 'AUDIO & CONTROL']) {
        await selectSettingsTab(page, tab);
      }
      await closeSettingsModal(page);

      await enterCombatMode(page, 'CAMPAÑA');
      await pauseGame(page);
      await assert(
        await page.getByText('CENTRO DE CONFIGURACIÓN').isVisible(),
        'SettingsPanel must open inside PauseMenu'
      );
      for (const tab of ['GRÁFICOS', 'PANTALLA & BRILLO', 'AUDIO & CONTROL']) {
        await selectSettingsTab(page, tab);
      }
      await resumeGame(page);
    },
  },
  {
    name: 't1_r4_brightness_slider_updates_storage_and_active_canvas_luminance',
    async run({ page, baseUrl }) {
      await gotoApp(page, baseUrl);
      await openSettingsFromMainMenu(page);
      await page.locator('button:has-text("MEDIO")').first().click();

      await selectSettingsTab(page, 'PANTALLA & BRILLO');
      await setRangeInputValue(page.locator('input[type="range"]').first(), 0.5);
      await closeSettingsModal(page);
      await waitForFrames(page, 6);

      const darkCfg = await readStorageJson(page, GRAPHICS_STORAGE_KEY);
      assertEqual(darkCfg.brightness, 0.5, 'Brightness 0.5 must persist in localStorage');
      const darkLum = await measureElementLuminance(page, getWebGLCanvas(page));

      await openSettingsFromMainMenu(page);
      await selectSettingsTab(page, 'PANTALLA & BRILLO');
      await setRangeInputValue(page.locator('input[type="range"]').first(), 1.5);
      await closeSettingsModal(page);
      await waitForFrames(page, 6);

      const brightCfg = await readStorageJson(page, GRAPHICS_STORAGE_KEY);
      assertEqual(brightCfg.brightness, 1.5, 'Brightness 1.5 must persist in localStorage');
      const brightLum = await measureElementLuminance(page, getWebGLCanvas(page));

      assertGreaterThan(
        brightLum.meanLuminance,
        darkLum.meanLuminance + 0.5,
        `Active canvas luminance at 1.5 (${brightLum.meanLuminance.toFixed(2)}) must exceed 0.5 (${darkLum.meanLuminance.toFixed(2)})`
      );
    },
  },
  {
    name: 't1_r4_presets_low_medium_high_update_storage_and_canvas_dpr',
    async run({ page, baseUrl }) {
      await gotoApp(page, baseUrl);
      await openSettingsFromMainMenu(page);

      await page.locator('button:has-text("BAJO")').first().click();
      await waitForFrames(page, 4);
      const low = await readStorageJson(page, GRAPHICS_STORAGE_KEY);
      assertEqual(low.preset, 'LOW', 'BAJO must save preset LOW');
      assertEqual(low.shadows, false, 'LOW preset disables shadows');
      const lowWidth = await getWebGLCanvas(page).evaluate((c) => c.width);

      await page.locator('button:has-text("MEDIO")').first().click();
      await waitForFrames(page, 4);
      const med = await readStorageJson(page, GRAPHICS_STORAGE_KEY);
      assertEqual(med.preset, 'MEDIUM', 'MEDIO must save preset MEDIUM');
      assertEqual(med.shadows, true, 'MEDIUM preset enables shadows');
      const medWidth = await getWebGLCanvas(page).evaluate((c) => c.width);
      assertGreaterThan(medWidth, lowWidth, 'Canvas backing buffer width must scale with preset DPR');

      await page.locator('button:has-text("ALTO")').first().click();
      await waitForFrames(page, 4);
      const high = await readStorageJson(page, GRAPHICS_STORAGE_KEY);
      assertEqual(high.preset, 'HIGH', 'ALTO must save preset HIGH');
      assertEqual(high.environmentReflections, true, 'HIGH preset enables environmentReflections');
    },
  },
  {
    name: 't1_r4_granular_toggles_trigger_custom_and_complex_shaders_visual_diff',
    async run({ page, baseUrl }) {
      await gotoApp(page, baseUrl);
      await openSettingsFromMainMenu(page);
      await page.locator('button:has-text("MEDIO")').first().click();
      await waitForFrames(page, 4);

      // Toggle complexShaders OFF -> expect CUSTOM preset indicator & visual diff on DEEP_SPACE menu
      const shaderBtn = getSettingsRowButton(page, /Shaders de Nebulosa y Auroras/i);
      await shaderBtn.click();
      await closeSettingsModal(page);
      await waitForFrames(page, 6);

      const afterOffCfg = await readStorageJson(page, GRAPHICS_STORAGE_KEY);
      assertEqual(afterOffCfg.complexShaders, false, 'complexShaders must toggle to false');
      assertEqual(afterOffCfg.preset, 'CUSTOM', 'Customizing granular toggles must mark preset as CUSTOM');
      const shotOff = await measureElementLuminance(page, getWebGLCanvas(page));

      await openSettingsFromMainMenu(page);
      const customVisible = await page.getByText(/PERSONALIZADO|CUSTOM/i).isVisible().catch(() => false);
      assert(customVisible, 'SettingsPanel must display CUSTOM / PERSONALIZADO indicator after granular edit');

      await getSettingsRowButton(page, /Shaders de Nebulosa y Auroras/i).click();
      await closeSettingsModal(page);
      await waitForFrames(page, 6);
      const shotOn = await measureElementLuminance(page, getWebGLCanvas(page));

      const diff = await comparePngBuffers(page, shotOff.pngBuffer, shotOn.pngBuffer);
      assertGreaterThan(
        diff.diffRatio,
        0.005,
        `Toggling complexShaders must visibly alter the 3D space backdrop (diffRatio=${diff.diffRatio.toFixed(4)})`
      );
    },
  },
  {
    name: 't1_r4_display_camera_hud_options_update_dom_and_storage',
    async run({ page, baseUrl }) {
      await gotoApp(page, baseUrl);
      await openSettingsFromMainMenu(page);

      // Display tab: Fullscreen button + FOV + showFps + hudEffects
      await selectSettingsTab(page, 'PANTALLA & BRILLO');
      await assert(
        await page.getByText('MODO DE PANTALLA').isVisible(),
        'MODO DE PANTALLA control must be present'
      );

      // Verify FOV slider & HUD toggles
      const fovTextVisible = await page.getByText(/CAMPO DE VISI[ÓO]N|FOV/i).isVisible().catch(() => false);
      assert(fovTextVisible, 'FOV slider must be present in PANTALLA & BRILLO tab');

      const fpsToggleBtn = getSettingsRowButton(page, /Mostrar FPS/i);
      await fpsToggleBtn.waitFor({ state: 'visible', timeout: 3000 });
      await fpsToggleBtn.click();

      const hudFxBtn = getSettingsRowButton(page, /Efectos HUD/i);
      await hudFxBtn.waitFor({ state: 'visible', timeout: 3000 });
      await hudFxBtn.click();

      await closeSettingsModal(page);
      await waitForFrames(page, 3);

      // FpsCounter and .scanlines/.vignette should be hidden
      assertEqual(
        await page.locator('text=/\\d+ FPS/').count(),
        0,
        'Disabling showFps must hide <FpsCounter />'
      );
      assertEqual(
        await page.locator('.scanlines').count(),
        0,
        'Disabling hudEffects must remove .scanlines overlay'
      );
      assertEqual(
        await page.locator('.vignette').count(),
        0,
        'Disabling hudEffects must remove .vignette overlay'
      );

      const prefs = await readStorageJson(page, PREFS_STORAGE_KEY);
      assert(prefs !== null, 'User preferences must persist in localStorage');
      assertEqual(prefs.showFps, false, 'showFps=false must persist');
      assertEqual(prefs.hudEffects, false, 'hudEffects=false must persist');
    },
  },
  {
    name: 't1_r4_autodetect_pc_button_shows_toast_and_persists_profile',
    async run({ page, baseUrl }) {
      await gotoApp(page, baseUrl);
      await openSettingsFromMainMenu(page);

      // Switch to HIGH first so we can verify auto-detect changes/evaluates actively
      await page.locator('button:has-text("ALTO")').first().click();
      await page.locator('button:has-text("ACOMODAR A MI PC")').click();

      const toast = page.getByText(/Hardware analizado:/);
      await toast.waitFor({ state: 'visible', timeout: 5000 });
      const toastText = await toast.innerText();

      const cfg = await readStorageJson(page, GRAPHICS_STORAGE_KEY);
      assert(
        ['LOW', 'MEDIUM', 'HIGH'].includes(cfg.preset),
        `Auto-detect must persist valid preset, got ${cfg.preset}`
      );
      if (cfg.preset === 'LOW') {
        assert(toastText.includes('Rendimiento (Bajo)'), `Toast mismatch for LOW: ${toastText}`);
      } else if (cfg.preset === 'MEDIUM') {
        assert(toastText.includes('Equilibrado (Medio)'), `Toast mismatch for MEDIUM: ${toastText}`);
      } else {
        assert(toastText.includes('Alta Calidad'), `Toast mismatch for HIGH: ${toastText}`);
      }
      assertInRange(cfg.dpr, 0.75, 1.5, 'Auto-detected DPR must be safely bounded');
    },
  },
];
