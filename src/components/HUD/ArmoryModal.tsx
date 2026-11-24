import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../game/gameState';
import { playSound } from '../../game/AudioSystem';
import { triggerHaptic } from '../../game/haptics';
import { UPGRADE_TIERS, SKIN_CATALOG } from '../../game/armory';
import type { WeaponSkinId } from '../../game/armory';
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
} from 'lucide-react';

interface ArmoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArmoryModal = ({ isOpen, onClose }: ArmoryModalProps) => {
  const [tab, setTab] = useState<'UPGRADES' | 'SKINS'>('UPGRADES');
  const nanites = useGameStore((state) => state.nanites);
  const armory = useGameStore((state) => state.armory);
  const purchaseArmoryUpgrade = useGameStore((state) => state.purchaseArmoryUpgrade);
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
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6">
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
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-4">
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
