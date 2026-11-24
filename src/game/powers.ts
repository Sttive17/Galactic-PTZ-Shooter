export type PowerId =
  | 'RAPID_FIRE'
  | 'TRIPLE_SHOT'
  | 'EMP_BLAST'
  | 'BIG_HITBOX'
  | 'RAILGUN_SPEED'
  | 'SLOW_MO_DRONES'
  | 'SCORE_BOOST'
  | 'TIME_SURGE'
  | 'HEAVY_DAMAGE'
  | 'PIERCING_SHOT'
  | 'VAMPIRIC_SHIELD'
  | 'TITAN_ARMOR'
  | 'JET_BOOTS'
  | 'TURBO_SPRINT'
  | 'CRITICAL_OPTICS'
  | 'RICOCHET_ROUNDS'
  | 'ALLY_DRONE'
  | 'EXTENDED_MAG';

export interface PowerDefinition {
  id: PowerId;
  name: string;
  shortName: string;
  description: string;
  effectText: string;
  rarity: 'TÁCTICO' | 'ÉPICO' | 'PROTOTIPO';
  accent: 'cyan' | 'amber' | 'purple' | 'emerald' | 'rose';
}

export const POWERS_CATALOG: Record<PowerId, PowerDefinition> = {
  RAPID_FIRE: {
    id: 'RAPID_FIRE',
    name: 'CADENCIA TURBO',
    shortName: 'CADENCIA',
    description: 'Sobrecarga los capacitores del cañón láser para disparar mucho más rápido.',
    effectText: '+30% velocidad de disparo (acumulable)',
    rarity: 'TÁCTICO',
    accent: 'amber',
  },
  TRIPLE_SHOT: {
    id: 'TRIPLE_SHOT',
    name: 'DISPARO TRIPLE',
    shortName: 'TRIPLE',
    description: 'Divide el haz en 3 proyectiles de plasma en abanico táctico por cada disparo.',
    effectText: '3 rayos por tiro (+2 proyectiles extra por mejora)',
    rarity: 'PROTOTIPO',
    accent: 'rose',
  },
  EMP_BLAST: {
    id: 'EMP_BLAST',
    name: 'EXPLOSIÓN EMP',
    shortName: 'EMP',
    description: 'Al destruir un dron, libera una onda expansiva que destruye drones cercanos.',
    effectText: 'Radio de explosión 10m (+4m por mejora)',
    rarity: 'PROTOTIPO',
    accent: 'purple',
  },
  BIG_HITBOX: {
    id: 'BIG_HITBOX',
    name: 'PLASMA EXPANSIVO',
    shortName: 'PLASMA+',
    description: 'Aumenta el tamaño e impacto de tus proyectiles para acertar mucho más fácil.',
    effectText: '+60% tamaño y área de impacto del disparo',
    rarity: 'TÁCTICO',
    accent: 'cyan',
  },
  RAILGUN_SPEED: {
    id: 'RAILGUN_SPEED',
    name: 'CAÑÓN DE RIEL',
    shortName: 'RIEL',
    description: 'Acelera magnéticamente los proyectiles para impactos casi instantáneos.',
    effectText: '+45% velocidad de proyectiles',
    rarity: 'TÁCTICO',
    accent: 'cyan',
  },
  SLOW_MO_DRONES: {
    id: 'SLOW_MO_DRONES',
    name: 'CAMPO CRIOGÉNICO',
    shortName: 'CRIO',
    description: 'Interfiere con los propulsores enemigos reduciendo su velocidad de evasión.',
    effectText: '-25% velocidad de todos los drones (hasta -65%)',
    rarity: 'ÉPICO',
    accent: 'emerald',
  },
  SCORE_BOOST: {
    id: 'SCORE_BOOST',
    name: 'NÚCLEO CUÁNTICO',
    shortName: 'PTS+',
    description: 'Amplifica el sistema de telemetría para multiplicar todos tus puntos ganados.',
    effectText: '+50% puntos en cada impacto confirmado',
    rarity: 'ÉPICO',
    accent: 'amber',
  },
  TIME_SURGE: {
    id: 'TIME_SURGE',
    name: 'SOBRECARGA TEMPORAL',
    shortName: 'TIEMPO+',
    description: 'Inyecta energía de reserva al reloj de la simulación de combate.',
    effectText: '+25s inmediatos y +10s extra en futuras rondas',
    rarity: 'TÁCTICO',
    accent: 'emerald',
  },
  HEAVY_DAMAGE: {
    id: 'HEAVY_DAMAGE',
    name: 'CAÑÓN DE ANTIMATERIA',
    shortName: 'DAÑO+',
    description: 'Sobrecarga el núcleo energético de cada bala para perforar blindajes y jefes más rápido.',
    effectText: '+1 de daño base por disparo (acumulable)',
    rarity: 'PROTOTIPO',
    accent: 'rose',
  },
  PIERCING_SHOT: {
    id: 'PIERCING_SHOT',
    name: 'BALAS PERFORANTES',
    shortName: 'PERFORAR',
    description: 'Los rayos de plasma atraviesan objetivos en línea sin detenerse al primer impacto.',
    effectText: 'Atraviesa +1 objetivo extra por mejora',
    rarity: 'PROTOTIPO',
    accent: 'cyan',
  },
  VAMPIRIC_SHIELD: {
    id: 'VAMPIRIC_SHIELD',
    name: 'DRENAJE DE ESCUDO',
    shortName: 'VAMPIRO',
    description: 'Absorbe energía residual de cada enemigo destruido para reparar tu traje.',
    effectText: 'Restaura +6 de Escudo/Salud por baja (+6 por nivel)',
    rarity: 'ÉPICO',
    accent: 'emerald',
  },
  TITAN_ARMOR: {
    id: 'TITAN_ARMOR',
    name: 'BLINDAJE TITÁN',
    shortName: 'BLINDAJE',
    description: 'Refuerza la estructura del exotraje aumentando la capacidad máxima y mitigando impactos.',
    effectText: '+35 Escudo máx. y curación + -15% daño recibido',
    rarity: 'TÁCTICO',
    accent: 'cyan',
  },
  JET_BOOTS: {
    id: 'JET_BOOTS',
    name: 'PROPULSORES DE SALTO',
    shortName: 'SALTO+',
    description: 'Activa micropropulsores vectoriales para saltar más alto y realizar saltos en el aire.',
    effectText: '+25% altura de salto y +1 salto aéreo',
    rarity: 'TÁCTICO',
    accent: 'purple',
  },
  TURBO_SPRINT: {
    id: 'TURBO_SPRINT',
    name: 'EXO-PIERNAS TURBO',
    shortName: 'SPRINT+',
    description: 'Optimiza los actuadores de movilidad para correr más rápido y cansarse mucho menos.',
    effectText: '+18% velocidad, -25% gasto y +35% recarga de sprint',
    rarity: 'TÁCTICO',
    accent: 'amber',
  },
  CRITICAL_OPTICS: {
    id: 'CRITICAL_OPTICS',
    name: 'ÓPTICA CRÍTICA',
    shortName: 'CRÍTICO',
    description: 'Calibra el puntero táctico para impactar puntos débiles con daño multiplicado.',
    effectText: '+25% prob. de crítico (2.5x de daño al activar)',
    rarity: 'ÉPICO',
    accent: 'amber',
  },
  RICOCHET_ROUNDS: {
    id: 'RICOCHET_ROUNDS',
    name: 'MUNICIÓN REBOTE',
    shortName: 'REBOTE',
    description: 'Recubre los disparos con plasma reflectante que rebota contra muros, suelo y cajas.',
    effectText: '+1 rebote en superficies por mejora',
    rarity: 'ÉPICO',
    accent: 'purple',
  },
  ALLY_DRONE: {
    id: 'ALLY_DRONE',
    name: 'ESCUADRÓN DE DRONES',
    shortName: 'ALIADOS',
    description: 'Despliega drones aliados tácticos que flanquean, priorizan amenazas y abren fuego rápido automático.',
    effectText: 'Nv1-2: 1 aliado · Nv3-4: 2 aliados · Nv5+: 3 aliados (más cadencia y daño)',
    rarity: 'PROTOTIPO',
    accent: 'cyan',
  },
  EXTENDED_MAG: {
    id: 'EXTENDED_MAG',
    name: 'CARGADOR EXTENDIDO',
    shortName: 'BALAS+',
    description: 'Amplía la capacidad del cargador de plasma y acelera el ciclo de recarga.',
    effectText: 'Capacidad: 50 → 80 → 120 → 200 balas (+recarga rápida)',
    rarity: 'TÁCTICO',
    accent: 'amber',
  },
};

export const ALL_POWER_IDS = Object.keys(POWERS_CATALOG) as PowerId[];

export function getRandomPowerChoices(count = 3): PowerId[] {
  const pool = [...ALL_POWER_IDS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}
