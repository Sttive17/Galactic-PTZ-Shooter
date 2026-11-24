import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGamepad } from '../../hooks/useGamepad';
import { useGameStore } from '../../game/gameState';
import type { GameState } from '../../game/gameState';
import { SceneState, PLAYER_EYE_HEIGHT } from '../../game/sceneState';
import { GAME_CONFIG } from '../../game/config';
import { audioSystem, initAudio, playSound, playReload, playPortalWarp } from '../../game/AudioSystem';
import { getDeviceProfile } from '../../game/deviceProfile';
import { triggerHaptic } from '../../game/haptics';
import * as THREE from 'three';

const _aimAssistVec = new THREE.Vector3();

const tryStartReload = (state: GameState) => {
  if (SceneState.isReloading || SceneState.ammo >= SceneState.maxAmmo) return;
  const rapidStacks = state.activePowers.RAPID_FIRE || 0;
  const magStacks = state.activePowers.EXTENDED_MAG || 0;
  SceneState.reloadDuration = Math.max(0.75, 1.35 - rapidStacks * 0.1 - magStacks * 0.1);
  SceneState.isReloading = true;
  SceneState.reloadProgress = 0;
  triggerHaptic('reload');
  playReload();
};

const tryJump = (state: GameState, airJumpsUsed: { current: number }) => {
  const jetStacks = state.activePowers.JET_BOOTS || 0;
  const jumpVelocity = JUMP_IMPULSE * (1 + jetStacks * 0.25);

  if (SceneState.isGrounded) {
    SceneState.playerVelocity.y = jumpVelocity;
    SceneState.isGrounded = false;
    airJumpsUsed.current = 0;
    triggerHaptic('jump');
    playSound('zoom');
  } else if (airJumpsUsed.current < jetStacks) {
    SceneState.playerVelocity.y = jumpVelocity;
    airJumpsUsed.current += 1;
    triggerHaptic('jump');
    playSound('zoom');
  }
};

const DASH_IMPULSE = 26;
const tryDash = (state: GameState) => {
  if (SceneState.dashCooldownTimer > 0) return;
  const turboStacks = state.activePowers.TURBO_SPRINT || 0;
  const cooldown = Math.max(0.7, 1.8 - turboStacks * 0.25);
  SceneState.dashCooldownTimer = cooldown;
  SceneState.dashDurationTimer = 0.22;
  SceneState.isDashing = true;

  const forward = SceneState.playerForward.clone();
  forward.y = 0;
  if (forward.lengthSq() < 0.001) forward.set(0, 0, -1);
  forward.normalize();

  SceneState.playerVelocity.x = forward.x * DASH_IMPULSE;
  SceneState.playerVelocity.z = forward.z * DASH_IMPULSE;

  playSound('zoom');
  triggerHaptic('dash');
  state.addCameraShake(0.35);
};

const WALK_SPEED = 14;
const SPRINT_SPEED = 22;
const JUMP_IMPULSE = 9.5;
const GRAVITY = 22;
const ARENA_MAX_RADIUS = 54;
const PLAYER_RADIUS = 0.65;
const PLAYER_HEAD_CLEARANCE = 0.25;

const isInteractiveElement = (target: EventTarget | null) => {
  if (!target || !(target as HTMLElement).closest) return false;
  return !!(target as HTMLElement).closest(
    'button, input, a, select, textarea, [role="button"], [role="group"], [data-testid="touch-controls"]'
  );
};

const requestCanvasPointerLock = () => {
  if (getDeviceProfile().inputMode === 'touch') return;
  if (document.pointerLockElement) return;
  const target = document.querySelector('canvas') || document.body;
  if (target?.requestPointerLock) {
    Promise.resolve(target.requestPointerLock()).catch(() => {});
  }
};

const canPlayFPS = (state: GameState) => {
  return !state.isPaused &&
         !state.isSettingsOpen &&
         (state.mode === 'CHALLENGE' || state.mode === 'TRAINING') &&
         (state.roundState === 'PLAYING' || state.roundState === 'PORTAL_ACTIVE');
};

