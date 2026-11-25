import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../game/gameState';
import { playSound } from '../../game/AudioSystem';
import { triggerHaptic } from '../../game/haptics';
import { DOCTRINE_NODES, UPGRADE_TIERS, SKIN_CATALOG } from '../../game/armory';
import type { TacticalDoctrineId, WeaponSkinId } from '../../game/armory';
import { ShipTurntable } from './ShipTurntable';
import {
  Shield,
  Heart,
  Magnet,
  Zap,
  Sparkles,
  X,
  Palette,
  Crosshair,
  ChevronRight,
  Check,
  Trophy,
  Award,
} from 'lucide-react';

interface ArmoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArmoryModal = ({ isOpen, onClose }: ArmoryModalProps) => {
  const [tab, setTab] = useState<'UPGRADES' | 'DOCTRINE' | 'SKINS' | 'PILOT'>('UPGRADES');
  const nanites = useGameStore((state) => state.nanites);
  const armory = useGameStore((state) => state.armory);
  const pilotStats = useGameStore((state) => state.pilotStats);
  const purchaseArmoryUpgrade = useGameStore((state) => state.purchaseArmoryUpgrade);
  const unlockDoctrine = useGameStore((state) => state.unlockDoctrine);
  const selectArmorySkin = useGameStore((state) => state.selectArmorySkin);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && (e.key === 'Escape' || e.key === 'b' || e.key === 'B')) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleUpgrade = (type: 'shield' | 'health' | 'magnet' | 'dash') => {
    const success = purchaseArmoryUpgrade(type);
    if (success) {
      playSound('powerup');
      triggerHaptic('dash');
    } else {
      playSound('empty');
    }
  };

  const handleSkin = (skinId: WeaponSkinId) => {
    playSound('ui');
    selectArmorySkin(skinId);
  };

  const handleDoctrine = (id: TacticalDoctrineId) => {
    if (!unlockDoctrine(id)) {
      playSound('empty');
    }
  };

  const getPilotRank = (kills: number) => {
    if (kills >= 150) return { title: 'AS DE LA FEDERACIÓN', color: 'text-amber-400', border: 'border-amber-400/40' };
    if (kills >= 60) return { title: 'COMANDANTE DE ASALTO', color: 'text-fuchsia-400', border: 'border-fuchsia-400/40' };
    if (kills >= 20) return { title: 'PILOTO DE ÉLITE', color: 'text-cyan-400', border: 'border-cyan-400/40' };
    return { title: 'CADETE ESPACIAL', color: 'text-emerald-400', border: 'border-emerald-400/40' };
  };

  const upgradeCards = [
    {
      id: 'shield' as const,
      name: 'BLINDAJE DE ESCUDO',
      level: armory.shieldLevel,
      maxLevel: 3,
      icon: Shield,
      color: 'text-cyan-400',
      borderColor: 'border-cyan-500/40',
      tiers: UPGRADE_TIERS.shield,
      desc: 'Refuerza los deflectores de plasma para soportar más fuego directo.',
    },
    {
      id: 'health' as const,
      name: 'INTEGRIDAD DEL CASCO',
      level: armory.healthLevel,
      maxLevel: 3,
      icon: Heart,
      color: 'text-emerald-400',
      borderColor: 'border-emerald-500/40',
      tiers: UPGRADE_TIERS.health,
      desc: 'Micro-soldadura de nano-fibras que eleva la salud máxima.',
    },
    {
      id: 'magnet' as const,
      name: 'IMÁN DE BOTÍN CUÁNTICO',
      level: armory.magnetLevel,
      maxLevel: 3,
      icon: Magnet,
      color: 'text-amber-400',
      borderColor: 'border-amber-500/40',
      tiers: UPGRADE_TIERS.magnet,
      desc: 'Aumenta el radio de atracción gravitacional para orbes y munición.',
    },
    {
      id: 'dash' as const,
      name: 'PROPULSORES TÁCTICOS',
      level: armory.dashLevel,
      maxLevel: 2,
      icon: Zap,
      color: 'text-fuchsia-400',
      borderColor: 'border-fuchsia-500/40',
      tiers: UPGRADE_TIERS.dash,
      desc: 'Inyectores de plasma que reducen drásticamente el cooldown de esquiva.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 select-none">
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="w-full max-w-3xl bg-slate-900/95 border border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(34,211,238,0.2)] overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-500/20 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-400">
              <Crosshair size={22} />
            </div>
            <div>
              <div className="text-[10px] font-mono tracking-[0.25em] text-cyan-400 uppercase">
                TALLER TÁCTICO // HANGAR ORBITAL
              </div>
              <h2 className="text-xl font-orbitron font-black text-white tracking-[0.1em]">
                ARMERÍA Y MEJORAS
              </h2>
            </div>
          </div>

          {/* Nanites Counter */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-cyan-950/70 border border-cyan-400/40 text-cyan-300 font-mono text-sm font-bold shadow-[0_0_15px_rgba(34,211,238,0.2)]">
              <Sparkles size={16} className="text-cyan-400 animate-pulse" />
              <span>{nanites}</span>
              <span className="text-[10px] text-cyan-400/70">NANITAS</span>
            </div>

            <button
              onClick={() => {
                playSound('ui');
                onClose();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap border-b border-slate-800 bg-slate-950/40 px-6">
          <button
            onClick={() => {
              playSound('ui');
              setTab('UPGRADES');
            }}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-orbitron font-bold border-b-2 transition-all ${
              tab === 'UPGRADES'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield size={16} />
            MEJORAS PERMANENTES
          </button>
          <button
            onClick={() => {
              playSound('ui');
              setTab('DOCTRINE');
            }}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-orbitron font-bold border-b-2 transition-all ${
              tab === 'DOCTRINE'
                ? 'border-violet-400 text-violet-300 bg-violet-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles size={16} />
            ÁRBOL DE DOCTRINA
          </button>
          <button
            onClick={() => {
              playSound('ui');
              setTab('SKINS');
            }}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-orbitron font-bold border-b-2 transition-all ${
              tab === 'SKINS'
                ? 'border-fuchsia-400 text-fuchsia-300 bg-fuchsia-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Palette size={16} />
            CAMUFLAJES Y SKINS
          </button>
          <button
            onClick={() => {
              playSound('ui');
              setTab('PILOT');
            }}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-orbitron font-bold border-b-2 transition-all ${
              tab === 'PILOT'
                ? 'border-amber-400 text-amber-300 bg-amber-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trophy size={16} />
            ESTADÍSTICAS DEL PILOTO
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* 3D Hangar Turntable Preview */}
          <ShipTurntable />

          {tab === 'UPGRADES' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upgradeCards.map((up) => {
                const isMax = up.level >= up.maxLevel;
                const nextTier = !isMax ? up.tiers[up.level] : null;
                const canAfford = nextTier && nanites >= nextTier.cost;

                return (
                  <div
                    key={up.id}
                    className={`p-4 rounded-xl bg-slate-950/60 border ${up.borderColor} flex flex-col justify-between`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <up.icon size={20} className={up.color} />
                          <h3 className="font-orbitron font-bold text-sm text-white">
                            {up.name}
                          </h3>
                        </div>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                          NVL {up.level}/{up.maxLevel}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-mono mb-3">{up.desc}</p>

                      {/* Tier progress indicators */}
                      <div className="flex gap-1.5 mb-3">
                        {Array.from({ length: up.maxLevel }).map((_, i) => (
                          <div
                            key={i}
                            className={`h-1.5 flex-1 rounded-full ${
                              i < up.level ? 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]' : 'bg-slate-800'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                      {isMax ? (
                        <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                          <Check size={14} /> NIVEL MÁXIMO
                        </span>
                      ) : (
                        <>
                          <div className="text-[11px] font-mono text-cyan-300">
                            {nextTier?.bonusText}
                          </div>
                          <button
                            onClick={() => handleUpgrade(up.id)}
                            disabled={!canAfford}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-orbitron font-bold transition-all ${
                              canAfford
                                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 hover:brightness-110 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            }`}
                          >
                            <Sparkles size={13} />
                            <span>{nextTier?.cost} N</span>
                            <ChevronRight size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'DOCTRINE' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-violet-500/30 bg-violet-950/20 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="font-orbitron text-sm font-black tracking-wider text-violet-200">
                      DOCTRINA DE COMBATE
                    </div>
                    <p className="mt-1 text-xs font-mono text-slate-400">
                      Elige rutas permanentes. Cada nodo avanzado requiere el núcleo de su propia rama.
                    </p>
                  </div>
                  <div className="rounded-full border border-violet-400/30 bg-slate-950/70 px-3 py-1 text-xs font-mono text-violet-200">
                    {armory.unlockedDoctrines.length}/{Object.keys(DOCTRINE_NODES).length} NODOS ACTIVOS
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {(Object.keys(DOCTRINE_NODES) as TacticalDoctrineId[]).map((id) => {
                  const node = DOCTRINE_NODES[id];
                  const isUnlocked = armory.unlockedDoctrines.includes(id);
                  const prerequisiteMet = !node.prerequisite || armory.unlockedDoctrines.includes(node.prerequisite);
                  const canUnlock = prerequisiteMet && nanites >= node.cost;
                  const isCombat = node.branch === 'COMBAT';

                  return (
                    <div
                      key={id}
                      className={`relative overflow-hidden rounded-xl border p-4 transition-colors ${
                        isUnlocked
                          ? isCombat
                            ? 'border-cyan-400/70 bg-cyan-950/35 shadow-[0_0_18px_rgba(34,211,238,0.16)]'
                            : 'border-emerald-400/70 bg-emerald-950/35 shadow-[0_0_18px_rgba(52,211,153,0.14)]'
                          : prerequisiteMet
                            ? 'border-violet-500/40 bg-slate-950/60'
                            : 'border-slate-800 bg-slate-950/35 opacity-70'
                      }`}
                    >
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                          <div className={`text-[10px] font-mono tracking-[0.18em] ${isCombat ? 'text-cyan-300' : 'text-emerald-300'}`}>
                            {node.branch === 'COMBAT' ? 'RAMA DE ASALTO' : 'RAMA DE SOPORTE'}
                          </div>
                          <h3 className="mt-1 font-orbitron text-sm font-bold text-white">{node.name}</h3>
                        </div>
                        {isUnlocked ? (
                          <Check size={18} className="shrink-0 text-emerald-300" />
                        ) : (
                          <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-300">
                            {node.cost} N
                          </span>
                        )}
                      </div>
                      <p className="min-h-10 text-xs font-mono text-slate-400">{node.description}</p>
                      <div className="mt-3 border-t border-slate-800 pt-3">
                        <div className="text-xs font-mono text-violet-200">{node.effectText}</div>
                        {node.prerequisite && !prerequisiteMet && (
                          <div className="mt-1 text-[10px] font-mono text-amber-300">
                            REQUIERE: {DOCTRINE_NODES[node.prerequisite].name}
                          </div>
                        )}
                        <button
                          onClick={() => handleDoctrine(id)}
                          disabled={isUnlocked || !canUnlock}
                          className={`mt-3 w-full rounded-lg px-3 py-2 text-xs font-orbitron font-bold transition-all ${
                            isUnlocked
                              ? 'bg-emerald-950/60 text-emerald-300'
                              : canUnlock
                                ? 'bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white hover:brightness-110'
                                : 'cursor-not-allowed bg-slate-800 text-slate-500'
                          }`}
                        >
                          {isUnlocked ? 'DOCTRINA ACTIVA' : prerequisiteMet ? `INVESTIGAR · ${node.cost} N` : 'RUTA BLOQUEADA'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === 'SKINS' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(Object.keys(SKIN_CATALOG) as WeaponSkinId[]).map((skinId) => {
                const skin = SKIN_CATALOG[skinId];
                const isUnlocked = armory.unlockedSkins.includes(skinId);
                const isEquipped = armory.activeSkin === skinId;
                const canAfford = nanites >= skin.cost;

                return (
                  <div
                    key={skinId}
                    className={`p-4 rounded-xl bg-slate-950/60 border ${
                      isEquipped
                        ? 'border-fuchsia-400 shadow-[0_0_20px_rgba(232,121,249,0.3)]'
                        : 'border-slate-800'
                    } flex flex-col justify-between`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-4 h-4 rounded-full border border-white/40 shadow-sm"
                            style={{
                              backgroundColor: skin.accentColor,
                              boxShadow: `0 0 10px ${skin.accentColor}`,
                            }}
                          />
                          <h3 className="font-orbitron font-bold text-sm text-white">
                            {skin.name}
                          </h3>
                        </div>
                        {isEquipped && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-500/40">
                            EQUIPADO
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 font-mono mb-4">{skin.description}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-3 rounded"
                          style={{ backgroundColor: skin.bodyColor }}
                        />
                        <div
                          className="w-6 h-3 rounded"
                          style={{ backgroundColor: skin.accentColor }}
                        />
                      </div>

                      {isUnlocked ? (
                        <button
                          onClick={() => handleSkin(skinId)}
                          disabled={isEquipped}
                          className={`px-3 py-1.5 rounded-lg text-xs font-orbitron font-bold transition-all ${
                            isEquipped
                              ? 'bg-slate-800 text-slate-500 cursor-default'
                              : 'bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-[0_0_12px_rgba(232,121,249,0.3)]'
                          }`}
                        >
                          {isEquipped ? 'ACTIVO' : 'EQUIPAR'}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSkin(skinId)}
                          disabled={!canAfford}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-orbitron font-bold transition-all ${
                            canAfford
                              ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 hover:brightness-110 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          <Sparkles size={13} />
                          <span>DESBLOQUEAR ({skin.cost} N)</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'PILOT' && (
            <div className="space-y-4">
              {/* Pilot Rank Banner */}
              <div
                className={`p-4 rounded-xl bg-slate-950/70 border ${
                  getPilotRank(pilotStats.killsTotal).border
                } flex flex-wrap items-center justify-between gap-4`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-400/30 text-amber-400">
                    <Award size={26} />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-slate-400 tracking-wider">
                      HOJA DE SERVICIO // RANGO MILITAR
                    </div>
                    <div
                      className={`text-lg font-orbitron font-black tracking-wider ${
                        getPilotRank(pilotStats.killsTotal).color
                      }`}
                    >
                      {getPilotRank(pilotStats.killsTotal).title}
                    </div>
                  </div>
                </div>
                <div className="text-right font-mono text-xs text-slate-400">
                  <div>RÉCORD DE PUNTUACIÓN</div>
                  <div className="text-base font-orbitron font-bold text-white">
                    {pilotStats.highScore.toLocaleString()} PTS
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400">ENEMIGOS DESTRUIDOS</div>
                  <div className="text-xl font-orbitron font-black text-rose-400 mt-1">
                    {pilotStats.killsTotal}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 mt-0.5">Bajas confirmadas</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400">JEFES NEUTRALIZADOS</div>
                  <div className="text-xl font-orbitron font-black text-amber-400 mt-1">
                    {pilotStats.bossesDefeated}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 mt-0.5">Titanes caídos</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400">PRECISIÓN DE TIRO</div>
                  <div className="text-xl font-orbitron font-black text-cyan-400 mt-1">
                    {pilotStats.shotsFired > 0
                      ? ((pilotStats.shotsHit / pilotStats.shotsFired) * 100).toFixed(1)
                      : '0.0'}
                    %
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                    {pilotStats.shotsHit} / {pilotStats.shotsFired} disp.
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400">COMBO MÁXIMO</div>
                  <div className="text-xl font-orbitron font-black text-fuchsia-400 mt-1">
                    {pilotStats.highestCombo}x
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 mt-0.5">Multiplicador récord</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400">NANITAS ACUMULADAS</div>
                  <div className="text-xl font-orbitron font-black text-emerald-400 mt-1">
                    {pilotStats.nanitesCollected}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 mt-0.5">Material recolectado</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400">MISIONES COMPLETADAS</div>
                  <div className="text-xl font-orbitron font-black text-sky-400 mt-1">
                    {pilotStats.missionsCompleted}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 mt-0.5">Sectores pacificados</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>Las nanitas se consiguen destruyendo enemigos y recogiendo orbes de botín.</span>
          <span className="hidden sm:inline">[ESC] / (B) CERRAR</span>
        </div>
      </motion.div>
    </div>
  );
};
