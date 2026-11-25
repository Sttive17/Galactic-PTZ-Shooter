# 🌌 Galactic PTZ Shooter — Mega Actualización y Evolución 3D

**Galactic PTZ Shooter** es un videojuego shooter espacial 3D táctico en primera persona (FPS) con simulación de cámara **PTZ (*Pan-Tilt-Zoom*)**, desarrollado con **React 19**, **TypeScript**, **Three.js**, **React Three Fiber** y **Zustand**.

El jugador toma el control del sistema de artillería y puntería giroscópica **PTZ** acoplado al caza interceptor **Vanguard MK-IV**, defendiendo instalaciones subterráneas, valles planetarios, plataformas de lanzamiento espacial, estaciones orbitales estratosféricas y sectores del espacio profundo frente a la invasión mecanizada del **Enjambre Omega**.

[![CI](https://github.com/Sttive17/Galactic-PTZ-Shooter/actions/workflows/ci.yml/badge.svg)](https://github.com/Sttive17/Galactic-PTZ-Shooter/actions/workflows/ci.yml)

---

## 🎮 Jugar Ahora

- **Versión Oficial en Línea (GitHub Pages):** [https://sttive17.github.io/Galactic-PTZ-Shooter/](https://sttive17.github.io/Galactic-PTZ-Shooter/)
- **Repositorio Oficial:** [https://github.com/Sttive17/Galactic-PTZ-Shooter](https://github.com/Sttive17/Galactic-PTZ-Shooter)
- **Compatibilidad de Navegadores:** Google Chrome, Microsoft Edge, Mozilla Firefox, Brave y Safari con aceleración **WebGL 2.0**.
- **Plataformas Soportadas:**
  - 💻 **PC / Escritorio:** Teclado y Ratón con bloqueo de puntero (*Pointer Lock 360°*).
  - 🎮 **Consola / Mando:** Soporte nativo para **Mando de Xbox** (Gamepad API) con asistencia magnética de apuntado y vibración háptica dual.
  - 📱 **Móviles y Tablets:** Interfaz táctil multi-touch adaptable con doble joystick virtual y botones dedicados de combate y habilidades.

---

## 📑 Tabla de Contenidos

1. [Contexto Narrativo y Universo del Juego](#-1-contexto-narrativo-y-universo-del-juego)
2. [Mecánica Central: El Sistema Táctico PTZ](#-2-mecánica-central-el-sistema-táctico-ptz)
3. [Modos de Juego](#-3-modos-de-juego)
4. [Campaña Completa: Los 5 Capítulos y 22 Sectores (Niveles 1–50)](#-4-campaña-completa-los-5-capítulos-y-22-sectores-niveles-150)
5. [Arsenal Táctico en Primera Persona (5 Armas 3D)](#-5-arsenal-táctico-en-primera-persona-5-armas-3d)
6. [Habilidades Activas de Combate (EMP y Frenesí)](#-6-habilidades-activas-de-combate-emp-y-frenesí)
7. [Catálogo Completo de los 19 Poderes Tácticos (Roguelite)](#-7-catálogo-completo-de-los-19-poderes-tácticos-roguelite)
8. [Bestiario Hostil: Los 11 Arquetipos de Enemigos 3D](#-8-bestiario-hostil-los-11-arquetipos-de-enemigos-3d)
9. [Titanes y Jefes Colosales (8 Jefes de Campaña y Oleadas)](#-9-titanes-y-jefes-colosales-8-jefes-de-campaña-y-oleadas)
10. [Escuadrón de Drones Aliados de Escolta](#-10-escuadrón-de-drones-aliados-de-escolta)
11. [Entorno Interactivo, Física de Arena y Objetos Destructibles](#-11-entorno-interactivo-física-de-arena-y-objetos-destructibles)
12. [Hangar Central 3D, Economía de Nanitas y Armería](#-12-hangar-central-3d-economía-de-nanitas-y-armería)
13. [Hoja de Servicio Militar y Estadísticas Persistentes del Piloto](#-13-hoja-de-servicio-militar-y-estadísticas-persistentes-del-piloto)
14. [Interfaz Táctica (HUD), Radar y Pantallas](#-14-interfaz-táctica-hud-radar-y-pantallas)
15. [Controles Completos (Teclado/Ratón, Mando Xbox y Táctil)](#-15-controles-completos-tecladoratón-mando-xbox-y-táctil)
16. [Motor de Audio Procedural, Banda Sonora y Voz Táctica](#-16-motor-de-audio-procedural-banda-sonora-y-voz-táctica)
17. [Arquitectura Técnica y Optimización WebGL](#-17-arquitectura-técnica-y-optimización-webgl)
18. [Inventario Completo de Modelos 3D y Licencias CC0](#-18-inventario-completo-de-modelos-3d-y-licencias-cc0)
19. [Estructura del Proyecto](#-19-estructura-del-proyecto)
20. [Requisitos, Instalación y Ejecución Local](#-20-requisitos-instalación-y-ejecución-local)
21. [Pruebas Automatizadas E2E (Playwright Core)](#-21-pruebas-automatizadas-e2e-playwright-core)
22. [Hoja de Ruta (Roadmap)](#-22-hoja-de-ruta-roadmap)

---

## 📖 1. Contexto Narrativo y Universo del Juego

Año **2389**. La red de defensa automatizada de la **Federación Galáctica** ha sido corrompida por una inteligencia sintética conocida como el **Núcleo Omega**. Cientos de drones de asalto, caminantes bípedos de precisión, unidades cyborg acorazadas y titanes mecanizados han tomado el control de los complejos estratégicos de la humanidad, desde los laboratorios subterráneos de investigación hasta las plataformas de lanzamiento orbital y las estaciones del espacio profundo.

Como piloto de élite de la división **PTZ Vanguard**, eres desplegado a bordo del sistema de combate **Vanguard MK-IV**. Tu misión comienza en las cámaras de contención del **Búnker Subterráneo B-01** (Nivel 1) y asciende progresivamente hacia la superficie terrestre, las plataformas de despegue de cohetes, la estratosfera orbital y finalmente el corazón del espacio profundo (Nivel 50), donde aguarda el **Núcleo Omega**.

Cada victoria te permite recolectar **Nanitas Cuánticas**, mejorar permanentemente los sistemas de tu nave en el **Hangar Central 3D**, desbloquear armamento pesado y acoplar **19 módulos de poder táctico** para sobrevivir a oleadas cada vez más letales.

---

## 🔭 2. Mecánica Central: El Sistema Táctico PTZ

El nombre **PTZ (*Pan-Tilt-Zoom*)** proviene de los sistemas ópticos militares e industriales de cámara motorizada, combinados con la movilidad de un shooter en primera persona de alta velocidad:

- **PAN (Acimut Horizontal 360°):** Rotación horizontal continua de 360 grados con lectura telemétrica en grados (`AZIMUTH: -180.0° a +180.0°`) mostrada en tiempo real en el HUD.
- **TILT (Elevación Vertical):** Inclinación vertical precisa (`ELEV: -85.0° a +85.0°`) para abatir tanto drones rasantes como francotiradores apostados en plataformas elevadas o jefes colosales en vuelo.
- **ZOOM (Magnificación Óptica Variable):** Lente telescópica motorizada (`MAG: 1.0X a 2.5X+`) que estrecha el campo de visión (FOV) dinámicamente y ajusta la sensibilidad de puntería para disparos quirúrgicos a larga distancia.
- **3 Modos Ópticos de Visión (`[Tecla V]` / `[Botón Y]`):**
  1. **ÓPTICA ESTÁNDAR:** Visión natural de alto contraste con iluminación PBR real.
  2. **VISIÓN TÉRMICA (FLIR / Infrarroja):** Resalta firmas de calor hostiles y núcleos de energía en ambientes con niebla densa o tormentas de polvo.
  3. **VISIÓN NOCTURNA (NVG):** Amplificación lumínica verde fósforo ideal para sectores oscuros del vacío espacial.
- **Movilidad Exotraje:** Desplazamiento omnidireccional, sprint táctico, salto gravitacional, doble salto aéreo (con propulsores), plataformas de salto (*Jump Pads*) y **Propulsor Dash (`[C]`)** para esquivar ráfagas enemigas.

---

## 🕹️ 3. Modos de Juego

Desde el Menú Principal puedes elegir entre **3 modos de juego** diseñados para distintos estilos de partida:

### 1. 🏆 Modo Campaña (`CHALLENGE` — 50 Niveles Estructurados)
- Progresión narrativa y táctica a lo largo de **50 niveles divididos en 5 capítulos** (10 niveles por capítulo).
- Antes de iniciar o al avanzar de ronda, el jugador selecciona **1 de 3 Cartas de Poder Táctico** para construir su configuración (*build*).
- **Encuentros de Jefe cada 5 niveles** (Niveles 5, 10, 15, 20, 25, 30, 35, 40, 45 y el Jefe Final en el Nivel 50).
- Guardado automático del nivel máximo desbloqueado y selector de niveles para rejugar cualquier sector superado.

### 2. 🔥 Modo Oleadas / Entrenamiento Táctico (`TRAINING` — Supervivencia Infinita)
- Combate ininterrumpido por oleadas de dificultad exponencial.
- Mayor densidad de enemigos móviles desde la Oleada 1, aparición temprana de escuadrones de élite y **Jefes Titanes cada 3 oleadas** (Oleadas 3, 6, 9, 12...).
- Ideal para batir récords de puntuación, probar sinergias extremas de poderes y farmear nanitas a gran velocidad.

### 3. 🎯 Modo Práctica Libre (`FREE_PLAY` — Simulador de Calibración)
- Arena abierta de entrenamiento sin límite de tiempo ni penalización.
- Permite familiarizarse con la cámara PTZ, probar el retroceso y alcance de las 5 armas, ajustar la sensibilidad del ratón o mando Xbox y practicar saltos en plataformas.

---

## 🌍 4. Campaña Completa: Los 5 Capítulos y 22 Sectores (Niveles 1–50)

Cada capítulo cambia radicalmente la arquitectura 3D, la iluminación ambiental, los materiales PBR del suelo, el cielo y los efectos climáticos de partículas:

| Capítulo | Niveles | Entorno Principal | Sub-Sectores / Biomas | Elementos Arquitectónicos 3D y Clima |
|---|---|---|---|---|
| **Cap. 1: Laboratorio y Hangar Subterráneo** | **1 – 10** | `UNDERGROUND_LAB` (`ENCLOSED_BUNKER`) | • *Laboratorio Crio-Búnker B-01*<br>• *Ala de Pruebas Balísticas R-4*<br>• *Núcleo Bio-Químico G-9* | Hangar 3D modular con muros blindados (`hangar_wall.glb`), puertas de impacto (`hangar_door.glb`), columnas gantry (`hangar_column.glb`), torretas defensivas (`turret_defense.glb`), generadores de plasma (`power_generator.glb`), tubos criogénicos, racks de servidores y respiraderos de vapor. |
| **Cap. 2: Valle Terrestre en Superficie** | **11 – 20** | `EARTH_OPEN_FIELD` (`EARTH_DAY`) | • *Pradera Terrestre del Alba*<br>• *Valle Verde Central*<br>• *Colinas del Ocaso Terrestre* | Cielo diurno y atardecer planetario, cordilleras montañosas, bosques 3D (`tree_pine.glb`, `tree_oak.glb`, `tree_palm.glb`), formaciones rocosas (`rock_tall.glb`), arbustos, vehículos `rover.glb` y nubes volumétricas en movimiento. |
| **Cap. 3: Zona de Lanzamiento Espacial** | **21 – 30** | `ROCKET_LAUNCH_ZONE` (`LAUNCH_DUSK`) | • *Plataforma de Lanzamiento Apolo*<br>• *Torre Criogénica de Despegue*<br>• *Zona de Ignición Nocturna* | Cosmódromo al crepúsculo con cohetes multietapa 3D (`rocket_base.glb`, `rocket_fuel.glb`, `rocket_fins.glb`, `rocket_top.glb`), hangares (`hangar.glb`), reflectores antiaéreos móviles y ceniza de ignición. |
| **Cap. 4: Estratosfera y Estación Orbital** | **31 – 40** | `ORBITAL_STRATOSPHERE` (`ORBITAL_HORIZON`) | • *Mirador Estratosférico Zenit*<br>• *Anillo Solar Exosférico*<br>• *Muelle Ionosférico Aurora* | Vista del horizonte curvado de la Tierra desde la órbita baja, paneles solares gigantes, antenas parabólicas (`satellite_large.glb`), terminales (`computer_terminal.glb`), mesas holográficas (`hologram_table.glb`) y drones cargueros orbitales. |
| **Cap. 5: Arena Galáctica del Espacio Profundo** | **41 – 50** | `GALACTIC_ARENA` (`DEEP_SPACE`) | • *Hangar Ciber-Táctico*<br>• *Base Marciana Alfa*<br>• *Sector Criogénico 09*<br>• *Núcleo Reactor Omega*<br>• *Nebulosa del Vacío*<br>• *Forja Solar Helios*<br>• *Bioma Esmeralda X-7*<br>• *Ciudadela Cuántica*<br>• *Caldera Magma Vulcano*<br>• *Santuario Astral Zenit* | Cúpula geodésica en el espacio profundo con nebulosas, asteroides (`meteor.glb`), cúmulos de cristal (`crystal_large.glb`, `crystal_cluster.glb`), monolitos gravitacionales, reactores de plasma y el templo final del **Núcleo Omega**. |

### Sistemas Climáticos Dinámicos
Cada sector activa un sistema de partículas ambientales específico:
- `DATA_MOTES`: Motas de datos holográficos flotantes.
- `PLASMA_SPARKS`: Chispas de descarga eléctrica y plasma.
- `BIO_SPORES`: Esporas bioluminiscentes en suspensión.
- `DUST_STORM`: Tormenta de polvo férrico marciano.
- `SOLAR_ASH`: Ceniza incandescente de fusión solar.
- `SNOW_CRYSTALS`: Cristales de nieve criogénica.
- `STAR_EMBERS`: Brasas estelares e iones cósmicos.

---

## 💥 5. Arsenal Táctico en Primera Persona (5 Armas 3D)

El arma equipada se renderiza en primera persona mediante **modelos 3D GLB reales** en [WeaponViewmodel.tsx](src/components/Scene3D/WeaponViewmodel.tsx) con animaciones de cambio de arma (bajada y subida suave), retroceso (*kickback*), inclinación de recarga, fogonazo dinámico (`PointLight`) y acentos holográficos según los poderes activos.

Puedes cambiar de arma en cualquier momento con las teclas **`[1]` a `[5]`**, la **rueda del ratón**, la **cruceta izquierda/derecha del mando Xbox** o tocando el selector en pantalla:

| # | Arma | Modelo 3D Viewmodel | Cadencia | Daño Base | Cargador | Comportamiento Balístico y Rol Táctico |
|---|---|---|---|---|---|---|
| **`[1]`** | **Rifle de Plasma** (*Plasma Rifle*) | `rifle_plasma.glb` | Alta (90 ms) | 12 | 50 (hasta 200 con mejoras) | Arma principal versátil de fuego automático continuo, alta velocidad de proyectil y precisión estable a media y larga distancia. |
| **`[2]`** | **Escopeta Flak** (*Scatter Shotgun*) | `launcher_heavy.glb` | Media (450 ms) | 30 (6x5 perdigones) | 8 cartuchos | Dispara un abanico de 6 proyectiles térmicos por cartucho. Devastadora a corta distancia contra enjambres (`SWARMER`), `KAMIKAZE` y drones veloces. |
| **`[3]`** | **Railgun Pesado** (*Heavy Railgun*) | `sniper_railgun.glb` | Pausada (900 ms) | 80 | 5 cargas | Cañón electromagnético hiperveloz de impacto casi instantáneo y penetración natural. Ideal para abatir `SNIPER`, `JUGGERNAUT` y puntos débiles de Jefes. |
| **`[4]`** | **Micro-Misiles** (*Micro-Missiles*) | `launcher_heavy.glb` | Rápida (180 ms) | 24 + onda explosiva | 20 cohetes | Lanza proyectiles autopropulsados con daño en área al impactar, capaces de dañar grupos de enemigos y fracturar cajas de suministros cercanas. |
| **`[5]`** | **Rayo Criogénico** (*Cryo Beam*) | `sniper_railgun.glb` | Continua (60 ms) | Flujo continuo | Batería térmica | Emite un haz sub-cero de alta frecuencia que inflige daño sostenido y congela los servomotores enemigos, reduciendo drásticamente su velocidad de evasión. |

---

## ⚡ 6. Habilidades Activas de Combate (EMP y Frenesí)

Además del arsenal principal, el traje/nave cuenta con **2 habilidades activas** con indicadores de estado en el HUD y botones dedicados en dispositivos táctiles:

### 1. 🌐 Pulso Electromagnético (EMP Blast)
- **Activación:** Tecla **`[F]`** | Mando Xbox **`[RB]`** | Táctil **`[Botón EMP]`**
- **Efecto:** Libera una onda expansiva electromagnética esférica de **24 metros de radio** centrada en el jugador.
  - Desintegra instantáneamente todos los proyectiles y misiles enemigos en vuelo dentro del radio.
  - Inflige daño directo de sobrecarga a todos los drones y generadores cercanos y los aturde temporalmente.
- **Tiempo de Reutilización (Cooldown):** 15 segundos.

### 2. 🔥 Sobrecarga Frenesí (Overdrive)
- **Activación:** Tecla **`[Q]`** | Mando Xbox **`[D-Pad Abajo]`** | Táctil **`[Botón FRENESÍ]`**
- **Efecto:** Conecta el reactor principal directamente al sistema de armas durante **6 segundos**:
  - **Duplica la cadencia de disparo** de cualquiera de las 5 armas equipadas.
  - Otorga **munición infinita sin consumo de cargador ni necesidad de recargar** mientras dura el efecto.
  - Despliega un halo holográfico rotatorio en el cañón del arma y retroalimentación sonora de alta energía.
- **Tiempo de Reutilización (Cooldown):** 25 segundos.

---

## 🃏 7. Catálogo Completo de los 19 Poderes Tácticos (Roguelite)

Al inicio de la partida y al superar cada ronda, se despliega el **Selector de Poderes (`ELIGE 1 DE 3 PODERES`)**. Los poderes se dividen en tres niveles de rareza (**`TÁCTICO`**, **`ÉPICO`** y **`PROTOTIPO`**) y se acumulan (*stacking*) hasta su nivel máximo:

| Poder | Nombre en Juego | Rareza | Máx. Stacks | Efecto Detallado por Nivel |
|---|---|---|---|---|
| `RAPID_FIRE` | **Cadencia Turbo** | TÁCTICO | 5 | `+30%` de velocidad de disparo por nivel acumulado. |
| `TRIPLE_SHOT` | **Disparo Triple** | PROTOTIPO | 4 | Divide cada disparo en `3` rayos en abanico (`+2` proyectiles adicionales por nivel extra). |
| `EMP_BLAST` | **Explosión EMP** | PROTOTIPO | 4 | Cada dron destruido detona en una onda EMP de `10m` (`+4m` por nivel) que daña enemigos adyacentes. |
| `BIG_HITBOX` | **Plasma Expansivo** | TÁCTICO | 4 | `+60%` de tamaño y radio de impacto de tus proyectiles para acertar con mayor facilidad. |
| `RAILGUN_SPEED` | **Cañón de Riel** | TÁCTICO | 4 | `+45%` de velocidad de vuelo en todos los proyectiles disparados. |
| `SLOW_MO_DRONES` | **Campo Criogénico** | ÉPICO | 3 | Ralentiza permanentemente a todos los drones hostiles un `-25%` por nivel (hasta `-65%`). |
| `SCORE_BOOST` | **Núcleo Cuántico** | ÉPICO | 5 | `+50%` de puntos adicionales en cada impacto y baja confirmada. |
| `TIME_SURGE` | **Sobrecarga Temporal** | TÁCTICO | 4 | Otorga `+25s` inmediatos al reloj de misión y `+10s` extra en todas las rondas futuras. |
| `HEAVY_DAMAGE` | **Cañón de Antimateria** | PROTOTIPO | 5 | `+1` de daño base directo por proyectil (multiplica la letalidad contra blindados y jefes). |
| `PIERCING_SHOT` | **Balas Perforantes** | PROTOTIPO | 4 | Los disparos atraviesan `+1` enemigo adicional en línea recta por cada nivel. |
| `VAMPIRIC_SHIELD` | **Drenaje de Escudo** | ÉPICO | 4 | Restaura automáticamente `+6` puntos de Escudo/Salud por cada enemigo abatido (`+6` por nivel). |
| `TITAN_ARMOR` | **Blindaje Titán** | TÁCTICO | 4 | Aumenta `+35` el Escudo máximo, cura al instante y reduce un `-15%` el daño recibido. |
| `JET_BOOTS` | **Propulsores de Salto** | TÁCTICO | 3 | `+25%` de altura de salto y otorga `+1` salto aéreo adicional en pleno vuelo por nivel. |
| `TURBO_SPRINT` | **Exo-Piernas Turbo** | TÁCTICO | 4 | `+18%` de velocidad de movimiento, `-25%` de consumo de energía de sprint y `+35%` de recarga. |
| `CRITICAL_OPTICS` | **Óptica Crítica** | ÉPICO | 4 | `+25%` de probabilidad de impacto crítico con multiplicador de **`2.5x` de daño**. |
| `RICOCHET_ROUNDS` | **Munición Rebote** | ÉPICO | 4 | Los proyectiles rebotan en muros, suelos y cajas `+1` vez por nivel manteniendo su energía. |
| `ALLY_DRONE` | **Escuadrón de Drones** | PROTOTIPO | 5 | Despliega drones aliados autónomos: Nv1–2 (`1 dron`), Nv3–4 (`2 drones`), Nv5 (`3 drones de élite`). |
| `EXTENDED_MAG` | **Cargador Extendido** | TÁCTICO | 3 | Amplía el cargador base (`50 → 80 → 120 → 200` proyectiles) y acelera la velocidad de recarga. |
| `SMART_AUTOLOCK` | **Sistema Smart-Lock** | PROTOTIPO | 3 | IA balística que fija automáticamente al enemigo más cercano al retículo y dispara de forma autónoma (Nv3 garantiza críticos a núcleos). |

---

## 👾 8. Bestiario Hostil: Los 11 Arquetipos de Enemigos 3D

Los enemigos utilizan modelos 3D GLB a escala real (`1.6x – 2.2x`, ~2.3 metros de envergadura), vuelo estacionario a nivel de mira (`y >= 3.0m`), física de rebote contra obstáculos para no atravesar muros y algoritmos de **disparo predictivo (*lead aim*)** que calculan la trayectoria futura del jugador:

| Arquetipo | Modelo 3D | Salud Base | Comportamiento de IA y Patrón de Ataque |
|---|---|---|---|
| **1. `SCOUT`** | `drone_scout.glb` | Estándar | Dron estilizado de reconocimiento con ojo central luminoso. Patrulla el espacio aéreo a velocidad media; ideal para encadenar combos iniciales. |
| **2. `STRIKER`** | `drone_gunner.glb` | Estándar | Dron artillado ofensivo que abre fuego con proyectiles de plasma dirigidos a la posición futura del jugador. |
| **3. `FLANKER`** | `fighter_interceptor.glb` | Media (1–2) | Caza interceptor de alta velocidad que orbita al jugador a 28 metros realizando maniobras evasivas laterales (*strafe*) y ráfagas dobles. |
| **4. `SNIPER`** | `robot_walker.glb` | Media (1–2) | Unidad mecanizada de precisión que se posiciona a gran altitud (`12m – 18m`) y dispara proyectiles de alta velocidad y alto daño. |
| **5. `TACTICIAN`** | `drone_gunner.glb` | Alta (2–6 Blindado) | Comandante de escuadrón blindado que coordina el flanqueo orbital y dispara abanicos tácticos de 3 proyectiles. |
| **6. `SWARMER`** | `drone_scout.glb` | Ligera (1–2) | Unidad compacta e hiperveloz que ataca en grupos sincronizados cambiando de dirección bruscamente. |
| **7. `ARTILLERY`** | `heavy_cyborg.glb` | Media-Alta | Unidad de soporte pesado en altura que lanza salvas parabólicas y cortinas de fuego supresor. |
| **8. `PHANTOM_SNIPER`** | `robot_walker.glb` | Media (1–2) | Francotirador de élite equipado con motor de salto cuántico; se teletransporta de posición tras efectuar sus disparos. |
| **9. `JUGGERNAUT`** | `heavy_cyborg.glb` | Muy Alta (4–8 Blindado) | Coloso cyborg pesadamente acorazado. Avanza implacablemente resistiendo fuego ligero y desatando descargas múltiples de plasma. |
| **10. `KAMIKAZE`** | `drone_scout.glb` | Ligera | Dron sobrecargado con núcleo inestable. No dispara a distancia: acelera directamente hacia las coordenadas del jugador para detonar por contacto. |
| **11. `HEALER`** | `drone_scout.glb` | Media (2+) | Unidad de soporte bio-mecánico con halo esmeralda. Prioriza mantenerse cerca de otros enemigos para restaurar sus puntos de salud. |

> **Sistema de Evasión Reactiva y Línea de Visión (LOS):** Cuando un dron recibe daño, puede ejecutar un impulso lateral evasivo (*dodge*). Si un obstáculo bloquea su línea de tiro hacia el jugador, la IA calcula una maniobra de asomo (*peek boost*) invirtiendo su dirección orbital.

---

## 👹 9. Titanes y Jefes Colosales (8 Jefes de Campaña y Oleadas)

Cada 5 niveles en el Modo Campaña (y cada 3 oleadas en Entrenamiento), suena la sirena de alerta máxima, se presenta la cinemática de introducción del jefe y aparece un **Titán Colosal (~8.5 metros de envergadura)** con barra de salud dedicada en la parte superior del HUD:

| Tier | Nivel Campaña | Nombre del Jefe | Subtítulo Táctico | Modelo 3D Principal | Escoltas | Generadores Orbitales | Mecánicas Especiales y Fases |
|---|---|---|---|---|---|---|---|
| **Tier 1** | **Nivel 5** | **CENTINELA ALFA** | *Interceptor Rápido · Ráfagas de Plasma* | `boss_mecha_titan.glb` | 2 `SCOUT` | 0 | Patrulla rápida en figura de ocho disparando ráfagas dirigidas de plasma. |
| **Tier 2** | **Nivel 10** | **TITÁN AEGIS** | *Escudo Invulnerable · 3 Generadores* | `boss_behemoth.glb` | 0 | **3 Generadores** | Protegido por un escudo de fuerza invulnerable. El jugador debe destruir primero los **3 Generadores Orbitales (`power_generator.glb`)** para exponer su núcleo. |
| **Tier 3** | **Nivel 15** | **LEVIATÁN TORMENTA** | *Tormenta de Balas · Ráfagas y Abanico* | `boss_mecha_titan.glb` | 3 `SCOUT` | 0 | Combina abanicos de proyectiles con cortinas circulares de plasma a alta cadencia. |
| **Tier 4** | **Nivel 20** | **ESPECTRO FASE** | *Teletransporte 360° · Francotirador Élite* | `robot_walker.glb` | 3 `FLANKER` | 0 | Ejecuta saltos cuánticos (*Phantom Blink*) cada pocos segundos apareciendo en ángulos de 360° alrededor del jugador. |
| **Tier 5** | **Nivel 25** | **ACORAZADO ARTILLERO** | *Artillería Pesada · Oleadas y Salvas Predictivas* | `heavy_cyborg.glb` | 3 `SWARMER` | 0 | Fortaleza artillera que bombardea la arena con salvas predictivas de alto impacto. |
| **Tier 6** | **Nivel 30** | **HIDRA FASE-ESCUDO** | *Híbrido · 3 Generadores + Teletransporte* | `boss_behemoth.glb` | 0 | **3 Generadores** | Combina escudo invulnerable alimentado por 3 generadores con teletransporte táctico acelerado al romperse el escudo. |
| **Tier 7** | **Niveles 35 / 40 / 45** | **VÓRTICE ESTELAR** | *Híbrido · Espiral Rotatoria + Artillería* | `boss_mecha_titan.glb` | 3 Mixtos | 0 | Desata espirales rotatorias continuas de proyectiles de 360° combinadas con salvas de artillería. |
| **Tier 8** | **Nivel 50 (Final)** | **NÚCLEO OMEGA** | *Híbrido Omega · 4 Generadores + Tormenta + Teletransporte* | `boss_mecha_titan.glb` | Escuadrones Élite | **4 Generadores** | **Jefe Final del Juego (280+ HP).** Requiere destruir 4 generadores orbitales mientras esquivas espirales de plasma; al caer su escudo entra en fase de teletransporte cuántico y tormenta total. |

---

## 🛸 10. Escuadrón de Drones Aliados de Escolta

Al adquirir la carta de poder **`ESCUADRÓN DE DRONES` (`ALLY_DRONE`)**, el jugador despliega unidades autónomas de apoyo renderizadas en 3D ([AllyDrones.tsx](src/components/Scene3D/AllyDrones.tsx)):

- **Modelo 3D:** `drone_scout.glb` con halo de energía esmeralda/cian, propulsores gemelos y antena de radar giratoria.
- **Escalado por Nivel de Poder:**
  - **Nivel 1–2:** 1 Dron Aliado en órbita protectora.
  - **Nivel 3–4:** 2 Drones Aliados flanqueando a izquierda y derecha.
  - **Nivel 5 (Máximo):** 3 Drones Aliados con cadencia sobrecargada y daño incrementado.
- **Comportamiento Autónomo:**
  - Orbitan suavemente alrededor de las coordenadas actuales del jugador.
  - Escanean el campo de batalla priorizando enemigos activos y abren fuego automático con trazadoras láser verdes/cian, contribuyendo directamente al daño, bajas y combos del jugador.

---

## 📦 11. Entorno Interactivo, Física de Arena y Objetos Destructibles

Cada mapa generado por [mapGenerator.ts](src/game/mapGenerator.ts) y renderizado en [Environment.tsx](src/components/Scene3D/Environment.tsx) incluye elementos físicos e interactivos con colisión AABB/Box3 en tiempo real:

1. **Cajas de Suministros Destructibles (`scifi_crate.glb`):**
   - Distribuidas estratégicamente por la arena con un marcador holográfico flotante.
   - Al recibir disparos del jugador se fracturan con sonido metálico, partículas de escombros y liberan **botín instantáneo** (recarga de munición, nanitas cuánticas, reparación de escudo o salud).
2. **Plataformas Flotantes Antigravedad (`platform`):**
   - Losas tácticas elevadas con anillos propulsores inferiores a las que el jugador puede subir para ganar ventaja de altura sobre los enemigos.
3. **Plataformas de Impulso Gravitacional (`jumppad`):**
   - Anillos luminosos cian/esmeralda en el suelo que catapultan al jugador hacia las plataformas superiores al pisarlos.
4. **Muros de Cobertura y Torres de Radar (`wall` / `tower`):**
   - Estructuras sólidas con antenas parabólicas 3D (`satellite_dish.glb`) que bloquean tanto el movimiento como los proyectiles hostiles, permitiendo cubrirse del fuego de francotiradores y jefes.

---

## 🛠️ 12. Hangar Central 3D, Economía de Nanitas y Armería

Al destruir enemigos, jefes y cajas de suministros, el jugador recolecta **Nanitas Cuánticas** (moneda persistente del juego). Pulsando el botón **ARMERÍA** en el menú principal o la tecla **`[B]`** durante la partida, se abre el **Hangar Central 3D** ([ArmoryModal.tsx](src/components/HUD/ArmoryModal.tsx)):

### Mesa Giratoria 3D en Tiempo Real (`ShipTurntable.tsx`)
- Renderiza un lienzo WebGL dedicado con el modelo 3D de la nave **`Vanguard MK-IV` (`player_ship.glb`)** rotando en tiempo real con iluminación de estudio y plumas de propulsión iónica que cambian de color según el camuflaje equipado.

### 4 Mejoras Permanentes del Taller (`UPGRADE_CATALOG`)
Cada mejora tiene hasta **5 niveles permanentes** que se aplican a todas tus partidas:
1. 🛡️ **Blindaje de Escudo (`MAX_SHIELD`):** Incrementa la capacidad máxima del escudo deflector en **`+25` puntos por nivel** (hasta +125 extra).
2. ❤️ **Aleación de Casco (`MAX_HEALTH`):** Refuerza la estructura vital aumentando la salud máxima en **`+25` puntos por nivel** (hasta +125 extra).
3. 🧲 **Imán de Botín Cuántico (`LOOT_MAGNET`):** Amplía el radio de atracción automática de cajas y recompensas en **`+35%` por nivel**.
4. ⚡ **Propulsor Táctico (`DASH_COOLDOWN`):** Reduce el tiempo de enfriamiento del Dash (`[C]`) en **`-12%` por nivel**.

### 5 Camuflajes y Skins de Nave (`SKIN_CATALOG`)
- **Interceptor Estándar (`DEFAULT`):** Azul cian táctico de la Federación (Desbloqueado de serie).
- **Vanguardia Dorada (`GOLD_VANGUARD`):** Aleación de oro imperial reflectante con propulsores ámbar (250 Nanitas).
- **Sombra Furtiva (`STEALTH_SHADOW`):** Chasis negro carbono con trazadores violeta de baja firma (180 Nanitas).
- **Furia Carmesí (`INFERNO_RED`):** Revestimiento térmico rojo volcánico de asalto pesado (200 Nanitas).
- **Pulso Ciber-Neón (`CYBER_NEON`):** Estética sintética magenta y turquesa de alta visibilidad (220 Nanitas).

---

## 🎖️ 13. Hoja de Servicio Militar y Estadísticas Persistentes del Piloto

El módulo [pilotStats.ts](src/game/pilotStats.ts) almacena automáticamente en `localStorage` (`galactic_ptz_pilot_stats_v1`) toda la carrera militar del jugador, consultable en la pestaña **Hoja de Servicio / Estadísticas** del Hangar:

- **Escalafón de Rangos Militares (según bajas confirmadas):**
  1. 🥉 **Cadete Espacial** (0 – 49 bajas)
  2. 🥈 **Teniente de Vuelo** (50 – 199 bajas)
  3. 🥇 **Capitán Interceptor** (200 – 499 bajas)
  4. 🎖️ **Comandante de Escuadrón** (500 – 999 bajas)
  5. 🌟 **Mariscal Galáctico** (1,000+ bajas)
- **Métricas Registradas:**
  - Bajas hostiles totales (`totalKills`) y Titanes/Jefes abatidos (`bossesDefeated`).
  - Disparos totales efectuados (`shotsFired`), impactos confirmados (`shotsHit`) y **Porcentaje de Precisión Balística (`%`)**.
  - Récord histórico de puntuación (`highestScore`), ronda/nivel más alto alcanzado (`highestRound`) y racha máxima de combo (`longestStreak`).
  - Total de Nanitas recolectadas (`totalNanitesEarned`) y misiones jugadas (`gamesPlayed`).

---

## 🖥️ 14. Interfaz Táctica (HUD), Radar y Pantallas

La interfaz de usuario ha sido diseñada con estética sci-fi militar de alta legibilidad en cualquier resolución (desde móviles hasta monitores 4K):

- **Barra Superior Táctica:** Indicador de FPS en tiempo real, modo activo, nombre del sector/bioma, nivel actual, chips de poderes activos con contador de acumulaciones y acceso rápido a Ajustes y Audio.
- **Panel de Estado Superior Derecho:**
  - Contador de objetivos restantes en la ronda (`OBJ X/Y`), multiplicador de combo (`x1` a `x10+`), puntuación total, cronómetro de misión y precisión porcentual en vivo.
  - Barras dinámicas de **Escudo (`100+`)**, **Vida (`100+`)** y **Energía de Sprint (`100%`)**.
- **Radar / Minimapa Circular 360° (Inferior Izquierdo):**
  - Escáner táctico en tiempo real con cono de visión de la cámara PTZ, posición del jugador, drones hostiles (puntos rojos), jefes, generadores orbitales, cajas de suministros y drones aliados.
  - Indicador inferior de estado y enfriamiento del **Propulsor Dash `[C]`**.
- **Panel de Armamento y Munición (Inferior Derecho — `data-testid="ammo-hud"`):**
  - Nombre del arma 3D equipada (`RIFLE PLASMA [1]`, `ESCOPETA FLAK [2]`, `RAILGUN PESADO [3]`, `MICRO-MISILES [4]`, `RAYO CRIOGÉNICO [5]`).
  - Indicadores de estado (`LISTO` / cuenta regresiva) para **EMP `[F]`** y **FRENESÍ `[Q]`**.
  - Contador digital de munición (`50 / ∞`), barra de progreso de recarga y modo óptico activo (`ESTÁNDAR`, `TÉRMICO`, `NOCTURNO`).
- **Retículo Central PTZ y Telemetría:**
  - Cruz de puntería reactiva con confirmación de impacto (*Hitmarker*), alerta de recarga y lectura de `AZIMUTH`, `ELEV` y `MAG`.
- **Alertas de Combate y Pantallas:**
  - Indicadores direccionales rojos de daño recibido, alarma visual de jefe entrante (`BossIntroModal`), barra de blindaje/escudo del Titán (`BossHealthBar`), modal de selección de poderes (`PowerSelectModal`), menú de pausa y centro de configuración (`SettingsModal`).

---

## 🎮 15. Controles Completos (Teclado/Ratón, Mando Xbox y Táctil)

### ⌨️ Teclado y Ratón (PC)

| Acción | Tecla / Control |
|---|---|
| **Moverse / Strafe** | `W`, `A`, `S`, `D` o Flechas direccionales |
| **Apuntar Cámara PTZ 360°** | Movimiento del ratón (con Pointer Lock activo) |
| **Disparar Arma Actual** | `Clic Izquierdo` (sostenido para fuego continuo) |
| **Zoom Táctico PTZ** | `Clic Derecho` (sostenido) |
| **Saltar / Doble Salto** | `Barra Espaciadora` |
| **Sprint Táctico** | `Shift Izquierdo` (sostenido) |
| **Impulso Dash Evasivo** | `C` |
| **Cambiar de Arma (1 a 5)** | Teclas `1`, `2`, `3`, `4`, `5` o `Rueda del Ratón` |
| **Recargar Arma** | `R` |
| **Activar Pulso EMP** | `F` |
| **Activar Sobrecarga Frenesí** | `Q` |
| **Cambiar Modo Óptico (Normal/FLIR/NVG)** | `V` |
| **Abrir Hangar / Armería** | `B` |
| **Pausar Misión / Ajustes** | `Escape` o `P` |

### 🎮 Mando de Xbox / Gamepad (Estándar XInput)

| Acción | Botón del Mando |
|---|---|
| **Moverse / Desplazarse** | `Stick Analógico Izquierdo` |
| **Apuntar Cámara PTZ 360°** | `Stick Analógico Derecho` (con fricción magnética sobre objetivos) |
| **Disparar Arma** | `Gatillo Derecho (RT)` (con vibración háptica) |
| **Zoom Táctico PTZ** | `Gatillo Izquierdo (LT)` |
| **Saltar** | `Botón A` |
| **Dash Evasivo** | `Botón B` o `Left Bumper (LB)` |
| **Recargar Arma** | `Botón X` |
| **Alternar Modo Óptico PTZ** | `Botón Y` |
| **Activar Pulso EMP** | `Right Bumper (RB)` |
| **Activar Sobrecarga Frenesí** | `Cruceta Abajo (D-Pad Down)` |
| **Cambiar de Arma (Anterior / Siguiente)** | `Cruceta Izquierda / Derecha (D-Pad Left / Right)` |
| **Pausar Misión** | `Botón Start / Menu` |

### 📱 Controles Táctiles (Móviles y Tablets — `TouchControls.tsx`)

Se activan automáticamente al detectar pantalla táctil (o pueden forzarse desde Ajustes):
- **Joystick Virtual Izquierdo:** Desplazamiento fluido de 360°.
- **Zona Táctil / Joystick Derecho:** Giro libre de cámara PTZ y puntería.
- **Botones Táctiles de Acción Directa:** `FUEGO`, `ZOOM`, `SALTO`, `DASH`, `RECARGA`, `EMP`, `FRENESÍ`, selector de arma y botón de `PAUSA`.

---

## 🔊 16. Motor de Audio Procedural, Banda Sonora y Voz Táctica

El sistema sonoro ([AudioSystem.ts](src/game/AudioSystem.ts) y [tacticalVoice.ts](src/game/tacticalVoice.ts)) combina pistas musicales con síntesis en tiempo real:

1. **Síntesis Web Audio API sin latencia:**
   - Generación dinámica de sonidos para cada arquetipo de arma (plasma, cañón de riel, escopeta flak, lanzamiento de misiles, haz criogénico), impactos críticos, fractura de cajas metálicas, onda expansiva EMP, activación de Frenesí, alarmas de escudo bajo y sirenas de jefe.
2. **Banda Sonora Adaptativa Multicapa (14 pistas OGG CC0):**
   - Música ambiental diferenciada por capítulos (Laboratorio, Superficie Terrestre, Plataforma de Lanzamiento, Órbita y Espacio Profundo) y temas intensos de combate contra Jefes (`boss-battle.ogg`, `boss-theme.ogg`, `action-cyberpunk.ogg`).
3. **Voz Táctica de Cabina (`SpeechSynthesis`):**
   - Locución sintetizada en español que anuncia eventos críticos en combate: *"Titán hostil detectado"*, *"Pulso electromagnético activado"*, *"Sobrecarga frenesí en línea"*, *"Escudos al mínimo"*.
4. **Control Total de Mezcla:**
   - Sliders independientes de volumen General, Música y Efectos (SFX), además de botón de silenciamiento rápido (*Mute*) persistente.

---

## ⚙️ 17. Arquitectura Técnica y Optimización WebGL

El proyecto sigue una arquitectura desacoplada de alto rendimiento diseñada para mantener **60–144 FPS estables** incluso en equipos con gráficos integrados:

- **Separación de Estado React vs. Bucle 3D (`useFrame`):**
  - **Zustand ([gameState.ts](src/game/gameState.ts)):** Gestiona el estado de UI, rondas, puntuación, inventario de poderes, armería, configuración y persistencia en `localStorage`.
  - **Estado Mutativo de Escena ([sceneState.ts](src/game/sceneState.ts)):** Almacena posiciones a 60+ Hz (`playerPosition`, `muzzlePosition`, `targets`, `projectiles`, `colliders`, `weaponRecoil`) leídas directamente dentro de `useFrame` sin disparar re-renders de React.
- **Cargador y Caché de Modelos 3D ([modelLoader.ts](src/game/modelLoader.ts)):**
  - Precarga asíncrona mediante `GLTFLoader`, caché en memoria de escenas originales y clonación rápida (`scene.clone(true)`) que reutiliza geometrías y texturas en la GPU.
- **Optimización Zero-GC (Cero Basura en Memoria):**
  - Vectores y matrices preasignados a nivel de módulo (`_tempVec`, `_leadPos`, ` Box3`) para evitar pausas del recolector de basura durante el combate.
- **Perfiles Gráficos y Autocalibración (`⚡ ACOMODAR A MI PC`):**
  - El motor inspecciona el renderizador WebGL (`WEBGL_debug_renderer_info`), núcleos de CPU y memoria para seleccionar automáticamente entre los perfiles **Bajo**, **Medio**, **Alto** y **Ultra**, ajustando DPR, resolución de sombras (`shadowMapSize`), partículas climáticas y post-procesado.

---

## 📦 18. Inventario Completo de Modelos 3D y Licencias CC0

Todos los modelos 3D están almacenados localmente en el repositorio en formato binario `.glb` optimizado para WebGL bajo licencia **CC0 1.0 Universal (Dominio Público)**:

| Categoría | Archivo Local | Clave en `MODEL_PATHS` | Uso en el Videojuego | Licencia / Autor |
|---|---|---|---|---|
| **Naves** | `public/assets/models/ships/player_ship.glb` | `PLAYER_SHIP` | Nave del jugador *Vanguard MK-IV* en el Hangar 3D | CC0 1.0 (Quaternius) |
| **Naves** | `public/assets/models/ships/fighter_interceptor.glb` | `FIGHTER_INTERCEPTOR` | Caza hostil de flanqueo orbital (`FLANKER`) | CC0 1.0 (Quaternius) |
| **Enemigos** | `public/assets/models/enemies/drone_scout.glb` | `DRONE_SCOUT` | Drones `SCOUT`, `SWARMER`, `KAMIKAZE`, `HEALER` y Drones Aliados | CC0 1.0 (Quaternius) |
| **Enemigos** | `public/assets/models/enemies/drone_gunner.glb` | `DRONE_GUNNER` | Drones artillados `STRIKER` y comandantes `TACTICIAN` | CC0 1.0 (Quaternius) |
| **Enemigos** | `public/assets/models/enemies/robot_walker.glb` | `ROBOT_WALKER` | Unidades de precisión `SNIPER`, `PHANTOM_SNIPER` y Jefe Tier 4 | CC0 1.0 (Quaternius) |
| **Enemigos** | `public/assets/models/enemies/heavy_cyborg.glb` | `HEAVY_CYBORG` | Unidades pesadas `JUGGERNAUT`, `ARTILLERY` y Jefe Tier 5 | CC0 1.0 (Quaternius) |
| **Jefes** | `public/assets/models/bosses/boss_mecha_titan.glb` | `BOSS_MECHA_TITAN` | Titán Mecha Cuadrúpedo (`Centinela Alfa`, `Leviatán`, `Vórtice`, `Núcleo Omega`) | CC0 1.0 (Quaternius) |
| **Jefes** | `public/assets/models/bosses/boss_behemoth.glb` | `BOSS_BEHEMOTH` | Coloso Acorazado (`Titán Aegis`, `Hidra Fase-Escudo`) | CC0 1.0 (Quaternius) |
| **Armas 3D** | `public/assets/models/weapons/rifle_plasma.glb` | `WEAPON_RIFLE_PLASMA` | Viewmodel 3D en primera persona del Rifle de Plasma `[1]` | CC0 1.0 (Quaternius) |
| **Armas 3D** | `public/assets/models/weapons/launcher_heavy.glb` | `WEAPON_LAUNCHER_HEAVY` | Viewmodel 3D en primera persona de Escopeta Flak `[2]` y Micro-Misiles `[4]` | CC0 1.0 (Quaternius) |
| **Armas 3D** | `public/assets/models/weapons/sniper_railgun.glb` | `WEAPON_SNIPER_RAILGUN` | Viewmodel 3D en primera persona de Railgun Pesado `[3]` y Rayo Criogénico `[5]` | CC0 1.0 (Quaternius) |
| **Hangar 3D** | `public/assets/models/environments/hangar_wall.glb` | `HANGAR_WALL` | Muros perimetrales blindados del Hangar y Búnker (Niveles 1–10 y Orbital) | CC0 1.0 (Quaternius) |
| **Hangar 3D** | `public/assets/models/environments/hangar_door.glb` | `HANGAR_DOOR` | Compuerta blindada principal del Hangar | CC0 1.0 (Quaternius) |
| **Hangar 3D** | `public/assets/models/environments/hangar_column.glb` | `HANGAR_COLUMN` | Columnas y vigas estructurales gantry del Hangar | CC0 1.0 (Quaternius) |
| **Hangar 3D** | `public/assets/models/environments/hangar_floor.glb` | `HANGAR_FLOOR` | Placas modulares de suelo industrial | CC0 1.0 (Quaternius) |
| **Hangar 3D** | `public/assets/models/environments/hangar_stairs.glb` | `HANGAR_STAIRS` | Escaleras industriales de acceso | CC0 1.0 (Quaternius) |
| **Props / Objetos** | `public/assets/models/props/power_generator.glb` | `POWER_GENERATOR` | Reactores del Hangar y Generadores Orbitales de Escudo de los Jefes | CC0 1.0 (Quaternius) |
| **Props / Objetos** | `public/assets/models/props/turret_defense.glb` | `TURRET_DEFENSE` | Torretas defensivas perimetrales del Hangar | CC0 1.0 (Quaternius) |
| **Props / Objetos** | `public/assets/models/props/scifi_crate.glb` | `SCIFI_CRATE` | Cajas de suministros destructibles y contenedores de cobertura | CC0 1.0 (Quaternius) |
| **Props / Objetos** | `public/assets/models/props/scifi_capsule.glb` | `SCIFI_CAPSULE` | Cápsulas energéticas de contención | CC0 1.0 (Quaternius) |
| **Pickups** | `public/assets/models/pickups/lootbox.glb` | `PICKUP_LOOTBOX` | Cofres de recompensa táctica | CC0 1.0 (Quaternius) |
| **Pickups** | `public/assets/models/pickups/pickup_shield.glb` | `PICKUP_SHIELD` | Módulos de recarga de escudo | CC0 1.0 (Quaternius) |
| **Pickups** | `public/assets/models/pickups/pickup_core.glb` | `PICKUP_CORE` | Núcleos cuánticos de nanitas | CC0 1.0 (Quaternius) |
| **Biomas Extra** | `public/models/props/*.glb` | `ROCKET_*`, `TREE_*`, `CRYSTAL_*`, `SATELLITE_*` | Cohetes espaciales, vegetación terrestre, cristales, radares y meteoritos | CC0 1.0 (Kenney / Quaternius) |

Consulta el detalle de atribución en [public/assets/models/ATTRIBUTION.md](public/assets/models/ATTRIBUTION.md) y [public/audio/ATTRIBUTION.md](public/audio/ATTRIBUTION.md).

---

## 📂 19. Estructura del Proyecto

```text
Galactic-PTZ-Shooter/
├── public/
│   ├── assets/
│   │   └── models/
│   │       ├── bosses/         # boss_mecha_titan.glb, boss_behemoth.glb
│   │       ├── enemies/        # drone_scout.glb, drone_gunner.glb, robot_walker.glb, heavy_cyborg.glb
│   │       ├── environments/   # hangar_wall.glb, hangar_door.glb, hangar_column.glb, hangar_floor.glb
│   │       ├── pickups/        # lootbox.glb, pickup_core.glb, pickup_shield.glb
│   │       ├── props/          # power_generator.glb, scifi_crate.glb, scifi_capsule.glb, turret_defense.glb
│   │       ├── ships/          # player_ship.glb, fighter_interceptor.glb
│   │       ├── weapons/        # rifle_plasma.glb, launcher_heavy.glb, sniper_railgun.glb
│   │       └── ATTRIBUTION.md  # Registro de licencias CC0 de recursos 3D
│   ├── models/                 # Modelos complementarios de biomas (cohetes, árboles, cristales, satélites)
│   └── audio/                  # 14 pistas OGG de música adaptativa y ATTRIBUTION.md
├── src/
│   ├── components/
│   │   ├── HUD/
│   │   │   ├── MainMenu.tsx        # Menú principal con selección de modo, nivel y acceso al Hangar
│   │   │   ├── ArmoryModal.tsx     # Hangar Central 3D, taller de mejoras, skins y hoja de servicio
│   │   │   ├── ShipTurntable.tsx   # Visor 3D en tiempo real de la nave Vanguard MK-IV
│   │   │   ├── PowerSelectModal.tsx# Selector roguelite de 3 cartas de poder entre rondas
│   │   │   ├── BossIntroModal.tsx  # Cinemática de alerta de jefe entrante
│   │   │   ├── BossHealthBar.tsx   # Barra de vida, blindaje y generadores restantes del Titán
│   │   │   ├── TouchControls.tsx   # Doble joystick virtual y botones táctiles para móviles
│   │   │   └── SettingsModal.tsx   # Centro de configuración (Gráficos, Audio, Controles, Calibrador)
│   │   └── Scene3D/
│   │       ├── PTZCamera.tsx       # Cámara en primera persona con Pan-Tilt-Zoom y anclaje del arma
│   │       ├── WeaponViewmodel.tsx # Montaje de modelos 3D de las 5 armas, retroceso y recarga
│   │       ├── Environment.tsx     # Renderizado de los 5 capítulos, Hangar 3D, luces y obstáculos
│   │       ├── Targets.tsx         # IA de los 11 enemigos, los 8 jefes, generadores y cajas
│   │       ├── EnemyVisuals.tsx    # Modelos 3D de drones, caminantes, cyborgs y titanes
│   │       ├── AllyDrones.tsx      # Escuadrón de drones aliados 3D con disparo autónomo
│   │       ├── Projectiles.tsx     #Física balística, colisiones, trazadoras, rebotes y explosiones
│   │       └── SpaceBackdrop.tsx   # Cúpula estelar y nebulosas procedurales
│   ├── game/
│   │   ├── gameState.ts            # Store global Zustand (rondas, armas, habilidades, guardado)
│   │   ├── sceneState.ts           # Estado espacial de alta frecuencia para el bucle WebGL
│   │   ├── modelLoader.ts          # Caché y clonación optimizada de modelos GLB
│   │   ├── mapGenerator.ts         # Generador procedural de los 50 niveles y 22 temas visuales
│   │   ├── powers.ts               # Definición de los 19 poderes tácticos acumulables
│   │   ├── armory.ts               # Catálogo de mejoras permanentes y skins del Hangar
│   │   ├── pilotStats.ts           # Persistencia de estadísticas y rango militar del piloto
│   │   ├── AudioSystem.ts          # Sintetizador Web Audio API y reproductor musical
│   │   └── tacticalVoice.ts        # Locución táctica de cabina con SpeechSynthesis
│   ├── hooks/                      # Hooks de teclado, ratón, mando Xbox y diseño adaptable
│   └── types/
│       └── game.ts                 # Tipos e interfaces TypeScript de todo el juego
├── tests/
│   └── e2e/                        # Suite de pruebas automatizadas End-to-End con Playwright Core
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🛠️ 20. Requisitos, Instalación y Ejecución Local

### Requisitos Previos
- **Node.js:** Versión `20.19+` o `22.12+` recomendada.
- **Gestor de Paquetes:** `npm` v10+.

### Pasos de Instalación

```bash
# 1. Clonar el repositorio oficial
git clone https://github.com/Sttive17/Galactic-PTZ-Shooter.git
cd Galactic-PTZ-Shooter

# 2. Instalar todas las dependencias
npm install

# 3. Iniciar el servidor de desarrollo con recarga en vivo (HMR)
npm run dev
```

Abre en tu navegador la dirección local indicada en consola (por defecto `http://localhost:5173/`).

### Compilación para Producción

```bash
# Verifica tipos con TypeScript (tsc -b) y genera el bundle optimizado en dist/
npm run build

# Sirve localmente la compilación de producción para probarla antes de desplegar
npm run preview
```

---

## 🧪 21. Pruebas Automatizadas E2E (Playwright Core)

El proyecto cuenta con una suite de pruebas End-to-End reales en navegador Chromium con aceleración WebGL y verificación de WebAudio:

| Comando | Descripción |
|---|---|
| `npm run test:e2e -- --tier smoke` | Ejecuta las pruebas críticas de arranque, renderizado de píxeles no negros en el lienzo WebGL, desbloqueo de WebAudio por gesto real y autocalibración gráfica. |
| `npm run test:e2e` | Ejecuta la suite completa de pruebas E2E (`smoke`, `layout`, `gameplay`, `progression`, `audio`). |
| `npm run lint` | Ejecuta el analizador estático ultrarrápido **Oxlint** sobre todo el código fuente. |

---

## 🗺️ 22. Hoja de Ruta (Roadmap)

- [x] **Fase 1:** Auditoría integral de arquitectura, componentes React, sistemas Three.js y estado.
- [x] **Fase 2:** Integración local de catálogo de modelos 3D GLB con licencias CC0 verificadas.
- [x] **Fase 3:** Montaje de armas 3D reales en primera persona (`WeaponViewmodel`) con 5 arquetipos y habilidades activas (`EMP` y `Frenesí`).
- [x] **Fase 4:** Hangar Central 3D interactivo (`ShipTurntable`), mejoras permanentes, skins y hoja de servicio militar.
- [x] **Fase 5:** Activación del Hangar 3D modular desde el Nivel 1 (`LAB_BUNKER` y `ORBITAL_HANGAR`) y cajas de suministros 3D destructibles.
- [x] **Fase 6:** Escuadrón de drones aliados 3D con seguimiento orbital y disparo asistido.
- [x] **Fase 7:** Escalado real de los 11 arquetipos de enemigos y los 8 jefes titanes en el espacio aéreo.
- [x] **Fase 8:** Motor de audio híbrido (Web Audio API procedural + 14 pistas OGG + voz táctica sintetizada).
- [x] **Fase 9:** Optimización WebGL Zero-GC, caché de modelos GLB y autocalibrador de hardware.
- [x] **Fase 10:** Verificación de compilación limpia TypeScript y suite E2E Playwright.
- [x] **Fase 11:** Documentación técnica y contextual exhaustiva en `README.md`.
- [ ] **Fase 12:** Tablas de clasificación globales en línea y modo cooperativo orbital (futuro).

---

**Desarrollado con dedicación para ofrecer una experiencia shooter espacial 3D completa, táctica y de alto rendimiento directamente en el navegador.**