const getFireCooldown = (state: GameState) => {
  const rapidStacks = state.activePowers.RAPID_FIRE || 0;
  const mult = Math.pow(0.7, rapidStacks);
  if (state.selectedWeapon === 'SCATTER_SHOTGUN') {
    return Math.max(160, Math.round(420 * mult));
  }
  if (state.selectedWeapon === 'HEAVY_RAILGUN') {
    return Math.max(280, Math.round(750 * mult));
  }
  return Math.max(55, Math.round(160 * mult));
};

const attemptFire = (
  state: GameState,
  lastFireRef: { current: number },
  registerShot: () => void
) => {
  if (SceneState.isReloading) return;
  if (SceneState.ammo <= 0) {
    tryStartReload(state);
    return;
  }
  const weapon = state.selectedWeapon;
  const ammoCost = weapon === 'SCATTER_SHOTGUN' ? 3 : weapon === 'HEAVY_RAILGUN' ? 4 : 1;
  if (SceneState.ammo < ammoCost) {
    tryStartReload(state);
    return;
  }

  const now = performance.now();
  if (now - lastFireRef.current > getFireCooldown(state)) {
    initAudio();
    window.dispatchEvent(
      new CustomEvent('fire-projectile', {
        detail: { ptz: state.ptz, weapon },
      })
    );
    registerShot();
    SceneState.ammo = Math.max(0, SceneState.ammo - ammoCost);
    SceneState.weaponRecoil = weapon === 'HEAVY_RAILGUN' ? 2.5 : weapon === 'SCATTER_SHOTGUN' ? 1.8 : 1.0;
    lastFireRef.current = now;
    if (SceneState.ammo <= 0) {
      tryStartReload(state);
    }
  }
};

