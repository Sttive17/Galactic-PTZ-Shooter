# Galactic PTZ Shooter — Mega Actualización y Evolución 3D

**Galactic PTZ Shooter** es un shooter espacial 3D táctico e inmersivo en primera persona desarrollado con React 19, TypeScript, Three.js y React Three Fiber. El jugador pilota la nave interceptora *Vanguard MK-IV* a través de diversos biomas estelares, enfrentando drones de combate, soldados cyborg pesados, robots de asalto y titanes colosales mecanizados.

Disfruta de combate táctico con 5 arquetipos de armas, habilidades activas de pulso EMP y sobrecarga frenesí, hangares tridimensionales con vista previa en tiempo real, drones aliados escolta, elementos destruibles en el entorno y un registro persistente de estadísticas militares del piloto.

[![CI](https://github.com/Sttive17/Galactic-PTZ-Shooter/actions/workflows/ci.yml/badge.svg)](https://github.com/Sttive17/Galactic-PTZ-Shooter/actions/workflows/ci.yml)

---

## 🎮 Jugar

- **Versión oficial en línea:** [Abrir Galactic PTZ Shooter](https://sttive17.github.io/Galactic-PTZ-Shooter/)
- **Compatibilidad:** Navegadores modernos con aceleración WebGL 2.0 (Google Chrome, Microsoft Edge, Firefox, Safari).
- **Dispositivos:** Compatible con PC (Teclado + Ratón), Mandos (Xbox Gamepad API con vibración háptica) y Dispositivos Móviles (Teléfonos y Tablets con pantalla táctil adaptable).

---

## 📑 Tabla de Contenidos

1. [Características Principales](#-características-principales)
2. [Evolución Técnica y Modelos 3D](#-evolución-técnica-y-modelos-3d)
3. [Arsenal y Armamento](#-arsenal-y-armamento)
4. [Habilidades Activas Tácticas](#-habilidades-activas-tácticas)
5. [Enemigos y Unidades Hostiles](#-enemigos-y-unidades-hostiles)
6. [Jefes y Titanes Mecanizados](#-jefes-y-titanes-mecanizados)
7. [Drones Aliados de Escolta](#-drones-aliados-de-escolta)
8. [Mundo, Biomas y Entorno Interactivo](#-mundo-biomas-y-entorno-interactivo)
9. [Progresión, Armería y Estadísticas del Piloto](#-progresión-armería-y-estadísticas-del-piloto)
10. [Controles y Esquemas de Entrada](#-controles-y-esquemas-de-entrada)
11. [Audio, Síntesis y Voz Táctica](#-audio-síntesis-y-voz-táctica)
12. [Optimización WebGL y Rendimiento](#-optimización-webgl-y-rendimiento)
13. [Estructura del Proyecto](#-estructura-del-proyecto)
14. [Requisitos e Instalación Local](#-requisitos-e-instalación-local)
15. [Comandos y Verificación](#-comandos-y-verificación)
16. [Catálogo de Modelos 3D y Licencias](#-catálogo-de-modelos-3d-y-licencias)
17. [Hoja de Ruta (Roadmap)](#-hoja-de-ruta-roadmap)

---

## 🚀 Características Principales

- **Cámara Táctica PTZ en Primera Persona:** Giro de 360° en acimut, inclinación de elevación, modos ópticos (Normal, Visión Térmica FLIR, Visión Nocturna NVG) y zoom progresivo.
- **Modelos 3D Reales en GLB:** Naves de combate detalladas, droides hostiles, soldados mecha, titanes de gran escala, torretas defensivas y hangares industriales (assets CC0 de alta fidelidad).
- **Hangar 3D Central Interactivo:** Mesa giratoria (*turntable*) en tiempo real de la nave *Vanguard MK-IV* con iluminación de estudio, efectos de estela iónica y previsualización de skins de camuflaje.
- **Arsenal Extendido de 5 Arquetipos:** Rifle de Plasma, Escopeta Flak de Dispersión, Railgun Pesado de Precisión, Micro-Misiles Autoguiados y Rayo Criogénico de Enfriamiento.
- **Habilidades Activas:** Pulso Electromagnético (EMP) defensivo `[F]` y Sobrecarga Frenesí (Overdrive) `[Q]`.
- **Drones Aliados de Apoyo:** Escolta automatizada con modelo 3D `DRONE_SCOUT`, fuego asistido, escudos de plasma y balizas sensoriales en tiempo real.
- **Entorno Interactivo y Destructibles:** Cajas de suministros tácticos y cápsulas energéticas que se fracturan bajo fuego enemigo o del jugador, liberando munición, nanitas y escudos.
- **Hoja de Servicio y Estadísticas del Piloto:** Sistema persistente (`localStorage`) que registra bajas enemigas, titanes eliminados, disparos, impactos, precisión porcentual, combo máximo, récord de puntos y rango militar honorífico.
- **Compatibilidad Total Multiplataforma:** Soporte para PC (KBM), Mandos Xbox con vibración háptica completa y controles táctiles dinámicos en pantalla.

---

## 🛰️ Evolución Técnica y Modelos 3D

El proyecto ha evolucionado más allá de geometrías puramente abstractas mediante la integración de **22 modelos 3D optimizados en formato GLB**, garantizando una identidad visual cohesiva y un consumo de memoria mínimo (menos de 16 MB en total):

- **Nave del Jugador:** `player_ship.glb` (*Vanguard MK-IV* con turbinas dobles y alerones de maniobra orbital).
- **Caza Interceptor:** `fighter_interceptor.glb` (caza de combate estelar de alta velocidad).
- **Droides y Tropas Hostiles:** `drone_gunner.glb`, `drone_scout.glb`, `robot_walker.glb`, `heavy_cyborg.glb`.
- **Titanes y Jefes Colosales:** `boss_mecha_titan.glb` (Titán Mecha cuadrúpedo con baterías pesadas) y `boss_behemoth.glb` (Coloso blindado Aegis).
- **Arsenal Táctico:** Modelos y viewmodels para rifles de plasma, lanzacohetes pesados y rifles de francotirador.
- **Infraestructura de Hangar:** Muros industriales (`hangar_wall.glb`), columnas estructurales (`hangar_column.glb`), compuertas blindadas (`hangar_door.glb`), escaleras de servicio y torretas de defensa perimetral.
- **Objetos Interactivos y Botín:** Generadores de energía (`power_generator.glb`), cajas de suministros sci-fi (`scifi_crate.glb`), cápsulas criogénicas (`scifi_capsule.glb`), núcleos de nanitas y orbes de escudo.

---

## 💥 Arsenal y Armamento

El sistema de combate cuenta con 5 armas seleccionables en combate mediante teclas numéricas `[1]` a `[5]`, ciclado con rueda de ratón o cruceta del mando:

| Arma | Tecla | Cadencia | Daño | Capacidad | Especialidad |
|---|---|---|---|---|---|
| **Rifle de Plasma** | `[1]` | Alta (90ms) | Medio (12) | 50 proyectiles | Fuego sostenido balanceado para enfrentamientos medios. |
| **Escopeta Flak** | `[2]` | Media (450ms) | Alto (30 por disparo) | 8 cartuchos | Ráfaga de 6 perdigones de alta dispersión a quemarropa. |
| **Railgun Pesado** | `[3]` | Baja (900ms) | Masivo (80) | 5 cargas | Haz perforante instantáneo capaz de penetrar blindajes de titán. |
| **Micro-Misiles** | `[4]` | Rápida (180ms) | Explosivo (24 + área) | 20 cohetes | Misiles propulsados de trayectoria acelerada y detonación en racimo. |
| **Rayo Criogénico** | `[5]` | Continua (60ms) | Alto continuo | Haz sostenido | Haz de cero absoluto que ralentiza e inhabilita sistemas de drones enemigos. |

---

## ⚡ Habilidades Activas Tácticas

1. **Pulso Electromagnético (EMP Pulse) `[Tecla F] / [Mando RB] / [Botón EMP]`:**
   - Emite una onda de choque esférica de 24 metros alrededor del jugador.
   - Destruye proyectiles hostiles entrantes, neutraliza generadores y aturde objetivos circundantes.
   - Enfriamiento: 15 segundos.

2. **Sobrecarga Frenesí (Overdrive) `[Tecla Q] / [Mando D-Pad Abajo] / [Botón FRENESÍ]`:**
   - Activa los sobrealimentadores de plasma durante 6 segundos.
   - Duplica la cadencia de fuego de todas las armas y otorga **munición infinita sin recarga** durante el estado activo.
   - Enfriamiento: 25 segundos.

---

## 👾 Enemigos y Unidades Hostiles

La inteligencia artificial táctica coordina 11 arquetipos de enemigos con comportamientos de vuelo y asalto diferenciados:

- **STRIKER (`drone_gunner.glb`):** Dron de ataque artillado con cañones automáticos gemelos.
- **FLANKER (`fighter_interceptor.glb`):** Caza veloz que realiza maniobras de rodeo orbital a 28 metros.
- **SNIPER (`robot_walker.glb`):** Unidad bípeda de alta precisión que dispara cerrojos de largo alcance desde elevaciones.
- **JUGGERNAUT (`heavy_cyborg.glb`):** Soldado pesado acorazado con blindaje reforzado capaz de absorber fuego sostenido.
- **SCOUT (`drone_scout.glb`):** Unidad de reconocimiento ligera de alta maniobrabilidad.
- **SWARMER:** Enjambres veloces que atacan en formaciones sincronizadas.
- **KAMIKAZE:** Drones explosivos que aceleran en rumbo de colisión directa hacia el jugador.
- **TACTICIAN:** Dron de comando que emite pulsos de escudo a sus aliados cercanos.
- **HEALER:** Dron bio-mecánico que regenera la integridad de otras unidades hostiles.

---

## 👹 Jefes y Titanes Mecanizados

Los encuentros con titanes ocurren en rondas clave (cada 5 niveles de campaña o en oleadas de entrenamiento designadas):

- **Titán Mecha Quadrúpedo (`boss_mecha_titan.glb`):** Titán de combate masivo equipado con baterías dobles de misiles en la torreta dorsal y colmillos hidráulicos de asalto.
- **Coloso Behemoth Aegis (`boss_behemoth.glb`):** Unidad hiperblindada protegida por generadores de escudo orbital satelitales que deben ser destruidos previamente.
- **Fases de Combate:** Al descender del 50% de salud, los titanes activan ráfagas de misiles en espiral, saltos de teletransporte cuántico y patrones de barrido térmico.

---

## 🛸 Drones Aliados de Escolta

Al desbloquear mejoras o poderes tácticos, el jugador cuenta con compañeros autómatas:
- Representados mediante el modelo 3D `DRONE_SCOUT`.
- Cuentan con propulsores lumínicos gemelos, halo de energía protectora y radar rotatorio esmeralda.
- Rastrean el espacio aéreo del jugador, abriendo fuego automático contra objetivos hostiles detectados.

---

## 🌌 Mundo, Biomas y Entorno Interactivo

El generador de sectores procedural incluye 10 biomas estelares:
1. **Hangar Orbital:** Instalación militar con muros blindados, compuertas de presurización, torretas de defensa perimetral y generadores de energía.
2. **Ciudadela Helada:** Estructuras de hielo extraterrestre con cristales masivos y refracción fría.
3. **Mundo Volcánico:** Terrenos ígneos con niebla de azufre, ceniza solar y roca volcánica.
4. **Laboratorio Alienígena:** Cápsulas biológicas, esporas bioluminiscentes y reliquias de energía.
5. **Campo de Asteroides:** Cúmulos de meteoritos flotantes y plataformas gravitacionales.

### Cajas de Suministro Destructibles
En cada sector aparecen cajas tácticas (`scifi_crate.glb`) y cápsulas (`scifi_capsule.glb`). Al ser disparadas por el jugador, reproducen sonido de fractura de metal, generan escombros de partículas y liberan orbes de munición, nanitas o recarga de escudo.

---

## 🎖️ Progresión, Armería y Estadísticas del Piloto

### Hangar y Taller Táctico
Accede a la Armería desde el menú principal o pulsando `[B]` durante la partida:
- **Mejoras Permanentes:**
  - *Blindaje de Escudo:* Incrementa los deflectores de plasma para soportar más impactos.
  - *Integridad del Casco:* Soldadura de nanofibras que eleva la salud máxima.
  - *Imán de Botín Cuántico:* Radio ampliado de atracción de orbes de nanitas y munición.
  - *Propulsores Tácticos:* Reduce el tiempo de reutilización de la esquiva (dash).
- **Camuflajes y Skins:**
  - *Interceptor Estándar* (Azul cian y gris naval).
  - *Golden Vanguard* (Chasis dorado de élite con estelas ámbar).
  - *Stealth Shadow* (Negro mate absorbente de radar).
  - *Inferno Overdrive* (Rojo carmesí volcánico).
  - *Cyber Neon* (Fucsia y violeta bio-sintético).

### Hoja de Servicio Militar
El registro de estadísticas rastrea:
- **Rango Militar:** *Cadete Espacial* ➡️ *Piloto de Élite* ➡️ *Comandante de Asalto* ➡️ *As de la Federación Galáctica*.
- **Métricas:** Bajas totales confirmadas, titanes caídos, disparos efectuados, impactos, porcentaje de precisión balística, combo multiplicador récord, nanitas acumuladas y misiones completadas.

---

## 🕹️ Controles y Esquemas de Entrada

### Teclado y Ratón (PC)

| Acción | Control |
|---|---|
| Desplazamiento | `W`, `A`, `S`, `D` o Flechas |
| Mirar / Apuntar | Movimiento del ratón |
| Disparar | Clic izquierdo sostenido |
| Zoom Táctico PTZ | Clic derecho sostenido |
| Saltar | Barra espaciadora |
| Sprint / Acelerar | `Shift` izquierdo sostenido |
| Esquivar / Dash | `C` |
| **Pulso EMP** | **`F`** |
| **Sobrecarga Frenesí** | **`Q`** |
| **Cambio de Arma** | **`1` a `5` o rueda del ratón** |
| Modo Óptico (Térmico / NVG) | `V` |
| Recargar Manualmente | `R` |
| Armería / Hangar | `B` |
| Pausa / Menú | `Escape` o `P` |

### Pantallas Táctiles (Móviles / Tablets)

| Control | Acción |
|---|---|
| **Joystick Izquierdo** | Moverse y desplazarse lateralmente |
| **Joystick Derecho** | Mirar 360° y apuntar |
| **Botón FUEGO** | Disparo sostenido |
| **Botón ZOOM** | Zoom táctico asistido |
| **Botón SALTAR** | Salto gravitacional |
| **Botón RECARGA** | Recarga rápida del cargador |
| **Botón CORRER** | Sprint táctico |
| **Botón EMP** | Activa el pulso electromagnético |
| **Botón FRENESÍ** | Activa la sobrecarga de disparo |
| **Botón PAUSA** | Menú de pausa y configuración |

### Mando Xbox (Gamepad API)

| Control | Acción |
|---|---|
| **Stick Izquierdo** | Movimiento y strafe |
| **Stick Derecho** | Apuntado de precisión con fricción asistida |
| **Gatillo Derecho (RT)** | Disparo continuo con vibración háptica |
| **Gatillo Izquierdo (LT)** | Zoom táctico óptico |
| **Botón A** | Salto |
| **Botón B / LB** | Dash con propulsor |
| **Botón X** | Recargar |
| **Botón Y** | Alternar modos ópticos PTZ |
| **Right Bumper (RB)** | **Pulso EMP** |
| **D-Pad Abajo** | **Sobrecarga Frenesí** |
| **D-Pad Izq. / Der.** | **Ciclar entre las 5 armas** |
| **Start** | Menú de pausa |

---

## 🔊 Audio, Síntesis y Voz Táctica

- **Motor Web Audio Procedural:** Síntesis sonora para pulsos electromagnéticos de baja frecuencia, estallidos de sobrecarga frenesí, lanzamiento de micro-misiles y fractura de contenedores.
- **Banda Sonora Multicapa CC0:** 14 temas musicales adaptativos que transicionan suavemente según tensión de combate, jefes y biomas.
- **Voz Sintetizada de Cabina (SpeechSynthesis):** Confirmación vocal en español neutro para estados tácticos (`"Pulso electromagnético cargado"`, `"Titán hostil detectado"`, `"Modo frenesí disponible"`).

---

## ⚡ Optimización WebGL y Rendimiento

1. **Gestión de Memoria y Zero-GC:** Reutilización de vectores temporales (`THREE.Vector3`, `THREE.Ray`) y pooling de proyectiles e impactos.
2. **Carga y Clonación de Modelos:** Los archivos GLB se descargan una sola vez a través de `useGLTF.preload` y se clonan mediante `clone(true)` preservando geometrías compartidas en GPU.
3. **Calibrador "⚡ ACOMODAR A MI PC":** Evalúa el hardware del cliente (`WEBGL_debug_renderer_info`) para fijar la tasa de sombra, resolución y densidad de partículas adecuada para gráficos integrados (Intel HD, Iris, Vega).

---

## 📂 Estructura del Proyecto

```text
public/
  assets/
    models/
      ships/          player_ship.glb, fighter_interceptor.glb
      enemies/        drone_gunner.glb, drone_scout.glb, robot_walker.glb, heavy_cyborg.glb
      bosses/         boss_mecha_titan.glb, boss_behemoth.glb
      weapons/        rifle_plasma.glb, launcher_heavy.glb, sniper_railgun.glb
      environments/   hangar_wall.glb, hangar_column.glb, hangar_door.glb, hangar_stairs.glb
      props/          scifi_crate.glb, scifi_capsule.glb, power_generator.glb, turret_defense.glb
      pickups/        lootbox.glb, pickup_shield.glb, pickup_core.glb
      ATTRIBUTION.md  Inventario completo de licencias CC0 de modelos 3D
  audio/              Música y efectos de audio
src/
  components/
    HUD/              ArmoryModal, ShipTurntable, AmmoHUD, TouchControls, MainMenu...
    Scene3D/          Environment, Targets, EnemyVisuals, AllyDrones, Projectiles, WeaponViewmodel...
  game/               gameState, modelLoader, armory, pilotStats, AudioSystem, tacticalVoice...
  hooks/              useGamepad, useKeyboard, useScreenLayout...
  types/              game.ts (definiciones TypeScript)
tests/
  e2e/                Suites de pruebas Playwright Core
```

---

## 🛠️ Requisitos e Instalación Local

- **Node.js:** Versión `20.19+` o `22.12+` recomendada.
- **Gestor de paquetes:** `npm` v10+.

```bash
# 1. Clonar el repositorio
git clone https://github.com/Sttive17/Galactic-PTZ-Shooter.git
cd Galactic-PTZ-Shooter

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor de desarrollo
npm run dev
```

---

## 🧪 Comandos y Verificación

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo Vite con Hot Module Replacement. |
| `npm run build` | Compila TypeScript (`tsc -b`) y empaqueta la versión optimizada de producción. |
| `npm run preview` | Sirve localmente los archivos compilados en `dist/`. |
| `npm run lint` | Ejecuta el análisis estático de código mediante Oxlint. |
| `npm run test:e2e` | Ejecuta las pruebas E2E con Playwright Core. |
| `npm run test:e2e -- --tier smoke` | Ejecuta la suite de verificación básica (Arranque, WebGL, WebAudio). |

---

## 📜 Catálogo de Modelos 3D y Licencias

Todos los modelos tridimensionales integrados en el videojuego están publicados bajo licencias permisivas abiertas compatibles con distribución comercial y no comercial:
- **Modelos Quaternius (CC0 1.0 Universal - Dominio Público):** Naves espaciales, droides militares, robots mecha, arsenal, estructuras de hangar, torretas y generadores.
- **Modelos Kenney (CC0 1.0 Universal - Dominio Público):** Vehículos utilitarios, cristales y asteroides.
- Consulta el registro detallado en [public/assets/models/ATTRIBUTION.md](public/assets/models/ATTRIBUTION.md) y [public/audio/ATTRIBUTION.md](public/audio/ATTRIBUTION.md).

---

## 🗺️ Hoja de Ruta (Roadmap)

- [x] **Fase 1:** Auditoría técnica integral del proyecto.
- [x] **Fase 2:** Integración de catálogo de 22 modelos 3D reales en formato GLB.
- [x] **Fase 3:** Expansión del arsenal a 5 armas y habilidades activas (EMP y Overdrive).
- [x] **Fase 4:** Hangar 3D interactivo en tiempo real y estadísticas persistentes del piloto.
- [x] **Fase 5:** Biomas de hangar con elementos arquitectónicos y cajas destruibles.
- [x] **Fase 6:** Drones compañeros aliados con modelos 3D y escolta automatizada.
- [x] **Fase 7:** Modernización de HUD, badges de recarga, controles táctiles y gamepad.
- [x] **Fase 8:** Audio procedimental Web Audio y sistema de síntesis de voz táctica.
- [x] **Fase 9:** Optimización WebGL, pooling de proyectiles e instanciación.
- [x] **Fase 10:** Verificación continua de compilación TypeScript y pruebas Playwright.
- [x] **Fase 11:** Actualización completa y exhaustiva de documentación.
- [ ] **Fase 12:** Modo multijugador cooperativo orbital (en desarrollo futuro).

---

**Desarrollado con dedicación para ofrecer la mejor experiencia espacial 3D en el navegador.**
