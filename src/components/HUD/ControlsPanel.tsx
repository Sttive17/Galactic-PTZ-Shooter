import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../game/gameState';
import { SceneState } from '../../game/sceneState';
import { CHAPTER_META } from '../../game/mapGenerator';
import * as THREE from 'three';

const RADAR_SIZE = 208;
const RADAR_HALF = RADAR_SIZE / 2;
const ARENA_CENTER_Z = -10;
const ARENA_RADIUS = 58;
const WORLD_TO_RADAR = (RADAR_HALF - 8) / ARENA_RADIUS;
const PORTAL_X = 0;
const PORTAL_Z = -10;

export const ControlsPanel = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const zoomTextRef = useRef<HTMLSpanElement>(null);
  const azTextRef = useRef<HTMLSpanElement>(null);
  const allyCountRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let rafId = 0;

    const renderRadar = (timeMs: number) => {
      const canvas = canvasRef.current;
      if (canvas) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const bufferSize = Math.round(RADAR_SIZE * dpr);
        if (canvas.width !== bufferSize || canvas.height !== bufferSize) {
          canvas.width = bufferSize;
          canvas.height = bufferSize;
        }

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

          const { ptz, currentMap, roundState, bossInfo, portalTransition } = useGameStore.getState();
          const primaryGlow = currentMap.theme.primaryGlow || '#22d3ee';

          ctx.clearRect(0, 0, RADAR_SIZE, RADAR_SIZE);

          ctx.save();
          ctx.beginPath();
          ctx.arc(RADAR_HALF, RADAR_HALF, RADAR_HALF - 3, 0, Math.PI * 2);
          ctx.clip();

          ctx.fillStyle = 'rgba(2, 6, 23, 0.72)';
          ctx.fillRect(0, 0, RADAR_SIZE, RADAR_SIZE);

          ctx.strokeStyle = 'rgba(56, 189, 248, 0.16)';
          ctx.lineWidth = 1;
          for (const frac of [0.35, 0.7]) {
            ctx.beginPath();
            ctx.arc(RADAR_HALF, RADAR_HALF, (RADAR_HALF - 5) * frac, 0, Math.PI * 2);
            ctx.stroke();
          }

          ctx.beginPath();
          ctx.moveTo(RADAR_HALF, 4);
          ctx.lineTo(RADAR_HALF, RADAR_SIZE - 4);
          ctx.moveTo(4, RADAR_HALF);
          ctx.lineTo(RADAR_SIZE - 4, RADAR_HALF);
          ctx.stroke();

          const sweepAngle = (timeMs * 0.0022) % (Math.PI * 2);
          const sweepGrad = ctx.createRadialGradient(
            RADAR_HALF,
            RADAR_HALF,
            0,
            RADAR_HALF,
            RADAR_HALF,
            RADAR_HALF - 5
          );
          sweepGrad.addColorStop(0, 'rgba(34, 211, 238, 0.02)');
          sweepGrad.addColorStop(1, 'rgba(34, 211, 238, 0.22)');
          ctx.fillStyle = sweepGrad;
          ctx.beginPath();
          ctx.moveTo(RADAR_HALF, RADAR_HALF);
          ctx.arc(RADAR_HALF, RADAR_HALF, RADAR_HALF - 5, sweepAngle - 0.45, sweepAngle);
          ctx.closePath();
          ctx.fill();

          // Arena colliders / cover
          for (const box of SceneState.colliders) {
            const x = RADAR_HALF + box.minX * WORLD_TO_RADAR;
            const y = RADAR_HALF + (box.minZ - ARENA_CENTER_Z) * WORLD_TO_RADAR;
            const w = (box.maxX - box.minX) * WORLD_TO_RADAR;
            const h = (box.maxZ - box.minZ) * WORLD_TO_RADAR;

            ctx.fillStyle =
              box.kind === 'wall' || box.kind === 'tower'
                ? 'rgba(56, 189, 248, 0.24)'
                : 'rgba(148, 163, 184, 0.2)';
            ctx.fillRect(x, y, w, h);
          }

          // Active chapter portal beacon
          if (roundState === 'PORTAL_ACTIVE') {
            const portalRx = RADAR_HALF + PORTAL_X * WORLD_TO_RADAR;
            const portalRy = RADAR_HALF + (PORTAL_Z - ARENA_CENTER_Z) * WORLD_TO_RADAR;
            const portalHex = portalTransition
              ? CHAPTER_META[portalTransition.toChapter].accentHex
              : '#22d3ee';
            const pulse = Math.sin(timeMs * 0.006) * 2.2;

            ctx.strokeStyle = portalHex;
            ctx.lineWidth = 1.4;
            ctx.globalAlpha = 0.45;
            ctx.beginPath();
            ctx.arc(portalRx, portalRy, 11 + pulse, 0, Math.PI * 2);
            ctx.stroke();

            ctx.globalAlpha = 0.85;
            ctx.beginPath();
            ctx.arc(portalRx, portalRy, 6.5, 0, Math.PI * 2);
            ctx.stroke();

            ctx.globalAlpha = 1;
            ctx.fillStyle = portalHex;
            ctx.beginPath();
            ctx.moveTo(portalRx, portalRy - 4.8);
            ctx.lineTo(portalRx + 4.8, portalRy);
            ctx.lineTo(portalRx, portalRy + 4.8);
            ctx.lineTo(portalRx - 4.8, portalRy);
            ctx.closePath();
            ctx.fill();
          }

          // Differentiated Targets (Regular, Shield Generator, Boss)
          for (const target of SceneState.targets) {
            if (!target.active) continue;
            const tx = RADAR_HALF + target.position[0] * WORLD_TO_RADAR;
            const ty = RADAR_HALF + (target.position[2] - ARENA_CENTER_Z) * WORLD_TO_RADAR;

            if (target.isBoss) {
              const bossRingRadius = 6.5 + Math.sin(timeMs * 0.008) * 1.5;
              ctx.strokeStyle = bossInfo?.shielded
                ? 'rgba(168, 85, 247, 0.85)'
                : 'rgba(244, 63, 94, 0.85)';
              ctx.lineWidth = 1.4;
              ctx.beginPath();
              ctx.arc(tx, ty, bossRingRadius, 0, Math.PI * 2);
              ctx.stroke();

              ctx.fillStyle = '#f43f5e';
              ctx.strokeStyle = '#ffe4e6';
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(tx, ty - 4.6);
              ctx.lineTo(tx + 4.6, ty);
              ctx.lineTo(tx, ty + 4.6);
              ctx.lineTo(tx - 4.6, ty);
              ctx.closePath();
              ctx.fill();
              ctx.stroke();
            } else if (target.isGenerator) {
              ctx.fillStyle = 'rgba(168, 85, 247, 0.32)';
              ctx.beginPath();
              ctx.arc(tx, ty, 6.0, 0, Math.PI * 2);
              ctx.fill();

              ctx.fillStyle = '#22d3ee';
              ctx.strokeStyle = '#e9d5ff';
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(tx, ty - 3.4);
              ctx.lineTo(tx + 3.4, ty);
              ctx.lineTo(tx, ty + 3.4);
              ctx.lineTo(tx - 3.4, ty);
              ctx.closePath();
              ctx.fill();
              ctx.stroke();
            } else {
              ctx.fillStyle = 'rgba(239, 68, 68, 0.32)';
              ctx.beginPath();
              ctx.arc(tx, ty, 4.5, 0, Math.PI * 2);
              ctx.fill();

              ctx.fillStyle = '#fb7185';
              ctx.beginPath();
              ctx.arc(tx, ty, 2.3, 0, Math.PI * 2);
              ctx.fill();
            }
          }

          // Active Friendly Ally Drones
          let activeAllyCount = 0;
          for (let i = 0; i < SceneState.allies.length; i++) {
            const ally = SceneState.allies[i];
            if (!ally.active) continue;
            activeAllyCount++;

            const ax = RADAR_HALF + ally.x * WORLD_TO_RADAR;
            const ay = RADAR_HALF + (ally.z - ARENA_CENTER_Z) * WORLD_TO_RADAR;
            const allyColor =
              ally.role === 2 ? '#22d3ee' : ally.role === 1 ? '#2dd4bf' : '#34d399';

            if (ally.hasTarget) {
              const auraR = 6.2 + Math.sin(timeMs * 0.012) * 1.2;
              ctx.strokeStyle = allyColor;
              ctx.globalAlpha = 0.45;
              ctx.lineWidth = 1.1;
              ctx.beginPath();
              ctx.arc(ax, ay, auraR, 0, Math.PI * 2);
              ctx.stroke();
              ctx.globalAlpha = 1;
            } else {
              ctx.strokeStyle = allyColor;
              ctx.globalAlpha = 0.22;
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.arc(ax, ay, 5.0, 0, Math.PI * 2);
              ctx.stroke();
              ctx.globalAlpha = 1;
            }

            ctx.fillStyle = allyColor;
            ctx.strokeStyle = '#ecfdf5';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(ax, ay - 4.0);
            ctx.lineTo(ax + 3.4, ay + 2.8);
            ctx.lineTo(ax, ay + 1.2);
            ctx.lineTo(ax - 3.4, ay + 2.8);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          }

          // Player FOV & directional arrow
          const px = RADAR_HALF + SceneState.playerPosition.x * WORLD_TO_RADAR;
          const py = RADAR_HALF + (SceneState.playerPosition.z - ARENA_CENTER_Z) * WORLD_TO_RADAR;
          const panRad = THREE.MathUtils.degToRad(ptz.pan);
          const canvasHeading = panRad - Math.PI / 2;
          const fovHalf = (0.55 / Math.max(1, ptz.zoom * 0.5)) + 0.16;

          ctx.fillStyle = 'rgba(34, 211, 238, 0.2)';
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.arc(px, py, 28, canvasHeading - fovHalf, canvasHeading + fovHalf);
          ctx.closePath();
          ctx.fill();

          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(canvasHeading);
          ctx.fillStyle = primaryGlow;
          ctx.beginPath();
          ctx.moveTo(5.6, 0);
          ctx.lineTo(-3.6, -3.6);
          ctx.lineTo(-2.1, 0);
          ctx.lineTo(-3.6, 3.6);
          ctx.closePath();
          ctx.fill();
          ctx.restore();

          ctx.restore();

          ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(RADAR_HALF, RADAR_HALF, RADAR_HALF - 3, 0, Math.PI * 2);
          ctx.stroke();

          if (zoomTextRef.current) {
            zoomTextRef.current.textContent = `${ptz.zoom.toFixed(1)}X`;
          }
          if (azTextRef.current) {
            azTextRef.current.textContent = `${ptz.pan.toFixed(0)}°`;
          }
          if (allyCountRef.current) {
            const allyText = activeAllyCount > 0 ? `${activeAllyCount}` : '0';
            if (allyCountRef.current.textContent !== allyText) {
              allyCountRef.current.textContent = allyText;
            }
            allyCountRef.current.style.opacity = activeAllyCount > 0 ? '1' : '0.45';
          }
        }
      }
      rafId = requestAnimationFrame(renderRadar);
    };

    rafId = requestAnimationFrame(renderRadar);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <motion.div
      data-testid="minimap-panel"
      initial={{ x: -30, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.2 }}
      className="absolute bottom-4 left-5 p-1.5 bg-slate-950/50 backdrop-blur-md border border-white/10 rounded-lg w-56 pointer-events-none z-10"
    >
      <div className="flex justify-center">
        <canvas
          ref={canvasRef}
          width={RADAR_SIZE}
          height={RADAR_SIZE}
          style={{ width: RADAR_SIZE, height: RADAR_SIZE }}
          data-testid="minimap-canvas"
          className="block shrink-0"
        />
      </div>

      <div className="mt-1.5 pt-1 border-t border-white/10 px-1 flex flex-col gap-1 text-[9px] font-mono text-slate-400">
        <div className="flex justify-between items-center">
          <span>
            AZ <span ref={azTextRef} className="text-cyan-300 font-orbitron font-bold">0°</span>
          </span>
          <span>
            ZOOM <span ref={zoomTextRef} className="text-cyan-300 font-orbitron font-bold">1.0X</span>
          </span>
        </div>
        <div className="flex justify-between items-center text-[8px] tracking-wider">
          <span className="inline-flex items-center gap-1 text-emerald-300/90">
            <span className="inline-block w-1.5 h-1.5 rotate-45 bg-emerald-400" />
            ALIADO{' '}
            <span
              ref={allyCountRef}
              data-testid="minimap-ally-count"
              style={{ opacity: 0.45 }}
              className="font-orbitron font-bold text-emerald-300"
            >
              0
            </span>
          </span>
          <span className="inline-flex items-center gap-1 text-rose-300/90">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-400" />
            ENEMIGO
          </span>
        </div>
      </div>
    </motion.div>
  );
};