export const InputManager = () => {
  const { gamepadIndexRef } = useGamepad();
  const updatePTZ = useGameStore((state) => state.updatePTZ);
  const registerShot = useGameStore((state) => state.registerShot);
  const mode = useGameStore((state) => state.mode);
  const roundState = useGameStore((state) => state.roundState);
  const isPaused = useGameStore((state) => state.isPaused);
  const isSettingsOpen = useGameStore((state) => state.isSettingsOpen);
  const currentRound = useGameStore((state) => state.currentRound);
  
  const lastFireRef = useRef<number>(0);
  const wasStartPressed = useRef<boolean>(false);
  const wasJumpPressed = useRef<boolean>(false);
  const wasReloadPressed = useRef<boolean>(false);
  const wasDashPressed = useRef<boolean>(false);
  const wasOpticsPressed = useRef<boolean>(false);
  const wasDpadLeftRef = useRef<boolean>(false);
  const wasDpadRightRef = useRef<boolean>(false);
  const airJumpsUsedRef = useRef<number>(0);
  const jumpPadCooldownRef = useRef<number>(0);
  const keys = useRef({
    w: false, a: false, s: false, d: false,
    arrowup: false, arrowdown: false, arrowleft: false, arrowright: false,
    shift: false, q: false, e: false, space: false
  });
  const isRightMouseDown = useRef(false);
  const isLeftMouseDown = useRef(false);
  const mouseDelta = useRef({ x: 0, y: 0 });
  const lastMousePos = useRef<{ x: number; y: number } | null>(null);
  const baseZoomRef = useRef<number>(1);

  // Reset base zoom on mode or round change
  useEffect(() => {
    baseZoomRef.current = GAME_CONFIG.camera.zoomMin;
  }, [mode, currentRound]);

  // Reset mouse anchor and release Pointer Lock when leaving active gameplay
  useEffect(() => {
    lastMousePos.current = null;
    const active =
      !isPaused &&
      !isSettingsOpen &&
      (mode === 'CHALLENGE' || mode === 'TRAINING') &&
      (roundState === 'PLAYING' || roundState === 'PORTAL_ACTIVE');
    if (!active) {
      isLeftMouseDown.current = false;
      isRightMouseDown.current = false;
      SceneState.resetTouchControls();
      if (document.pointerLockElement) {
        document.exitPointerLock?.();
      }
    }
  }, [mode, roundState, isPaused, isSettingsOpen]);

  useEffect(() => {
    const handleZoomStep = (e: Event) => {
      const { delta } = (e as CustomEvent).detail;
      baseZoomRef.current = Math.max(
        GAME_CONFIG.camera.zoomMin,
        Math.min(GAME_CONFIG.camera.zoomMax, baseZoomRef.current + delta)
      );
      playSound('zoom');
    };

    const handleTouchJump = () => {
      const state = useGameStore.getState();
      if (canPlayFPS(state)) {
        initAudio();
        tryJump(state, airJumpsUsedRef);
      }
    };

    const handleTouchReload = () => {
      const state = useGameStore.getState();
      if (canPlayFPS(state)) {
        initAudio();
        tryStartReload(state);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      initAudio();
      const state = useGameStore.getState();
      const key = e.key.toLowerCase();
      if (Object.prototype.hasOwnProperty.call(keys.current, key)) {
        keys.current[key as keyof typeof keys.current] = true;
      }
      if (e.key === 'Shift') keys.current.shift = true;
      
      if (e.code === 'Space') {
        keys.current.space = true;
        if (canPlayFPS(state)) {
          e.preventDefault();
          if (!e.repeat) {
            tryJump(state, airJumpsUsedRef);
          }
        }
      }
      if (e.code === 'Digit1') state.switchWeapon('PLASMA_RIFLE');
      if (e.code === 'Digit2') state.switchWeapon('SCATTER_SHOTGUN');
      if (e.code === 'Digit3') state.switchWeapon('HEAVY_RAILGUN');
      if (e.code === 'KeyR' && !e.repeat && canPlayFPS(state)) {
        tryStartReload(state);
      }
      if (e.code === 'KeyC' && !e.repeat && canPlayFPS(state)) {
        tryDash(state);
      }
      if (e.code === 'KeyV' && !e.repeat) {
        playSound('zoom');
        triggerHaptic('alarm');
        state.toggleOpticalMode();
      }
      if (
        e.code === 'KeyE' &&
        !e.repeat &&
        state.roundState === 'PORTAL_ACTIVE' &&
        !state.isPaused &&
        !state.isSettingsOpen &&
        (state.mode === 'CHALLENGE' || state.mode === 'TRAINING')
      ) {
        playPortalWarp();
        state.enterChapterPortal();
      }
      if ((e.code === 'Escape' || e.code === 'KeyP') && !e.repeat) {
        if (e.code === 'Escape' && (state.isPaused || state.isSettingsOpen)) {
          return;
        }
        if (state.mode === 'CHALLENGE' || state.mode === 'TRAINING') {
          if (state.isPaused) {
            state.setSettingsOpen(false);
          }
          state.togglePause();
          playSound('ui');
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (Object.prototype.hasOwnProperty.call(keys.current, key)) {
        keys.current[key as keyof typeof keys.current] = false;
      }
      if (e.key === 'Shift') keys.current.shift = false;
      if (e.code === 'Space') keys.current.space = false;
    };

    const handleMouseDown = (e: MouseEvent) => {
      initAudio();
      const state = useGameStore.getState();

      if (e.button === 2) {
        // Right click: Tactical ADS Zoom (and also drag look if not pointer locked)
        isRightMouseDown.current = true;
      }

      if (e.button === 0) {
        if (!isInteractiveElement(e.target) && canPlayFPS(state)) {
          // Request Pointer Lock on canvas for true 360° FPS mouse look
          requestCanvasPointerLock();

          isLeftMouseDown.current = true;
          attemptFire(state, lastFireRef, registerShot);
        }
      }
    };

    const handleClick = (e: MouseEvent) => {
      const state = useGameStore.getState();
      if (!isInteractiveElement(e.target) && canPlayFPS(state)) {
        requestCanvasPointerLock();
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 2) isRightMouseDown.current = false;
      if (e.button === 0) isLeftMouseDown.current = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const state = useGameStore.getState();
      if (!canPlayFPS(state)) return;

      // Always rotate view on mouse move (no button hold required!)
      if (document.pointerLockElement) {
        mouseDelta.current.x += e.movementX;
        mouseDelta.current.y += e.movementY;
      } else {
        // Fallback unlocked cursor look using clientX/clientY delta
        if (lastMousePos.current === null) {
          lastMousePos.current = { x: e.clientX, y: e.clientY };
          return;
        }
        mouseDelta.current.x += e.clientX - lastMousePos.current.x;
        mouseDelta.current.y += e.clientY - lastMousePos.current.y;
        lastMousePos.current.x = e.clientX;
        lastMousePos.current.y = e.clientY;
      }
    };

    const handlePointerLockChange = () => {
      lastMousePos.current = null;
    };

    const handleWheel = (e: WheelEvent) => {
      initAudio();
      const state = useGameStore.getState();
      if (!canPlayFPS(state)) return;

      const zoomStep = e.deltaY < 0 ? 0.9 : -0.9;
      const nextZoom = Math.max(
        GAME_CONFIG.camera.zoomMin,
        Math.min(GAME_CONFIG.camera.zoomMax, baseZoomRef.current + zoomStep)
      );
      if (nextZoom !== baseZoomRef.current) {
        baseZoomRef.current = nextZoom;
        playSound('zoom');
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      const state = useGameStore.getState();
      if (state.mode === 'CHALLENGE' || state.mode === 'TRAINING') {
        e.preventDefault();
      }
    };

    const handleBlur = () => {
      keys.current = {
        w: false, a: false, s: false, d: false,
        arrowup: false, arrowdown: false, arrowleft: false, arrowright: false,
        shift: false, q: false, e: false, space: false
      };
      isRightMouseDown.current = false;
      isLeftMouseDown.current = false;
      lastMousePos.current = null;
      audioSystem.updateMotorSound(0);
    };

    window.addEventListener('ptz-zoom-step', handleZoomStep);
    window.addEventListener('touch-jump', handleTouchJump);
    window.addEventListener('touch-reload', handleTouchReload);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('click', handleClick);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('pointerlockchange', handlePointerLockChange);

    return () => {
      window.removeEventListener('ptz-zoom-step', handleZoomStep);
      window.removeEventListener('touch-jump', handleTouchJump);
      window.removeEventListener('touch-reload', handleTouchReload);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
    };
  }, [registerShot]);

  useFrame((_state, delta) => {
    const state = useGameStore.getState();
    if (!canPlayFPS(state)) {
      SceneState.isSprintingNow = false;
      audioSystem.updateMotorSound(0);
      return;
    }

    const clampedDelta = Math.min(delta, 0.05);
    jumpPadCooldownRef.current = Math.max(0, jumpPadCooldownRef.current - clampedDelta);
    const baseSensitivity = state.preferences.sensitivity ?? state.settings.sensitivity;
    const ySign = state.preferences.invertY ? -1 : 1;
    const currentZoom = state.ptz.zoom;
    const zoomMultiplier = 1 / Math.sqrt(currentZoom);
    const finalSensitivity = baseSensitivity * zoomMultiplier;

    let panDelta = 0;
    let tiltDelta = 0;
    let moveForward = 0;
    let moveRight = 0;
    let isSprinting = keys.current.shift;
    let ltValue = 0;
    let rtValue = 0;
    const touchControls = SceneState.touchControls;

    // 1. Gamepad FPS Dual-Stick Logic (LS = Walk, RS = Aim, A = Jump, LT = Zoom, RT = Shoot)
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = gamepads[gamepadIndexRef.current!];
    
    if (gp) {
      const startPressed = gp.buttons[9]?.pressed || gp.buttons[8]?.pressed || false;
      if (startPressed && !wasStartPressed.current) {
        initAudio();
        if (state.isPaused) {
          state.setSettingsOpen(false);
        }
        state.togglePause();
        playSound('ui');
      }
      wasStartPressed.current = startPressed;

      if (useGameStore.getState().isPaused) {
        audioSystem.updateMotorSound(0);
        return;
      }

      const deadzone = GAME_CONFIG.gamepad.deadzone;
      const lsX = gp.axes[0] || 0;
      const lsY = gp.axes[1] || 0;
      const rsX = gp.axes[2] || 0;
      const rsY = gp.axes[3] || 0;
      ltValue = gp.buttons[6]?.value || 0;
      rtValue = gp.buttons[7]?.value || 0;

      // Left stick -> Walk / Strafe
      if (Math.abs(lsX) > deadzone) moveRight += lsX;
      if (Math.abs(lsY) > deadzone) moveForward -= lsY;

      // Right stick -> Look / Aim 360°
      if (Math.abs(rsX) > deadzone) {
        initAudio();
        panDelta += rsX * GAME_CONFIG.camera.panSpeed * 1.4 * clampedDelta * finalSensitivity;
      }
      if (Math.abs(rsY) > deadzone) {
        initAudio();
        tiltDelta -= rsY * GAME_CONFIG.camera.tiltSpeed * 1.4 * clampedDelta * finalSensitivity * ySign;
      }

      // A button (0) -> Jump (with JET_BOOTS air jumps)
      const aPressed = gp.buttons[0]?.pressed || false;
      if (aPressed && !wasJumpPressed.current) {
        const jetStacks = state.activePowers.JET_BOOTS || 0;
        const jumpVelocity = JUMP_IMPULSE * (1 + jetStacks * 0.25);
        if (SceneState.isGrounded) {
          SceneState.playerVelocity.y = jumpVelocity;
          SceneState.isGrounded = false;
          airJumpsUsedRef.current = 0;
          playSound('zoom');
        } else if (airJumpsUsedRef.current < jetStacks) {
          SceneState.playerVelocity.y = jumpVelocity;
          airJumpsUsedRef.current += 1;
          playSound('zoom');
        }
      }
      wasJumpPressed.current = aPressed;

      // X button (2) -> Reload
      const xPressed = gp.buttons[2]?.pressed || false;
      if (xPressed && !wasReloadPressed.current) {
        tryStartReload(state);
      }
      wasReloadPressed.current = xPressed;

      // B button (1) or LB (4) -> Tactical Dash / Dodge!
      const bPressed = gp.buttons[1]?.pressed || gp.buttons[4]?.pressed || false;
      if (bPressed && !wasDashPressed.current) {
        tryDash(state);
      }
      wasDashPressed.current = bPressed;

      // Y button (3) or D-Pad Up (12) -> Toggle PTZ Optical Mode (NORMAL / THERMAL / NIGHT_VISION)
      const yPressed = gp.buttons[3]?.pressed || gp.buttons[12]?.pressed || false;
      if (yPressed && !wasOpticsPressed.current) {
        playSound('zoom');
        triggerHaptic('alarm');
        state.toggleOpticalMode();
      }
      wasOpticsPressed.current = yPressed;

      // D-Pad Left (14) / Right (15) -> Cycle weapons
      const dpadLeft = gp.buttons[14]?.pressed || false;
      const dpadRight = gp.buttons[15]?.pressed || false;
      if (dpadLeft && !wasDpadLeftRef.current) {
        state.cycleWeapon(-1);
      }
      if (dpadRight && !wasDpadRightRef.current) {
        state.cycleWeapon(1);
      }
      wasDpadLeftRef.current = dpadLeft;
      wasDpadRightRef.current = dpadRight;

      // Gamepad Aim Assist: Target friction and magnetic pull
      if (state.preferences.aimAssist !== false) {
        const pPos = SceneState.playerPosition;
        const pForward = SceneState.playerForward;
        let closestTarget: (typeof SceneState.targets)[0] | null = null;
        let minAngle = 0.14; // ~8 degrees cone of assist

        for (let i = 0; i < SceneState.targets.length; i++) {
          const t = SceneState.targets[i];
          if (!t.active) continue;
          _aimAssistVec.set(t.position[0] - pPos.x, t.position[1] - pPos.y, t.position[2] - pPos.z);
          const dist = _aimAssistVec.length();
          if (dist < 1.5 || dist > 55) continue;
          _aimAssistVec.normalize();
          const dot = pForward.dot(_aimAssistVec);
          const angle = Math.acos(Math.min(1, Math.max(-1, dot)));
          if (angle < minAngle) {
            minAngle = angle;
            closestTarget = t;
          }
        }

        if (closestTarget) {
          // 1. Friction: slow down camera stick movement when tracking a target
          if (Math.abs(rsX) > deadzone || Math.abs(rsY) > deadzone) {
            panDelta *= 0.65;
            tiltDelta *= 0.65;
          }
          // 2. Subtle magnetic pull towards target center
          _aimAssistVec.set(closestTarget.position[0] - pPos.x, closestTarget.position[1] - pPos.y, closestTarget.position[2] - pPos.z);
          _aimAssistVec.normalize();
          const targetPan = -THREE.MathUtils.radToDeg(Math.atan2(_aimAssistVec.x, -_aimAssistVec.z));
          const targetTilt = THREE.MathUtils.radToDeg(Math.asin(_aimAssistVec.y));
          const panDiff = THREE.MathUtils.euclideanModulo(targetPan - state.ptz.pan + 180, 360) - 180;
          const tiltDiff = targetTilt - state.ptz.tilt;
          
          panDelta += panDiff * clampedDelta * 1.5;
          tiltDelta += tiltDiff * clampedDelta * 1.5;
        }
      }

      // L3 (10) -> Sprint
      if (gp.buttons[10]?.pressed) isSprinting = true;
    }

    // Advance Dash timers
    if (SceneState.dashDurationTimer > 0) {
      SceneState.dashDurationTimer -= clampedDelta;
      if (SceneState.dashDurationTimer <= 0) {
        SceneState.isDashing = false;
      }
    }
    if (SceneState.dashCooldownTimer > 0) {
      SceneState.dashCooldownTimer = Math.max(0, SceneState.dashCooldownTimer - clampedDelta);
      const turboStacks = state.activePowers.TURBO_SPRINT || 0;
      const totalCooldown = Math.max(0.7, 1.8 - turboStacks * 0.25);
      state.setDashCooldown(SceneState.dashCooldownTimer / totalCooldown);
    } else if (state.dashCooldown > 0) {
      state.setDashCooldown(0);
    }

    moveRight += touchControls.moveX;
    moveForward -= touchControls.moveY;
    panDelta += touchControls.lookX * GAME_CONFIG.camera.panSpeed * 1.4 * clampedDelta * finalSensitivity;
    tiltDelta -= touchControls.lookY * GAME_CONFIG.camera.tiltSpeed * 1.4 * clampedDelta * finalSensitivity * ySign;
    isSprinting = isSprinting || touchControls.sprint;
    if (touchControls.zoom) ltValue = 1;

    // Advance active magazine reload progress
    if (SceneState.isReloading) {
      SceneState.reloadProgress += clampedDelta / Math.max(0.2, SceneState.reloadDuration);
      if (SceneState.reloadProgress >= 1) {
        SceneState.isReloading = false;
        SceneState.reloadProgress = 0;
        SceneState.ammo = SceneState.maxAmmo;
        playSound('ui');
      }
    }

    // 2. Keyboard WASD / Arrow movement
    if (keys.current.w || keys.current.arrowup) moveForward += 1;
    if (keys.current.s || keys.current.arrowdown) moveForward -= 1;
    if (keys.current.d || keys.current.arrowright) moveRight += 1;
    if (keys.current.a || keys.current.arrowleft) moveRight -= 1;

    // Mouse Look (Pointer Lock or Drag)
    if (mouseDelta.current.x !== 0 || mouseDelta.current.y !== 0) {
      panDelta += mouseDelta.current.x * 0.18 * finalSensitivity;
      tiltDelta -= mouseDelta.current.y * 0.18 * finalSensitivity * ySign;
      mouseDelta.current.x = 0;
      mouseDelta.current.y = 0;
    }

    // Keyboard E/Q Zoom adjustment
    if (keys.current.e) {
      baseZoomRef.current = Math.min(GAME_CONFIG.camera.zoomMax, baseZoomRef.current + GAME_CONFIG.camera.zoomSpeed * clampedDelta);
    }
    if (keys.current.q) {
      baseZoomRef.current = Math.max(GAME_CONFIG.camera.zoomMin, baseZoomRef.current - GAME_CONFIG.camera.zoomSpeed * clampedDelta);
    }

    // 3. Apply First-Person Player Movement & Physics in 3D World
    const panRad = THREE.MathUtils.degToRad(state.ptz.pan);
    const forwardX = Math.sin(panRad);
    const forwardZ = -Math.cos(panRad);
    const rightX = Math.cos(panRad);
    const rightZ = Math.sin(panRad);

    // Normalize diagonal movement so diagonal isn't faster
    const moveMag = Math.hypot(moveForward, moveRight);
    const normForward = moveMag > 1 ? moveForward / moveMag : moveForward;
    const normRight = moveMag > 1 ? moveRight / moveMag : moveRight;

    // Sprint Stamina, Fatigue & TURBO_SPRINT Power
    const turboStacks = state.activePowers.TURBO_SPRINT || 0;
    const walkSpeed = WALK_SPEED * (1 + turboStacks * 0.18);
    const sprintSpeed = SPRINT_SPEED * (1 + turboStacks * 0.18);
    const drainRate = 28 * Math.max(0.35, 1 - turboStacks * 0.25);
    const regenRate = (SceneState.isExhausted ? 15 : 22) * (1 + turboStacks * 0.35);

    const canSprint = isSprinting && moveMag > 0.05 && !SceneState.isExhausted && SceneState.stamina > 0;
    if (canSprint) {
      SceneState.isSprintingNow = true;
      SceneState.stamina = Math.max(0, SceneState.stamina - drainRate * clampedDelta);
      if (SceneState.stamina <= 0) {
        SceneState.isExhausted = true;
        SceneState.isSprintingNow = false;
      }
    } else {
      SceneState.isSprintingNow = false;
      SceneState.stamina = Math.min(100, SceneState.stamina + regenRate * clampedDelta);
      if (SceneState.isExhausted && SceneState.stamina >= 25) {
        SceneState.isExhausted = false;
      }
    }

    const fatigueMult = SceneState.isExhausted ? 0.85 : 1.0;
    const currentMoveSpeed = SceneState.isSprintingNow ? sprintSpeed : walkSpeed * fatigueMult;
    const targetVx = (forwardX * normForward + rightX * normRight) * currentMoveSpeed;
    const targetVz = (forwardZ * normForward + rightZ * normRight) * currentMoveSpeed;

    // Smooth ground acceleration & friction
    const accel = SceneState.isGrounded ? 12 : 4;
    const pos = SceneState.playerPosition;
    const vel = SceneState.playerVelocity;
    const R = PLAYER_RADIUS;

    vel.x = THREE.MathUtils.lerp(vel.x, targetVx, Math.min(1, accel * clampedDelta));
    vel.z = THREE.MathUtils.lerp(vel.z, targetVz, Math.min(1, accel * clampedDelta));

    // X movement + AABB wall-sliding collision
    pos.x += vel.x * clampedDelta;
    const feetX = pos.y - PLAYER_EYE_HEIGHT;
    const headX = pos.y + PLAYER_HEAD_CLEARANCE;
    for (const box of SceneState.colliders) {
      if (feetX < box.maxY - 0.35 && headX > box.minY && pos.z + R > box.minZ && pos.z - R < box.maxZ) {
        if (pos.x + R > box.minX && pos.x - R < box.maxX) {
          if (vel.x > 0 || (vel.x === 0 && pos.x < (box.minX + box.maxX) * 0.5)) {
            pos.x = box.minX - R;
          } else {
            pos.x = box.maxX + R;
          }
          vel.x = 0;
        }
      }
    }

    // Z movement + AABB wall-sliding collision
    pos.z += vel.z * clampedDelta;
    const feetZ = pos.y - PLAYER_EYE_HEIGHT;
    const headZ = pos.y + PLAYER_HEAD_CLEARANCE;
    for (const box of SceneState.colliders) {
      if (feetZ < box.maxY - 0.35 && headZ > box.minY && pos.x + R > box.minX && pos.x - R < box.maxX) {
        if (pos.z + R > box.minZ && pos.z - R < box.maxZ) {
          if (vel.z > 0 || (vel.z === 0 && pos.z < (box.minZ + box.maxZ) * 0.5)) {
            pos.z = box.minZ - R;
          } else {
            pos.z = box.maxZ + R;
          }
          vel.z = 0;
        }
      }
    }

    // Y movement (Gravity, platform underside head-check, jump pads, & landing on platforms/crates)
    const prevFeet = pos.y - PLAYER_EYE_HEIGHT;
    const prevHead = pos.y + PLAYER_HEAD_CLEARANCE;
    vel.y -= GRAVITY * clampedDelta;
    pos.y += vel.y * clampedDelta;

    // Head-bonk prevention when jumping under floating platforms
    if (vel.y > 0) {
      const nextHead = pos.y + PLAYER_HEAD_CLEARANCE;
      for (const box of SceneState.colliders) {
        if (box.minY > 0.2 && pos.x + R > box.minX && pos.x - R < box.maxX && pos.z + R > box.minZ && pos.z - R < box.maxZ) {
          if (prevHead <= box.minY + 0.35 && nextHead >= box.minY) {
            pos.y = box.minY - PLAYER_HEAD_CLEARANCE;
            vel.y = 0;
            break;
          }
        }
      }
    }

    let supportY = 0;
    let triggeredJumpPad = false;
    const curFeet = pos.y - PLAYER_EYE_HEIGHT;

    for (const box of SceneState.colliders) {
      if (pos.x + R > box.minX && pos.x - R < box.maxX && pos.z + R > box.minZ && pos.z - R < box.maxZ) {
        if (box.kind === 'jumppad' && curFeet <= box.maxY + 0.35 && jumpPadCooldownRef.current <= 0) {
          triggeredJumpPad = true;
        }
        if (prevFeet >= box.maxY - 0.45 && curFeet <= box.maxY) {
          supportY = Math.max(supportY, box.maxY);
        }
      }
    }

    if (triggeredJumpPad) {
      vel.y = 18.5;
      SceneState.isGrounded = false;
      airJumpsUsedRef.current = 0;
      jumpPadCooldownRef.current = 0.35;
      playSound('zoom');
    } else if (pos.y - PLAYER_EYE_HEIGHT <= supportY) {
      pos.y = supportY + PLAYER_EYE_HEIGHT;
      vel.y = 0;
      SceneState.isGrounded = true;
      airJumpsUsedRef.current = 0;
    } else {
      SceneState.isGrounded = false;
    }

    // Hangar Arena circular boundary clamp (center at 0, -10)
    const relX = pos.x;
    const relZ = pos.z + 10;
    const distSq = relX * relX + relZ * relZ;
    if (distSq > ARENA_MAX_RADIUS * ARENA_MAX_RADIUS) {
      const dist = Math.sqrt(distSq);
      pos.x = (relX / dist) * ARENA_MAX_RADIUS;
      pos.z = (relZ / dist) * ARENA_MAX_RADIUS - 10;
    }

    // Track horizontal speed for subtle head bobbing & weapon sway
    const horizSpeed = Math.hypot(SceneState.playerVelocity.x, SceneState.playerVelocity.z);
    SceneState.moveSpeedNormalized = Math.min(1, horizSpeed / WALK_SPEED);

    // 4. Continuous Rapid-Fire when holding Left Click or Gamepad RT
    const wantsFire = isLeftMouseDown.current || rtValue > 0.5 || touchControls.fire;
    if (wantsFire) {
      attemptFire(state, lastFireRef, registerShot);
    }

    // 5. Smooth Zoom logic (Right Click or LT for ADS, Mouse Wheel / Q-E for base zoom)
    let targetZoom = baseZoomRef.current;
    if (isRightMouseDown.current) {
      targetZoom = Math.min(GAME_CONFIG.camera.zoomMax, Math.max(baseZoomRef.current + 2.5, 4.0));
    } else if (ltValue > 0.1) {
      targetZoom = baseZoomRef.current + ltValue * (GAME_CONFIG.camera.zoomMax - baseZoomRef.current);
    }

    const smoothedZoom = THREE.MathUtils.lerp(currentZoom, targetZoom, Math.min(1, clampedDelta * 10));
    const zoomDelta = smoothedZoom - currentZoom;

    // Subtle servo hum on look/zoom
    const angularSpeed = (Math.abs(panDelta) + Math.abs(tiltDelta)) / Math.max(clampedDelta, 0.008) / 80 + Math.abs(zoomDelta) * 2;
    audioSystem.updateMotorSound(angularSpeed);

    if (Math.abs(panDelta) > 0.0001 || Math.abs(tiltDelta) > 0.0001 || Math.abs(zoomDelta) > 0.0001) {
      updatePTZ(panDelta, tiltDelta, zoomDelta);
    }
  });

  return null;
};
