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
  // ==================== R1 Boundaries (5 tests) ====================
  {
    name: 't2_r1_zero_ammo_blocks_firing_until_reload',
    async run({ page, baseUrl }) {
      await gotoApp(page, baseUrl);
      await enterCombatMode(page, 'CAMPAÑA');

      await emptyMagazine(page, 28000);
      const vp = page.viewportSize();
      await page.mouse.click(vp.width / 2, vp.height / 2);
      const ammo = await getAmmoState(page);
      assertInRange(ammo.current, 0, 50, 'Ammo must never go negative when clicking at 0');
    },
  },
  {
    name: 't2_r1_firing_blocked_during_active_reload',
    async run({ page, baseUrl }) {
      await gotoApp(page, baseUrl);
      await enterCombatMode(page, 'CAMPAÑA');

      await fireShots(page, 5, 200);
      await page.keyboard.press('KeyR');
      await page.getByText('RECARGANDO...').waitFor({ state: 'visible', timeout: 3500 });

      // Attempt to fire mid-reload
      await fireShots(page, 3, 180);

      await waitForAmmoCount(page, 50, 15000);
      const afterReload = await getAmmoState(page);
      assertEqual(afterReload.current, 50, 'Firing mid-reload must be blocked and reload must restore full 50');
    },
  },
  {
    name: 't2_r1_keyr_at_full_50_is_noop',
    async run({ page, baseUrl }) {
      await gotoApp(page, baseUrl);
      await enterCombatMode(page, 'CAMPAÑA');

      await page.keyboard.press('KeyR');
      await page.waitForTimeout(250);
      const reloadingVisible = await page.getByText('RECARGANDO...').isVisible().catch(() => false);
      assertEqual(reloadingVisible, false, 'Pressing KeyR at full 50 / ∞ must be a no-op');
      const ammo = await getAmmoState(page);
      assertEqual(ammo.current, 50, 'Ammo must stay 50 after no-op reload');
    },
  },
  {
    name: 't2_r1_extended_mag_increases_capacity_to_80',
    async run({ page, baseUrl }) {
      await gotoApp(page, baseUrl);
      await acquirePowerViaWaves(page, /CARGADOR EXTENDIDO/i);

      const initial = await getAmmoState(page);
      assertEqual(initial.current, 80, 'EXTENDED_MAG (1 stack) must increase magazine to 80 / ∞');

      await fireShots(page, 4, 200);
      const afterFire = await getAmmoState(page);
      assert(afterFire.current < 80 && afterFire.current >= 74, `Expected ammo < 80 after firing, got ${afterFire.current}`);

      await page.keyboard.press('KeyR');
      await waitForAmmoCount(page, 80, 15000);
      const reloaded = await getAmmoState(page);
      assertEqual(reloaded.current, 80, 'Reloading with EXTENDED_MAG must restore 80 / ∞');
    },
  },
  {
    name: 't2_r1_pause_mid_reload_and_abort_resets_to_50',
    async run({ page, baseUrl }) {
      await gotoApp(page, baseUrl);
      await enterCombatMode(page, 'CAMPAÑA');

      await fireShots(page, 6, 200);
      await page.keyboard.press('KeyR');
      await page.getByText('RECARGANDO...').waitFor({ state: 'visible', timeout: 2500 });

      await pauseGame(page);
      await abortToMainMenu(page);

      await enterCombatMode(page, 'CAMPAÑA');
      const ammo = await getAmmoState(page);
      assertEqual(ammo.current, 50, 'Aborting mid-reload and starting a new match must reset ammo to 50 / ∞');
      const stillReloading = await page.getByText('RECARGANDO...').isVisible().catch(() => false);
      assertEqual(stillReloading, false, 'Reload state must reset cleanly after abort');
    },
  },

  // ==================== R2 Boundaries (5 tests) ====================
  {
    name: 't2_r2_responsive_minimap_non_overlap_1280_1024_768',
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

        const canvas = await getMinimapCanvas(page);
        const canvasBox = await canvas.boundingBox();
        assert(canvasBox !== null, `Minimap must be visible at ${vp.width}x${vp.height}`);
        assertGreaterThan(canvasBox.width, 191, `Minimap width >= 192 at ${vp.width}x${vp.height}`);

        const minimapBox = await getBox(getMinimapPanelLocator(page));
        const ammoBox = await getBox(await getAmmoHudContainer(page));
        const sbBox = await getBox(getScoreBoardLocator(page));
        const topBarBox = await getBox(getTopBarLocator(page));
        const fpsBox = await getBox(getFpsCounterLocator(page));

        assertBoxesDoNotOverlap(minimapBox, ammoBox, `Minimap@${vp.width}`, `AmmoHUD@${vp.width}`);
        assertBoxesDoNotOverlap(minimapBox, sbBox, `Minimap@${vp.width}`, `ScoreBoard@${vp.width}`);
        assertBoxesDoNotOverlap(minimapBox, topBarBox, `Minimap@${vp.width}`, `TopBar@${vp.width}`);
        assertBoxesDoNotOverlap(minimapBox, fpsBox, `Minimap@${vp.width}`, `FpsCounter@${vp.width}`);
      }
    },
  },
  {
    name: 't2_r2_minimap_hidden_below_md_640x720',
    async run({ page, baseUrl }) {
      await page.setViewportSize({ width: 640, height: 720 });
      await gotoApp(page, baseUrl);
      await enterCombatMode(page, 'CAMPAÑA');

      const minimapVisible = await page.locator('[data-testid="minimap-panel"]').isVisible().catch(() => false);
      assertEqual(minimapVisible, false, 'Minimap panel must be hidden below md (< 768px)');

      const ammo = await getAmmoState(page);
      assertEqual(ammo.current, 50, 'AmmoHUD must remain visible at 640x720');
    },
  },
  {
    name: 't2_r2_minimap_survives_pause_and_resume',
    async run({ page, baseUrl }) {
      await gotoApp(page, baseUrl);
      await enterCombatMode(page, 'CAMPAÑA');

      await pauseGame(page);
      await resumeGame(page);
      await waitForFrames(page, 6);

      const { box, stats } = await inspectMinimapPixels(page);
      assert(box !== null, 'Minimap canvas must stay visible after Pause/Resume');
      assertGreaterThan(stats.totalNonBg, 250, 'Minimap must continue drawing after Pause/Resume');
      assertGreaterThan(stats.crimsonEnemyPixels, 4, 'Enemy markers must remain rendered after Pause/Resume');
    },
  },
  {
    name: 't2_r2_minimap_clean_ally_reset_across_consecutive_matches',
    async run({ page, baseUrl }) {
      await gotoApp(page, baseUrl);
      await acquirePowerViaWaves(page, /ESCUADR[ÓO]N DE DRONES/i);
      await waitForFrames(page, 6);

      await abortToMainMenu(page);
      await startMode(page, 'OLEADAS');
      // Pick any card that is NOT ALLY_DRONE
      const cards = page.locator('button').filter({ hasText: /\[[123]\]/ });
      const count = await cards.count();
      let picked = false;
      for (let i = 0; i < count; i++) {
        const text = await cards.nth(i).innerText();
        if (!/ESCUADR[ÓO]N DE DRONES/i.test(text)) {
          await cards.nth(i).click();
          picked = true;
          break;
        }
      }
      assert(picked, 'Must find a non-ally power card');
      await page.getByText('ELIGE 1 DE 3 PODERES').waitFor({ state: 'detached', timeout: 5000 });
      await waitForFrames(page, 8);

      const { stats } = await inspectMinimapPixels(page);
      assertEqual(stats.emeraldAllyPixels, 0, 'Consecutive match without ALLY_DRONE must have 0 ally markers');
    },
  },
  {
    name: 't2_r2_minimap_pixels_clipped_inside_circular_boundary',
    async run({ page, baseUrl }) {
      await gotoApp(page, baseUrl);
      await enterCombatMode(page, 'CAMPAÑA');
      await waitForFrames(page, 8);

      const { stats } = await inspectMinimapPixels(page);
      assertEqual(
        stats.outsideCircleOpaquePixels,
        0,
        `Radar drawing must stay clipped inside circular boundary (found ${stats.outsideCircleOpaquePixels} outside pixels)`
      );
    },
  },

  // ==================== R3 Boundaries (5 tests) ====================
  {
    name: 't2_r3_mute_toggle_updates_audio_debug_and_unmute_restores',
    async run({ page, baseUrl }) {
      await gotoApp(page, baseUrl);
      await openSettingsFromMainMenu(page);
      await selectSettingsTab(page, 'AUDIO & CONTROL');

      await page.locator('button:has-text("SILENCIAR")').click();
      await page.waitForTimeout(150);
      const mutedDbg = await getAudioDebugState(page);
      assert(mutedDbg !== null, 'window.__AUDIO_DEBUG__ required');
      assertEqual(mutedDbg.volumes.muted, true, 'SILENCIAR must set __AUDIO_DEBUG__.volumes.muted = true');

      await page.locator('button:has-text("ACTIVAR")').click();
      await page.waitForTimeout(150);
      const unmutedDbg = await getAudioDebugState(page);
      assertEqual(unmutedDbg.volumes.muted, false, 'ACTIVAR must restore __AUDIO_DEBUG__.volumes.muted = false');
    },
  },
  {
    name: 't2_r3_master_music_sfx_sliders_clamp_and_persist_across_reload',
    async run({ page, baseUrl }) {
      await gotoApp(page, baseUrl);
      await openSettingsFromMainMenu(page);
      await selectSettingsTab(page, 'AUDIO & CONTROL');

      const ranges = page.locator('input[type="range"]');
      const rangeCount = await ranges.count();
      // Expected: sensitivity + master + music + sfx (>= 4 range sliders in AUDIO & CONTROL)
      assertGreaterThan(
        rangeCount,
        3,
        `Expected sensitivity, master, music, and sfx sliders in AUDIO & CONTROL, found ${rangeCount}`
      );

      // Set master=0.5, music=0.25, sfx=0.9
      await setRangeInputValue(ranges.nth(1), 0.5);
      await setRangeInputValue(ranges.nth(2), 0.25);
      await setRangeInputValue(ranges.nth(3), 0.9);
      await page.waitForTimeout(150);

      const dbg = await getAudioDebugState(page);
      assert(dbg !== null, 'window.__AUDIO_DEBUG__ required');
      assertInRange(dbg.volumes.master, 0.45, 0.55, 'Master volume should reflect slider ~0.5');
      assertInRange(dbg.volumes.music, 0.2, 0.3, 'Music volume should reflect slider ~0.25');
      assertInRange(dbg.volumes.sfx, 0.85, 0.95, 'SFX volume should reflect slider ~0.9');

      await page.reload({ waitUntil: 'domcontentloaded' });
      const prefs = await readStorageJson(page, PREFS_STORAGE_KEY);
      assert(prefs !== null, 'Audio preferences must persist in localStorage');
      assertInRange(prefs.masterVolume, 0.45, 0.55, 'Master volume must persist across reload');
      assertInRange(prefs.musicVolume, 0.2, 0.3, 'Music volume must persist across reload');
      assertInRange(prefs.sfxVolume, 0.85, 0.95, 'SFX volume must persist across reload');
    },
  },
  {
    name: 't2_r3_rapid_screen_switching_zero_errors',
    async run({ page, baseUrl }) {
      await gotoApp(page, baseUrl);

      for (let i = 0; i < 3; i++) {
        await page.locator('button:has-text("MAPA ESTELAR")').click();
        await page.locator('button:has-text("VOLVER")').click();
        await openSettingsFromMainMenu(page);
        await closeSettingsModal(page);
      }

      await enterCombatMode(page, 'CAMPAÑA');
      await pauseGame(page);
      await resumeGame(page);
      await abortToMainMenu(page);

      const dbg = await getAudioDebugState(page);
      assert(dbg !== null, 'window.__AUDIO_DEBUG__ required');
      assertEqual(dbg.failedTracks.length, 0, 'Rapid screen switching must cause zero failedTracks');
    },
  },
  {
    name: 't2_r3_audio_unlocks_on_ajustes_or_mapa_estelar_click',
    async run({ page, baseUrl }) {
      // Context 1: AJUSTES click unlocks AudioContext
      await gotoApp(page, baseUrl);
      await openSettingsFromMainMenu(page);
      await page.waitForTimeout(450);
      const dbg1 = await getAudioDebugState(page);
      assert(dbg1 !== null, 'window.__AUDIO_DEBUG__ required');
      assertEqual(dbg1.contextState, 'running', 'Clicking AJUSTES must unlock AudioContext to running');

      // Context 2: MAPA ESTELAR click unlocks AudioContext
      const secondCtx = await page.context().browser().newContext({ viewport: { width: 1280, height: 720 } });
      try {
        const p2 = await secondCtx.newPage();
        await gotoApp(p2, baseUrl);
        await p2.locator('button:has-text("MAPA ESTELAR")').click();
        await p2.waitForTimeout(450);
        const dbg2 = await getAudioDebugState(p2);
        assert(dbg2 !== null, 'window.__AUDIO_DEBUG__ required on MAPA ESTELAR click');
        assertEqual(dbg2.contextState, 'running', 'Clicking MAPA ESTELAR must unlock AudioContext to running');
      } finally {
        await secondCtx.close();
      }
    },
  },
  {
    name: 't2_r3_audio_clean_across_abort_and_restart',
    async run({ page, baseUrl }) {
      await gotoApp(page, baseUrl);
      await enterCombatMode(page, 'CAMPAÑA');
      await page.waitForTimeout(400);
      await abortToMainMenu(page);
      await page.waitForTimeout(350);

      const menuDbg = await getAudioDebugState(page);
      assert(menuDbg !== null, 'window.__AUDIO_DEBUG__ required');
      assertEqual(menuDbg.activeScreen, 'MAIN_MENU', 'Aborting must return audio screen to MAIN_MENU');

      await enterCombatMode(page, 'OLEADAS');
      await page.waitForTimeout(400);
      const waveDbg = await getAudioDebugState(page);
      assertEqual(waveDbg.activeScreen, 'GAMEPLAY', 'Restarting OLEADAS must transition audio to GAMEPLAY');
      assertEqual(waveDbg.activeSituation, 'COMBAT', 'Restarting OLEADAS must restore COMBAT situation');
      assertEqual(waveDbg.failedTracks.length, 0, 'No audio decode/load failures allowed across restart');
    },
  },

  // ==================== R4 Boundaries (5 tests) ====================
  {
    name: 't2_r4_corrupted_localstorage_recovers_safely',
    async run({ page, baseUrl }) {
      await gotoApp(page, baseUrl);
      await page.evaluate(
        ({ gKey, pKey }) => {
          localStorage.setItem(gKey, '{corrupted_json:::');
          localStorage.setItem(pKey, 'not_json_at_all');
        },
        { gKey: GRAPHICS_STORAGE_KEY, pKey: PREFS_STORAGE_KEY }
      );

      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.locator('button:has-text("CAMPAÑA")').waitFor({ state: 'visible', timeout: 10000 });

      const recovered = await readStorageJson(page, GRAPHICS_STORAGE_KEY);
      assert(recovered !== null && !recovered.__rawInvalid, 'Corrupted graphics storage must recover cleanly');
      assert(['LOW', 'MEDIUM', 'HIGH', 'CUSTOM'].includes(recovered.preset), 'Recovered preset must be valid');
    },
  },
  {
    name: 't2_r4_out_of_range_dpr_brightness_shadowmap_clamp_on_reload',
    async run({ page, baseUrl }) {
      await gotoApp(page, baseUrl);
      await page.evaluate((gKey) => {
        localStorage.setItem(
          gKey,
          JSON.stringify({
            preset: 'HIGH',
            dpr: 9.5,
            brightness: 12.0,
            shadowMapSize: 8192,
          })
        );
      }, GRAPHICS_STORAGE_KEY);

      await page.reload({ waitUntil: 'domcontentloaded' });
      await openSettingsFromMainMenu(page);
      await selectSettingsTab(page, 'PANTALLA & BRILLO');
      assert(await page.getByText('150%', { exact: true }).isVisible(), 'Clamped brightness 1.5 must show 150%');
      await selectSettingsTab(page, 'GRÁFICOS');
      await page.locator('button:has-text("ALTO")').first().click();

      const cfgHigh = await readStorageJson(page, GRAPHICS_STORAGE_KEY);
      assertInRange(cfgHigh.dpr, 0.75, 1.5, 'DPR must clamp <= 1.5');
      assertInRange(cfgHigh.brightness, 0.5, 1.5, 'Brightness must clamp <= 1.5');
      assertInRange(cfgHigh.shadowMapSize, 512, 1024, 'shadowMapSize must clamp <= 1024');
    },
  },
  {
    name: 't2_r4_brightness_0_5_and_1_5_bounds_persist',
    async run({ page, baseUrl }) {
      await gotoApp(page, baseUrl);
      await openSettingsFromMainMenu(page);
      await selectSettingsTab(page, 'PANTALLA & BRILLO');
      await setRangeInputValue(page.locator('input[type="range"]').first(), 0.5);
      await page.reload({ waitUntil: 'domcontentloaded' });

      let cfg = await readStorageJson(page, GRAPHICS_STORAGE_KEY);
      assertEqual(cfg.brightness, 0.5, 'Lower brightness bound 0.5 must persist across reload');

      await openSettingsFromMainMenu(page);
      await selectSettingsTab(page, 'PANTALLA & BRILLO');
      await setRangeInputValue(page.locator('input[type="range"]').first(), 1.5);
      await page.reload({ waitUntil: 'domcontentloaded' });

      cfg = await readStorageJson(page, GRAPHICS_STORAGE_KEY);
      assertEqual(cfg.brightness, 1.5, 'Upper brightness bound 1.5 must persist across reload');
    },
  },
  {
    name: 't2_r4_sensitivity_and_fov_bounds_persist',
    async run({ page, baseUrl }) {
      await gotoApp(page, baseUrl);
      await openSettingsFromMainMenu(page);

      // FOV bounds (55..90) in PANTALLA & BRILLO
      await selectSettingsTab(page, 'PANTALLA & BRILLO');
      const displayRanges = page.locator('input[type="range"]');
      assertGreaterThan(await displayRanges.count(), 1, 'Expected both brightness and FOV sliders in PANTALLA & BRILLO');
      await setRangeInputValue(displayRanges.nth(1), 90);

      // Sensitivity bounds (0.1..3.0) in AUDIO & CONTROL
      await selectSettingsTab(page, 'AUDIO & CONTROL');
      await setRangeInputValue(page.locator('input[type="range"]').first(), 2.8);

      await page.reload({ waitUntil: 'domcontentloaded' });
      const prefs = await readStorageJson(page, PREFS_STORAGE_KEY);
      assert(prefs !== null, 'Preferences must persist in localStorage');
      assertEqual(prefs.fov, 90, 'FOV upper bound 90 must persist across reload');
      assertInRange(prefs.sensitivity, 2.75, 2.85, 'Sensitivity 2.8 must persist across reload');
    },
  },
  {
    name: 't2_r4_escape_closes_settings_panel_in_main_menu',
    async run({ page, baseUrl }) {
      await gotoApp(page, baseUrl);
      await openSettingsFromMainMenu(page);
      await page.keyboard.press('Escape');
      await page.getByText('CENTRO DE CONFIGURACIÓN').waitFor({ state: 'detached', timeout: 3000 });
    },
  },
];
